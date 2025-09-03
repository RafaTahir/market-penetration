import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ExportData {
  selectedCountries: string[];
  selectedCities: string[];
  activeTab: string;
  activeInsightTab?: string;
  selectedIndustry?: string;
  selectedCaseStudy?: string;
}

export class ExportService {
  private static instance: ExportService;
  
  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async generatePDFReport(data: ExportData): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Flow brand colors
    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    const flowPurple = [139, 92, 246];
    const flowOrange = [245, 158, 11];

    // Helper function to add Flow logo
    const addFlowLogo = (x: number, y: number, size: number = 20) => {
      pdf.setFillColor(...flowBlue);
      pdf.circle(x + size/2, y + size/2, size/2, 'F');
      
      pdf.setFillColor(...flowEmerald);
      pdf.ellipse(x + size/2, y + size/3, size/3, size/8, 'F');
      
      pdf.setFillColor(...flowPurple);
      pdf.ellipse(x + size/2, y + size/2, size/3, size/8, 'F');
      
      pdf.setFillColor(...flowBlue);
      pdf.ellipse(x + size/2, y + 2*size/3, size/3, size/8, 'F');
    };

    // Helper function to check page break
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // TITLE PAGE
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Flow logo
    addFlowLogo(pageWidth/2 - 20, 40, 40);
    
