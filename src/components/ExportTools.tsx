import React, { useRef, useState } from 'react';
import { Download, FileText, BarChart3, Loader2, Sparkles, Presentation } from 'lucide-react';
import type { ExportData } from '../services/exportService';

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
  const [isExporting, setIsExporting] = useState(false);
  
  const busy = useRef(false);
  const [outcome, setOutcome] = useState<'success' | 'error' | null>(null);

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: <FileText className="h-5 w-5" />,
      description: 'Market reference report with visible source limits and illustrative planning content'
    },
    {
      id: 'excel',
      name: 'Excel Data',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Available observations, unavailable fields, and labeled static examples with provenance'
    },
    {
      id: 'ppt',
      name: 'Pitch Deck',
      icon: <Presentation className="h-5 w-5" />,
      description: 'Presentation template with reference data and clearly labeled planning assumptions'
    }
  ];

  const handleExport = async () => {
    if (busy.current || !selectedCountries.length) return;
    busy.current = true;
    setIsExporting(true);
    setOutcome(null);
    
    try {
      const { ExportService } = await import('../services/exportService');
      const exportService = ExportService.getInstance();
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
      
      setOutcome('success');
    } catch (error) {
      console.error('Error generating export:', error);
      setOutcome('error');
    } finally {
      busy.current = false;
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Professional Report Suite</h2>
        <div className="ml-auto">
          <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-xs rounded-full font-medium">
            Premium Analytics Reports
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
                disabled={isExporting}
                aria-pressed={exportFormat === option.id}
                onClick={() => { setExportFormat(option.id as 'pdf' | 'excel' | 'ppt'); setOutcome(null); }}
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
        
        {/* Report Preview */}
        <div className="bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-400 mb-3">Report Preview - Your Analysis Focus</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="space-y-1">
              <div>📊 Analysis: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
              {activeInsightTab && <div>🧠 Intelligence: {activeInsightTab.charAt(0).toUpperCase() + activeInsightTab.slice(1)}</div>}
              {selectedIndustry && <div>🏭 Industry: {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}</div>}
              {selectedCaseStudy && <div>📚 Case Study: {selectedCaseStudy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>}
            </div>
            <div className="space-y-1">
              <div>🌏 Markets: {selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}</div>
              {selectedCities.length > 0 && <div>🏙️ Cities: {selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}</div>}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Exports include source status and observation dates where available. Missing observations remain unavailable;
            bundled examples and financial scenarios are illustrative. Export creation time does not indicate data freshness.
          </div>
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
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Crafting Professional {exportFormat.toUpperCase()} Report...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Generate Premium {exportFormat.toUpperCase()} Report</span>
            </>
          )}
        </button>
        {outcome === 'error' && <p role="alert" className="text-sm text-white">
          Could not generate this report. Try again, or <button type="button" className="underline" onClick={() => window.location.reload()}>reload the page</button> and retry.
        </p>}
        {outcome === 'success' && <p role="status" className="text-sm text-white">Report generated. Your download has started.</p>}
      </div>
    </div>
  );
};

export default ExportTools;