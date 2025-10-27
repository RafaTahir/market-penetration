import React, { useState, useEffect } from 'react';
import { Users, DollarSign, GraduationCap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  laborTalentService,
  SalaryBenchmark,
  TalentPool,
  LaborMarketData
} from '../services/laborTalentService';

export default function LaborTalent() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'salaries' | 'talent-pools' | 'market-data'>('salaries');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [salaries, setSalaries] = useState<SalaryBenchmark[]>([]);
  const [talentPools, setTalentPools] = useState<TalentPool[]>([]);
  const [marketData, setMarketData] = useState<LaborMarketData[]>([]);

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
        case 'salaries':
          const salaryData = await laborTalentService.getSalaryBenchmarks(filters);
          setSalaries(salaryData);
          break;
        case 'talent-pools':
          const poolData = await laborTalentService.getTalentPools(filters);
          setTalentPools(poolData);
          break;
        case 'market-data':
          const laborData = await laborTalentService.getLaborMarketData(filters);
          setMarketData(laborData);
          break;
      }
    } catch (error) {
      console.error('Error loading labor talent data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-4">Labor & Talent Intelligence</h2>

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
            onClick={() => setActiveTab('salaries')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'salaries'
                ? theme === 'dark' ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Salary Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('talent-pools')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'talent-pools'
                ? theme === 'dark' ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Talent Pools
          </button>
          <button
            onClick={() => setActiveTab('market-data')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'market-data'
                ? theme === 'dark' ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Market Data
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'salaries' && (
              <div className="space-y-4">
                {salaries.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view salary benchmarks.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                          <th className="px-4 py-2 text-left">Job Title</th>
                          <th className="px-4 py-2 text-left">Level</th>
                          <th className="px-4 py-2 text-left">Median Salary</th>
                          <th className="px-4 py-2 text-left">Range</th>
                          <th className="px-4 py-2 text-left">Demand</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaries.map((salary) => (
                          <tr key={salary.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className="px-4 py-2 font-medium">{salary.job_title}</td>
                            <td className="px-4 py-2">{salary.job_level}</td>
                            <td className="px-4 py-2 text-orange-500 font-semibold">
                              ${(salary.salary_median_usd_annual / 1000).toFixed(0)}K
                            </td>
                            <td className="px-4 py-2 text-sm">
                              ${(salary.salary_min_usd_annual / 1000).toFixed(0)}K - ${(salary.salary_max_usd_annual / 1000).toFixed(0)}K
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                salary.demand_level === 'Very_High' ? 'bg-red-100 text-red-700' :
                                salary.demand_level === 'High' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {salary.demand_level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'talent-pools' && (
              <div className="space-y-4">
                {talentPools.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view talent pools.
                  </p>
                ) : (
                  talentPools.map((pool) => (
                    <div key={pool.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{pool.institution_name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {pool.city} | {pool.institution_type}
                          </p>
                        </div>
                        {pool.ranking_national > 0 && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-orange-500">Rank #{pool.ranking_national}</div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>National</div>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div>Students: {pool.total_students.toLocaleString()}</div>
                        <div>Annual Graduates: {pool.annual_graduates.toLocaleString()}</div>
                      </div>
                      {pool.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pool.specializations.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'market-data' && (
              <div className="space-y-4">
                {marketData.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view labor market data.
                  </p>
                ) : (
                  marketData.map((data) => (
                    <div key={data.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h3 className="text-lg font-semibold mb-4">{data.industry} - {data.year}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Workforce Size</div>
                          <div className="text-xl font-bold">{(data.total_workforce_size / 1000).toFixed(0)}K</div>
                        </div>
                        <div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Unemployment</div>
                          <div className="text-xl font-bold">{data.unemployment_rate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Literacy Rate</div>
                          <div className="text-xl font-bold">{data.literacy_rate.toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>English Proficiency</div>
                          <div className="text-xl font-bold">{data.english_proficiency_score}/100</div>
                        </div>
                      </div>
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
