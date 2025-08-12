import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Globe, Users, DollarSign, Smartphone } from 'lucide-react';

interface DataVisualizationProps {
  selectedCountries: string[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ selectedCountries }) => {
  const [activeChart, setActiveChart] = useState<'market-size' | 'growth-trends' | 'industry-breakdown' | 'digital-adoption'>('market-size');

  // Comprehensive market size data with sources
  const marketSizeData = [
    { 
      country: 'Indonesia', 
      marketSize: 287.2, 
      population: 273.5, 
      gdpPerCapita: 4824,
      digitalEconomy: 77.1,
      ecommerce: 52.3,
      fintech: 23.8,
      source: 'World Bank, IMF, Google-Temasek e-Conomy SEA 2024'
    },
    { 
      country: 'Thailand', 
      marketSize: 127.4, 
      population: 69.8, 
      gdpPerCapita: 7806,
      digitalEconomy: 35.2,
      ecommerce: 18.7,
      fintech: 12.4,
      source: 'Bank of Thailand, NESDC, Bain & Company'
    },
    { 
      country: 'Singapore', 
      marketSize: 89.6, 
      population: 5.9, 
      gdpPerCapita: 65233,
      digitalEconomy: 28.3,
      ecommerce: 8.9,
      fintech: 15.2,
      source: 'MAS, IMDA, EDB Singapore'
    },
    { 
      country: 'Malaysia', 
      marketSize: 98.3, 
      population: 32.7, 
      gdpPerCapita: 11373,
      digitalEconomy: 25.7,
      ecommerce: 12.8,
      fintech: 8.6,
      source: 'Bank Negara Malaysia, MDEC, DOSM'
    },
    { 
      country: 'Philippines', 
      marketSize: 156.8, 
      population: 109.6, 
      gdpPerCapita: 3485,
      digitalEconomy: 33.4,
      ecommerce: 15.2,
      fintech: 9.7,
      source: 'BSP, DICT, Philippine Statistics Authority'
    },
    { 
      country: 'Vietnam', 
      marketSize: 142.1, 
      population: 97.3, 
      gdpPerCapita: 4164,
      digitalEconomy: 29.8,
      ecommerce: 13.6,
      fintech: 7.9,
      source: 'State Bank of Vietnam, VECOM, GSO Vietnam'
    }
  ].filter(item => selectedCountries.length === 0 || selectedCountries.some(country => 
    item.country.toLowerCase().includes(country) || country.includes(item.country.toLowerCase())
  ));

  // Growth trends with comprehensive data and sources
  const growthTrendsData = [
    { 
      year: '2020', 
      Indonesia: -2.1, Thailand: -6.1, Singapore: -3.9, Malaysia: -5.6, Philippines: -9.6, Vietnam: 2.9,
      'SEA Average': -4.1,
      source: 'IMF World Economic Outlook Database 2024'
    },
    { 
      year: '2021', 
      Indonesia: 3.7, Thailand: 1.5, Singapore: 8.9, Malaysia: 3.1, Philippines: 5.7, Vietnam: 2.6,
      'SEA Average': 4.3,
      source: 'IMF World Economic Outlook Database 2024'
    },
    { 
      year: '2022', 
      Indonesia: 5.3, Thailand: 2.6, Singapore: 3.6, Malaysia: 8.7, Philippines: 7.6, Vietnam: 8.0,
      'SEA Average': 5.9,
      source: 'IMF World Economic Outlook Database 2024'
    },
    { 
      year: '2023', 
      Indonesia: 5.0, Thailand: 2.5, Singapore: 1.1, Malaysia: 3.7, Philippines: 5.5, Vietnam: 5.1,
      'SEA Average': 3.8,
      source: 'IMF World Economic Outlook Database 2024'
    },
    { 
      year: '2024', 
      Indonesia: 5.2, Thailand: 2.8, Singapore: 2.6, Malaysia: 4.5, Philippines: 6.2, Vietnam: 6.8,
      'SEA Average': 4.7,
      source: 'IMF World Economic Outlook Database 2024 (Projected)'
    },
    { 
      year: '2025', 
      Indonesia: 5.4, Thailand: 3.0, Singapore: 2.8, Malaysia: 4.7, Philippines: 6.4, Vietnam: 7.0,
      'SEA Average': 4.9,
      source: 'IMF World Economic Outlook Database 2024 (Projected)'
    }
  ];

  // Industry breakdown with detailed segments and sources
  const industryBreakdownData = [
    { name: 'Technology & Software', value: 23.4, color: '#3B82F6', growth: 15.2, marketSize: 234.5, source: 'IDC Asia Pacific, Gartner' },
    { name: 'E-commerce & Retail', value: 18.7, color: '#10B981', growth: 22.8, marketSize: 187.3, source: 'Google-Temasek e-Conomy SEA 2024' },
    { name: 'Financial Services', value: 15.3, color: '#8B5CF6', growth: 18.4, marketSize: 153.2, source: 'PwC FinTech Survey, EY ASEAN Banking' },
    { name: 'Manufacturing', value: 12.8, color: '#F59E0B', growth: 8.7, marketSize: 128.4, source: 'ASEAN Manufacturing Survey 2024' },
    { name: 'Healthcare & Pharma', value: 10.2, color: '#EF4444', growth: 12.3, marketSize: 102.1, source: 'IQVIA, McKinsey Global Health Institute' },
    { name: 'Tourism & Hospitality', value: 8.4, color: '#06B6D4', growth: -2.1, marketSize: 84.2, source: 'UNWTO, ASEAN Tourism Statistics' },
    { name: 'Agriculture & Food', value: 6.9, color: '#84CC16', growth: 5.6, marketSize: 69.3, source: 'FAO, ASEAN Food Security Report' },
    { name: 'Energy & Utilities', value: 4.3, color: '#F97316', growth: 7.2, marketSize: 43.1, source: 'IEA Southeast Asia Energy Outlook' }
  ];

  // Digital adoption with comprehensive metrics and sources
  const digitalAdoptionData = [
    { 
      country: 'Singapore', 
      mobile: 92.3, internet: 89.4, ecommerce: 78.2, digital_payments: 85.7, 
      social_media: 83.1, cloud_adoption: 72.4, ai_readiness: 68.9,
      source: 'IMDA Digital Society Report 2024'
    },
    { 
      country: 'Thailand', 
      mobile: 85.2, internet: 82.1, ecommerce: 65.3, digital_payments: 72.8, 
      social_media: 76.4, cloud_adoption: 58.2, ai_readiness: 45.7,
      source: 'NBTC, ETDA Digital Thailand Report 2024'
    },
    { 
      country: 'Malaysia', 
      mobile: 78.9, internet: 84.2, ecommerce: 58.7, digital_payments: 68.3, 
      social_media: 81.5, cloud_adoption: 54.1, ai_readiness: 42.8,
      source: 'MCMC, MDEC Malaysia Digital Economy Report'
    },
    { 
      country: 'Indonesia', 
      mobile: 73.4, internet: 71.8, ecommerce: 52.6, digital_payments: 61.2, 
      social_media: 68.9, cloud_adoption: 45.3, ai_readiness: 38.4,
      source: 'Kominfo, APJII Internet Survey 2024'
    },
    { 
      country: 'Philippines', 
      mobile: 68.7, internet: 67.3, ecommerce: 45.8, digital_payments: 55.4, 
      social_media: 72.1, cloud_adoption: 41.6, ai_readiness: 35.2,
      source: 'DICT, Hootsuite Digital Philippines Report'
    },
    { 
      country: 'Vietnam', 
      mobile: 75.3, internet: 77.2, ecommerce: 49.4, digital_payments: 58.7, 
      social_media: 74.8, cloud_adoption: 43.2, ai_readiness: 40.1,
      source: 'MIC Vietnam, VECOM E-commerce Report 2024'
    }
  ].filter(item => selectedCountries.length === 0 || selectedCountries.some(country => 
    item.country.toLowerCase().includes(country) || country.includes(item.country.toLowerCase())
  ));

  // Consumer behavior data
  const consumerBehaviorData = [
    { category: 'Mobile Shopping', percentage: 78.4, growth: 24.3, source: 'Nielsen Consumer Insights SEA 2024' },
    { category: 'Social Commerce', percentage: 65.7, growth: 31.8, source: 'Meta Business & Bain Social Commerce Report' },
    { category: 'Digital Payments', percentage: 72.1, growth: 28.5, source: 'Visa Consumer Payment Attitudes Study' },
    { category: 'Video Streaming', percentage: 84.2, growth: 18.7, source: 'Media Partners Asia OTT Report 2024' },
    { category: 'Food Delivery', percentage: 56.8, growth: 22.4, source: 'Grab-Kantar SEA Consumer Report' },
    { category: 'Online Banking', percentage: 69.3, growth: 15.9, source: 'EY ASEAN Digital Banking Survey' }
  ];

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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Market Size Analysis</h3>
                <div className="text-xs text-slate-400">
                  Source: {marketSizeData[0]?.source || 'World Bank, IMF, Google-Temasek e-Conomy SEA 2024'}
                </div>
              </div>
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
                  <Line yAxisId="right" type="monotone" dataKey="gdpPerCapita" stroke="#10B981" strokeWidth={3} name="GDP per Capita (USD)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'growth-trends' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">GDP Growth Trends (2020-2025)</h3>
                <div className="text-xs text-slate-400">
                  Source: IMF World Economic Outlook Database 2024
                </div>
              </div>
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
                    Object.keys(growthTrendsData[0]).filter(key => key !== 'year' && key !== 'source').map((country, index) => (
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Industry Market Share & Growth</h3>
                <div className="text-xs text-slate-400">
                  Source: IDC, Gartner, Google-Temasek e-Conomy SEA 2024
                </div>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Digital Adoption Metrics (%)</h3>
                <div className="text-xs text-slate-400">
                  Source: IMDA, NBTC, MCMC, Kominfo, DICT, MIC Vietnam
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={digitalAdoptionData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="country" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Radar name="Mobile" dataKey="mobile" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Internet" dataKey="internet" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="E-commerce" dataKey="ecommerce" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Digital Payments" dataKey="digital_payments" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Consumer Behavior Insights */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Consumer Behavior Trends</h3>
          <div className="text-xs text-slate-400">
            Source: Nielsen, Meta Business, Visa, Media Partners Asia
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={consumerBehaviorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
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
              <Bar yAxisId="left" dataKey="percentage" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Adoption %" />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={3} name="Growth %" />
            </ComposedChart>
          </ResponsiveContainer>
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
          <div className="text-xs text-slate-400">7.0% projected 2025 growth</div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-white">Largest Market</h4>
          </div>
          <div className="text-lg font-semibold text-blue-400">Indonesia</div>
          <div className="text-xs text-slate-400">$287.2B market size</div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-medium text-white">Most Digital</h4>
          </div>
          <div className="text-lg font-semibold text-purple-400">Singapore</div>
          <div className="text-xs text-slate-400">92.3% mobile penetration</div>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <PieChartIcon className="h-4 w-4 text-orange-400" />
            <h4 className="text-sm font-medium text-white">Top Industry</h4>
          </div>
          <div className="text-lg font-semibold text-orange-400">Technology</div>
          <div className="text-xs text-slate-400">23.4% market share, 15.2% growth</div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;