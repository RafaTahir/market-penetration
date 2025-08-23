import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export interface ExportData {
  selectedCountries: string[];
  selectedCities: string[];
  activeTab: string;
  activeInsightTab?: string;
  selectedIndustry?: string;
  selectedCaseStudy?: string;
  marketData?: any;
  caseStudies?: any;
  industryData?: any;
}

export class ExportService {
  private static instance: ExportService;
  
  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  private addFlowLogo(pdf: jsPDF, x: number, y: number, size: number = 20): void {
    // Flow logo colors
    const primaryBlue = [59, 130, 246];
    const emeraldGreen = [16, 185, 129];
    const purple = [139, 92, 246];
    
    // Create Flow logo
    pdf.setFillColor(...primaryBlue);
    pdf.circle(x + size/2, y + size/2, size/2, 'F');
    
    // Add flow waves
    pdf.setFillColor(...emeraldGreen);
    pdf.ellipse(x + size/2, y + size/3, size/3, size/8, 'F');
    
    pdf.setFillColor(...purple);
    pdf.ellipse(x + size/2, y + size/2, size/3, size/8, 'F');
    
    pdf.setFillColor(...primaryBlue);
    pdf.ellipse(x + size/2, y + 2*size/3, size/3, size/8, 'F');
  }

  async generatePDFReport(data: ExportData, currentViewData?: any): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Color palette
    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    const flowPurple = [139, 92, 246];
    const flowOrange = [245, 158, 11];

    // Title Page with Flow branding
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Add Flow logo
    this.addFlowLogo(pdf, pageWidth/2 - 15, 30, 30);
    
    // Flow branding
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow', pageWidth / 2, 80, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Your guide to Penetrating Markets', pageWidth / 2, 95, { align: 'center' });
    
    // Report title
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian', pageWidth / 2, 120, { align: 'center' });
    pdf.text('Market Intelligence Report', pageWidth / 2, 135, { align: 'center' });
    
    // Selected markets info with colorful design
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(30, 150, pageWidth - 60, 25, 5, 5, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Markets Analyzed: ${data.selectedCountries.length}`, pageWidth / 2, 160, { align: 'center' });
    pdf.text(data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • '), pageWidth / 2, 170, { align: 'center' });
    
    // Date and report info with styling
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(30, 185, pageWidth - 60, 15, 5, 5, 'F');
    
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, 195, { align: 'center' });
    
    // Data sources disclaimer
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Data Sources: World Bank, IMF, Google-Temasek e-Conomy SEA 2024,', pageWidth / 2, 220, { align: 'center' });
    pdf.text('Nielsen Consumer Insights, PwC FinTech Survey, Government Statistics', pageWidth / 2, 230, { align: 'center' });

    // Executive Summary Page with enhanced design
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    
    // Add Flow logo to header
    this.addFlowLogo(pdf, 15, yPosition - 5, 15);
    
    // Colorful header
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 40, yPosition + 5);
    
    yPosition += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const executiveSummary = `This comprehensive market intelligence report provides strategic insights into ${data.selectedCountries.length} key Southeast Asian markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}.

REPORT SCOPE & USER SELECTIONS:
• Selected Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
• Selected Cities: ${data.selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}
• Analysis Focus: ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Analysis
${data.activeInsightTab ? `• Market Intelligence Focus: ${data.activeInsightTab.charAt(0).toUpperCase() + data.activeInsightTab.slice(1)} Insights` : ''}
${data.selectedIndustry ? `• Industry Focus: ${data.selectedIndustry}` : ''}
${data.selectedCaseStudy ? `• Case Study Reference: ${data.selectedCaseStudy}` : ''}

KEY MARKET INSIGHTS:
• Total addressable market exceeds $1.2 trillion across selected regions
• Digital economy growing at 18.6% annually with mobile-first consumer behavior
• E-commerce and fintech sectors showing highest growth potential (22.8% and 18.4% CAGR)
• Cross-border trade opportunities expanding rapidly at 31.4% growth
• 456M active internet users driving digital transformation

STRATEGIC MARKET ENTRY RECOMMENDATIONS:
• Prioritize mobile-first digital strategies across all markets
• Establish strategic local partnerships for regulatory compliance and market access
• Focus on tier-1 cities for initial market entry with gradual tier-2 expansion
• Adapt products and services to local preferences and competitive price points
• Invest in local talent acquisition and comprehensive cultural training programs

MARKET ENTRY PRIORITY FRAMEWORK:
1. Vietnam and Philippines: Highest growth potential markets (7.0% and 6.4% GDP growth)
2. Singapore and Malaysia: Stable, mature market opportunities with strong infrastructure
3. Thailand and Indonesia: Large-scale market opportunities with moderate complexity

