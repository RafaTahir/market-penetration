import React, { useState } from 'react';
import { Globe, TrendingUp, BarChart3, Building2, Lightbulb, BookOpen, LineChart } from 'lucide-react';

function App() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['singapore', 'thailand']);

  const countries = [
    { id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', gdp: '$1.32T', pop: '273.5M', growth: '+5.2%' },
    { id: 'thailand', name: 'Thailand', flag: '🇹🇭', gdp: '$543B', pop: '69.8M', growth: '+2.8%' },
    { id: 'singapore', name: 'Singapore', flag: '🇸🇬', gdp: '$397B', pop: '5.9M', growth: '+2.6%' },
    { id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', gdp: '$432B', pop: '32.7M', growth: '+4.5%' },
    { id: 'philippines', name: 'Philippines', flag: '🇵🇭', gdp: '$394B', pop: '109.6M', growth: '+6.2%' },
    { id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', gdp: '$409B', pop: '97.3M', growth: '+6.8%' }
  ];

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <svg className="h-10 w-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                </svg>
                <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  Flow
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm rounded-full font-medium">
                Market Intelligence Platform
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center py-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Southeast Asian Market Intelligence
              </h1>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Comprehensive market research and analysis for Southeast Asia. Make data-driven decisions with real-time insights.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-400" />
              <span>Select Markets</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {countries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountryToggle(country.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedCountries.includes(country.id)
                      ? 'border-emerald-500 bg-emerald-900/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{country.flag}</span>
                    {selectedCountries.includes(country.id) && (
                      <span className="text-emerald-400">✓</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{country.name}</h3>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div>GDP: <span className="text-slate-300">{country.gdp}</span></div>
                    <div>Pop: <span className="text-slate-300">{country.pop}</span></div>
                    <div>Growth: <span className="text-emerald-400">{country.growth}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedCountries.length > 0 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <span>Market Overview</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="text-sm text-blue-400 mb-2">Total Market Size</div>
                    <div className="text-2xl font-bold text-white">$1.2T</div>
                    <div className="text-xs text-slate-400">Combined addressable market</div>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                    <div className="text-sm text-emerald-400 mb-2">Average Growth</div>
                    <div className="text-2xl font-bold text-white">+4.7%</div>
                    <div className="text-xs text-slate-400">Regional GDP growth</div>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                    <div className="text-sm text-purple-400 mb-2">Total Population</div>
                    <div className="text-2xl font-bold text-white">688M</div>
                    <div className="text-xs text-slate-400">Combined population</div>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                    <div className="text-sm text-orange-400 mb-2">Digital Users</div>
                    <div className="text-2xl font-bold text-white">456M</div>
                    <div className="text-xs text-slate-400">Active internet users</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">Selected Markets Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Country</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Population</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">GDP</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Growth Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                      {selectedCountries.map((id) => {
                        const country = countries.find(c => c.id === id);
                        return country ? (
                          <tr key={id} className="hover:bg-slate-600/30">
                            <td className="py-2 px-3 text-sm text-white flex items-center space-x-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </td>
                            <td className="py-2 px-3 text-sm text-slate-300 text-right">{country.pop}</td>
                            <td className="py-2 px-3 text-sm text-slate-300 text-right">{country.gdp}</td>
                            <td className="py-2 px-3 text-sm text-emerald-400 text-right">{country.growth}</td>
                          </tr>
                        ) : null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-blue-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Coming Soon</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-sm text-slate-300">AI Recommendations</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                    <div className="text-sm text-slate-300">Competitor Analysis</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-sm text-slate-300">Investment Ops</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <LineChart className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                    <div className="text-sm text-slate-300">Live Market Data</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCountries.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-md mx-auto">
                <div className="text-slate-400 mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Select Markets to Begin</h3>
                <p className="text-slate-400 leading-relaxed">
                  Choose one or more Southeast Asian markets above to unlock detailed insights and comprehensive market intelligence.
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
