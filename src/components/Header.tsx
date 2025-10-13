import React from 'react';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

interface HeaderProps {
  onLiveDataClick?: () => void;
  onAnalyticsClick?: () => void;
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

const Header: React.FC<HeaderProps> = ({ onLiveDataClick, onAnalyticsClick }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <FlowLogo className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">Flow</h1>
              <p className="text-xs text-slate-400">Your guide to Penetrating Markets</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLiveDataClick}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Live Market Data</span>
            </button>
            <button 
              onClick={onAnalyticsClick}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm">Analytics Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;