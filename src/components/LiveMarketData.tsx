import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { marketDataService } from '../services/marketData';
import type { Stock } from '../types';

interface LiveMarketDataProps {
  selectedCountries: string[];
}

export default function LiveMarketData({ selectedCountries }: LiveMarketDataProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();

    const subscription = marketDataService.subscribeToStocks((updatedStock) => {
      setStocks(prev => prev.map(s => s.id === updatedStock.id ? updatedStock : s));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedCountries]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await marketDataService.getAllStocks();
      const filtered = selectedCountries.length > 0
        ? data.filter(s => selectedCountries.includes(s.country.toLowerCase()))
        : data;
      setStocks(filtered.slice(0, 10));
    } catch (error) {
      console.error('Failed to load stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
        <span>Live Market Data</span>
        <span className="ml-auto text-xs text-slate-400">{stocks.length} stocks</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Symbol</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Name</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Exchange</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Price</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Change</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-slate-600/30 transition-colors">
                <td className="py-2 px-3 text-sm font-medium text-white">{stock.symbol}</td>
                <td className="py-2 px-3 text-sm text-slate-300">{stock.name}</td>
                <td className="py-2 px-3 text-sm text-slate-400">{stock.exchange}</td>
                <td className="py-2 px-3 text-sm text-slate-300 text-right">
                  ${Number(stock.price).toFixed(2)}
                </td>
                <td className="py-2 px-3 text-sm text-right">
                  <span className={`flex items-center justify-end space-x-1 ${
                    stock.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stock.change_percent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{stock.change_percent >= 0 ? '+' : ''}{Number(stock.change_percent).toFixed(2)}%</span>
                  </span>
                </td>
                <td className="py-2 px-3 text-sm text-slate-400 text-right">
                  {Number(stock.volume).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stocks.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No stock data available for selected markets</p>
          </div>
        )}
      </div>
    </div>
  );
}
