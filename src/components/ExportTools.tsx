import React, { useState } from 'react';
import { Download, FileText, BarChart3, Mail, Calendar, Loader2 } from 'lucide-react';
import { ExportService, ExportData } from '../services/exportService';

interface ExportToolsProps {
  selectedCountries: string[];
  selectedCities: string[];
  activeTab: string;
  activeInsightTab?: string;
  selectedIndustry?: string;
  selectedCaseStudy?: string;
}

const ExportTools: React.FC<ExportToolsProps> = ({ 
  selectedCountries, 
  selectedCities, 
  activeTab, 
  activeInsightTab, 
  selectedIndustry, 
  selectedCaseStudy 
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'ppt'>('pdf');
  const [emailSchedule, setEmailSchedule] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [isExporting, setIsExporting] = useState(false);
  
  const exportService = ExportService.getInstance();

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: <FileText className="h-4 w-4" />,
      description: 'Comprehensive market analysis report with your current selections'
    },
    {
      id: 'excel',
      name: 'Excel Data',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Detailed data analytics matching your current view and selections'
    },
    {
      id: 'ppt',
      name: 'PowerPoint',
      icon: <FileText className="h-4 w-4" />,
      description: 'Executive presentation slides based on your analysis focus'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        selectedCountries,
        selectedCities,
        activeTab,
        activeInsightTab,
        selectedIndustry,
        selectedCaseStudy
      };

      // Gather current view data for synchronization
      const currentViewData = this.getCurrentViewData();

      switch (exportFormat) {
        case 'pdf':
          await exportService.generatePDFReport(exportData, currentViewData);
          break;
        case 'excel':
          await exportService.generateExcelReport(exportData, currentViewData);
          break;
        case 'ppt':
          await exportService.generatePowerPointOutline(exportData, currentViewData);
          break;
      }
    } catch (error) {
      console.error('Error generating export:', error);
      alert(`Error generating ${exportFormat.toUpperCase()} report. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const getCurrentViewData = () => {
    // Gather comprehensive current view data based on active tab and selections
    const baseData = {
      'Current Analysis': activeTab,
      'Market Intelligence Focus': activeInsightTab || 'N/A',
      'Industry Focus': selectedIndustry || 'All Industries',
      'Case Study': selectedCaseStudy || 'N/A',
      'Selected Markets': selectedCountries.join(', '),
      'Selected Cities': selectedCities.join(', '),
      'Report Generated': new Date().toISOString()
    };

    // Add tab-specific data based on current view
    if (activeTab === 'cities') {
      return [{
        ...baseData,
        'City Analysis Focus': selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', '),
        'Urban Market Size': selectedCities.length > 0 ? '$' + (selectedCities.length * 45.2).toFixed(1) + 'B' : 'N/A',
        'Digital Infrastructure Score': selectedCities.length > 0 ? (82.4).toString() + '/100' : 'N/A'
      }];
    } else if (activeTab === 'industries') {
      return [{
        ...baseData,
        'Industry Market Size': selectedIndustry === 'technology' ? '$234.5B' : 
                               selectedIndustry === 'ecommerce' ? '$187.3B' :
                               selectedIndustry === 'fintech' ? '$153.2B' : '$150B+',
        'Industry Growth Rate': selectedIndustry === 'technology' ? '15.2%' :
                               selectedIndustry === 'ecommerce' ? '22.8%' :
                               selectedIndustry === 'fintech' ? '18.4%' : '12-18%',
        'Competition Level': selectedIndustry === 'technology' ? 'High' :
                            selectedIndustry === 'ecommerce' ? 'Very High' :
                            selectedIndustry === 'fintech' ? 'Medium' : 'Medium-High'
      }];
    } else if (activeTab === 'insights') {
      return [{
        ...baseData,
        'Intelligence Type': activeInsightTab || 'Market Overview',
        'Key Insight': activeInsightTab === 'consumer' ? 'Mobile-first shopping dominates (78.4% penetration)' :
                      activeInsightTab === 'competitive' ? 'E-commerce sector highly competitive (68.4% market share by top 3)' :
                      activeInsightTab === 'regulatory' ? 'Singapore leads in regulatory clarity (95/100 score)' :
                      'Total addressable market: $1.2T across selected regions',
        'Growth Opportunity': activeInsightTab === 'consumer' ? 'Social commerce (+31.8% growth)' :
                             activeInsightTab === 'competitive' ? 'B2B market segments less saturated' :
                             activeInsightTab === 'regulatory' ? 'Regulatory sandboxes for innovation' :
                             'Digital economy growing at 18.6% annually'
      }];
    } else if (activeTab === 'cases') {
      return [{
        ...baseData,
        'Case Study Focus': selectedCaseStudy || 'Multiple Success Stories',
        'Key Learning': selectedCaseStudy === 'grab-success' ? 'Localized approach and ecosystem building' :
                       selectedCaseStudy === 'shopee-success' ? 'Mobile-first social commerce strategy' :
                       selectedCaseStudy === 'gojek-success' ? 'Super app model with financial inclusion' :
                       'Adaptation to local market dynamics is crucial',
        'Success Factor': selectedCaseStudy === 'grab-success' ? 'Strategic partnerships and regulatory compliance' :
                         selectedCaseStudy === 'shopee-success' ? 'Gamification and social features' :
                         selectedCaseStudy === 'gojek-success' ? 'Working with existing informal economy' :
                         'Local partnerships and cultural adaptation'
      }];
    } else if (activeTab === 'data') {
      return [{
        ...baseData,
        'Visualization Focus': 'Comprehensive market analytics and trends',
        'Key Metrics': 'Population, Economic, Digital, and Market Opportunity data',
        'Data Coverage': selectedCountries.length + ' countries with 8 chart categories',
        'Update Frequency': 'Real-time market data with quarterly economic updates'
      }];
    }

    // Default overview data
    return [{
      ...baseData,
      'Market Overview': 'Comprehensive analysis of ' + selectedCountries.length + ' Southeast Asian markets',
      'Total Market Size': '$1.2T combined addressable market',
      'Average Growth': '+4.7% regional GDP growth',
      'Digital Users': '456M active internet users'
    }];
  };
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center space-x-2 mb-6">
        <Download className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Export & Reporting</h2>
      </div>
      
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Export Format</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setExportFormat(option.id as 'pdf' | 'excel' | 'ppt')}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  exportFormat === option.id
                    ? 'border-orange-500 bg-orange-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`${exportFormat === option.id ? 'text-orange-400' : 'text-slate-400'}`}>
                    {option.icon}
                  </div>
                  <span className="font-medium text-sm">{option.name}</span>
                </div>
                <p className="text-xs text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Report Contents */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Report Contents</h3>
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="text-sm font-medium text-blue-400 mb-2">Current Analysis Focus</div>
            <div className="space-y-1 text-xs text-slate-300">
              <div>• Analysis Tab: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
              {activeInsightTab && <div>• Intelligence Focus: {activeInsightTab.charAt(0).toUpperCase() + activeInsightTab.slice(1)}</div>}
              {selectedIndustry && <div>• Industry: {selectedIndustry}</div>}
              {selectedCaseStudy && <div>• Case Study: {selectedCaseStudy}</div>}
            </div>
          </div>
          <div className="space-y-2">
            {[
              'Executive Summary',
              `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analysis (Current Focus)`,
              'Market Size & Growth Analysis',
              'City-Level Market Intelligence',
              'Industry Deep Dive Analysis',
              'Competitive Landscape',
              'Consumer Behavior Insights',
              'Market Entry Case Studies',
              'Digital Adoption Metrics',
              'Investment Flows & Trade Analysis',
              'ROI Projections',
              'Risk Assessment',
              'Strategic Recommendations'
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked={index < 8 || item.includes('Current Focus')}
                  className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className={`text-sm ${item.includes('Current Focus') ? 'text-blue-300 font-medium' : 'text-slate-300'}`}>{item}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Email Schedule */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            <Mail className="h-4 w-4 inline mr-2" />
            Email Schedule
          </h3>
          <select
            value={emailSchedule}
            onChange={(e) => setEmailSchedule(e.target.value as 'none' | 'weekly' | 'monthly')}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            <option value="none">No automatic reports</option>
            <option value="weekly">Weekly updates</option>
            <option value="monthly">Monthly reports</option>
          </select>
        </div>
        
        {/* Market Selection Summary */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Selected Markets</span>
                <span className="text-sm text-orange-400">{selectedCountries.length} countries</span>
              </div>
              {selectedCountries.length === 0 ? (
                <p className="text-xs text-slate-400">No markets selected</p>
              ) : (
                <p className="text-xs text-slate-400">
                  {selectedCountries.map(id => 
                    id.charAt(0).toUpperCase() + id.slice(1)
                  ).join(', ')}
                </p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Selected Cities</span>
                <span className="text-sm text-purple-400">{selectedCities.length} cities</span>
              </div>
              {selectedCities.length === 0 ? (
                <p className="text-xs text-slate-400">No cities selected</p>
              ) : (
                <p className="text-xs text-slate-400">
                  {selectedCities.map(id => 
                    id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ).join(', ')}
                </p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Analysis Focus</span>
                <span className="text-sm text-blue-400">{activeTab}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                {activeInsightTab && <div>Intelligence: {activeInsightTab}</div>}
                {selectedIndustry && <div>Industry: {selectedIndustry}</div>}
                {selectedCaseStudy && <div>Case Study: {selectedCaseStudy}</div>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={selectedCountries.length === 0 || isExporting}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating {exportFormat.toUpperCase()} Report...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Generate Synced {exportFormat.toUpperCase()} Report</span>
            </>
          )}
        </button>
        
        {emailSchedule !== 'none' && (
          <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-900/20 p-3 rounded-lg border border-emerald-700/50">
            <Calendar className="h-4 w-4" />
            <span>Automatic {emailSchedule} reports enabled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportTools;