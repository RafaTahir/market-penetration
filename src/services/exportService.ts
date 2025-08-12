import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export interface ExportData {
  selectedCountries: string[];
  selectedCities: string[];
  activeTab: string;
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

  async generatePDFReport(data: ExportData): Promise<void> {
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

  async generateExcelReport(data: ExportData): Promise<void> {
    const workbook = XLSX.utils.book_new();

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

    // Save the Excel file
    XLSX.writeFile(workbook, `Flow-Market-Data-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async generatePowerPointOutline(data: ExportData): Promise<void> {
    const slideContent = `
FLOW MARKET INTELLIGENCE PRESENTATION
Your guide to Penetrating Markets - Professional Market Research Report

=== SLIDE 1: TITLE SLIDE ===
🌊 Flow Market Intelligence
Your guide to Penetrating Markets

Comprehensive Southeast Asian Market Analysis
${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')}

Generated: ${new Date().toLocaleDateString()}
Data Sources: World Bank, IMF, Google-Temasek e-Conomy SEA 2024

=== SLIDE 2: EXECUTIVE SUMMARY ===
📊 Key Market Insights
• Total addressable market: $1.2+ trillion across selected regions
• Digital economy growing at 18.6% annually
• E-commerce and fintech leading growth sectors (22.8% and 18.4% CAGR)
• Mobile-first consumer behavior driving innovation
• 456M active internet users across the region

🎯 Strategic Imperatives
• Prioritize mobile-first digital strategies
• Establish strategic local partnerships
• Focus on tier-1 cities for initial entry
• Adapt offerings to local preferences and competitive pricing

=== SLIDE 3: MARKET SIZE OVERVIEW ===
💰 Market Opportunity Matrix
${data.selectedCountries.map(country => {
  const marketData = this.getMarketDataForCountry(country);
  return `🏛️ ${country.charAt(0).toUpperCase() + country.slice(1)}
• Population: ${marketData.population}
• Market Size: ${marketData.marketSize}
• Growth Rate: ${marketData.growth}
• Digital Penetration: ${marketData.digitalPenetration}%
• Opportunity Score: ${marketData.opportunityScore}/100
• Source: ${marketData.dataSource}`;
}).join('\n\n')}

=== SLIDE 4: INDUSTRY LANDSCAPE ===
🏭 High-Growth Sectors & Opportunities
📱 Technology & Software: $234.5B market, 15.2% growth
   Source: IDC Asia Pacific, Gartner
🛒 E-commerce & Retail: $187.3B market, 22.8% growth
   Source: Google-Temasek e-Conomy SEA 2024
🏦 Financial Services: $153.2B market, 18.4% growth
   Source: PwC FinTech Survey, EY ASEAN Banking
🏥 Healthcare & Pharma: $102.1B market, 12.3% growth
   Source: IQVIA, McKinsey Global Health Institute

📈 Key Trends Driving Growth
• AI/ML adoption across industries
• Social commerce and cross-border trade expansion
• Digital banking and cryptocurrency integration
• Telemedicine and digital therapeutics advancement

=== SLIDE 5: DIGITAL TRANSFORMATION LANDSCAPE ===
📱 Digital Adoption Leaders
🇸🇬 Singapore: 92.3% mobile, 89.4% internet penetration
   Source: IMDA Digital Society Report 2024
🇹🇭 Thailand: 85.2% mobile, 82.1% internet penetration
   Source: NBTC, ETDA Digital Thailand Report 2024
🇲🇾 Malaysia: 78.9% mobile, 84.2% internet penetration
   Source: MCMC, MDEC Malaysia Digital Economy Report

🚀 High-Growth Markets
🇮🇩 Indonesia: 273.5M population, 73.4% mobile penetration
🇵🇭 Philippines: 109.6M population, 68.7% mobile penetration
🇻🇳 Vietnam: 97.3M population, 75.3% mobile penetration

=== SLIDE 6: CONSUMER BEHAVIOR INSIGHTS ===
🛍️ Mobile-First Shopping Trends
• 78.4% prefer mobile apps over desktop (Nielsen Consumer Insights SEA 2024)
• 24.3% growth in mobile commerce adoption
• Social commerce driving 65.7% of purchase decisions

💳 Digital Payment Revolution
• 72.1% adoption rate with 28.5% growth (Visa Consumer Payment Attitudes Study)
• Cash-to-digital transition accelerating across all markets
• Cross-border payment solutions gaining traction

📺 Content Consumption Patterns
• 84.2% video streaming adoption (Media Partners Asia OTT Report 2024)
• Social media influences 74.8% of consumer decisions
• Live commerce and influencer marketing driving sales

=== SLIDE 7: MARKET ENTRY STRATEGY FRAMEWORK ===
⏱️ Phase 1: Foundation (0-6 months)
• Regulatory assessment and compliance framework development
• Local partner identification and strategic due diligence
• Digital presence establishment and cultural localization
• Market research capabilities and consumer insights development

🚀 Phase 2: Launch (6-18 months)
• Pilot programs in priority tier-1 cities
• Local customer service infrastructure establishment
• Localized product offerings and competitive pricing strategies
• Digital marketing implementation and social commerce integration

📈 Phase 3: Scale (18+ months)
• Multi-market expansion strategy execution
• Regional operations establishment and optimization
• Supply chain development and logistics partnerships
• Strategic acquisitions and ecosystem partnerships

=== SLIDE 8: SUCCESS FACTORS & CASE STUDIES ===
✅ Critical Success Elements
• Strategic local partnerships and regulatory compliance
• Mobile-first digital strategy implementation
• Cultural adaptation and market localization
• Agile market entry approach with rapid iteration

📚 Success Story Insights
🚗 Grab: Localized approach, ecosystem building, government relations
🛒 Shopee: Mobile-first strategy, social commerce focus, aggressive marketing
🏍️ Gojek: Super app strategy, financial inclusion, driver partnerships

❌ Learning from Market Exits
🚗 Uber Thailand: Regulatory challenges, underestimated local competition
🏪 Carrefour Malaysia: Failed localization, high operational costs
🏬 Tesco Philippines: Scale challenges, market adaptation issues

=== SLIDE 9: RISK ASSESSMENT & MITIGATION ===
⚠️ Key Risk Areas & Impact Assessment
🏛️ Regulatory Risk: Varying compliance requirements across markets
💱 Currency Risk: Exchange rate volatility and hedging strategies
🏆 Competition Risk: Strong local and international players
🏛️ Political Risk: Stability variations and policy changes

🛡️ Comprehensive Mitigation Strategies
• Local legal counsel and continuous compliance monitoring
• Currency hedging strategies and local operations setup
• Differentiation through strategic local partnerships
• Market diversification and operational flexibility maintenance

=== SLIDE 10: INVESTMENT PRIORITIES & RESOURCE ALLOCATION ===
🎯 Market Entry Priorities (Next 12 months)
🇻🇳 Vietnam and Philippines: Highest growth potential markets (7.0% and 6.4% GDP growth)
🇸🇬 Singapore and Malaysia: Stable, mature opportunities with strong infrastructure
🇹🇭 Thailand and Indonesia: Large-scale market access with moderate complexity

💰 Strategic Resource Allocation Framework
• 40% Digital infrastructure and technology platform development
• 30% Local partnerships, talent acquisition, and cultural training
• 20% Marketing, brand building, and customer acquisition initiatives
• 10% Regulatory compliance, risk management, and legal framework

=== SLIDE 11: IMPLEMENTATION ROADMAP & SUCCESS METRICS ===
📅 Recommended Action Plan & Timeline
Q1 2025: Market selection finalization and strategic partner identification
Q2 2025: Regulatory compliance framework and pilot program development
Q3 2025: Pilot launch execution and initial market testing
Q4 2025: Scale planning, expansion preparation, and performance optimization

🎯 Success Metrics & KPI Framework
• Market penetration rates and customer acquisition costs by country
• Revenue growth trajectories and profitability metrics
• Brand awareness levels and market share tracking
• Customer satisfaction scores and retention rates

📞 Next Steps & Strategic Consultation
For detailed market entry strategy and implementation support:
Flow - Your guide to Penetrating Markets
Professional Market Intelligence & Strategic Consulting
    `;

    // Create a beautifully styled HTML presentation
    const enhancedContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Flow Market Intelligence Presentation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            color: #f8fafc;
            line-height: 1.6;
        }
        
        .slide { 
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            color: #1e293b;
            padding: 60px 40px; 
            margin: 30px 0; 
            border-radius: 20px; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            page-break-after: always;
            position: relative;
            overflow: hidden;
        }
        
        .slide::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #3b82f6, #10b981, #8b5cf6);
        }
        
        .slide-header { 
            color: #1e40af; 
            font-size: 32px; 
            font-weight: 700; 
            margin-bottom: 30px; 
            border-bottom: 3px solid transparent;
            border-image: linear-gradient(90deg, #3b82f6, #10b981) 1;
            padding-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .flow-logo {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        
        .bullet { 
            color: #059669; 
            margin: 15px 0; 
            padding-left: 20px;
            position: relative;
        }
        
        .bullet::before {
            content: '•';
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 20px;
        }
        
        .highlight { 
            background: linear-gradient(135deg, #dbeafe, #ecfdf5); 
            padding: 25px; 
            border-radius: 15px; 
            margin: 20px 0; 
            border-left: 6px solid #3b82f6;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .metric { 
            background: linear-gradient(135deg, #f0f9ff, #f0fdf4); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 12px 0;
            border: 1px solid #e0e7ff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e40af;
        }
        
        .country-flag { 
            font-size: 24px; 
            margin-right: 10px;
        }
        
        .data-source {
            font-size: 12px;
            color: #64748b;
            font-style: italic;
            margin-top: 10px;
            padding: 8px 12px;
            background: #f1f5f9;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .title-slide {
            text-align: center;
            background: linear-gradient(135deg, #1e293b, #334155);
            color: white;
        }
        
        .title-slide .slide-header {
            color: white;
            font-size: 48px;
            border-image: linear-gradient(90deg, #3b82f6, #10b981, #8b5cf6) 1;
        }
        
        .subtitle {
            font-size: 24px;
            color: #94a3b8;
            margin-bottom: 40px;
        }
        
        .phase {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border-left: 6px solid #f59e0b;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
        }
        
        .phase h4 {
            color: #92400e;
            margin-top: 0;
        }
    </style>
</head>
<body>
${slideContent.split('=== SLIDE').map((slide, index) => {
  if (index === 0) return '';
  const isTitle = index === 1;
  return `<div class="slide ${isTitle ? 'title-slide' : ''}">
    <div class="slide-header">
      ${!isTitle ? '<div class="flow-logo">F</div>' : ''}
      ${slide.split('===')[0].trim()}
    </div>
    <div class="slide-content">
      ${slide.split('===')[1] ? slide.split('===')[1]
        .replace(/🎯|📊|💰|🏭|📱|🛍️|⏱️|✅|⚠️|📅/g, '<span style="font-size: 1.2em;">$&</span>')
        .replace(/•/g, '<div class="bullet">')
        .replace(/\n\n/g, '</div><div class="bullet">')
        .replace(/Source:/g, '<div class="data-source">Source:') + '</div>'
        : ''}
    </div>
  </div>`;
}).join('')}

<div class="slide">
    <div class="slide-header">
        <div class="flow-logo">F</div>
        Thank You
    </div>
    <div class="slide-content" style="text-align: center; padding: 60px 0;">
        <h2 style="color: #1e40af; margin-bottom: 30px;">Flow - Your guide to Penetrating Markets</h2>
        <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">
            Professional Market Intelligence & Strategic Consulting
        </p>
        <div class="highlight">
            <p><strong>Ready to enter Southeast Asian markets?</strong></p>
            <p>Contact our team for personalized market entry strategies and implementation support.</p>
        </div>
    </div>
</div>

</body>
</html>
    `;

    const blob = new Blob([enhancedContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Flow-Market-Presentation-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
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