    // Flow branding
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(42);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow', pageWidth / 2, 100, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Your guide to Penetrating Markets', pageWidth / 2, 115, { align: 'center' });
    
    // Report title
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian Market', pageWidth / 2, 140, { align: 'center' });
    pdf.text('Intelligence Report', pageWidth / 2, 155, { align: 'center' });
    
    // User selections highlight
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(30, 170, pageWidth - 60, 30, 5, 5, 'F');
    
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANALYSIS FOCUS', pageWidth / 2, 180, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.activeTab.toUpperCase()} Analysis`, pageWidth / 2, 190, { align: 'center' });
    if (data.activeInsightTab) {
      pdf.text(`${data.activeInsightTab.charAt(0).toUpperCase() + data.activeInsightTab.slice(1)} Intelligence`, pageWidth / 2, 197, { align: 'center' });
    }
    
    // Selected markets
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(30, 210, pageWidth - 60, 20, 5, 5, 'F');
    pdf.setFontSize(11);
    pdf.text(`Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')}`, pageWidth / 2, 222, { align: 'center' });
    
    // Date
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(30, 240, pageWidth - 60, 15, 5, 5, 'F');
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, 250, { align: 'center' });

    // EXECUTIVE SUMMARY PAGE
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 40, yPosition + 5);
    
    yPosition += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const executiveSummary = this.generateExecutiveSummary(data);
    const splitSummary = pdf.splitTextToSize(executiveSummary, pageWidth - 40);
    pdf.text(splitSummary, 20, yPosition);
    yPosition += splitSummary.length * 4 + 15;

    // USER SELECTION SUMMARY
    checkPageBreak(40);
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 35, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Your Analysis Configuration', 25, yPosition + 8);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`• Selected Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}`, 25, yPosition + 16);
    pdf.text(`• Analysis Focus: ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)}`, 25, yPosition + 22);
    if (data.selectedCities.length > 0) {
      pdf.text(`• Selected Cities: ${data.selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}`, 25, yPosition + 28);
    }
    yPosition += 45;

    // MARKET OVERVIEW
    checkPageBreak(60);
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 12, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Overview', 25, yPosition + 8);
    
    yPosition += 20;
    
    data.selectedCountries.forEach((country, index) => {
      checkPageBreak(50);
      
      const marketData = this.getMarketDataForCountry(country);
      const countryColors = [flowBlue, flowEmerald, flowPurple, flowOrange, [239, 68, 68], [6, 182, 212]];
      const currentColor = countryColors[index % countryColors.length];
      
      // Country header
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 10, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.charAt(0).toUpperCase() + country.slice(1), 25, yPosition + 7);
      
      yPosition += 15;
      
      // Market data box
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 30, 3, 3, 'F');
      pdf.setDrawColor(...currentColor);
      pdf.setLineWidth(1);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 30, 3, 3, 'S');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Population:', 25, yPosition + 6);
      pdf.text('GDP:', 25, yPosition + 12);
      pdf.text('Market Size:', 25, yPosition + 18);
      pdf.text('Growth Rate:', 25, yPosition + 24);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...currentColor);
      pdf.text(marketData.population, 60, yPosition + 6);
      pdf.text(marketData.gdp, 60, yPosition + 12);
      pdf.text(marketData.marketSize, 60, yPosition + 18);
      pdf.text(marketData.growth, 60, yPosition + 24);
      
      yPosition += 35;
    });

    // TAB-SPECIFIC ANALYSIS
    if (data.activeTab !== 'overview') {
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      yPosition = 20;
      
      addFlowLogo(15, yPosition - 5, 15);
      
      pdf.setFillColor(...flowPurple);
      pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Analysis`, 40, yPosition + 5);
      
      yPosition += 25;
      this.addTabSpecificContent(pdf, data, yPosition, pageWidth);
    }

    // Save the PDF
    pdf.save(`Flow-Market-Report-${data.activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcelReport(data: ExportData): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // User Selection Summary
    const userSummary = [{
      'Report Generated': new Date().toLocaleDateString(),
      'Analysis Focus': data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1),
      'Selected Markets': data.selectedCountries.join(', '),
      'Selected Cities': data.selectedCities.join(', '),
      'Market Intelligence Focus': data.activeInsightTab || 'N/A',
      'Industry Focus': data.selectedIndustry || 'All Industries',
      'Case Study Reference': data.selectedCaseStudy || 'N/A'
    }];
    
    const summarySheet = XLSX.utils.json_to_sheet(userSummary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Analysis Summary');

    // Market Overview for selected countries
    const marketData = data.selectedCountries.map(country => {
      const countryData = this.getMarketDataForCountry(country);
      return {
        Country: country.charAt(0).toUpperCase() + country.slice(1),
        Population: countryData.population,
        'GDP (USD)': countryData.gdp,
        'Market Size': countryData.marketSize,
        'Growth Rate': countryData.growth,
        'Digital Penetration': `${countryData.digitalPenetration}%`,
        'Opportunity Score': countryData.opportunityScore,
        'Risk Level': countryData.riskLevel
      };
    });

    const marketSheet = XLSX.utils.json_to_sheet(marketData);
    XLSX.utils.book_append_sheet(workbook, marketSheet, 'Selected Markets');

    // Tab-specific data
    if (data.activeTab === 'cities' && data.selectedCities.length > 0) {
      const cityData = this.getCityDataForExport(data.selectedCities);
      const citySheet = XLSX.utils.json_to_sheet(cityData);
      XLSX.utils.book_append_sheet(workbook, citySheet, 'City Analysis');
    }

    if (data.activeTab === 'industries') {
      const industryData = this.getIndustryDataForExport(data.selectedIndustry);
      const industrySheet = XLSX.utils.json_to_sheet(industryData);
      XLSX.utils.book_append_sheet(workbook, industrySheet, 'Industry Analysis');
    }

    if (data.activeTab === 'insights') {
      const insightData = this.getInsightDataForExport(data.activeInsightTab, data.selectedCountries);
      const insightSheet = XLSX.utils.json_to_sheet(insightData);
      XLSX.utils.book_append_sheet(workbook, insightSheet, 'Market Intelligence');
    }

    if (data.activeTab === 'cases') {
      const caseData = this.getCaseStudyDataForExport(data.selectedCaseStudy);
      const caseSheet = XLSX.utils.json_to_sheet(caseData);
      XLSX.utils.book_append_sheet(workbook, caseSheet, 'Case Studies');
    }

    if (data.activeTab === 'data') {
      const visualData = this.getVisualizationDataForExport(data.selectedCountries);
      const visualSheet = XLSX.utils.json_to_sheet(visualData);
      XLSX.utils.book_append_sheet(workbook, visualSheet, 'Data Visualization');
    }

    // Save Excel file
    XLSX.writeFile(workbook, `Flow-Market-Data-${data.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async generatePowerPointOutline(data: ExportData): Promise<void> {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let slideNumber = 1;

    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    const flowPurple = [139, 92, 246];

    const addFlowLogo = (x: number, y: number, size: number = 20) => {
      pdf.setFillColor(...flowBlue);
      pdf.circle(x + size/2, y + size/2, size/2, 'F');
      
      pdf.setFillColor(...flowEmerald);
      pdf.ellipse(x + size/2, y + size/3, size/3, size/8, 'F');
      
      pdf.setFillColor(...flowPurple);
      pdf.ellipse(x + size/2, y + size/2, size/3, size/8, 'F');
    };

    const addSlideHeader = (title: string, isTitle: boolean = false) => {
      if (isTitle) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        addFlowLogo(pageWidth/2 - 20, 40, 40);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(36);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Flow', pageWidth / 2, 100, { align: 'center' });
        
        pdf.setFontSize(24);
        pdf.text(title, pageWidth / 2, 130, { align: 'center' });
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        pdf.setFillColor(...flowBlue);
        pdf.rect(0, 0, pageWidth, 8, 'F');
        
        addFlowLogo(20, 20, 15);
        
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 45, 30);
      }
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text(`${slideNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      slideNumber++;
    };

    // Title slide
    addSlideHeader(`${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Market Analysis`, true);
    
    // User focus
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(50, 150, pageWidth - 100, 25, 5, 5, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')}`, pageWidth / 2, 165, { align: 'center' });

    // Market overview slide
    pdf.addPage();
    addSlideHeader('Market Overview');
    
    let yPos = 60;
    data.selectedCountries.forEach((country, index) => {
      const marketData = this.getMarketDataForCountry(country);
      const colors = [flowBlue, flowEmerald, flowPurple];
      const currentColor = colors[index % colors.length];
      
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(30, yPos, pageWidth - 60, 25, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.charAt(0).toUpperCase() + country.slice(1), 35, yPos + 8);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${marketData.marketSize} market • ${marketData.growth} growth • ${marketData.population} population`, 35, yPos + 18);
      
      yPos += 35;
    });

    // Tab-specific slide
    if (data.activeTab !== 'overview') {
      pdf.addPage();
      addSlideHeader(`${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Deep Dive`);
      
      yPos = 60;
      this.addPresentationTabContent(pdf, data, yPos, pageWidth);
    }

    pdf.save(`Flow-Presentation-${data.activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private generateExecutiveSummary(data: ExportData): string {
    const marketCount = data.selectedCountries.length;
    const focusArea = data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1);
    
    let summary = `This comprehensive market intelligence report provides strategic insights into ${marketCount} key Southeast Asian markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}.

ANALYSIS FOCUS: ${focusArea} Analysis
Your current analysis focuses on ${focusArea.toLowerCase()} insights across the selected markets.`;

    if (data.activeInsightTab) {
      summary += ` Specifically examining ${data.activeInsightTab} intelligence to provide targeted strategic recommendations.`;
    }

    if (data.selectedIndustry) {
      summary += ` Industry focus on ${data.selectedIndustry} sector provides sector-specific market dynamics and opportunities.`;
    }

    if (data.selectedCaseStudy) {
      summary += ` Case study analysis of ${data.selectedCaseStudy} provides proven market entry strategies and lessons learned.`;
    }

    summary += `

KEY FINDINGS FOR YOUR SELECTION:
• Total addressable market exceeds $1.2 trillion across selected regions
• Digital economy growing at 18.6% annually with mobile-first consumer behavior
• E-commerce and fintech sectors showing highest growth potential (22.8% and 18.4% CAGR)
• 456M active internet users driving digital transformation across selected markets

STRATEGIC RECOMMENDATIONS:
• Prioritize mobile-first digital strategies across all selected markets
• Establish strategic local partnerships for regulatory compliance and market access
• Focus on tier-1 cities for initial market entry with gradual tier-2 expansion
• Adapt products and services to local preferences and competitive price points`;

    return summary;
  }

  private addTabSpecificContent(pdf: any, data: ExportData, yPosition: number, pageWidth: number): void {
    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    const flowPurple = [139, 92, 246];
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    
    switch (data.activeTab) {
      case 'cities':
        pdf.text('City-Level Market Analysis', 25, yPosition);
        yPosition += 15;
        
        if (data.selectedCities.length > 0) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Selected Cities: ${data.selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}`, 25, yPosition);
          yPosition += 10;
          
          const cityInsights = [
            'Urban market penetration strategies for tier-1 cities',
            'Local business district analysis and commercial opportunities',
            'Infrastructure readiness and digital connectivity assessment',
            'Cost structure analysis and operational considerations'
          ];
          
          cityInsights.forEach(insight => {
            pdf.setTextColor(...flowBlue);
            pdf.text('•', 30, yPosition);
            pdf.setTextColor(0, 0, 0);
            pdf.text(insight, 40, yPosition);
            yPosition += 6;
          });
        }
        break;
        
      case 'industries':
        pdf.text('Industry Deep Dive Analysis', 25, yPosition);
        yPosition += 15;
        
        if (data.selectedIndustry) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Industry Focus: ${data.selectedIndustry.charAt(0).toUpperCase() + data.selectedIndustry.slice(1)}`, 25, yPosition);
          yPosition += 10;
          
          const industryData = this.getIndustrySpecificInsights(data.selectedIndustry);
          industryData.forEach(insight => {
            pdf.setTextColor(...flowEmerald);
            pdf.text('•', 30, yPosition);
            pdf.setTextColor(0, 0, 0);
            pdf.text(insight, 40, yPosition);
            yPosition += 6;
          });
        }
        break;
        
      case 'insights':
        pdf.text('Market Intelligence Analysis', 25, yPosition);
        yPosition += 15;
        
        if (data.activeInsightTab) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Intelligence Focus: ${data.activeInsightTab.charAt(0).toUpperCase() + data.activeInsightTab.slice(1)}`, 25, yPosition);
          yPosition += 10;
          
          const insightData = this.getInsightSpecificContent(data.activeInsightTab);
          insightData.forEach(insight => {
            pdf.setTextColor(...flowPurple);
            pdf.text('•', 30, yPosition);
            pdf.setTextColor(0, 0, 0);
            pdf.text(insight, 40, yPosition);
            yPosition += 6;
          });
        }
        break;
        
      case 'cases':
        pdf.text('Case Study Analysis', 25, yPosition);
        yPosition += 15;
        
        if (data.selectedCaseStudy) {
          const caseData = this.getCaseStudyInsights(data.selectedCaseStudy);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Case Study: ${caseData.company}`, 25, yPosition);
          yPosition += 10;
          
          caseData.lessons.forEach((lesson: string) => {
            pdf.setTextColor(...flowBlue);
            pdf.text('•', 30, yPosition);
            pdf.setTextColor(0, 0, 0);
            const lines = pdf.splitTextToSize(lesson, pageWidth - 50);
            pdf.text(lines, 40, yPosition);
            yPosition += lines.length * 6;
          });
        }
        break;
        
      case 'data':
        pdf.text('Data Visualization Insights', 25, yPosition);
        yPosition += 15;
        
        const dataInsights = [
          'Market size analysis and economic sector breakdown',
          'Growth trend analysis and future projections',
          'Digital adoption metrics and technology readiness',
          'Investment flows and trade analysis patterns'
        ];
        
        dataInsights.forEach(insight => {
          pdf.setTextColor(...flowBlue);
          pdf.text('•', 30, yPosition);
          pdf.setTextColor(0, 0, 0);
          pdf.text(insight, 40, yPosition);
          yPosition += 6;
        });
        break;
    }
  }

  private addPresentationTabContent(pdf: any, data: ExportData, yPos: number, pageWidth: number): void {
    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    
    switch (data.activeTab) {
      case 'cities':
        pdf.text('City Market Analysis', 30, yPos);
        yPos += 20;
        
        if (data.selectedCities.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Focus Cities: ${data.selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}`, 30, yPos);
          yPos += 15;
          
          pdf.setFillColor(...flowBlue);
          pdf.roundedRect(30, yPos, pageWidth - 60, 40, 5, 5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.text('• Urban market penetration strategies', 35, yPos + 10);
          pdf.text('• Business district analysis', 35, yPos + 18);
          pdf.text('• Infrastructure readiness assessment', 35, yPos + 26);
          pdf.text('• Cost structure optimization', 35, yPos + 34);
        }
        break;
        
      case 'industries':
        pdf.text('Industry Analysis', 30, yPos);
        yPos += 20;
        
        if (data.selectedIndustry) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Industry: ${data.selectedIndustry.charAt(0).toUpperCase() + data.selectedIndustry.slice(1)}`, 30, yPos);
          yPos += 15;
          
          const industryData = this.getIndustrySpecificInsights(data.selectedIndustry);
          pdf.setFillColor(...flowEmerald);
          pdf.roundedRect(30, yPos, pageWidth - 60, 40, 5, 5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          industryData.slice(0, 4).forEach((insight, index) => {
            pdf.text(`• ${insight}`, 35, yPos + 8 + (index * 8));
          });
        }
        break;
        
      case 'insights':
        pdf.text('Market Intelligence', 30, yPos);
        yPos += 20;
        
        if (data.activeInsightTab) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Focus: ${data.activeInsightTab.charAt(0).toUpperCase() + data.activeInsightTab.slice(1)}`, 30, yPos);
          yPos += 15;
          
          const insightData = this.getInsightSpecificContent(data.activeInsightTab);
          pdf.setFillColor(...flowPurple);
          pdf.roundedRect(30, yPos, pageWidth - 60, 40, 5, 5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          insightData.slice(0, 4).forEach((insight, index) => {
            pdf.text(`• ${insight}`, 35, yPos + 8 + (index * 8));
          });
        }
        break;
    }
  }

  private getMarketDataForCountry(country: string) {
    const marketData: { [key: string]: any } = {
      thailand: { 
        population: '69.8M', 
        gdp: '$543.5B', 
        marketSize: '$127.4B', 
        growth: '+2.8%', 
        digitalPenetration: 85,
        opportunityScore: 71,
        riskLevel: 'Medium'
      },
      singapore: { 
        population: '5.9M', 
        gdp: '$397.0B', 
        marketSize: '$89.6B', 
        growth: '+2.6%', 
        digitalPenetration: 92,
        opportunityScore: 68,
        riskLevel: 'Low'
      },
      malaysia: { 
        population: '32.7M', 
        gdp: '$432.0B', 
        marketSize: '$98.3B', 
        growth: '+4.5%', 
        digitalPenetration: 78,
        opportunityScore: 73,
        riskLevel: 'Medium'
      },
      indonesia: { 
        population: '273.5M', 
        gdp: '$1.32T', 
        marketSize: '$287.2B', 
        growth: '+5.2%', 
        digitalPenetration: 73,
        opportunityScore: 78,
        riskLevel: 'Medium-High'
      },
      philippines: { 
        population: '109.6M', 
        gdp: '$394.0B', 
        marketSize: '$156.8B', 
        growth: '+6.2%', 
        digitalPenetration: 68,
        opportunityScore: 75,
        riskLevel: 'Medium'
      },
      vietnam: { 
        population: '97.3M', 
        gdp: '$409.0B', 
        marketSize: '$142.1B', 
        growth: '+6.8%', 
        digitalPenetration: 75,
        opportunityScore: 82,
        riskLevel: 'Medium'
      }
    };
    
    return marketData[country] || { 
      population: 'N/A', 
      gdp: 'N/A', 
      marketSize: 'N/A', 
      growth: 'N/A', 
      digitalPenetration: 0,
      opportunityScore: 0,
      riskLevel: 'Unknown'
    };
  }

  private getCityDataForExport(selectedCities: string[]) {
    const cityDatabase = {
      'bangkok': { name: 'Bangkok', population: '10.7M', gdpPerCapita: '$7,800', digitalInfra: 85, businessEnv: 78 },
      'singapore-city': { name: 'Singapore', population: '5.9M', gdpPerCapita: '$65,200', digitalInfra: 95, businessEnv: 95 },
      'kuala-lumpur': { name: 'Kuala Lumpur', population: '7.9M', gdpPerCapita: '$11,200', digitalInfra: 82, businessEnv: 73 },
      'jakarta': { name: 'Jakarta', population: '34.5M', gdpPerCapita: '$4,200', digitalInfra: 75, businessEnv: 68 },
      'manila': { name: 'Manila', population: '25.0M', gdpPerCapita: '$3,500', digitalInfra: 72, businessEnv: 65 },
      'ho-chi-minh': { name: 'Ho Chi Minh City', population: '13.3M', gdpPerCapita: '$4,100', digitalInfra: 78, businessEnv: 70 }
    };

    return selectedCities.map(cityId => {
      const city = cityDatabase[cityId as keyof typeof cityDatabase];
      return {
        City: city?.name || cityId,
        Population: city?.population || 'N/A',
        'GDP per Capita': city?.gdpPerCapita || 'N/A',
        'Digital Infrastructure': city?.digitalInfra || 0,
        'Business Environment': city?.businessEnv || 0
      };
    });
  }

  private getIndustryDataForExport(selectedIndustry?: string) {
    const industryDatabase = {
      technology: { name: 'Technology & Software', marketSize: '$234.5B', growth: '15.2%', competition: 'High', opportunity: 85 },
      ecommerce: { name: 'E-commerce & Retail', marketSize: '$187.3B', growth: '22.8%', competition: 'Very High', opportunity: 78 },
      fintech: { name: 'Financial Services', marketSize: '$153.2B', growth: '18.4%', competition: 'Medium', opportunity: 92 },
      automotive: { name: 'Automotive', marketSize: '$45.8B', growth: '8.3%', competition: 'Medium', opportunity: 71 },
      healthcare: { name: 'Healthcare & Pharma', marketSize: '$78.4B', growth: '9.7%', competition: 'Low', opportunity: 88 },
      manufacturing: { name: 'Manufacturing', marketSize: '$234.1B', growth: '6.8%', competition: 'Medium', opportunity: 65 }
    };

    if (selectedIndustry && industryDatabase[selectedIndustry as keyof typeof industryDatabase]) {
      const industry = industryDatabase[selectedIndustry as keyof typeof industryDatabase];
      return [{
        Industry: industry.name,
        'Market Size': industry.marketSize,
        'Growth Rate': industry.growth,
        'Competition Level': industry.competition,
        'Opportunity Score': industry.opportunity
      }];
    }

    return Object.values(industryDatabase).map(industry => ({
      Industry: industry.name,
      'Market Size': industry.marketSize,
      'Growth Rate': industry.growth,
      'Competition Level': industry.competition,
      'Opportunity Score': industry.opportunity
    }));
  }

  private getInsightDataForExport(activeInsightTab?: string, selectedCountries: string[] = []) {
    const insightDatabase = {
      consumer: [
        { Behavior: 'Mobile Shopping', Penetration: '78.4%', Growth: '24.3%', Insight: 'Mobile-first shopping dominates' },
        { Behavior: 'Social Commerce', Penetration: '65.7%', Growth: '31.8%', Insight: 'Social media drives purchase decisions' },
        { Behavior: 'Digital Payments', Penetration: '72.1%', Growth: '28.5%', Insight: 'Cash-to-digital transition accelerating' }
      ],
      competitive: [
        { Sector: 'E-commerce', Leaders: 'Shopee, Lazada, Tokopedia', 'Market Share': '68.4%', Competition: 'High' },
        { Sector: 'Fintech', Leaders: 'Grab Financial, GoPay, TrueMoney', 'Market Share': '45.7%', Competition: 'Medium' },
        { Sector: 'Food Delivery', Leaders: 'Grab Food, foodpanda, Gojek', 'Market Share': '72.3%', Competition: 'High' }
      ],
      regulatory: selectedCountries.map(country => ({
        Country: country.charAt(0).toUpperCase() + country.slice(1),
        'Ease of Business': this.getRegulatoryScore(country, 'business'),
        'Regulatory Clarity': this.getRegulatoryScore(country, 'clarity'),
        'Digital Readiness': this.getRegulatoryScore(country, 'digital')
      }))
    };

    return insightDatabase[activeInsightTab as keyof typeof insightDatabase] || insightDatabase.consumer;
  }

  private getCaseStudyDataForExport(selectedCaseStudy?: string) {
    const caseDatabase = {
      'grab-success': {
        Company: 'Grab',
        Industry: 'Technology/Mobility',
        Investment: '$12.7B',
        Outcome: 'Market leader across 8 SEA countries',
        'Key Success Factor': 'Localized approach and ecosystem building',
        'Main Lesson': 'Adapt global business models to local contexts'
      },
      'shopee-success': {
        Company: 'Shopee',
        Industry: 'E-commerce',
        Investment: '$8.9B',
        Outcome: 'Leading e-commerce platform in SEA',
        'Key Success Factor': 'Mobile-first social commerce strategy',
        'Main Lesson': 'Mobile-first strategy essential in emerging markets'
      },
      'gojek-success': {
        Company: 'Gojek',
        Industry: 'Technology/Super App',
        Investment: '$2.5B',
        Outcome: 'Major player in Vietnamese market',
        'Key Success Factor': 'Super app ecosystem with financial inclusion',
        'Main Lesson': 'Working with existing informal economy is effective'
      }
    };

    if (selectedCaseStudy && caseDatabase[selectedCaseStudy as keyof typeof caseDatabase]) {
      return [caseDatabase[selectedCaseStudy as keyof typeof caseDatabase]];
    }

    return Object.values(caseDatabase);
  }

  private getVisualizationDataForExport(selectedCountries: string[]) {
    return selectedCountries.map(country => {
      const data = this.getMarketDataForCountry(country);
      return {
        Country: country.charAt(0).toUpperCase() + country.slice(1),
        'Market Size (B)': parseFloat(data.marketSize.replace('$', '').replace('B', '')),
        'GDP (T)': parseFloat(data.gdp.replace('$', '').replace('T', '').replace('B', '')) / (data.gdp.includes('T') ? 1 : 1000),
        'Growth Rate': parseFloat(data.growth.replace('+', '').replace('%', '')),
        'Digital Penetration': data.digitalPenetration,
        'Opportunity Score': data.opportunityScore
      };
    });
  }

  private getIndustrySpecificInsights(industry: string): string[] {
    const insights = {
      technology: [
        'AI/ML adoption driving 15.2% sector growth',
        'Cloud migration creating infrastructure opportunities',
        'Mobile-first solutions dominating market demand',
        'Cybersecurity becoming critical investment area'
      ],
      ecommerce: [
        'Social commerce growing at 31.8% annually',
        'Cross-border trade expanding rapidly',
        'Mobile commerce represents 78% of transactions',
        'Logistics optimization creating competitive advantage'
      ],
      fintech: [
        'Digital banking adoption at 69.3% penetration',
        'SME lending showing highest growth potential',
        'Cryptocurrency regulations creating clarity',
        'Cross-border payments driving innovation'
      ]
    };

    return insights[industry as keyof typeof insights] || [
      'Market dynamics analysis for selected industry',
      'Growth opportunities and competitive landscape',
      'Technology adoption trends and innovation',
      'Regulatory environment and compliance requirements'
    ];
  }

  private getInsightSpecificContent(insightTab: string): string[] {
    const content = {
      consumer: [
        'Mobile-first shopping dominates with 78.4% penetration',
        'Social commerce driving 31.8% growth in purchase decisions',
        'Digital payments adoption accelerating at 28.5% growth',
        'Sustainability focus influencing 54.2% of consumers'
      ],
      competitive: [
        'E-commerce sector highly competitive with 68.4% market concentration',
        'Fintech showing medium competition with growth opportunities',
        'Food delivery market dominated by top 3 players (72.3% share)',
        'Technology sector fragmented with innovation opportunities'
      ],
      regulatory: [
        'Singapore leads in regulatory clarity (95/100 score)',
        'Digital economy regulations creating innovation opportunities',
        'Cross-border compliance frameworks developing rapidly',
        'Regulatory sandboxes enabling fintech innovation'
      ]
    };

    return content[insightTab as keyof typeof content] || content.consumer;
  }

  private getCaseStudyInsights(caseStudy: string) {
    const cases = {
      'grab-success': {
        company: 'Grab',
        lessons: [
          'Localized approach to each market is essential for success',
          'Building ecosystem rather than single service creates stickiness',
          'Strategic partnerships with local players accelerate growth',
          'Regulatory compliance crucial for long-term sustainability'
        ]
      },
      'shopee-success': {
        company: 'Shopee',
        lessons: [
          'Mobile-first strategy essential in emerging markets',
          'Gamification and social features drive user engagement',
          'Strong logistics network creates competitive advantage',
          'Local marketing resonates better than global campaigns'
        ]
      },
      'gojek-success': {
        company: 'Gojek',
        lessons: [
          'Proven business models can be replicated with adaptation',
          'Working with existing informal economy is highly effective',
          'Super app strategy creates strong user stickiness',
          'Financial services integration drives rapid adoption'
        ]
      }
    };

    return cases[caseStudy as keyof typeof cases] || cases['grab-success'];
  }

  private getRegulatoryScore(country: string, type: string): number {
    const scores = {
      singapore: { business: 95, clarity: 92, digital: 89 },
      thailand: { business: 78, clarity: 72, digital: 68 },
      malaysia: { business: 73, clarity: 75, digital: 71 },
      indonesia: { business: 68, clarity: 65, digital: 62 },
      philippines: { business: 65, clarity: 62, digital: 58 },
      vietnam: { business: 70, clarity: 68, digital: 65 }
    };

    return scores[country as keyof typeof scores]?.[type as keyof typeof scores['singapore']] || 70;
  }
}