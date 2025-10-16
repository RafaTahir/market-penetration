import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Send, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  target_type: string;
  target_id: string;
  created_at: string;
  user_name: string;
}

interface CollaborationPanelProps {
  targetType: string;
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  targetType,
  targetId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchComments();
      subscribeToComments();
      updatePresence();
    }
  }, [isOpen, user, targetType, targetId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: true });

    if (data) setComments(data);
  };

  const subscribeToComments = () => {
    const subscription = supabase
      .channel(`comments_${targetType}_${targetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `target_type=eq.${targetType},target_id=eq.${targetId}`
        },
        (payload) => {
          setComments((current) => [...current, payload.new as Comment]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const updatePresence = () => {
    const channel = supabase.channel(`presence_${targetType}_${targetId}`, {
      config: {
        presence: {
          key: user?.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      await supabase.from('comments').insert({
        user_id: user.id,
        content: newComment,
        target_type: targetType,
        target_id: targetId,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
      });
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right-2">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Comments</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            <span>{activeUsers}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {comment.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{comment.user_name}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-slate-700 text-center text-sm text-slate-400">
          Sign in to comment
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;
