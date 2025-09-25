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

    // Helper functions for consistent styling
    const addGradientBackground = (startColor: string, endColor: string) => {
      // Simulate gradient with overlapping rectangles
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFillColor(16, 185, 129); // Emerald
      pdf.rect(0, 0, pageWidth, pageHeight/2, 'F');
      pdf.setGlobalAlpha(0.1);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setGlobalAlpha(1);
    };

    const addHeader = (title: string, subtitle?: string) => {
      pdf.setFillColor(30, 41, 59); // slate-800
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, 25);
      
      if (subtitle) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(subtitle, 20, 35);
      }
      
      return 50;
    };

    const addSection = (title: string, content: string[], startY: number) => {
      let currentY = startY;
      
      // Section header with gradient background
      pdf.setFillColor(59, 130, 246, 0.1); // blue with opacity
      pdf.rect(15, currentY - 5, pageWidth - 30, 15, 'F');
      
      pdf.setTextColor(59, 130, 246); // blue-500
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, currentY + 5);
      currentY += 20;
      
      // Content
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      content.forEach(item => {
        const lines = pdf.splitTextToSize(item, pageWidth - 40);
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = 20;
          }
          pdf.text(line, 20, currentY);
          currentY += 6;
        });
        currentY += 3;
      });
      
      return currentY + 10;
    };

    const addMetricCard = (title: string, value: string, change: string, x: number, y: number, color: string) => {
      const cardWidth = 45;
      const cardHeight = 25;
      
      // Card background
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(x, y, cardWidth, cardHeight, 'F');
      
      // Border
      const colors = {
        blue: [59, 130, 246],
        emerald: [16, 185, 129],
        purple: [139, 92, 246],
        orange: [249, 115, 22]
      };
      const [r, g, b] = colors[color as keyof typeof colors] || colors.blue;
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, cardWidth, cardHeight);
      
      // Title
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(title, x + 2, y + 6);
      
      // Value
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, x + 2, y + 14);
      
      // Change
      pdf.setTextColor(r, g, b);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(change, x + 2, y + 21);
    };

    const addChart = (title: string, data: any[], x: number, y: number, width: number, height: number) => {
      // Chart background
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(x, y, width, height, 'F');
      
      // Chart border
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, width, height);
      
      // Chart title
      pdf.setTextColor(51, 65, 85); // slate-700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, x + 2, y + 8);
      
      // Simple bar chart simulation
      const barWidth = (width - 10) / data.length;
      const maxValue = Math.max(...data.map(d => d.value));
      
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 20);
        const barX = x + 5 + (index * barWidth);
        const barY = y + height - 5 - barHeight;
        
        // Bar
        pdf.setFillColor(59, 130, 246); // blue-500
        pdf.rect(barX, barY, barWidth - 2, barHeight, 'F');
        
        // Label
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.setFontSize(7);
        pdf.text(item.label, barX, y + height + 3);
      });
    };

    // Page 1: Title Page
    addGradientBackground('#3B82F6', '#10B981');
    
    // Flow logo simulation
    pdf.setFillColor(255, 255, 255, 0.1);
    pdf.circle(pageWidth/2, 60, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Flow', pageWidth/2 - 15, 65);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Your guide to Penetrating Markets', pageWidth/2 - 45, 75);
    
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Southeast Asian Market', pageWidth/2 - 55, 120);
    pdf.text('Intelligence Report', pageWidth/2 - 45, 135);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const selectedMarketsText = data.selectedCountries.length > 0 
      ? data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')
      : 'All Southeast Asian Markets';
    pdf.text(`Focus Markets: ${selectedMarketsText}`, pageWidth/2 - 40, 160);
    
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth/2 - 25, 170);
    
    // Page 2: Executive Summary
    pdf.addPage();
    yPosition = addHeader('Executive Summary', 'Key insights and strategic overview');
    
    // Key metrics cards
    addMetricCard('Total Market Size', '$1.2T', '+12.4%', 20, yPosition, 'blue');
    addMetricCard('Digital Growth', '18.6%', '+3.2%', 70, yPosition, 'emerald');
    addMetricCard('Internet Users', '456M', '+8.7%', 120, yPosition, 'purple');
    addMetricCard('Cross-Border Trade', '$89.2B', '+31.4%', 165, yPosition, 'orange');
    
    yPosition += 35;
    
    const executiveSummary = [
      '• Southeast Asia represents one of the world\'s most dynamic and rapidly growing markets, with a combined GDP of over $3.7 trillion and a population exceeding 680 million people.',
      '• The digital economy is experiencing unprecedented growth at 18.6% annually, driven by mobile-first adoption and increasing internet penetration across all demographics.',
      '• Key growth drivers include: rising middle class, urbanization trends, government digitization initiatives, and increasing foreign direct investment.',
      '• Market entry opportunities are strongest in fintech, e-commerce, healthcare technology, and sustainable solutions sectors.',
      '• Regulatory environments are becoming increasingly business-friendly, with Singapore and Thailand leading in ease of doing business rankings.'
    ];
    
    yPosition = addSection('Market Overview', executiveSummary, yPosition);
    
    // Page 3: Market Analysis with Charts
    pdf.addPage();
    yPosition = addHeader('Market Analysis', 'Comprehensive market data and trends');
    
    // Population chart
    const populationData = [
      { label: 'ID', value: 273.5 },
      { label: 'PH', value: 109.6 },
      { label: 'VN', value: 97.3 },
      { label: 'TH', value: 69.8 },
      { label: 'MY', value: 32.7 },
      { label: 'SG', value: 5.9 }
    ];
    addChart('Population (Millions)', populationData, 20, yPosition, 80, 40);
    
    // GDP chart
    const gdpData = [
      { label: 'ID', value: 1319 },
      { label: 'TH', value: 543 },
      { label: 'SG', value: 397 },
      { label: 'MY', value: 432 },
      { label: 'PH', value: 394 },
      { label: 'VN', value: 409 }
    ];
    addChart('GDP (Billions USD)', gdpData, 110, yPosition, 80, 40);
    
    yPosition += 50;
    
    const marketAnalysis = [
      '• Indonesia dominates the region with the largest population (273.5M) and economy ($1.32T GDP), offering massive scale opportunities.',
      '• Singapore maintains the highest GDP per capita ($65,200) and serves as the regional financial and technology hub.',
      '• Vietnam shows the strongest growth trajectory (6.8% projected 2024) with rapidly improving infrastructure and business environment.',
      '• Thailand offers political stability and established infrastructure, making it an ideal regional headquarters location.',
      '• Malaysia provides unique advantages in Islamic finance and halal product certification for global Muslim markets.',
      '• Philippines presents significant opportunities in BPO services and has a large English-speaking workforce.'
    ];
    
    yPosition = addSection('Country Analysis', marketAnalysis, yPosition);
    
    // Page 4: Digital Landscape
    pdf.addPage();
    yPosition = addHeader('Digital Landscape', 'Technology adoption and digital transformation trends');
    
    // Digital penetration metrics
    addMetricCard('Mobile Users', '520M', '+12%', 20, yPosition, 'blue');
    addMetricCard('Internet Penetration', '76%', '+8%', 70, yPosition, 'emerald');
    addMetricCard('E-commerce Growth', '25%', '+15%', 120, yPosition, 'purple');
    addMetricCard('Digital Payments', '68%', '+22%', 165, yPosition, 'orange');
    
    yPosition += 35;
    
    const digitalInsights = [
      '• Mobile-first approach is critical: 85% of internet users access services primarily through mobile devices.',
      '• Social commerce is driving e-commerce growth, with platforms like TikTok Shop and Instagram Shopping gaining massive traction.',
      '• Digital payment adoption accelerated by 300% during 2020-2024, with super apps like Grab and Gojek leading the transformation.',
      '• Cloud adoption is increasing rapidly among SMEs, creating opportunities for SaaS and infrastructure providers.',
      '• Cybersecurity concerns are rising, creating demand for security solutions and compliance services.',
      '• 5G rollout is creating new opportunities in IoT, AR/VR, and edge computing applications.'
    ];
    
    yPosition = addSection('Digital Transformation Insights', digitalInsights, yPosition);
    
    // Page 5: Consumer Behavior
    pdf.addPage();
    yPosition = addHeader('Consumer Behavior', 'Understanding Southeast Asian consumers');
    
    const consumerBehavior = [
      '• Price sensitivity remains high, but consumers are willing to pay premium for quality, convenience, and brand trust.',
      '• Social media heavily influences purchase decisions, with 65% of consumers discovering products through social platforms.',
      '• Sustainability consciousness is growing, particularly among millennials and Gen Z consumers in urban areas.',
      '• Cross-border shopping is increasing, driven by better logistics and payment solutions.',
      '• Local brands are gaining preference over international brands in categories like food, beauty, and fashion.',
      '• Mobile payment adoption varies significantly by country: Singapore (85%), Thailand (72%), Indonesia (61%).'
    ];
    
    yPosition = addSection('Consumer Insights', consumerBehavior, yPosition);
    
    // Page 6: Competitive Landscape
    pdf.addPage();
    yPosition = addHeader('Competitive Landscape', 'Market leaders and competitive dynamics');
    
    const competitiveAnalysis = [
      '• E-commerce: Shopee leads with 68% market share, followed by Lazada (22%) and Tokopedia (15% in Indonesia).',
      '• Fintech: Grab Financial dominates ride-hailing payments, while traditional banks are rapidly digitalizing.',
      '• Food delivery: Grab Food and foodpanda compete intensely, with local players gaining ground in specific markets.',
      '• Logistics: Established players like DHL and FedEx face competition from regional specialists and tech-enabled startups.',
      '• Cloud services: AWS leads, but Alibaba Cloud and local providers are gaining market share.',
      '• Telecommunications: National champions dominate, but digital services create new competitive dynamics.'
    ];
    
    yPosition = addSection('Competitive Analysis', competitiveAnalysis, yPosition);
    
    // Page 7: Regulatory Environment
    pdf.addPage();
    yPosition = addHeader('Regulatory Environment', 'Legal and regulatory considerations');
    
    const regulatoryInsights = [
      '• Singapore: Most business-friendly environment with clear regulations and strong IP protection.',
      '• Thailand: Improving ease of doing business with new digital economy initiatives and foreign investment incentives.',
      '• Malaysia: Stable regulatory environment with special advantages for Islamic finance and halal industries.',
      '• Indonesia: Large market with complex regulations; local partnerships often required for market entry.',
      '• Philippines: Improving business environment with ongoing regulatory reforms and infrastructure development.',
      '• Vietnam: Rapidly modernizing legal framework with increasing openness to foreign investment.'
    ];
    
    yPosition = addSection('Regulatory Overview', regulatoryInsights, yPosition);
    
    // Page 8: Strategic Recommendations
    pdf.addPage();
    yPosition = addHeader('Strategic Recommendations', 'Actionable insights for market entry');
    
    const recommendations = [
      '• Start with Singapore or Thailand as regional headquarters for regulatory ease and infrastructure quality.',
      '• Prioritize mobile-first product development and user experience design for all markets.',
      '• Invest in local partnerships and cultural adaptation rather than direct market entry approaches.',
      '• Focus on tier-1 cities initially, then expand to tier-2 cities as operations mature.',
      '• Develop localized payment solutions and integrate with popular super apps and digital wallets.',
      '• Build strong social media presence and influencer partnerships for brand awareness and trust building.'
    ];
    
    yPosition = addSection('Market Entry Strategy', recommendations, yPosition);
    
    // Page 9: Implementation Roadmap
    pdf.addPage();
    yPosition = addHeader('Implementation Roadmap', '12-month market entry timeline');
    
    const roadmap = [
      '• Months 1-3: Market research, regulatory compliance, and local partnership identification.',
      '• Months 4-6: Product localization, pilot program launch in primary market, team building.',
      '• Months 7-9: Marketing campaign launch, customer acquisition, feedback integration.',
      '• Months 10-12: Scale operations, expand to secondary markets, optimize based on learnings.',
      '• Key milestones: Regulatory approval (Month 2), First customer (Month 5), Break-even (Month 10).',
      '• Success metrics: Customer acquisition cost, lifetime value, market share, brand awareness.'
    ];
    
    yPosition = addSection('12-Month Timeline', roadmap, yPosition);
    
    // Page 10: Risk Assessment & Appendix
    pdf.addPage();
    yPosition = addHeader('Risk Assessment', 'Potential challenges and mitigation strategies');
    
    const riskAssessment = [
      '• Regulatory Risk: Medium - Monitor policy changes and maintain compliance expertise.',
      '• Currency Risk: Low-Medium - Hedge major exposures and price in local currencies.',
      '• Competition Risk: High - Differentiate through superior user experience and local adaptation.',
      '• Political Risk: Low - Focus on stable markets and diversify across multiple countries.',
      '• Technology Risk: Medium - Invest in robust infrastructure and cybersecurity measures.',
      '• Cultural Risk: Medium - Hire local talent and invest in cultural training for international teams.'
    ];
    
    yPosition = addSection('Risk Analysis', riskAssessment, yPosition);
    
    // Footer on last page
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.text('Generated by Flow - Southeast Asian Market Intelligence Platform', 20, pageHeight - 10);
    pdf.text(`Report Date: ${new Date().toLocaleDateString()} | Markets: ${selectedMarketsText}`, 20, pageHeight - 5);

    pdf.save(`SEA-Market-Analysis-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async generateExcelReport(data: ExportData): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Market Overview Sheet
    const marketOverview = [
      ['Country', 'Population (M)', 'GDP (B USD)', 'Growth Rate (%)', 'Digital Penetration (%)', 'Market Size (B USD)', 'Opportunity Score'],
      ['Indonesia', 273.5, 1319, 5.2, 73, 287, 78],
      ['Philippines', 109.6, 394, 6.2, 68, 156, 75],
      ['Vietnam', 97.3, 409, 6.8, 75, 142, 82],
      ['Thailand', 69.8, 543, 2.8, 85, 127, 71],
      ['Malaysia', 32.7, 432, 4.5, 78, 98, 73],
      ['Singapore', 5.9, 397, 2.6, 92, 89, 68]
    ];
    
    // Economic Indicators Sheet
    const economicData = [
      ['Country', 'GDP Growth 2024 (%)', 'Inflation (%)', 'Unemployment (%)', 'Interest Rate (%)', 'USD Exchange Rate', 'Ease of Business (1-100)'],
      ['Indonesia', 5.2, 3.2, 5.8, 6.00, 15750, 68],
      ['Philippines', 6.2, 4.1, 4.5, 6.50, 56.25, 65],
      ['Vietnam', 6.8, 3.6, 2.3, 4.50, 24350, 70],
      ['Thailand', 2.8, 1.2, 1.1, 2.50, 35.42, 78],
      ['Malaysia', 4.5, 2.8, 3.3, 3.00, 4.68, 73],
      ['Singapore', 2.6, 2.1, 2.0, 3.50, 1.35, 95]
    ];
    
    // Digital Adoption Sheet
    const digitalData = [
      ['Country', 'Internet Penetration (%)', 'Mobile Penetration (%)', 'Social Media Users (%)', 'E-commerce Adoption (%)', 'Digital Payments (%)', 'Cloud Adoption (%)'],
      ['Singapore', 89, 92, 85, 78, 85, 72],
      ['Thailand', 82, 85, 76, 65, 72, 58],
      ['Malaysia', 84, 78, 81, 58, 68, 54],
      ['Indonesia', 71, 73, 68, 52, 61, 45],
      ['Philippines', 67, 68, 72, 45, 55, 41],
      ['Vietnam', 77, 75, 74, 49, 58, 43]
    ];
    
    // Industry Analysis Sheet
    const industryData = [
      ['Industry', 'Market Size (B USD)', 'Growth Rate (%)', 'Competition Level', 'Opportunity Score', 'Key Trends'],
      ['Technology & Software', 89.2, 12.4, 'High', 85, 'AI/ML adoption, Cloud migration, Mobile-first'],
      ['E-commerce & Retail', 156.7, 18.6, 'High', 78, 'Social commerce, Cross-border, Sustainability'],
      ['Financial Services', 67.3, 15.2, 'Medium', 92, 'Digital banking, Cryptocurrency, SME lending'],
      ['Automotive', 45.8, 8.3, 'Medium', 71, 'Electric vehicles, Ride-sharing, Autonomous'],
      ['Healthcare & Pharma', 78.4, 9.7, 'Low', 88, 'Telemedicine, Digital therapeutics, Personalized'],
      ['Manufacturing', 234.1, 6.8, 'Medium', 65, 'Industry 4.0, Supply chain, Green manufacturing']
    ];
    
    // Consumer Insights Sheet
    const consumerData = [
      ['Behavior Category', 'Penetration (%)', 'Growth Rate (%)', 'Key Insight', 'Market Opportunity'],
      ['Mobile-First Shopping', 78.4, 24.3, 'Consumers prefer mobile apps over desktop', 'Optimize mobile checkout flows'],
      ['Social Commerce', 65.7, 31.8, 'Social media drives 65% of purchase decisions', 'Invest in influencer marketing'],
      ['Digital Payments', 72.1, 28.5, 'Cash-to-digital transition accelerating', 'Partner with local payment providers'],
      ['Sustainability Focus', 54.2, 19.7, 'Growing preference for sustainable products', 'Develop eco-friendly product lines'],
      ['Cross-border Shopping', 43.8, 35.2, 'International brands gaining popularity', 'Optimize logistics and customs'],
      ['Voice Commerce', 28.5, 45.6, 'Voice assistants driving new shopping behaviors', 'Develop voice-optimized experiences']
    ];
    
    // Create worksheets with styling
    const ws1 = XLSX.utils.aoa_to_sheet(marketOverview);
    const ws2 = XLSX.utils.aoa_to_sheet(economicData);
    const ws3 = XLSX.utils.aoa_to_sheet(digitalData);
    const ws4 = XLSX.utils.aoa_to_sheet(industryData);
    const ws5 = XLSX.utils.aoa_to_sheet(consumerData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, ws1, 'Market Overview');
    XLSX.utils.book_append_sheet(workbook, ws2, 'Economic Indicators');
    XLSX.utils.book_append_sheet(workbook, ws3, 'Digital Adoption');
    XLSX.utils.book_append_sheet(workbook, ws4, 'Industry Analysis');
    XLSX.utils.book_append_sheet(workbook, ws5, 'Consumer Insights');
    
    // Generate and download
    XLSX.writeFile(workbook, `SEA-Market-Data-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  async generatePowerPointOutline(data: ExportData): Promise<void> {
    const selectedMarketsText = data.selectedCountries.length > 0 
      ? data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')
      : 'All Southeast Asian Markets';

    const pitchDeckContent = `
# SOUTHEAST ASIAN MARKET ENTRY PITCH DECK
## Professional Slide Deck Outline with Visual Design Guidelines

Generated for: ${selectedMarketsText}
Date: ${new Date().toLocaleDateString()}
Focus: ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)} Analysis

---

## SLIDE 1: TITLE SLIDE
**Visual Design:**
- Dark gradient background (slate-900 to slate-800)
- Flow logo with animated gradient effect (blue to emerald to purple)
- Clean, modern typography

**Content:**
- Main Title: "Southeast Asian Market Entry Strategy"
- Subtitle: "Unlocking Growth in the World's Most Dynamic Region"
- Focus Markets: ${selectedMarketsText}
- Company Logo (your brand)
- Date: ${new Date().toLocaleDateString()}

**Speaker Notes:**
- Welcome audience and introduce the opportunity
- Set context for Southeast Asia's importance
- Preview the key markets we'll be discussing

---

## SLIDE 2: EXECUTIVE SUMMARY
**Visual Design:**
- 4 key metric cards with gradient backgrounds
- Clean icons for each metric
- Professional color scheme (blue, emerald, purple, orange)

**Content:**
- Total Addressable Market: $1.2T (+12.4% growth)
- Digital Economy Growth: 18.6% annually
- Internet Users: 456M active users
- Cross-Border Trade: $89.2B (+31.4% growth)

**Key Message:**
"Southeast Asia represents the world's fastest-growing digital economy with unprecedented opportunities for market entry."

**Speaker Notes:**
- Emphasize the scale and growth trajectory
- Compare to other global markets
- Set up the investment thesis

---

## SLIDE 3: MARKET OPPORTUNITY MATRIX
**Visual Design:**
- Interactive bubble chart showing market size vs. growth rate
- Country flags as bubble identifiers
- Color-coded opportunity scoring

**Content:**
- X-axis: Market Size (GDP)
- Y-axis: Growth Rate
- Bubble size: Population
- Color intensity: Opportunity Score

**Countries Plotted:**
- Indonesia: Largest market, strong growth
- Vietnam: Highest growth, emerging opportunity
- Singapore: Premium market, stable growth
- Thailand: Balanced market, moderate growth
- Malaysia: Niche opportunities, steady growth
- Philippines: High potential, developing infrastructure

**Speaker Notes:**
- Walk through each market's positioning
- Explain the opportunity scoring methodology
- Highlight sweet spots for entry

---

## SLIDE 4: DIGITAL TRANSFORMATION WAVE
**Visual Design:**
- Animated wave graphic showing digital adoption
- Mobile-first iconography
- Progressive disclosure of statistics

**Content:**
- Mobile Internet Users: 520M (85% mobile-first)
- E-commerce Growth: 25% annually
- Digital Payment Adoption: 68% average
- Social Commerce Penetration: 65%

**Key Insight:**
"The region has leapfrogged traditional infrastructure, creating unique opportunities for digital-native solutions."

**Speaker Notes:**
- Explain the mobile-first phenomenon
- Compare to Western markets
- Highlight implications for product strategy

---

## SLIDE 5: CONSUMER BEHAVIOR INSIGHTS
**Visual Design:**
- Infographic-style layout with consumer personas
- Behavioral flow diagrams
- Social media integration visuals

**Content:**
- Price-conscious but quality-focused consumers
- Social media influences 65% of purchase decisions
- Growing sustainability consciousness
- Cross-border shopping increasing 35% annually

**Consumer Archetypes:**
- Digital Native (Gen Z, urban, tech-savvy)
- Aspiring Middle Class (millennials, brand-conscious)
- Traditional Adopter (Gen X, value-focused)

**Speaker Notes:**
- Bring consumer insights to life with examples
- Explain cultural nuances by market
- Connect to product positioning strategy

---

## SLIDE 6: COMPETITIVE LANDSCAPE
**Visual Design:**
- Market share pie charts by industry
- Competitive positioning matrix
- Logo wall of key players

**Content:**
- E-commerce: Shopee (68%), Lazada (22%), Others (10%)
- Fintech: Grab Financial, GoPay, TrueMoney
- Food Delivery: Grab Food, foodpanda, Local players
- Ride-hailing: Grab (81%), Gojek, InDriver

**Competitive Advantages:**
- Local adaptation capabilities
- Superior user experience
- Strategic partnerships
- Technology innovation

**Speaker Notes:**
- Analyze competitive strengths and weaknesses
- Identify white space opportunities
- Discuss differentiation strategies

---

## SLIDE 7: REGULATORY ENVIRONMENT
**Visual Design:**
- Traffic light system (green/yellow/red) for regulatory ease
- Country comparison dashboard
- Timeline of recent regulatory changes

**Content:**
- Singapore: Green (95/100 ease of business)
- Thailand: Yellow-Green (78/100, improving)
- Malaysia: Yellow (73/100, stable)
- Indonesia: Yellow (68/100, complex but large)
- Philippines: Yellow (65/100, reforming)
- Vietnam: Yellow-Green (70/100, modernizing)

**Key Regulations:**
- Data protection laws
- Foreign investment restrictions
- Digital service requirements
- Tax implications

**Speaker Notes:**
- Explain regulatory complexity vs. opportunity
- Discuss compliance strategies
- Highlight recent positive changes

---

## SLIDE 8: MARKET ENTRY STRATEGY
**Visual Design:**
- Strategic framework diagram
- Phase-based timeline
- Success metrics dashboard

**Content:**
**Phase 1: Foundation (0-6 months)**
- Market research and regulatory setup
- Local partnership identification
- Product localization
- Team building

**Phase 2: Launch (6-18 months)**
- Pilot program in tier-1 cities
- Marketing campaign launch
- Customer acquisition
- Feedback integration

**Phase 3: Scale (18+ months)**
- Multi-market expansion
- Operations optimization
- Strategic partnerships
- Market leadership

**Speaker Notes:**
- Walk through each phase in detail
- Explain resource requirements
- Discuss risk mitigation strategies

---

## SLIDE 9: FINANCIAL PROJECTIONS
**Visual Design:**
- Revenue growth charts
- Investment timeline
- ROI projections
- Break-even analysis

**Content:**
- Year 1: Market entry and setup ($2M investment)
- Year 2: Revenue growth to $5M (150% growth)
- Year 3: Scale to $15M (200% growth)
- Year 4: Market leadership $35M (133% growth)
- Year 5: Regional expansion $75M (114% growth)

**Key Metrics:**
- Customer Acquisition Cost: $25-50
- Lifetime Value: $200-400
- Break-even: Month 18
- ROI: 300%+ by Year 5

**Speaker Notes:**
- Explain assumptions behind projections
- Compare to industry benchmarks
- Discuss sensitivity analysis

---

## SLIDE 10: TECHNOLOGY STACK
**Visual Design:**
- Architecture diagram
- Cloud infrastructure visualization
- Security and compliance badges

**Content:**
- Cloud-first architecture (AWS/Azure)
- Mobile-responsive design
- API-first development
- Microservices architecture
- Real-time analytics
- Multi-language support

**Key Features:**
- Scalable infrastructure
- Local payment integration
- Social media connectivity
- Advanced analytics
- Security compliance

**Speaker Notes:**
- Explain technical differentiation
- Discuss scalability advantages
- Address security and compliance

---

## SLIDE 11: PARTNERSHIP STRATEGY
**Visual Design:**
- Partnership ecosystem map
- Logo integration with connection lines
- Value proposition for each partner type

**Content:**
**Strategic Partners:**
- Local market leaders
- Technology providers
- Payment processors
- Logistics companies

**Channel Partners:**
- Distributors and resellers
- Digital marketing agencies
- System integrators
- Consultants

**Value Propositions:**
- Revenue sharing models
- Technology access
- Market expansion
- Brand association

**Speaker Notes:**
- Explain partnership selection criteria
- Discuss mutual value creation
- Share preliminary partnership discussions

---

## SLIDE 12: RISK ASSESSMENT
**Visual Design:**
- Risk heat map matrix
- Mitigation strategy flowchart
- Contingency planning timeline

**Content:**
**High Impact, Low Probability:**
- Political instability
- Major economic downturn
- Regulatory changes

**Medium Impact, Medium Probability:**
- Competitive response
- Currency fluctuation
- Technology disruption

**Low Impact, High Probability:**
- Operational challenges
- Cultural adaptation
- Talent acquisition

**Mitigation Strategies:**
- Diversification across markets
- Local partnerships
- Flexible business model
- Strong cash reserves

**Speaker Notes:**
- Acknowledge risks transparently
- Explain mitigation strategies
- Demonstrate preparedness

---

## SLIDE 13: TEAM & EXECUTION
**Visual Design:**
- Organizational chart
- Team member profiles with photos
- Skills and experience highlights

**Content:**
**Leadership Team:**
- CEO: Regional expansion experience
- CTO: Southeast Asian tech background
- CMO: Local market expertise
- CFO: International finance experience

**Advisory Board:**
- Former executives from successful SEA companies
- Government relations experts
- Industry thought leaders
- Investor representatives

**Execution Capabilities:**
- Proven track record in market entry
- Deep regional relationships
- Technical expertise
- Cultural understanding

**Speaker Notes:**
- Highlight relevant experience
- Explain team assembly strategy
- Discuss advisory board value

---

## SLIDE 14: INVESTMENT REQUIREMENTS
**Visual Design:**
- Investment breakdown pie chart
- Funding timeline
- Use of funds waterfall

**Content:**
**Total Investment Required: $10M over 24 months**

**Use of Funds:**
- Product Development: 30% ($3M)
- Marketing & Customer Acquisition: 25% ($2.5M)
- Operations & Infrastructure: 20% ($2M)
- Team Building: 15% ($1.5M)
- Working Capital: 10% ($1M)

**Funding Timeline:**
- Series A: $4M (Months 1-6)
- Series A Extension: $3M (Months 12-18)
- Series B: $3M (Months 18-24)

**Speaker Notes:**
- Justify investment requirements
- Explain funding strategy
- Discuss investor value proposition

---

## SLIDE 15: SUCCESS METRICS & MILESTONES
**Visual Design:**
- KPI dashboard mockup
- Milestone timeline
- Success celebration imagery

**Content:**
**Key Performance Indicators:**
- Monthly Active Users (MAU)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Market Share by Country
- Revenue Growth Rate
- Net Promoter Score (NPS)

**Major Milestones:**
- Month 6: First market launch
- Month 12: 100K active users
- Month 18: Break-even achieved
- Month 24: Multi-market presence
- Month 36: Market leadership

**Success Definition:**
- Top 3 market position in primary markets
- $50M+ annual revenue run rate
- Positive unit economics
- Strong brand recognition

**Speaker Notes:**
- Explain metric selection rationale
- Discuss tracking and reporting
- Connect to investor returns

---

## SLIDE 16: CALL TO ACTION
**Visual Design:**
- Bold, action-oriented design
- Contact information prominently displayed
- Next steps clearly outlined

**Content:**
**The Opportunity is Now**
- Southeast Asia's digital transformation is accelerating
- First-mover advantages are still available
- Market conditions are optimal for entry

**Next Steps:**
1. Due diligence deep dive
2. Market validation pilot
3. Partnership discussions
4. Investment commitment
5. Launch preparation

**Contact Information:**
- Email: [your-email]
- Phone: [your-phone]
- LinkedIn: [your-linkedin]
- Website: [your-website]

**Speaker Notes:**
- Create urgency around the opportunity
- Clearly state what you're asking for
- Provide multiple ways to follow up
- Thank the audience for their time

---

## APPENDIX SLIDES

### A1: DETAILED FINANCIAL MODEL
- 5-year P&L projections
- Cash flow analysis
- Sensitivity scenarios
- Comparable company analysis

### A2: MARKET RESEARCH METHODOLOGY
- Primary research approach
- Data sources and validation
- Sample sizes and demographics
- Research limitations

### A3: COMPETITIVE ANALYSIS DEEP DIVE
- Detailed competitor profiles
- SWOT analysis
- Pricing comparison
- Feature comparison matrix

### A4: REGULATORY COMPLIANCE CHECKLIST
- Country-specific requirements
- Timeline for approvals
- Cost estimates
- Legal partner recommendations

### A5: TECHNOLOGY ARCHITECTURE
- Detailed system diagrams
- Security protocols
- Scalability planning
- Integration capabilities

---

## PRESENTATION TIPS:

**Visual Design Guidelines:**
- Use consistent color palette (blue, emerald, purple, orange)
- Maintain 60-30-10 color rule
- Use high-quality images and icons
- Ensure readability with proper contrast
- Keep slides uncluttered with plenty of white space

**Animation Recommendations:**
- Subtle entrance animations for key points
- Progressive disclosure for complex information
- Smooth transitions between slides
- Avoid distracting or excessive animations

**Delivery Best Practices:**
- Practice timing (20 minutes presentation, 10 minutes Q&A)
- Prepare for common questions
- Have backup slides ready
- Test all technology beforehand
- Bring printed handouts as backup

**Audience Engagement:**
- Start with a compelling hook
- Use storytelling to illustrate points
- Include interactive elements where appropriate
- End with clear next steps
- Follow up within 24 hours

This comprehensive pitch deck outline provides a professional framework for presenting your Southeast Asian market entry strategy. Each slide is designed to build upon the previous one, creating a compelling narrative that leads to a clear call to action.
`;

    // Create and download the PowerPoint outline
    const blob = new Blob([pitchDeckContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEA-Market-Pitch-Deck-Outline-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}