import jsPDF from 'jspdf';

export interface DeckData {
  selectedCountries: string[];
  selectedCities: string[];
  marketData?: any;
}

export class ProfessionalDeckService {
  private static instance: ProfessionalDeckService;

  public static getInstance(): ProfessionalDeckService {
    if (!ProfessionalDeckService.instance) {
      ProfessionalDeckService.instance = new ProfessionalDeckService();
    }
    return ProfessionalDeckService.instance;
  }

  async generateProfessionalDeck(data: DeckData): Promise<void> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors matching the FinLit+ style
    const darkNavy = [15, 23, 42]; // slate-950
    const deepBlue = [30, 41, 59]; // slate-800
    const purple = [139, 92, 246]; // purple-500
    const white = [255, 255, 255];
    const lightGray = [203, 213, 225]; // slate-300

    const selectedMarketsText = data.selectedCountries.length > 0
      ? data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')
      : 'Southeast Asia';

    // ===== SLIDE 1: TITLE SLIDE =====
    // Dark gradient background
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Left side content area (60% width)
    const leftWidth = pageWidth * 0.55;

    // Main title
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize('Flow Market Entry Strategy', leftWidth - 40);
    let yPos = 50;
    titleLines.forEach((line: string) => {
      doc.text(line, 20, yPos);
      yPos += 15;
    });

    // Subtitle
    yPos += 10;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Penetrating Southeast Asian Markets', 20, yPos);

    yPos += 15;
    doc.setFontSize(16);
    doc.text(`Focus: ${selectedMarketsText}`, 20, yPos);

    // Right side - decorative element placeholder
    doc.setFillColor(purple[0], purple[1], purple[2], 0.2);
    doc.rect(leftWidth, 0, pageWidth - leftWidth, pageHeight, 'F');

    // Decorative gradient effect
    for (let i = 0; i < 20; i++) {
      const opacity = 0.05 + (i * 0.02);
      doc.setFillColor(purple[0], purple[1], purple[2], opacity);
      doc.circle(pageWidth - 40, 50 + (i * 3), 40 - i, 'F');
    }

    // Footer branding
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 2: MISSION & VISION =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Split screen layout
    doc.setFillColor(purple[0], purple[1], purple[2], 0.15);
    doc.rect(leftWidth, 0, pageWidth - leftWidth, pageHeight, 'F');

    // Title on left
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    yPos = 40;
    doc.text('Strategic Market', 20, yPos);
    doc.text('Intelligence', 20, yPos + 14);

    // Mission box on right
    const boxX = leftWidth + 15;
    const boxWidth = pageWidth - leftWidth - 30;
    yPos = 50;

