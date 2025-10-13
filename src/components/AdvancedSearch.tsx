import React, { useState } from 'react';
import { Search, Filter, X, Save, Star } from 'lucide-react';

interface SearchFilters {
  countries: string[];
  industries: string[];
  minGDP?: number;
  maxGDP?: number;
  minGrowth?: number;
  minPopulation?: number;
  digitalAdoption?: number;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onSave?: (name: string, filters: SearchFilters) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    countries: [],
    industries: []
  });
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const countries = ['Indonesia', 'Thailand', 'Singapore', 'Malaysia', 'Philippines', 'Vietnam'];
  const industries = ['Technology', 'E-commerce', 'Finance', 'Healthcare', 'Manufacturing', 'Tourism'];

  const handleApplyFilters = () => {
    onSearch(filters);
    setIsExpanded(false);
  };

  const handleSaveSearch = () => {
    if (saveName && onSave) {
      onSave(saveName, filters);
      setSaveName('');
      setShowSaveDialog(false);
    }
  };

  const toggleCountry = (country: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const toggleIndustry = (industry: string) => {
    setFilters(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search markets, industries, insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg border transition-all ${
            isExpanded
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Filter className="h-5 w-5" />
        </button>
        {onSave && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-2 rounded-lg border bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500 transition-colors"
          >
            <Save className="h-5 w-5" />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Countries</label>
            <div className="flex flex-wrap gap-2">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    filters.countries.includes(country)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Industries</label>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => toggleIndustry(industry)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    filters.industries.includes(industry)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Min GDP ($B)</label>
              <input
                type="number"
                value={filters.minGDP || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minGDP: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Min Growth Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={filters.minGrowth || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minGrowth: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 5.0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setFilters({ countries: [], industries: [] });
                setSearchTerm('');
              }}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Save Search</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter search name..."
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!saveName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
