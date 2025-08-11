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

    // Add colors and styling
    const primaryColor = [59, 130, 246]; // Blue
    const secondaryColor = [16, 185, 129]; // Emerald
    const accentColor = [139, 92, 246]; // Purple

    // Title Page with gradient effect
    pdf.setFillColor(15, 23, 42); // Dark background
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Add company logo area (simulated)
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(pageWidth/2 - 15, 30, 30, 30, 5, 5, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian', pageWidth / 2, 80, { align: 'center' });
    pdf.text('Market Intelligence', pageWidth / 2, 95, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Comprehensive Market Research Report', pageWidth / 2, 110, { align: 'center' });
    
    // Add selected markets info
    pdf.setFontSize(14);
    pdf.setTextColor(...secondaryColor);
    pdf.text(`Markets Analyzed: ${data.selectedCountries.length}`, pageWidth / 2, 130, { align: 'center' });
    pdf.setTextColor(255, 255, 255);
    pdf.text(data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • '), pageWidth / 2, 140, { align: 'center' });
    
    // Date and report info
    pdf.setFontSize(12);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, 160, { align: 'center' });
    
    // Add decorative elements
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(2);
    pdf.line(50, 170, pageWidth - 50, 170);

    // Executive Summary Page
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    
    // Header with colored background
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, yPosition + 5);
    
    yPosition += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const executiveSummary = `This comprehensive market research report provides strategic insights into ${data.selectedCountries.length} key Southeast Asian markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}.

KEY FINDINGS:
• Total addressable market exceeds $1.2 trillion across selected regions
• Digital transformation accelerating at 15-25% annually across all markets
• E-commerce and fintech sectors showing highest growth potential (18-35% CAGR)
• Mobile-first consumer behavior driving new business models
• Cross-border trade opportunities expanding rapidly

STRATEGIC RECOMMENDATIONS:
• Prioritize mobile-first digital strategies across all markets
• Establish local partnerships for regulatory compliance and market access
• Focus on tier-1 cities for initial market entry with gradual expansion
• Adapt products and services to local preferences and price points
• Invest in local talent acquisition and comprehensive training programs

MARKET ENTRY PRIORITIES:
1. Vietnam and Philippines offer highest growth potential
2. Singapore and Malaysia provide stable, mature market opportunities  
3. Thailand and Indonesia present large-scale market opportunities with moderate complexity`;

    const splitSummary = pdf.splitTextToSize(executiveSummary, pageWidth - 40);
    pdf.text(splitSummary, 20, yPosition);

    // Add a chart placeholder (simulated)
    yPosition += splitSummary.length * 5 + 20;
    checkPageBreak(60);
    
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'F');
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(1);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'S');
    
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(10);
    pdf.text('Market Size Comparison Chart', pageWidth / 2, yPosition + 25, { align: 'center' });

    // Market Overview with enhanced styling
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    yPosition = 20;
    
    // Colored header
    pdf.setFillColor(...secondaryColor);
    pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Overview', 20, yPosition + 5);
    
    yPosition += 25;
    
    data.selectedCountries.forEach((country, index) => {
      checkPageBreak(80);
      
      // Country header with colored background
      const countryColors = [primaryColor, secondaryColor, accentColor, [245, 158, 11], [239, 68, 68], [6, 182, 212]];
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
      
      // Create a styled info box
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 45, 3, 3, 'F');
      pdf.setDrawColor(...currentColor);
      pdf.setLineWidth(1);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 45, 3, 3, 'S');
      
      // Key metrics in columns
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Population:', 25, yPosition + 8);
      pdf.text('GDP:', 25, yPosition + 16);
      pdf.text('Market Size:', 25, yPosition + 24);
      pdf.text('Growth Rate:', 25, yPosition + 32);
      pdf.text('Digital Penetration:', 25, yPosition + 40);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...currentColor);
      pdf.text(marketData.population, 60, yPosition + 8);
      pdf.text(marketData.gdp, 60, yPosition + 16);
      pdf.text(marketData.marketSize, 60, yPosition + 24);
      pdf.text(marketData.growth, 60, yPosition + 32);
      pdf.text(`${marketData.digitalPenetration}%`, 60, yPosition + 40);
      
      yPosition += 55;
      
      // Opportunities section
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Opportunities:', 25, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      marketData.opportunities.forEach((opportunity: string) => {
        pdf.text(`• ${opportunity}`, 30, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
    });

    // Industry Analysis with charts
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    yPosition = 20;
    
    pdf.setFillColor(...accentColor);
    pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Industry Analysis & Opportunities', 20, yPosition + 5);
    
    yPosition += 30;
    
    const industries = [
      { name: 'Technology & Software', marketSize: '$89.2B', growth: '12.4%', opportunity: 'High' },
      { name: 'E-commerce & Retail', marketSize: '$156.7B', growth: '18.6%', opportunity: 'Very High' },
      { name: 'Financial Services', marketSize: '$67.3B', growth: '15.2%', opportunity: 'High' },
      { name: 'Healthcare & Pharma', marketSize: '$78.4B', growth: '9.7%', opportunity: 'Medium' },
      { name: 'Manufacturing', marketSize: '$234.1B', growth: '6.8%', opportunity: 'Medium' }
    ];

    // Create industry table with styling
    const tableStartY = yPosition;
    const rowHeight = 12;
    const colWidths = [60, 30, 25, 30];
    
    // Table header
    pdf.setFillColor(71, 85, 105);
    pdf.rect(20, tableStartY, pageWidth - 40, rowHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Industry', 25, tableStartY + 8);
    pdf.text('Market Size', 85, tableStartY + 8);
    pdf.text('Growth', 125, tableStartY + 8);
    pdf.text('Opportunity', 155, tableStartY + 8);
    
    yPosition = tableStartY + rowHeight;
    
    industries.forEach((industry, index) => {
      const isEven = index % 2 === 0;
      pdf.setFillColor(isEven ? 248 : 241, isEven ? 250 : 245, isEven ? 252 : 249);
      pdf.rect(20, yPosition, pageWidth - 40, rowHeight, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(industry.name, 25, yPosition + 8);
      pdf.text(industry.marketSize, 85, yPosition + 8);
      
      // Color-coded growth
      pdf.setTextColor(16, 185, 129);
      pdf.text(industry.growth, 125, yPosition + 8);
      
      // Color-coded opportunity
      const oppColor = industry.opportunity === 'Very High' ? [16, 185, 129] : 
                      industry.opportunity === 'High' ? [59, 130, 246] : [245, 158, 11];
      pdf.setTextColor(...oppColor);
      pdf.text(industry.opportunity, 155, yPosition + 8);
      
      yPosition += rowHeight;
    });

    // Add footer to each page
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      pdf.text('© 2025 SEA Market Intel - Professional Market Research', 20, pageHeight - 10);
    }

    // Save the PDF
    pdf.save(`SEA-Market-Research-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcelReport(data: ExportData): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Market Overview Sheet with enhanced data
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
        'Mobile Subscribers': marketData.mobileSubscribers || 'N/A'
      };
    });

    const marketSheet = XLSX.utils.json_to_sheet(marketOverview);
    
    // Add styling to headers
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

    // Industry Analysis Sheet
    const industryData = [
      { Industry: 'Technology & Software', 'Market Size (B)': 89.2, 'Growth Rate': 12.4, Competition: 'High', 'Opportunity Score': 85 },
      { Industry: 'E-commerce & Retail', 'Market Size (B)': 156.7, 'Growth Rate': 18.6, Competition: 'High', 'Opportunity Score': 78 },
      { Industry: 'Financial Services', 'Market Size (B)': 67.3, 'Growth Rate': 15.2, Competition: 'Medium', 'Opportunity Score': 92 },
      { Industry: 'Healthcare & Pharma', 'Market Size (B)': 78.4, 'Growth Rate': 9.7, Competition: 'Low', 'Opportunity Score': 88 },
      { Industry: 'Manufacturing', 'Market Size (B)': 234.1, 'Growth Rate': 6.8, Competition: 'Medium', 'Opportunity Score': 65 },
      { Industry: 'Automotive', 'Market Size (B)': 45.8, 'Growth Rate': 8.3, Competition: 'Medium', 'Opportunity Score': 71 }
    ];

    const industrySheet = XLSX.utils.json_to_sheet(industryData);
    XLSX.utils.book_append_sheet(workbook, industrySheet, 'Industry Analysis');

    // Digital Metrics Sheet
    const digitalData = [
      { Country: 'Singapore', 'Internet Penetration': '89%', 'Mobile Penetration': '92%', 'E-commerce Adoption': '78%', 'Digital Payments': '85%', 'Social Media Users': '83%', 'Cloud Adoption': '72%' },
      { Country: 'Thailand', 'Internet Penetration': '82%', 'Mobile Penetration': '85%', 'E-commerce Adoption': '65%', 'Digital Payments': '72%', 'Social Media Users': '76%', 'Cloud Adoption': '58%' },
      { Country: 'Malaysia', 'Internet Penetration': '84%', 'Mobile Penetration': '78%', 'E-commerce Adoption': '58%', 'Digital Payments': '68%', 'Social Media Users': '81%', 'Cloud Adoption': '54%' },
      { Country: 'Indonesia', 'Internet Penetration': '71%', 'Mobile Penetration': '73%', 'E-commerce Adoption': '52%', 'Digital Payments': '61%', 'Social Media Users': '68%', 'Cloud Adoption': '45%' },
      { Country: 'Philippines', 'Internet Penetration': '67%', 'Mobile Penetration': '68%', 'E-commerce Adoption': '45%', 'Digital Payments': '55%', 'Social Media Users': '72%', 'Cloud Adoption': '41%' },
      { Country: 'Vietnam', 'Internet Penetration': '77%', 'Mobile Penetration': '75%', 'E-commerce Adoption': '49%', 'Digital Payments': '58%', 'Social Media Users': '74%', 'Cloud Adoption': '43%' }
    ];

    const digitalSheet = XLSX.utils.json_to_sheet(digitalData);
    XLSX.utils.book_append_sheet(workbook, digitalSheet, 'Digital Metrics');

    // Growth Projections Sheet
    const growthData = [
      { Year: 2024, Indonesia: 5.5, Thailand: 2.8, Singapore: 3.8, Malaysia: 4.4, Philippines: 6.3, Vietnam: 7.3 },
      { Year: 2025, Indonesia: 5.7, Thailand: 3.0, Singapore: 4.0, Malaysia: 4.6, Philippines: 6.5, Vietnam: 7.5 },
      { Year: 2026, Indonesia: 5.9, Thailand: 3.2, Singapore: 4.2, Malaysia: 4.8, Philippines: 6.7, Vietnam: 7.7 },
      { Year: 2027, Indonesia: 6.1, Thailand: 3.4, Singapore: 4.4, Malaysia: 5.0, Philippines: 6.9, Vietnam: 7.9 }
    ];

    const growthSheet = XLSX.utils.json_to_sheet(growthData);
    XLSX.utils.book_append_sheet(workbook, growthSheet, 'Growth Projections');

    // Save the Excel file
    XLSX.writeFile(workbook, `SEA-Market-Data-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async generatePowerPointOutline(data: ExportData): Promise<void> {
    const slideContent = `
SOUTHEAST ASIAN MARKET RESEARCH PRESENTATION
Professional Market Intelligence Report - McKinsey Style

=== SLIDE 1: TITLE SLIDE ===
🌏 Southeast Asian Market Intelligence
Comprehensive Analysis for ${data.selectedCountries.length} Strategic Markets
${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')}

Generated: ${new Date().toLocaleDateString()}
Prepared by: SEA Market Intel Platform

=== SLIDE 2: EXECUTIVE SUMMARY ===
📊 Key Market Insights
• Total addressable market: $1.2+ trillion across selected regions
• Digital transformation accelerating at 15-25% annually
• E-commerce and fintech leading growth sectors (18-35% CAGR)
• Mobile-first consumer behavior driving innovation
• Cross-border opportunities expanding rapidly

🎯 Strategic Imperatives
• Prioritize mobile-first digital strategies
• Establish local partnerships for market access
• Focus on tier-1 cities for initial entry
• Adapt offerings to local preferences

=== SLIDE 3: MARKET SIZE OVERVIEW ===
💰 Market Opportunity Matrix
${data.selectedCountries.map(country => {
  const marketData = this.getMarketDataForCountry(country);
  return `🇸🇬 ${country.charAt(0).toUpperCase() + country.slice(1)}
• Population: ${marketData.population}
• Market Size: ${marketData.marketSize}
• Growth Rate: ${marketData.growth}
• Digital Penetration: ${marketData.digitalPenetration}%
• Opportunity Score: ${marketData.opportunityScore}/100`;
}).join('\n\n')}

=== SLIDE 4: INDUSTRY LANDSCAPE ===
🏭 High-Growth Sectors & Opportunities
📱 Technology & Software: $89.2B market, 12.4% growth
🛒 E-commerce & Retail: $156.7B market, 18.6% growth  
🏦 Financial Services: $67.3B market, 15.2% growth
🏥 Healthcare & Pharma: $78.4B market, 9.7% growth

📈 Key Trends Driving Growth
• AI/ML adoption across industries
• Social commerce and cross-border trade
• Digital banking and cryptocurrency
• Telemedicine and digital therapeutics

=== SLIDE 5: DIGITAL TRANSFORMATION LANDSCAPE ===
📱 Digital Adoption Leaders
🇸🇬 Singapore: 92% mobile, 89% internet penetration
🇹🇭 Thailand: 85% mobile, 82% internet penetration
🇲🇾 Malaysia: 78% mobile, 84% internet penetration

🚀 Growth Markets
🇮🇩 Indonesia: 273M population, 73% mobile penetration
🇵🇭 Philippines: 110M population, 68% mobile penetration
🇻🇳 Vietnam: 97M population, 75% mobile penetration

=== SLIDE 6: MARKET ENTRY STRATEGY FRAMEWORK ===
⏱️ Phase 1: Foundation (0-6 months)
• Regulatory assessment and compliance framework
• Local partner identification and due diligence
• Digital presence establishment and localization
• Market research capabilities development

🚀 Phase 2: Launch (6-18 months)
• Pilot programs in priority cities
• Local customer service infrastructure
• Localized product offerings and pricing
• Digital marketing implementation

📈 Phase 3: Scale (18+ months)
• Multi-market expansion strategy
• Regional operations establishment
• Supply chain development and optimization
• Strategic acquisitions and partnerships

=== SLIDE 7: SUCCESS FACTORS & CASE STUDIES ===
✅ Critical Success Elements
• Local partnerships and regulatory compliance
• Mobile-first digital strategy implementation
• Cultural adaptation and localization
• Agile market entry approach

📚 Case Study Insights
🚗 Grab: Localized approach, ecosystem building strategy
🛒 Shopee: Mobile-first, social commerce focus
🏍️ Gojek: Super app strategy, financial inclusion

❌ Learning from Failures
🚗 Uber Thailand: Regulatory challenges, local competition
🏪 Carrefour Malaysia: Failed localization, cost structure
🏬 Tesco Philippines: Scale challenges, market adaptation

=== SLIDE 8: RISK ASSESSMENT MATRIX ===
⚠️ Key Risk Areas & Mitigation
🏛️ Regulatory Risk: Varying compliance requirements
💱 Currency Risk: Exchange rate volatility impact
🏆 Competition Risk: Strong local and international players
🏛️ Political Risk: Stability variations by market

🛡️ Mitigation Strategies
• Local legal counsel and compliance monitoring
• Currency hedging and local operations setup
• Differentiation through local partnerships
• Market diversification and operational flexibility

=== SLIDE 9: INVESTMENT PRIORITIES & RESOURCE ALLOCATION ===
🎯 Immediate Priorities (Next 12 months)
🇻🇳 Vietnam and Philippines: Highest growth potential markets
🇸🇬 Singapore and Malaysia: Stable, mature opportunities
🇹🇭 Thailand and Indonesia: Large-scale market access

💰 Resource Allocation Framework
• 40% Digital infrastructure and technology development
• 30% Local partnerships and talent acquisition
• 20% Marketing and brand building initiatives
• 10% Regulatory compliance and risk management

=== SLIDE 10: IMPLEMENTATION ROADMAP ===
📅 Recommended Action Plan
Q1 2025: Market selection and partner identification
Q2 2025: Regulatory compliance and pilot development
Q3 2025: Pilot launch and initial market testing
Q4 2025: Scale planning and expansion preparation

🎯 Success Metrics & KPIs
• Market penetration rates by country
• Customer acquisition costs and lifetime value
• Revenue growth and profitability metrics
• Brand awareness and market share tracking

📞 Next Steps & Contact Information
For detailed analysis and strategic consulting:
SEA Market Intel Platform - Professional Market Research
    `;

    // Create a more structured PowerPoint-style document
    const enhancedContent = `
<!DOCTYPE html>
<html>
<head>
    <title>SEA Market Research Presentation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: #f8fafc; }
        .slide { background: white; padding: 40px; margin: 20px 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); page-break-after: always; }
        .slide-header { color: #1e40af; font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
        .bullet { color: #059669; margin: 10px 0; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .metric { background: #f0f9ff; padding: 10px; border-radius: 6px; margin: 8px 0; }
        .country-flag { font-size: 20px; }
    </style>
</head>
<body>
${slideContent.split('=== SLIDE').map((slide, index) => {
  if (index === 0) return '';
  return `<div class="slide">
    <div class="slide-header">${slide.split('===')[0].trim()}</div>
    <div class="slide-content">${slide.split('===')[1] || ''}</div>
  </div>`;
}).join('')}
</body>
</html>
    `;

    const blob = new Blob([enhancedContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SEA-Market-Presentation-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private getMarketDataForCountry(country: string) {
    const marketData: { [key: string]: any } = {
      thailand: { 
        population: '69.8M', 
        gdp: '$543B', 
        marketSize: '$127B', 
        growth: '+2.6%', 
        digitalPenetration: 85,
        opportunityScore: 71,
        riskLevel: 'Medium',
        urbanization: '51.4%',
        internetUsers: '57.3M',
        mobileSubscribers: '59.4M',
        opportunities: [
          'Digital payments and fintech expansion',
          'E-commerce logistics optimization',
          'Smart city and IoT solutions',
          'Healthcare technology adoption'
        ],
        considerations: [
          'Regulatory complexity in financial services',
          'Strong local competition in retail',
          'Infrastructure development needs',
          'Cultural adaptation requirements'
        ]
      },
      singapore: { 
        population: '5.9M', 
        gdp: '$397B', 
        marketSize: '$89B', 
        growth: '+3.6%', 
        digitalPenetration: 92,
        opportunityScore: 68,
        riskLevel: 'Low',
        urbanization: '100%',
        internetUsers: '5.3M',
        mobileSubscribers: '5.4M',
        opportunities: [
          'Fintech innovation and regulatory sandbox',
          'Sustainable technology solutions',
          'Regional headquarters establishment',
          'High-value B2B services'
        ],
        considerations: [
          'High operational costs and competition',
          'Limited domestic market size',
          'Talent acquisition challenges',
          'Regulatory compliance requirements'
        ]
      },
      malaysia: { 
        population: '32.7M', 
        gdp: '$432B', 
        marketSize: '$98B', 
        growth: '+4.2%', 
        digitalPenetration: 78,
        opportunityScore: 73,
        riskLevel: 'Medium',
        urbanization: '76.6%',
        internetUsers: '27.5M',
        mobileSubscribers: '25.5M',
        opportunities: [
          'Islamic fintech and banking solutions',
          'Halal product certification and trade',
          'Digital transformation services',
          'Cross-border e-commerce facilitation'
        ],
        considerations: [
          'Political stability and policy changes',
          'Skills gap in technology sectors',
          'Infrastructure development priorities',
          'Multi-ethnic market complexity'
        ]
      },
      indonesia: { 
        population: '273.5M', 
        gdp: '$1.32T', 
        marketSize: '$287B', 
        growth: '+5.3%', 
        digitalPenetration: 73,
        opportunityScore: 78,
        riskLevel: 'Medium-High',
        urbanization: '56.4%',
        internetUsers: '194.2M',
        mobileSubscribers: '199.7M',
        opportunities: [
          'Mobile commerce and digital payments',
          'Digital banking and financial inclusion',
          'Logistics and supply chain solutions',
          'Educational technology platforms'
        ],
        considerations: [
          'Infrastructure gaps in rural areas',
          'Regulatory complexity and bureaucracy',
          'Geographic dispersion challenges',
          'Local content and partnership requirements'
        ]
      },
      philippines: { 
        population: '109.6M', 
        gdp: '$394B', 
        marketSize: '$156B', 
        growth: '+6.1%', 
        digitalPenetration: 68,
        opportunityScore: 75,
        riskLevel: 'Medium',
        urbanization: '47.4%',
        internetUsers: '73.4M',
        mobileSubscribers: '74.5M',
        opportunities: [
          'Digital services and BPO expansion',
          'Remittance and financial services',
          'E-commerce and social commerce',
          'Healthcare and telemedicine'
        ],
        considerations: [
          'Infrastructure quality and reliability',
          'Natural disaster risk management',
          'Regulatory complexity and bureaucracy',
          'Income inequality and market segmentation'
        ]
      },
      vietnam: { 
        population: '97.3M', 
        gdp: '$409B', 
        marketSize: '$142B', 
        growth: '+7.1%', 
        digitalPenetration: 75,
        opportunityScore: 82,
        riskLevel: 'Medium',
        urbanization: '37.3%',
        internetUsers: '74.9M',
        mobileSubscribers: '73.0M',
        opportunities: [
          'Manufacturing and supply chain hub',
          'Technology outsourcing services',
          'Consumer goods and retail expansion',
          'Renewable energy and sustainability'
        ],
        considerations: [
          'Infrastructure development needs',
          'Skills training and development',
          'Environmental compliance requirements',
          'Market entry timing and competition'
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
      opportunities: [],
      considerations: []
    };
  }
}