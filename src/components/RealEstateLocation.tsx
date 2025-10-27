import React, { useState, useEffect } from 'react';
import { MapPin, Building, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  realEstateLocationService,
  CommercialRealEstate,
  EconomicZone,
  SiteSelectionMatrix
} from '../services/realEstateLocationService';

export default function RealEstateLocation() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'zones' | 'site-selection'>('properties');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [properties, setProperties] = useState<CommercialRealEstate[]>([]);
  const [zones, setZones] = useState<EconomicZone[]>([]);
  const [siteMatrix, setSiteMatrix] = useState<SiteSelectionMatrix[]>([]);

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
        case 'properties':
          const propData = await realEstateLocationService.getCommercialRealEstate(filters);
          setProperties(propData);
          break;
        case 'zones':
          const zoneData = await realEstateLocationService.getEconomicZones(filters);
          setZones(zoneData);
          break;
        case 'site-selection':
          const siteData = await realEstateLocationService.getSiteSelectionMatrix(filters);
          setSiteMatrix(siteData);
          break;
      }
    } catch (error) {
      console.error('Error loading real estate data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-4">Real Estate & Location Intelligence</h2>

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
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'properties'
                ? theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'zones'
                ? theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Economic Zones
          </button>
          <button
            onClick={() => setActiveTab('site-selection')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'site-selection'
                ? theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Site Selection
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view commercial properties.
                  </p>
                ) : (
                  properties.map((prop) => (
                    <div key={prop.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{prop.property_name}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {prop.city} | {prop.property_type} | Grade {prop.grade}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-500">
                            ${prop.rent_per_sqm_month_usd}/sqm
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            per month
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div>Total Area: {prop.total_area_sqm.toLocaleString()} sqm</div>
                        <div>Available: {prop.available_area_sqm.toLocaleString()} sqm</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'zones' && (
              <div className="space-y-4">
                {zones.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view economic zones.
                  </p>
                ) : (
                  zones.map((zone) => (
                    <div key={zone.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h3 className="text-lg font-semibold mb-2">{zone.zone_name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {zone.city} | {zone.zone_type}
                      </p>
                      {zone.tax_benefits && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {zone.tax_benefits}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {zone.focus_industries.slice(0, 3).map((industry, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'site-selection' && (
              <div className="space-y-4">
                {siteMatrix.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a country to view site selection data.
                  </p>
                ) : (
                  siteMatrix.map((site) => (
                    <div key={site.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{site.city}</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {site.industry_focus}
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-purple-500">{site.total_score}/100</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>Market Access: {site.market_access_score}/100</div>
                        <div>Talent: {site.talent_availability_score}/100</div>
                        <div>Infrastructure: {site.infrastructure_score}/100</div>
                        <div>Cost: {site.cost_competitiveness_score}/100</div>
                        <div>Regulatory: {site.regulatory_environment_score}/100</div>
                        <div>Innovation: {site.innovation_ecosystem_score}/100</div>
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
