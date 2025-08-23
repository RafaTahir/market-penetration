import React, { useState } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface CaseStudy {
  id: string;
  company: string;
  industry: string;
  country: string;
  city: string;
  year: number;
  type: 'success' | 'failure';
  investment: string;
  outcome: string;
  keyFactors: string[];
  lessons: string[];
  marketStrategy: string;
  timeline: string;
  roi: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'grab-success',
    company: 'Grab',
    industry: 'Technology/Mobility',
    country: 'singapore',
    city: 'singapore-city',
    year: 2012,
    type: 'success',
    investment: '$12.7B',
    outcome: 'Market leader across 8 SEA countries',
    keyFactors: [
      'Localized approach to each market',
      'Strategic partnerships with local players',
      'Diversified service offerings beyond ride-hailing',
      'Strong government relations and regulatory compliance'
    ],
    lessons: [
      'Adapt global business models to local contexts',
      'Build ecosystem rather than single service',
      'Invest heavily in local talent and partnerships',
      'Regulatory compliance is crucial for long-term success'
    ],
    marketStrategy: 'City-by-city expansion with local partnerships',
    timeline: '10+ years of sustained growth',
    roi: '300%+ valuation increase'
  },
  {
    id: 'uber-failure',
    company: 'Uber',
    industry: 'Technology/Mobility',
    country: 'thailand',
    city: 'bangkok',
    year: 2014,
    type: 'failure',
    investment: '$2.1B',
    outcome: 'Sold operations to Grab in 2018',
    keyFactors: [
      'Regulatory challenges with local authorities',
      'Strong local competition from established players',
      'Limited understanding of local market dynamics',
      'High customer acquisition costs'
    ],
    lessons: [
      'Regulatory environment assessment is critical',
      'Local competition can be underestimated',
      'Cultural adaptation is essential for success',
      'First-mover advantage doesn\'t guarantee success'
    ],
    marketStrategy: 'Aggressive expansion without local adaptation',
    timeline: '4 years before exit',
    roi: 'Significant losses, strategic exit'
  },
  {
    id: 'shopee-success',
    company: 'Shopee',
    industry: 'E-commerce',
    country: 'indonesia',
    city: 'jakarta',
    year: 2015,
    type: 'success',
    investment: '$8.9B',
    outcome: 'Leading e-commerce platform in SEA',
    keyFactors: [
      'Mobile-first approach suited to market',
      'Gamification and social features',
      'Strong logistics network development',
      'Aggressive marketing and promotions'
    ],
    lessons: [
      'Mobile-first strategy essential in emerging markets',
      'Social commerce drives engagement',
      'Logistics infrastructure is competitive advantage',
      'Local marketing resonates better than global campaigns'
    ],
    marketStrategy: 'Mobile-first social commerce with local influencers',
    timeline: '6 years to market leadership',
    roi: '400%+ GMV growth annually'
  },
  {
    id: 'carrefour-failure',
    company: 'Carrefour',
    industry: 'Retail',
    country: 'malaysia',
    city: 'kuala-lumpur',
    year: 1994,
    type: 'failure',
    investment: '$1.2B',
    outcome: 'Exited Malaysian market in 2012',
    keyFactors: [
      'Failed to adapt to local shopping preferences',
      'Strong competition from local hypermarket chains',
      'High operational costs in prime locations',
      'Limited understanding of local consumer behavior'
    ],
    lessons: [
      'Local consumer preferences must drive store format',
      'Established local competitors have significant advantages',
      'Cost structure must be optimized for local market',
      'Cultural sensitivity in product selection is crucial'
    ],
    marketStrategy: 'European hypermarket format without localization',
    timeline: '18 years of declining performance',
    roi: 'Estimated 60% loss on investment'
  },
  {
    id: 'gojek-success',
    company: 'Gojek',
    industry: 'Technology/Super App',
    country: 'vietnam',
    city: 'ho-chi-minh',
    year: 2018,
    type: 'success',
    investment: '$2.5B',
    outcome: 'Major player in Vietnamese market',
    keyFactors: [
      'Leveraged existing Indonesian success model',
      'Partnered with local motorcycle taxi drivers',
      'Comprehensive service ecosystem approach',
      'Strong focus on financial inclusion'
    ],
    lessons: [
      'Proven business models can be replicated with adaptation',
      'Working with existing informal economy is effective',
      'Super app strategy creates user stickiness',
      'Financial services integration drives adoption'
    ],
    marketStrategy: 'Super app ecosystem with local driver partnerships',
    timeline: '3 years to significant market share',
    roi: '250% user growth year-over-year'
  },
  {
    id: 'tesco-failure',
    company: 'Tesco',
    industry: 'Retail',
    country: 'philippines',
    city: 'manila',
    year: 2001,
    type: 'failure',
    investment: '$800M',
    outcome: 'Sold operations to local retailer in 2020',
    keyFactors: [
      'Underestimated local retail competition',
      'Failed to achieve sufficient scale',
      'High real estate and operational costs',
      'Limited adaptation to local shopping habits'
    ],
    lessons: [
      'Scale is critical for retail success',
      'Local retail formats may be more efficient',
      'Real estate strategy must be cost-effective',
      'Understanding shopping frequency and basket size is key'
    ],
    marketStrategy: 'UK-style supermarket format with limited localization',
    timeline: '19 years of struggling performance',
    roi: 'Estimated 40% loss on total investment'
  }
];

