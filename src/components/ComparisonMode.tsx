import React, { useState } from 'react';
import { ArrowLeftRight, X, Plus, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface CountryData {
  name: string;
  gdp: number;
  population: number;
  growth: number;
  digitalAdoption: number;
  marketSize: number;
}

interface ComparisonModeProps {
  availableCountries: CountryData[];
}

const ComparisonMode: React.FC<ComparisonModeProps> = ({ availableCountries }) => {
  const [selectedCountries, setSelectedCountries] = useState<CountryData[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const addCountry = (country: CountryData) => {
    if (selectedCountries.length < 4 && !selectedCountries.find(c => c.name === country.name)) {
      setSelectedCountries([...selectedCountries, country]);
    }
    setIsSelecting(false);
  };

  const removeCountry = (countryName: string) => {
    setSelectedCountries(selectedCountries.filter(c => c.name !== countryName));
  };

  const metrics = [
    { key: 'gdp', label: 'GDP', icon: <DollarSign className="h-4 w-4" />, unit: 'B', color: 'blue' },
    { key: 'population', label: 'Population', icon: <Users className="h-4 w-4" />, unit: 'M', color: 'purple' },
    { key: 'growth', label: 'Growth Rate', icon: <TrendingUp className="h-4 w-4" />, unit: '%', color: 'emerald' },
    { key: 'marketSize', label: 'Market Size', icon: <DollarSign className="h-4 w-4" />, unit: 'B', color: 'orange' },
    { key: 'digitalAdoption', label: 'Digital Adoption', icon: <Activity className="h-4 w-4" />, unit: '%', color: 'cyan' }
  ];

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-900/20 border-blue-700/50',
      purple: 'text-purple-400 bg-purple-900/20 border-purple-700/50',
      emerald: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/50',
      orange: 'text-orange-400 bg-orange-900/20 border-orange-700/50',
      cyan: 'text-cyan-400 bg-cyan-900/20 border-cyan-700/50'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Side-by-Side Comparison</h2>
            <span className="text-sm text-slate-400">
              ({selectedCountries.length}/4 markets selected)
            </span>
          </div>
          {selectedCountries.length < 4 && (
            <button
              onClick={() => setIsSelecting(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Market</span>
            </button>
          )}
        </div>

        {selectedCountries.length === 0 ? (
          <div className="text-center py-12">
            <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No Markets Selected</h3>
            <p className="text-slate-400 mb-4">Add markets to begin side-by-side comparison</p>
            <button
              onClick={() => setIsSelecting(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Select Markets
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedCountries.map((country) => (
                <div key={country.name} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{country.name}</h3>
                    <button
                      onClick={() => removeCountry(country.name)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {metrics.map((metric) => (
                      <div key={metric.key} className="flex justify-between text-sm">
                        <span className="text-slate-400">{metric.label}</span>
                        <span className="text-white font-medium">
                          {country[metric.key as keyof CountryData]}{metric.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Metric Comparison</h3>
              {metrics.map((metric) => {
                const values = selectedCountries.map(c => c[metric.key as keyof CountryData] as number);
                const max = Math.max(...values);

                return (
                  <div key={metric.key} className={`border rounded-lg p-4 ${getColorClass(metric.color)}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      {metric.icon}
                      <h4 className="font-medium">{metric.label}</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedCountries.map((country) => {
                        const value = country[metric.key as keyof CountryData] as number;
                        const percentage = (value / max) * 100;

                        return (
                          <div key={country.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white">{country.name}</span>
                              <span className="font-medium">{value}{metric.unit}</span>
                            </div>
                            <div className="w-full bg-slate-800/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isSelecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Select Market to Compare</h3>
              <button
                onClick={() => setIsSelecting(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCountries
                .filter(c => !selectedCountries.find(sc => sc.name === c.name))
                .map((country) => (
                  <button
                    key={country.name}
                    onClick={() => addCountry(country)}
                    className="text-left bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg p-4 transition-all"
                  >
                    <h4 className="font-semibold text-white mb-2">{country.name}</h4>
                    <div className="space-y-1 text-sm text-slate-400">
                      <div>GDP: ${country.gdp}B</div>
                      <div>Population: {country.population}M</div>
                      <div>Growth: {country.growth}%</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonMode;
