import React, { useState } from 'react';
import Header from './components/Header';
import LiveMarketData from './components/LiveMarketData';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CountrySelector from './components/CountrySelector';
import CityAnalysis from './components/CityAnalysis';
import IndustryAnalysis from './components/IndustryAnalysis';
import MarketInsights from './components/MarketInsights';
import CaseStudies from './components/CaseStudies';
import ExportTools from './components/ExportTools';
import DataVisualization from './components/DataVisualization';

function App() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['singapore', 'thailand']);
  const [selectedCities, setSelectedCities] = useState<string[]>(['singapore-city', 'bangkok']);
  const [activeTab, setActiveTab] = useState<'overview' | 'cities' | 'industries' | 'insights' | 'cases' | 'data'>('overview');
  const [currentView, setCurrentView] = useState<'main' | 'live-data' | 'analytics'>('main');

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handleCityToggle = (cityId: string) => {
    setSelectedCities(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  if (currentView === 'live-data') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header 
          onLiveDataClick={() => setCurrentView('main')}
          onAnalyticsClick={() => setCurrentView('analytics')}
        />
        <LiveMarketData />
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header 
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('main')}
        />
        <AnalyticsDashboard />
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }
  const tabs = [
    { id: 'overview', name: 'Market Overview', icon: '🌏' },
    { id: 'cities', name: 'City Analysis', icon: '🏙️' },
    { id: 'industries', name: 'Industry Deep Dive', icon: '🏭' },
    { id: 'insights', name: 'Market Intelligence', icon: '📊' },
    { id: 'cases', name: 'Case Studies', icon: '📚' },
    { id: 'data', name: 'Data Visualization', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header 
        onLiveDataClick={() => setCurrentView('live-data')}
        onAnalyticsClick={() => setCurrentView('analytics')}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center py-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <svg className="h-16 w-16 mr-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#flowGradient)" opacity="0.1" />
                  <path d="M25 35 Q50 15 75 35 Q50 55 25 35" fill="url(#flowGradient)" opacity="0.8" />
                  <path d="M25 50 Q50 30 75 50 Q50 70 25 50" fill="url(#flowGradient)" opacity="0.6" />
                  <path d="M25 65 Q50 45 75 65 Q50 85 25 65" fill="url(#flowGradient)" opacity="0.4" />
                  <circle cx="25" cy="50" r="3" fill="#3B82F6" />
                  <circle cx="75" cy="50" r="3" fill="#8B5CF6" />
                </svg>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  Flow
                </h1>
              </div>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Your guide to Penetrating Markets. Comprehensive market research and analysis for Southeast Asia. 
                Make data-driven decisions with city-level insights, industry analysis, and real market entry case studies.
              </p>
            </div>
          </div>
          
          {/* Country Selection */}
          <CountrySelector 
            selectedCountries={selectedCountries}
            onCountryToggle={handleCountryToggle}
          />
          
          {selectedCountries.length > 0 && (
            <>
              {/* Navigation Tabs */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="text-sm">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Market Size Overview */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-2 mb-6">
                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-white">Market Overview</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-sm font-medium text-blue-400">Total Market Size</span>
                          </div>
                          <div className="text-2xl font-bold text-white">$1.2T</div>
                          <div className="text-xs text-slate-400">Combined addressable market</div>
                          <div className="text-xs text-slate-500 mt-1">Source: World Bank, IMF 2024</div>
                        </div>
                        
                        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-sm font-medium text-emerald-400">Average Growth</span>
                          </div>
                          <div className="text-2xl font-bold text-white">+4.7%</div>
                          <div className="text-xs text-slate-400">Regional GDP growth 2024</div>
                          <div className="text-xs text-slate-500 mt-1">Source: IMF Economic Outlook</div>
                        </div>
                        
                        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium text-purple-400">Total Population</span>
                          </div>
                          <div className="text-2xl font-bold text-white">688M</div>
                          <div className="text-xs text-slate-400">Combined population</div>
                          <div className="text-xs text-slate-500 mt-1">Source: UN Population Division</div>
                        </div>
                        
                        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-orange-400">Digital Users</span>
                          </div>
                          <div className="text-2xl font-bold text-white">456M</div>
                          <div className="text-xs text-slate-400">Active internet users</div>
                          <div className="text-xs text-slate-500 mt-1">Source: We Are Social 2024</div>
                        </div>
                      </div>
                      
                      {/* Country Comparison Table */}
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-4">Market Comparison by Country</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Country</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Population</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">GDP (USD)</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Growth Rate</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Market Size</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                              {selectedCountries.length > 0 ? 
                                selectedCountries.map((country) => {
                                  const countryData = {
                                    indonesia: { pop: '273.5M', gdp: '$1.32T', growth: '+5.2%', market: '$287B' },
                                    thailand: { pop: '69.8M', gdp: '$543B', growth: '+2.8%', market: '$127B' },
                                    singapore: { pop: '5.9M', gdp: '$397B', growth: '+2.6%', market: '$89B' },
                                    malaysia: { pop: '32.7M', gdp: '$432B', growth: '+4.5%', market: '$98B' },
                                    philippines: { pop: '109.6M', gdp: '$394B', growth: '+6.2%', market: '$156B' },
                                    vietnam: { pop: '97.3M', gdp: '$409B', growth: '+6.8%', market: '$142B' }
                                  }[country as keyof typeof countryData];
                                  
                                  return (
                                    <tr key={country} className="hover:bg-slate-600/30">
                                      <td className="py-2 px-3 text-sm text-white capitalize">{country}</td>
                                      <td className="py-2 px-3 text-sm text-slate-300 text-right">{countryData?.pop}</td>
                                      <td className="py-2 px-3 text-sm text-slate-300 text-right">{countryData?.gdp}</td>
                                      <td className="py-2 px-3 text-sm text-emerald-400 text-right">{countryData?.growth}</td>
                                      <td className="py-2 px-3 text-sm text-blue-400 text-right">{countryData?.market}</td>
                                    </tr>
                                  );
                                }) :
                                [
                                  { name: 'Indonesia', pop: '273.5M', gdp: '$1.32T', growth: '+5.2%', market: '$287B' },
                                  { name: 'Thailand', pop: '69.8M', gdp: '$543B', growth: '+2.8%', market: '$127B' },
                                  { name: 'Singapore', pop: '5.9M', gdp: '$397B', growth: '+2.6%', market: '$89B' },
                                  { name: 'Malaysia', pop: '32.7M', gdp: '$432B', growth: '+4.5%', market: '$98B' },
                                  { name: 'Philippines', pop: '109.6M', gdp: '$394B', growth: '+6.2%', market: '$156B' },
                                  { name: 'Vietnam', pop: '97.3M', gdp: '$409B', growth: '+6.8%', market: '$142B' }
                                ].map((country, index) => (
                                  <tr key={index} className="hover:bg-slate-600/30">
                                    <td className="py-2 px-3 text-sm text-white">{country.name}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300 text-right">{country.pop}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300 text-right">{country.gdp}</td>
                                    <td className="py-2 px-3 text-sm text-emerald-400 text-right">{country.growth}</td>
                                    <td className="py-2 px-3 text-sm text-blue-400 text-right">{country.market}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Source: World Bank, IMF Economic Outlook 2024, National Statistical Offices
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Entry Recommendations */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-2 mb-6">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">Strategic Market Entry Framework</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <h4 className="font-medium text-emerald-400">Phase 1: Foundation (0-6 months)</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Market research and regulatory assessment</li>
                            <li>• Local partnership identification</li>
                            <li>• Digital presence establishment</li>
                            <li>• Cultural localization strategy</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <h4 className="font-medium text-blue-400">Phase 2: Launch (6-18 months)</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Pilot programs in tier-1 cities</li>
                            <li>• Customer service infrastructure</li>
                            <li>• Localized product offerings</li>
                            <li>• Digital marketing campaigns</li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <h4 className="font-medium text-purple-400">Phase 3: Scale (18+ months)</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Multi-market expansion</li>
                            <li>• Regional operations setup</li>
                            <li>• Supply chain optimization</li>
                            <li>• Strategic acquisitions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'cities' && (
                  <CityAnalysis 
                    selectedCountries={selectedCountries}
                    selectedCities={selectedCities}
                    onCityToggle={handleCityToggle}
                  />
                )}
                
                {activeTab === 'industries' && (
                  <IndustryAnalysis selectedCountries={selectedCountries} />
                )}
                
                {activeTab === 'insights' && (
                  <MarketInsights selectedCountries={selectedCountries} />
                )}
                
                {activeTab === 'cases' && (
                  <CaseStudies selectedCountries={selectedCountries} />
                )}
                
                {activeTab === 'data' && (
                  <DataVisualization selectedCountries={selectedCountries} />
                )}
              </div>
              
              {/* Export Tools */}
              <ExportTools 
                selectedCountries={selectedCountries}
                selectedCities={selectedCities}
                activeTab={activeTab}
              />
            </>
          )}
          
          {selectedCountries.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-md mx-auto">
                <div className="text-slate-400 mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Select Markets to Begin</h3>
                <p className="text-slate-400 leading-relaxed">
                  Choose one or more Southeast Asian markets above to unlock detailed insights, 
                  city-level analysis, and comprehensive market intelligence.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400">
            <p className="text-sm">
              © 2025 SEA Market Intel. Professional market research platform for Southeast Asian markets.
            </p>
            <p className="text-xs mt-2 opacity-75">
              Data updated in real-time • Powered by advanced analytics • Trusted by leading enterprises
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;