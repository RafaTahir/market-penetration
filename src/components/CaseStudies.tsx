import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { CaseStudyService, EnhancedCaseStudy } from '../services/caseStudyService';

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  return `$${amount.toLocaleString()}`;
};

const formatROI = (roi: number): string => {
  if (roi >= 0) {
    return `+${roi}%`;
  }
  return `${roi}%`;
};

interface CaseStudiesProps {
  selectedCountries: string[];
  onCaseStudySelect?: (caseId: string) => void;
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ selectedCountries, onCaseStudySelect }) => {
  const [selectedType, setSelectedType] = useState<'all' | 'success' | 'failure' | 'ongoing'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [caseStudies, setCaseStudies] = useState<EnhancedCaseStudy[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCaseStudies = async () => {
      setLoading(true);
      const caseStudyService = CaseStudyService.getInstance();
      const studies = await caseStudyService.getCaseStudies();
      setCaseStudies(studies);
      if (studies.length > 0 && !selectedCase) {
        setSelectedCase(studies[0].companyName);
      }
      setLoading(false);
    };
    loadCaseStudies();
  }, []);

  const handleCaseSelect = (companyName: string) => {
    setSelectedCase(companyName);
    onCaseStudySelect?.(companyName);
  };

  const filteredCases = caseStudies.filter(caseStudy => {
    const countryMatch = selectedCountries.length === 0 ||
      selectedCountries.some(c => c.toLowerCase() === caseStudy.country.toLowerCase());
    const typeMatch = selectedType === 'all' || caseStudy.caseType === selectedType;
    const industryMatch = selectedIndustry === 'all' || caseStudy.industry === selectedIndustry;
    return countryMatch && typeMatch && industryMatch;
  });

  const selectedCaseData = caseStudies.find(c => c.companyName === selectedCase);
  const industries = [...new Set(caseStudies.map(c => c.industry))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400">Loading case studies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <option value="ongoing">Ongoing Cases</option>
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
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Select Case Study</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCases.map((caseStudy) => {
                const getTypeColor = (type: string) => {
                  if (type === 'success') return { bg: 'bg-emerald-900/20', text: 'text-emerald-400' };
                  if (type === 'failure') return { bg: 'bg-red-900/20', text: 'text-red-400' };
                  return { bg: 'bg-blue-900/20', text: 'text-blue-400' };
                };
                const colors = getTypeColor(caseStudy.caseType);

                return (
                  <button
                    key={caseStudy.companyName}
                    onClick={() => handleCaseSelect(caseStudy.companyName)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedCase === caseStudy.companyName
                        ? 'border-amber-500 bg-amber-900/20 text-white'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded ${colors.bg} ${colors.text}`}>
                        {caseStudy.caseType === 'success' ?
                          <CheckCircle className="h-4 w-4" /> :
                          caseStudy.caseType === 'failure' ?
                          <AlertCircle className="h-4 w-4" /> :
                          <TrendingUp className="h-4 w-4" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{caseStudy.companyName}</div>
                        <div className="text-xs text-slate-400 capitalize">
                          {caseStudy.country} • {caseStudy.entryYear}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCaseData && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedCaseData.caseType === 'success'
                        ? 'bg-emerald-900/20 text-emerald-400'
                        : selectedCaseData.caseType === 'failure'
                        ? 'bg-red-900/20 text-red-400'
                        : 'bg-blue-900/20 text-blue-400'
                    }`}>
                      {selectedCaseData.caseType === 'success' ?
                        <TrendingUp className="h-5 w-5" /> :
                        selectedCaseData.caseType === 'failure' ?
                        <TrendingDown className="h-5 w-5" /> :
                        <Target className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedCaseData.companyName}</h3>
                      <p className="text-sm text-slate-400 capitalize">
                        {selectedCaseData.industry} • {selectedCaseData.city}, {selectedCaseData.country}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCaseData.caseType === 'success'
                      ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/50'
                      : selectedCaseData.caseType === 'failure'
                      ? 'bg-red-900/20 text-red-400 border border-red-700/50'
                      : 'bg-blue-900/20 text-blue-400 border border-blue-700/50'
                  }`}>
                    {selectedCaseData.caseType === 'success' ? 'Success Story' :
                     selectedCaseData.caseType === 'failure' ? 'Learning Case' : 'Ongoing'}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Investment</div>
                    <div className="text-lg font-semibold text-white">{formatCurrency(selectedCaseData.investmentAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Entry Year</div>
                    <div className="text-lg font-semibold text-white">{selectedCaseData.entryYear}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">ROI</div>
                    <div className={`text-lg font-semibold ${
                      selectedCaseData.roiPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatROI(selectedCaseData.roiPercentage)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Outcome</div>
                  <div className="text-white">{selectedCaseData.outcomeDescription}</div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-4 w-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-white">Key Success/Failure Factors</h4>
                </div>
                <div className="space-y-2">
                  {selectedCaseData.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                        selectedCaseData.caseType === 'success' ? 'bg-emerald-400' :
                        selectedCaseData.caseType === 'failure' ? 'bg-red-400' : 'bg-blue-400'
                      }`}></div>
                      <span className="text-sm text-slate-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-medium text-white">Key Lessons for Market Entry</h4>
                </div>
                <div className="space-y-2">
                  {selectedCaseData.lessonsLearned.map((lesson, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2"></div>
                      <span className="text-sm text-slate-300">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-sm font-medium text-white mb-3">Market Entry Strategy</h4>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-300">{selectedCaseData.marketStrategy}</p>
                </div>
              </div>

              {selectedCaseData.dataSources && selectedCaseData.dataSources.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    <h4 className="text-sm font-medium text-white">Data Sources</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCaseData.dataSources.map((source, index) => (
                      <div key={index} className="flex items-start justify-between p-2 bg-slate-700/30 rounded">
                        <div className="flex-1">
                          <div className="text-sm text-slate-300">{source.source}</div>
                          <div className="text-xs text-slate-500">{source.date}</div>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 ml-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseStudies;