import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { marketDataService } from '../services/marketData';

interface ExportToolsProps {
  selectedCountries: string[];
}

export default function ExportTools({ selectedCountries }: ExportToolsProps) {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const stocks = await marketDataService.getAllStocks();
      const filtered = selectedCountries.length > 0
        ? stocks.filter(s => selectedCountries.includes(s.country.toLowerCase()))
        : stocks;

      const data = filtered.map(s => ({
        Symbol: s.symbol,
        Name: s.name,
        Exchange: s.exchange,
        Country: s.country,
        Price: Number(s.price),
        Change: Number(s.change),
        'Change %': Number(s.change_percent),
        Volume: Number(s.volume),
        'Market Cap': s.market_cap ? Number(s.market_cap) : 0
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Market Data');

      const colWidths = [
        { wch: 10 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `market-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export to Excel failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const stocks = await marketDataService.getAllStocks();
      const filtered = selectedCountries.length > 0
        ? stocks.filter(s => selectedCountries.includes(s.country.toLowerCase()))
        : stocks;

      const headers = ['Symbol', 'Name', 'Exchange', 'Country', 'Price', 'Change', 'Change %', 'Volume', 'Market Cap'];
      const rows = filtered.map(s => [
        s.symbol,
        s.name,
        s.exchange,
        s.country,
        Number(s.price),
        Number(s.change),
        Number(s.change_percent),
        Number(s.volume),
        s.market_cap ? Number(s.market_cap) : 0
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `market-data-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Export to CSV failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('market-overview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`market-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Export to PDF failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Download className="h-5 w-5 text-blue-400" />
        <span>Export Reports</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={exportToExcel}
          disabled={exporting}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-5 w-5" />
          )}
          <span>Export to Excel</span>
        </button>

        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          <span>Export to CSV</span>
        </button>

        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          <span>Export to PDF</span>
        </button>
      </div>
    </div>
  );
}
