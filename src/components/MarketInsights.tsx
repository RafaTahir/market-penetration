import React from 'react';
import { Eye, Users, DollarSign, TrendingUp, Globe, Smartphone } from 'lucide-react';

interface MarketInsightsProps {
  selectedCountries: string[];
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ selectedCountries }) => {
  const insights = [
    {
      title: 'Digital Advertising Spend',
      value: '$12.4B',
      change: '+23.5%',
      icon: <Eye className="h-5 w-5" />,
      description: 'Year-over-year growth in digital ad spending across selected markets',
      color: 'blue'
    },
    {
      title: 'Mobile Commerce Growth',
      value: '78%',
      change: '+15.2%',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Mobile commerce as percentage of total e-commerce transactions',
      color: 'emerald'
    },
    {
      title: 'Social Media Users',
      value: '456M',
      change: '+8.7%',
      icon: <Users className="h-5 w-5" />,
      description: 'Active social media users across selected Southeast Asian markets',
      color: 'purple'
    },
    {
      title: 'Cross-Border Trade',
      value: '$89.2B',
      change: '+31.4%',
      icon: <Globe className="h-5 w-5" />,
      description: 'Value of cross-border e-commerce transactions in the region',
      color: 'orange'
    }
  ];

  const mediaChannels = [
    { name: 'Social Media', reach: 89, cost: 'Low', roi: 'High', growth: '+12%' },
    { name: 'Search Advertising', reach: 76, cost: 'Medium', roi: 'High', growth: '+8%' },
    { name: 'Video Streaming', reach: 68, cost: 'High', roi: 'Medium', growth: '+24%' },
    { name: 'E-commerce Platforms', reach: 82, cost: 'Medium', roi: 'Very High', growth: '+18%' },
    { name: 'Influencer Marketing', reach: 54, cost: 'Medium', roi: 'High', growth: '+35%' },
    { name: 'Traditional TV', reach: 43, cost: 'High', roi: 'Low', growth: '-5%' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-900/20',
      emerald: 'text-emerald-400 bg-emerald-900/20',
      purple: 'text-purple-400 bg-purple-900/20',
      orange: 'text-orange-400 bg-orange-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getRoiColor = (roi: string) => {
    switch (roi) {
      case 'Very High': return 'text-emerald-400 bg-emerald-900/20';
      case 'High': return 'text-blue-400 bg-blue-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'Low': return 'text-red-400 bg-red-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Market Metrics */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Market Intelligence</h2>
          <span className="text-sm text-slate-400">
            ({selectedCountries.length} market{selectedCountries.length !== 1 ? 's' : ''})
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${getColorClasses(insight.color)}`}>
                  {insight.icon}
                </div>
                <span className="text-emerald-400 text-sm font-medium">{insight.change}</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{insight.value}</div>
                <div className="text-sm font-medium text-slate-300">{insight.title}</div>
                <div className="text-xs text-slate-400">{insight.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Landscape Analysis */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-2 mb-6">
          <Eye className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Media Landscape & ROI Analysis</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Channel</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Reach</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Cost</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">ROI Potential</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {mediaChannels.map((channel, index) => (
                <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-white">{channel.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${channel.reach}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-300 min-w-[3rem]">{channel.reach}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm text-slate-300">{channel.cost}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoiColor(channel.roi)}`}>
                      {channel.roi}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`text-sm font-medium ${
                      channel.growth.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {channel.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Entry Recommendations */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-2 mb-6">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Market Entry Recommendations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <h3 className="font-medium text-emerald-400">High Priority</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Digital-first approach recommended</li>
              <li>• Focus on mobile optimization</li>
              <li>• Partner with local influencers</li>
              <li>• Leverage social commerce platforms</li>
            </ul>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <h3 className="font-medium text-yellow-400">Medium Priority</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Establish local partnerships</li>
              <li>• Invest in SEO and content marketing</li>
              <li>• Consider traditional media mix</li>
              <li>• Build brand awareness campaigns</li>
            </ul>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <h3 className="font-medium text-blue-400">Long-term Strategy</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Develop local product variants</li>
              <li>• Build customer service infrastructure</li>
              <li>• Establish supply chain presence</li>
              <li>• Create loyalty programs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;