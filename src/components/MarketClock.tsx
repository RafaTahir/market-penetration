import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketStatus, MarketHoursService } from '../services/marketHoursService';

interface MarketClockProps {
  status: MarketStatus;
}

const MarketClock: React.FC<MarketClockProps> = ({ status }) => {
  const [timeRemaining, setTimeRemaining] = useState(status.timeUntilChange);
  const marketHoursService = MarketHoursService.getInstance();

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedStatus = marketHoursService.getMarketStatus(status.exchange);
      setTimeRemaining(updatedStatus.timeUntilChange);
    }, 1000);

    return () => clearInterval(interval);
  }, [status.exchange, marketHoursService]);

  const formattedTime = marketHoursService.formatTimeRemaining(timeRemaining);
  const progressPercent = status.isOpen ? calculateProgressPercent(status) : 0;

  return (
    <div className={`rounded-lg p-4 border transition-all ${
      status.isOpen
        ? 'bg-emerald-900/20 border-emerald-700/50'
        : 'bg-slate-700/30 border-slate-600/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
          }`}></div>
          <span className="text-sm font-medium text-white">{status.country}</span>
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          status.isOpen
            ? 'bg-emerald-400/20 text-emerald-400'
            : 'bg-slate-600/50 text-slate-400'
        }`}>
          {status.isOpen ? 'OPEN' : 'CLOSED'}
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
