import { useCallback, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface Bookmark {
  id: string;
  item_type: string;
  item_id: string;
  item_data: JsonValue;
  notes?: string | null;
  tags?: string[] | null;
  created_at: string;
}

interface BookmarkScope {
  userId: string | null;
  active: boolean;
  requestId: number;
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return typeof value === 'object' && Object.values(value).every(isJsonValue);
}

function isBookmark(value: unknown, userId: string): value is Bookmark {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return row.user_id === userId &&
    typeof row.id === 'string' && typeof row.item_type === 'string' &&
    typeof row.item_id === 'string' && typeof row.created_at === 'string' &&
    isJsonValue(row.item_data) &&
    (row.notes == null || typeof row.notes === 'string') &&
    (row.tags == null || (Array.isArray(row.tags) && row.tags.every(tag => typeof tag === 'string')));
}

function asError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return new Error(error.message);
  }
  return new Error('Bookmarks are unavailable. Please try again.');
}

export const useBookmarks = (userId: string | null) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(Boolean(userId && isSupabaseConfigured));
  const [error, setError] = useState<Error | null>(null);
  const scopeRef = useRef<BookmarkScope | null>(null);

  const fetchBookmarks = useCallback(async () => {
    const scope = scopeRef.current;
    if (!userId || !isSupabaseConfigured || !scope?.active || scope.userId !== userId) return;
    const requestId = ++scope.requestId;
    const isCurrentRequest = () => scope.active && scopeRef.current === scope && scope.requestId === requestId;
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!isCurrentRequest()) return;
      if (queryError) throw queryError;
      const rows: unknown = data;
      if (!Array.isArray(rows) || !rows.every(row => isBookmark(row, userId))) {
        throw new Error('Bookmarks returned an invalid response. Please try again.');
      }
      setBookmarks(rows);
    } catch (caught: unknown) {
      if (!isCurrentRequest()) return;
      setError(asError(caught));
      console.error('Error fetching bookmarks:', caught);
    } finally {
      if (isCurrentRequest()) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const scope: BookmarkScope = { userId, active: true, requestId: 0 };
    scopeRef.current = scope;
    setBookmarks([]);
    setError(null);
    setLoading(Boolean(userId && isSupabaseConfigured));
    if (userId && isSupabaseConfigured) void fetchBookmarks();
    return () => { scope.active = false; };
  }, [userId, fetchBookmarks]);

  const addBookmark = async (itemType: string, itemId: string, itemData: JsonValue, notes?: string, tags?: string[]) => {
    const scope = scopeRef.current;
    if (!userId || !isSupabaseConfigured || !scope?.active || scope.userId !== userId) return;

    try {
      const { data, error: queryError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
          item_data: itemData,
          notes,
          tags
        })
        .select()
        .single();

      if (!scope.active || scopeRef.current !== scope) return null;
      if (queryError) throw queryError;
      const bookmark: unknown = data;
      if (!isBookmark(bookmark, userId)) throw new Error('The saved bookmark returned an invalid response.');
      setBookmarks(prev => [bookmark, ...prev.filter(item => item.id !== bookmark.id)]);
      // A fresh snapshot supersedes reads started before this mutation.
      void fetchBookmarks();
      return bookmark;
    } catch (caught: unknown) {
      if (!scope.active || scopeRef.current !== scope) return null;
      setError(asError(caught));
      console.error('Error adding bookmark:', caught);
      return null;
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    const scope = scopeRef.current;
    if (!userId || !isSupabaseConfigured || !scope?.active || scope.userId !== userId) return;

    try {
      const { error: queryError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (!scope.active || scopeRef.current !== scope) return;
      if (queryError) throw queryError;
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
      void fetchBookmarks();
    } catch (caught: unknown) {
      if (!scope.active || scopeRef.current !== scope) return;
      setError(asError(caught));
      console.error('Error removing bookmark:', caught);
    }
  };

  const isCurrentUser = scopeRef.current?.userId === userId;
  const currentBookmarks = isCurrentUser ? bookmarks : [];
  const isBookmarked = (itemType: string, itemId: string) => {
    return currentBookmarks.some(bookmark => bookmark.item_type === itemType && bookmark.item_id === itemId);
  };

  return {
    bookmarks: currentBookmarks,
    loading: isCurrentUser ? loading : Boolean(userId && isSupabaseConfigured),
    error: isCurrentUser ? error : null,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refreshBookmarks: fetchBookmarks
  };
};
