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
                  <MarketInsights selectedCountries={selectedCountries} />
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