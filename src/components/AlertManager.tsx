import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, ToggleLeft as Toggle2, AlertCircle, CheckCircle, TrendingDown, Users, FileText, Briefcase, Clock, GitFork as Priority } from 'lucide-react';
import alertService, { AlertRule, AlertTemplate } from '../services/alertService';
import { SkeletonLoader } from './SkeletonLoader';

interface CreateRuleState {
  name: string;
  description: string;
  rule_type: AlertRule['rule_type'];
  priority: AlertRule['priority'];
  countries: string[];
  threshold?: number;
  notification_channels: string[];
}

const AlertManager: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [templates, setTemplates] = useState<AlertTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AlertTemplate | null>(null);

  const [formState, setFormState] = useState<CreateRuleState>({
    name: '',
    description: '',
    rule_type: 'price_threshold',
    priority: 'medium',
    countries: [],
    notification_channels: ['in_app']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [rulesData, templatesData] = await Promise.all([
      alertService.getUserAlertRules(),
      alertService.getAlertTemplates()
    ]);
    setRules(rulesData);
    setTemplates(templatesData);
    setLoading(false);
  };

  const handleCreateRule = async () => {
    if (!formState.name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    const conditions = {
      countries: formState.countries,
      ...(formState.threshold && { threshold: formState.threshold })
    };

    const newRule = await alertService.createAlertRule(
      formState.name,
      formState.description,
      formState.rule_type,
      conditions,
      formState.priority,
      formState.notification_channels
    );

    if (newRule) {
      setRules([newRule, ...rules]);
      resetForm();
      setShowCreateModal(false);
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule || !formState.name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    const conditions = {
      countries: formState.countries,
      ...(formState.threshold && { threshold: formState.threshold })
    };

    const updated = await alertService.updateAlertRule(editingRule.id, {
      name: formState.name,
      description: formState.description,
      rule_type: formState.rule_type,
      priority: formState.priority,
      conditions,
      notification_channels: formState.notification_channels
    });

    if (updated) {
      setRules(rules.map(r => r.id === editingRule.id ? updated : r));
      resetForm();
      setEditingRule(null);
      setShowCreateModal(false);
    }
  };

  const handleDeleteRule = async (rule_id: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      const success = await alertService.deleteAlertRule(rule_id);
      if (success) {
        setRules(rules.filter(r => r.id !== rule_id));
      }
    }
  };

  const handleToggleRule = async (rule: AlertRule) => {
    const updated = await alertService.toggleAlertRule(rule.id, !rule.is_active);
    if (updated) {
      setRules(rules.map(r => r.id === rule.id ? updated : r));
    }
  };

  const resetForm = () => {
    setFormState({
      name: '',
      description: '',
      rule_type: 'price_threshold',
      priority: 'medium',
      countries: [],
      notification_channels: ['in_app']
    });
    setUseTemplate(false);
    setSelectedTemplate(null);
  };

  const openEditModal = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormState({
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      priority: rule.priority,
      countries: (rule.conditions.countries || []) as string[],
      threshold: rule.conditions.threshold,
      notification_channels: rule.notification_channels
    });
    setShowCreateModal(true);
  };

  const ruleTypeConfig = {
    price_threshold: { icon: TrendingDown, label: 'Price Threshold', color: 'text-red-600' },
    competitor_activity: { icon: Users, label: 'Competitor Activity', color: 'text-blue-600' },
    regulatory_change: { icon: FileText, label: 'Regulatory Change', color: 'text-purple-600' },
    labor_market: { icon: Briefcase, label: 'Labor Market', color: 'text-green-600' },
    market_entry: { icon: AlertCircle, label: 'Market Entry', color: 'text-orange-600' }
  };

  const priorityConfig = {
    critical: { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-500' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-500' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-500' },
    low: { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-500' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Rules</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage custom market alerts
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Alert Rule
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <SkeletonLoader type="table" rows={5} />
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No alert rules yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first alert
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const typeConfig = ruleTypeConfig[rule.rule_type];
            const priorityConfig_local = priorityConfig[rule.priority];
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={rule.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${typeConfig.color}`}>
                      <TypeIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${priorityConfig_local.badge}`}
                          title={rule.priority}
                        />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {typeConfig.label}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rule.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Created {new Date(rule.created_at).toLocaleDateString()}
                        </span>
                        {rule.notification_channels.length > 0 && (
                          <span className="flex items-center gap-1">
                            {rule.notification_channels.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700'
                      }`}
                      title={rule.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(rule)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g., Alert when SGX drops 5%"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formState.description}
                  onChange={e => setFormState({ ...formState, description: e.target.value })}
                  placeholder="What should this alert watch for?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alert Type
                </label>
                <select
                  value={formState.rule_type}
                  onChange={e => setFormState({ ...formState, rule_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price_threshold">Price Threshold</option>
                  <option value="competitor_activity">Competitor Activity</option>
                  <option value="regulatory_change">Regulatory Change</option>
                  <option value="labor_market">Labor Market</option>
                  <option value="market_entry">Market Entry</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formState.priority}
                  onChange={e => setFormState({ ...formState, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Countries
                </label>
                <div className="space-y-2">
                  {['Singapore', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam'].map(country => (
                    <label key={country} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.countries.includes(country)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormState({
                              ...formState,
                              countries: [...formState.countries, country]
                            });
                          } else {
                            setFormState({
                              ...formState,
                              countries: formState.countries.filter(c => c !== country)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notify via
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formState.notification_channels.includes('in_app')}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormState({
                          ...formState,
                          notification_channels: [...formState.notification_channels, 'in_app']
                        });
                      } else {
                        setFormState({
                          ...formState,
                          notification_channels: formState.notification_channels.filter(c => c !== 'in_app')
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">In-App</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRule(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingRule ? handleUpdateRule : handleCreateRule}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                {editingRule ? 'Update' : 'Create'} Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertManager;
