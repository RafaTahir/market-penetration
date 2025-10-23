import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Database, AlertTriangle } from 'lucide-react';
import { DataSyncService, DataSyncStatus } from '../services/dataSyncService';

const DataRefreshDashboard: React.FC = () => {
  const [syncStatuses, setSyncStatuses] = useState<DataSyncStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [freshness, setFreshness] = useState<{ [key: string]: { age: number; status: string } }>({});

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    setLoading(true);
    try {
      const syncService = DataSyncService.getInstance();
      const [statuses, freshnessData] = await Promise.all([
        syncService.getSyncStatus(),
        syncService.getDataFreshness()
      ]);
      setSyncStatuses(statuses);
      setFreshness(freshnessData);
    } catch (error) {
      console.error('Error loading sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async (source?: string) => {
    setSyncing(source || 'all');
    try {
      const syncService = DataSyncService.getInstance();
      await syncService.forceSync(source);
      await loadSyncStatus();
    } catch (error) {
      console.error('Error forcing sync:', error);
    } finally {
      setSyncing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getFreshnessIndicator = (source: string) => {
    const data = freshness[source];
    if (!data) return null;

    const { age, status } = data;
    const ageFormatted = age < 1
      ? `${Math.round(age * 60)}m ago`
      : age < 24
      ? `${Math.round(age)}h ago`
      : `${Math.round(age / 24)}d ago`;

    const colorClass = status === 'fresh'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-orange-600 dark:text-orange-400';

    return (
      <span className={`text-xs ${colorClass} flex items-center gap-1`}>
        {status === 'stale' && <AlertTriangle className="h-3 w-3" />}
        {ageFormatted}
      </span>
    );
  };

  const getSourceDisplayName = (source: string): string => {
    const names: { [key: string]: string } = {
      'market_data': 'Market Data (Stocks)',
      'currency_rates': 'Currency Rates',
      'world_bank': 'World Bank Indicators',
      'imf_data': 'IMF Economic Data',
      'oecd_data': 'OECD Statistics',
      'trade_data': 'Trade Statistics',
      'case_studies': 'Case Studies'
    };
    return names[source] || source;
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: { [key: string]: string } = {
      'hourly': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      'daily': 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
      'weekly': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      'monthly': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[frequency] || colors.daily}`}>
        {frequency}
      </span>
    );
  };

  const formatDateTime = (date: Date | null): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Data Refresh Status
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of data source synchronization
          </p>
        </div>
        <button
          onClick={() => handleForceSync()}
          disabled={syncing !== null || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${syncing === 'all' ? 'animate-spin' : ''}`} />
          {syncing === 'all' ? 'Syncing...' : 'Sync All Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Sources</span>
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {syncStatuses.length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Up to Date</span>
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {syncStatuses.filter(s => s.status === 'success').length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900 dark:text-red-300">Failed</span>
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-100">
            {syncStatuses.filter(s => s.status === 'failed').length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Records Today</span>
            <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {syncStatuses.reduce((sum, s) => sum + s.recordsUpdated, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Data Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Last Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Next Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {syncStatuses.map((status, index) => (
                <tr
                  key={index}
                  className={`${getStatusColor(status.status)} hover:opacity-75 transition-opacity`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getSourceDisplayName(status.source)}
                      </span>
                      {getFreshnessIndicator(status.source)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.status)}
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {status.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getFrequencyBadge(status.frequency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDateTime(status.lastSync)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDateTime(status.nextSync)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.recordsUpdated.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleForceSync(status.source)}
                      disabled={syncing !== null}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing === status.source ? 'animate-spin' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {syncStatuses.some(s => s.errorMessage) && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recent Errors
          </h3>
          <div className="space-y-2">
            {syncStatuses
              .filter(s => s.errorMessage)
              .map((status, index) => (
                <div key={index} className="text-sm text-red-700 dark:text-red-400">
                  <span className="font-medium">{getSourceDisplayName(status.source)}:</span>{' '}
                  {status.errorMessage}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Data Freshness Information
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Hourly data: Market prices, currency rates (refreshed every hour)</li>
          <li>• Daily data: Economic indicators from World Bank, IMF, OECD (refreshed every 24 hours)</li>
          <li>• Weekly data: Trade statistics (refreshed every 7 days)</li>
          <li>• Monthly data: Case studies and long-term trends (refreshed every 30 days)</li>
        </ul>
      </div>
    </div>
  );
};

export default DataRefreshDashboard;