interface CaseStudiesProps {
  selectedCountries: string[];
  onCaseStudySelect?: (caseId: string) => void;
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ selectedCountries, onCaseStudySelect }) => {
  const [selectedType, setSelectedType] = useState<'all' | 'success' | 'failure'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<string>(caseStudies[0].id);

  const handleCaseSelect = (caseId: string) => {
    setSelectedCase(caseId);
    onCaseStudySelect?.(caseId);
  };

  const filteredCases = caseStudies.filter(caseStudy => {
    const countryMatch = selectedCountries.includes(caseStudy.country);
    const typeMatch = selectedType === 'all' || caseStudy.type === selectedType;
    const industryMatch = selectedIndustry === 'all' || caseStudy.industry === selectedIndustry;
    return countryMatch && typeMatch && industryMatch;
  });

  const selectedCaseData = caseStudies.find(c => c.id === selectedCase);
  const industries = [...new Set(caseStudies.map(c => c.industry))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Market Entry Case Studies</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Outcome Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Cases</option>
              <option value="success">Success Stories</option>
              <option value="failure">Learning Cases</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-slate-400">
              Showing {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} 
              {selectedCountries.length > 0 && ` for ${selectedCountries.length} selected market${selectedCountries.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Study List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Select Case Study</h3>
            <div className="space-y-2">
              {filteredCases.map((caseStudy) => (
                <button
                  key={caseStudy.id}
                  onClick={() => handleCaseSelect(caseStudy.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedCase === caseStudy.id
                      ? 'border-amber-500 bg-amber-900/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded ${
                      caseStudy.type === 'success' 
                        ? 'bg-emerald-900/20 text-emerald-400' 
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                      {caseStudy.type === 'success' ? 
                        <CheckCircle className="h-4 w-4" /> : 
                        <AlertCircle className="h-4 w-4" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{caseStudy.company}</div>
                      <div className="text-xs text-slate-400 capitalize">
                        {caseStudy.country} • {caseStudy.year}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Case Study Details */}
        <div className="lg:col-span-2">
          {selectedCaseData && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedCaseData.type === 'success' 
                        ? 'bg-emerald-900/20 text-emerald-400' 
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                      {selectedCaseData.type === 'success' ? 
                        <TrendingUp className="h-5 w-5" /> : 
                        <TrendingDown className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedCaseData.company}</h3>
                      <p className="text-sm text-slate-400">
                        {selectedCaseData.industry} • {selectedCaseData.city}, {selectedCaseData.country}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCaseData.type === 'success' 
                      ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/50' 
                      : 'bg-red-900/20 text-red-400 border border-red-700/50'
                  }`}>
                    {selectedCaseData.type === 'success' ? 'Success Story' : 'Learning Case'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Investment</div>
                    <div className="text-lg font-semibold text-white">{selectedCaseData.investment}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Timeline</div>
                    <div className="text-lg font-semibold text-white">{selectedCaseData.timeline}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Year Started</div>
                    <div className="text-lg font-semibold text-white">{selectedCaseData.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">ROI/Outcome</div>
                    <div className={`text-lg font-semibold ${
                      selectedCaseData.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {selectedCaseData.roi}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Outcome</div>
                  <div className="text-white">{selectedCaseData.outcome}</div>
                </div>
              </div>

              {/* Key Factors */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-4 w-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-white">Key Success/Failure Factors</h4>
                </div>
                <div className="space-y-2">
                  {selectedCaseData.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                        selectedCaseData.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-sm text-slate-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-medium text-white">Key Lessons for Market Entry</h4>
                </div>
                <div className="space-y-2">
                  {selectedCaseData.lessons.map((lesson, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2"></div>
                      <span className="text-sm text-slate-300">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy Details */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-sm font-medium text-white mb-3">Market Entry Strategy</h4>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-300">{selectedCaseData.marketStrategy}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseStudies;