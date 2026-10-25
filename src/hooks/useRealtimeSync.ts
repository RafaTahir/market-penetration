import { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase, type MarketStockRow } from '../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionScope {
  table: string;
  userId: string | null;
  active: boolean;
}

function getRowId(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('id' in value)) return null;
  return typeof value.id === 'string' ? value.id : null;
}

function isMarketStockRow(value: unknown): value is MarketStockRow & { id: string } {
  if (!value || typeof value !== 'object' || !getRowId(value)) return false;
  const row = value as Record<string, unknown>;
  const textFields = ['symbol', 'name', 'exchange', 'country', 'timestamp'];
  const numericFields = ['price', 'change', 'change_percent', 'volume'];
  const provenanceFields = ['data_source', 'observed_at', 'retrieved_at', 'created_at'];
  return textFields.every(field => typeof row[field] === 'string') &&
    numericFields.every(field => typeof row[field] === 'number' && Number.isFinite(row[field])) &&
    (row.market_cap === undefined || (typeof row.market_cap === 'number' && Number.isFinite(row.market_cap))) &&
    provenanceFields.every(field => row[field] === undefined || typeof row[field] === 'string');
}

export const useRealtimeSync = <T extends { id: string }>(
  table: string,
  userId: string | null,
  initialData: T[] = [],
  isRow?: (value: unknown) => value is T
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const scopeRef = useRef<SubscriptionScope | null>(null);
  const validatorRef = useRef(isRow);
  validatorRef.current = isRow;

  useEffect(() => {
    const previousScope = scopeRef.current;
    const scope: SubscriptionScope = { table, userId, active: true };
    scopeRef.current = scope;
    if (previousScope && (previousScope.table !== table || previousScope.userId !== userId)) setData([]);
    setChannel(null);
    if (!userId || !isSupabaseConfigured) {
      setData([]);
      return () => { scope.active = false; };
    }

    const isCurrent = () => scope.active && scopeRef.current === scope;
    const readRow = (value: unknown): T | null => {
      if (!getRowId(value)) return null;
      if (value && typeof value === 'object' && 'user_id' in value && value.user_id !== userId) return null;
      if (validatorRef.current && !validatorRef.current(value)) return null;
      return value as T;
    };
    const subscription = supabase
      .channel(`${table}_changes_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table, filter: `user_id=eq.${userId}` },
        payload => {
          if (!isCurrent()) return;
          const row = readRow(payload.new);
          if (row) setData(current => current.some(item => item.id === row.id) ? current : [...current, row]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table, filter: `user_id=eq.${userId}` },
        payload => {
          if (!isCurrent()) return;
          const row = readRow(payload.new);
          if (row) setData(current => current.map(item => item.id === row.id ? row : item));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table, filter: `user_id=eq.${userId}` },
        payload => {
          if (!isCurrent()) return;
          const id = getRowId(payload.old);
          if (id) setData(current => current.filter(item => item.id !== id));
        }
      )
      .subscribe();

    setChannel(subscription);
    return () => {
      scope.active = false;
      void subscription.unsubscribe();
    };
  }, [table, userId]);

  const isCurrentScope = scopeRef.current?.table === table && scopeRef.current.userId === userId;
  return {
    data: isCurrentScope && userId && isSupabaseConfigured ? data : [],
    setData,
    channel: isCurrentScope && userId && isSupabaseConfigured ? channel : null
  };
};

export const useMarketDataSync = (userId: string | null = null) => {
  const [marketData, setMarketData] = useState<MarketStockRow[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const scopeRef = useRef<SubscriptionScope | null>(null);

  useEffect(() => {
    const scope: SubscriptionScope = { table: 'market_stocks', userId, active: true };
    scopeRef.current = scope;
    setMarketData([]);
    setChannel(null);
    if (!userId || !isSupabaseConfigured) return () => { scope.active = false; };

    const subscription = supabase
      .channel(`market_stocks_realtime_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_stocks' },
        payload => {
          if (!scope.active || scopeRef.current !== scope) return;
          if (payload.eventType === 'DELETE') {
            const id = getRowId(payload.old);
            if (id) setMarketData(current => current.filter(item => item.id !== id));
          } else if (isMarketStockRow(payload.new)) {
            const row = payload.new;
            setMarketData(current => {
              const exists = current.some(item => item.id === row.id);
              return exists ? current.map(item => item.id === row.id ? row : item) : [...current, row];
            });
          }
        }
      )
      .subscribe();

    setChannel(subscription);
    return () => {
      scope.active = false;
      void subscription.unsubscribe();
    };
  }, [userId]);

  const isCurrentUser = scopeRef.current?.userId === userId;
  return {
    marketData: isCurrentUser && userId && isSupabaseConfigured ? marketData : [],
    setMarketData,
    channel: isCurrentUser && userId && isSupabaseConfigured ? channel : null
  };
};
