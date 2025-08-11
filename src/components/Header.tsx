import React from 'react';
import { BarChart3, Globe, TrendingUp, Activity } from 'lucide-react';

interface HeaderProps {
  onLiveDataClick?: () => void;
  onAnalyticsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLiveDataClick, onAnalyticsClick }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SEA Market Intel</h1>
              <p className="text-xs text-slate-400">Southeast Asian Market Research Platform</p>
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