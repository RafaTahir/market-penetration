import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import type { MarketInsight } from '../types';

interface AIInsightsProps {
  selectedCountries: string[];
}

export default function AIInsights({ selectedCountries }: AIInsightsProps) {
  const insights: MarketInsight[] = [
    {
      title: 'Strong Growth Momentum in Vietnam',
      description: 'Vietnamese stocks showing consistent upward trend with average 6.8% growth. Tech sector leading gains.',
      type: 'positive',
      country: 'vietnam'
    },
    {
      title: 'Singapore Market Stabilizing',
      description: 'Financial services sector showing resilience. Banking stocks maintaining steady performance.',
      type: 'neutral',
      country: 'singapore'
    },
    {
      title: 'Indonesia Infrastructure Boom',
      description: 'Construction and infrastructure stocks up 12% this quarter. Government spending driving growth.',
      type: 'positive',
      country: 'indonesia'
    },
    {
      title: 'Thailand Tourism Recovery',
      description: 'Hospitality and airline stocks rebounding. International arrivals exceeding pre-pandemic levels.',
      type: 'positive',
      country: 'thailand'
    },
    {
      title: 'Malaysia Export Concerns',
      description: 'Manufacturing sector facing headwinds from global trade tensions. Monitor commodity prices.',
      type: 'negative',
      country: 'malaysia'
    },
    {
      title: 'Philippines Digital Economy Surge',
      description: 'E-commerce and fintech companies showing 15% quarter-over-quarter growth. Young demographic driving adoption.',
      type: 'positive',
      country: 'philippines'
    }
  ];

  const filteredInsights = selectedCountries.length > 0
    ? insights.filter(i => selectedCountries.includes(i.country))
    : insights;

  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'negative':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-emerald-700/50 bg-emerald-900/10';
      case 'negative':
        return 'border-red-700/50 bg-red-900/10';
      default:
        return 'border-blue-700/50 bg-blue-900/10';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Lightbulb className="h-5 w-5 text-yellow-400" />
        <span>AI-Powered Market Insights</span>
      </h2>

      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getBorderColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{insight.description}</p>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-400 rounded">
                      {insight.country.charAt(0).toUpperCase() + insight.country.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select markets to view AI-powered insights</p>
        </div>
      )}
    </div>
  );
}
