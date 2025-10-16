import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, Trash2, Plus, Edit, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface ScheduledExport {
  id: string;
  name: string;
  export_type: string;
  config: any;
  schedule_cron: string;
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
}

const ExportScheduler: React.FC = () => {
  const { user } = useAuth();
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newExport, setNewExport] = useState({
    name: '',
    export_type: 'pdf',
    schedule: 'daily',
    config: {}
  });

  useEffect(() => {
    if (user) {
      fetchScheduledExports();
    }
  }, [user]);

  const fetchScheduledExports = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('scheduled_exports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setExports(data);
  };

  const scheduleMap: Record<string, string> = {
    daily: '0 9 * * *',
    weekly: '0 9 * * 1',
    monthly: '0 9 1 * *',
    custom: '0 * * * *'
  };

  const handleCreate = async () => {
    if (!user || !newExport.name) return;

    await supabase.from('scheduled_exports').insert({
      user_id: user.id,
      name: newExport.name,
      export_type: newExport.export_type,
      schedule_cron: scheduleMap[newExport.schedule],
      config: newExport.config,
      is_active: true
    });

    setIsCreating(false);
    setNewExport({ name: '', export_type: 'pdf', schedule: 'daily', config: {} });
    fetchScheduledExports();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await supabase
      .from('scheduled_exports')
      .update({ is_active: !isActive })
      .eq('id', id);
    fetchScheduledExports();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('scheduled_exports').delete().eq('id', id);
    fetchScheduledExports();
  };

  const getScheduleLabel = (cron: string) => {
    const reverseMap = Object.entries(scheduleMap).find(([_, v]) => v === cron);
    return reverseMap ? reverseMap[0] : 'custom';
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Export Scheduler</h2>
            <p className="text-slate-400 text-sm mt-1">
              Automate your data exports with custom schedules
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Schedule</span>
          </button>
        </div>

        {exports.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No scheduled exports</p>
            <p className="text-sm">Create your first automated export schedule</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exports.map((exp) => (
              <div
                key={exp.id}
                className={`bg-slate-700/50 rounded-lg p-4 border transition-all ${
                  exp.is_active ? 'border-emerald-700/50' : 'border-slate-600/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{exp.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Download className="h-4 w-4" />
                      <span>{exp.export_type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggle(exp.id, exp.is_active)}
                      className={`p-1 rounded transition-colors ${
                        exp.is_active
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300 capitalize">
                      {getScheduleLabel(exp.schedule_cron)}
                    </span>
                  </div>

                  {exp.last_run && (
                    <div className="text-xs text-slate-500">
                      Last run: {new Date(exp.last_run).toLocaleString()}
                    </div>
                  )}

                  {exp.next_run && (
                    <div className="text-xs text-blue-400">
                      Next run: {new Date(exp.next_run).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                  exp.is_active
                    ? 'bg-emerald-900/20 text-emerald-400'
                    : 'bg-slate-600/20 text-slate-400'
                }`}>
                  {exp.is_active ? 'Active' : 'Paused'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Schedule New Export</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Export Name
                </label>
                <input
                  type="text"
                  value={newExport.name}
                  onChange={(e) => setNewExport({ ...newExport, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Weekly Market Report"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Export Format
                </label>
                <select
                  value={newExport.export_type}
                  onChange={(e) => setNewExport({ ...newExport, export_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Schedule
                </label>
                <select
                  value={newExport.schedule}
                  onChange={(e) => setNewExport({ ...newExport, schedule: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="daily">Daily (9 AM)</option>
                  <option value="weekly">Weekly (Monday 9 AM)</option>
                  <option value="monthly">Monthly (1st day, 9 AM)</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newExport.name}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportScheduler;
