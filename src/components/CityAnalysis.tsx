import React, { useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp, MapPin, Wifi, Car, Home } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
  population: string;
  gdpPerCapita: string;
  businessDistricts: string[];
  digitalInfrastructure: number;
  costOfLiving: 'Low' | 'Medium' | 'High';
  businessEnvironment: number;
  keyIndustries: string[];
  marketOpportunities: string[];
  challenges: string[];
}

const cities: City[] = [
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'thailand',
    population: '10.7M',
    gdpPerCapita: '$7,800',
    businessDistricts: ['Silom', 'Sathorn', 'Sukhumvit', 'Ratchadaphisek'],
    digitalInfrastructure: 85,
    costOfLiving: 'Medium',
    businessEnvironment: 78,
    keyIndustries: ['Tourism', 'Manufacturing', 'Financial Services', 'Technology'],
    marketOpportunities: ['Digital payments', 'E-commerce logistics', 'Smart city solutions'],
    challenges: ['Traffic congestion', 'Air pollution', 'Regulatory complexity']
  },
  {
    id: 'singapore-city',
    name: 'Singapore',
    country: 'singapore',
    population: '5.9M',
    gdpPerCapita: '$65,200',
    businessDistricts: ['CBD', 'Marina Bay', 'Orchard', 'Jurong East'],
    digitalInfrastructure: 95,
    costOfLiving: 'High',
    businessEnvironment: 95,
    keyIndustries: ['Financial Services', 'Technology', 'Logistics', 'Biotech'],
    marketOpportunities: ['Fintech innovation', 'Sustainable technology', 'Regional headquarters'],
    challenges: ['High operational costs', 'Talent competition', 'Limited domestic market']
  },
  {
    id: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    country: 'malaysia',
    population: '7.9M',
    gdpPerCapita: '$11,200',
    businessDistricts: ['KLCC', 'Bangsar', 'Mont Kiara', 'Cyberjaya'],
    digitalInfrastructure: 82,
    costOfLiving: 'Medium',
    businessEnvironment: 73,
    keyIndustries: ['Palm Oil', 'Technology', 'Islamic Finance', 'Manufacturing'],
    marketOpportunities: ['Islamic fintech', 'Halal products', 'Digital transformation'],
    challenges: ['Political stability', 'Skills gap', 'Infrastructure development']
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'indonesia',
    population: '34.5M',
    gdpPerCapita: '$4,200',
    businessDistricts: ['Sudirman', 'Kuningan', 'Senayan', 'Kelapa Gading'],
    digitalInfrastructure: 75,
    costOfLiving: 'Low',
    businessEnvironment: 68,
    keyIndustries: ['Manufacturing', 'Agriculture', 'Mining', 'Technology'],
    marketOpportunities: ['Mobile commerce', 'Digital banking', 'Logistics solutions'],
    challenges: ['Infrastructure gaps', 'Regulatory hurdles', 'Traffic congestion']
  },
  {
    id: 'manila',
    name: 'Manila',
    country: 'philippines',
    population: '25.0M',
    gdpPerCapita: '$3,500',
    businessDistricts: ['Makati', 'BGC', 'Ortigas', 'Alabang'],
    digitalInfrastructure: 72,
    costOfLiving: 'Low',
    businessEnvironment: 65,
    keyIndustries: ['BPO', 'Manufacturing', 'Agriculture', 'Tourism'],
    marketOpportunities: ['Digital services', 'Remittance solutions', 'E-commerce'],
    challenges: ['Infrastructure quality', 'Natural disasters', 'Regulatory complexity']
  },
  {
    id: 'ho-chi-minh',
    name: 'Ho Chi Minh City',
    country: 'vietnam',
    population: '13.3M',
    gdpPerCapita: '$4,100',
    businessDistricts: ['District 1', 'District 3', 'Binh Thanh', 'Thu Duc'],
    digitalInfrastructure: 78,
    costOfLiving: 'Low',
    businessEnvironment: 70,
    keyIndustries: ['Manufacturing', 'Technology', 'Textiles', 'Agriculture'],
    marketOpportunities: ['Manufacturing hub', 'Tech outsourcing', 'Consumer goods'],
    challenges: ['Infrastructure development', 'Skills training', 'Environmental concerns']
  }
];

interface CityAnalysisProps {
  selectedCountries: string[];
  selectedCities: string[];
  onCityToggle: (cityId: string) => void;
}

const CityAnalysis: React.FC<CityAnalysisProps> = ({ selectedCountries, selectedCities, onCityToggle }) => {
  const [selectedCity, setSelectedCity] = useState<string>('singapore-city');

  const availableCities = cities.filter(city => selectedCountries.includes(city.country));
  const selectedCityData = cities.find(city => city.id === selectedCity);

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Low': return 'text-emerald-400 bg-emerald-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'High': return 'text-red-400 bg-red-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* City Selection Grid */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <Building2 className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Major Cities Analysis</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCities.map((city) => (
            <div
              key={city.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedCities.includes(city.id)
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
              onClick={() => {
                onCityToggle(city.id);
                setSelectedCity(city.id);
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{city.name}</h3>
                  <p className="text-sm text-slate-400 capitalize">{city.country}</p>
                </div>
                {selectedCities.includes(city.id) && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Population</span>
                  </span>
                  <span className="text-white font-medium">{city.population}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>GDP/Capita</span>
                  </span>
                  <span className="text-white font-medium">{city.gdpPerCapita}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Business Environment</span>
                    <span>{city.businessEnvironment}/100</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${city.businessEnvironment}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed City Analysis */}
      {selectedCityData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* City Overview */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedCityData.name}</h3>
                <p className="text-sm text-slate-400 capitalize">
                  {selectedCityData.country} • {selectedCityData.population} residents
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Wifi className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Digital Infrastructure</span>
                </div>
                <div className="text-lg font-semibold text-white">{selectedCityData.digitalInfrastructure}%</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Home className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-slate-400">Cost of Living</span>
                </div>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCostColor(selectedCityData.costOfLiving)}`}>
                  {selectedCityData.costOfLiving}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Business Districts</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCityData.businessDistricts.map((district, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                      {district}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Key Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCityData.keyIndustries.map((industry, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs rounded-full border border-purple-700/50">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Opportunities & Challenges */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-medium text-white">Market Opportunities</h4>
              </div>
              <div className="space-y-2">
                {selectedCityData.marketOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-4 w-4 text-red-400" />
                <h4 className="text-sm font-medium text-white">Key Challenges</h4>
              </div>
              <div className="space-y-2">
                {selectedCityData.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">{challenge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityAnalysis;