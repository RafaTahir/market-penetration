import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketStatus, MarketHoursService } from '../services/marketHoursService';
import { MarketData } from '../services/marketDataService';

interface MarketClockProps {
  status: MarketStatus;
  marketData?: MarketData;
}

const MarketClock: React.FC<MarketClockProps> = ({ status, marketData }) => {
  const [timeRemaining, setTimeRemaining] = useState(status.timeUntilChange);
  const marketHoursService = MarketHoursService.getInstance();

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedStatus = marketHoursService.getMarketStatus(status.exchange);
      setTimeRemaining(updatedStatus.timeUntilChange);
    }, 30000);

    return () => clearInterval(interval);
  }, [status.exchange, marketHoursService]);

  const formattedTime = marketHoursService.formatTimeRemaining(timeRemaining);
  const progressPercent = status.isOpen ? calculateProgressPercent(status) : 0;

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const CircularProgress = ({ percent, isOpen }: { percent: number; isOpen: boolean }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-700"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={isOpen ? 'text-emerald-400' : 'text-slate-500'}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
    );
  };

  return (
    <div className={`rounded-lg p-4 border transition-all ${
      status.isOpen
        ? 'bg-emerald-900/20 border-emerald-700/50'
        : 'bg-slate-700/30 border-slate-600/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <CircularProgress percent={progressPercent} isOpen={status.isOpen} />
          <div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}></div>
              <span className="text-sm font-medium text-white">{status.country}</span>
            </div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded mt-1 inline-block ${
              status.isOpen
                ? 'bg-emerald-400/20 text-emerald-400'
                : 'bg-slate-600/50 text-slate-400'
            }`}>
              {status.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <Clock className="h-4 w-4 text-slate-400" />
        <span className="text-xs text-slate-400">{status.exchange}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {status.isOpen ? 'Closes in' : status.nextEvent + ' in'}
          </span>
          <span className="text-sm font-bold text-white">{formattedTime}</span>
        </div>

        {status.isOpen && (
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Local: {status.localTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}
      </div>

      {marketData && (
        <div className="mt-3 pt-3 border-t border-slate-600/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">{marketData.symbol}</span>
            <div className={`flex items-center space-x-1 ${
              marketData.change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {marketData.change >= 0 ?
                <TrendingUp className="h-3 w-3" /> :
                <TrendingDown className="h-3 w-3" />
              }
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-white">
              {formatNumber(marketData.price)}
            </div>
            <div className={`text-sm font-medium ${
              marketData.change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {marketData.change >= 0 ? '+' : ''}{formatNumber(marketData.change)}
              ({marketData.change >= 0 ? '+' : ''}{formatNumber(marketData.changePercent)}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function calculateProgressPercent(status: MarketStatus): number {
  const marketHoursService = MarketHoursService.getInstance();
  const hoursInfo = marketHoursService.getMarketHoursInfo(status.exchange);

  if (!hoursInfo) return 0;

  const [openHour, openMinute] = hoursInfo.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = hoursInfo.closeTime.split(':').map(Number);

  const openTimeMinutes = openHour * 60 + openMinute;
  const closeTimeMinutes = closeHour * 60 + closeMinute;
  const totalMarketMinutes = closeTimeMinutes - openTimeMinutes;

  const localTime = status.localTime;
  const currentMinutes = localTime.getHours() * 60 + localTime.getMinutes();
  const elapsedMinutes = currentMinutes - openTimeMinutes;

  const percent = Math.max(0, Math.min(100, (elapsedMinutes / totalMarketMinutes) * 100));
  return percent;
}

export default MarketClock;
