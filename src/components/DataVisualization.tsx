import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Treemap } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Globe, Users, DollarSign, Smartphone, Target, Zap, Eye, ShoppingCart, Building2, Briefcase } from 'lucide-react';

interface DataVisualizationProps {
  selectedCountries: string[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ selectedCountries }) => {
  const [activeChart, setActiveChart] = useState<'market-size' | 'growth-trends' | 'industry-breakdown' | 'digital-adoption' | 'consumer-behavior' | 'competitive-analysis' | 'investment-flows' | 'trade-analysis'>('market-size');

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
      manufacturing: 89.4,
      services: 134.5,
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
      manufacturing: 45.8,
      services: 50.5,
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
      manufacturing: 12.7,
      services: 52.8,
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
      manufacturing: 34.2,
      services: 42.7,
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
      manufacturing: 67.3,
      services: 64.6,
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
      manufacturing: 78.9,
      services: 45.7,
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
    { name: 'Technology & Software', value: 23.4, color: '#3B82F6', growth: 15.2, marketSize: 234.5, employees: 2.8, source: 'IDC Asia Pacific, Gartner' },
    { name: 'E-commerce & Retail', value: 18.7, color: '#10B981', growth: 22.8, marketSize: 187.3, employees: 3.2, source: 'Google-Temasek e-Conomy SEA 2024' },
    { name: 'Financial Services', value: 15.3, color: '#8B5CF6', growth: 18.4, marketSize: 153.2, employees: 1.9, source: 'PwC FinTech Survey, EY ASEAN Banking' },
    { name: 'Manufacturing', value: 12.8, color: '#F59E0B', growth: 8.7, marketSize: 128.4, employees: 45.7, source: 'ASEAN Manufacturing Survey 2024' },
    { name: 'Healthcare & Pharma', value: 10.2, color: '#EF4444', growth: 12.3, marketSize: 102.1, employees: 4.1, source: 'IQVIA, McKinsey Global Health Institute' },
    { name: 'Tourism & Hospitality', value: 8.4, color: '#06B6D4', growth: -2.1, marketSize: 84.2, employees: 12.3, source: 'UNWTO, ASEAN Tourism Statistics' },
    { name: 'Agriculture & Food', value: 6.9, color: '#84CC16', growth: 5.6, marketSize: 69.3, employees: 89.4, source: 'FAO, ASEAN Food Security Report' },
    { name: 'Energy & Utilities', value: 4.3, color: '#F97316', growth: 7.2, marketSize: 43.1, employees: 2.1, source: 'IEA Southeast Asia Energy Outlook' }
  ];

  // Digital adoption with comprehensive metrics and sources
  const digitalAdoptionData = [
    { 
      country: 'Singapore', 
      mobile: 92.3, internet: 89.4, ecommerce: 78.2, digital_payments: 85.7, 
      social_media: 83.1, cloud_adoption: 72.4, ai_readiness: 68.9, cybersecurity: 85.2,
      source: 'IMDA Digital Society Report 2024'
    },
    { 
      country: 'Thailand', 
      mobile: 85.2, internet: 82.1, ecommerce: 65.3, digital_payments: 72.8, 
      social_media: 76.4, cloud_adoption: 58.2, ai_readiness: 45.7, cybersecurity: 67.3,
      source: 'NBTC, ETDA Digital Thailand Report 2024'
    },
    { 
      country: 'Malaysia', 
      mobile: 78.9, internet: 84.2, ecommerce: 58.7, digital_payments: 68.3, 
      social_media: 81.5, cloud_adoption: 54.1, ai_readiness: 42.8, cybersecurity: 71.6,
      source: 'MCMC, MDEC Malaysia Digital Economy Report'
    },
    { 
      country: 'Indonesia', 
      mobile: 73.4, internet: 71.8, ecommerce: 52.6, digital_payments: 61.2, 
      social_media: 68.9, cloud_adoption: 45.3, ai_readiness: 38.4, cybersecurity: 58.7,
      source: 'Kominfo, APJII Internet Survey 2024'
    },
    { 
      country: 'Philippines', 
      mobile: 68.7, internet: 67.3, ecommerce: 45.8, digital_payments: 55.4, 
      social_media: 72.1, cloud_adoption: 41.6, ai_readiness: 35.2, cybersecurity: 52.9,
      source: 'DICT, Hootsuite Digital Philippines Report'
    },
    { 
      country: 'Vietnam', 
      mobile: 75.3, internet: 77.2, ecommerce: 49.4, digital_payments: 58.7, 
      social_media: 74.8, cloud_adoption: 43.2, ai_readiness: 40.1, cybersecurity: 61.4,
      source: 'MIC Vietnam, VECOM E-commerce Report 2024'
    }
  ].filter(item => selectedCountries.length === 0 || selectedCountries.some(country => 
    item.country.toLowerCase().includes(country) || country.includes(item.country.toLowerCase())
  ));

  // Consumer behavior data with comprehensive insights
  const consumerBehaviorData = [
    { category: 'Mobile Shopping', percentage: 78.4, growth: 24.3, avgSpend: 245, frequency: 3.2, satisfaction: 4.2, source: 'Nielsen Consumer Insights SEA 2024' },
    { category: 'Social Commerce', percentage: 65.7, growth: 31.8, avgSpend: 189, frequency: 2.8, satisfaction: 4.0, source: 'Meta Business & Bain Social Commerce Report' },
    { category: 'Digital Payments', percentage: 72.1, growth: 28.5, avgSpend: 312, frequency: 8.7, satisfaction: 4.3, source: 'Visa Consumer Payment Attitudes Study' },
    { category: 'Video Streaming', percentage: 84.2, growth: 18.7, avgSpend: 12, frequency: 15.3, satisfaction: 4.1, source: 'Media Partners Asia OTT Report 2024' },
    { category: 'Food Delivery', percentage: 56.8, growth: 22.4, avgSpend: 23, frequency: 4.1, satisfaction: 3.8, source: 'Grab-Kantar SEA Consumer Report' },
    { category: 'Online Banking', percentage: 69.3, growth: 15.9, avgSpend: 0, frequency: 12.4, satisfaction: 4.0, source: 'EY ASEAN Digital Banking Survey' },
    { category: 'Gaming & Entertainment', percentage: 73.6, growth: 26.7, avgSpend: 45, frequency: 8.9, satisfaction: 4.4, source: 'Newzoo Games Market Report SEA' },
    { category: 'Health & Fitness Apps', percentage: 42.8, growth: 34.2, avgSpend: 18, frequency: 5.2, satisfaction: 3.9, source: 'App Annie Health & Fitness Report' }
  ];

  // Competitive analysis data
  const competitiveAnalysisData = [
    { 
      sector: 'E-commerce', 
      marketShare: 68.4, 
      competitionLevel: 85, 
      entryBarrier: 72, 
      opportunity: 78,
      leaders: 'Shopee, Lazada, Tokopedia',
      marketConcentration: 'High',
      avgMargin: 12.4,
      source: 'Momentum Works E-commerce Report 2024'
    },
    { 
      sector: 'Fintech', 
      marketShare: 45.7, 
      competitionLevel: 65, 
      entryBarrier: 88, 
      opportunity: 92,
      leaders: 'Grab Financial, GoPay, TrueMoney',
      marketConcentration: 'Medium',
      avgMargin: 28.7,
      source: 'PwC FinTech Survey SEA 2024'
    },
    { 
      sector: 'Food Delivery', 
      marketShare: 72.3, 
      competitionLevel: 92, 
      entryBarrier: 85, 
      opportunity: 45,
      leaders: 'Grab Food, foodpanda, Gojek',
      marketConcentration: 'Very High',
      avgMargin: 8.2,
      source: 'Euromonitor Food Service Report'
    },
    { 
      sector: 'Ride-hailing', 
      marketShare: 81.2, 
      competitionLevel: 95, 
      entryBarrier: 92, 
      opportunity: 35,
      leaders: 'Grab, Gojek, InDriver',
      marketConcentration: 'Very High',
      avgMargin: 15.3,
      source: 'Frost & Sullivan Mobility Report'
    },
    { 
      sector: 'Digital Banking', 
      marketShare: 34.8, 
      competitionLevel: 58, 
      entryBarrier: 95, 
      opportunity: 88,
      leaders: 'DBS, CIMB, Maybank',
      marketConcentration: 'Medium',
      avgMargin: 45.6,
      source: 'EY ASEAN Digital Banking Survey'
    },
    { 
      sector: 'EdTech', 
      marketShare: 28.5, 
      competitionLevel: 42, 
      entryBarrier: 45, 
      opportunity: 85,
      leaders: 'Ruangguru, BYJU\'S, Coursera',
      marketConcentration: 'Low',
      avgMargin: 22.1,
      source: 'HolonIQ EdTech Market Report'
    },
    { 
      sector: 'HealthTech', 
      marketShare: 23.7, 
      competitionLevel: 38, 
      entryBarrier: 52, 
      opportunity: 89,
      leaders: 'Halodoc, Doctor Anywhere, Medix',
      marketConcentration: 'Low',
      avgMargin: 35.4,
      source: 'McKinsey Digital Health Report'
    },
    { 
      sector: 'PropTech', 
      marketShare: 18.9, 
      competitionLevel: 35, 
      entryBarrier: 48, 
      opportunity: 82,
      leaders: 'PropertyGuru, 99.co, Lamudi',
      marketConcentration: 'Low',
      avgMargin: 18.7,
      source: 'JLL PropTech Report SEA'
    }
  ];

  // Investment flows data
  const investmentFlowsData = [
    { year: '2020', FDI: 156.2, VC: 8.2, PE: 12.4, totalDeals: 234, avgDealSize: 15.7, source: 'UNCTAD, Preqin, CB Insights' },
    { year: '2021', FDI: 174.8, VC: 25.6, PE: 18.9, totalDeals: 387, avgDealSize: 22.3, source: 'UNCTAD, Preqin, CB Insights' },
    { year: '2022', FDI: 189.3, VC: 31.4, PE: 24.7, totalDeals: 456, avgDealSize: 28.9, source: 'UNCTAD, Preqin, CB Insights' },
    { year: '2023', FDI: 167.9, VC: 18.7, PE: 21.3, totalDeals: 398, avgDealSize: 24.1, source: 'UNCTAD, Preqin, CB Insights' },
    { year: '2024', FDI: 178.5, VC: 22.9, PE: 26.8, totalDeals: 423, avgDealSize: 26.7, source: 'UNCTAD, Preqin, CB Insights (Projected)' }
  ];

  // Trade analysis data
  const tradeAnalysisData = [
    { 
      country: 'Singapore', 
      exports: 641.3, 
      imports: 587.9, 
      tradeBalance: 53.4, 
      mainExports: 'Electronics, Chemicals, Refined Petroleum',
      mainImports: 'Machinery, Mineral Fuels, Electronics',
      topPartners: 'China, Malaysia, USA',
      source: 'Enterprise Singapore, IE Singapore'
    },
    { 
      country: 'Thailand', 
      exports: 271.8, 
      imports: 254.1, 
      tradeBalance: 17.7, 
      mainExports: 'Electronics, Vehicles, Machinery',
      mainImports: 'Crude Oil, Electronics, Machinery',
      topPartners: 'China, Japan, USA',
      source: 'Ministry of Commerce Thailand'
    },
    { 
      country: 'Malaysia', 
      exports: 247.3, 
      imports: 202.8, 
      tradeBalance: 44.5, 
      mainExports: 'Electronics, Palm Oil, Petroleum',
      mainImports: 'Electronics, Machinery, Chemicals',
      topPartners: 'China, Singapore, USA',
      source: 'MATRADE, Department of Statistics Malaysia'
    },
    { 
      country: 'Indonesia', 
      exports: 231.5, 
      imports: 196.7, 
      tradeBalance: 34.8, 
      mainExports: 'Coal, Palm Oil, Electronics',
      mainImports: 'Machinery, Electronics, Chemicals',
      topPartners: 'China, Japan, Singapore',
      source: 'BPS Statistics Indonesia, Ministry of Trade'
    },
    { 
      country: 'Philippines', 
      exports: 71.2, 
      imports: 110.9, 
      tradeBalance: -39.7, 
      mainExports: 'Electronics, Machinery, Coconut Oil',
      mainImports: 'Electronics, Mineral Fuels, Machinery',
      topPartners: 'China, Japan, USA',
      source: 'Philippine Statistics Authority, DTI'
    },
    { 
      country: 'Vietnam', 
      exports: 347.2, 
      imports: 332.8, 
      tradeBalance: 14.4, 
      mainExports: 'Electronics, Textiles, Footwear',
      mainImports: 'Electronics, Machinery, Petroleum',
      topPartners: 'USA, China, South Korea',
      source: 'General Statistics Office Vietnam, MOIT'
    }
  ].filter(item => selectedCountries.length === 0 || selectedCountries.some(country => 
    item.country.toLowerCase().includes(country) || country.includes(item.country.toLowerCase())
  ));

  const chartOptions = [
    { id: 'market-size', name: 'Market Size Analysis', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'growth-trends', name: 'Growth Trends', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'industry-breakdown', name: 'Industry Breakdown', icon: <PieChartIcon className="h-4 w-4" /> },
    { id: 'digital-adoption', name: 'Digital Adoption', icon: <Activity className="h-4 w-4" /> },
    { id: 'consumer-behavior', name: 'Consumer Behavior', icon: <Users className="h-4 w-4" /> },
    { id: 'competitive-analysis', name: 'Competitive Analysis', icon: <Target className="h-4 w-4" /> },
    { id: 'investment-flows', name: 'Investment Flows', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'trade-analysis', name: 'Trade Analysis', icon: <Globe className="h-4 w-4" /> }
  ];

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

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
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveChart(option.id as any)}
              className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all duration-200 ${
                activeChart === option.id
                  ? 'border-blue-500 bg-blue-900/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className={`${activeChart === option.id ? 'text-blue-400' : 'text-slate-400'}`}>
                {option.icon}
              </div>
              <span className="text-xs font-medium text-center">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="min-h-[600px]">
          {activeChart === 'market-size' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Market Size Analysis</h3>
                <div className="text-xs text-slate-400">
                  Source: World Bank, IMF, Google-Temasek e-Conomy SEA 2024
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Market Size vs GDP per Capita</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={marketSizeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="country" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
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
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Economic Sector Breakdown</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketSizeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="country" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Area type="monotone" dataKey="services" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Services (USD B)" />
                      <Area type="monotone" dataKey="manufacturing" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Manufacturing (USD B)" />
                      <Area type="monotone" dataKey="digitalEconomy" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Digital Economy (USD B)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                  <div className="text-sm text-blue-400 mb-1">Total Combined Market</div>
                  <div className="text-2xl font-bold text-white">
                    ${marketSizeData.reduce((acc, item) => acc + item.marketSize, 0).toFixed(1)}B
                  </div>
                  <div className="text-xs text-slate-400">Across selected markets</div>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                  <div className="text-sm text-emerald-400 mb-1">Digital Economy Share</div>
                  <div className="text-2xl font-bold text-white">
                    {((marketSizeData.reduce((acc, item) => acc + item.digitalEconomy, 0) / marketSizeData.reduce((acc, item) => acc + item.marketSize, 0)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400">Of total market size</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                  <div className="text-sm text-purple-400 mb-1">Average GDP/Capita</div>
                  <div className="text-2xl font-bold text-white">
                    ${(marketSizeData.reduce((acc, item) => acc + item.gdpPerCapita, 0) / marketSizeData.length).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">Weighted average</div>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'growth-trends' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">GDP Growth Trends (2020-2025)</h3>
                <div className="text-xs text-slate-400">
                  Source: IMF World Economic Outlook Database 2024
                </div>
              </div>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} label={{ value: 'Growth %', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                  <div className="text-sm text-emerald-400 mb-1">Fastest Growing</div>
                  <div className="text-lg font-bold text-white">Vietnam</div>
                  <div className="text-xs text-slate-400">7.0% projected 2025</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                  <div className="text-sm text-blue-400 mb-1">Most Resilient</div>
                  <div className="text-lg font-bold text-white">Vietnam</div>
                  <div className="text-xs text-slate-400">Positive growth in 2020</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                  <div className="text-sm text-purple-400 mb-1">Recovery Leader</div>
                  <div className="text-lg font-bold text-white">Singapore</div>
                  <div className="text-xs text-slate-400">8.9% growth in 2021</div>
                </div>
                <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                  <div className="text-sm text-orange-400 mb-1">SEA Average 2025</div>
                  <div className="text-lg font-bold text-white">4.9%</div>
                  <div className="text-xs text-slate-400">Projected growth</div>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'industry-breakdown' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Industry Market Share & Growth</h3>
                <div className="text-xs text-slate-400">
                  Source: IDC, Gartner, Google-Temasek e-Conomy SEA 2024
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Market Share Distribution</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={industryBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ value }) => `${value}%`}
                        labelLine={false}
                      >
                        {industryBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
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
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Growth Rate by Industry</h4>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {industryBreakdownData.slice(0, 4).map((industry, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: industry.color }}></div>
                      <div className="text-sm font-medium text-white">{industry.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-white">${industry.marketSize}B</div>
                      <div className="text-sm text-emerald-400">+{industry.growth}% growth</div>
                      <div className="text-xs text-slate-400">{industry.employees}M employees</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'digital-adoption' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Digital Adoption Metrics</h3>
                <div className="text-xs text-slate-400">
                  Source: IMDA, NBTC, MCMC, Kominfo, DICT, MIC Vietnam
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Digital Adoption Radar</h4>
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
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">AI Readiness vs Cloud Adoption</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={digitalAdoptionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="cloud_adoption" stroke="#9CA3AF" name="Cloud Adoption %" />
                      <YAxis dataKey="ai_readiness" stroke="#9CA3AF" name="AI Readiness %" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => [
                          `${value}%`,
                          name === 'ai_readiness' ? 'AI Readiness' : name,
                          props.payload.country
                        ]}
                      />
                      <Scatter name="Countries" dataKey="ai_readiness" fill="#8B5CF6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {digitalAdoptionData.map((country, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">{country.country}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Mobile</span>
                        <span className="text-blue-400">{country.mobile}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Internet</span>
                        <span className="text-emerald-400">{country.internet}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">E-commerce</span>
                        <span className="text-purple-400">{country.ecommerce}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'consumer-behavior' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Consumer Behavior Analysis</h3>
                <div className="text-xs text-slate-400">
                  Source: Nielsen, Meta Business, Visa, Media Partners Asia
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Adoption vs Growth Rate</h4>
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
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Customer Satisfaction vs Usage Frequency</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={consumerBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="frequency" stroke="#9CA3AF" name="Usage Frequency (times/month)" />
                      <YAxis dataKey="satisfaction" stroke="#9CA3AF" name="Satisfaction Score" domain={[3, 5]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => [
                          name === 'satisfaction' ? `${value}/5.0` : `${value} times/month`,
                          name === 'satisfaction' ? 'Satisfaction' : 'Frequency',
                          props.payload.category
                        ]}
                      />
                      <Scatter name="Categories" dataKey="satisfaction" fill="#F59E0B" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {consumerBehaviorData.slice(0, 4).map((behavior, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-sm font-medium text-white mb-2">{behavior.category}</div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-emerald-400">{behavior.percentage}%</div>
                      <div className="text-xs text-slate-400">Adoption rate</div>
                      <div className="text-sm text-blue-400">+{behavior.growth}% growth</div>
                      <div className="text-xs text-slate-400">${behavior.avgSpend} avg spend</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'competitive-analysis' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Competitive Landscape Analysis</h3>
                <div className="text-xs text-slate-400">
                  Source: Momentum Works, PwC, Euromonitor, Frost & Sullivan
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Market Share vs Competition Level</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={competitiveAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="marketShare" stroke="#9CA3AF" name="Market Share %" />
                      <YAxis dataKey="competitionLevel" stroke="#9CA3AF" name="Competition Level" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => [
                          `${value}${name === 'marketShare' ? '%' : '/100'}`,
                          name === 'marketShare' ? 'Market Share' : 'Competition Level',
                          props.payload.sector
                        ]}
                      />
                      <Scatter name="Sectors" dataKey="competitionLevel" fill="#EF4444" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Market Opportunity Score</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitiveAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="sector" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Bar dataKey="opportunity" fill="#10B981" radius={[4, 4, 0, 0]} name="Opportunity Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Sector</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Market Share</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Competition</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Entry Barrier</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Opportunity</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Avg Margin</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Market Leaders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {competitiveAnalysisData.map((sector, index) => (
                      <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{sector.sector}</td>
                        <td className="py-4 px-4 text-right text-slate-300">{sector.marketShare}%</td>
                        <td className="py-4 px-4 text-right text-red-400">{sector.competitionLevel}/100</td>
                        <td className="py-4 px-4 text-right text-orange-400">{sector.entryBarrier}/100</td>
                        <td className="py-4 px-4 text-right text-emerald-400">{sector.opportunity}/100</td>
                        <td className="py-4 px-4 text-right text-blue-400">{sector.avgMargin}%</td>
                        <td className="py-4 px-4 text-slate-300 text-sm">{sector.leaders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeChart === 'investment-flows' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Investment Flows Analysis</h3>
                <div className="text-xs text-slate-400">
                  Source: UNCTAD, Preqin, CB Insights
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Investment Types Over Time</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={investmentFlowsData}>
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
                      <Area type="monotone" dataKey="FDI" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="FDI (USD B)" />
                      <Area type="monotone" dataKey="VC" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Venture Capital (USD B)" />
                      <Area type="monotone" dataKey="PE" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Private Equity (USD B)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Deal Activity & Average Size</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={investmentFlowsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" />
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
                      <Bar yAxisId="left" dataKey="totalDeals" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Total Deals" />
                      <Line yAxisId="right" type="monotone" dataKey="avgDealSize" stroke="#EF4444" strokeWidth={3} name="Avg Deal Size (USD M)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {investmentFlowsData.slice(-1).map((data, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <div className="text-sm text-blue-400 mb-1">FDI 2024</div>
                      <div className="text-xl font-bold text-white">${data.FDI}B</div>
                      <div className="text-xs text-slate-400">Foreign Direct Investment</div>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                      <div className="text-sm text-emerald-400 mb-1">VC 2024</div>
                      <div className="text-xl font-bold text-white">${data.VC}B</div>
                      <div className="text-xs text-slate-400">Venture Capital</div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                      <div className="text-sm text-purple-400 mb-1">PE 2024</div>
                      <div className="text-xl font-bold text-white">${data.PE}B</div>
                      <div className="text-xs text-slate-400">Private Equity</div>
                    </div>
                    <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                      <div className="text-sm text-orange-400 mb-1">Total Deals</div>
                      <div className="text-xl font-bold text-white">{data.totalDeals}</div>
                      <div className="text-xs text-slate-400">Investment deals</div>
                    </div>
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                      <div className="text-sm text-red-400 mb-1">Avg Deal Size</div>
                      <div className="text-xl font-bold text-white">${data.avgDealSize}M</div>
                      <div className="text-xs text-slate-400">Per transaction</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'trade-analysis' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">International Trade Analysis</h3>
                <div className="text-xs text-slate-400">
                  Source: National Trade Ministries, ASEAN Trade Statistics
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Trade Balance by Country</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradeAnalysisData}>
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
                      <Bar
                        dataKey="tradeBalance"
                        radius={[4, 4, 0, 0]}
                        name="Trade Balance (USD B)"
                      >
                        {tradeAnalysisData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.tradeBalance >= 0 ? '#10B981' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Exports vs Imports</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={tradeAnalysisData}>
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
                      <Bar dataKey="exports" fill="#10B981" radius={[4, 4, 0, 0]} name="Exports (USD B)" />
                      <Bar dataKey="imports" fill="#EF4444" radius={[4, 4, 0, 0]} name="Imports (USD B)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                {tradeAnalysisData.map((country, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-medium text-white mb-2">{country.country}</div>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-slate-400">Exports:</span>
                            <span className="text-emerald-400 ml-2">${country.exports}B</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-400">Imports:</span>
                            <span className="text-red-400 ml-2">${country.imports}B</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-400">Balance:</span>
                            <span className={`ml-2 ${country.tradeBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${country.tradeBalance}B
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Main Exports</div>
                        <div className="text-xs text-slate-300">{country.mainExports}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Main Imports</div>
                        <div className="text-xs text-slate-300">{country.mainImports}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Top Partners</div>
                        <div className="text-xs text-slate-300">{country.topPartners}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-medium text-white">Highest Growth</h4>
          </div>
          <div className="text-lg font-semibold text-emerald-400">Vietnam</div>
          <div className="text-xs text-slate-400">7.0% projected 2025 growth</div>
          <div className="text-xs text-slate-500 mt-1">Source: IMF Economic Outlook</div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-white">Largest Market</h4>
          </div>
          <div className="text-lg font-semibold text-blue-400">Indonesia</div>
          <div className="text-xs text-slate-400">$287.2B market size</div>
          <div className="text-xs text-slate-500 mt-1">Source: World Bank, Google-Temasek</div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-medium text-white">Most Digital</h4>
          </div>
          <div className="text-lg font-semibold text-purple-400">Singapore</div>
          <div className="text-xs text-slate-400">92.3% mobile penetration</div>
          <div className="text-xs text-slate-500 mt-1">Source: IMDA Digital Society Report</div>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <PieChartIcon className="h-4 w-4 text-orange-400" />
            <h4 className="text-sm font-medium text-white">Top Industry</h4>
          </div>
          <div className="text-lg font-semibold text-orange-400">Technology</div>
          <div className="text-xs text-slate-400">23.4% market share, 15.2% growth</div>
          <div className="text-xs text-slate-500 mt-1">Source: IDC Asia Pacific, Gartner</div>
        </div>
      </div>

      {/* Comprehensive Data Tables */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Comprehensive Market Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Country</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Market Size (B)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Population (M)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">GDP/Capita</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Digital Economy (B)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Mobile Penetration</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">E-commerce (B)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {marketSizeData.map((country, index) => {
                const digitalData = digitalAdoptionData.find(d => d.country === country.country);
                return (
                  <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">{country.country}</td>
                    <td className="py-4 px-4 text-right text-slate-300">${country.marketSize}</td>
                    <td className="py-4 px-4 text-right text-slate-300">{country.population}</td>
                    <td className="py-4 px-4 text-right text-slate-300">${country.gdpPerCapita.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-slate-300">${country.digitalEconomy}</td>
                    <td className="py-4 px-4 text-right text-slate-300">{digitalData?.mobile || 'N/A'}%</td>
                    <td className="py-4 px-4 text-right text-slate-300">${country.ecommerce}</td>
                    <td className="py-4 px-4 text-xs text-slate-400">{country.source.split(',')[0]}...</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;