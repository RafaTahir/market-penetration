import React, { useState } from 'react';
import { Building2, Shield, Scale, MapPin, Users, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import CompetitiveIntelligence from './CompetitiveIntelligence';
import RegulatoryCompliance from './RegulatoryCompliance';
import RiskAssessment from './RiskAssessment';
import RealEstateLocation from './RealEstateLocation';
import LaborTalent from './LaborTalent';
import { useTheme } from '../contexts/ThemeContext';

type IntelligenceModule =
  | 'overview'
  | 'competitive'
  | 'regulatory'
  | 'risk'
  | 'real-estate'
  | 'labor';

export default function EnterpriseIntelligenceDashboard() {
  const [activeModule, setActiveModule] = useState<IntelligenceModule>('overview');
  const { theme } = useTheme();

  const modules = [
    {
      id: 'competitive' as IntelligenceModule,
      name: 'Competitive Intelligence',
      icon: TrendingUp,
      description: 'Competitor profiles, market share, pricing intelligence',
      color: 'blue',
      stats: { total: '500+', recent: '45 new' }
    },
    {
      id: 'regulatory' as IntelligenceModule,
      name: 'Regulatory Compliance',
      icon: Scale,
      description: 'Legal requirements, tax incentives, policy changes',
      color: 'green',
      stats: { total: '300+', recent: '12 updates' }
    },
    {
      id: 'risk' as IntelligenceModule,
      name: 'Risk Assessment',
      icon: Shield,
      description: 'Political, economic, and operational risk analysis',
      color: 'red',
      stats: { total: '250+', recent: '8 alerts' }
    },
    {
      id: 'real-estate' as IntelligenceModule,
      name: 'Real Estate & Location',
      icon: MapPin,
      description: 'Commercial properties, economic zones, infrastructure',
      color: 'purple',
      stats: { total: '1,000+', recent: '67 listings' }
    },
    {
      id: 'labor' as IntelligenceModule,
      name: 'Labor & Talent',
      icon: Users,
      description: 'Labor market data, salary benchmarks, recruitment',
      color: 'orange',
      stats: { total: '750+', recent: '23 updates' }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: {
        bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        border: theme === 'dark' ? 'border-blue-800' : 'border-blue-200',
        hover: theme === 'dark' ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
      },
      green: {
        bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
        text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        border: theme === 'dark' ? 'border-green-800' : 'border-green-200',
        hover: theme === 'dark' ? 'hover:bg-green-900/30' : 'hover:bg-green-100'
      },
      red: {
        bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        border: theme === 'dark' ? 'border-red-800' : 'border-red-200',
        hover: theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
      },
      purple: {
        bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
        text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
        border: theme === 'dark' ? 'border-purple-800' : 'border-purple-200',
        hover: theme === 'dark' ? 'hover:bg-purple-900/30' : 'hover:bg-purple-100'
      },
      orange: {
        bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
        text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
        border: theme === 'dark' ? 'border-orange-800' : 'border-orange-200',
        hover: theme === 'dark' ? 'hover:bg-orange-900/30' : 'hover:bg-orange-100'
      }
    };
    return colors[color];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={32} />
            <h1 className="text-3xl font-bold">Enterprise Intelligence Hub</h1>
          </div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Comprehensive market intelligence for strategic decision-making
          </p>
        </div>

        {activeModule === 'overview' ? (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} size={24} />
                <h2 className="text-xl font-semibold">Key Intelligence Categories</h2>
              </div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Access comprehensive intelligence across five critical business domains. Each module provides
                data-driven insights to support your market entry, expansion, and operational decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => {
                const Icon = module.icon;
                const colors = getColorClasses(module.color);
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`p-6 rounded-lg border text-left transition-all ${colors.bg} ${colors.border} ${colors.hover}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${colors.bg}`}>
                        <Icon className={colors.text} size={24} />
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${colors.text}`}>{module.stats.total}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {module.stats.recent}
                        </div>
                      </div>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>{module.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {module.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
                <h2 className="text-xl font-semibold">Quick Start Guide</h2>
              </div>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
                  <span><strong>Competitive Intelligence:</strong> Analyze competitors, track market share, and monitor pricing strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>•</span>
                  <span><strong>Regulatory Compliance:</strong> Navigate legal requirements, discover tax incentives, and track policy changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>•</span>
                  <span><strong>Risk Assessment:</strong> Evaluate political, economic, and operational risks before market entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>•</span>
                  <span><strong>Real Estate & Location:</strong> Find commercial properties, explore economic zones, and track infrastructure projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}>•</span>
                  <span><strong>Labor & Talent:</strong> Access salary benchmarks, identify talent pools, and connect with recruitment partners</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setActiveModule('overview')}
              className={`mb-6 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              ← Back to Overview
            </button>

            {activeModule === 'competitive' && <CompetitiveIntelligence />}
            {activeModule === 'regulatory' && <RegulatoryCompliance />}
            {activeModule === 'risk' && <RiskAssessment />}
            {activeModule === 'real-estate' && <RealEstateLocation />}
            {activeModule === 'labor' && <LaborTalent />}
          </div>
        )}
      </div>
    </div>
  );
}
