import React from 'react';
import { Globe } from 'lucide-react';
import type { Country } from '../types';

interface CountrySelectorProps {
  countries: Country[];
  selectedCountries: string[];
  onToggle: (countryId: string) => void;
}

export default function CountrySelector({ countries, selectedCountries, onToggle }: CountrySelectorProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Globe className="h-5 w-5 text-blue-400" />
        <span>Select Markets</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => onToggle(country.id)}
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
              <div>Pop: <span className="text-slate-300">{country.population}</span></div>
              <div>Growth: <span className="text-emerald-400">{country.growth}</span></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
