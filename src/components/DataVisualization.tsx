import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface DataVisualizationProps {
  selectedCountries: string[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ selectedCountries }) => {
  const [activeChart, setActiveChart] = useState<'market-size' | 'growth-trends' | 'industry-breakdown' | 'digital-adoption'>('market-size');

  // Comprehensive market size data
  const marketSizeData = [
    { 
      country: 'Indonesia', 
      marketSize: 287, 
      population: 273.5, 
      gdpPerCapita: 4824,
      digitalEconomy: 77,
      ecommerce: 52,
      fintech: 23
    },
    { 
      country: 'Thailand', 
      marketSize: 127, 
      population: 69.8, 
      gdpPerCapita: 7806,
      digitalEconomy: 35,
      ecommerce: 18,
      fintech: 12
    },
    { 
      country: 'Singapore', 
      marketSize: 89, 
      population: 5.9, 
      gdpPerCapita: 65233,
      digitalEconomy: 28,
      ecommerce: 8,
      fintech: 15
    },
    { 
      country: 'Malaysia', 
      marketSize: 98, 
      population: 32.7, 
      gdpPerCapita: 11373,
      digitalEconomy: 25,
      ecommerce: 12,
      fintech: 8
    },
    { 
      country: 'Philippines', 
      marketSize: 156, 
      population: 109.6, 
      gdpPerCapita: 3485,
      digitalEconomy: 33,
      ecommerce: 15,
      fintech: 9
    },
    { 
      country: 'Vietnam', 
      marketSize: 142, 
      population: 97.3, 
      gdpPerCapita: 4164,
      digitalEconomy: 29,
      ecommerce: 13,
      fintech: 7
    }
  ].filter(item => selectedCountries.length === 0 || selectedCountries.some(country => 
    item.country.toLowerCase().includes(country) || country.includes(item.country.toLowerCase())
  ));

  // Growth trends with comprehensive data
  const growthTrendsData = [
    { 
      year: '2020', 
      Indonesia: 4.2, Thailand: 2.1, Singapore: 3.8, Malaysia: 3.5, Philippines: 5.2, Vietnam: 6.8,
      'SEA Average': 4.3
    },
    { 
      year: '2021', 
      Indonesia: 4.8, Thailand: 2.3, Singapore: 4.1, Malaysia: 3.8, Philippines: 5.6, Vietnam: 7.2,
      'SEA Average': 4.6
    },
    { 
      year: '2022', 
      Indonesia: 5.1, Thailand: 2.5, Singapore: 4.3, Malaysia: 4.0, Philippines: 5.8, Vietnam: 7.4,
      'SEA Average': 4.9
    },
    { 
      year: '2023', 
      Indonesia: 5.3, Thailand: 2.6, Singapore: 3.6, Malaysia: 4.2, Philippines: 6.1, Vietnam: 7.1,
      'SEA Average': 4.8
    },
    { 
      year: '2024', 
      Indonesia: 5.5, Thailand: 2.8, Singapore: 3.8, Malaysia: 4.4, Philippines: 6.3, Vietnam: 7.3,
      'SEA Average': 5.0
    },
    { 
      year: '2025', 
      Indonesia: 5.7, Thailand: 3.0, Singapore: 4.0, Malaysia: 4.6, Philippines: 6.5, Vietnam: 7.5,
      'SEA Average': 5.2
    }
  ];

  // Industry breakdown with detailed segments
  const industryBreakdownData = [
    { name: 'Technology & Software', value: 23, color: '#3B82F6', growth: 15.2 },
    { name: 'E-commerce & Retail', value: 18, color: '#10B981', growth: 22.8 },
    { name: 'Financial Services', value: 15, color: '#8B5CF6', growth: 18.4 },
    { name: 'Manufacturing', value: 12, color: '#F59E0B', growth: 8.7 },
    { name: 'Healthcare & Pharma', value: 10, color: '#EF4444', growth: 12.3 },
    { name: 'Tourism & Hospitality', value: 8, color: '#06B6D4', growth: -2.1 },
    { name: 'Agriculture & Food', value: 7, color: '#84CC16', growth: 5.6 },
    { name: 'Energy & Utilities', value: 4, color: '#F97316', growth: 7.2 },
    { name: 'Others', value: 3, color: '#6B7280', growth: 4.1 }
  ];

  // Digital adoption with comprehensive metrics
  const digitalAdoptionData = [
    { 
      country: 'Singapore', 
      mobile: 92, internet: 89, ecommerce: 78, digital_payments: 85, 
      social_media: 83, cloud_adoption: 72, ai_readiness: 68
    },
    { 
      country: 'Thailand', 
      mobile: 85, internet: 82, ecommerce: 65, digital_payments: 72, 
      social_media: 76, cloud_adoption: 58, ai_readiness: 45
    },
    { 
      country: 'Malaysia', 
      mobile: 78, internet: 84, ecommerce: 58, digital_payments: 68, 
      social_media: 81, cloud_adoption: 54, ai_readiness: 42
    },
    { 
      country: 'Indonesia', 
      mobile: 73, internet: 71, ecommerce: 52, digital_payments: 61, 
      social_media: 68, cloud_adoption: 45, ai_readiness: 38
    },
    { 
      country: 'Philippines', 
      mobile: 68, internet: 67, ecommerce: 45, digital_payments: 55, 
      social_media: 72, cloud_adoption: 41, ai_readiness: 35
    },
    { 
      country: 'Vietnam', 
      mobile: 75, internet: 77, ecommerce: 49, digital_payments: 58, 
      social_media: 74, cloud_adoption: 43, ai_readiness: 40
    }
  ].filter(item => selectedCountries.length === 0 || selectedCountries.some(country => 
    item.country.toLowerCase().includes(country) || country.includes(item.country.toLowerCase())
  ));

  const chartOptions = [
    { id: 'market-size', name: 'Market Size Analysis', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'growth-trends', name: 'Growth Trends', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'industry-breakdown', name: 'Industry Breakdown', icon: <PieChartIcon className="h-4 w-4" /> },
    { id: 'digital-adoption', name: 'Digital Adoption', icon: <Activity className="h-4 w-4" /> }
  ];

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Data Visualization Dashboard</h2>
          <div className="ml-auto text-sm text-slate-400">
            {selectedCountries.length > 0 ? `${selectedCountries.length} markets selected` : 'All markets'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveChart(option.id as any)}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                activeChart === option.id
                  ? 'border-blue-500 bg-blue-900/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className={`${activeChart === option.id ? 'text-blue-400' : 'text-slate-400'}`}>
                {option.icon}
              </div>
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="h-96">
          {activeChart === 'market-size' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Market Size Analysis</h3>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={marketSizeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="country" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="marketSize" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Market Size (USD B)" />
                  <Line yAxisId="right" type="monotone" dataKey="gdpPerCapita" stroke="#10B981" strokeWidth={3} name="GDP per Capita" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'growth-trends' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">GDP Growth Trends (2020-2025)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  {selectedCountries.length === 0 ? 
                    Object.keys(growthTrendsData[0]).filter(key => key !== 'year').map((country, index) => (
                      <Line 
                        key={country}
                        type="monotone" 
                        dataKey={country} 
                        stroke={colors[index % colors.length]} 
                        strokeWidth={country === 'SEA Average' ? 4 : 2}
                        strokeDasharray={country === 'SEA Average' ? '5 5' : '0'}
                        dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                      />
                    )) :
                    selectedCountries.map((country, index) => {
                      const countryKey = country.charAt(0).toUpperCase() + country.slice(1);
                      return (
                        <Line 
                          key={country}
                          type="monotone" 
                          dataKey={countryKey} 
                          stroke={colors[index % colors.length]} 
                          strokeWidth={2}
                          dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                        />
                      );
                    })
                  }
                  <Line 
                    type="monotone" 
                    dataKey="SEA Average" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'industry-breakdown' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Industry Market Share & Growth</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {industryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryBreakdownData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={120} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="growth" fill="#10B981" radius={[0, 4, 4, 0]} name="Growth Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChart === 'digital-adoption' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Digital Adoption Metrics (%)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={digitalAdoptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="country" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Area type="monotone" dataKey="mobile" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Mobile Penetration" />
                  <Area type="monotone" dataKey="internet" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Internet Penetration" />
                  <Area type="monotone" dataKey="ecommerce" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="E-commerce Adoption" />
                  <Area type="monotone" dataKey="digital_payments" stackId="4" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Digital Payments" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-medium text-white">Highest Growth</h4>
          </div>
          <div className="text-lg font-semibold text-emerald-400">Vietnam</div>
          <div className="text-xs text-slate-400">7.5% projected 2025 growth</div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-white">Largest Market</h4>
          </div>
          <div className="text-lg font-semibold text-blue-400">Indonesia</div>
          <div className="text-xs text-slate-400">$287B market size</div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-medium text-white">Most Digital</h4>
          </div>
          <div className="text-lg font-semibold text-purple-400">Singapore</div>
          <div className="text-xs text-slate-400">92% mobile penetration</div>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <PieChartIcon className="h-4 w-4 text-orange-400" />
            <h4 className="text-sm font-medium text-white">Top Industry</h4>
          </div>
          <div className="text-lg font-semibold text-orange-400">Technology</div>
          <div className="text-xs text-slate-400">23% market share, 15.2% growth</div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;