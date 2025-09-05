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
    const flowRed = [239, 68, 68];
    const flowCyan = [6, 182, 212];

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

    // Helper function to add gradient background
    const addGradientBackground = (color1: number[], color2: number[]) => {
      pdf.setFillColor(...color1);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Simulate gradient with multiple rectangles
      for (let i = 0; i < 20; i++) {
        const ratio = i / 20;
        const r = Math.round(color1[0] * (1 - ratio) + color2[0] * ratio);
        const g = Math.round(color1[1] * (1 - ratio) + color2[1] * ratio);
        const b = Math.round(color1[2] * (1 - ratio) + color2[2] * ratio);
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i * (pageHeight / 20), pageWidth, pageHeight / 20, 'F');
      }
    };

    // Helper function to add dashboard cards
    const addDashboardCard = (x: number, y: number, width: number, height: number, title: string, value: string, subtitle: string, color: number[], icon?: string) => {
      // Card background
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(x, y, width, height, 3, 3, 'F');
      
      // Card border
      pdf.setDrawColor(...color);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(x, y, width, height, 3, 3, 'S');
      
      // Icon background
      pdf.setFillColor(color[0], color[1], color[2], 0.2);
      pdf.roundedRect(x + 3, y + 3, 12, 8, 2, 2, 'F');
      
      // Title
      pdf.setTextColor(...color);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, x + 3, y + 15);
      
      // Value
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, x + 3, y + 22);
      
      // Subtitle
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(subtitle, x + 3, y + 27);
    };

    // Helper function to add chart placeholder
    const addChartPlaceholder = (x: number, y: number, width: number, height: number, title: string, chartType: string) => {
      // Chart background
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(x, y, width, height, 3, 3, 'F');
      
      // Chart border
      pdf.setDrawColor(71, 85, 105);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(x, y, width, height, 3, 3, 'S');
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, x + 3, y + 8);
      
      // Chart visualization
      if (chartType === 'bar') {
        // Draw bar chart
        const barWidth = 8;
        const barSpacing = 12;
        const startX = x + 10;
        const startY = y + height - 10;
        
        for (let i = 0; i < 5; i++) {
          const barHeight = Math.random() * 30 + 10;
          const color = [flowBlue, flowEmerald, flowPurple, flowOrange, flowRed][i];
          pdf.setFillColor(...color);
          pdf.rect(startX + i * barSpacing, startY - barHeight, barWidth, barHeight, 'F');
        }
      } else if (chartType === 'line') {
        // Draw line chart
        pdf.setDrawColor(...flowBlue);
        pdf.setLineWidth(2);
        let prevX = x + 10;
        let prevY = y + height - 20;
        
        for (let i = 1; i < 8; i++) {
          const newX = x + 10 + i * 15;
          const newY = y + height - 20 - Math.random() * 20;
          pdf.line(prevX, prevY, newX, newY);
          pdf.circle(newX, newY, 1, 'F');
          prevX = newX;
          prevY = newY;
        }
      } else if (chartType === 'pie') {
        // Draw pie chart
        const centerX = x + width/2;
        const centerY = y + height/2 + 5;
        const radius = 15;
        
        pdf.setFillColor(...flowBlue);
        pdf.circle(centerX, centerY, radius, 'F');
        
        pdf.setFillColor(...flowEmerald);
        pdf.arc(centerX, centerY, radius, 0, Math.PI, 'F');
        
        pdf.setFillColor(...flowPurple);
        pdf.arc(centerX, centerY, radius, 0, Math.PI/2, 'F');
      }
    };

    // PAGE 1: TITLE PAGE
    addGradientBackground([15, 23, 42], [30, 41, 59]);
    
    // Flow logo
    addFlowLogo(pageWidth/2 - 25, 40, 50);
    
    // Flow branding
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(48);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow', pageWidth / 2, 110, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Your guide to Penetrating Markets', pageWidth / 2, 125, { align: 'center' });
    
    // Report title
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian Market', pageWidth / 2, 150, { align: 'center' });
    pdf.text('Intelligence Report', pageWidth / 2, 165, { align: 'center' });
    
    // User selections highlight
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(20, 180, pageWidth - 40, 35, 5, 5, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('COMPREHENSIVE MARKET ANALYSIS', pageWidth / 2, 192, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(`${data.activeTab.toUpperCase()} Focus • ${data.selectedCountries.length} Markets Selected`, pageWidth / 2, 202, { align: 'center' });
    if (data.activeInsightTab) {
      pdf.text(`${data.activeInsightTab.charAt(0).toUpperCase() + data.activeInsightTab.slice(1)} Intelligence`, pageWidth / 2, 210, { align: 'center' });
    }
    
    // Selected markets
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(20, 225, pageWidth - 40, 25, 5, 5, 'F');
    pdf.setFontSize(12);
    pdf.text(`Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')}`, pageWidth / 2, 240, { align: 'center' });
    
    // Date and metadata
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(20, 260, pageWidth - 40, 20, 5, 5, 'F');
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, 272, { align: 'center' });

    // PAGE 2: EXECUTIVE DASHBOARD
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Dashboard', 40, yPosition + 5);
    
    yPosition += 25;
    
    // Key metrics dashboard
    const metrics = [
      { title: 'Total Market Size', value: '$1.2T', subtitle: 'Combined addressable market', color: flowBlue },
      { title: 'Digital Growth', value: '18.6%', subtitle: 'Annual digital economy growth', color: flowEmerald },
      { title: 'Internet Users', value: '456M', subtitle: 'Active users across region', color: flowPurple },
      { title: 'Cross-Border Trade', value: '$89.2B', subtitle: 'E-commerce transaction value', color: flowOrange }
    ];
    
    // Top row metrics
    for (let i = 0; i < 2; i++) {
      addDashboardCard(20 + i * 85, yPosition, 80, 35, metrics[i].title, metrics[i].value, metrics[i].subtitle, metrics[i].color);
    }
    
    yPosition += 40;
    
    // Bottom row metrics
    for (let i = 2; i < 4; i++) {
      addDashboardCard(20 + (i-2) * 85, yPosition, 80, 35, metrics[i].title, metrics[i].value, metrics[i].subtitle, metrics[i].color);
    }
    
    yPosition += 45;
    
    // Market overview chart
    addChartPlaceholder(20, yPosition, pageWidth - 40, 60, 'Market Size by Country (USD Billions)', 'bar');
    
    yPosition += 70;
    
    // Growth trends
    addChartPlaceholder(20, yPosition, (pageWidth - 50) / 2, 50, 'GDP Growth Trends', 'line');
    addChartPlaceholder(30 + (pageWidth - 50) / 2, yPosition, (pageWidth - 50) / 2, 50, 'Digital Adoption', 'pie');
    
    yPosition += 60;
    
    // Executive summary text
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 40, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Strategic Insights', 25, yPosition + 8);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const insights = [
      '• Southeast Asia represents $1.2T+ addressable market with 18.6% digital growth',
      '• Mobile-first consumers drive 78.4% of e-commerce transactions',
      '• Cross-border trade growing 31.4% annually, creating expansion opportunities',
      '• Regulatory environments improving with Singapore leading (95/100 score)',
      '• Fintech and e-commerce sectors show highest growth potential (18.4% and 22.8%)'
    ];
    
    insights.forEach((insight, index) => {
      pdf.text(insight, 25, yPosition + 15 + index * 5);
    });

    // PAGE 3: MARKET ANALYSIS DEEP DIVE
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Analysis Deep Dive', 40, yPosition + 5);
    
    yPosition += 25;
    
    // Country comparison table
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 80, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Comparison Matrix', 25, yPosition + 10);
    
    // Table headers
    const headers = ['Country', 'Population', 'GDP (USD)', 'Growth', 'Market Size', 'Opportunity'];
    const colWidths = [30, 25, 25, 20, 25, 25];
    let xPos = 25;
    
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    headers.forEach((header, index) => {
      pdf.text(header, xPos, yPosition + 20);
      xPos += colWidths[index];
    });
    
    // Table data
    const tableData = data.selectedCountries.map(country => {
      const countryData = this.getMarketDataForCountry(country);
      return {
        name: country.charAt(0).toUpperCase() + country.slice(1),
        population: countryData.population,
        gdp: countryData.gdp,
        growth: countryData.growth,
        marketSize: countryData.marketSize,
        opportunity: `${countryData.opportunityScore}/100`
      };
    });
    
    tableData.forEach((row, rowIndex) => {
      xPos = 25;
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      
      Object.values(row).forEach((value, colIndex) => {
        if (colIndex === 3) pdf.setTextColor(...flowEmerald); // Growth in green
        else if (colIndex === 5) pdf.setTextColor(...flowBlue); // Opportunity in blue
        else pdf.setTextColor(255, 255, 255);
        
        pdf.text(String(value), xPos, yPosition + 30 + rowIndex * 8);
        xPos += colWidths[colIndex];
      });
    });
    
    yPosition += 90;
    
    // Industry analysis
    addChartPlaceholder(20, yPosition, (pageWidth - 50) / 2, 60, 'Industry Market Share', 'pie');
    addChartPlaceholder(30 + (pageWidth - 50) / 2, yPosition, (pageWidth - 50) / 2, 60, 'Growth by Sector', 'bar');
    
    yPosition += 70;
    
    // Digital transformation metrics
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Digital Transformation Scorecard', 25, yPosition + 10);
    
    const digitalMetrics = [
      { metric: 'Internet Penetration', value: '77.2%', change: '+8.4%' },
      { metric: 'Mobile Commerce', value: '78.4%', change: '+24.3%' },
      { metric: 'Digital Payments', value: '72.1%', change: '+28.5%' },
      { metric: 'Cloud Adoption', value: '54.7%', change: '+19.2%' }
    ];
    
    digitalMetrics.forEach((metric, index) => {
      const yPos = yPosition + 20 + index * 8;
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(metric.metric, 25, yPos);
      pdf.setTextColor(255, 255, 255);
      pdf.text(metric.value, 80, yPos);
      pdf.setTextColor(...flowEmerald);
      pdf.text(metric.change, 120, yPos);
    });

    // PAGE 4: COMPETITIVE INTELLIGENCE
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Competitive Intelligence', 40, yPosition + 5);
    
    yPosition += 25;
    
    // Competitive landscape overview
    const competitorData = [
      { sector: 'E-commerce', leaders: 'Shopee, Lazada, Tokopedia', share: '68.4%', competition: 'High' },
      { sector: 'Fintech', leaders: 'Grab Financial, GoPay, TrueMoney', share: '45.7%', competition: 'Medium' },
      { sector: 'Food Delivery', leaders: 'Grab Food, foodpanda, Gojek', share: '72.3%', competition: 'High' },
      { sector: 'Ride-hailing', leaders: 'Grab, Gojek, InDriver', share: '81.2%', competition: 'Very High' }
    ];
    
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 70, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Market Leadership Analysis', 25, yPosition + 10);
    
    competitorData.forEach((comp, index) => {
      const yPos = yPosition + 20 + index * 12;
      
      // Sector name
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...flowBlue);
      pdf.text(comp.sector, 25, yPos);
      
      // Market share
      pdf.setTextColor(...flowEmerald);
      pdf.text(`${comp.share} market share`, 25, yPos + 4);
      
      // Leaders
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(`Leaders: ${comp.leaders}`, 25, yPos + 8);
      
      // Competition level
      const compColor = comp.competition === 'High' || comp.competition === 'Very High' ? flowRed : 
                       comp.competition === 'Medium' ? flowOrange : flowEmerald;
      pdf.setTextColor(...compColor);
      pdf.text(`Competition: ${comp.competition}`, 120, yPos + 4);
    });
    
    yPosition += 80;
    
    // Market entry barriers
    addChartPlaceholder(20, yPosition, (pageWidth - 50) / 2, 50, 'Entry Barriers by Sector', 'bar');
    addChartPlaceholder(30 + (pageWidth - 50) / 2, yPosition, (pageWidth - 50) / 2, 50, 'Market Concentration', 'pie');
    
    yPosition += 60;
    
    // Strategic recommendations
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 60, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Market Entry Recommendations', 25, yPosition + 10);
    
    const recommendations = [
      '🎯 Focus on niche specialization in highly competitive sectors (e-commerce, food delivery)',
      '💡 Leverage B2B opportunities where competition is lower but growth potential high',
      '🤝 Consider strategic partnerships with established local players for market access',
      '🚀 Target emerging sectors (fintech, healthtech) with medium competition levels',
      '📱 Prioritize mobile-first solutions as 78.4% of users prefer mobile platforms',
      '🌏 Develop region-specific strategies rather than one-size-fits-all approaches'
    ];
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    recommendations.forEach((rec, index) => {
      pdf.text(rec, 25, yPosition + 20 + index * 6);
    });

    // PAGE 5: CONSUMER BEHAVIOR & TRENDS
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowOrange);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Consumer Behavior & Market Trends', 40, yPosition + 5);
    
    yPosition += 25;
    
    // Consumer behavior metrics
    const consumerMetrics = [
      { behavior: 'Mobile Shopping', penetration: '78.4%', growth: '+24.3%', color: flowBlue },
      { behavior: 'Social Commerce', penetration: '65.7%', growth: '+31.8%', color: flowEmerald },
      { behavior: 'Digital Payments', penetration: '72.1%', growth: '+28.5%', color: flowPurple },
      { behavior: 'Sustainability Focus', penetration: '54.2%', growth: '+19.7%', color: flowOrange }
    ];
    
    consumerMetrics.forEach((metric, index) => {
      const xPos = 20 + (index % 2) * 90;
      const yPos = yPosition + Math.floor(index / 2) * 40;
      
      addDashboardCard(xPos, yPos, 85, 35, metric.behavior, metric.penetration, `Growth: ${metric.growth}`, metric.color);
    });
    
    yPosition += 90;
    
    // Trend analysis charts
    addChartPlaceholder(20, yPosition, pageWidth - 40, 50, 'Consumer Behavior Evolution (2019-2024)', 'line');
    
    yPosition += 60;
    
    // Market insights
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 70, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Consumer Insights & Opportunities', 25, yPosition + 10);
    
    const insights2 = [
      {
        title: 'Mobile-First Generation',
        insight: '78.4% prefer mobile apps over desktop for shopping and services',
        opportunity: 'Optimize mobile UX and implement progressive web apps'
      },
      {
        title: 'Social Commerce Boom',
        insight: 'Social media influences 65.7% of purchase decisions',
        opportunity: 'Invest in influencer partnerships and social selling platforms'
      },
      {
        title: 'Digital Payment Revolution',
        insight: 'Cash-to-digital transition accelerating at 28.5% annually',
        opportunity: 'Partner with local payment providers and offer multiple options'
      },
      {
        title: 'Sustainability Consciousness',
        insight: '54.2% of consumers prioritize eco-friendly products',
        opportunity: 'Develop green product lines and transparent supply chains'
      }
    ];
    
    insights2.forEach((insight, index) => {
      const yPos = yPosition + 20 + index * 12;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...flowBlue);
      pdf.text(insight.title, 25, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(`Insight: ${insight.insight}`, 25, yPos + 4);
      
      pdf.setTextColor(...flowEmerald);
      pdf.text(`Opportunity: ${insight.opportunity}`, 25, yPos + 8);
    });

    // PAGE 6: REGULATORY & RISK ASSESSMENT
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowRed);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Regulatory Environment & Risk Assessment', 40, yPosition + 5);
    
    yPosition += 25;
    
    // Regulatory scorecard
    const regulatoryData = data.selectedCountries.map(country => {
      const scores = this.getRegulatoryScores(country);
      return {
        country: country.charAt(0).toUpperCase() + country.slice(1),
        business: scores.business,
        clarity: scores.clarity,
        digital: scores.digital,
        overall: Math.round((scores.business + scores.clarity + scores.digital) / 3)
      };
    });
    
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 60, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Regulatory Environment Scorecard', 25, yPosition + 10);
    
    // Headers
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Country', 25, yPosition + 20);
    pdf.text('Business Ease', 60, yPosition + 20);
    pdf.text('Regulatory Clarity', 100, yPosition + 20);
    pdf.text('Digital Readiness', 140, yPosition + 20);
    pdf.text('Overall Score', 170, yPosition + 20);
    
    regulatoryData.forEach((country, index) => {
      const yPos = yPosition + 30 + index * 8;
      
      pdf.setTextColor(255, 255, 255);
      pdf.text(country.country, 25, yPos);
      
      // Color code scores
      const getScoreColor = (score: number) => {
        if (score >= 80) return flowEmerald;
        if (score >= 60) return flowOrange;
        return flowRed;
      };
      
      pdf.setTextColor(...getScoreColor(country.business));
      pdf.text(`${country.business}/100`, 60, yPos);
      
      pdf.setTextColor(...getScoreColor(country.clarity));
      pdf.text(`${country.clarity}/100`, 100, yPos);
      
      pdf.setTextColor(...getScoreColor(country.digital));
      pdf.text(`${country.digital}/100`, 140, yPos);
      
      pdf.setTextColor(...getScoreColor(country.overall));
      pdf.text(`${country.overall}/100`, 170, yPos);
    });
    
    yPosition += 70;
    
    // Risk assessment matrix
    addChartPlaceholder(20, yPosition, (pageWidth - 50) / 2, 50, 'Risk vs Opportunity Matrix', 'bar');
    addChartPlaceholder(30 + (pageWidth - 50) / 2, yPosition, (pageWidth - 50) / 2, 50, 'Regulatory Compliance Costs', 'pie');
    
    yPosition += 60;
    
    // Risk mitigation strategies
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Mitigation Strategies', 25, yPosition + 10);
    
    const riskStrategies = [
      '⚖️ Establish local legal entities and compliance frameworks early',
      '🤝 Partner with local firms for regulatory navigation and market access',
      '📋 Implement robust data protection and privacy compliance systems',
      '💰 Budget 15-25% of operational costs for regulatory compliance',
      '🔄 Maintain flexibility to adapt to changing regulatory landscapes',
      '📊 Regular compliance audits and stakeholder engagement programs'
    ];
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    riskStrategies.forEach((strategy, index) => {
      pdf.text(strategy, 25, yPosition + 20 + index * 5);
    });

    // PAGE 7: INVESTMENT & ROI PROJECTIONS
    pdf.addPage();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowCyan);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Investment Analysis & ROI Projections', 40, yPosition + 5);
    
    yPosition += 25;
    
    // Investment requirements by market
    const investmentData = data.selectedCountries.map(country => {
      const investment = this.getInvestmentData(country);
      return {
        country: country.charAt(0).toUpperCase() + country.slice(1),
        initial: investment.initial,
        operational: investment.operational,
        roi: investment.roi,
        payback: investment.payback
      };
    });
    
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 70, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Investment Requirements & Returns', 25, yPosition + 10);
    
    // Investment table headers
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Market', 25, yPosition + 20);
    pdf.text('Initial Investment', 60, yPosition + 20);
    pdf.text('Annual OpEx', 110, yPosition + 20);
    pdf.text('Projected ROI', 140, yPosition + 20);
    pdf.text('Payback Period', 170, yPosition + 20);
    
    investmentData.forEach((investment, index) => {
      const yPos = yPosition + 30 + index * 8;
      
      pdf.setTextColor(255, 255, 255);
      pdf.text(investment.country, 25, yPos);
      pdf.text(investment.initial, 60, yPos);
      pdf.text(investment.operational, 110, yPos);
      
      pdf.setTextColor(...flowEmerald);
      pdf.text(investment.roi, 140, yPos);
      pdf.text(investment.payback, 170, yPos);
    });
    
    yPosition += 80;
    
    // ROI projections chart
    addChartPlaceholder(20, yPosition, pageWidth - 40, 50, '5-Year ROI Projections by Market', 'line');
    
    yPosition += 60;
    
    // Investment recommendations
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 60, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Investment Recommendations', 25, yPosition + 10);
    
    const investmentRecs = [
      {
        phase: 'Phase 1 (0-6 months)',
        investment: '$500K-2M',
        focus: 'Market research, legal setup, initial partnerships'
      },
      {
        phase: 'Phase 2 (6-18 months)',
        investment: '$2M-8M',
        focus: 'Product localization, team building, pilot launches'
      },
      {
        phase: 'Phase 3 (18+ months)',
        investment: '$8M-25M',
        focus: 'Scale operations, multi-market expansion, acquisitions'
      }
    ];
    
    investmentRecs.forEach((rec, index) => {
      const yPos = yPosition + 20 + index * 12;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...flowBlue);
      pdf.text(rec.phase, 25, yPos);
      
      pdf.setTextColor(...flowEmerald);
      pdf.text(rec.investment, 25, yPos + 4);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(rec.focus, 25, yPos + 8);
    });

    // FINAL PAGE: ACTION PLAN & NEXT STEPS
    pdf.addPage();
    addGradientBackground([15, 23, 42], [30, 41, 59]);
    
    yPosition = 20;
    addFlowLogo(15, yPosition - 5, 15);
    
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(35, yPosition - 5, pageWidth - 50, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Action Plan & Next Steps', 40, yPosition + 5);
    
    yPosition += 30;
    
    // Immediate actions (30 days)
    pdf.setFillColor(...flowRed);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🚀 IMMEDIATE ACTIONS (30 Days)', 25, yPosition + 10);
    
    const immediateActions = [
      '• Conduct detailed market research in top 2 priority markets',
      '• Establish legal entities and regulatory compliance framework',
      '• Identify and engage with potential local partners',
      '• Develop localized go-to-market strategy and pricing models'
    ];
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    immediateActions.forEach((action, index) => {
      pdf.text(action, 25, yPosition + 20 + index * 6);
    });
    
    yPosition += 60;
    
    // Short-term goals (90 days)
    pdf.setFillColor(...flowOrange);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⚡ SHORT-TERM GOALS (90 Days)', 25, yPosition + 10);
    
    const shortTermGoals = [
      '• Launch pilot programs in tier-1 cities of selected markets',
      '• Establish customer service and support infrastructure',
      '• Implement localized digital marketing campaigns',
      '• Build strategic partnerships with key industry players'
    ];
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    shortTermGoals.forEach((goal, index) => {
      pdf.text(goal, 25, yPosition + 20 + index * 6);
    });
    
    yPosition += 60;
    
    // Long-term vision (12+ months)
    pdf.setFillColor(...flowPurple);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎯 LONG-TERM VISION (12+ Months)', 25, yPosition + 10);
    
    const longTermVision = [
      '• Scale operations across all selected Southeast Asian markets',
      '• Establish regional headquarters and R&D capabilities',
      '• Pursue strategic acquisitions and ecosystem partnerships',
      '• Achieve market leadership position in target segments'
    ];
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    longTermVision.forEach((vision, index) => {
      pdf.text(vision, 25, yPosition + 20 + index * 6);
    });
    
    yPosition += 60;
    
    // Success metrics
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 40, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📊 KEY SUCCESS METRICS TO TRACK', 25, yPosition + 10);
    
    const successMetrics = [
      'Market Share: Target 5-15% in each selected market within 24 months',
      'Revenue Growth: Achieve $10M+ ARR within 18 months of launch',
      'Customer Acquisition: 100K+ active users per market by month 12',
      'ROI Achievement: Positive unit economics by month 18'
    ];
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    successMetrics.forEach((metric, index) => {
      pdf.text(`• ${metric}`, 25, yPosition + 20 + index * 5);
    });

    // Footer with contact info
    pdf.setFillColor(...flowBlue);
    pdf.roundedRect(20, pageHeight - 30, pageWidth - 40, 20, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow - Your guide to Penetrating Markets', pageWidth / 2, pageHeight - 22, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Professional market intelligence for Southeast Asian expansion', pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Save the PDF
    pdf.save(`Flow-Comprehensive-Market-Report-${data.activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcelReport(data: ExportData): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Enhanced User Selection Summary
    const userSummary = [{
      'Report Generated': new Date().toLocaleDateString(),
      'Analysis Focus': data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1),
      'Selected Markets': data.selectedCountries.join(', '),
      'Selected Cities': data.selectedCities.join(', '),
      'Market Intelligence Focus': data.activeInsightTab || 'N/A',
      'Industry Focus': data.selectedIndustry || 'All Industries',
      'Case Study Reference': data.selectedCaseStudy || 'N/A',
      'Total Addressable Market': '$1.2T',
      'Digital Growth Rate': '18.6%',
      'Internet Users': '456M',
      'Cross-Border Trade': '$89.2B'
    }];
    
    const summarySheet = XLSX.utils.json_to_sheet(userSummary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

    // Comprehensive Market Data
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
        'Risk Level': countryData.riskLevel,
        'Business Environment': this.getRegulatoryScores(country).business,
        'Regulatory Clarity': this.getRegulatoryScores(country).clarity,
        'Digital Readiness': this.getRegulatoryScores(country).digital
      };
    });

    const marketSheet = XLSX.utils.json_to_sheet(marketData);
    XLSX.utils.book_append_sheet(workbook, marketSheet, 'Market Overview');

    // Consumer Behavior Data
    const consumerData = [
      { Behavior: 'Mobile Shopping', Penetration: '78.4%', Growth: '24.3%', Opportunity: 'Optimize mobile UX and checkout' },
      { Behavior: 'Social Commerce', Penetration: '65.7%', Growth: '31.8%', Opportunity: 'Invest in influencer partnerships' },
      { Behavior: 'Digital Payments', Penetration: '72.1%', Growth: '28.5%', Opportunity: 'Partner with local payment providers' },
      { Behavior: 'Sustainability Focus', Penetration: '54.2%', Growth: '19.7%', Opportunity: 'Develop eco-friendly product lines' },
      { Behavior: 'Cross-border Shopping', Penetration: '43.8%', Growth: '35.2%', Opportunity: 'Enable international shipping' },
      { Behavior: 'Voice Commerce', Penetration: '28.3%', Growth: '42.1%', Opportunity: 'Implement voice search capabilities' }
    ];
    
    const consumerSheet = XLSX.utils.json_to_sheet(consumerData);
    XLSX.utils.book_append_sheet(workbook, consumerSheet, 'Consumer Behavior');

    // Competitive Analysis
    const competitiveData = [
      { Sector: 'E-commerce', Leaders: 'Shopee, Lazada, Tokopedia', 'Market Share': '68.4%', Competition: 'High', 'Entry Barrier': 'Medium', Opportunity: 'Niche specialization' },
      { Sector: 'Fintech', Leaders: 'Grab Financial, GoPay, TrueMoney', 'Market Share': '45.7%', Competition: 'Medium', 'Entry Barrier': 'High', Opportunity: 'SME lending, cross-border payments' },
      { Sector: 'Food Delivery', Leaders: 'Grab Food, foodpanda, Gojek', 'Market Share': '72.3%', Competition: 'High', 'Entry Barrier': 'High', Opportunity: 'Cloud kitchens, B2B catering' },
      { Sector: 'Ride-hailing', Leaders: 'Grab, Gojek, InDriver', 'Market Share': '81.2%', Competition: 'Very High', 'Entry Barrier': 'Very High', Opportunity: 'Corporate transportation' },
      { Sector: 'Healthcare', Leaders: 'Halodoc, Doctor Anywhere, BookDoc', 'Market Share': '34.6%', Competition: 'Low', 'Entry Barrier': 'Medium', Opportunity: 'Telemedicine, digital therapeutics' },
      { Sector: 'Education', Leaders: 'Ruangguru, BYJU\'S, Vedantu', 'Market Share': '28.9%', Competition: 'Medium', 'Entry Barrier': 'Low', Opportunity: 'Corporate training, skill development' }
    ];
    
    const competitiveSheet = XLSX.utils.json_to_sheet(competitiveData);
    XLSX.utils.book_append_sheet(workbook, competitiveSheet, 'Competitive Analysis');

    // Investment Analysis
    const investmentData = data.selectedCountries.map(country => {
      const investment = this.getInvestmentData(country);
      return {
        Country: country.charAt(0).toUpperCase() + country.slice(1),
        'Initial Investment': investment.initial,
        'Annual OpEx': investment.operational,
        'Projected ROI': investment.roi,
        'Payback Period': investment.payback,
        'Market Entry Cost': investment.entryCost,
        'Regulatory Compliance': investment.compliance,
        'Marketing Budget': investment.marketing
      };
    });
    
    const investmentSheet = XLSX.utils.json_to_sheet(investmentData);
    XLSX.utils.book_append_sheet(workbook, investmentSheet, 'Investment Analysis');

    // Tab-specific enhanced data
    if (data.activeTab === 'cities' && data.selectedCities.length > 0) {
      const cityData = this.getEnhancedCityData(data.selectedCities);
      const citySheet = XLSX.utils.json_to_sheet(cityData);
      XLSX.utils.book_append_sheet(workbook, citySheet, 'City Analysis');
    }

    if (data.activeTab === 'industries') {
      const industryData = this.getEnhancedIndustryData(data.selectedIndustry);
      const industrySheet = XLSX.utils.json_to_sheet(industryData);
      XLSX.utils.book_append_sheet(workbook, industrySheet, 'Industry Deep Dive');
    }

    // Save Excel file
    XLSX.writeFile(workbook, `Flow-Comprehensive-Market-Data-${data.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async generatePowerPointOutline(data: ExportData): Promise<void> {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let slideNumber = 1;

    const flowBlue = [59, 130, 246];
    const flowEmerald = [16, 185, 129];
    const flowPurple = [139, 92, 246];
    const flowOrange = [245, 158, 11];

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
        
        addFlowLogo(pageWidth/2 - 25, 40, 50);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(42);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Flow', pageWidth / 2, 100, { align: 'center' });
        
        pdf.setFontSize(28);
        pdf.text(title, pageWidth / 2, 130, { align: 'center' });
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        pdf.setFillColor(...flowBlue);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        
        addFlowLogo(20, 20, 15);
        
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 45, 30);
      }
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(12);
      pdf.text(`${slideNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      slideNumber++;
    };

    // Title slide
    addSlideHeader(`${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Market Analysis`, true);
    
    pdf.setFillColor(...flowEmerald);
    pdf.roundedRect(50, 150, pageWidth - 100, 30, 5, 5, 'F');
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Markets: ${data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')}`, pageWidth / 2, 168, { align: 'center' });

    // Executive Summary slide
    pdf.addPage();
    addSlideHeader('Executive Summary');
    
    let yPos = 60;
    const executivePoints = [
      `📊 Total addressable market: $1.2T across ${data.selectedCountries.length} selected markets`,
      `🚀 Digital economy growing at 18.6% annually with 456M active users`,
      `📱 Mobile-first consumers drive 78.4% of e-commerce transactions`,
      `💰 Cross-border trade opportunities worth $89.2B and growing 31.4%`,
      `🎯 ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} analysis reveals significant market potential`
    ];
    
    executivePoints.forEach((point, index) => {
      pdf.setFillColor([flowBlue, flowEmerald, flowPurple, flowOrange, flowBlue][index]);
      pdf.roundedRect(30, yPos, pageWidth - 60, 20, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(point, 35, yPos + 12);
      
      yPos += 25;
    });

    // Market Overview slide
    pdf.addPage();
    addSlideHeader('Market Overview Dashboard');
    
    yPos = 60;
    data.selectedCountries.forEach((country, index) => {
      const marketData = this.getMarketDataForCountry(country);
      const colors = [flowBlue, flowEmerald, flowPurple, flowOrange];
      const currentColor = colors[index % colors.length];
      
      pdf.setFillColor(...currentColor);
      pdf.roundedRect(30, yPos, pageWidth - 60, 30, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.charAt(0).toUpperCase() + country.slice(1), 35, yPos + 12);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${marketData.marketSize} market • ${marketData.growth} growth • ${marketData.population} population • Opportunity: ${marketData.opportunityScore}/100`, 35, yPos + 22);
      
      yPos += 35;
    });

    // Consumer Insights slide
    pdf.addPage();
    addSlideHeader('Consumer Behavior Insights');
    
    yPos = 60;
    const consumerInsights = [
      { title: 'Mobile-First Shopping', stat: '78.4% penetration', growth: '+24.3% growth' },
      { title: 'Social Commerce Influence', stat: '65.7% of purchases', growth: '+31.8% growth' },
      { title: 'Digital Payment Adoption', stat: '72.1% penetration', growth: '+28.5% growth' },
      { title: 'Sustainability Focus', stat: '54.2% prioritize eco-friendly', growth: '+19.7% growth' }
    ];
    
    consumerInsights.forEach((insight, index) => {
      const color = [flowBlue, flowEmerald, flowPurple, flowOrange][index];
      
      pdf.setFillColor(...color);
      pdf.roundedRect(30, yPos, pageWidth - 60, 25, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(insight.title, 35, yPos + 10);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${insight.stat} • ${insight.growth}`, 35, yPos + 18);
      
      yPos += 30;
    });

    // Strategic Recommendations slide
    pdf.addPage();
    addSlideHeader('Strategic Recommendations');
    
    yPos = 60;
    const recommendations = [
      '🎯 Prioritize mobile-first digital strategies across all markets',
      '🤝 Establish strategic local partnerships for market access',
      '📱 Focus on tier-1 cities for initial market entry',
      '💡 Adapt products to local preferences and price points',
      '🚀 Leverage social commerce and influencer marketing',
      '⚖️ Ensure regulatory compliance from day one'
    ];
    
    recommendations.forEach((rec, index) => {
      pdf.setFillColor(30, 64, 175);
      pdf.roundedRect(30, yPos, pageWidth - 60, 18, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(rec, 35, yPos + 11);
      
      yPos += 22;
    });

    // Next Steps slide
    pdf.addPage();
    addSlideHeader('Implementation Roadmap');
    
    yPos = 60;
    const phases = [
      { phase: 'Phase 1 (0-6 months)', color: flowBlue, actions: 'Market research • Legal setup • Partnership identification' },
      { phase: 'Phase 2 (6-18 months)', color: flowEmerald, actions: 'Pilot launches • Team building • Product localization' },
      { phase: 'Phase 3 (18+ months)', color: flowPurple, actions: 'Scale operations • Multi-market expansion • Strategic acquisitions' }
    ];
    
    phases.forEach((phase, index) => {
      pdf.setFillColor(...phase.color);
      pdf.roundedRect(30, yPos, pageWidth - 60, 30, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(phase.phase, 35, yPos + 12);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(phase.actions, 35, yPos + 22);
      
      yPos += 35;
    });

    pdf.save(`Flow-Executive-Presentation-${data.activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
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

  private getRegulatoryScores(country: string) {
    const scores = {
      singapore: { business: 95, clarity: 92, digital: 89 },
      thailand: { business: 78, clarity: 72, digital: 68 },
      malaysia: { business: 73, clarity: 75, digital: 71 },
      indonesia: { business: 68, clarity: 65, digital: 62 },
      philippines: { business: 65, clarity: 62, digital: 58 },
      vietnam: { business: 70, clarity: 68, digital: 65 }
    };

    return scores[country as keyof typeof scores] || { business: 70, clarity: 70, digital: 70 };
  }

  private getInvestmentData(country: string) {
    const investmentData = {
      singapore: { 
        initial: '$2.5M', 
        operational: '$800K', 
        roi: '285%', 
        payback: '18 months',
        entryCost: '$500K',
        compliance: '$200K',
        marketing: '$300K'
      },
      thailand: { 
        initial: '$1.8M', 
        operational: '$600K', 
        roi: '320%', 
        payback: '16 months',
        entryCost: '$350K',
        compliance: '$150K',
        marketing: '$250K'
      },
      malaysia: { 
        initial: '$1.5M', 
        operational: '$500K', 
        roi: '295%', 
        payback: '17 months',
        entryCost: '$300K',
        compliance: '$120K',
        marketing: '$200K'
      },
      indonesia: { 
        initial: '$3.2M', 
        operational: '$1.2M', 
        roi: '380%', 
        payback: '14 months',
        entryCost: '$800K',
        compliance: '$300K',
        marketing: '$500K'
      },
      philippines: { 
        initial: '$2.1M', 
        operational: '$700K', 
        roi: '350%', 
        payback: '15 months',
        entryCost: '$450K',
        compliance: '$180K',
        marketing: '$350K'
      },
      vietnam: { 
        initial: '$2.8M', 
        operational: '$900K', 
        roi: '420%', 
        payback: '13 months',
        entryCost: '$600K',
        compliance: '$250K',
        marketing: '$400K'
      }
    };

    return investmentData[country as keyof typeof investmentData] || {
      initial: '$2.0M',
      operational: '$700K',
      roi: '300%',
      payback: '16 months',
      entryCost: '$400K',
      compliance: '$150K',
      marketing: '$300K'
    };
  }

  private getEnhancedCityData(selectedCities: string[]) {
    const cityDatabase = {
      'bangkok': { 
        name: 'Bangkok', 
        population: '10.7M', 
        gdpPerCapita: '$7,800', 
        digitalInfra: 85, 
        businessEnv: 78,
        costOfLiving: 'Medium',
        officeRent: '$25/sqm',
        talent: 'High',
        logistics: 'Excellent'
      },
      'singapore-city': { 
        name: 'Singapore', 
        population: '5.9M', 
        gdpPerCapita: '$65,200', 
        digitalInfra: 95, 
        businessEnv: 95,
        costOfLiving: 'High',
        officeRent: '$85/sqm',
        talent: 'Excellent',
        logistics: 'World-class'
      },
      'kuala-lumpur': { 
        name: 'Kuala Lumpur', 
        population: '7.9M', 
        gdpPerCapita: '$11,200', 
        digitalInfra: 82, 
        businessEnv: 73,
        costOfLiving: 'Medium',
        officeRent: '$18/sqm',
        talent: 'Good',
        logistics: 'Good'
      },
      'jakarta': { 
        name: 'Jakarta', 
        population: '34.5M', 
        gdpPerCapita: '$4,200', 
        digitalInfra: 75, 
        businessEnv: 68,
        costOfLiving: 'Low',
        officeRent: '$15/sqm',
        talent: 'High',
        logistics: 'Developing'
      },
      'manila': { 
        name: 'Manila', 
        population: '25.0M', 
        gdpPerCapita: '$3,500', 
        digitalInfra: 72, 
        businessEnv: 65,
        costOfLiving: 'Low',
        officeRent: '$12/sqm',
        talent: 'High',
        logistics: 'Developing'
      },
      'ho-chi-minh': { 
        name: 'Ho Chi Minh City', 
        population: '13.3M', 
        gdpPerCapita: '$4,100', 
        digitalInfra: 78, 
        businessEnv: 70,
        costOfLiving: 'Low',
        officeRent: '$20/sqm',
        talent: 'Good',
        logistics: 'Good'
      }
    };

    return selectedCities.map(cityId => {
      const city = cityDatabase[cityId as keyof typeof cityDatabase];
      return {
        City: city?.name || cityId,
        Population: city?.population || 'N/A',
        'GDP per Capita': city?.gdpPerCapita || 'N/A',
        'Digital Infrastructure': city?.digitalInfra || 0,
        'Business Environment': city?.businessEnv || 0,
        'Cost of Living': city?.costOfLiving || 'N/A',
        'Office Rent': city?.officeRent || 'N/A',
        'Talent Pool': city?.talent || 'N/A',
        'Logistics': city?.logistics || 'N/A'
      };
    });
  }

  private getEnhancedIndustryData(selectedIndustry?: string) {
    const industryDatabase = {
      technology: { 
        name: 'Technology & Software', 
        marketSize: '$234.5B', 
        growth: '15.2%', 
        competition: 'High', 
        opportunity: 85,
        trends: 'AI/ML, Cloud, Mobile-first',
        barriers: 'Medium',
        investment: '$2.5M avg'
      },
      ecommerce: { 
        name: 'E-commerce & Retail', 
        marketSize: '$187.3B', 
        growth: '22.8%', 
        competition: 'Very High', 
        opportunity: 78,
        trends: 'Social commerce, Cross-border',
        barriers: 'High',
        investment: '$3.2M avg'
      },
      fintech: { 
        name: 'Financial Services', 
        marketSize: '$153.2B', 
        growth: '18.4%', 
        competition: 'Medium', 
        opportunity: 92,
        trends: 'Digital banking, Crypto',
        barriers: 'High',
        investment: '$4.1M avg'
      },
      automotive: { 
        name: 'Automotive', 
        marketSize: '$45.8B', 
        growth: '8.3%', 
        competition: 'Medium', 
        opportunity: 71,
        trends: 'Electric vehicles, Autonomous',
        barriers: 'Very High',
        investment: '$8.5M avg'
      },
      healthcare: { 
        name: 'Healthcare & Pharma', 
        marketSize: '$78.4B', 
        growth: '9.7%', 
        competition: 'Low', 
        opportunity: 88,
        trends: 'Telemedicine, Digital therapeutics',
        barriers: 'Medium',
        investment: '$3.8M avg'
      },
      manufacturing: { 
        name: 'Manufacturing', 
        marketSize: '$234.1B', 
        growth: '6.8%', 
        competition: 'Medium', 
        opportunity: 65,
        trends: 'Industry 4.0, Green manufacturing',
        barriers: 'High',
        investment: '$12.3M avg'
      }
    };

    if (selectedIndustry && industryDatabase[selectedIndustry as keyof typeof industryDatabase]) {
      const industry = industryDatabase[selectedIndustry as keyof typeof industryDatabase];
      return [{
        Industry: industry.name,
        'Market Size': industry.marketSize,
        'Growth Rate': industry.growth,
        'Competition Level': industry.competition,
        'Opportunity Score': industry.opportunity,
        'Key Trends': industry.trends,
        'Entry Barriers': industry.barriers,
        'Avg Investment': industry.investment
      }];
    }

    return Object.values(industryDatabase).map(industry => ({
      Industry: industry.name,
      'Market Size': industry.marketSize,
      'Growth Rate': industry.growth,
      'Competition Level': industry.competition,
      'Opportunity Score': industry.opportunity,
      'Key Trends': industry.trends,
      'Entry Barriers': industry.barriers,
      'Avg Investment': industry.investment
    }));
  }
}