DATA SOURCES & METHODOLOGY:
This report synthesizes data from World Bank Economic Outlook, IMF databases, Google-Temasek e-Conomy SEA 2024, Nielsen Consumer Insights, PwC FinTech Survey, and official government statistics from each country's central banks and statistical offices.`;

    const splitSummary = pdf.splitTextToSize(executiveSummary, pageWidth - 40);
    pdf.text(splitSummary, 20, yPosition);

    // Add colorful market size chart placeholder
    yPosition += splitSummary.length * 5 + 20;
    checkPageBreak(60);
    
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'F');
    
    // Add chart border with Flow colors
    pdf.setDrawColor(...flowEmerald);
    pdf.setLineWidth(2);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'S');
    
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Size Comparison Chart', pageWidth / 2, yPosition + 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Indonesia: $287.2B | Thailand: $127.4B | Singapore: $89.6B', pageWidth / 2, yPosition + 25, { align: 'center' });
    pdf.text('Malaysia: $98.3B | Philippines: $156.8B | Vietnam: $142.1B', pageWidth / 2, yPosition + 35, { align: 'center' });
    pdf.setTextColor(...flowBlue);
    pdf.text('Source: World Bank, IMF Economic Outlook 2024', pageWidth / 2, yPosition + 45, { align: 'center' });

    // Market Overview with enhanced styling and data sources
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    yPosition = 20;
    
    // Add Flow logo to header
    this.addFlowLogo(pdf, 15, yPosition - 5, 15);
    
    // Colorful header
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Overview & Analysis', 40, yPosition + 5);
    
    yPosition += 25;
    
    data.selectedCountries.forEach((country, index) => {
      checkPageBreak(100);
      
      // Country header with alternating colors
      const countryColors = [flowBlue, flowEmerald, flowPurple, flowOrange, [239, 68, 68], [6, 182, 212]];
      const currentColor = countryColors[index % countryColors.length];
      
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(20, yPosition - 3, pageWidth - 40, 12, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.charAt(0).toUpperCase() + country.slice(1), 25, yPosition + 4);
      
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const marketData = this.getMarketDataForCountry(country);
      
      // Create a styled info box with gradient effect
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 55, 3, 3, 'F');
      pdf.setDrawColor(...currentColor);
      pdf.setLineWidth(2);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 55, 3, 3, 'S');
      
      // Key metrics in styled columns
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Population:', 25, yPosition + 8);
      pdf.text('GDP:', 25, yPosition + 16);
      pdf.text('Market Size:', 25, yPosition + 24);
      pdf.text('Growth Rate:', 25, yPosition + 32);
      pdf.text('Digital Penetration:', 25, yPosition + 40);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...currentColor);
      pdf.text(marketData.population, 70, yPosition + 8);
      pdf.text(marketData.gdp, 70, yPosition + 16);
      pdf.text(marketData.marketSize, 70, yPosition + 24);
      pdf.text(marketData.growth, 70, yPosition + 32);
      pdf.text(`${marketData.digitalPenetration}%`, 70, yPosition + 40);
      
      // Add data source
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(`Source: ${marketData.dataSource}`, 25, yPosition + 50);
      
      yPosition += 65;
      
      // Opportunities section with colorful bullets
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Market Opportunities:', 25, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      marketData.opportunities.forEach((opportunity: string, oppIndex: number) => {
        const bulletColors = [flowEmerald, flowBlue, flowPurple, flowOrange];
        pdf.setTextColor(...bulletColors[oppIndex % bulletColors.length]);
        pdf.text(`• ${opportunity}`, 30, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
    });
    // Add User-Specific Analysis Section
    if (data.activeTab !== 'overview') {
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      yPosition = 20;
      
      // Add Flow logo to header
      this.addFlowLogo(pdf, 15, yPosition - 5, 15);
      
      // Colorful header
      pdf.setFillColor(...flowPurple);
      pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Analysis`, 40, yPosition + 5);
      
      yPosition += 30;
      
      // Add specific analysis based on user's current view
      this.addUserSpecificAnalysis(pdf, data, yPosition, pageWidth, pageHeight);
    }

    // Industry Analysis with enhanced charts and data sources
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    yPosition = 20;
    
    // Add Flow logo to header
    this.addFlowLogo(pdf, 15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Industry Analysis & Growth Opportunities', 40, yPosition + 5);
    
    yPosition += 30;
    
    const industries = [
      { name: 'Technology & Software', marketSize: '$234.5B', growth: '15.2%', opportunity: 'Very High', source: 'IDC Asia Pacific, Gartner' },
      { name: 'E-commerce & Retail', marketSize: '$187.3B', growth: '22.8%', opportunity: 'Very High', source: 'Google-Temasek e-Conomy SEA 2024' },
      { name: 'Financial Services', marketSize: '$153.2B', growth: '18.4%', opportunity: 'High', source: 'PwC FinTech Survey, EY ASEAN Banking' },
      { name: 'Healthcare & Pharma', marketSize: '$102.1B', growth: '12.3%', opportunity: 'High', source: 'IQVIA, McKinsey Global Health Institute' },
      { name: 'Manufacturing', marketSize: '$128.4B', growth: '8.7%', opportunity: 'Medium', source: 'ASEAN Manufacturing Survey 2024' }
    ];

    // Create enhanced industry table with colorful styling
    const tableStartY = yPosition;
    const rowHeight = 15;
    
    // Table header with gradient
    pdf.setFillColor(71, 85, 105);
    pdf.rect(20, tableStartY, pageWidth - 40, rowHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Industry Sector', 25, tableStartY + 10);
    pdf.text('Market Size', 85, tableStartY + 10);
    pdf.text('Growth', 125, tableStartY + 10);
    pdf.text('Opportunity', 155, tableStartY + 10);
    
    yPosition = tableStartY + rowHeight;
    
    industries.forEach((industry, index) => {
      const isEven = index % 2 === 0;
      const rowColors = isEven ? [248, 250, 252] : [241, 245, 249];
      pdf.setFillColor(...rowColors);
      pdf.rect(20, yPosition, pageWidth - 40, rowHeight, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(industry.name, 25, yPosition + 10);
      pdf.text(industry.marketSize, 85, yPosition + 10);
      
      // Color-coded growth
      pdf.setTextColor(...flowEmerald);
      pdf.text(industry.growth, 125, yPosition + 10);
      
      // Color-coded opportunity
      const oppColor = industry.opportunity === 'Very High' ? flowEmerald : 
                      industry.opportunity === 'High' ? flowBlue : flowOrange;
      pdf.setTextColor(...oppColor);
      pdf.text(industry.opportunity, 155, yPosition + 10);
      
      yPosition += rowHeight;
    });

    // Add data sources section
    yPosition += 10;
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.text('Data Sources:', 25, yPosition);
    yPosition += 5;
    industries.forEach((industry) => {
      pdf.text(`• ${industry.name}: ${industry.source}`, 30, yPosition);
      yPosition += 4;
    });

    // Digital Adoption Analysis Page
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    yPosition = 20;
    
    // Add Flow logo to header
    this.addFlowLogo(pdf, 15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowOrange);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Digital Adoption & Consumer Behavior', 40, yPosition + 5);
    
    yPosition += 30;
    
    // Digital metrics with colorful presentation
    const digitalMetrics = [
      { metric: 'Mobile Penetration', average: '78.9%', leader: 'Singapore (92.3%)', source: 'IMDA Digital Society Report 2024' },
      { metric: 'Internet Penetration', average: '78.5%', leader: 'Malaysia (84.2%)', source: 'We Are Social Digital 2024 Report' },
      { metric: 'E-commerce Adoption', average: '58.3%', leader: 'Singapore (78.2%)', source: 'Google-Temasek e-Conomy SEA 2024' },
      { metric: 'Digital Payments', average: '66.9%', leader: 'Singapore (85.7%)', source: 'Visa Consumer Payment Attitudes Study' }
    ];

    digitalMetrics.forEach((metric, index) => {
      const metricColors = [flowBlue, flowEmerald, flowPurple, flowOrange];
      const currentColor = metricColors[index % metricColors.length];
      
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(metric.metric, 25, yPosition + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`Regional Average: ${metric.average}`, 25, yPosition + 16);
      pdf.text(`Market Leader: ${metric.leader}`, 25, yPosition + 22);
      
      yPosition += 30;
    });

    // Add footer to each page with Flow branding
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer background
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      
      // Flow logo in footer
      this.addFlowLogo(pdf, 15, pageHeight - 12, 8);
      
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 5);
      pdf.text('© 2025 Flow - Your guide to Penetrating Markets', 30, pageHeight - 5);
    }

    // Save the PDF
    pdf.save(`Flow-Market-Intelligence-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcelReport(data: ExportData, currentViewData?: any): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Add User Selection Summary Sheet
    const userSelectionData = [{
      'Report Generated': new Date().toLocaleDateString(),
      'Selected Markets': data.selectedCountries.join(', '),
      'Selected Cities': data.selectedCities.join(', '),
      'Active Analysis Tab': data.activeTab,
      'Market Intelligence Focus': data.activeInsightTab || 'N/A',
      'Industry Focus': data.selectedIndustry || 'All Industries',
      'Case Study Reference': data.selectedCaseStudy || 'N/A'
    }];
    
    const userSelectionSheet = XLSX.utils.json_to_sheet(userSelectionData);
    XLSX.utils.book_append_sheet(workbook, userSelectionSheet, 'Report Summary');
    // Market Overview Sheet with comprehensive data and sources
    const marketOverview = data.selectedCountries.map(country => {
      const marketData = this.getMarketDataForCountry(country);
      return {
        Country: country.charAt(0).toUpperCase() + country.slice(1),
        Population: marketData.population,
        'GDP (USD)': marketData.gdp,
        'Market Size': marketData.marketSize,
        'Growth Rate': marketData.growth,
        'Digital Penetration': `${marketData.digitalPenetration}%`,
        'Opportunity Score': marketData.opportunityScore,
        'Risk Level': marketData.riskLevel,
        'Urbanization Rate': marketData.urbanization || 'N/A',
        'Internet Users': marketData.internetUsers || 'N/A',
        'Mobile Subscribers': marketData.mobileSubscribers || 'N/A',
        'Data Source': marketData.dataSource
      };
    });

    const marketSheet = XLSX.utils.json_to_sheet(marketOverview);
    
    // Add Flow branding and styling
    const headerStyle = {
      fill: { fgColor: { rgb: "3B82F6" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center" }
    };
    
    // Apply header styling
    const range = XLSX.utils.decode_range(marketSheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!marketSheet[cellAddress]) continue;
      marketSheet[cellAddress].s = headerStyle;
    }
    
    XLSX.utils.book_append_sheet(workbook, marketSheet, 'Market Overview');

    // Industry Analysis Sheet with sources
    const industryData = [
      { Industry: 'Technology & Software', 'Market Size (B)': 234.5, 'Growth Rate': 15.2, Competition: 'High', 'Opportunity Score': 85, Source: 'IDC Asia Pacific, Gartner' },
      { Industry: 'E-commerce & Retail', 'Market Size (B)': 187.3, 'Growth Rate': 22.8, Competition: 'High', 'Opportunity Score': 78, Source: 'Google-Temasek e-Conomy SEA 2024' },
      { Industry: 'Financial Services', 'Market Size (B)': 153.2, 'Growth Rate': 18.4, Competition: 'Medium', 'Opportunity Score': 92, Source: 'PwC FinTech Survey, EY ASEAN Banking' },
      { Industry: 'Healthcare & Pharma', 'Market Size (B)': 102.1, 'Growth Rate': 12.3, Competition: 'Low', 'Opportunity Score': 88, Source: 'IQVIA, McKinsey Global Health Institute' },
      { Industry: 'Manufacturing', 'Market Size (B)': 128.4, 'Growth Rate': 8.7, Competition: 'Medium', 'Opportunity Score': 65, Source: 'ASEAN Manufacturing Survey 2024' },
      { Industry: 'Tourism & Hospitality', 'Market Size (B)': 84.2, 'Growth Rate': -2.1, Competition: 'High', 'Opportunity Score': 45, Source: 'UNWTO, ASEAN Tourism Statistics' }
    ];

    const industrySheet = XLSX.utils.json_to_sheet(industryData);
    XLSX.utils.book_append_sheet(workbook, industrySheet, 'Industry Analysis');

    // Digital Metrics Sheet with comprehensive data and sources
    const digitalData = [
      { Country: 'Singapore', 'Internet Penetration': '89.4%', 'Mobile Penetration': '92.3%', 'E-commerce Adoption': '78.2%', 'Digital Payments': '85.7%', 'Social Media Users': '83.1%', 'Cloud Adoption': '72.4%', Source: 'IMDA Digital Society Report 2024' },
      { Country: 'Thailand', 'Internet Penetration': '82.1%', 'Mobile Penetration': '85.2%', 'E-commerce Adoption': '65.3%', 'Digital Payments': '72.8%', 'Social Media Users': '76.4%', 'Cloud Adoption': '58.2%', Source: 'NBTC, ETDA Digital Thailand Report 2024' },
      { Country: 'Malaysia', 'Internet Penetration': '84.2%', 'Mobile Penetration': '78.9%', 'E-commerce Adoption': '58.7%', 'Digital Payments': '68.3%', 'Social Media Users': '81.5%', 'Cloud Adoption': '54.1%', Source: 'MCMC, MDEC Malaysia Digital Economy Report' },
      { Country: 'Indonesia', 'Internet Penetration': '71.8%', 'Mobile Penetration': '73.4%', 'E-commerce Adoption': '52.6%', 'Digital Payments': '61.2%', 'Social Media Users': '68.9%', 'Cloud Adoption': '45.3%', Source: 'Kominfo, APJII Internet Survey 2024' },
      { Country: 'Philippines', 'Internet Penetration': '67.3%', 'Mobile Penetration': '68.7%', 'E-commerce Adoption': '45.8%', 'Digital Payments': '55.4%', 'Social Media Users': '72.1%', 'Cloud Adoption': '41.6%', Source: 'DICT, Hootsuite Digital Philippines Report' },
      { Country: 'Vietnam', 'Internet Penetration': '77.2%', 'Mobile Penetration': '75.3%', 'E-commerce Adoption': '49.4%', 'Digital Payments': '58.7%', 'Social Media Users': '74.8%', 'Cloud Adoption': '43.2%', Source: 'MIC Vietnam, VECOM E-commerce Report 2024' }
    ];

    const digitalSheet = XLSX.utils.json_to_sheet(digitalData);
    XLSX.utils.book_append_sheet(workbook, digitalSheet, 'Digital Metrics');

    // Consumer Behavior Sheet
    const consumerData = [
      { Behavior: 'Mobile Shopping', 'Penetration Rate': '78.4%', 'Growth Rate': '24.3%', Source: 'Nielsen Consumer Insights SEA 2024' },
      { Behavior: 'Social Commerce', 'Penetration Rate': '65.7%', 'Growth Rate': '31.8%', Source: 'Meta Business & Bain Social Commerce Report' },
      { Behavior: 'Digital Payments', 'Penetration Rate': '72.1%', 'Growth Rate': '28.5%', Source: 'Visa Consumer Payment Attitudes Study' },
      { Behavior: 'Video Streaming', 'Penetration Rate': '84.2%', 'Growth Rate': '18.7%', Source: 'Media Partners Asia OTT Report 2024' },
      { Behavior: 'Food Delivery', 'Penetration Rate': '56.8%', 'Growth Rate': '22.4%', Source: 'Grab-Kantar SEA Consumer Report' },
      { Behavior: 'Online Banking', 'Penetration Rate': '69.3%', 'Growth Rate': '15.9%', Source: 'EY ASEAN Digital Banking Survey' }
    ];

    const consumerSheet = XLSX.utils.json_to_sheet(consumerData);
    XLSX.utils.book_append_sheet(workbook, consumerSheet, 'Consumer Behavior');

    // Growth Projections Sheet with sources
    const growthData = [
      { Year: 2024, Indonesia: 5.2, Thailand: 2.8, Singapore: 2.6, Malaysia: 4.5, Philippines: 6.2, Vietnam: 6.8, Source: 'IMF World Economic Outlook 2024' },
      { Year: 2025, Indonesia: 5.4, Thailand: 3.0, Singapore: 2.8, Malaysia: 4.7, Philippines: 6.4, Vietnam: 7.0, Source: 'IMF World Economic Outlook 2024 (Projected)' },
      { Year: 2026, Indonesia: 5.6, Thailand: 3.2, Singapore: 3.0, Malaysia: 4.9, Philippines: 6.6, Vietnam: 7.2, Source: 'IMF World Economic Outlook 2024 (Projected)' },
      { Year: 2027, Indonesia: 5.8, Thailand: 3.4, Singapore: 3.2, Malaysia: 5.1, Philippines: 6.8, Vietnam: 7.4, Source: 'IMF World Economic Outlook 2024 (Projected)' }
    ];

    const growthSheet = XLSX.utils.json_to_sheet(growthData);
    XLSX.utils.book_append_sheet(workbook, growthSheet, 'Growth Projections');

    // Add Current View Data Sheet if available
    if (currentViewData && data.activeTab !== 'overview') {
      const currentViewSheet = XLSX.utils.json_to_sheet(currentViewData);
      XLSX.utils.book_append_sheet(workbook, currentViewSheet, `${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Data`);
    }

    // Save the Excel file
    XLSX.writeFile(workbook, `Flow-Market-Data-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async generatePowerPointOutline(data: ExportData, currentViewData?: any): Promise<void> {
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for presentation
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let slideNumber = 1;

    // Color palette
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

    // Helper function to add slide header
    const addSlideHeader = (title: string, isTitle: boolean = false) => {
      if (isTitle) {
        // Title slide background
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Flow logo
        addFlowLogo(pageWidth/2 - 15, 30, 30);
        
        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(36);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Flow', pageWidth / 2, 80, { align: 'center' });
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184);
        pdf.text('Your guide to Penetrating Markets', pageWidth / 2, 95, { align: 'center' });
        
        pdf.setFontSize(28);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, pageWidth / 2, 120, { align: 'center' });
      } else {
        // Regular slide background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header gradient bar
        pdf.setFillColor(...flowBlue);
        pdf.rect(0, 0, pageWidth, 8, 'F');
        
        // Flow logo
        addFlowLogo(20, 20, 15);
        
        // Title
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 45, 30);
      }
      
      // Slide number
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text(`${slideNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      slideNumber++;
    };

    // Slide 1: Title Slide
    addSlideHeader('Southeast Asian Market Intelligence Report', true);
    
    // Selected markets info
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(50, 140, pageWidth - 100, 25, 5, 5, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Markets Analyzed: ${data.selectedCountries.length}`, pageWidth / 2, 150, { align: 'center' });
    pdf.text(data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • '), pageWidth / 2, 160, { align: 'center' });
    
    // Add user focus area
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(50, 175, pageWidth - 100, 15, 5, 5, 'F');
    pdf.setFontSize(12);
    pdf.text(`Analysis Focus: ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)}`, pageWidth / 2, 185, { align: 'center' });
    
    // Date
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(50, 200, pageWidth - 100, 15, 5, 5, 'F');
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 210, { align: 'center' });

    // Slide 2: Executive Summary
    pdf.addPage();
    addSlideHeader('Executive Summary');
    
    let yPos = 60;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Market Insights', 30, yPos);
    
    yPos += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const insights = [
      'Total addressable market exceeds $1.2 trillion across selected regions',
      'Digital economy growing at 18.6% annually with mobile-first behavior',
      'E-commerce and fintech sectors showing highest growth (22.8% and 18.4% CAGR)',
      '456M active internet users driving digital transformation'
    ];
    
    insights.forEach(insight => {
      pdf.setTextColor(...flowBlue);
      pdf.text('•', 35, yPos);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(insight, pageWidth - 80);
      pdf.text(lines, 45, yPos);
      yPos += lines.length * 6 + 3;
    });
    
    yPos += 10;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Recommendations', 30, yPos);
    
    yPos += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const recommendations = [
      'Prioritize mobile-first digital strategies across all markets',
      'Establish strategic local partnerships for regulatory compliance',
      'Focus on tier-1 cities for initial market entry',
      'Adapt products to local preferences and competitive pricing'
    ];
    
    recommendations.forEach(rec => {
      pdf.setTextColor(...flowEmerald);
      pdf.text('•', 35, yPos);
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(rec, pageWidth - 80);
      pdf.text(lines, 45, yPos);
      yPos += lines.length * 6 + 3;
    });

    // Slide 3: Market Overview
    pdf.addPage();
    addSlideHeader('Market Size Overview');
    
    yPos = 60;
    data.selectedCountries.forEach((country, index) => {
      const marketData = this.getMarketDataForCountry(country);
      const colors = [flowBlue, flowEmerald, flowPurple, flowOrange];
      const currentColor = colors[index % colors.length];
      
      // Country header
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(30, yPos - 3, pageWidth - 60, 12, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.charAt(0).toUpperCase() + country.slice(1), 35, yPos + 4);
      
      yPos += 20;
      
      // Market data in columns
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const dataPoints = [
        `Population: ${marketData.population}`,
        `GDP: ${marketData.gdp}`,
        `Market Size: ${marketData.marketSize}`,
        `Growth: ${marketData.growth}`
      ];
      
      dataPoints.forEach((point, idx) => {
        const xPos = 35 + (idx % 2) * 120;
        const yOffset = Math.floor(idx / 2) * 8;
        pdf.text(point, xPos, yPos + yOffset);
      });
      
      yPos += 25;
      
      // Data source
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(`Source: ${marketData.dataSource}`, 35, yPos);
      yPos += 15;
    });

    // Add User-Specific Analysis Slide
    if (data.activeTab !== 'overview') {
      pdf.addPage();
      addSlideHeader(`${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Analysis`);
      
      yPos = 60;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Focused Analysis: ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)}`, 30, yPos);
      
      yPos += 20;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Add specific content based on active tab
      if (data.activeTab === 'cities') {
        pdf.text(`Selected Cities: ${data.selectedCities.map(c => c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}`, 30, yPos);
        yPos += 15;
        pdf.text('City-level market analysis provides granular insights for targeted market entry strategies.', 30, yPos);
      } else if (data.activeTab === 'industries') {
        pdf.text(`Industry Focus: ${data.selectedIndustry || 'All Industries'}`, 30, yPos);
        yPos += 15;
        pdf.text('Industry-specific analysis reveals sector opportunities and competitive dynamics.', 30, yPos);
      } else if (data.activeTab === 'insights') {
        pdf.text(`Market Intelligence Focus: ${data.activeInsightTab || 'Overview'}`, 30, yPos);
        yPos += 15;
        pdf.text('Deep market intelligence provides actionable insights for strategic decision-making.', 30, yPos);
      } else if (data.activeTab === 'cases') {
        pdf.text(`Case Study Reference: ${data.selectedCaseStudy || 'Multiple Cases'}`, 30, yPos);
        yPos += 15;
        pdf.text('Real-world case studies provide proven strategies and lessons learned from market entries.', 30, yPos);
      } else if (data.activeTab === 'data') {
        pdf.text('Data Visualization Analysis: Comprehensive charts and metrics', 30, yPos);
        yPos += 15;
        pdf.text('Advanced data visualizations reveal patterns and trends for informed market decisions.', 30, yPos);
      }
    }
    // Slide 4: Industry Analysis
    pdf.addPage();
    addSlideHeader('Industry Landscape');
    
    yPos = 60;
    const industries = [
      { name: 'Technology & Software', size: '$234.5B', growth: '15.2%', source: 'IDC Asia Pacific, Gartner' },
      { name: 'E-commerce & Retail', size: '$187.3B', growth: '22.8%', source: 'Google-Temasek e-Conomy SEA 2024' },
      { name: 'Financial Services', size: '$153.2B', growth: '18.4%', source: 'PwC FinTech Survey' },
      { name: 'Healthcare & Pharma', size: '$102.1B', growth: '12.3%', source: 'IQVIA, McKinsey Global Health Institute' }
    ];
    
    industries.forEach((industry, index) => {
      const colors = [flowBlue, flowEmerald, flowPurple, flowOrange];
      const currentColor = colors[index % colors.length];
      
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(30, yPos, pageWidth - 60, 20, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(industry.name, 35, yPos + 8);
      pdf.text(`${industry.size} • ${industry.growth} growth`, 35, yPos + 15);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.text(`Source: ${industry.source}`, 35, yPos + 25);
      
      yPos += 35;
    });

    // Slide 5: Digital Adoption
    pdf.addPage();
    addSlideHeader('Digital Transformation Landscape');
    
    yPos = 60;
    const digitalData = [
      { country: 'Singapore', mobile: '92.3%', internet: '89.4%', source: 'IMDA Digital Society Report 2024' },
      { country: 'Thailand', mobile: '85.2%', internet: '82.1%', source: 'NBTC, ETDA Digital Thailand Report 2024' },
      { country: 'Malaysia', mobile: '78.9%', internet: '84.2%', source: 'MCMC, MDEC Malaysia Digital Economy Report' }
    ];
    
    digitalData.forEach((data, index) => {
      const colors = [flowBlue, flowEmerald, flowPurple];
      const currentColor = colors[index % colors.length];
      
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(30, yPos, pageWidth - 60, 25, 3, 3, 'F');
      pdf.setDrawColor(...currentColor);
      pdf.setLineWidth(2);
      pdf.roundedRect(30, yPos, pageWidth - 60, 25, 3, 3, 'S');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.country, 35, yPos + 8);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Mobile: ${data.mobile} • Internet: ${data.internet}`, 35, yPos + 15);
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(`Source: ${data.source}`, 35, yPos + 22);
      
      yPos += 35;
    });

    // Slide 6: Market Entry Strategy
    pdf.addPage();
    addSlideHeader('Market Entry Strategy Framework');
    
    yPos = 60;
    const phases = [
      {
        title: 'Phase 1: Foundation (0-6 months)',
        items: ['Regulatory assessment', 'Local partnerships', 'Digital presence', 'Market research'],
        color: flowEmerald
      },
      {
        title: 'Phase 2: Launch (6-18 months)',
        items: ['Pilot programs', 'Customer service', 'Product localization', 'Marketing campaigns'],
        color: flowBlue
      },
      {
        title: 'Phase 3: Scale (18+ months)',
        items: ['Multi-market expansion', 'Operations setup', 'Supply chain', 'Strategic acquisitions'],
        color: flowPurple
      }
    ];
    
    phases.forEach((phase, index) => {
      pdf.setFillColor(...phase.color);
      pdf.roundedRect(30, yPos, pageWidth - 60, 35, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(phase.title, 35, yPos + 8);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      phase.items.forEach((item, idx) => {
        pdf.text(`• ${item}`, 35, yPos + 15 + (idx * 5));
      });
      
      yPos += 45;
    });

    // Final slide: Thank You
    pdf.addPage();
    addSlideHeader('Thank You', true);
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ready to enter Southeast Asian markets?', pageWidth / 2, 140, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Contact our team for personalized market entry strategies', pageWidth / 2, 160, { align: 'center' });
    pdf.text('and implementation support.', pageWidth / 2, 175, { align: 'center' });

    // Save the PDF
    pdf.save(`Flow-Market-Presentation-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private addUserSpecificAnalysis(pdf: any, data: ExportData, yPosition: number, pageWidth: number, pageHeight: number): void {
    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    const flowPurple = [139, 92, 246];
    const flowOrange = [245, 158, 11];
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    
    if (data.activeTab === 'cities') {
      pdf.text('City-Level Market Analysis', 25, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
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
        yPosition += 8;
      });
      
    } else if (data.activeTab === 'industries') {
      pdf.text('Industry Deep Dive Analysis', 25, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Industry Focus: ${data.selectedIndustry || 'All Industries'}`, 25, yPosition);
      yPosition += 10;
      
      const industryInsights = [
        'Sector-specific market dynamics and growth drivers',
        'Competitive landscape analysis and market positioning',
        'Technology adoption trends and innovation opportunities',
        'Regulatory environment and compliance requirements'
      ];
      
      industryInsights.forEach(insight => {
        pdf.setTextColor(...flowEmerald);
        pdf.text('•', 30, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text(insight, 40, yPosition);
        yPosition += 8;
      });
      
    } else if (data.activeTab === 'insights') {
      pdf.text('Market Intelligence Deep Dive', 25, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Intelligence Focus: ${data.activeInsightTab || 'Market Overview'}`, 25, yPosition);
      yPosition += 10;
      
      const intelligenceAreas = [
        'Consumer behavior patterns and purchasing preferences',
        'Competitive landscape mapping and market positioning',
        'Regulatory environment assessment and compliance roadmap',
        'Digital transformation trends and technology adoption'
      ];
      
      intelligenceAreas.forEach(area => {
        pdf.setTextColor(...flowPurple);
        pdf.text('•', 30, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text(area, 40, yPosition);
        yPosition += 8;
      });
      
    } else if (data.activeTab === 'cases') {
      pdf.text('Case Study Analysis', 25, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Case Study Focus: ${data.selectedCaseStudy || 'Multiple Market Entry Cases'}`, 25, yPosition);
      yPosition += 10;
      
      const caseInsights = [
        'Successful market entry strategies and implementation frameworks',
        'Common failure patterns and risk mitigation approaches',
        'Local adaptation requirements and cultural considerations',
        'Timeline expectations and investment requirements'
      ];
      
      caseInsights.forEach(insight => {
        pdf.setTextColor(...flowOrange);
        pdf.text('•', 30, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.text(insight, 40, yPosition);
        yPosition += 8;
      });
      
    } else if (data.activeTab === 'data') {
      pdf.text('Data Visualization Insights', 25, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Comprehensive data analysis across multiple dimensions', 25, yPosition);
      yPosition += 10;
      
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
        yPosition += 8;
      });
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
        riskLevel: 'Medium',
        urbanization: '51.4%',
        internetUsers: '57.3M',
        mobileSubscribers: '59.4M',
        dataSource: 'Bank of Thailand, NESDC, ETDA Digital Thailand Report 2024',
        opportunities: [
          'Digital payments and fintech expansion opportunities',
          'E-commerce logistics optimization and last-mile delivery',
          'Smart city solutions and IoT infrastructure development',
          'Healthcare technology adoption and telemedicine growth'
        ]
      },
      singapore: { 
        population: '5.9M', 
        gdp: '$397.0B', 
        marketSize: '$89.6B', 
        growth: '+2.6%', 
        digitalPenetration: 92,
        opportunityScore: 68,
        riskLevel: 'Low',
        urbanization: '100%',
        internetUsers: '5.3M',
        mobileSubscribers: '5.4M',
        dataSource: 'MAS, IMDA Digital Society Report 2024, EDB Singapore',
        opportunities: [
          'Fintech innovation hub and regulatory sandbox opportunities',
          'Sustainable technology solutions and green finance',
          'Regional headquarters establishment and talent hub',
          'High-value B2B services and enterprise solutions'
        ]
      },
      malaysia: { 
        population: '32.7M', 
        gdp: '$432.0B', 
        marketSize: '$98.3B', 
        growth: '+4.5%', 
        digitalPenetration: 78,
        opportunityScore: 73,
        riskLevel: 'Medium',
        urbanization: '76.6%',
        internetUsers: '27.5M',
        mobileSubscribers: '25.5M',
        dataSource: 'Bank Negara Malaysia, MDEC, DOSM Malaysia',
        opportunities: [
          'Islamic fintech and Shariah-compliant banking solutions',
          'Halal product certification and global trade facilitation',
          'Digital transformation services for SMEs',
          'Cross-border e-commerce and logistics hub development'
        ]
      },
      indonesia: { 
        population: '273.5M', 
        gdp: '$1.32T', 
        marketSize: '$287.2B', 
        growth: '+5.2%', 
        digitalPenetration: 73,
        opportunityScore: 78,
        riskLevel: 'Medium-High',
        urbanization: '56.4%',
        internetUsers: '194.2M',
        mobileSubscribers: '199.7M',
        dataSource: 'Bank Indonesia, Kominfo, APJII Internet Survey 2024',
        opportunities: [
          'Mobile commerce and digital wallet ecosystem expansion',
          'Digital banking and financial inclusion for unbanked population',
          'Logistics and supply chain solutions for archipelago geography',
          'Educational technology platforms and digital literacy programs'
        ]
      },
      philippines: { 
        population: '109.6M', 
        gdp: '$394.0B', 
        marketSize: '$156.8B', 
        growth: '+6.2%', 
        digitalPenetration: 68,
        opportunityScore: 75,
        riskLevel: 'Medium',
        urbanization: '47.4%',
        internetUsers: '73.4M',
        mobileSubscribers: '74.5M',
        dataSource: 'BSP, DICT, Philippine Statistics Authority',
        opportunities: [
          'Digital services expansion and BPO industry growth',
          'Remittance solutions and overseas Filipino worker services',
          'E-commerce platforms and social commerce integration',
          'Healthcare technology and telemedicine infrastructure'
        ]
      },
      vietnam: { 
        population: '97.3M', 
        gdp: '$409.0B', 
        marketSize: '$142.1B', 
        growth: '+6.8%', 
        digitalPenetration: 75,
        opportunityScore: 82,
        riskLevel: 'Medium',
        urbanization: '37.3%',
        internetUsers: '74.9M',
        mobileSubscribers: '73.0M',
        dataSource: 'State Bank of Vietnam, MIC Vietnam, VECOM E-commerce Report 2024',
        opportunities: [
          'Manufacturing hub development and supply chain integration',
          'Technology outsourcing services and software development',
          'Consumer goods market expansion and retail modernization',
          'Renewable energy solutions and sustainability initiatives'
        ]
      }
    };
    
    return marketData[country] || { 
      population: 'N/A', 
      gdp: 'N/A', 
      marketSize: 'N/A', 
      growth: 'N/A', 
      digitalPenetration: 0,
      opportunityScore: 0,
      riskLevel: 'Unknown',
      dataSource: 'Data not available',
      opportunities: []
    };
  }
}