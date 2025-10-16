import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeSync = <T extends { id: string }>(
  table: string,
  userId: string | null,
  initialData: T[] = []
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setData((current) => [...current, payload.new as T]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setData((current) =>
            current.map((item) =>
              item.id === (payload.new as T).id ? (payload.new as T) : item
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setData((current) =>
            current.filter((item) => item.id !== (payload.old as T).id)
          );
        }
      )
      .subscribe();

    setChannel(subscription);

    return () => {
      subscription.unsubscribe();
    };
  }, [table, userId]);

  return { data, setData, channel };
};

export const useMarketDataSync = () => {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const subscription = supabase
      .channel('market_stocks_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_stocks'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMarketData((current) => [...current, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setMarketData((current) =>
              current.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
        }
      )
      .subscribe();

    setChannel(subscription);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { marketData, setMarketData, channel };
};
