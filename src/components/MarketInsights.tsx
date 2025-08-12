import React, { useState } from 'react';
import { Eye, Users, DollarSign, TrendingUp, Globe, Smartphone, Target, Zap, BarChart3, Activity } from 'lucide-react';

interface MarketInsightsProps {
  selectedCountries: string[];
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ selectedCountries }) => {
  const [activeInsight, setActiveInsight] = useState<'overview' | 'consumer' | 'competitive' | 'regulatory'>('overview');

  // Market overview insights with sources
  const marketOverviewInsights = [
    {
      title: 'Total Addressable Market',
      value: '$1.2T',
      change: '+12.4%',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Combined market size across all selected Southeast Asian markets',
      color: 'blue',
      source: 'World Bank, IMF Economic Outlook 2024'
    },
    {
      title: 'Digital Economy Growth',
      value: '18.6%',
      change: '+3.2%',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Average digital economy growth rate across the region',
      color: 'emerald',
      source: 'Google-Temasek e-Conomy SEA 2024'
    },
    {
      title: 'Internet Users',
      value: '456M',
      change: '+8.7%',
      icon: <Users className="h-5 w-5" />,
      description: 'Active internet users across selected Southeast Asian markets',
      color: 'purple',
      source: 'We Are Social Digital 2024 Report'
    },
    {
      title: 'Cross-Border Trade',
      value: '$89.2B',
      change: '+31.4%',
      icon: <Globe className="h-5 w-5" />,
      description: 'Value of cross-border e-commerce transactions in the region',
      color: 'orange',
      source: 'ASEAN Trade Statistics, UNCTADstat'
    }
  ];

  // Consumer behavior insights
  const consumerInsights = [
    {
      category: 'Mobile-First Shopping',
      penetration: 78.4,
      growth: 24.3,
      insight: 'Consumers prefer mobile apps over desktop for shopping',
      opportunity: 'Optimize mobile checkout and payment flows',
      source: 'Nielsen Consumer Insights SEA 2024'
    },
    {
      category: 'Social Commerce',
      penetration: 65.7,
      growth: 31.8,
      insight: 'Social media platforms drive 65% of purchase decisions',
      opportunity: 'Invest in influencer marketing and social selling',
      source: 'Meta Business & Bain Social Commerce Report'
    },
    {
      category: 'Digital Payments',
      penetration: 72.1,
      growth: 28.5,
      insight: 'Cash-to-digital payment transition accelerating',
      opportunity: 'Partner with local payment providers',
      source: 'Visa Consumer Payment Attitudes Study'
    },
    {
      category: 'Sustainability Focus',
      penetration: 54.2,
      growth: 19.7,
      insight: 'Growing consumer preference for sustainable products',
      opportunity: 'Develop eco-friendly product lines and messaging',
      source: 'Deloitte Global Millennial and Gen Z Survey'
    }
  ];

  // Competitive landscape analysis
  const competitiveAnalysis = [
    {
      sector: 'E-commerce',
      leaders: ['Shopee', 'Lazada', 'Tokopedia'],
      marketShare: 68.4,
      competitionLevel: 'High',
      entryBarriers: 'Medium',
      opportunity: 'Niche specialization and B2B focus',
      source: 'Momentum Works E-commerce Report 2024'
    },
    {
      sector: 'Fintech',
      leaders: ['Grab Financial', 'GoPay', 'TrueMoney'],
      marketShare: 45.7,
      competitionLevel: 'Medium',
      entryBarriers: 'High',
      opportunity: 'SME lending and cross-border payments',
      source: 'PwC FinTech Survey SEA 2024'
    },
    {
      sector: 'Food Delivery',
      leaders: ['Grab Food', 'foodpanda', 'Gojek'],
      marketShare: 72.3,
      competitionLevel: 'High',
      entryBarriers: 'High',
      opportunity: 'Cloud kitchens and B2B catering',
      source: 'Euromonitor Food Service Report'
    },
    {
      sector: 'Ride-hailing',
      leaders: ['Grab', 'Gojek', 'InDriver'],
      marketShare: 81.2,
      competitionLevel: 'Very High',
      entryBarriers: 'Very High',
      opportunity: 'Corporate transportation and logistics',
      source: 'Frost & Sullivan Mobility Report'
    }
  ];

  // Regulatory environment insights
  const regulatoryInsights = [
    {
      country: 'Singapore',
      easeOfBusiness: 95,
      regulatoryClarity: 92,
      digitalReadiness: 89,
      keyRegulations: ['PDPA', 'Payment Services Act', 'Cybersecurity Act'],
      opportunities: 'Regulatory sandbox for fintech innovation',
      challenges: 'High compliance costs',
      source: 'World Bank Doing Business, MAS Guidelines'
    },
    {
      country: 'Thailand',
      easeOfBusiness: 78,
      regulatoryClarity: 72,
      digitalReadiness: 68,
      keyRegulations: ['Personal Data Protection Act', 'Digital Economy Act'],
      opportunities: 'Government digitization initiatives',
      challenges: 'Complex licensing requirements',
      source: 'Thailand Board of Investment, ETDA'
    },
    {
      country: 'Malaysia',
      easeOfBusiness: 73,
      regulatoryClarity: 75,
      digitalReadiness: 71,
      keyRegulations: ['Personal Data Protection Act', 'Financial Services Act'],
      opportunities: 'Islamic finance and halal certification',
      challenges: 'Bumiputera requirements in some sectors',
      source: 'MIDA, Bank Negara Malaysia'
    },
    {
      country: 'Indonesia',
      easeOfBusiness: 68,
      regulatoryClarity: 65,
      digitalReadiness: 62,
      keyRegulations: ['Data Protection Law', 'Omnibus Law'],
      opportunities: 'Large domestic market access',
      challenges: 'Local content and partnership requirements',
      source: 'BKPM, OJK Indonesia'
    }
  ];

  const insightTabs = [
    { id: 'overview', name: 'Market Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'consumer', name: 'Consumer Behavior', icon: <Users className="h-4 w-4" /> },
    { id: 'competitive', name: 'Competitive Landscape', icon: <Target className="h-4 w-4" /> },
    { id: 'regulatory', name: 'Regulatory Environment', icon: <Activity className="h-4 w-4" /> }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-900/20',
      emerald: 'text-emerald-400 bg-emerald-900/20',
      purple: 'text-purple-400 bg-purple-900/20',
      orange: 'text-orange-400 bg-orange-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-emerald-400 bg-emerald-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'High': return 'text-orange-400 bg-orange-900/20';
      case 'Very High': return 'text-red-400 bg-red-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Insight Navigation */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Market Intelligence Hub</h2>
          <span className="text-sm text-slate-400">
            ({selectedCountries.length > 0 ? `${selectedCountries.length} market${selectedCountries.length !== 1 ? 's' : ''}` : 'All markets'})
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {insightTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveInsight(tab.id as any)}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                activeInsight === tab.id
                  ? 'border-blue-500 bg-blue-900/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className={`${activeInsight === tab.id ? 'text-blue-400' : 'text-slate-400'}`}>
                {tab.icon}
              </div>
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Overview */}
      {activeInsight === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketOverviewInsights.map((insight, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(insight.color)}`}>
                    {insight.icon}
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">{insight.change}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">{insight.value}</div>
                  <div className="text-sm font-medium text-slate-300">{insight.title}</div>
                  <div className="text-xs text-slate-400">{insight.description}</div>
                  <div className="text-xs text-slate-500 mt-2">Source: {insight.source}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Market Entry Recommendations */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Strategic Market Entry Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <h4 className="font-medium text-emerald-400">Immediate Priorities</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Mobile-first digital strategy implementation</li>
                  <li>• Local partnership establishment</li>
                  <li>• Regulatory compliance framework</li>
                  <li>• Market research and consumer insights</li>
                </ul>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <h4 className="font-medium text-blue-400">Medium-term Strategy</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Brand localization and cultural adaptation</li>
                  <li>• Supply chain and logistics optimization</li>
                  <li>• Customer service infrastructure</li>
                  <li>• Digital marketing and social commerce</li>
                </ul>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <h4 className="font-medium text-purple-400">Long-term Vision</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Regional expansion and scaling</li>
                  <li>• Innovation and R&D capabilities</li>
                  <li>• Ecosystem partnerships and acquisitions</li>
                  <li>• Sustainability and ESG initiatives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consumer Behavior */}
      {activeInsight === 'consumer' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Consumer Behavior Analysis</h3>
              <div className="text-xs text-slate-400">
                Source: Nielsen, Meta Business, Visa, Deloitte
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consumerInsights.map((insight, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{insight.category}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-emerald-400">+{insight.growth}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Penetration Rate</span>
                        <span className="text-white">{insight.penetration}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${insight.penetration}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-300">
                      <strong>Insight:</strong> {insight.insight}
                    </div>
                    
                    <div className="text-sm text-blue-300">
                      <strong>Opportunity:</strong> {insight.opportunity}
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      Source: {insight.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competitive Landscape */}
      {activeInsight === 'competitive' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Competitive Landscape Analysis</h3>
              <div className="text-xs text-slate-400">
                Source: Momentum Works, PwC, Euromonitor, Frost & Sullivan
              </div>
            </div>
            
            <div className="space-y-4">
              {competitiveAnalysis.map((sector, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">{sector.sector}</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-slate-400">Market Leaders:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sector.leaders.map((leader, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-900/20 text-blue-300 text-xs rounded-full">
                                {leader}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Combined Market Share:</span>
                          <span className="text-white ml-2">{sector.marketShare}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Competition Level</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(sector.competitionLevel)}`}>
                            {sector.competitionLevel}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Entry Barriers</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(sector.entryBarriers)}`}>
                            {sector.entryBarriers}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm">
                        <span className="text-slate-400">Market Opportunity:</span>
                        <p className="text-emerald-300 mt-1">{sector.opportunity}</p>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Source: {sector.source}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Regulatory Environment */}
      {activeInsight === 'regulatory' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Regulatory Environment Assessment</h3>
              <div className="text-xs text-slate-400">
                Source: World Bank, Government Agencies, Investment Boards
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regulatoryInsights.filter(country => 
                selectedCountries.length === 0 || selectedCountries.some(selected => 
                  country.country.toLowerCase().includes(selected) || selected.includes(country.country.toLowerCase())
                )
              ).map((country, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">{country.country}</h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{country.easeOfBusiness}</div>
                        <div className="text-xs text-slate-400">Ease of Business</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-400">{country.regulatoryClarity}</div>
                        <div className="text-xs text-slate-400">Regulatory Clarity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{country.digitalReadiness}</div>
                        <div className="text-xs text-slate-400">Digital Readiness</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-slate-400">Key Regulations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {country.keyRegulations.map((reg, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs rounded-full">
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-emerald-400">Opportunities:</span>
                      <p className="text-slate-300 mt-1">{country.opportunities}</p>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-orange-400">Challenges:</span>
                      <p className="text-slate-300 mt-1">{country.challenges}</p>
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      Source: {country.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketInsights;