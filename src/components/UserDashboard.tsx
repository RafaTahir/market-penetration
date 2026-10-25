import React, { useState, useEffect } from 'react';
import { User, BookmarkIcon, Search, Bell, TrendingUp, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { supabase } from '../services/supabaseClient';

interface SavedSearch {
  id: string;
  name: string;
  countries: string[] | null;
  industries: string[] | null;
  is_favorite: boolean | null;
}

interface ActiveAlert {
  id: string;
}

interface UserPreferences {
  default_countries: string[] | null;
}

const UserDashboard: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { bookmarks, loading: bookmarksLoading, error: bookmarksError } = useBookmarks(user?.id || null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;
  const profileName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';

  useEffect(() => {
    setFullName(profileName);
    setIsEditing(false);
  }, [userId, profileName]);

  useEffect(() => {
    let active = true;
    setSavedSearches([]);
    setAlerts([]);
    setPreferences(null);
    setError(null);
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [searchesRes, alertsRes, prefsRes] = await Promise.all([
          supabase.from('saved_searches').select('id,name,countries,industries,is_favorite')
            .eq('user_id', userId).order('created_at', { ascending: false }).returns<SavedSearch[]>(),
          supabase.from('market_alerts').select('id')
            .eq('user_id', userId).eq('is_active', true).returns<ActiveAlert[]>(),
          supabase.from('user_preferences').select('default_countries')
            .eq('user_id', userId).maybeSingle<UserPreferences>()
        ]);

        const queryError = searchesRes.error ?? alertsRes.error ?? prefsRes.error;
        if (queryError) throw queryError;
        if (active) {
          setSavedSearches(searchesRes.data ?? []);
          setAlerts(alertsRes.data ?? []);
          setPreferences(prefsRes.data);
        }
      } catch (cause) {
        if (active) {
          console.error('Error loading user data:', cause);
          setError('Your saved data is unavailable. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchUserData();
    return () => { active = false; };
  }, [userId]);

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile({ full_name: fullName });
    if (!error) {
      setIsEditing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profileName);
                    }}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-white">
                    {profileName || 'User'}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BookmarkIcon className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-slate-400">Bookmarks</span>
            </div>
            <div className="text-2xl font-bold text-white">{bookmarksLoading ? 'Loading…' : bookmarksError ? 'Unavailable' : bookmarks.length}</div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Saved Searches</span>
            </div>
            <div className="text-2xl font-bold text-white">{loading ? 'Loading…' : error ? 'Unavailable' : savedSearches.length}</div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-slate-400">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-white">{loading ? 'Loading…' : error ? 'Unavailable' : alerts.length}</div>
          </div>

          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-slate-400">Markets Tracked</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {loading ? 'Loading…' : error ? 'Unavailable' : preferences?.default_countries?.length ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <BookmarkIcon className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Recent Bookmarks</h3>
          </div>
          {bookmarksLoading ? (
            <p className="text-slate-400 text-sm">Loading bookmarks…</p>
          ) : bookmarksError ? (
            <p className="text-slate-400 text-sm">Bookmarks are unavailable.</p>
          ) : bookmarks.length === 0 ? (
            <p className="text-slate-400 text-sm">No bookmarks yet</p>
          ) : (
            <div className="space-y-2">
              {bookmarks.slice(0, 5).map((bookmark) => (
                <div key={bookmark.id} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{bookmark.item_type}</div>
                      <div className="text-xs text-slate-400">{bookmark.item_id}</div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Saved Searches</h3>
          </div>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading saved searches…</p>
          ) : error ? (
            <p className="text-slate-400 text-sm">Saved searches are unavailable.</p>
          ) : savedSearches.length === 0 ? (
            <p className="text-slate-400 text-sm">No saved searches yet</p>
          ) : (
            <div className="space-y-2">
              {savedSearches.slice(0, 5).map((search) => (
                <div key={search.id} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{search.name}</div>
                      <div className="text-xs text-slate-400">
                        {search.countries?.length || 0} countries • {search.industries?.length || 0} industries
                      </div>
                    </div>
                    {search.is_favorite && (
                      <div className="text-yellow-400">★</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
