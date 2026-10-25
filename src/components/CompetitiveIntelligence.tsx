import { useState, useEffect } from 'react';
import { TrendingUp, Building, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  competitiveIntelligenceService,
  CompetitorProfile,
  CompetitorActivity,
  MarketShare,
  PricingIntelligence
} from '../services/competitiveIntelligenceService';
import { TableSkeleton, CardSkeleton } from './SkeletonLoader';

const formatPercent = (value: number) => Number.isFinite(value) ? `${value.toFixed(1)}%` : 'Unavailable';
const formatRevenue = (value: number) => Number.isFinite(value) ? `$${(value / 1000000).toFixed(1)}M` : 'Unavailable';
const formatListedDate = (value: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString() : 'Unknown';

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
  const [lastQueried, setLastQueried] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const countries = ['Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Real Estate'];

  useEffect(() => {
    let cancelled = false;
    setCompetitors([]);
    setActivities([]);
    setMarketShare([]);
    setPricing([]);
    setLastQueried(null);
    setLoadError(null);
    if (!selectedCountry && !selectedIndustry) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const filters = {
        country: selectedCountry || undefined,
        industry: selectedIndustry || undefined,
        limit: 20
      };

      try {
        switch (activeTab) {
          case 'competitors': {
            const data = await competitiveIntelligenceService.getCompetitorProfiles(filters);
            if (!cancelled) setCompetitors(data ?? []);
            break;
          }
          case 'activities': {
            const data = await competitiveIntelligenceService.getCompetitorActivities(filters);
            if (!cancelled) setActivities(data ?? []);
            break;
          }
          case 'market-share': {
            const data = await competitiveIntelligenceService.getMarketShareData(filters);
            if (!cancelled) setMarketShare(data ?? []);
            break;
          }
          case 'pricing': {
            const data = await competitiveIntelligenceService.getPricingIntelligence(filters);
            if (!cancelled) setPricing(data ?? []);
            break;
          }
        }
        if (!cancelled) setLastQueried(new Date());
      } catch {
        if (!cancelled) setLoadError('Connected records are unavailable. No verified competitive data is available for these filters.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadData();
    return () => { cancelled = true; };
  }, [selectedCountry, selectedIndustry, activeTab, refreshVersion]);

  const handleRefresh = () => {
    if (selectedCountry || selectedIndustry) {
      setRefreshVersion(version => version + 1);
    }
  };

  const tabs = [
    { id: 'competitors' as const, name: 'Competitor Profiles', icon: Building },
    { id: 'activities' as const, name: 'Recent Activities', icon: TrendingUp },
    { id: 'market-share' as const, name: 'Market Share', icon: AlertCircle },
    { id: 'pricing' as const, name: 'Pricing Intelligence', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      <div role="note" className={`rounded-lg border p-4 text-sm ${theme === 'dark' ? 'border-amber-700 bg-amber-900/20 text-amber-100' : 'border-amber-300 bg-amber-50 text-amber-950'}`}>
        <p className="font-semibold">Unverified stored competitive records</p>
        <p className="mt-1">Connected records may include static seed data or numeric defaults. Company claims, source attributions, and observation dates have not been verified. A completed query does not establish when the underlying figures were observed. These records are excluded from the entry planner.</p>
        <p className="mt-2">Activity and pricing queries support country filtering only; an industry selection does not filter those tabs.</p>
      </div>
      <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Competitive Intelligence</h2>
          <div className="flex items-center gap-4">
            {lastQueried && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Query completed {lastQueried.toLocaleTimeString()}; observation dates unverified</span>
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

        {loadError && <p role="alert" className="mb-4 rounded-lg border border-amber-600 p-3 text-sm">{loadError}</p>}

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
                            {formatPercent(competitor.market_share_percentage)} Market Share
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatRevenue(competitor.annual_revenue_usd)} Revenue
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
                            {activity.company_name} | Listed activity date: {formatListedDate(activity.activity_date)} (unverified)
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
                            <td className="px-4 py-2">{formatPercent(item.market_share_percentage)}</td>
                            <td className="px-4 py-2">{formatRevenue(item.revenue_usd)}</td>
                            <td className={`px-4 py-2 ${item.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {item.growth_rate >= 0 ? '+' : ''}{formatPercent(item.growth_rate)}
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
                          <p className="text-xs text-gray-500 mt-1">Listed source: {item.data_source || 'Unavailable'}; listed observation date: {formatListedDate(item.observation_date)} (unverified)</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-500">{Number.isFinite(item.price_usd) ? `$${item.price_usd}` : 'Unavailable'}</div>
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
