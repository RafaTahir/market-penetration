import React, { useState, useEffect } from 'react';
import { Scale, FileText, TrendingUp, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  regulatoryComplianceService,
  RegulatoryRequirement,
  TaxIncentive,
  PolicyChange
} from '../services/regulatoryComplianceService';

export default function RegulatoryCompliance() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'requirements' | 'incentives' | 'policy-changes'>('requirements');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [incentives, setIncentives] = useState<TaxIncentive[]>([]);
  const [policyChanges, setPolicyChanges] = useState<PolicyChange[]>([]);

  const countries = ['Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam'];

  useEffect(() => {
    if (selectedCountry) {
      loadData();
    }
  }, [selectedCountry, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = { country: selectedCountry, limit: 20 };

      switch (activeTab) {
        case 'requirements':
          const reqData = await regulatoryComplianceService.getRegulatoryRequirements(filters);
          setRequirements(reqData);
          break;
        case 'incentives':
          const incentiveData = await regulatoryComplianceService.getTaxIncentives(filters);
          setIncentives(incentiveData);
          break;
        case 'policy-changes':
          const policyData = await regulatoryComplianceService.getPolicyChanges(filters);
          setPolicyChanges(policyData);
          break;
      }
    } catch (error) {
      console.error('Error loading regulatory compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-4">Regulatory Compliance</h2>

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

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'requirements'
                ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveTab('incentives')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'incentives'
                ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tax Incentives
          </button>
          <button
            onClick={() => setActiveTab('policy-changes')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'policy-changes'
                ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Policy Changes
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'requirements' && (
              <div className="space-y-4">
                {requirements.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view regulatory requirements.
                  </p>
                ) : (
                  requirements.map((req) => (
                    <div key={req.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{req.requirement_name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {req.requirement_type} | {req.issuing_authority}
                          </p>
                        </div>
                        {req.mandatory && (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Mandatory</span>
                        )}
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{req.description}</p>
                      {req.processing_time_days > 0 && (
                        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Processing time: {req.processing_time_days} days
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'incentives' && (
              <div className="space-y-4">
                {incentives.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view tax incentives.
                  </p>
                ) : (
                  incentives.map((incentive) => (
                    <div key={incentive.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h3 className="text-lg font-semibold mb-2">{incentive.incentive_name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        {incentive.benefit_description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Type:</span>{' '}
                          <span className="font-medium">{incentive.incentive_type}</span>
                        </div>
                        {incentive.percentage_reduction > 0 && (
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Reduction:</span>{' '}
                            <span className="font-medium text-green-500">{incentive.percentage_reduction}%</span>
                          </div>
                        )}
                        {incentive.duration_years > 0 && (
                          <div>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Duration:</span>{' '}
                            <span className="font-medium">{incentive.duration_years} years</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'policy-changes' && (
              <div className="space-y-4">
                {policyChanges.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view policy changes.
                  </p>
                ) : (
                  policyChanges.map((change) => (
                    <div key={change.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{change.title}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Effective: {new Date(change.effective_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            change.impact_level === 'High'
                              ? 'bg-red-100 text-red-700'
                              : change.impact_level === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {change.impact_level} Impact
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{change.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
