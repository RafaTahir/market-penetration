import React, { useState } from 'react';
import { MapPin, Users, DollarSign, TrendingUp } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  flag: string;
  population: string;
  gdp: string;
  growth: string;
  digitalPenetration: number;
  marketSize: string;
}

const countries: Country[] = [
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    population: '69.8M',
    gdp: '$543B',
    growth: '+2.6%',
    digitalPenetration: 85,
    marketSize: '$127B'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    flag: '🇸🇬',
    population: '5.9M',
    gdp: '$397B',
    growth: '+3.6%',
    digitalPenetration: 92,
    marketSize: '$89B'
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    population: '32.7M',
    gdp: '$432B',
    growth: '+4.2%',
    digitalPenetration: 78,
    marketSize: '$98B'
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    flag: '🇮🇩',
    population: '273.5M',
    gdp: '$1.32T',
    growth: '+5.3%',
    digitalPenetration: 73,
    marketSize: '$287B'
  },
  {
    id: 'philippines',
    name: 'Philippines',
    flag: '🇵🇭',
    population: '109.6M',
    gdp: '$394B',
    growth: '+6.1%',
    digitalPenetration: 68,
    marketSize: '$156B'
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    population: '97.3M',
    gdp: '$409B',
    growth: '+7.1%',
    digitalPenetration: 75,
    marketSize: '$142B'
  }
];

interface CountrySelectorProps {
  selectedCountries: string[];
  onCountryToggle: (countryId: string) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountries, onCountryToggle }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Select Markets</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map((country) => (
          <div
            key={country.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedCountries.includes(country.id)
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
            }`}
            onClick={() => onCountryToggle(country.id)}
            onMouseEnter={() => setHoveredCountry(country.id)}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{country.flag}</span>
                <h3 className="font-medium text-white">{country.name}</h3>
              </div>
              {selectedCountries.includes(country.id) && (
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Population</span>
                </span>
                <span className="text-white font-medium">{country.population}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>GDP</span>
                </span>
                <span className="text-white font-medium">{country.gdp}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Growth</span>
                </span>
                <span className="text-emerald-400 font-medium">{country.growth}</span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Digital Penetration</span>
                  <span>{country.digitalPenetration}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${country.digitalPenetration}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {hoveredCountry === country.id && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Market: {country.marketSize}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountrySelector;