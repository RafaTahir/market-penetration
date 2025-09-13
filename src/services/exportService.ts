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
        title: 'Southeast Asian Market Research Report',
        subject: 'Market Analysis',
        author: 'Flow - Market Intelligence Platform',
        creator: 'Flow Analytics'
      });

      // Page 1: Title Page
      this.createTitlePage(pdf, data);
      
      // Page 2: Executive Summary
      pdf.addPage();
      this.createExecutiveSummary(pdf, data);
      
      // Page 3: Market Analysis
      pdf.addPage();
      this.createMarketAnalysis(pdf, data);
      
      // Page 4: Country Insights
      pdf.addPage();
      this.createCountryInsights(pdf, data);
      
      // Page 5: Strategic Recommendations
      pdf.addPage();
      this.createStrategicRecommendations(pdf, data);

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
    // Set background color
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 297, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow', 105, 80, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Southeast Asian Market Research Report', 105, 100, { align: 'center' });
    
    // Selected markets
    if (data.selectedCountries.length > 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(148, 163, 184); // slate-400
      const countries = data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
      pdf.text(`Markets: ${countries}`, 105, 120, { align: 'center' });
    }
    
    // Date
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 250, { align: 'center' });
  }

  private createExecutiveSummary(pdf: any, data: ExportData): void {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 50;
    
    // Key metrics
    const metrics = [
      'Total Addressable Market: $1.2T',
      'Digital Economy Growth: 18.6% annually',
      'Internet Users: 456M across region',
      'Cross-Border Trade: $89.2B'
    ];
    
    metrics.forEach(metric => {
      pdf.text(`• ${metric}`, 25, yPos);
      yPos += 10;
    });
    
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Entry Recommendations:', 20, yPos);
    yPos += 15;
    
    pdf.setFont('helvetica', 'normal');
    const recommendations = [
      'Prioritize mobile-first digital strategies',
      'Establish local partnerships early',
      'Focus on tier-1 cities for initial market entry',
      'Adapt products for local consumer preferences'
    ];
    
    recommendations.forEach(rec => {
      pdf.text(`• ${rec}`, 25, yPos);
      yPos += 10;
    });
  }

  private createMarketAnalysis(pdf: any, data: ExportData): void {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Analysis', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 50;
    
    // Market size data
    const marketData = [
      { country: 'Indonesia', population: '273.5M', gdp: '$1.32T', growth: '+5.2%' },
      { country: 'Philippines', population: '109.6M', gdp: '$394B', growth: '+6.2%' },
      { country: 'Vietnam', population: '97.3M', gdp: '$409B', growth: '+6.8%' },
      { country: 'Thailand', population: '69.8M', gdp: '$543B', growth: '+2.8%' },
      { country: 'Malaysia', population: '32.7M', gdp: '$432B', growth: '+4.5%' },
      { country: 'Singapore', population: '5.9M', gdp: '$397B', growth: '+2.6%' }
    ];
    
    // Table header
    pdf.setFont('helvetica', 'bold');
    pdf.text('Country', 25, yPos);
    pdf.text('Population', 70, yPos);
    pdf.text('GDP', 120, yPos);
    pdf.text('Growth', 160, yPos);
    yPos += 15;
    
    pdf.setFont('helvetica', 'normal');
    marketData.forEach(country => {
      if (data.selectedCountries.length === 0 || data.selectedCountries.some(selected => 
        country.country.toLowerCase().includes(selected) || selected.includes(country.country.toLowerCase())
      )) {
        pdf.text(country.country, 25, yPos);
        pdf.text(country.population, 70, yPos);
        pdf.text(country.gdp, 120, yPos);
        pdf.text(country.growth, 160, yPos);
        yPos += 10;
      }
    });
  }

  private createCountryInsights(pdf: any, data: ExportData): void {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Country Insights', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 50;
    
    const insights = [
      {
        country: 'Indonesia',
        insight: 'Largest market with 273M population, strong mobile commerce adoption',
        opportunity: 'Digital banking and e-commerce logistics'
      },
      {
        country: 'Vietnam',
        insight: 'Fastest growing economy at 6.8%, young demographic profile',
        opportunity: 'Manufacturing hub and tech outsourcing'
      },
      {
        country: 'Singapore',
        insight: 'Regional financial hub with highest GDP per capita',
        opportunity: 'Fintech innovation and regional headquarters'
      }
    ];
    
    insights.forEach(item => {
      if (data.selectedCountries.length === 0 || data.selectedCountries.some(selected => 
        item.country.toLowerCase().includes(selected) || selected.includes(item.country.toLowerCase())
      )) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.country, 25, yPos);
        yPos += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Insight: ${item.insight}`, 25, yPos);
        yPos += 8;
        pdf.text(`Opportunity: ${item.opportunity}`, 25, yPos);
        yPos += 15;
      }
    });
  }

  private createStrategicRecommendations(pdf: any, data: ExportData): void {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Recommendations', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 50;
    
    const phases = [
      {
        phase: 'Phase 1: Foundation (0-6 months)',
        actions: [
          'Conduct comprehensive market research',
          'Identify and engage local partners',
          'Establish regulatory compliance framework',
          'Develop localized digital presence'
        ]
      },
      {
        phase: 'Phase 2: Launch (6-18 months)',
        actions: [
          'Launch pilot programs in tier-1 cities',
          'Build customer service infrastructure',
          'Implement localized marketing campaigns',
          'Establish supply chain partnerships'
        ]
      },
      {
        phase: 'Phase 3: Scale (18+ months)',
        actions: [
          'Expand to secondary markets',
          'Optimize operations based on learnings',
          'Consider strategic acquisitions',
          'Build regional innovation capabilities'
        ]
      }
    ];
    
    phases.forEach(phase => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(phase.phase, 25, yPos);
      yPos += 12;
      
      pdf.setFont('helvetica', 'normal');
      phase.actions.forEach(action => {
        pdf.text(`• ${action}`, 30, yPos);
        yPos += 8;
      });
      yPos += 5;
    });
  }

  private getMarketOverviewData(data: ExportData) {
    return [
      { Country: 'Indonesia', Population: '273.5M', GDP: '$1.32T', Growth: '5.2%', Market_Size: '$287B' },
      { Country: 'Philippines', Population: '109.6M', GDP: '$394B', Growth: '6.2%', Market_Size: '$156B' },
      { Country: 'Vietnam', Population: '97.3M', GDP: '$409B', Growth: '6.8%', Market_Size: '$142B' },
      { Country: 'Thailand', Population: '69.8M', GDP: '$543B', Growth: '2.8%', Market_Size: '$127B' },
      { Country: 'Malaysia', Population: '32.7M', GDP: '$432B', Growth: '4.5%', Market_Size: '$98B' },
      { Country: 'Singapore', Population: '5.9M', GDP: '$397B', Growth: '2.6%', Market_Size: '$89B' }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
  }

  private getCountryAnalysisData(data: ExportData) {
    return [
      { Country: 'Indonesia', Digital_Penetration: '73%', Urbanization: '56%', Median_Age: 30.2 },
      { Country: 'Philippines', Digital_Penetration: '68%', Urbanization: '47%', Median_Age: 25.7 },
      { Country: 'Vietnam', Digital_Penetration: '75%', Urbanization: '37%', Median_Age: 32.5 },
      { Country: 'Thailand', Digital_Penetration: '85%', Urbanization: '51%', Median_Age: 40.1 },
      { Country: 'Malaysia', Digital_Penetration: '78%', Urbanization: '77%', Median_Age: 30.3 },
      { Country: 'Singapore', Digital_Penetration: '92%', Urbanization: '100%', Median_Age: 42.2 }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
  }

  private getDigitalMetricsData(data: ExportData) {
    return [
      { Country: 'Singapore', Internet: '89%', Mobile: '92%', Ecommerce: '78%', Digital_Payments: '85%' },
      { Country: 'Thailand', Internet: '82%', Mobile: '85%', Ecommerce: '65%', Digital_Payments: '72%' },
      { Country: 'Malaysia', Internet: '84%', Mobile: '78%', Ecommerce: '58%', Digital_Payments: '68%' },
      { Country: 'Indonesia', Internet: '71%', Mobile: '73%', Ecommerce: '52%', Digital_Payments: '61%' },
      { Country: 'Philippines', Internet: '67%', Mobile: '68%', Ecommerce: '45%', Digital_Payments: '55%' },
      { Country: 'Vietnam', Internet: '77%', Mobile: '75%', Ecommerce: '49%', Digital_Payments: '58%' }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
  }

  private getEconomicData(data: ExportData) {
    return [
      { Country: 'Indonesia', GDP_Billions: 1319, Inflation: '3.2%', Unemployment: '5.8%', Interest_Rate: '6.0%' },
      { Country: 'Philippines', GDP_Billions: 394, Inflation: '4.1%', Unemployment: '4.5%', Interest_Rate: '6.5%' },
      { Country: 'Vietnam', GDP_Billions: 409, Inflation: '3.6%', Unemployment: '2.3%', Interest_Rate: '4.5%' },
      { Country: 'Thailand', GDP_Billions: 543, Inflation: '1.2%', Unemployment: '1.1%', Interest_Rate: '2.5%' },
      { Country: 'Malaysia', GDP_Billions: 432, Inflation: '2.8%', Unemployment: '3.3%', Interest_Rate: '3.0%' },
      { Country: 'Singapore', GDP_Billions: 397, Inflation: '2.1%', Unemployment: '2.0%', Interest_Rate: '3.5%' }
    ].filter(country => 
      data.selectedCountries.length === 0 || 
      data.selectedCountries.some(selected => 
        country.Country.toLowerCase().includes(selected) || 
        selected.includes(country.Country.toLowerCase())
      )
    );
  }

  private createPowerPointOutline(data: ExportData): string {
    return `
FLOW - SOUTHEAST ASIAN MARKET RESEARCH PRESENTATION OUTLINE
Generated: ${new Date().toLocaleDateString()}
Selected Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'All Markets'}

SLIDE 1: TITLE SLIDE
- Flow Logo and Branding
- "Southeast Asian Market Research Report"
- Selected Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'All Markets'}
- Date: ${new Date().toLocaleDateString()}

