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

      switch (exportFormat) {
        case 'pdf':
          await exportService.generatePDFReport(exportData);
          break;
        case 'excel':
          await exportService.generateExcelReport(exportData);
          break;
        case 'ppt':
          await exportService.generatePowerPointOutline(exportData);
          break;
      }
      
      // Show success message
      // Create a beautiful success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <div class="font-semibold">Report Generated Successfully!</div>
            <div class="text-sm opacity-90">Your ${exportFormat.toUpperCase()} report is ready for download</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 5000);
    } catch (error) {
      console.error('Error generating export:', error);
      // Create error notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      errorNotification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <div class="font-semibold">Generation Failed</div>
            <div class="text-sm opacity-90">Please try again or contact support</div>
          </div>
        </div>
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(errorNotification), 300);
      }, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center space-x-2 mb-6">
        <Download className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Professional Report Generation</h2>
        <div className="ml-auto">
          <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-xs rounded-full font-medium">
            Enhanced Multi-Page Reports
          </span>
        </div>
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
          <h3 className="text-sm font-medium text-slate-300 mb-3">Comprehensive Report Contents (7+ Pages)</h3>
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-blue-700/50 rounded-lg">
            <div className="text-sm font-medium text-blue-400 mb-2">Current Analysis Focus</div>
            <div className="space-y-1 text-xs text-slate-300">
              <div>• Analysis Tab: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
              {activeInsightTab && <div>• Intelligence Focus: {activeInsightTab.charAt(0).toUpperCase() + activeInsightTab.slice(1)}</div>}
              {selectedIndustry && <div>• Industry: {selectedIndustry}</div>}
              {selectedCaseStudy && <div>• Case Study: {selectedCaseStudy}</div>}
              <div>• Selected Markets: {selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}</div>
              {selectedCities.length > 0 && <div>• Selected Cities: {selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}</div>}
            </div>
          </div>
          <div className="space-y-2">
            {[
              'Executive Summary',
              'Executive Dashboard with Key Metrics',
              'Market Analysis Deep Dive',
              'Competitive Intelligence & Market Leaders',
              'Consumer Behavior & Trends Analysis',
              'Regulatory Environment & Risk Assessment',
              'Investment Analysis & ROI Projections',
              'Strategic Action Plan & Implementation Roadmap',
              `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analysis ⭐ (Your Current Focus)`,
              selectedCities.length > 0 ? 'Selected Cities Analysis' : 'City-Level Market Intelligence',
              selectedIndustry ? `${selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)} Industry Analysis` : 'Industry Deep Dive Analysis',
              activeInsightTab === 'consumer' ? 'Consumer Behavior Insights ⭐ (Your Focus)' : 'Consumer Behavior Insights',
              selectedCaseStudy ? `${selectedCaseStudy} Case Study ⭐ (Your Selection)` : 'Market Entry Case Studies',
              'Digital Adoption Metrics',
              'Investment Flows & Trade Analysis',
              'Comprehensive Risk Assessment Matrix',
              'Strategic Market Entry Recommendations',
              'Implementation Timeline & Milestones',
              'Success Metrics & KPI Framework',
              'Next Steps & Action Items',
              'Data Sources & Methodology'
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked={index < 8 || item.includes('⭐')}
                  className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className={`text-sm ${item.includes('⭐') ? 'text-blue-300 font-medium' : 'text-slate-300'}`}>{item}</span>
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
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Professional {exportFormat.toUpperCase()} Report...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Generate Comprehensive {exportFormat.toUpperCase()} Report</span>
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