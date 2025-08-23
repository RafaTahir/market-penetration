import React, { useState } from 'react';
import { Factory, Smartphone, ShoppingCart, Building2, Car, Pill, TrendingUp, AlertTriangle } from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: React.ReactNode;
  marketSize: string;
  growth: number;
  competition: 'Low' | 'Medium' | 'High';
  opportunity: number;
  trends: string[];
}

const industries: Industry[] = [
  {
    id: 'technology',
    name: 'Technology & Software',
    icon: <Smartphone className="h-5 w-5" />,
    marketSize: '$89.2B',
    growth: 12.4,
    competition: 'High',
    opportunity: 85,
    trends: ['AI/ML adoption', 'Cloud migration', 'Mobile-first solutions']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & Retail',
    icon: <ShoppingCart className="h-5 w-5" />,
    marketSize: '$156.7B',
    growth: 18.6,
    competition: 'High',
    opportunity: 78,
    trends: ['Social commerce', 'Cross-border trade', 'Sustainability focus']
  },
  {
    id: 'fintech',
    name: 'Financial Services',
    icon: <Building2 className="h-5 w-5" />,
    marketSize: '$67.3B',
    growth: 15.2,
    competition: 'Medium',
    opportunity: 92,
    trends: ['Digital banking', 'Cryptocurrency', 'SME lending']
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: <Car className="h-5 w-5" />,
    marketSize: '$45.8B',
    growth: 8.3,
    competition: 'Medium',
    opportunity: 71,
    trends: ['Electric vehicles', 'Ride-sharing', 'Autonomous driving']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Pharma',
    icon: <Pill className="h-5 w-5" />,
    marketSize: '$78.4B',
    growth: 9.7,
    competition: 'Low',
    opportunity: 88,
    trends: ['Telemedicine', 'Digital therapeutics', 'Personalized medicine']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: <Factory className="h-5 w-5" />,
    marketSize: '$234.1B',
    growth: 6.8,
    competition: 'Medium',
    opportunity: 65,
    trends: ['Industry 4.0', 'Supply chain optimization', 'Green manufacturing']
  }
];

interface IndustryAnalysisProps {
  selectedCountries: string[];
  onIndustrySelect?: (industry: string) => void;
}

const IndustryAnalysis: React.FC<IndustryAnalysisProps> = ({ selectedCountries, onIndustrySelect }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('technology');

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    onIndustrySelect?.(industryId);
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low': return 'text-emerald-400 bg-emerald-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'High': return 'text-red-400 bg-red-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const selectedIndustryData = industries.find(ind => ind.id === selectedIndustry);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Factory className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Industry Analysis</h2>
        </div>
        <div className="text-sm text-slate-400">
          {selectedCountries.length} market{selectedCountries.length !== 1 ? 's' : ''} selected
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Industry Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Select Industry</h3>
          <div className="space-y-2">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => handleIndustrySelect(industry.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedIndustry === industry.id
                    ? 'border-emerald-500 bg-emerald-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded ${selectedIndustry === industry.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {industry.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{industry.name}</div>
                    <div className="text-xs text-slate-400">
                      {industry.growth}% growth • {industry.marketSize}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Industry Details */}
        <div className="lg:col-span-2">
          {selectedIndustryData && (
            <div className="space-y-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-900/20 rounded-lg text-emerald-400">
                    {selectedIndustryData.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedIndustryData.name}</h3>
                    <p className="text-sm text-slate-400">Market Analysis Overview</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{selectedIndustryData.marketSize}</div>
                    <div className="text-xs text-slate-400">Market Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">+{selectedIndustryData.growth}%</div>
                    <div className="text-xs text-slate-400">Annual Growth</div>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(selectedIndustryData.competition)}`}>
                      {selectedIndustryData.competition}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Competition</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedIndustryData.opportunity}</div>
                    <div className="text-xs text-slate-400">Opportunity Score</div>
                  </div>
                </div>
              </div>
              
              {/* Opportunity Score Visualization */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3">Market Opportunity Score</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Overall Opportunity</span>
                    <span className="text-white font-medium">{selectedIndustryData.opportunity}/100</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedIndustryData.opportunity}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Low Risk</span>
                    <span>High Potential</span>
                  </div>
                </div>
              </div>
              
              {/* Key Trends */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-medium text-white">Key Market Trends</h4>
                </div>
                <div className="space-y-2">
                  {selectedIndustryData.trends.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-slate-300">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Risk Assessment */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <h4 className="text-sm font-medium text-white">Risk Assessment</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Regulatory Risk</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i <= 2 ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Market Volatility</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-yellow-400' : 'bg-slate-600'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndustryAnalysis;