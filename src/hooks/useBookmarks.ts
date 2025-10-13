import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Bookmark {
  id: string;
  item_type: string;
  item_id: string;
  item_data: any;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export const useBookmarks = (userId: string | null) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchBookmarks();
    }
  }, [userId]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (itemType: string, itemId: string, itemData: any, notes?: string, tags?: string[]) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
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

      if (error) throw error;
      setBookmarks(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const isBookmarked = (itemType: string, itemId: string) => {
    return bookmarks.some(b => b.item_type === itemType && b.item_id === itemId);
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refreshBookmarks: fetchBookmarks
  };
};
