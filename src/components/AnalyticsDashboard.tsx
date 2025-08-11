import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area, AreaChart } from 'recharts';
import { BarChart3, Users, TrendingUp, Globe, Smartphone, DollarSign, Target, Zap } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'population' | 'economic' | 'digital' | 'market'>('population');

  // Comprehensive population data
  const populationData = [
    {
      country: 'Indonesia',
      population: 273.5,
      urbanization: 56.4,
      medianAge: 30.2,
      growthRate: 1.07,
      density: 151,
      workingAge: 68.7
    },
    {
      country: 'Philippines',
      population: 109.6,
      urbanization: 47.4,
      medianAge: 25.7,
      growthRate: 1.35,
      density: 367,
      workingAge: 64.1
    },
    {
      country: 'Vietnam',
      population: 97.3,
      urbanization: 37.3,
      medianAge: 32.5,
      growthRate: 0.91,
      density: 314,
      workingAge: 69.3
    },
    {
      country: 'Thailand',
      population: 69.8,
      urbanization: 51.4,
      medianAge: 40.1,
      growthRate: 0.25,
      density: 137,
      workingAge: 71.2
    },
    {
      country: 'Malaysia',
      population: 32.7,
      urbanization: 76.6,
      medianAge: 30.3,
      growthRate: 1.30,
      density: 99,
      workingAge: 69.6
    },
    {
      country: 'Singapore',
      population: 5.9,
      urbanization: 100,
      medianAge: 42.2,
      growthRate: 0.79,
      density: 8358,
      workingAge: 72.1
    }
  ];

  // Economic indicators with trends
  const economicTrends = [
    { year: '2019', Indonesia: 5.0, Philippines: 6.0, Vietnam: 7.0, Thailand: 2.3, Malaysia: 4.4, Singapore: 1.3 },
    { year: '2020', Indonesia: -2.1, Philippines: -9.6, Vietnam: 2.9, Thailand: -6.1, Malaysia: -5.6, Singapore: -3.9 },
    { year: '2021', Indonesia: 3.7, Philippines: 5.7, Vietnam: 2.6, Thailand: 1.5, Malaysia: 3.1, Singapore: 8.9 },
    { year: '2022', Indonesia: 5.3, Philippines: 7.6, Vietnam: 8.0, Thailand: 2.6, Malaysia: 8.7, Singapore: 3.6 },
    { year: '2023', Indonesia: 5.0, Philippines: 5.5, Vietnam: 5.1, Thailand: 2.5, Malaysia: 3.7, Singapore: 1.1 },
    { year: '2024', Indonesia: 5.2, Philippines: 6.2, Vietnam: 6.8, Thailand: 2.8, Malaysia: 4.5, Singapore: 2.6 }
  ];

  // Digital adoption metrics
  const digitalMetrics = [
    {
      country: 'Singapore',
      internetPenetration: 89,
      mobilePenetration: 92,
      socialMediaUsers: 85,
      ecommerceAdoption: 78,
      digitalPayments: 85,
      cloudAdoption: 72
    },
    {
      country: 'Thailand',
      internetPenetration: 82,
      mobilePenetration: 85,
      socialMediaUsers: 76,
      ecommerceAdoption: 65,
      digitalPayments: 72,
      cloudAdoption: 58
    },
    {
      country: 'Malaysia',
      internetPenetration: 84,
      mobilePenetration: 78,
      socialMediaUsers: 81,
      ecommerceAdoption: 58,
      digitalPayments: 68,
      cloudAdoption: 54
    },
    {
      country: 'Indonesia',
      internetPenetration: 71,
      mobilePenetration: 73,
      socialMediaUsers: 68,
      ecommerceAdoption: 52,
      digitalPayments: 61,
      cloudAdoption: 45
    },
    {
      country: 'Philippines',
      internetPenetration: 67,
      mobilePenetration: 68,
      socialMediaUsers: 72,
      ecommerceAdoption: 45,
      digitalPayments: 55,
      cloudAdoption: 41
    },
    {
      country: 'Vietnam',
      internetPenetration: 77,
      mobilePenetration: 75,
      socialMediaUsers: 74,
      ecommerceAdoption: 49,
      digitalPayments: 58,
      cloudAdoption: 43
    }
  ];

  // Market opportunity scoring
  const marketOpportunityData = [
    {
      country: 'Indonesia',
      marketSize: 287,
      growth: 5.2,
      competition: 65,
      regulation: 72,
      infrastructure: 68,
      opportunity: 78
    },
    {
      country: 'Philippines',
      marketSize: 156,
      growth: 6.2,
      competition: 58,
      regulation: 65,
      infrastructure: 62,
      opportunity: 75
    },
    {
      country: 'Vietnam',
      marketSize: 142,
      growth: 6.8,
      competition: 62,
      regulation: 68,
      infrastructure: 65,
      opportunity: 82
    },
    {
      country: 'Thailand',
      marketSize: 127,
      growth: 2.8,
      competition: 78,
      regulation: 85,
      infrastructure: 82,
      opportunity: 71
    },
    {
      country: 'Malaysia',
      marketSize: 98,
      growth: 4.5,
      competition: 72,
      regulation: 78,
      infrastructure: 75,
      opportunity: 73
    },
    {
      country: 'Singapore',
      marketSize: 89,
      growth: 2.6,
      competition: 92,
      regulation: 95,
      infrastructure: 95,
      opportunity: 68
    }
  ];

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  const metrics = [
    { id: 'population', name: 'Population Analytics', icon: <Users className="h-4 w-4" /> },
    { id: 'economic', name: 'Economic Trends', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'digital', name: 'Digital Adoption', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'market', name: 'Market Opportunities', icon: <Target className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-sm text-slate-400">Comprehensive Southeast Asian Market Analytics</p>
            </div>
          </div>
          
          {/* Metric Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id as any)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                  selectedMetric === metric.id
                    ? 'border-purple-500 bg-purple-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className={`${selectedMetric === metric.id ? 'text-purple-400' : 'text-slate-400'}`}>
                  {metric.icon}
                </div>
                <span className="text-sm font-medium">{metric.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Population Analytics */}
        {selectedMetric === 'population' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Population Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={populationData}>
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
                      <Bar dataKey="population" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Urbanization vs Population Density</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={populationData}>
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
                      <Bar yAxisId="left" dataKey="urbanization" fill="#10B981" />
                      <Line yAxisId="right" type="monotone" dataKey="density" stroke="#F59E0B" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Demographic Insights</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {populationData.map((country, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-sm font-medium text-white mb-2">{country.country}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Median Age</span>
                        <span className="text-white">{country.medianAge}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Growth Rate</span>
                        <span className="text-emerald-400">{country.growthRate}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Working Age</span>
                        <span className="text-blue-400">{country.workingAge}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Economic Trends */}
        {selectedMetric === 'economic' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">GDP Growth Trends (2019-2024)</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={economicTrends}>
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
                    {Object.keys(economicTrends[0]).filter(key => key !== 'year').map((country, index) => (
                      <Line 
                        key={country}
                        type="monotone" 
                        dataKey={country} 
                        stroke={colors[index]} 
                        strokeWidth={3}
                        dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Highest Growth</span>
                </div>
                <div className="text-2xl font-bold text-white">Vietnam</div>
                <div className="text-xs text-slate-400">6.8% projected 2024 growth</div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Largest Economy</span>
                </div>
                <div className="text-2xl font-bold text-white">Indonesia</div>
                <div className="text-xs text-slate-400">$1.32T GDP</div>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Most Resilient</span>
                </div>
                <div className="text-2xl font-bold text-white">Vietnam</div>
                <div className="text-xs text-slate-400">Positive growth in 2020</div>
              </div>
            </div>
          </div>
        )}

        {/* Digital Adoption */}
        {selectedMetric === 'digital' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Digital Adoption Radar</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={digitalMetrics}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="country" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Radar name="Internet" dataKey="internetPenetration" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                    <Radar name="Mobile" dataKey="mobilePenetration" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                    <Radar name="E-commerce" dataKey="ecommerceAdoption" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Digital Payment Adoption</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={digitalMetrics}>
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
                      <Area type="monotone" dataKey="digitalPayments" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Cloud Adoption by Country</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={digitalMetrics}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cloudAdoption"
                        label={({ country, cloudAdoption }) => `${country}: ${cloudAdoption}%`}
                      >
                        {digitalMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index]} />
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Opportunities */}
        {selectedMetric === 'market' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Market Opportunity Matrix</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={marketOpportunityData}>
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
                    <Bar yAxisId="left" dataKey="marketSize" fill="#3B82F6" />
                    <Line yAxisId="right" type="monotone" dataKey="opportunity" stroke="#10B981" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketOpportunityData.map((country, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{country.country}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      country.opportunity >= 80 ? 'bg-emerald-900/20 text-emerald-400' :
                      country.opportunity >= 70 ? 'bg-blue-900/20 text-blue-400' :
                      'bg-yellow-900/20 text-yellow-400'
                    }`}>
                      {country.opportunity}/100
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Market Size</span>
                      <span className="text-white">${country.marketSize}B</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Growth Rate</span>
                      <span className="text-emerald-400">{country.growth}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Infrastructure</span>
                      <span className="text-blue-400">{country.infrastructure}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;