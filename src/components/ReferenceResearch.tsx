import CityAnalysis from './CityAnalysis';
import IndustryAnalysis from './IndustryAnalysis';
import EnhancedIndustryAnalysis from './EnhancedIndustryAnalysis';
import MarketInsights from './MarketInsights';
import CaseStudies from './CaseStudies';
import DataVisualization from './DataVisualization';
import SourceNotice from './SourceNotice';
import type { ResearchMode } from './MarketResearch';

interface ReferenceResearchProps {
  mode: ResearchMode;
  selectedCountries: string[];
  selectedCities: string[];
  onCityToggle: (id: string) => void;
  onIndustrySelect: (id: string) => void;
  onInsightTabChange: (id: string) => void;
  onCaseStudySelect: (id: string) => void;
}

/** Existing bundled analyses are deliberately isolated behind the parent's explicit opt-in. */
export default function ReferenceResearch({ mode, selectedCountries, selectedCities, onCityToggle, onIndustrySelect, onInsightTabChange, onCaseStudySelect }: ReferenceResearchProps) {
  return <section className="reference-research" aria-label="Unverified reference research" data-content-status="unverified-reference">
    <SourceNotice title="Unverified reference research">
      <p>These are existing static examples and unverified records. Source attributions and observation dates have not been established. They are not current market facts, calibrated probabilities or business advice, and never supply evidence or points to your entry plan.</p>
    </SourceNotice>
    {mode === 'overview' && (
                  <div className="space-y-6">
                    {/* Market Size Overview */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-2 mb-6">
                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-white">Market Overview</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-sm font-medium text-blue-400">Total Market Size</span>
                          </div>
                          <div className="text-2xl font-bold text-white">$1.2T</div>
                          <div className="text-xs text-slate-400">Combined addressable market</div>
                          <div className="text-xs text-slate-500 mt-1">Unverified legacy attribution: World Bank, IMF 2024</div>
                        </div>

                        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-sm font-medium text-emerald-400">Average Growth</span>
                          </div>
                          <div className="text-2xl font-bold text-white">+4.7%</div>
                          <div className="text-xs text-slate-400">Regional GDP growth 2024</div>
                          <div className="text-xs text-slate-500 mt-1">Unverified legacy attribution: IMF Economic Outlook</div>
                        </div>

                        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium text-purple-400">Total Population</span>
                          </div>
                          <div className="text-2xl font-bold text-white">688M</div>
                          <div className="text-xs text-slate-400">Combined population</div>
                          <div className="text-xs text-slate-500 mt-1">Unverified legacy attribution: UN Population Division</div>
                        </div>

                        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-orange-400">Digital Users</span>
                          </div>
                          <div className="text-2xl font-bold text-white">456M</div>
                          <div className="text-xs text-slate-400">Active internet users</div>
                          <div className="text-xs text-slate-500 mt-1">Unverified legacy attribution: We Are Social 2024</div>
                        </div>
                      </div>

                      {/* Country Comparison Table */}
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-4">Market Comparison by Country</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">Country</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Population</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">GDP (USD)</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Growth Rate</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-slate-400">Market Size</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                              {selectedCountries.length > 0 ?
                                selectedCountries.map((country) => {
                                  const countryData = ({
                                    indonesia: { pop: '273.5M', gdp: '$1.32T', growth: '+5.2%', market: '$287B' },
                                    thailand: { pop: '69.8M', gdp: '$543B', growth: '+2.8%', market: '$127B' },
                                    singapore: { pop: '5.9M', gdp: '$397B', growth: '+2.6%', market: '$89B' },
                                    malaysia: { pop: '32.7M', gdp: '$432B', growth: '+4.5%', market: '$98B' },
                                    philippines: { pop: '109.6M', gdp: '$394B', growth: '+6.2%', market: '$156B' },
                                    vietnam: { pop: '97.3M', gdp: '$409B', growth: '+6.8%', market: '$142B' }
                                  } as Record<string, { pop: string; gdp: string; growth: string; market: string }>)[country];

                                  return (
                                    <tr key={country} className="hover:bg-slate-600/30">
                                      <td className="py-2 px-3 text-sm text-white capitalize">{country}</td>
                                      <td className="py-2 px-3 text-sm text-slate-300 text-right">{countryData?.pop}</td>
                                      <td className="py-2 px-3 text-sm text-slate-300 text-right">{countryData?.gdp}</td>
                                      <td className="py-2 px-3 text-sm text-emerald-400 text-right">{countryData?.growth}</td>
                                      <td className="py-2 px-3 text-sm text-blue-400 text-right">{countryData?.market}</td>
                                    </tr>
                                  );
                                }) :
                                [
                                  { name: 'Indonesia', pop: '273.5M', gdp: '$1.32T', growth: '+5.2%', market: '$287B' },
                                  { name: 'Thailand', pop: '69.8M', gdp: '$543B', growth: '+2.8%', market: '$127B' },
                                  { name: 'Singapore', pop: '5.9M', gdp: '$397B', growth: '+2.6%', market: '$89B' },
                                  { name: 'Malaysia', pop: '32.7M', gdp: '$432B', growth: '+4.5%', market: '$98B' },
                                  { name: 'Philippines', pop: '109.6M', gdp: '$394B', growth: '+6.2%', market: '$156B' },
                                  { name: 'Vietnam', pop: '97.3M', gdp: '$409B', growth: '+6.8%', market: '$142B' }
                                ].map((country, index) => (
                                  <tr key={index} className="hover:bg-slate-600/30">
                                    <td className="py-2 px-3 text-sm text-white">{country.name}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300 text-right">{country.pop}</td>
                                    <td className="py-2 px-3 text-sm text-slate-300 text-right">{country.gdp}</td>
                                    <td className="py-2 px-3 text-sm text-emerald-400 text-right">{country.growth}</td>
                                    <td className="py-2 px-3 text-sm text-blue-400 text-right">{country.market}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Unverified legacy attribution: World Bank, IMF Economic Outlook 2024, National Statistical Offices
                        </div>
                      </div>
                    </div>

                    {/* Market Entry Recommendations */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center space-x-2 mb-6">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">Strategic Market Entry Framework</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <h4 className="font-medium text-emerald-400">Phase 1: Foundation (0-6 months)</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Market research and regulatory assessment</li>
                            <li>• Local partnership identification</li>
                            <li>• Digital presence establishment</li>
                            <li>• Cultural localization strategy</li>
                          </ul>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <h4 className="font-medium text-blue-400">Phase 2: Launch (6-18 months)</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Pilot programs in tier-1 cities</li>
                            <li>• Customer service infrastructure</li>
                            <li>• Localized product offerings</li>
                            <li>• Digital marketing campaigns</li>
                          </ul>
                        </div>

                        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <h4 className="font-medium text-purple-400">Phase 3: Scale (18+ months)</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Multi-market expansion</li>
                            <li>• Regional operations setup</li>
                            <li>• Supply chain optimization</li>
                            <li>• Strategic acquisitions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {mode === 'cities' && (
                  <CityAnalysis
                    selectedCountries={selectedCountries}
                    selectedCities={selectedCities}
                    onCityToggle={onCityToggle}
                  />
                )}

                {mode === 'industries' && (
                  <>
                    <EnhancedIndustryAnalysis selectedCountries={selectedCountries} />
                    <div className="mt-8">
                      <IndustryAnalysis
                        selectedCountries={selectedCountries}
                        onIndustrySelect={onIndustrySelect}
                      />
                    </div>
                  </>
                )}

                {mode === 'insights' && (
                  <MarketInsights
                    selectedCountries={selectedCountries}
                    onInsightTabChange={onInsightTabChange}
                  />
                )}

                {mode === 'cases' && (
                  <CaseStudies
                    selectedCountries={selectedCountries}
                    onCaseStudySelect={onCaseStudySelect}
                  />
                )}

                {mode === 'data' && (
                  <DataVisualization selectedCountries={selectedCountries} />
                )}
  </section>;
}