SLIDE 2: EXECUTIVE SUMMARY
- Total Addressable Market: $1.2T
- Digital Economy Growth: 18.6% annually
- Internet Users: 456M across region
- Cross-Border Trade: $89.2B
- Key Recommendation: Mobile-first strategy essential

SLIDE 3: MARKET OVERVIEW
- Population Distribution Chart
- GDP Comparison by Country
- Growth Rate Trends
- Market Size Analysis

SLIDE 4: DIGITAL TRANSFORMATION
- Internet Penetration Rates
- Mobile Commerce Adoption
- Digital Payment Usage
- E-commerce Growth Metrics

SLIDE 5: COMPETITIVE LANDSCAPE
- Market Leaders by Sector
- Competition Intensity Analysis
- Market Share Distribution
- Entry Barriers Assessment

SLIDE 6: CONSUMER INSIGHTS
- Mobile-First Shopping: 78% penetration
- Social Commerce: 66% influence on purchases
- Digital Payments: 72% adoption
- Sustainability Focus: Growing trend

SLIDE 7: REGULATORY ENVIRONMENT
- Ease of Business Rankings
- Key Regulations by Country
- Compliance Requirements
- Risk Assessment Matrix

SLIDE 8: STRATEGIC RECOMMENDATIONS
Phase 1 (0-6 months):
- Market research and partnerships
- Regulatory compliance setup
- Digital presence establishment

Phase 2 (6-18 months):
- Pilot program launch
- Customer service infrastructure
- Localized marketing campaigns

Phase 3 (18+ months):
- Multi-market expansion
- Operations optimization
- Strategic acquisitions

SLIDE 9: INVESTMENT ANALYSIS
- Market Entry Costs
- ROI Projections
- Risk Mitigation Strategies
- Success Metrics

SLIDE 10: NEXT STEPS
- Immediate Action Items
- Timeline and Milestones
- Resource Requirements
- Success Metrics and KPIs

APPENDIX SLIDES:
- Detailed Country Profiles
- Industry-Specific Analysis
- Case Study Examples
- Data Sources and Methodology

---
This outline provides a comprehensive framework for a professional PowerPoint presentation.
Each slide should include relevant charts, graphs, and visual elements to support the content.
Use Flow brand colors (blue, emerald, purple, orange) throughout the presentation.
`;
  }
}