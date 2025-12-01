import React, { useState, useEffect } from 'react';
import { TrendingUp, Building, DollarSign, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  competitiveIntelligenceService,
  CompetitorProfile,
  CompetitorActivity,
  MarketShare,
  PricingIntelligence
} from '../services/competitiveIntelligenceService';
import { TableSkeleton, CardSkeleton } from './SkeletonLoader';

export default function CompetitiveIntelligence() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'competitors' | 'activities' | 'market-share' | 'pricing'>('competitors');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([]);
  const [activities, setActivities] = useState<CompetitorActivity[]>([]);
  const [marketShare, setMarketShare] = useState<MarketShare[]>([]);
  const [pricing, setPricing] = useState<PricingIntelligence[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const countries = ['Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Real Estate'];

  useEffect(() => {
    if (selectedCountry || selectedIndustry) {
      loadData();
    }
  }, [selectedCountry, selectedIndustry, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        country: selectedCountry || undefined,
        industry: selectedIndustry || undefined,
        limit: 20
      };

      switch (activeTab) {
        case 'competitors':
          const competitorData = await competitiveIntelligenceService.getCompetitorProfiles(filters);
          setCompetitors(competitorData);
          break;
        case 'activities':
          const activityData = await competitiveIntelligenceService.getCompetitorActivities(filters);
          setActivities(activityData);
          break;
        case 'market-share':
          const marketData = await competitiveIntelligenceService.getMarketShareData(filters);
          setMarketShare(marketData);
          break;
        case 'pricing':
          const pricingData = await competitiveIntelligenceService.getPricingIntelligence(filters);
          setPricing(pricingData);
          break;
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading competitive intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedCountry || selectedIndustry) {
      loadData();
    }
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return null;
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const tabs = [
    { id: 'competitors' as const, name: 'Competitor Profiles', icon: Building },
    { id: 'activities' as const, name: 'Recent Activities', icon: TrendingUp },
    { id: 'market-share' as const, name: 'Market Share', icon: AlertCircle },
    { id: 'pricing' as const, name: 'Pricing Intelligence', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Competitive Intelligence</h2>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated {getTimeSinceUpdate()}</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading || (!selectedCountry && !selectedIndustry)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {activeTab === 'market-share' ? (
              <TableSkeleton rows={5} />
            ) : (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
          </div>
        ) : (
          <div>
            {activeTab === 'competitors' && (
              <div className="space-y-4">
                {competitors.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No competitor data available. Select filters to view results.
                  </p>
                ) : (
                  competitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{competitor.company_name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {competitor.country} | {competitor.industry}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-500">
                            {competitor.market_share_percentage}% Market Share
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            ${(competitor.annual_revenue_usd / 1000000).toFixed(1)}M Revenue
                          </div>
                        </div>
                      </div>
                      {competitor.business_model && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {competitor.business_model}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No activity data available. Select filters to view results.
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{activity.activity_title}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                activity.impact_level === 'High'
                                  ? 'bg-red-100 text-red-700'
                                  : activity.impact_level === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {activity.impact_level} Impact
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activity.company_name} | {new Date(activity.activity_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {activity.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'market-share' && (
              <div className="space-y-4">
                {marketShare.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No market share data available. Select filters to view results.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                          <th className="px-4 py-2 text-left">Rank</th>
                          <th className="px-4 py-2 text-left">Company</th>
                          <th className="px-4 py-2 text-left">Market Share</th>
                          <th className="px-4 py-2 text-left">Revenue</th>
                          <th className="px-4 py-2 text-left">Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketShare.map((item) => (
                          <tr
                            key={item.id}
                            className={`border-b ${
                              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <td className="px-4 py-2">{item.rank}</td>
                            <td className="px-4 py-2 font-medium">{item.company_name}</td>
                            <td className="px-4 py-2">{item.market_share_percentage.toFixed(1)}%</td>
                            <td className="px-4 py-2">${(item.revenue_usd / 1000000).toFixed(1)}M</td>
                            <td className={`px-4 py-2 ${item.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {item.growth_rate >= 0 ? '+' : ''}{item.growth_rate.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-4">
                {pricing.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No pricing data available. Select filters to view results.
                  </p>
                ) : (
                  pricing.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{item.product_name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.company_name} | {item.product_category}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-500">${item.price_usd}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.pricing_model}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
