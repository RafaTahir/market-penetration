import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  riskAssessmentService,
  PoliticalRiskIndex,
  EconomicRiskFactor,
  OperationalRisk
} from '../services/riskAssessmentService';

export default function RiskAssessment() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [politicalRisk, setPoliticalRisk] = useState<PoliticalRiskIndex | null>(null);
  const [economicRisk, setEconomicRisk] = useState<EconomicRiskFactor | null>(null);
  const [operationalRisks, setOperationalRisks] = useState<OperationalRisk[]>([]);

  const countries = ['Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam'];

  useEffect(() => {
    if (selectedCountry) {
      loadData();
    }
  }, [selectedCountry]);

  const loadData = async () => {
    setLoading(true);
    try {
      const riskProfile = await riskAssessmentService.getComprehensiveRiskProfile(selectedCountry);
      setPoliticalRisk(riskProfile.political);
      setEconomicRisk(riskProfile.economic);
      setOperationalRisks(riskProfile.operational);
    } catch (error) {
      console.error('Error loading risk assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
          </div>
        ) : selectedCountry ? (
          <div className="space-y-6">
            {politicalRisk && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xl font-semibold mb-4">Political Risk Profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Stability Score</div>
                    <div className={`text-2xl font-bold ${getRiskColor(politicalRisk.political_stability_score)}`}>
                      {politicalRisk.political_stability_score}/100
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Corruption Index</div>
                    <div className={`text-2xl font-bold ${getRiskColor(politicalRisk.corruption_index)}`}>
                      {politicalRisk.corruption_index}/100
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Rule of Law</div>
                    <div className={`text-2xl font-bold ${getRiskColor(politicalRisk.rule_of_law_score)}`}>
                      {politicalRisk.rule_of_law_score}/100
                    </div>
                  </div>
                </div>
                {politicalRisk.risk_summary && (
                  <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {politicalRisk.risk_summary}
                  </p>
                )}
              </div>
            )}

            {economicRisk && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xl font-semibold mb-4">Economic Risk Profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Inflation Risk</div>
                    <div className="text-lg font-semibold">{economicRisk.inflation_risk}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Banking Health</div>
                    <div className="text-lg font-semibold">{economicRisk.banking_sector_health}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Recession Risk</div>
                    <div className="text-lg font-semibold">{economicRisk.recession_risk}</div>
                  </div>
                </div>
              </div>
            )}

            {operationalRisks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Operational Risks</h3>
                <div className="space-y-4">
                  {operationalRisks.slice(0, 5).map((risk) => (
                    <div key={risk.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{risk.risk_title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          risk.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          risk.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {risk.risk_description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a country to view risk assessment.
          </p>
        )}
      </div>
    </div>
  );
}
