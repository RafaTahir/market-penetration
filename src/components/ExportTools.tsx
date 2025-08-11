import React, { useState } from 'react';
import { Download, FileText, BarChart3, Mail, Calendar, Loader2 } from 'lucide-react';
import { ExportService, ExportData } from '../services/exportService';

interface ExportToolsProps {
  selectedCountries: string[];
  selectedCities: string[];
  activeTab: string;
}

const ExportTools: React.FC<ExportToolsProps> = ({ selectedCountries, selectedCities, activeTab }) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'ppt'>('pdf');
  const [emailSchedule, setEmailSchedule] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [isExporting, setIsExporting] = useState(false);
  
  const exportService = ExportService.getInstance();

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: <FileText className="h-4 w-4" />,
      description: 'McKinsey-style comprehensive market analysis report'
    },
    {
      id: 'excel',
      name: 'Excel Data',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Detailed data analytics in professional spreadsheet format'
    },
    {
      id: 'ppt',
      name: 'PowerPoint',
      icon: <FileText className="h-4 w-4" />,
      description: 'BCG-style executive presentation outline'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        selectedCountries,
        selectedCities,
        activeTab
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
    } catch (error) {
      console.error('Error generating export:', error);
      alert(`Error generating ${exportFormat.toUpperCase()} report. Please try again.`);
    } finally {
      setIsExporting(false);
    }
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
          <div className="space-y-2">
            {[
              'Executive Summary',
              'Market Size & Growth Analysis',
              'City-Level Market Intelligence',
              'Industry Deep Dive Analysis',
              'Competitive Landscape',
              'Consumer Behavior Insights',
              'Market Entry Case Studies',
              'Digital Adoption Metrics',
              'ROI Projections',
              'Risk Assessment',
              'Strategic Recommendations'
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300">{item}</span>
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
              <span>Generate Professional {exportFormat.toUpperCase()} Report</span>
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