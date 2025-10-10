import React, { useState } from 'react';
import { FileText, Download, Presentation, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import { ProfessionalDeckService } from '../services/professionalDeckService';

interface ReportData {
  type: 'written' | 'presentation';
  title: string;
  subtitle: string;
  date: string;
}

const ReportGenerator: React.FC = () => {
  const [generating, setGenerating] = useState(false);

  const marketData = {
    overview: {
      totalMarketSize: 901,
      totalPopulation: 588.8,
      averageGrowth: 4.7,
      digitalUsers: 456
    },
    countries: [
      { name: 'Indonesia', marketSize: 287.2, population: 273.5, gdpPerCapita: 4824, growth: 5.2, digital: 77.1 },
      { name: 'Vietnam', marketSize: 142.1, population: 97.3, gdpPerCapita: 4164, growth: 6.8, digital: 29.8 },
      { name: 'Philippines', marketSize: 156.8, population: 109.6, gdpPerCapita: 3485, growth: 6.2, digital: 33.4 },
      { name: 'Thailand', marketSize: 127.4, population: 69.8, gdpPerCapita: 7806, growth: 2.8, digital: 35.2 },
      { name: 'Malaysia', marketSize: 98.3, population: 32.7, gdpPerCapita: 11373, growth: 4.5, digital: 25.7 },
      { name: 'Singapore', marketSize: 89.6, population: 5.9, gdpPerCapita: 65233, growth: 2.6, digital: 28.3 }
    ],
    industries: [
      { name: 'Technology & Software', value: 23.4, growth: 15.2, marketSize: 234.5 },
      { name: 'E-commerce & Retail', value: 18.7, growth: 22.8, marketSize: 187.3 },
      { name: 'Financial Services', value: 15.3, growth: 18.4, marketSize: 153.2 },
      { name: 'Manufacturing', value: 12.8, growth: 8.7, marketSize: 128.4 }
    ]
  };

  const generateWrittenReport = () => {
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      // Cover Page
      doc.setFillColor(240, 248, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // FLOW Logo Area
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 50, 'F');
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('FLOW', pageWidth / 2, 30, { align: 'center' });

      // Title
      doc.setFontSize(28);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      const title = 'Southeast Asian Market Entry Strategy';
      doc.text(title, pageWidth / 2, 90, { align: 'center', maxWidth: contentWidth });

      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprehensive Market Analysis & Investment Recommendations', pageWidth / 2, 110, { align: 'center', maxWidth: contentWidth });

      // Date
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
      const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(currentDate, pageWidth / 2, 130, { align: 'center' });

      // Blue accent bar
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, 160, contentWidth, 3, 'F');

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL - Board Presentation', pageWidth / 2, pageHeight - 15, { align: 'center' });

      // Page 2: Executive Summary
      doc.addPage();
      let yPos = margin;

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('FLOW | Southeast Asian Market Entry Strategy', margin, 10);
      doc.setTextColor(255, 255, 255);
      doc.text('Page 2', pageWidth - margin, 10, { align: 'right' });

      yPos = 30;

      // Executive Summary Header
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, yPos);

      yPos += 15;
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      const execSummary = [
        'Southeast Asia presents a compelling $901B market opportunity with robust growth fundamentals and increasing digital adoption across six major economies.',
        '',
        'KEY FINDINGS:',
        '• Market Size: Combined addressable market of $901B across Indonesia, Vietnam, Philippines, Thailand, Malaysia, and Singapore',
        '• Growth: Regional average of 4.7% GDP growth with Vietnam (6.8%) and Philippines (6.2%) leading',
        '• Digital Economy: $229.5B digital economy growing at 20%+ annually',
        '• Demographics: 588.8M population with median age of 30 years',
        '',
        'STRATEGIC RECOMMENDATIONS:',
        '1. Primary Entry: Indonesia - Largest market ($287B) with strong fundamentals',
        '2. Secondary Markets: Vietnam and Philippines for high-growth opportunities',
        '3. Premium Segment: Singapore as regional hub for high-value services',
        '4. Industry Focus: Technology (15.2% growth), E-commerce (22.8% growth), FinTech (18.4% growth)',
        '',
        'RISK ASSESSMENT: Medium - Manageable regulatory environments, stable political situations, with localization requirements and competition as primary challenges.'
      ];

      execSummary.forEach(line => {
        if (line.startsWith('KEY FINDINGS') || line.startsWith('STRATEGIC') || line.startsWith('RISK')) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
        } else if (line.startsWith('•') || line.match(/^\d\./)) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
        }

        if (line.length > 0) {
          const lines = doc.splitTextToSize(line, contentWidth);
          lines.forEach((textLine: string) => {
            if (yPos > pageHeight - 30) {
              doc.addPage();
              yPos = margin;
            }
            doc.text(textLine, margin, yPos);
            yPos += 6;
          });
        } else {
          yPos += 4;
        }
      });

      // Page 3: Market Overview
      doc.addPage();

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('FLOW | Southeast Asian Market Entry Strategy', margin, 10);
      doc.text('Page 3', pageWidth - margin, 10, { align: 'right' });

      yPos = 30;

      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Market Overview', margin, yPos);

      yPos += 12;

      // Key metrics boxes
      const metrics = [
        { label: 'Total Market Size', value: '$901B', color: [59, 130, 246] },
        { label: 'Combined Population', value: '588.8M', color: [16, 185, 129] },
        { label: 'Average GDP Growth', value: '4.7%', color: [139, 92, 246] },
        { label: 'Digital Economy', value: '$229.5B', color: [245, 158, 11] }
      ];

      const boxWidth = (contentWidth - 15) / 4;
      metrics.forEach((metric, index) => {
        const xPos = margin + (index * (boxWidth + 5));
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2], 0.1);
        doc.rect(xPos, yPos, boxWidth, 20, 'F');

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(metric.label, xPos + boxWidth / 2, yPos + 6, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.value, xPos + boxWidth / 2, yPos + 15, { align: 'center' });
      });

      yPos += 30;

      // Country Comparison Table
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Country Comparison', margin, yPos);

      yPos += 10;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, contentWidth, 8, 'F');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');

      const headers = ['Country', 'Market Size', 'Population', 'GDP/Capita', 'Growth', 'Digital Econ'];
      const colWidth = contentWidth / headers.length;
      headers.forEach((header, i) => {
        doc.text(header, margin + (i * colWidth) + 2, yPos + 5);
      });

      yPos += 8;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      marketData.countries.forEach((country, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, contentWidth, 7, 'F');
        }

        doc.setTextColor(51, 65, 85);
        doc.text(country.name, margin + 2, yPos + 5);
        doc.text(`$${country.marketSize}B`, margin + colWidth + 2, yPos + 5);
        doc.text(`${country.population}M`, margin + (colWidth * 2) + 2, yPos + 5);
        doc.text(`$${country.gdpPerCapita.toLocaleString()}`, margin + (colWidth * 3) + 2, yPos + 5);

        doc.setTextColor(16, 185, 129);
        doc.text(`+${country.growth}%`, margin + (colWidth * 4) + 2, yPos + 5);

        doc.setTextColor(51, 65, 85);
        doc.text(`$${country.digital}B`, margin + (colWidth * 5) + 2, yPos + 5);

        yPos += 7;
      });

      yPos += 10;

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.text('Source: World Bank, IMF Economic Outlook 2024, National Statistical Offices', margin, yPos);

      // Page 4: Detailed Analysis
      doc.addPage();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('FLOW | Southeast Asian Market Entry Strategy', margin, 10);
      doc.text('Page 4', pageWidth - margin, 10, { align: 'right' });

      yPos = 30;

      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Market Entry Recommendations', margin, yPos);

      yPos += 15;

      // Tier 1 Markets
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text('TIER 1: PRIMARY ENTRY MARKETS', margin, yPos);

      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      const tier1Content = [
        '1. INDONESIA - THE ANCHOR MARKET',
        '   • Market Size: $287.2B (32% of regional total)',
        '   • Population: 273.5M (largest in SEA)',
        '   • Growth Rate: 5.2% (stable, above-average)',
        '   • Digital Economy: $77.1B (fastest growing)',
        '   • Key Advantage: Scale, young demographics, rising middle class',
        '   • Entry Strategy: Partner with local conglomerates, focus on Java region',
        '   • Timeline: 6-12 months for market entry',
        '',
        'RECOMMENDATION: ENTER - Indonesia should be the primary focus due to market scale,',
        'growth trajectory, and strategic importance as regional anchor.'
      ];

      tier1Content.forEach(line => {
        if (line.match(/^\d\./)) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
        } else if (line.includes('RECOMMENDATION')) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        const lines = doc.splitTextToSize(line, contentWidth);
        lines.forEach((textLine: string) => {
          doc.text(textLine, margin, yPos);
          yPos += 5;
        });
      });

      yPos += 5;

      // Tier 2 Markets
      doc.setFontSize(14);
      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.text('TIER 2: HIGH-GROWTH OPPORTUNITIES', margin, yPos);

      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      const tier2Content = [
        '2. VIETNAM - THE MANUFACTURING HUB',
        '   • Market Size: $142.1B',
        '   • Growth Rate: 6.8% (highest in region)',
        '   • Key Advantage: Manufacturing base, trade agreements, political stability',
        '   • Entry Strategy: Export-oriented operations, technology sector focus',
        '',
        '3. PHILIPPINES - THE OUTSOURCING CENTER',
        '   • Market Size: $156.8B',
        '   • Growth Rate: 6.2%',
        '   • Key Advantage: English proficiency, young workforce, services economy',
        '   • Entry Strategy: BPO services, digital services, consumer tech'
      ];

      tier2Content.forEach(line => {
        if (line.match(/^\d\./)) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        const lines = doc.splitTextToSize(line, contentWidth);
        lines.forEach((textLine: string) => {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text('FLOW | Southeast Asian Market Entry Strategy', margin, 10);
            doc.text('Page 5', pageWidth - margin, 10, { align: 'right' });
            yPos = 30;
          }
          doc.text(textLine, margin, yPos);
          yPos += 5;
        });
      });

      // Add more pages with detailed analysis...

      // Final Page: Recommendations
      doc.addPage();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('FLOW | Southeast Asian Market Entry Strategy', margin, 10);
      doc.text('Page 6', pageWidth - margin, 10, { align: 'right' });

      yPos = 30;

      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Strategic Action Plan', margin, yPos);

      yPos += 15;

      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      const actionPlan = [
        'PHASE 1: FOUNDATION (0-6 MONTHS)',
        '• Establish Indonesia as primary market with Jakarta office',
        '• Secure local partnerships and regulatory approvals',
        '• Conduct detailed market research and consumer studies',
        '• Build local team with regional expertise',
        '',
        'PHASE 2: EXPANSION (6-18 MONTHS)',
        '• Launch operations in Vietnam and Philippines',
        '• Scale Indonesia operations beyond Jakarta',
        '• Develop localized products and services',
        '• Establish regional supply chain',
        '',
        'PHASE 3: OPTIMIZATION (18-36 MONTHS)',
        '• Enter Thailand and Malaysia markets',
        '• Establish Singapore regional headquarters',
        '• Achieve profitability in primary markets',
        '• Explore acquisition opportunities',
        '',
        'INVESTMENT REQUIRED: $50-75M over 3 years',
        'EXPECTED ROI: 25-30% by Year 3',
        'BREAK-EVEN: 18-24 months in primary markets'
      ];

      actionPlan.forEach(line => {
        if (line.startsWith('PHASE') || line.startsWith('INVESTMENT') || line.startsWith('EXPECTED') || line.startsWith('BREAK-EVEN')) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        const lines = doc.splitTextToSize(line, contentWidth);
        lines.forEach((textLine: string) => {
          doc.text(textLine, margin, yPos);
          yPos += 6;
        });
      });

      doc.save('FLOW_SEA_Market_Entry_Strategy_Report.pdf');

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateProfessionalDeck = async () => {
    setGenerating(true);

    try {
      const deckService = ProfessionalDeckService.getInstance();
      await deckService.generateProfessionalDeck({
        selectedCountries: ['Indonesia', 'Thailand', 'Singapore', 'Vietnam', 'Malaysia', 'Philippines'],
        selectedCities: []
      });
    } catch (error) {
      console.error('Error generating professional deck:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generatePresentationDeck = () => {
    setGenerating(true);

    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // Slide 1: Title Slide
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // FLOW Logo
      doc.setFontSize(48);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('FLOW', pageWidth / 2, 50, { align: 'center' });

      // Title
      doc.setFontSize(36);
      doc.setTextColor(255, 255, 255);
      doc.text('Southeast Asian Market Entry', pageWidth / 2, 90, { align: 'center' });
      doc.text('Strategy', pageWidth / 2, 105, { align: 'center' });

      // Subtitle
      doc.setFontSize(18);
      doc.setTextColor(203, 213, 225);
      doc.text('Board Presentation | ' + new Date().getFullYear(), pageWidth / 2, 130, { align: 'center' });

      // Decorative element
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(2);
      doc.line(pageWidth / 2 - 50, 140, pageWidth / 2 + 50, 140);

      // Slide 2: Executive Summary
      doc.addPage();

      // Header bar
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, 13);
      doc.setFont('helvetica', 'normal');
      doc.text('Slide 2', pageWidth - margin, 13, { align: 'right' });

      // Content
      let yPos = 40;

      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Investment Thesis', margin, yPos);

      yPos += 20;

      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      const summaryPoints = [
        '• $901B combined market opportunity across 6 Southeast Asian economies',
        '• 4.7% average GDP growth with demographics favoring 20+ years of expansion',
        '• $229.5B digital economy growing at 20%+ annually',
        '• Indonesia, Vietnam, and Philippines offer highest growth potential',
        '• Recommend phased entry: Indonesia first, then Vietnam/Philippines',
        '• Expected ROI: 25-30% by Year 3 with $50-75M investment'
      ];

      summaryPoints.forEach(point => {
        doc.text(point, margin, yPos);
        yPos += 12;
      });

      yPos += 10;

      // Recommendation box
      doc.setFillColor(16, 185, 129, 0.1);
      doc.rect(margin, yPos, pageWidth - (2 * margin), 25, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(2);
      doc.line(margin, yPos, margin, yPos + 25);

      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATION: PROCEED', margin + 5, yPos + 10);

      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text('Southeast Asia presents a compelling market entry opportunity with manageable risks and strong upside potential.', margin + 5, yPos + 20);

      // Slide 3: Market Overview
      doc.addPage();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('MARKET OVERVIEW', margin, 13);
      doc.text('Slide 3', pageWidth - margin, 13, { align: 'right' });

      yPos = 40;

      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138);
      doc.text('Regional Market Metrics', margin, yPos);

      yPos += 15;

      // Metrics boxes
      const metrics = [
        { label: 'Market Size', value: '$901B', sublabel: 'Combined GDP', color: [59, 130, 246] },
        { label: 'Population', value: '588.8M', sublabel: 'Median age: 30', color: [16, 185, 129] },
        { label: 'Growth Rate', value: '4.7%', sublabel: 'GDP CAGR', color: [139, 92, 246] },
        { label: 'Digital Economy', value: '$229.5B', sublabel: '+20% annually', color: [245, 158, 11] }
      ];

      const boxWidth = 60;
      const boxHeight = 50;
      const spacing = (pageWidth - (2 * margin) - (4 * boxWidth)) / 3;

      metrics.forEach((metric, index) => {
        const xPos = margin + (index * (boxWidth + spacing));

        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2], 0.1);
        doc.rect(xPos, yPos, boxWidth, boxHeight, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(metric.label, xPos + boxWidth / 2, yPos + 12, { align: 'center' });

        doc.setFontSize(22);
        doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.value, xPos + boxWidth / 2, yPos + 28, { align: 'center' });

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(metric.sublabel, xPos + boxWidth / 2, yPos + 40, { align: 'center' });
      });

      yPos += 70;

      // Country data
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Markets by Size', margin, yPos);

      yPos += 12;

      const topCountries = marketData.countries.slice(0, 3);
      topCountries.forEach((country, index) => {
        const barWidth = (country.marketSize / 287.2) * 200;

        doc.setFillColor(59, 130, 246, 0.7 - (index * 0.2));
        doc.rect(margin + 50, yPos, barWidth, 15, 'F');

        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.text(country.name, margin, yPos + 10);

        doc.setTextColor(255, 255, 255);
        doc.text(`$${country.marketSize}B`, margin + 55, yPos + 10);

        doc.setFontSize(9);
        doc.setTextColor(16, 185, 129);
        doc.text(`+${country.growth}%`, margin + 260, yPos + 10);

        yPos += 20;
      });

      doc.save('FLOW_SEA_Market_Entry_Presentation.pdf');

    } catch (error) {
      console.error('Error generating presentation:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Professional Report Generator</h2>
          <p className="text-slate-300">
            Generate McKinsey-style reports and presentations for Southeast Asian market analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Written Report</h3>
                <p className="text-sm text-slate-400">Comprehensive analysis</p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Executive summary</li>
              <li>• Market analysis & data</li>
              <li>• Strategic recommendations</li>
              <li>• Risk assessment</li>
              <li>• Action plan</li>
            </ul>

            <button
              onClick={generateWrittenReport}
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>{generating ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
            <div className="flex items-center space-x-3 mb-4">
              <Presentation className="h-8 w-8 text-emerald-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Slide Deck</h3>
                <p className="text-sm text-slate-400">Board presentation</p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li>• Executive summary slide</li>
              <li>• Key metrics & visuals</li>
              <li>• Market comparisons</li>
              <li>• Strategic priorities</li>
              <li>• Investment thesis</li>
            </ul>

            <button
              onClick={generatePresentationDeck}
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>{generating ? 'Generating...' : 'Generate Deck'}</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-6 border-2 border-purple-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              NEW
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Professional Deck</h3>
                <p className="text-sm text-slate-300">Premium pitch style</p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-slate-200">
              <li>• Modern dark theme design</li>
              <li>• Split-screen layouts</li>
              <li>• Purple gradient accents</li>
              <li>• Mission & vision slides</li>
              <li>• Professional branding</li>
            </ul>

            <button
              onClick={generateProfessionalDeck}
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-purple-500/50"
            >
              <Download className="h-5 w-5" />
              <span>{generating ? 'Generating...' : 'Generate Pro Deck'}</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Reports are generated in McKinsey professional style with FLOW branding</p>
          <p className="mt-1">All data sourced from World Bank, IMF, and official national statistics (2024)</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
