import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

interface Insight {
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

const AIInsights: React.FC<{ selectedCountries: string[] }> = ({ selectedCountries }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);

    const generatedInsights: Insight[] = [
      { type: 'opportunity', title: 'Example prompt: payment needs', description: 'Interview prospective customers about payment needs. No adoption or growth statistic has been established.', impact: 'high' },
      { type: 'trend', title: 'Example prompt: cross-border operations', description: 'Map operating assumptions for each selected jurisdiction and verify them against evidence. This example supplies no market forecast.', impact: 'high' },
      { type: 'risk', title: 'Example prompt: regulatory questions', description: 'List licensing, ownership and data-handling questions to confirm with relevant authorities or qualified advisers. No legal conclusion is supplied.', impact: 'medium' },
      { type: 'recommendation', title: 'Example prompt: customer channels', description: 'Test channel and device preferences with your target customers. No demographic percentage has been established.', impact: 'high' },
      { type: 'opportunity', title: 'Example prompt: pricing assumptions', description: 'Validate pricing and purchasing preferences with customers before relying on a proposed value proposition.', impact: 'medium' },
      { type: 'trend', title: 'Example prompt: acquisition experiments', description: 'Compare acquisition experiments with dated evidence. No channel market share or growth result is supplied.', impact: 'high' }
    ];
    setInsights(generatedInsights);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5" />;
      case 'trend':
        return <Sparkles className="h-5 w-5" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'from-emerald-600 to-green-600';
      case 'risk':
        return 'from-orange-600 to-red-600';
      case 'trend':
        return 'from-blue-600 to-cyan-600';
      case 'recommendation':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-400 bg-red-900/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'low':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-slate-400 bg-slate-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-900/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI interface examples — no model connected</h2>
              <p className="text-slate-400 text-sm mt-1">
                Example research prompts for {selectedCountries.length > 0 ? selectedCountries.join(', ') : 'selected markets'}
              </p>
            </div>
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading examples...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Show example prompts</span>
              </>
            )}
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No insights generated yet</p>
            <p className="text-sm">These are fixed interface examples. No AI analysis or market-data retrieval takes place.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-slate-700/50 rounded-lg p-5 border border-slate-600/50 hover:border-slate-500/50 transition-all group"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getColor(insight.type)} text-white`}>
                    {getIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {insight.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                        Example only
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {insight.description}
                    </p>
                    <p className="text-xs text-slate-400">Fixed example prompt · no confidence estimate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {insights.length > 0 && (
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <p className="text-sm text-purple-300">
              <strong>Example only:</strong> These prompts are fixed in application code. No model, sourced analysis, factual confidence, current regulation, or live market result is provided.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
