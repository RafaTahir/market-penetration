import React, { useState } from 'react';
import { TrendingUp, Activity, Moon, Sun, Search, ArrowLeftRight, LogIn, Building2 } from 'lucide-react';
import NotificationCenter, { Notification } from './NotificationCenter';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  referenceMode?: boolean;
  onExitReference?: () => void;
  onLiveDataClick?: () => void;
  onAnalyticsClick?: () => void;
  onSearchClick?: () => void;
  onComparisonClick?: () => void;
  onLogoClick?: () => void;
  onEnterpriseIntelligenceClick?: () => void;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onDismissNotification?: (id: string) => void;
}

const FlowLogo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#flowGradient)" opacity="0.1" />
    <path d="M25 35 Q50 15 75 35 Q50 55 25 35" fill="url(#flowGradient)" opacity="0.8" />
    <path d="M25 50 Q50 30 75 50 Q50 70 25 50" fill="url(#flowGradient)" opacity="0.6" />
    <path d="M25 65 Q50 45 75 65 Q50 85 25 65" fill="url(#flowGradient)" opacity="0.4" />
    <circle cx="25" cy="50" r="3" fill="#3B82F6" />
    <circle cx="75" cy="50" r="3" fill="#8B5CF6" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({
  referenceMode = false,
  onExitReference,
  onLiveDataClick,
  onAnalyticsClick,
  onSearchClick,
  onComparisonClick,
  onLogoClick,
  onEnterpriseIntelligenceClick,
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onClearAllNotifications = () => {},
  onDismissNotification = () => {}
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
    <header className="bg-slate-900 border-b border-slate-700 flow-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 min-h-16">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            title="Back to Home"
          >
            <FlowLogo className="h-10 w-10" />
            <div className="text-left">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">Flow</h1>
              <p className="text-xs text-slate-400">Southeast Asia market entry</p>
            </div>
          </button>
          <div className="flex flex-wrap items-center gap-1 flow-header-actions">
            <a href="#/plan" className="px-3 py-2 text-xs font-medium text-blue-300 hover:text-white rounded-lg border border-slate-700">Entry planner</a>
            <a href="#/research" className="px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg">Research library</a>
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                title="Search (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm hidden lg:inline">Search</span>
              </button>
            )}
            {onComparisonClick && (
              <button
                onClick={onComparisonClick}
                className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                title="Comparison (Ctrl+C)"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="text-sm hidden lg:inline">Compare</span>
              </button>
            )}
            <button
              onClick={onLiveDataClick}
              aria-label="Market Data"
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm hidden md:inline">Market Data</span>
            </button>
            <button
              onClick={onAnalyticsClick}
              aria-label="Analytics"
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm hidden md:inline">Analytics</span>
            </button>
            {onEnterpriseIntelligenceClick && (
              <button
                onClick={onEnterpriseIntelligenceClick}
                aria-label="Enterprise Intelligence"
                className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                title="Enterprise Intelligence (Ctrl+E)"
              >
                <Building2 className="h-4 w-4" />
                <span className="text-sm hidden lg:inline">Intelligence</span>
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onClearAll={onClearAllNotifications}
              onDismiss={onDismissNotification}
            />
            {user ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-white hidden md:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                aria-label="Sign in"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {window.location.hash.startsWith('#/research') && <div className="border-t border-slate-700/50 px-4 py-2 text-center text-xs text-slate-400">{referenceMode ? <><strong className="text-amber-300">Unverified reference examples enabled.</strong> Static examples and unverified records are not current market facts. <button onClick={onExitReference} className="underline text-amber-300 mx-2">Hide examples</button></> : <>Research library · Sources are not independently verified; missing data remains unavailable. </>} <a href="#/plan" className="text-blue-400 underline">Build a sourced assessment</a></div>}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;