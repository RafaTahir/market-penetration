import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import Header from './components/Header';
import CountrySelector from './components/CountrySelector';
import LiveMarketData from './components/LiveMarketData';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AIInsights from './components/AIInsights';
import ExportTools from './components/ExportTools';
import type { Country } from './types';

const COUNTRIES: Country[] = [
  {
    id: 'singapore',
    name: 'Singapore',
    flag: '🇸🇬',
    gdp: '$397B',
    population: '5.9M',
    growth: '+2.6%',
    currency: 'SGD',
    exchange: 'SGX'
  },
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    gdp: '$543B',
    population: '69.8M',
    growth: '+2.8%',
    currency: 'THB',
    exchange: 'SET'
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    flag: '🇮🇩',
    gdp: '$1.32T',
    population: '273.5M',
    growth: '+5.2%',
    currency: 'IDR',
    exchange: 'IDX'
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    gdp: '$432B',
    population: '32.7M',
    growth: '+4.5%',
    currency: 'MYR',
    exchange: 'KLSE'
  },
  {
    id: 'philippines',
    name: 'Philippines',
    flag: '🇵🇭',
    gdp: '$394B',
    population: '109.6M',
    growth: '+6.2%',
    currency: 'PHP',
    exchange: 'PSE'
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    gdp: '$409B',
    population: '97.3M',
    growth: '+6.8%',
    currency: 'VND',
    exchange: 'HOSE'
  }
];

function App() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['singapore', 'thailand']);

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8" id="market-overview">
          <div className="text-center py-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Southeast Asian Market Intelligence
              </h1>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Comprehensive market research and analysis for Southeast Asia. Make data-driven decisions with real-time insights, advanced analytics, and AI-powered recommendations.
              </p>
            </div>
          </div>

          <CountrySelector
            countries={COUNTRIES}
            selectedCountries={selectedCountries}
            onToggle={handleCountryToggle}
          />

          {selectedCountries.length > 0 ? (
            <div className="space-y-6">
              <LiveMarketData selectedCountries={selectedCountries} />

              <AnalyticsDashboard selectedCountries={selectedCountries} />

              <AIInsights selectedCountries={selectedCountries} />

              <ExportTools selectedCountries={selectedCountries} />
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-md mx-auto">
                <div className="text-slate-400 mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Select Markets to Begin</h3>
                <p className="text-slate-400 leading-relaxed">
                  Choose one or more Southeast Asian markets above to unlock detailed insights, comprehensive analytics, and AI-powered market intelligence.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-700/50 mt-16 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400">
            <p className="text-sm">
              © 2025 Flow Market Intelligence. Professional market research platform for Southeast Asian markets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
