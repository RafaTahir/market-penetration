import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Archive, AlertCircle, Info, TrendingDown, Users } from 'lucide-react';
import alertService, { AlertTriggered } from '../services/alertService';
import { SkeletonLoader } from './SkeletonLoader';

interface NotificationCenterProps {
  onClose?: () => void;
}

const AlertNotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [alerts, setAlerts] = useState<AlertTriggered[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const alertsData = await alertService.getUserTriggeredAlerts(true);
    setAlerts(alertsData);

    const count = await alertService.getUnreadAlertCount();
    setUnreadCount(count);
    setLoading(false);
  };

  const handleMarkAsRead = async (alert_id: string) => {
    await alertService.markAlertAsRead(alert_id);
    setAlerts(alerts.map(a => a.id === alert_id ? { ...a, is_read: true } : a));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAllAsRead = async () => {
    await alertService.markAllAlertsAsRead();
    setAlerts(alerts.map(a => ({ ...a, is_read: true })));
    setUnreadCount(0);
  };

  const handleDismiss = async (alert_id: string) => {
    await alertService.dismissAlert(alert_id);
    setAlerts(alerts.filter(a => a.id !== alert_id));
  };

  const displayedAlerts = filterType === 'unread'
    ? alerts.filter(a => !a.is_read)
    : alerts;

  const priorityConfig = {
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600', badge: 'bg-red-100 text-red-800' },
    high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' },
    low: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' }
  };

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertCircle size={20} className={priorityConfig[priority as keyof typeof priorityConfig].icon} />;
      default:
        return <Info size={20} className={priorityConfig[priority as keyof typeof priorityConfig].icon} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bell size={24} className="text-gray-900 dark:text-white" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{unreadCount} unread</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'unread'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All {alerts.length > 0 && `(${alerts.length})`}
        </button>
      </div>

      {/* Action Bar */}
      {unreadCount > 0 && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-700 dark:text-blue-300 hover:underline font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <SkeletonLoader type="text" rows={5} />
          </div>
        ) : displayedAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No {filterType === 'unread' ? 'unread' : ''} notifications</p>
            <p className="text-sm mt-1">Your alerts will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedAlerts.map(alert => {
              const config = priorityConfig[alert.priority as keyof typeof priorityConfig];

              return (
                <div
                  key={alert.id}
                  className={`${config.bg} border-l-4 ${config.border} p-4 transition-colors hover:bg-opacity-75`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {alert.message}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${config.badge}`}>
                              {alert.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(alert.triggered_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!alert.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check size={16} className="text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Dismiss"
                          >
                            <X size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Alert Data Display */}
                      {alert.alert_data && Object.keys(alert.alert_data).length > 0 && (
                        <div className="mt-3 text-sm space-y-1">
                          {Object.entries(alert.alert_data).map(([key, value]) => (
                            <div key={key} className="text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertNotificationCenter;
