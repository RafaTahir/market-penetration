import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';
import { marketDataService } from '../services/marketData';
import type { Stock } from '../types';

interface AnalyticsDashboardProps {
  selectedCountries: string[];
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function AnalyticsDashboard({ selectedCountries }: AnalyticsDashboardProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCountries]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await marketDataService.getAllStocks();
      const filtered = selectedCountries.length > 0
        ? data.filter(s => selectedCountries.includes(s.country.toLowerCase()))
        : data;
      setStocks(filtered);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const marketCapByCountry = selectedCountries.map(countryId => {
    const countryStocks = stocks.filter(s => s.country.toLowerCase() === countryId);
    const totalMarketCap = countryStocks.reduce((sum, s) => sum + (Number(s.market_cap) || 0), 0);
    return {
      name: countryId.charAt(0).toUpperCase() + countryId.slice(1),
      value: totalMarketCap / 1e9
    };
  });

  const topPerformers = [...stocks]
    .sort((a, b) => Number(b.change_percent) - Number(a.change_percent))
    .slice(0, 6)
    .map(s => ({
      name: s.symbol,
      performance: Number(s.change_percent)
    }));

  const volumeData = [...stocks]
    .sort((a, b) => Number(b.volume) - Number(a.volume))
    .slice(0, 8)
    .map(s => ({
      name: s.symbol,
      volume: Number(s.volume) / 1e6
    }));

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-blue-400" />
            <span>Market Cap Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={marketCapByCountry}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {marketCapByCountry.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}B`, 'Market Cap']}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span>Top Performers</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPerformers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Change']}
              />
              <Bar dataKey="performance" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <LineChart className="h-5 w-5 text-purple-400" />
          <span>Trading Volume (Top 8)</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReLineChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" label={{ value: 'Million', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(value: number) => [`${value.toFixed(2)}M`, 'Volume']}
            />
            <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={2} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <span>Market Summary</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="text-sm text-blue-400 mb-2">Total Stocks</div>
            <div className="text-2xl font-bold text-white">{stocks.length}</div>
            <div className="text-xs text-slate-400">Across selected markets</div>
          </div>
          <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
            <div className="text-sm text-emerald-400 mb-2">Avg Change</div>
            <div className="text-2xl font-bold text-white">
              {stocks.length > 0 ? (stocks.reduce((sum, s) => sum + Number(s.change_percent), 0) / stocks.length).toFixed(2) : '0'}%
            </div>
            <div className="text-xs text-slate-400">Average performance</div>
          </div>
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="text-sm text-purple-400 mb-2">Total Volume</div>
            <div className="text-2xl font-bold text-white">
              {(stocks.reduce((sum, s) => sum + Number(s.volume), 0) / 1e9).toFixed(2)}B
            </div>
            <div className="text-xs text-slate-400">Trading volume</div>
          </div>
          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
            <div className="text-sm text-orange-400 mb-2">Total Market Cap</div>
            <div className="text-2xl font-bold text-white">
              ${(stocks.reduce((sum, s) => sum + (Number(s.market_cap) || 0), 0) / 1e12).toFixed(2)}T
            </div>
            <div className="text-xs text-slate-400">Combined value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
