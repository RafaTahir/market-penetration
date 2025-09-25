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
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      // Set up document properties
      pdf.setProperties({
        title: 'Flow - Southeast Asian Market Intelligence Report',
        subject: 'Market Analysis',
        author: 'Flow - Market Intelligence Platform',
        creator: 'Flow Analytics'
      });

      // Page 1: Title Page
      this.createTitlePage(pdf, data);
      
      // Page 2: Executive Summary
      pdf.addPage();
      this.createExecutiveSummary(pdf, data);
      
      // Page 3: Market Overview & Key Metrics
      pdf.addPage();
      this.createMarketOverview(pdf, data);
      
      // Page 4: Market Analysis Deep Dive
      pdf.addPage();
      this.createMarketAnalysis(pdf, data);
      
      // Page 5: Country Insights & Opportunities
      pdf.addPage();
      this.createCountryInsights(pdf, data);
      
      // Page 6: Competitive Landscape
      pdf.addPage();
      this.createCompetitiveLandscape(pdf, data);
      
      // Page 7: Consumer Behavior & Digital Trends
      pdf.addPage();
      this.createConsumerInsights(pdf, data);
      
      // Page 8: Strategic Recommendations
      pdf.addPage();
      this.createStrategicRecommendations(pdf, data);
      
      // Page 9: Implementation Roadmap
      pdf.addPage();
      this.createImplementationRoadmap(pdf, data);
      
      // Page 10: Risk Assessment & Mitigation
      pdf.addPage();
      this.createRiskAssessment(pdf, data);

      // Save the PDF
      const fileName = `Flow_Market_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  async generateExcelReport(data: ExportData): Promise<void> {
    try {
      // Import XLSX dynamically
      const XLSX = await import('xlsx');
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Market Overview Sheet
      const marketData = this.getMarketOverviewData(data);
      const ws1 = XLSX.utils.json_to_sheet(marketData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Market Overview');
      
      // Country Analysis Sheet
      const countryData = this.getCountryAnalysisData(data);
      const ws2 = XLSX.utils.json_to_sheet(countryData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Country Analysis');
      
      // Digital Metrics Sheet
      const digitalData = this.getDigitalMetricsData(data);
      const ws3 = XLSX.utils.json_to_sheet(digitalData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Digital Metrics');
      
      // Economic Indicators Sheet
      const economicData = this.getEconomicData(data);
      const ws4 = XLSX.utils.json_to_sheet(economicData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Economic Indicators');
      
      // Save the Excel file
      const fileName = `Flow_Market_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Excel generation error:', error);
      throw new Error('Failed to generate Excel report');
    }
  }

  async generatePowerPointOutline(data: ExportData): Promise<void> {
    try {
      // Create a comprehensive PowerPoint outline as a text file
      const outline = this.createPowerPointOutline(data);
      
      // Create and download the file
      const blob = new Blob([outline], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Flow_Presentation_Outline_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PowerPoint outline generation error:', error);
      throw new Error('Failed to generate PowerPoint outline');
    }
  }

  private createTitlePage(pdf: any, data: ExportData): void {
    // Set light professional background
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Add subtle gradient effect with rectangles
    pdf.setFillColor(59, 130, 246, 0.1); // blue with transparency
    pdf.rect(0, 0, 210, 80, 'F');
    pdf.setFillColor(16, 185, 129, 0.05); // emerald with transparency
    pdf.rect(0, 217, 210, 80, 'F');

    // Flow Logo Area
    pdf.setFillColor(59, 130, 246); // blue-500
    pdf.circle(105, 60, 25, 'F');
    pdf.setFillColor(16, 185, 129); // emerald-500
    pdf.circle(105, 60, 20, 'F');
    pdf.setFillColor(139, 92, 246); // purple-500
    pdf.circle(105, 60, 15, 'F');
    
    // Title
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow', 105, 100, { align: 'center' });
    
    pdf.setTextColor(59, 130, 246); // blue-600
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Southeast Asian Market Intelligence Report', 105, 115, { align: 'center' });
    
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.setFontSize(12);
    pdf.text('Professional Market Analysis & Strategic Insights', 105, 130, { align: 'center' });
    
    // Selected markets
    if (data.selectedCountries.length > 0) {
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.rect(30, 150, 150, 40, 'F');
      pdf.setDrawColor(59, 130, 246); // blue-600
      pdf.rect(30, 150, 150, 40, 'S');
      
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Target Markets:', 40, 165);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // slate-700
      const countries = data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
      const lines = pdf.splitTextToSize(countries, 130);
      pdf.text(lines, 40, 175);
    }
    
    // Footer with date and branding
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 260, { align: 'center' });
    
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.setFontSize(8);
    pdf.text('Powered by Flow Analytics Platform', 105, 270, { align: 'center' });
  }

  private createExecutiveSummary(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(59, 130, 246); // blue-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, 17);
    
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 45;
    
    // Key Highlights Box
    pdf.setFillColor(239, 246, 255); // blue-50
    pdf.rect(20, yPos - 5, 170, 60, 'F');
    pdf.setDrawColor(59, 130, 246); // blue-600
    pdf.rect(20, yPos - 5, 170, 60, 'S');
    
    pdf.setTextColor(30, 64, 175); // blue-800
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Opportunity Highlights', 25, yPos + 5);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    yPos += 15;
    
    const metrics = [
      '💰 Total Addressable Market: $1.2T across selected regions',
      '📈 Digital Economy Growth: 18.6% annually (fastest globally)',
      '👥 Internet Users: 456M active users across target markets',
      '🌐 Cross-Border Trade: $89.2B in e-commerce transactions',
      '📱 Mobile Commerce: 78% of consumers prefer mobile shopping'
    ];
    
    metrics.forEach(metric => {
      pdf.text(metric, 25, yPos);
      yPos += 8;
    });
    
    yPos += 20;
    
    // Strategic Insights Section
    pdf.setFillColor(236, 253, 245); // emerald-50
    pdf.rect(20, yPos - 5, 170, 80, 'F');
    pdf.setDrawColor(16, 185, 129); // emerald-600
    pdf.rect(20, yPos - 5, 170, 80, 'S');
    
    pdf.setTextColor(6, 95, 70); // emerald-800
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Market Entry Insights', 25, yPos + 5);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    yPos += 15;
    
    const insights = [
      '🎯 Mobile-First Strategy: Essential for market penetration',
      '🤝 Local Partnerships: Critical for regulatory compliance and market access',
      '🏙️ Tier-1 Cities: Optimal entry points with highest digital adoption',
      '🛍️ Social Commerce: 65% of purchases influenced by social media',
      '💳 Digital Payments: 72% adoption rate, growing 28% annually',
      '🌱 Sustainability: Emerging consumer preference driving purchase decisions'
    ];
    
    insights.forEach(insight => {
      pdf.text(insight, 25, yPos);
      yPos += 8;
    });
    
    yPos += 20;
    
    // Market Entry Priority Matrix
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Entry Priority Assessment', 20, yPos);
    yPos += 15;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    const priorityData = [
      { country: 'Vietnam', score: '82/100', reason: 'Highest growth rate (6.8%), young demographics' },
      { country: 'Indonesia', score: '78/100', reason: 'Largest market size ($287B), mobile-first adoption' },
      { country: 'Philippines', score: '75/100', reason: 'Strong English proficiency, BPO ecosystem' },
      { country: 'Thailand', score: '71/100', reason: 'Stable economy, tourism infrastructure' },
      { country: 'Malaysia', score: '73/100', reason: 'Islamic finance hub, strategic location' },
      { country: 'Singapore', score: '68/100', reason: 'Regional HQ location, high competition' }
    ];
    
    priorityData.filter(item => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        item.country.toLowerCase().includes(selected) || 
        selected.includes(item.country.toLowerCase())
      )
    ).forEach(item => {
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${item.country}: ${item.score}`, 25, yPos);
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.reason, 80, yPos);
      yPos += 12;
    });
  }

  private createMarketOverview(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(16, 185, 129); // emerald-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Overview & Key Metrics', 20, 17);
    
    let yPos = 45;
    
    // Regional Market Size Overview
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian Market Landscape', 20, yPos);
    yPos += 15;
    
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('The Southeast Asian market represents one of the world\'s fastest-growing economic regions,', 20, yPos);
    yPos += 8;
    pdf.text('with a combined GDP of $3.6T and a population exceeding 680 million people.', 20, yPos);
    yPos += 20;
    
    // Key Metrics Grid
    const metrics = [
      { label: 'Combined GDP', value: '$3.6T', growth: '+4.7%', color: [59, 130, 246] },
      { label: 'Total Population', value: '688M', growth: '+1.1%', color: [16, 185, 129] },
      { label: 'Internet Users', value: '456M', growth: '+8.7%', color: [139, 92, 246] },
      { label: 'Mobile Penetration', value: '78%', growth: '+12.3%', color: [245, 158, 11] }
    ];
    
    let xPos = 20;
    metrics.forEach((metric, index) => {
      if (index === 2) {
        xPos = 20;
        yPos += 35;
      }
      
      // Metric box
      pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2], 0.1);
      pdf.rect(xPos, yPos - 5, 85, 30, 'F');
      pdf.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
      pdf.rect(xPos, yPos - 5, 85, 30, 'S');
      
      pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.value, xPos + 5, yPos + 8);
      
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(metric.label, xPos + 5, yPos + 16);
      
      pdf.setTextColor(16, 185, 129); // emerald-600
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.growth, xPos + 5, yPos + 22);
      
      xPos += 90;
    });
    
    yPos += 50;
    
    // Digital Economy Insights
    pdf.setFillColor(254, 249, 195); // yellow-50
    pdf.rect(20, yPos - 5, 170, 60, 'F');
    pdf.setDrawColor(245, 158, 11); // amber-600
    pdf.rect(20, yPos - 5, 170, 60, 'S');
    
    pdf.setTextColor(146, 64, 14); // amber-800
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Digital Economy Transformation', 25, yPos + 8);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    yPos += 18;
    
    const digitalInsights = [
      '• E-commerce GMV growing at 18.6% annually, reaching $174B in 2024',
      '• Digital payments adoption accelerated by 300% post-pandemic',
      '• Super app ecosystem dominance: Grab, Gojek, and regional players',
      '• Cross-border e-commerce represents 23% of total online transactions',
      '• Social commerce drives 65% of purchase discovery and decisions'
    ];
    
    digitalInsights.forEach(insight => {
      pdf.text(insight, 25, yPos);
      yPos += 8;
    });
    
    yPos += 20;
    
    // Investment Climate
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Investment & Trade Climate', 20, yPos);
    yPos += 15;
    
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const investmentData = [
      'FDI Inflows: $156B in 2023, up 12% from previous year',
      'Venture Capital: $8.2B invested in startups, led by fintech and e-commerce',
      'Infrastructure Investment: $2.3T committed through 2030 for digital infrastructure',
      'Trade Volume: $3.1T in total trade, with 31% growth in digital services exports'
    ];
    
    investmentData.forEach(item => {
      pdf.text(`• ${item}`, 25, yPos);
      yPos += 10;
    });
  }

  private createMarketAnalysis(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(139, 92, 246); // purple-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Analysis Deep Dive', 20, 17);
    
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 45;
    
    // Market Dynamics Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Dynamics & Growth Drivers', 20, yPos);
    yPos += 15;
    
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const growthDrivers = [
      '🚀 Demographic Dividend: 60% of population under 35 years old',
      '📱 Mobile-First Adoption: Leapfrogging traditional infrastructure',
      '🏛️ Government Digitization: National digital transformation initiatives',
      '💰 Rising Middle Class: 350M people entering middle-income bracket by 2030',
      '🌐 ASEAN Integration: Reduced trade barriers and harmonized regulations'
    ];
    
    growthDrivers.forEach(driver => {
      pdf.text(driver, 25, yPos);
      yPos += 10;
    });
    
    yPos += 15;
    
    // Country-Specific Analysis Table
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Country-Specific Market Analysis', 20, yPos);
    yPos += 15;
    
    const marketData = [
      { country: 'Indonesia', population: '273.5M', gdp: '$1.32T', growth: '+5.2%', digital: '73%', opportunity: 'Largest market, mobile commerce leader' },
      { country: 'Philippines', population: '109.6M', gdp: '$394B', growth: '+6.2%', digital: '68%', opportunity: 'English proficiency, BPO expertise' },
      { country: 'Vietnam', population: '97.3M', gdp: '$409B', growth: '+6.8%', digital: '75%', opportunity: 'Manufacturing hub, young population' },
      { country: 'Thailand', population: '69.8M', gdp: '$543B', growth: '+2.8%', digital: '85%', opportunity: 'Tourism gateway, stable economy' },
      { country: 'Malaysia', population: '32.7M', gdp: '$432B', growth: '+4.5%', digital: '78%', opportunity: 'Islamic finance, strategic location' },
      { country: 'Singapore', population: '5.9M', gdp: '$397B', growth: '+2.6%', digital: '92%', opportunity: 'Regional HQ, innovation hub' }
    ];
    
    // Enhanced table with better formatting
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(20, yPos - 3, 170, 12, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.text('Country', 25, yPos + 5);
    pdf.text('Population', 60, yPos + 5);
    pdf.text('GDP', 90, yPos + 5);
    pdf.text('Growth', 115, yPos + 5);
    pdf.text('Digital', 140, yPos + 5);
    pdf.text('Key Opportunity', 160, yPos + 5);
    yPos += 15;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    marketData.forEach(country => {
      if (data.selectedCountries.length === 0 || data.selectedCountries.some(selected => 
        country.country.toLowerCase().includes(selected) || selected.includes(country.country.toLowerCase())
      )) {
        // Alternating row colors
        if (marketData.indexOf(country) % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // slate-50
          pdf.rect(20, yPos - 3, 170, 10, 'F');
        }
        
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.text(country.country, 25, yPos + 3);
        pdf.text(country.population, 60, yPos + 3);
        pdf.text(country.gdp, 90, yPos + 3);
        
        pdf.setTextColor(16, 185, 129); // emerald-600
        pdf.text(country.growth, 115, yPos + 3);
        
        pdf.setTextColor(59, 130, 246); // blue-600
        pdf.text(country.digital, 140, yPos + 3);
        
        pdf.setTextColor(71, 85, 105); // slate-600
        const opportunityText = pdf.splitTextToSize(country.opportunity, 30);
        pdf.text(opportunityText, 160, yPos + 3);
        
        yPos += 12;
      }
    });
    
    yPos += 15;
    
    // Market Entry Barriers Analysis
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Entry Considerations', 20, yPos);
    yPos += 15;
    
    // Opportunities vs Challenges
    const leftColumn = 105;
    
    // Opportunities
    pdf.setFillColor(236, 253, 245); // emerald-50
    pdf.rect(20, yPos - 5, 80, 60, 'F');
    pdf.setDrawColor(16, 185, 129); // emerald-600
    pdf.rect(20, yPos - 5, 80, 60, 'S');
    
    pdf.setTextColor(6, 95, 70); // emerald-800
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Opportunities', 25, yPos + 5);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const opportunities = [
      '• Untapped rural markets',
      '• Government support for digitization',
      '• Growing middle class consumption',
      '• Regional trade agreements',
      '• Infrastructure development',
      '• Young, tech-savvy population'
    ];
    
    let opYPos = yPos + 15;
    opportunities.forEach(opp => {
      pdf.text(opp, 25, opYPos);
      opYPos += 7;
    });
    
    // Challenges
    pdf.setFillColor(254, 242, 242); // red-50
    pdf.rect(leftColumn, yPos - 5, 80, 60, 'F');
    pdf.setDrawColor(220, 38, 38); // red-600
    pdf.rect(leftColumn, yPos - 5, 80, 60, 'S');
    
    pdf.setTextColor(153, 27, 27); // red-800
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Challenges', leftColumn + 5, yPos + 5);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const challenges = [
      '• Regulatory complexity',
      '• Infrastructure gaps',
      '• Cultural adaptation needs',
      '• Local competition intensity',
      '• Currency volatility',
      '• Talent acquisition costs'
    ];
    
    let chalYPos = yPos + 15;
    challenges.forEach(chal => {
      pdf.text(chal, leftColumn + 5, chalYPos);
      chalYPos += 7;
    });
  }

  private createCountryInsights(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(245, 158, 11); // amber-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Country Insights & Market Opportunities', 20, 17);
    
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 45;
    
    const insights = [
      {
        country: 'Indonesia',
        flag: '🇮🇩',
        insight: 'World\'s 4th largest population with 273M people, archipelago nation with 17,000+ islands',
        opportunity: 'Digital banking, e-commerce logistics, mobile payments',
        keyStats: 'GDP: $1.32T | Growth: 5.2% | Digital: 73%',
        marketEntry: 'Focus on Java island (60% of population), partner with local conglomerates',
        challenges: 'Complex regulations, infrastructure gaps in outer islands'
      },
      {
        country: 'Vietnam',
        flag: '🇻🇳',
        insight: 'Fastest growing economy at 6.8%, median age 32.5, strong manufacturing base',
        opportunity: 'Manufacturing hub, tech outsourcing, consumer goods',
        keyStats: 'GDP: $409B | Growth: 6.8% | Digital: 75%',
        marketEntry: 'Ho Chi Minh City and Hanoi as primary markets, leverage cost advantages',
        challenges: 'Limited English proficiency, evolving regulatory framework'
      },
      {
        country: 'Philippines',
        flag: '🇵🇭',
        insight: 'Strong English proficiency, large BPO industry, remittance-driven economy',
        opportunity: 'Digital services, remittance solutions, e-commerce',
        keyStats: 'GDP: $394B | Growth: 6.2% | Digital: 68%',
        marketEntry: 'Manila metro area focus, leverage English-speaking workforce',
        challenges: 'Natural disaster risks, infrastructure quality, regulatory complexity'
      },
      {
        country: 'Singapore',
        flag: '🇸🇬',
        insight: 'Regional financial hub, highest GDP per capita ($67K), innovation ecosystem',
        opportunity: 'Fintech innovation, regional headquarters, wealth management',
        keyStats: 'GDP: $397B | Growth: 2.6% | Digital: 92%',
        marketEntry: 'Use as regional hub, focus on high-value services and innovation',
        challenges: 'High operational costs, intense competition, limited domestic market'
      },
      {
        country: 'Thailand',
        flag: '🇹🇭',
        insight: 'Tourism gateway, stable monarchy, automotive manufacturing hub',
        opportunity: 'Tourism tech, automotive, food & agriculture',
        keyStats: 'GDP: $543B | Growth: 2.8% | Digital: 85%',
        marketEntry: 'Bangkok as primary market, leverage tourism and manufacturing sectors',
        challenges: 'Political sensitivity, aging population, middle-income trap'
      },
      {
        country: 'Malaysia',
        flag: '🇲🇾',
        insight: 'Islamic finance hub, strategic location, multicultural society',
        opportunity: 'Islamic fintech, halal products, palm oil tech',
        keyStats: 'GDP: $432B | Growth: 4.5% | Digital: 78%',
        marketEntry: 'Kuala Lumpur focus, leverage Islamic finance expertise',
        challenges: 'Bumiputera requirements, political considerations, skills gap'
      }
    ];
    
    const filteredInsights = insights.filter(item => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        item.country.toLowerCase().includes(selected) || 
        selected.includes(item.country.toLowerCase())
      )
    );
    
    filteredInsights.forEach((item, index) => {
      // Country header with flag
      pdf.setFillColor(59, 130, 246, 0.1); // blue with transparency
      pdf.rect(20, yPos - 5, 170, 15, 'F');
      
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${item.flag} ${item.country}`, 25, yPos + 5);
      
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.keyStats, 130, yPos + 5);
      
      yPos += 20;
      
      // Market Insight
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Market Profile:', 25, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // slate-700
      const insightLines = pdf.splitTextToSize(item.insight, 160);
      pdf.text(insightLines, 25, yPos + 8);
      yPos += 8 + (insightLines.length * 6);
      
      // Opportunities
      pdf.setTextColor(6, 95, 70); // emerald-800
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Opportunities:', 25, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // slate-700
      const oppLines = pdf.splitTextToSize(item.opportunity, 160);
      pdf.text(oppLines, 25, yPos + 8);
      yPos += 8 + (oppLines.length * 6);
      
      // Market Entry Strategy
      pdf.setTextColor(59, 130, 246); // blue-600
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Entry Strategy:', 25, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // slate-700
      const entryLines = pdf.splitTextToSize(item.marketEntry, 160);
      pdf.text(entryLines, 25, yPos + 8);
      yPos += 8 + (entryLines.length * 6);
      
      // Challenges
      pdf.setTextColor(153, 27, 27); // red-800
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Challenges:', 25, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // slate-700
      const chalLines = pdf.splitTextToSize(item.challenges, 160);
      pdf.text(chalLines, 25, yPos + 8);
      yPos += 8 + (chalLines.length * 6) + 10;
      
      // Add spacing between countries
      if (data.selectedCountries.length === 0 || data.selectedCountries.some(selected => 
        item.country.toLowerCase().includes(selected) || selected.includes(item.country.toLowerCase())
      )) {
        if (index < filteredInsights.length - 1) {
          // Add separator line
          pdf.setDrawColor(203, 213, 225); // slate-300
          pdf.line(20, yPos, 190, yPos);
          yPos += 15;
        }
      }
    });
  }

  private createCompetitiveLandscape(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(220, 38, 38); // red-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Competitive Landscape Analysis', 20, 17);
    
    let yPos = 45;
    
    // Market Leaders by Sector
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Leaders by Sector', 20, yPos);
    yPos += 15;
    
    const sectors = [
      {
        name: 'E-commerce',
        leaders: ['Shopee', 'Lazada', 'Tokopedia'],
        marketShare: '68%',
        competition: 'Very High',
        barriers: 'High',
        opportunity: 'B2B e-commerce, niche verticals'
      },
      {
        name: 'Fintech',
        leaders: ['Grab Financial', 'GoPay', 'TrueMoney'],
        marketShare: '46%',
        competition: 'High',
        barriers: 'Very High',
        opportunity: 'SME lending, cross-border payments'
      },
      {
        name: 'Ride-hailing',
        leaders: ['Grab', 'Gojek', 'InDriver'],
        marketShare: '81%',
        competition: 'Very High',
        barriers: 'Very High',
        opportunity: 'Corporate transport, logistics'
      },
      {
        name: 'Food Delivery',
        leaders: ['GrabFood', 'foodpanda', 'GoFood'],
        marketShare: '72%',
        competition: 'High',
        barriers: 'High',
        opportunity: 'Cloud kitchens, B2B catering'
      }
    ];
    
    sectors.forEach(sector => {
      // Sector box
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.rect(20, yPos - 3, 170, 35, 'F');
      pdf.setDrawColor(59, 130, 246); // blue-600
      pdf.rect(20, yPos - 3, 170, 35, 'S');
      
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sector.name, 25, yPos + 5);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Leaders: ${sector.leaders.join(', ')}`, 25, yPos + 12);
      pdf.text(`Market Share: ${sector.marketShare} | Competition: ${sector.competition}`, 25, yPos + 19);
      pdf.text(`Opportunity: ${sector.opportunity}`, 25, yPos + 26);
      
      yPos += 40;
    });
    
    yPos += 10;
    
    // Competitive Positioning Matrix
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Entry Strategy Matrix', 20, yPos);
    yPos += 15;
    
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Strategic positioning recommendations based on market dynamics and competitive intensity:', 20, yPos);
    yPos += 15;
    
    const strategies = [
      {
        approach: 'Blue Ocean Strategy',
        sectors: 'B2B SaaS, AgriTech, HealthTech',
        rationale: 'Lower competition, government support, underserved markets'
      },
      {
        approach: 'Niche Specialization',
        sectors: 'Islamic Finance, Sustainable Tech, Elder Care',
        rationale: 'Specific market needs, regulatory advantages, demographic trends'
      },
      {
        approach: 'Partnership & Acquisition',
        sectors: 'E-commerce, Fintech, Logistics',
        rationale: 'High barriers to entry, established players, regulatory requirements'
      },
      {
        approach: 'Technology Differentiation',
        sectors: 'AI/ML, Blockchain, IoT',
        rationale: 'Innovation gaps, early adoption phase, government initiatives'
      }
    ];
    
    strategies.forEach(strategy => {
      pdf.setTextColor(16, 185, 129); // emerald-600
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${strategy.approach}:`, 25, yPos);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Sectors: ${strategy.sectors}`, 25, yPos + 8);
      
      const rationaleLines = pdf.splitTextToSize(`Rationale: ${strategy.rationale}`, 160);
      pdf.text(rationaleLines, 25, yPos + 16);
      
      yPos += 16 + (rationaleLines.length * 6) + 8;
    });
  }
  
  private createConsumerInsights(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(139, 92, 246); // purple-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Consumer Behavior & Digital Trends', 20, 17);
    
    let yPos = 45;
    
    // Digital Consumer Profile
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian Digital Consumer Profile', 20, yPos);
    yPos += 15;
    
    const consumerStats = [
      { metric: 'Mobile-First Shopping', value: '78%', trend: '+24%', insight: 'Prefer mobile apps over desktop' },
      { metric: 'Social Commerce Influence', value: '65%', trend: '+32%', insight: 'Purchase decisions driven by social media' },
      { metric: 'Digital Payment Adoption', value: '72%', trend: '+29%', insight: 'Cash-to-digital transition accelerating' },
      { metric: 'Cross-border Shopping', value: '43%', trend: '+18%', insight: 'International brands via e-commerce' }
    ];
    
    consumerStats.forEach((stat, index) => {
      const xPos = 20 + (index % 2) * 85;
      if (index === 2) yPos += 35;
      
      // Stat box
      pdf.setFillColor(139, 92, 246, 0.1); // purple with transparency
      pdf.rect(xPos, yPos - 5, 80, 30, 'F');
      pdf.setDrawColor(139, 92, 246); // purple-600
      pdf.rect(xPos, yPos - 5, 80, 30, 'S');
      
      pdf.setTextColor(139, 92, 246); // purple-600
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.value, xPos + 5, yPos + 5);
      
      pdf.setTextColor(16, 185, 129); // emerald-600
      pdf.setFontSize(10);
      pdf.text(stat.trend, xPos + 35, yPos + 5);
      
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.metric, xPos + 5, yPos + 13);
      
      const insightLines = pdf.splitTextToSize(stat.insight, 70);
      pdf.text(insightLines, xPos + 5, yPos + 19);
    });
    
    yPos += 50;
    
    // Shopping Behavior Trends
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Shopping Behavior Trends', 20, yPos);
    yPos += 15;
    
    const behaviorTrends = [
      '🛒 Live Commerce: 34% have purchased through live streaming',
      '🎯 Personalization: 67% expect tailored product recommendations',
      '🌱 Sustainability: 54% willing to pay premium for eco-friendly products',
      '⚡ Same-day Delivery: 71% expect delivery within 24 hours',
      '💬 Customer Service: 82% prefer chat-based support over phone',
      '🔒 Data Privacy: 59% concerned about personal data usage'
    ];
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    behaviorTrends.forEach(trend => {
      pdf.text(trend, 25, yPos);
      yPos += 10;
    });
    
    yPos += 15;
    
    // Digital Payment Preferences
    pdf.setFillColor(254, 249, 195); // yellow-50
    pdf.rect(20, yPos - 5, 170, 50, 'F');
    pdf.setDrawColor(245, 158, 11); // amber-600
    pdf.rect(20, yPos - 5, 170, 50, 'S');
    
    pdf.setTextColor(146, 64, 14); // amber-800
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Digital Payment Ecosystem', 25, yPos + 8);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    yPos += 18;
    
    const paymentInsights = [
      '• E-wallets dominate: GrabPay, GoPay, TrueMoney lead adoption',
      '• QR code payments: 89% of digital transactions use QR codes',
      '• Buy Now Pay Later: 28% adoption rate, growing 45% annually',
      '• Cryptocurrency: 12% have used crypto for payments',
      '• Cross-border: 67% prefer local payment methods for international purchases'
    ];
    
    paymentInsights.forEach(insight => {
      pdf.text(insight, 25, yPos);
      yPos += 7;
    });
    
    yPos += 20;
    
    // Generational Differences
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Generational Consumer Preferences', 20, yPos);
    yPos += 15;
    
    const generations = [
      { name: 'Gen Z (18-25)', preferences: 'Social commerce, sustainability, mobile-first, instant gratification' },
      { name: 'Millennials (26-40)', preferences: 'Convenience, brand loyalty, omnichannel, value for money' },
      { name: 'Gen X (41-55)', preferences: 'Quality, security, customer service, traditional channels' }
    ];
    
    generations.forEach(gen => {
      pdf.setTextColor(59, 130, 246); // blue-600
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${gen.name}:`, 25, yPos);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const prefLines = pdf.splitTextToSize(gen.preferences, 150);
      pdf.text(prefLines, 70, yPos);
      
      yPos += Math.max(10, prefLines.length * 6);
    });
  }

  private createStrategicRecommendations(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(16, 185, 129); // emerald-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Market Entry Recommendations', 20, 17);
    
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 45;
    
    // Executive Recommendation Summary
    pdf.setFillColor(236, 253, 245); // emerald-50
    pdf.rect(20, yPos - 5, 170, 40, 'F');
    pdf.setDrawColor(16, 185, 129); // emerald-600
    pdf.rect(20, yPos - 5, 170, 40, 'S');
    
    pdf.setTextColor(6, 95, 70); // emerald-800
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Recommendation', 25, yPos + 8);
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    yPos += 18;
    
    const execSummary = 'Prioritize mobile-first digital strategies with local partnerships in tier-1 cities. Focus on Vietnam and Indonesia for highest growth potential, while using Singapore as regional headquarters.';
    const summaryLines = pdf.splitTextToSize(execSummary, 160);
    pdf.text(summaryLines, 25, yPos);
    yPos += (summaryLines.length * 6) + 20;
    
    const phases = [
      {
        phase: 'Phase 1: Market Foundation',
        timeline: '0-6 months',
        color: [59, 130, 246], // blue
        actions: [
          'Conduct comprehensive market research and consumer insights analysis',
          'Identify and engage strategic local partners and distributors',
          'Establish regulatory compliance framework and legal entity',
          'Develop localized digital presence and brand positioning',
          'Build relationships with government agencies and industry associations',
          'Recruit local talent and establish initial team structure'
        ]
      },
      {
        phase: 'Phase 2: Market Entry & Launch',
        timeline: '6-18 months',
        color: [139, 92, 246], // purple
        actions: [
          'Launch pilot programs in 2-3 tier-1 cities with selected partners',
          'Build comprehensive customer service and support infrastructure',
          'Implement localized marketing campaigns across digital channels',
          'Establish supply chain partnerships and logistics networks',
          'Deploy mobile-first technology platform with local integrations',
          'Monitor performance metrics and gather customer feedback'
        ]
      },
      {
        phase: 'Phase 3: Scale & Optimization',
        timeline: '18+ months',
        color: [16, 185, 129], // emerald
        actions: [
          'Expand to secondary markets and tier-2 cities based on success metrics',
          'Optimize operations and supply chain based on market learnings',
          'Consider strategic acquisitions of local players or technologies',
          'Build regional innovation capabilities and R&D centers',
          'Develop ecosystem partnerships with complementary services',
          'Establish thought leadership and industry presence'
        ]
      }
    ];
    
    phases.forEach(phase => {
      // Phase header
      pdf.setFillColor(phase.color[0], phase.color[1], phase.color[2], 0.1);
      pdf.rect(20, yPos - 5, 170, 15, 'F');
      pdf.setDrawColor(phase.color[0], phase.color[1], phase.color[2]);
      pdf.rect(20, yPos - 5, 170, 15, 'S');
      
      pdf.setTextColor(phase.color[0], phase.color[1], phase.color[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(phase.phase, 25, yPos + 5);
      
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(phase.timeline, 140, yPos + 5);
      
      yPos += 20;
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      phase.actions.forEach(action => {
        pdf.text(`• ${action}`, 25, yPos);
        yPos += 7;
      });
      yPos += 10;
    });
    
    yPos += 10;
    
    // Success Metrics
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Success Metrics & KPIs', 20, yPos);
    yPos += 15;
    
    const kpis = [
      'Market Share: Target 5-10% in primary segments within 24 months',
      'Revenue Growth: Achieve $50M+ ARR by end of Phase 2',
      'Customer Acquisition: 100K+ active users in first 18 months',
      'Partnership Network: 25+ strategic partnerships across value chain',
      'Brand Recognition: Top 3 brand awareness in target categories',
      'Operational Efficiency: <15% customer acquisition cost ratio'
    ];
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    kpis.forEach(kpi => {
      pdf.text(`• ${kpi}`, 25, yPos);
      yPos += 8;
    });
  }
  
  private createImplementationRoadmap(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(245, 158, 11); // amber-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Implementation Roadmap & Timeline', 20, 17);
    
    let yPos = 45;
    
    // 90-Day Quick Wins
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('90-Day Quick Wins Strategy', 20, yPos);
    yPos += 15;
    
    const quickWins = [
      { week: 'Week 1-2', action: 'Market research completion and partner identification' },
      { week: 'Week 3-4', action: 'Legal entity setup and regulatory compliance initiation' },
      { week: 'Week 5-8', action: 'Local team recruitment and office establishment' },
      { week: 'Week 9-12', action: 'Pilot program design and initial partner agreements' }
    ];
    
    quickWins.forEach(item => {
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.rect(20, yPos - 3, 170, 12, 'F');
      
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.week, 25, yPos + 4);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.action, 70, yPos + 4);
      
      yPos += 15;
    });
    
    yPos += 15;
    
    // Resource Requirements
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resource Requirements & Investment', 20, yPos);
    yPos += 15;
    
    const resources = [
      { category: 'Initial Investment', amount: '$2-5M', details: 'Legal setup, office, initial inventory, marketing' },
      { category: 'Team Size', amount: '15-25 people', details: 'Country manager, sales, marketing, operations, support' },
      { category: 'Technology Stack', amount: '$500K-1M', details: 'Platform localization, payment integration, mobile apps' },
      { category: 'Marketing Budget', amount: '$1-2M annually', details: 'Digital marketing, PR, events, partnerships' }
    ];
    
    resources.forEach(resource => {
      pdf.setTextColor(16, 185, 129); // emerald-600
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${resource.category}: ${resource.amount}`, 25, yPos);
      
      pdf.setTextColor(71, 85, 105); // slate-600
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(resource.details, 25, yPos + 8);
      
      yPos += 18;
    });
    
    yPos += 10;
    
    // Risk Mitigation Timeline
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Mitigation & Contingency Planning', 20, yPos);
    yPos += 15;
    
    const risks = [
      { risk: 'Regulatory Changes', mitigation: 'Maintain government relations, legal monitoring, compliance buffer' },
      { risk: 'Local Competition', mitigation: 'Differentiation strategy, partnership approach, niche focus' },
      { risk: 'Currency Fluctuation', mitigation: 'Local sourcing, hedging strategies, flexible pricing' },
      { risk: 'Talent Acquisition', mitigation: 'Competitive packages, training programs, retention strategies' }
    ];
    
    risks.forEach(item => {
      pdf.setTextColor(220, 38, 38); // red-600
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Risk: ${item.risk}`, 25, yPos);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const mitigationLines = pdf.splitTextToSize(`Mitigation: ${item.mitigation}`, 160);
      pdf.text(mitigationLines, 25, yPos + 8);
      
      yPos += 8 + (mitigationLines.length * 6) + 5;
    });
  }
  
  private createRiskAssessment(pdf: any, data: ExportData): void {
    // Light professional theme
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Header section
    pdf.setFillColor(220, 38, 38); // red-600
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Assessment & Mitigation Framework', 20, 17);
    
    let yPos = 45;
    
    // Risk Matrix
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Comprehensive Risk Analysis Matrix', 20, yPos);
    yPos += 15;
    
    const riskMatrix = [
      { category: 'Political/Regulatory', level: 'Medium', impact: 'High', probability: 'Medium', mitigation: 'Government relations, legal compliance, local partnerships' },
      { category: 'Economic/Currency', level: 'Medium', impact: 'Medium', probability: 'High', mitigation: 'Hedging strategies, local sourcing, flexible pricing models' },
      { category: 'Competitive', level: 'High', impact: 'High', probability: 'High', mitigation: 'Differentiation, partnerships, niche positioning' },
      { category: 'Operational', level: 'Low', impact: 'Medium', probability: 'Medium', mitigation: 'Process standardization, local expertise, technology investment' },
      { category: 'Cultural/Social', level: 'Medium', impact: 'Medium', probability: 'Low', mitigation: 'Cultural training, local hiring, community engagement' },
      { category: 'Technology/Cyber', level: 'Medium', impact: 'High', probability: 'Medium', mitigation: 'Security protocols, data protection, backup systems' }
    ];
    
    // Table header
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(20, yPos - 3, 170, 12, 'F');
    
    pdf.setTextColor(51, 65, 85); // slate-700
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Category', 25, yPos + 4);
    pdf.text('Level', 70, yPos + 4);
    pdf.text('Impact', 90, yPos + 4);
    pdf.text('Probability', 110, yPos + 4);
    pdf.text('Mitigation Strategy', 140, yPos + 4);
    yPos += 15;
    
    riskMatrix.forEach((risk, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.rect(20, yPos - 3, 170, 12, 'F');
      }
      
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(risk.category, 25, yPos + 4);
      
      // Color-coded risk levels
      const levelColor = risk.level === 'High' ? [220, 38, 38] : risk.level === 'Medium' ? [245, 158, 11] : [16, 185, 129];
      pdf.setTextColor(levelColor[0], levelColor[1], levelColor[2]);
      pdf.text(risk.level, 70, yPos + 4);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.text(risk.impact, 90, yPos + 4);
      pdf.text(risk.probability, 110, yPos + 4);
      
      const mitigationText = pdf.splitTextToSize(risk.mitigation, 45);
      pdf.text(mitigationText, 140, yPos + 4);
      
      yPos += Math.max(12, mitigationText.length * 6);
    });
    
    yPos += 15;
    
    // Scenario Planning
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scenario Planning & Contingencies', 20, yPos);
    yPos += 15;
    
    const scenarios = [
      {
        name: 'Best Case Scenario',
        description: 'Rapid market acceptance, strong partnerships, favorable regulations',
        actions: 'Accelerate expansion, increase investment, capture market share'
      },
      {
        name: 'Base Case Scenario',
        description: 'Steady growth, moderate competition, stable regulatory environment',
        actions: 'Execute planned strategy, monitor metrics, adjust as needed'
      },
      {
        name: 'Worst Case Scenario',
        description: 'Regulatory barriers, intense competition, economic downturn',
        actions: 'Pivot strategy, reduce costs, focus on core markets'
      }
    ];
    
    scenarios.forEach(scenario => {
      const bgColor = scenario.name.includes('Best') ? [236, 253, 245] : 
                     scenario.name.includes('Worst') ? [254, 242, 242] : [239, 246, 255];
      const borderColor = scenario.name.includes('Best') ? [16, 185, 129] : 
                         scenario.name.includes('Worst') ? [220, 38, 38] : [59, 130, 246];
      
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(20, yPos - 5, 170, 35, 'F');
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.rect(20, yPos - 5, 170, 35, 'S');
      
      pdf.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(scenario.name, 25, yPos + 5);
      
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      const descLines = pdf.splitTextToSize(scenario.description, 160);
      pdf.text(descLines, 25, yPos + 12);
      
      pdf.setTextColor(30, 64, 175); // blue-800
      pdf.setFont('helvetica', 'bold');
      pdf.text('Actions:', 25, yPos + 20);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // slate-700
      const actionLines = pdf.splitTextToSize(scenario.actions, 130);
      pdf.text(actionLines, 55, yPos + 20);
      
      yPos += 40;
    });
    
    // Footer with data sources
    yPos = 270;
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Data Sources: World Bank, IMF, ASEAN Secretariat, McKinsey Global Institute, Bain & Company, Google-Temasek e-Conomy SEA', 20, yPos);
    pdf.text('Report generated by Flow Analytics Platform - Professional Market Intelligence', 20, yPos + 8);
  }

  private getMarketOverviewData(data: ExportData) {
    const allCountries = [
      { Country: 'Indonesia', Population: '273.5M', GDP: '$1.32T', Growth: '5.2%', Market_Size: '$287B', Digital_Penetration: '73%', Urbanization: '56%', Median_Age: 30.2 },
      { Country: 'Philippines', Population: '109.6M', GDP: '$394B', Growth: '6.2%', Market_Size: '$156B', Digital_Penetration: '68%', Urbanization: '47%', Median_Age: 25.7 },
      { Country: 'Vietnam', Population: '97.3M', GDP: '$409B', Growth: '6.8%', Market_Size: '$142B', Digital_Penetration: '75%', Urbanization: '37%', Median_Age: 32.5 },
      { Country: 'Thailand', Population: '69.8M', GDP: '$543B', Growth: '2.8%', Market_Size: '$127B', Digital_Penetration: '85%', Urbanization: '51%', Median_Age: 40.1 },
      { Country: 'Malaysia', Population: '32.7M', GDP: '$432B', Growth: '4.5%', Market_Size: '$98B', Digital_Penetration: '78%', Urbanization: '77%', Median_Age: 30.3 },
      { Country: 'Singapore', Population: '5.9M', GDP: '$397B', Growth: '2.6%', Market_Size: '$89B', Digital_Penetration: '92%', Urbanization: '100%', Median_Age: 42.2 }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
    
    return allCountries;
  }

  private getCountryAnalysisData(data: ExportData) {
    const allCountries = [
      { Country: 'Indonesia', Digital_Penetration: '73%', Urbanization: '56%', Median_Age: 30.2, Working_Age_Pop: '68.7%', Internet_Users: '196M', Mobile_Penetration: '73%' },
      { Country: 'Philippines', Digital_Penetration: '68%', Urbanization: '47%', Median_Age: 25.7, Working_Age_Pop: '64.1%', Internet_Users: '73M', Mobile_Penetration: '68%' },
      { Country: 'Vietnam', Digital_Penetration: '75%', Urbanization: '37%', Median_Age: 32.5, Working_Age_Pop: '69.3%', Internet_Users: '75M', Mobile_Penetration: '75%' },
      { Country: 'Thailand', Digital_Penetration: '85%', Urbanization: '51%', Median_Age: 40.1, Working_Age_Pop: '71.2%', Internet_Users: '57M', Mobile_Penetration: '85%' },
      { Country: 'Malaysia', Digital_Penetration: '78%', Urbanization: '77%', Median_Age: 30.3, Working_Age_Pop: '69.6%', Internet_Users: '26M', Mobile_Penetration: '78%' },
      { Country: 'Singapore', Digital_Penetration: '92%', Urbanization: '100%', Median_Age: 42.2, Working_Age_Pop: '72.1%', Internet_Users: '5.2M', Mobile_Penetration: '92%' }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
    
    return allCountries;
  }

  private getDigitalMetricsData(data: ExportData) {
    const allCountries = [
      { Country: 'Singapore', Internet: '89%', Mobile: '92%', Ecommerce: '78%', Digital_Payments: '85%', Social_Media: '85%', Cloud_Adoption: '72%', Fintech_Usage: '67%' },
      { Country: 'Thailand', Internet: '82%', Mobile: '85%', Ecommerce: '65%', Digital_Payments: '72%', Social_Media: '76%', Cloud_Adoption: '58%', Fintech_Usage: '54%' },
      { Country: 'Malaysia', Internet: '84%', Mobile: '78%', Ecommerce: '58%', Digital_Payments: '68%', Social_Media: '81%', Cloud_Adoption: '54%', Fintech_Usage: '49%' },
      { Country: 'Indonesia', Internet: '71%', Mobile: '73%', Ecommerce: '52%', Digital_Payments: '61%', Social_Media: '68%', Cloud_Adoption: '45%', Fintech_Usage: '43%' },
      { Country: 'Philippines', Internet: '67%', Mobile: '68%', Ecommerce: '45%', Digital_Payments: '55%', Social_Media: '72%', Cloud_Adoption: '41%', Fintech_Usage: '38%' },
      { Country: 'Vietnam', Internet: '77%', Mobile: '75%', Ecommerce: '49%', Digital_Payments: '58%', Social_Media: '74%', Cloud_Adoption: '43%', Fintech_Usage: '41%' }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
    
    return allCountries;
  }

  private getEconomicData(data: ExportData) {
    const allCountries = [
      { Country: 'Indonesia', GDP_Billions: 1319, Inflation: '3.2%', Unemployment: '5.8%', Interest_Rate: '6.0%', FDI_Billions: 28.6, Trade_Balance: '+7.4B', Ease_Business_Rank: 73 },
      { Country: 'Philippines', GDP_Billions: 394, Inflation: '4.1%', Unemployment: '4.5%', Interest_Rate: '6.5%', FDI_Billions: 9.8, Trade_Balance: '-43.2B', Ease_Business_Rank: 95 },
      { Country: 'Vietnam', GDP_Billions: 409, Inflation: '3.6%', Unemployment: '2.3%', Interest_Rate: '4.5%', FDI_Billions: 15.8, Trade_Balance: '+11.9B', Ease_Business_Rank: 70 },
      { Country: 'Thailand', GDP_Billions: 543, Inflation: '1.2%', Unemployment: '1.1%', Interest_Rate: '2.5%', FDI_Billions: 8.2, Trade_Balance: '+19.1B', Ease_Business_Rank: 21 },
      { Country: 'Malaysia', GDP_Billions: 432, Inflation: '2.8%', Unemployment: '3.3%', Interest_Rate: '3.0%', FDI_Billions: 3.9, Trade_Balance: '+37.8B', Ease_Business_Rank: 12 },
      { Country: 'Singapore', GDP_Billions: 397, Inflation: '2.1%', Unemployment: '2.0%', Interest_Rate: '3.5%', FDI_Billions: 91.3, Trade_Balance: '+76.4B', Ease_Business_Rank: 2 }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
    
    return allCountries;
  }

  private createPowerPointOutline(data: ExportData): string {
    return `
FLOW - PROFESSIONAL SOUTHEAST ASIAN MARKET INTELLIGENCE PITCH DECK
Generated: ${new Date().toLocaleDateString()}
Selected Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'All Markets'}
Analysis Focus: ${data.activeTab?.charAt(0).toUpperCase() + data.activeTab?.slice(1) || 'Comprehensive'}

================================================================================
SLIDE 1: TITLE SLIDE - "The Southeast Asian Opportunity"
================================================================================
VISUAL DESIGN:
- Clean, modern layout with Flow gradient logo (blue → emerald → purple)
- Hero image: Southeast Asian skyline montage or digital transformation visual
- Minimal text with strong typography hierarchy

CONTENT:
- Main Title: "Flow: Southeast Asian Market Intelligence"
- Subtitle: "Strategic Market Entry Analysis & Recommendations"
- Target Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'Indonesia, Philippines, Vietnam, Thailand, Malaysia, Singapore'}
- Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- Presenter credentials and company logo

SPEAKER NOTES:
- Welcome audience and introduce the opportunity in Southeast Asia
- Mention that this analysis covers ${data.selectedCountries.length || 6} key markets
- Set expectation for data-driven insights and actionable recommendations

================================================================================
SLIDE 2: EXECUTIVE SUMMARY - "The $1.2T Opportunity"
================================================================================
VISUAL DESIGN:
- Large impact numbers with icons
- Color-coded key metrics in cards/tiles
- Simple infographic showing regional growth trajectory

CONTENT:
- Total Addressable Market: $1.2T (18.6% digital growth)
- Population: 688M people (60% under 35)
- Internet Users: 456M (growing 8.7% annually)
- Mobile-First Economy: 78% prefer mobile commerce
- Investment Climate: $156B FDI in 2023 (+12% YoY)

KEY MESSAGE BOX:
"Southeast Asia represents the world's fastest-growing digital economy with unprecedented market entry opportunities for innovative companies."

SPEAKER NOTES:
- Emphasize the scale and growth trajectory
- Highlight the demographic dividend (young population)
- Position as a once-in-a-decade opportunity

================================================================================
SLIDE 3: MARKET LANDSCAPE - "Six Dynamic Economies"
================================================================================
VISUAL DESIGN:
- Interactive map of Southeast Asia with country highlights
- Bubble chart showing GDP vs Growth Rate vs Population
- Flag icons with key statistics

CONTENT:
Country Spotlight (focus on selected markets):
${data.selectedCountries.length > 0 ? 
  data.selectedCountries.map(country => {
    const countryData = {
      indonesia: { gdp: '$1.32T', growth: '5.2%', pop: '273M', highlight: 'Largest market, mobile commerce leader' },
      philippines: { gdp: '$394B', growth: '6.2%', pop: '110M', highlight: 'English proficiency, BPO expertise' },
      vietnam: { gdp: '$409B', growth: '6.8%', pop: '97M', highlight: 'Fastest growth, manufacturing hub' },
      thailand: { gdp: '$543B', growth: '2.8%', pop: '70M', highlight: 'Tourism gateway, stable economy' },
      malaysia: { gdp: '$432B', growth: '4.5%', pop: '33M', highlight: 'Islamic finance, strategic location' },
      singapore: { gdp: '$397B', growth: '2.6%', pop: '6M', highlight: 'Regional HQ, innovation hub' }
    }[country];
    return `• ${country.charAt(0).toUpperCase() + country.slice(1)}: ${countryData?.gdp} GDP, ${countryData?.growth} growth - ${countryData?.highlight}`;
  }).join('\n') :
  `• Indonesia: $1.32T GDP, 5.2% growth - Largest market, mobile commerce leader
• Philippines: $394B GDP, 6.2% growth - English proficiency, BPO expertise  
• Vietnam: $409B GDP, 6.8% growth - Fastest growth, manufacturing hub
• Thailand: $543B GDP, 2.8% growth - Tourism gateway, stable economy
• Malaysia: $432B GDP, 4.5% growth - Islamic finance, strategic location
• Singapore: $397B GDP, 2.6% growth - Regional HQ, innovation hub`}

SPEAKER NOTES:
- Walk through each country's unique value proposition
- Emphasize diversity of opportunities across markets
- Highlight complementary strengths for regional strategy

================================================================================
SLIDE 4: DIGITAL TRANSFORMATION - "Mobile-First Revolution"
================================================================================
VISUAL DESIGN:
- Smartphone-centric design with app ecosystem visualization
- Progressive bar charts showing digital adoption rates
- Before/after comparison of traditional vs digital behaviors

CONTENT:
Digital Adoption Metrics:
- Internet Penetration: 67-92% across markets
- Mobile Commerce: 78% prefer mobile shopping
- Digital Payments: 72% adoption (28% annual growth)
- Social Commerce: 65% of purchases influenced by social media
- Super App Usage: 89% use integrated platforms (Grab, Gojek)

Key Trends:
• Leapfrogging traditional infrastructure
• Government digitization initiatives
• Cross-border e-commerce growth (23% of transactions)
• Live commerce and social selling boom

SPEAKER NOTES:
- Emphasize the mobile-first nature of the market
- Explain how consumers skipped desktop and went straight to mobile
- Highlight the importance of social commerce and super apps

================================================================================
SLIDE 5: CONSUMER INSIGHTS - "Understanding the SEA Consumer"
================================================================================
VISUAL DESIGN:
- Consumer persona illustrations with demographic data
- Journey map showing digital touchpoints
- Generational comparison chart (Gen Z, Millennials, Gen X)

CONTENT:
Consumer Profile:
- Median Age: 25-42 years across markets
- Digital Natives: 60% under 35 years old
- Rising Middle Class: 350M entering middle income by 2030
- English Proficiency: Varies by market (Philippines highest)

Shopping Behaviors:
• 78% mobile-first shopping preference
• 65% social media purchase influence
• 71% expect same-day delivery
• 54% willing to pay premium for sustainability
• 82% prefer chat-based customer service

Payment Preferences:
• E-wallets dominate (GrabPay, GoPay, TrueMoney)
• QR codes: 89% of digital transactions
• Buy Now Pay Later: 28% adoption, 45% growth
• Cross-border: 67% prefer local payment methods

SPEAKER NOTES:
- Paint a picture of the sophisticated digital consumer
- Emphasize the importance of mobile-first strategy
- Highlight generational differences in approach

================================================================================
SLIDE 6: COMPETITIVE LANDSCAPE - "Market Dynamics & Positioning"
================================================================================
VISUAL DESIGN:
- Competitive positioning matrix (market share vs growth)
- Sector-by-sector competitive analysis
- Market entry difficulty heat map

CONTENT:
Market Leaders by Sector:
• E-commerce: Shopee, Lazada, Tokopedia (68% combined share)
• Fintech: Grab Financial, GoPay, TrueMoney (46% share)
• Ride-hailing: Grab, Gojek, InDriver (81% share)
• Food Delivery: GrabFood, foodpanda, GoFood (72% share)

Market Entry Strategies:
✓ Blue Ocean: B2B SaaS, AgriTech, HealthTech (low competition)
✓ Niche Specialization: Islamic Finance, Sustainable Tech, Elder Care
✓ Partnership/M&A: High-barrier sectors (e-commerce, fintech)
✓ Technology Differentiation: AI/ML, Blockchain, IoT

SPEAKER NOTES:
- Acknowledge the competitive landscape but highlight opportunities
- Emphasize the importance of differentiation and partnerships
- Position as strategic rather than head-to-head competition

================================================================================
SLIDE 7: MARKET ENTRY FRAMEWORK - "Strategic Approach"
================================================================================
VISUAL DESIGN:
- Three-phase timeline with milestones
- Resource allocation pie charts
- Success metrics dashboard mockup

CONTENT:
Phase 1: Foundation (0-6 months) - $2-5M Investment
• Market research and regulatory compliance
• Local partnerships and team building
• Digital presence and brand localization
• Pilot program development

Phase 2: Launch (6-18 months) - $5-10M Investment  
• Tier-1 city launches with partners
• Customer service infrastructure
• Localized marketing campaigns
• Technology platform deployment

Phase 3: Scale (18+ months) - $10-20M Investment
• Multi-market expansion
• Operations optimization
• Strategic acquisitions consideration
• Regional innovation capabilities

Success Metrics:
• Market Share: 5-10% in primary segments (24 months)
• Revenue: $50M+ ARR by end of Phase 2
• Users: 100K+ active users (18 months)
• Partnerships: 25+ strategic alliances

SPEAKER NOTES:
- Walk through the phased approach and rationale
- Emphasize the importance of local partnerships
- Highlight the scalability of the model

================================================================================
SLIDE 8: INVESTMENT ANALYSIS - "ROI & Financial Projections"
================================================================================
VISUAL DESIGN:
- Revenue projection charts (3-year forecast)
- Investment breakdown waterfall chart
- ROI comparison with other regions

CONTENT:
Investment Requirements:
• Initial Setup: $2-5M (legal, office, team, marketing)
• Technology: $500K-1M (platform localization, integrations)
• Marketing: $1-2M annually (digital, PR, partnerships)
• Operations: $3-5M (supply chain, customer service)

Revenue Projections (3-Year):
• Year 1: $5-10M (pilot markets, early adoption)
• Year 2: $25-50M (expansion, market penetration)
• Year 3: $75-150M (multi-market, optimization)

ROI Analysis:
• Break-even: 18-24 months
• 3-Year ROI: 200-400%
• Market Valuation: 5-10x revenue multiple
• Exit Opportunities: Strategic acquisition or IPO

SPEAKER NOTES:
- Present realistic but compelling financial projections
- Compare favorably to other emerging market opportunities
- Address the investment timeline and milestones

================================================================================
SLIDE 9: RISK ASSESSMENT - "Mitigation & Contingencies"
================================================================================
VISUAL DESIGN:
- Risk matrix (probability vs impact)
- Mitigation strategy flowchart
- Scenario planning comparison table

CONTENT:
Key Risks & Mitigation:
• Regulatory Changes → Government relations, legal monitoring
• Local Competition → Differentiation, partnerships, niche focus
• Currency Fluctuation → Local sourcing, hedging, flexible pricing
• Talent Acquisition → Competitive packages, training programs
• Cultural Adaptation → Local hiring, cultural training
• Technology/Cyber → Security protocols, data protection

Scenario Planning:
• Best Case: Accelerate expansion, increase investment
• Base Case: Execute planned strategy, monitor metrics
• Worst Case: Pivot strategy, reduce costs, focus core markets

Contingency Fund: 20% of total investment for unforeseen challenges

SPEAKER NOTES:
- Acknowledge risks but demonstrate thorough planning
- Show that mitigation strategies are already considered
- Emphasize the management team's experience with emerging markets

================================================================================
SLIDE 10: COUNTRY DEEP DIVE - "${data.selectedCountries.length > 0 ? data.selectedCountries[0].charAt(0).toUpperCase() + data.selectedCountries[0].slice(1) : 'Indonesia'} Focus"
================================================================================
VISUAL DESIGN:
- Country flag and key imagery
- Infographic with key statistics
- Market opportunity heat map

CONTENT:
${data.selectedCountries.length > 0 ? 
  (() => {
    const country = data.selectedCountries[0];
    const countryInfo = {
      indonesia: {
        profile: 'World\'s 4th largest population, archipelago nation with 17,000+ islands',
        opportunity: 'Digital banking, e-commerce logistics, mobile payments',
        strategy: 'Focus on Java island (60% of population), partner with local conglomerates',
        challenges: 'Complex regulations, infrastructure gaps in outer islands'
      },
      vietnam: {
        profile: 'Fastest growing economy, median age 32.5, strong manufacturing base',
        opportunity: 'Manufacturing hub, tech outsourcing, consumer goods',
        strategy: 'Ho Chi Minh City and Hanoi as primary markets, leverage cost advantages',
        challenges: 'Limited English proficiency, evolving regulatory framework'
      },
      philippines: {
        profile: 'Strong English proficiency, large BPO industry, remittance-driven economy',
        opportunity: 'Digital services, remittance solutions, e-commerce',
        strategy: 'Manila metro area focus, leverage English-speaking workforce',
        challenges: 'Natural disaster risks, infrastructure quality'
      },
      singapore: {
        profile: 'Regional financial hub, highest GDP per capita, innovation ecosystem',
        opportunity: 'Fintech innovation, regional headquarters, wealth management',
        strategy: 'Use as regional hub, focus on high-value services and innovation',
        challenges: 'High operational costs, intense competition, limited domestic market'
      },
      thailand: {
        profile: 'Tourism gateway, stable monarchy, automotive manufacturing hub',
        opportunity: 'Tourism tech, automotive, food & agriculture',
        strategy: 'Bangkok as primary market, leverage tourism and manufacturing sectors',
        challenges: 'Political sensitivity, aging population, middle-income trap'
      },
      malaysia: {
        profile: 'Islamic finance hub, strategic location, multicultural society',
        opportunity: 'Islamic fintech, halal products, palm oil tech',
        strategy: 'Kuala Lumpur focus, leverage Islamic finance expertise',
        challenges: 'Bumiputera requirements, political considerations'
      }
    }[country];
    
    return `Market Profile: ${countryInfo?.profile}
Key Opportunities: ${countryInfo?.opportunity}
Entry Strategy: ${countryInfo?.strategy}
Key Challenges: ${countryInfo?.challenges}`;
  })() :
  `Market Profile: World's 4th largest population, archipelago nation with 17,000+ islands
Key Opportunities: Digital banking, e-commerce logistics, mobile payments
Entry Strategy: Focus on Java island (60% of population), partner with local conglomerates
Key Challenges: Complex regulations, infrastructure gaps in outer islands`}

Market Metrics:
• Population: ${data.selectedCountries.includes('indonesia') ? '273.5M' : data.selectedCountries.includes('vietnam') ? '97.3M' : data.selectedCountries.includes('philippines') ? '109.6M' : '273.5M'}
• GDP Growth: ${data.selectedCountries.includes('vietnam') ? '6.8%' : data.selectedCountries.includes('philippines') ? '6.2%' : data.selectedCountries.includes('indonesia') ? '5.2%' : '5.2%'}
• Digital Penetration: ${data.selectedCountries.includes('singapore') ? '92%' : data.selectedCountries.includes('thailand') ? '85%' : '73%'}
• Market Size: ${data.selectedCountries.includes('indonesia') ? '$287B' : data.selectedCountries.includes('philippines') ? '$156B' : '$287B'}

SPEAKER NOTES:
- Deep dive into the primary target market
- Explain why this market was prioritized
- Address specific entry strategies and partnerships

================================================================================
SLIDE 11: TECHNOLOGY STACK - "Platform & Integration Strategy"
================================================================================
VISUAL DESIGN:
- Technology architecture diagram
- Integration ecosystem map
- Mobile app mockups and user interface examples

CONTENT:
Core Technology Requirements:
• Mobile-First Platform: iOS/Android native apps
• Payment Integration: Local e-wallets, QR codes, BNPL
• Language Localization: Multi-language support
• Cloud Infrastructure: AWS/Azure with local data centers
• API Ecosystem: Integration with local services

Key Integrations:
• Payment Gateways: GrabPay, GoPay, TrueMoney, local banks
• Logistics Partners: Local delivery networks, last-mile solutions
• Social Platforms: Facebook, Instagram, TikTok, local social networks
• Government Systems: Tax, regulatory, compliance APIs
• Analytics: Local data analytics and consumer insights platforms

Development Approach:
• Agile methodology with local development teams
• Continuous integration/deployment
• A/B testing for localization optimization
• Security-first architecture with data protection compliance

SPEAKER NOTES:
- Emphasize the importance of local technology partnerships
- Highlight the mobile-first approach
- Address data security and compliance requirements

================================================================================
SLIDE 12: PARTNERSHIP STRATEGY - "Local Ecosystem Integration"
================================================================================
VISUAL DESIGN:
- Partnership ecosystem diagram
- Logos of potential partners by category
- Value chain integration flowchart

CONTENT:
Strategic Partnership Categories:

Distribution Partners:
• Local retailers and distributors
• E-commerce platforms (Shopee, Lazada)
• Super apps (Grab, Gojek) for service integration

Technology Partners:
• Payment processors and fintech companies
• Cloud service providers with local presence
• System integrators and development agencies

Government & Regulatory:
• Industry associations and chambers of commerce
• Government agencies for compliance and support
• Local legal and consulting firms

Financial Partners:
• Local banks for payment processing
• Investment firms for funding and market access
• Insurance companies for risk management

Partnership Benefits:
• Market access and local credibility
• Regulatory compliance and government relations
• Technology integration and operational efficiency
• Risk mitigation and shared resources

SPEAKER NOTES:
- Emphasize the critical importance of local partnerships
- Explain how partnerships reduce risk and accelerate market entry
- Highlight specific partnership opportunities identified

================================================================================
SLIDE 13: MARKETING & BRAND STRATEGY - "Localization & Engagement"
================================================================================
VISUAL DESIGN:
- Brand adaptation examples across markets
- Social media engagement metrics and examples
- Customer journey mapping with local touchpoints

CONTENT:
Brand Localization Strategy:
• Cultural Adaptation: Local values, traditions, and preferences
• Language Localization: Native language content and support
• Visual Identity: Culturally appropriate colors, imagery, symbols
• Local Influencers: Partnership with regional KOLs and celebrities

Digital Marketing Mix:
• Social Commerce: Facebook, Instagram, TikTok campaigns (65% influence)
• Search Marketing: Google, local search engines optimization
• Mobile Advertising: In-app ads, mobile video content
• Content Marketing: Educational content, local success stories
• Community Building: Local events, user-generated content

Marketing Budget Allocation:
• Digital Advertising: 40% ($800K annually)
• Influencer Partnerships: 25% ($500K annually)
• Content Creation: 20% ($400K annually)
• Events & PR: 15% ($300K annually)

Success Metrics:
• Brand Awareness: Target 60% in primary markets (12 months)
• Social Engagement: 5% average engagement rate
• Customer Acquisition Cost: <$25 per user
• Conversion Rate: 3-5% from awareness to trial

SPEAKER NOTES:
- Emphasize the importance of cultural sensitivity
- Highlight the role of social commerce in the region
- Address the balance between global brand consistency and local adaptation

================================================================================
SLIDE 14: OPERATIONAL EXCELLENCE - "Scaling for Success"
================================================================================
VISUAL DESIGN:
- Organizational chart with local and regional roles
- Process flow diagrams for key operations
- Quality metrics dashboard

CONTENT:
Organizational Structure:
• Regional HQ: Singapore (strategy, finance, legal)
• Country Managers: Local market leadership and execution
• Shared Services: Technology, marketing, supply chain
• Local Teams: Sales, customer service, operations

Key Operational Processes:
• Supply Chain: Local sourcing, inventory management, logistics
• Customer Service: Multi-language support, chat-based service
• Quality Assurance: Local standards compliance, continuous improvement
• Financial Management: Multi-currency, local accounting, tax compliance

Performance Management:
• KPI Dashboard: Real-time metrics across all markets
• Regular Reviews: Monthly country performance, quarterly regional
• Continuous Improvement: Process optimization, best practice sharing
• Risk Management: Early warning systems, contingency planning

Scaling Considerations:
• Standardized processes with local flexibility
• Technology platform scalability
• Talent development and retention programs
• Knowledge management and transfer systems

SPEAKER NOTES:
- Emphasize the balance between standardization and localization
- Highlight the importance of local talent and leadership
- Address scalability and operational efficiency

================================================================================
SLIDE 15: NEXT STEPS - "Implementation Roadmap"
================================================================================
VISUAL DESIGN:
- 90-day action plan timeline
- Milestone markers with success criteria
- Resource allocation and responsibility matrix

CONTENT:
Immediate Actions (Next 30 Days):
• Finalize market selection and prioritization
• Initiate legal entity setup and regulatory compliance
• Begin recruitment for country manager positions
• Engage with potential strategic partners
• Secure initial funding and budget approval

90-Day Milestones:
• Complete market research and competitive analysis
• Establish legal entities and regulatory compliance
• Hire key local team members
• Sign initial partnership agreements
• Begin technology platform localization

6-Month Goals:
• Launch pilot programs in primary markets
• Establish customer service infrastructure
• Complete brand localization and marketing campaigns
• Achieve first customer acquisitions and revenue
• Validate business model and unit economics

Investment Requirements:
• Phase 1 Funding: $2-5M (immediate)
• Series A: $10-15M (6-12 months)
• Growth Capital: $25-50M (18-24 months)

Decision Points:
• Market selection confirmation (30 days)
• Partnership strategy approval (60 days)
• Go/no-go decision for full launch (90 days)

SPEAKER NOTES:
- Create urgency around the market opportunity
- Outline clear next steps and decision points
- Address funding requirements and timeline
- Emphasize the competitive advantage of early entry

================================================================================
SLIDE 16: APPENDIX - "Supporting Data & Analysis"
================================================================================
VISUAL DESIGN:
- Data tables and detailed charts
- Methodology explanation
- Source citations and references

CONTENT:
Detailed Market Data:
• Country-by-country economic indicators
• Digital adoption metrics and trends
• Competitive landscape analysis
• Consumer behavior research findings
• Regulatory environment assessment

Financial Models:
• Revenue projections and assumptions
• Cost structure analysis
• ROI calculations and sensitivity analysis
• Funding requirements and use of funds
• Exit scenario modeling

Risk Analysis:
• Comprehensive risk register
• Probability and impact assessments
• Mitigation strategies and contingency plans
• Scenario planning and stress testing

Data Sources:
• World Bank, IMF, ASEAN Secretariat
• McKinsey Global Institute, Bain & Company
• Google-Temasek e-Conomy SEA Report
• Local government statistics and industry reports
• Primary research and expert interviews

SPEAKER NOTES:
- Reference appendix for detailed questions
- Highlight the rigor of the analysis
- Provide contact information for follow-up

================================================================================
PRESENTATION DESIGN GUIDELINES:
================================================================================

VISUAL CONSISTENCY:
• Use Flow brand colors throughout: Blue (#3B82F6), Emerald (#10B981), Purple (#8B5CF6), Amber (#F59E0B)
• Consistent typography: Headlines (Helvetica Bold), Body (Helvetica Regular)
• White space: Generous margins and spacing for premium feel
• High-quality imagery: Professional photos, custom illustrations, clean icons

SLIDE LAYOUT PRINCIPLES:
• Maximum 6 bullet points per slide
• Large, readable fonts (minimum 24pt for body text)
• Consistent alignment and spacing
• Visual hierarchy with color and size
• Progressive disclosure of complex information

DATA VISUALIZATION:
• Clean, modern charts with Flow brand colors
• Clear labels and legends
• Consistent chart types and styling
• Interactive elements where appropriate
• Source citations for all data

STORYTELLING FLOW:
• Problem/Opportunity → Solution → Evidence → Action
• Build excitement and urgency throughout
• Address objections proactively
• End with clear call to action
• Maintain audience engagement with visuals and interaction

SPEAKER SUPPORT:
• Detailed speaker notes for each slide
• Transition phrases between sections
• Anticipated Q&A preparation
• Backup slides for deep-dive questions
• Handout materials for follow-up

================================================================================
ADDITIONAL RESOURCES:
================================================================================

EXECUTIVE SUMMARY (1-page):
• Key findings and recommendations
• Investment requirements and ROI
• Next steps and timeline
• Contact information

DETAILED FINANCIAL MODEL:
• 5-year P&L projections
• Cash flow analysis
• Sensitivity analysis
• Funding requirements
• Exit scenarios

MARKET RESEARCH REPORT:
• Comprehensive country analysis
• Consumer research findings
• Competitive intelligence
• Regulatory assessment
• Partnership opportunities

IMPLEMENTATION PLAYBOOK:
• Step-by-step execution guide
• Templates and checklists
• Best practices and lessons learned
• Risk mitigation strategies
• Success metrics and KPIs

This comprehensive pitch deck outline provides a professional framework for presenting Southeast Asian market opportunities with compelling visuals, data-driven insights, and actionable recommendations. Each slide is designed to build a compelling narrative that leads to investment and partnership decisions.

For best results:
1. Customize content based on your specific industry and business model
2. Update data with the most recent available statistics
3. Include company-specific case studies and examples
4. Adapt visual design to match your brand guidelines
5. Practice the presentation with local market experts for cultural sensitivity
6. Prepare for Q&A with additional supporting materials
7. Follow up with detailed implementation plans and next steps

Total estimated presentation time: 45-60 minutes including Q&A
Recommended audience: C-level executives, investors, board members, strategic partners
`;
  }
}