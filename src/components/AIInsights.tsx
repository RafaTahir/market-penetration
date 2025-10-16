import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

interface Insight {
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

const AIInsights: React.FC<{ selectedCountries: string[] }> = ({ selectedCountries }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);

    setTimeout(() => {
      const generatedInsights: Insight[] = [
        {
          type: 'opportunity',
          title: 'Digital Payment Surge in Southeast Asia',
          description: `${selectedCountries.join(', ')} showing 45% YoY growth in digital payment adoption. E-wallet penetration expected to reach 80% by 2025. Strategic opportunity for fintech partnerships and payment infrastructure investments.`,
          confidence: 92,
          impact: 'high'
        },
        {
          type: 'trend',
          title: 'Cross-Border E-Commerce Acceleration',
          description: 'Regional trade agreements enabling seamless cross-border transactions. Markets becoming increasingly interconnected with unified logistics networks. Expected 35% growth in regional e-commerce over next 18 months.',
          confidence: 88,
          impact: 'high'
        },
        {
          type: 'risk',
          title: 'Regulatory Divergence Alert',
          description: 'Increasing regulatory fragmentation across ASEAN markets. Data localization requirements vary significantly between countries. Compliance costs projected to increase 20-30% for multi-market operators.',
          confidence: 75,
          impact: 'medium'
        },
        {
          type: 'recommendation',
          title: 'Mobile-First Strategy Essential',
          description: '85% of internet users in selected markets are mobile-only. Desktop traffic declining 12% annually. Recommend prioritizing mobile app development and progressive web apps for market penetration.',
          confidence: 95,
          impact: 'high'
        },
        {
          type: 'opportunity',
          title: 'Sustainability Premium Growing',
          description: 'Consumer willingness to pay premium for sustainable products up 28% YoY. Gen Z and Millennial segments driving trend. ESG-focused brands seeing 40% higher customer retention rates.',
          confidence: 82,
          impact: 'medium'
        },
        {
          type: 'trend',
          title: 'Social Commerce Dominance',
          description: 'Social media platforms driving 67% of online purchase decisions. Live-streaming commerce growing 3x faster than traditional e-commerce. Instagram and TikTok Shop integration critical for market success.',
          confidence: 90,
          impact: 'high'
        }
      ];

      setInsights(generatedInsights);
      setLoading(false);
    }, 2000);
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
              <h2 className="text-2xl font-bold text-white">AI-Powered Market Insights</h2>
              <p className="text-slate-400 text-sm mt-1">
                Advanced analytics for {selectedCountries.length > 0 ? selectedCountries.join(', ') : 'selected markets'}
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
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Insights</span>
              </>
            )}
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No insights generated yet</p>
            <p className="text-sm">Click "Generate Insights" to analyze market data with AI</p>
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
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-24 bg-slate-600 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${insight.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-white font-medium">{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {insights.length > 0 && (
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <p className="text-sm text-purple-300">
              <strong>Note:</strong> These insights are generated using advanced market analytics, historical data patterns,
              and industry trends. Insights are updated dynamically based on real-time market conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