    // Mission
    doc.setFillColor(purple[0], purple[1], purple[2], 0.25);
    doc.roundedRect(boxX, yPos, boxWidth, 35, 3, 3, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Our Mission', boxX + 5, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const missionText = 'Empowering businesses with data-driven insights and comprehensive market intelligence to successfully enter and scale in Southeast Asian markets.';
    const missionLines = doc.splitTextToSize(missionText, boxWidth - 10);
    let missionY = yPos + 16;
    missionLines.forEach((line: string) => {
      doc.text(line, boxX + 5, missionY);
      missionY += 5;
    });

    // Vision
    yPos += 45;
    doc.setFillColor(purple[0], purple[1], purple[2], 0.25);
    doc.roundedRect(boxX, yPos, boxWidth, 35, 3, 3, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Our Vision', boxX + 5, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const visionText = 'To become the leading market intelligence platform for Southeast Asia, enabling seamless market entry and sustainable growth for businesses of all sizes.';
    const visionLines = doc.splitTextToSize(visionText, boxWidth - 10);
    let visionY = yPos + 16;
    visionLines.forEach((line: string) => {
      doc.text(line, boxX + 5, visionY);
      visionY += 5;
    });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 3: THE CHALLENGE =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Right side accent
    doc.setFillColor(purple[0], purple[1], purple[2], 0.12);
    doc.rect(leftWidth, 0, pageWidth - leftWidth, pageHeight, 'F');

    // Title
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('The Critical', 20, 40);
    doc.text('Challenge', 20, 54);

    // Challenges column
    yPos = 75;
    const challenges = [
      {
        title: 'Market Complexity',
        points: [
          'Diverse regulations across countries',
          'Cultural and linguistic differences',
          'Varying consumer behaviors'
        ]
      },
      {
        title: 'Data Fragmentation',
        points: [
          'Inconsistent market data',
          'Limited real-time insights',
          'Difficult competitive analysis'
        ]
      }
    ];

    challenges.forEach(challenge => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(`• ${challenge.title}`, 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);

      challenge.points.forEach(point => {
        doc.text(`  ${point}`, 22, yPos);
        yPos += 5;
      });

      yPos += 5;
    });

    // Impact box on right
    const impactX = leftWidth + 15;
    const impactY = 60;

    doc.setFillColor(purple[0], purple[1], purple[2], 0.25);
    doc.roundedRect(impactX, impactY, boxWidth, 50, 3, 3, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Real-World Impact', impactX + 5, impactY + 10);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const impacts = [
      '• Failed market entries due to poor research',
      '• Millions lost in misaligned strategies',
      '• Missed opportunities in high-growth markets',
      '• Delayed expansion timelines'
    ];

    let impactTextY = impactY + 18;
    impacts.forEach(impact => {
      doc.text(impact, impactX + 5, impactTextY);
      impactTextY += 6;
    });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 4: OUR SOLUTION =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Right accent
    doc.setFillColor(purple[0], purple[1], purple[2], 0.15);
    doc.rect(leftWidth, 0, pageWidth - leftWidth, pageHeight, 'F');

    // Title
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('Our Game-Changing', 20, 40);
    doc.text('Solution', 20, 54);

    // Feature boxes (2x2 grid on left)
    const features = [
      { icon: '📊', title: 'Live Market Data', desc: 'Real-time stock indices, economic indicators, and currency rates' },
      { icon: '🎯', title: 'Smart Analytics', desc: 'AI-powered insights and predictive market analysis' },
      { icon: '📱', title: 'Mobile-First', desc: 'Access anywhere, anytime with responsive design' },
      { icon: '🔒', title: 'Secure & Reliable', desc: 'Enterprise-grade security and data integrity' }
    ];

    const featureBoxW = (leftWidth - 35) / 2;
    const featureBoxH = 25;
    let featureY = 70;
    let featureX = 20;

    features.forEach((feature, idx) => {
      if (idx === 2) {
        featureY += featureBoxH + 5;
        featureX = 20;
      }

      doc.setFillColor(purple[0], purple[1], purple[2], 0.2);
      doc.roundedRect(featureX, featureY, featureBoxW, featureBoxH, 2, 2, 'F');

      doc.setFontSize(16);
      doc.text(feature.icon, featureX + 3, featureY + 8);

      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(feature.title, featureX + 10, featureY + 8);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      const descLines = doc.splitTextToSize(feature.desc, featureBoxW - 12);
      let descY = featureY + 14;
      descLines.forEach((line: string) => {
        doc.text(line, featureX + 3, descY);
        descY += 4;
      });

      featureX += featureBoxW + 5;
    });

    // Key benefits on right
    const benefitsX = leftWidth + 15;
    const benefitsY = 50;

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Platform Benefits', benefitsX, benefitsY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const benefits = [
      'Comprehensive market coverage',
      'Data-driven decision making',
      'Reduced market entry risk',
      'Faster time to market',
      'Competitive intelligence',
      'ROI tracking and optimization'
    ];

    let benefitY = benefitsY + 10;
    benefits.forEach(benefit => {
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text('✓', benefitsX, benefitY);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(benefit, benefitsX + 5, benefitY);
      benefitY += 7;
    });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 5: KEY FEATURES =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('Innovative Features', 20, 30);

