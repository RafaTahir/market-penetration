import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Calendar, Building2, FileText, Download, Search, Filter } from 'lucide-react';
import { UnifiedDataService } from '../services/unifiedDataService';

interface Report {
  title: string;
  organization: string;
  country: string;
  summary: string;
  publicationDate: string;
  url: string;
  type: string;
}

const InstitutionalReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const unifiedService = UnifiedDataService.getInstance();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, selectedOrg, selectedType, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await unifiedService.getInstitutionalReports();
      setReports(data);
      setFilteredReports(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedOrg !== 'all') {
      filtered = filtered.filter(report => report.organization === selectedOrg);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    filtered.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());

    setFilteredReports(filtered);
  };

  const organizations = ['all', ...Array.from(new Set(reports.map(r => r.organization)))];
  const types = ['all', ...Array.from(new Set(reports.map(r => r.type)))];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getOrgColor = (org: string) => {
    switch (org) {
      case 'International Monetary Fund':
        return 'bg-blue-900/20 border-blue-700/50 text-blue-400';
      case 'World Bank':
        return 'bg-emerald-900/20 border-emerald-700/50 text-emerald-400';
      case 'ASEAN Secretariat':
        return 'bg-purple-900/20 border-purple-700/50 text-purple-400';
      default:
        return 'bg-slate-900/20 border-slate-700/50 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-900/20 rounded-lg text-emerald-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Institutional Reports Library</h1>
                <p className="text-sm text-slate-400">Authoritative research from IMF, World Bank, and ASEAN</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Last Updated</div>
              <div className="text-sm text-white">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Organizations</option>
              {organizations.slice(1).map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {types.slice(1).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Total Reports</span>
            </div>
            <div className="text-2xl font-bold text-white">{reports.length}</div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Organizations</span>
            </div>
            <div className="text-2xl font-bold text-white">{organizations.length - 1}</div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Filtered Results</span>
            </div>
            <div className="text-2xl font-bold text-white">{filteredReports.length}</div>
          </div>

          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Recent (2024)</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {reports.filter(r => r.publicationDate.startsWith('2024')).length}
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="text-slate-400 mt-4">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No reports found matching your criteria</p>
            </div>
          ) : (
            filteredReports.map((report, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getOrgColor(report.organization)}`}>
                        {report.organization}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                        {report.type}
                      </span>
                      <span className="text-xs text-slate-500">{report.country}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{report.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{report.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Published: {formatDate(report.publicationDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col space-y-2">
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <span>View Report</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Data Attribution */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
          <div className="text-center text-xs text-slate-400">
            <p>
              Reports sourced from International Monetary Fund (IMF), World Bank Group, and ASEAN Secretariat.
              Data is updated periodically. Visit official websites for the most current information.
            </p>
            <p className="mt-2">
              <strong className="text-slate-300">Sources:</strong> IMF.org • WorldBank.org • ASEAN.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalReports;