    const keyFeatures = [
      {
        icon: '📈',
        title: 'Live Market Tracking',
        desc: 'Real-time stock market indices, economic indicators, and currency exchange rates across 6 Southeast Asian markets.'
      },
      {
        icon: '🌍',
        title: 'Country Analytics',
        desc: 'Deep-dive analysis for Indonesia, Thailand, Singapore, Malaysia, Philippines, and Vietnam with city-level insights.'
      },
      {
        icon: '🏭',
        title: 'Industry Intelligence',
        desc: 'Sector-specific insights for technology, e-commerce, fintech, manufacturing, and emerging industries.'
      },
      {
        icon: '📊',
        title: 'Professional Reports',
        desc: 'Generate McKinsey-style reports and presentation decks with one click for board meetings and stakeholders.'
      }
    ];

    yPos = 50;
    keyFeatures.forEach((feat, idx) => {
      const featureBoxX = 20 + (idx % 2) * ((pageWidth - 50) / 2);
      const featureBoxY = yPos + Math.floor(idx / 2) * 45;
      const featureBoxWidth = (pageWidth - 55) / 2;

      doc.setFillColor(purple[0], purple[1], purple[2], 0.15);
      doc.roundedRect(featureBoxX, featureBoxY, featureBoxWidth, 40, 3, 3, 'F');

      // Border accent
      doc.setDrawColor(purple[0], purple[1], purple[2]);
      doc.setLineWidth(0.5);
      doc.line(featureBoxX, featureBoxY, featureBoxX, featureBoxY + 40);

      doc.setFontSize(18);
      doc.text(feat.icon, featureBoxX + 5, featureBoxY + 10);

      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(feat.title, featureBoxX + 13, featureBoxY + 10);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      const featLines = doc.splitTextToSize(feat.desc, featureBoxWidth - 12);
      let featTextY = featureBoxY + 18;
      featLines.forEach((line: string) => {
        doc.text(line, featureBoxX + 5, featTextY);
        featTextY += 4.5;
      });
    });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 6: WHY WE'RE REVOLUTIONARY =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Right accent
    doc.setFillColor(purple[0], purple[1], purple[2], 0.1);
    doc.rect(leftWidth, 0, pageWidth - leftWidth, pageHeight, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('Why We\'re', 20, 40);
    doc.text('Revolutionary', 20, 54);

    // Core differentiators
    const differentiators = [
      {
        title: 'Comprehensive Coverage',
        desc: 'First platform combining live market data, economic indicators, and business intelligence'
      },
      {
        title: 'Real-Time Insights',
        desc: 'Live stock indices, currency rates, and market status updated every 5 minutes'
      },
      {
        title: 'Professional Grade',
        desc: 'McKinsey-quality reports and presentations generated instantly'
      }
    ];

    yPos = 75;
    differentiators.forEach(diff => {
      // Circle bullet point
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.circle(23, yPos - 2, 2, 'F');

      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(diff.title, 28, yPos);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      const diffLines = doc.splitTextToSize(diff.desc, leftWidth - 40);
      let diffY = yPos + 6;
      diffLines.forEach((line: string) => {
        doc.text(line, 28, diffY);
        diffY += 5;
      });

      yPos += 25;
    });

    // Stats box on right
    const statsX = leftWidth + 15;
    const statsY = 50;

    doc.setFillColor(purple[0], purple[1], purple[2], 0.25);
    doc.roundedRect(statsX, statsY, boxWidth, 70, 3, 3, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Platform Impact', statsX + 5, statsY + 10);

    const stats = [
      { label: 'Markets Covered', value: '6 Countries' },
      { label: 'Data Points', value: '1000+' },
      { label: 'Update Frequency', value: '5 Minutes' },
      { label: 'Report Types', value: '10+' }
    ];

    let statY = statsY + 22;
    stats.forEach(stat => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(stat.value, statsX + 5, statY);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(stat.label, statsX + 5, statY + 5);

      statY += 14;
    });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 7: MARKET OPPORTUNITY =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('Measurable Impact', 20, 30);

    // Timeline with phases
    const phases = [
      {
        number: '1',
        title: 'Market Research Phase',
        desc: 'Comprehensive analysis across all Southeast Asian markets with real-time data access and competitive intelligence.'
      },
      {
        number: '2',
        title: 'Strategic Planning',
        desc: 'Data-driven market entry strategy development with risk assessment and opportunity identification.'
      },
      {
        number: '3',
        title: 'Execution & Scale',
        desc: 'Implementation support with ongoing market monitoring, performance tracking, and optimization insights.'
      }
    ];

    yPos = 55;
    phases.forEach(phase => {
      const phaseBoxY = yPos;
      const phaseBoxWidth = pageWidth - 40;

      doc.setFillColor(purple[0], purple[1], purple[2], 0.15);
      doc.roundedRect(20, phaseBoxY, phaseBoxWidth, 30, 3, 3, 'F');

      // Phase number circle
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.circle(30, phaseBoxY + 15, 6, 'F');

      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(phase.number, 28, phaseBoxY + 17);

      // Phase title
      doc.setFontSize(13);
      doc.text(phase.title, 40, phaseBoxY + 12);

      // Phase description
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      const phaseLines = doc.splitTextToSize(phase.desc, phaseBoxWidth - 25);
      let phaseDescY = phaseBoxY + 19;
      phaseLines.forEach((line: string) => {
        doc.text(line, 40, phaseDescY);
        phaseDescY += 4.5;
      });

      yPos += 35;
    });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // ===== SLIDE 8: CALL TO ACTION =====
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Gradient effect
    for (let i = 0; i < 30; i++) {
      const opacity = 0.02 + (i * 0.01);
      doc.setFillColor(purple[0], purple[1], purple[2], opacity);
      doc.circle(pageWidth / 2, pageHeight / 2, 80 - (i * 2), 'F');
    }

    // Center content
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    doc.text('Ready to Transform', pageWidth / 2, 60, { align: 'center' });
    doc.text('Your Market Entry?', pageWidth / 2, 75, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Start your Southeast Asian expansion with confidence', pageWidth / 2, 95, { align: 'center' });

    // CTA boxes
    const ctaY = 110;
    const ctaBoxes = [
      { title: 'Expert Team', desc: 'Market analysts & data scientists' },
      { title: 'Proven Data', desc: 'World Bank, IMF, real-time APIs' },
      { title: 'Fast Results', desc: 'Instant reports & insights' }
    ];

    const ctaBoxWidth = (pageWidth - 80) / 3;
    let ctaX = 30;

    ctaBoxes.forEach(cta => {
      doc.setFillColor(purple[0], purple[1], purple[2], 0.25);
      doc.roundedRect(ctaX, ctaY, ctaBoxWidth, 25, 3, 3, 'F');

      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(cta.title, ctaX + ctaBoxWidth / 2, ctaY + 10, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(cta.desc, ctaX + ctaBoxWidth / 2, ctaY + 18, { align: 'center' });

      ctaX += ctaBoxWidth + 10;
    });

    // Quote
    doc.setFillColor(purple[0], purple[1], purple[2], 0.1);
    doc.roundedRect(40, 145, pageWidth - 80, 20, 2, 2, 'F');

    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('"Together, we\'re building data-driven market entry strategies', pageWidth / 2, 155, { align: 'center' });
    doc.text('that unlock Southeast Asia\'s tremendous growth potential."', pageWidth / 2, 161, { align: 'center' });

    // Footer
    doc.setFillColor(white[0], white[1], white[2], 0.95);
    doc.roundedRect(pageWidth - 50, pageHeight - 15, 45, 10, 2, 2, 'F');
    doc.setTextColor(deepBlue[0], deepBlue[1], deepBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Made with FLOW', pageWidth - 47, pageHeight - 8);

    // Save the PDF
    doc.save(`Flow-Professional-Deck-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
