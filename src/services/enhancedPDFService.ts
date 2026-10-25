import { jsPDF } from 'jspdf';
import { UnifiedDataService } from './unifiedDataService';
import type { UnifiedEconomicData } from './unifiedDataService';
import { MarketDataService } from './marketDataService';
import type { CurrencyRate, MarketData } from './marketDataService';

type ReportEconomicData = UnifiedEconomicData;
type ReportStockData = MarketData;
type ReportCurrencyData = CurrencyRate;
type ReportColors = Record<
  'primary' | 'secondary' | 'accent' | 'warning' | 'dark' | 'darkGray' | 'lightGray' | 'white',
  [number, number, number]
>;

const REFERENCE_NOTICE = 'Unverified reference; observation dates/current applicability unknown';

// Missing values remain missing, including in aggregates and derived scenarios.
const numeric = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
const display = (value: unknown, digits = 1, divisor = 1, prefix = '', suffix = ''): string => {
  const number = numeric(value) / divisor;
  return Number.isFinite(number) ? `${prefix}${number.toFixed(digits)}${suffix}` : 'Unavailable';
};
const completeTotal = (values: unknown[]): number => values.length && values.every(value => Number.isFinite(numeric(value)))
  ? values.reduce<number>((sum, value) => sum + numeric(value), 0) : Number.NaN;
const completeAverage = (values: unknown[]): number => completeTotal(values) / values.length;
const ratio = (numerator: unknown, denominator: unknown): number => numeric(denominator) > 0
  ? numeric(numerator) / numeric(denominator) : Number.NaN;

// Unattributed payload values do not become factual report numbers.
const sourced = <T extends { source?: string; metricEvidence?: Record<string, { source?: string; status?: string }> }>(records: T[], fields: string[]): T[] => records.map(record => ({
  ...record,
  ...Object.fromEntries(fields.map(field => {
    const evidence = record.metricEvidence?.[field];
    const source = evidence?.source || record.source;
    const available = typeof source === 'string' && source.trim().length > 0 && !/^(unavailable|unknown|n\/a)$/i.test(source.trim()) && evidence?.status !== 'unavailable';
    return [field, available ? Reflect.get(record, field) : Number.NaN];
  }))
}));

export interface PDFReportData {
  selectedCountries: string[];
  selectedCities: string[];
  includeCharts?: boolean;
  includeLiveData?: boolean;
}

export class EnhancedPDFService {
  private static instance: EnhancedPDFService;
  private unifiedDataService: UnifiedDataService;
  private marketDataService: MarketDataService;

  private constructor() {
    this.unifiedDataService = UnifiedDataService.getInstance();
    this.marketDataService = MarketDataService.getInstance();
  }

  public static getInstance(): EnhancedPDFService {
    if (!EnhancedPDFService.instance) {
      EnhancedPDFService.instance = new EnhancedPDFService();
    }
    return EnhancedPDFService.instance;
  }

  async generateEnhancedPDF(data: PDFReportData): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      const colors: ReportColors = {
        primary: [59, 130, 246],
        secondary: [16, 185, 129],
        accent: [139, 92, 246],
        warning: [245, 158, 11],
        dark: [15, 23, 42],
        darkGray: [30, 41, 59],
        lightGray: [148, 163, 184],
        white: [255, 255, 255]
      };

      let economicData: ReportEconomicData[] = [];
      let stockIndices: ReportStockData[] = [];
      let currencies: ReportCurrencyData[] = [];

      try {
        economicData = await this.unifiedDataService.getUnifiedEconomicData(data.selectedCountries);
        economicData = sourced(economicData || [], ['gdp', 'gdpGrowth', 'inflation', 'unemployment', 'population', 'gdpPerCapita', 'internetUsers', 'exchangeRate', 'interestRate']);
      } catch (error) {
        console.error('Economic data unavailable for export:', error);
        economicData = [];
      }

      try {
        stockIndices = await this.marketDataService.getStockData([
          'JCI', 'SET', 'KLSE', 'PSEI', 'VNI', 'STI'
        ]);
        stockIndices = sourced(stockIndices || [], ['price', 'change', 'changePercent', 'volume', 'marketCap']);
      } catch (error) {
        console.error('Stock data unavailable for export:', error);
        stockIndices = [];
      }

      try {
        currencies = await this.marketDataService.getCurrencyRates();
        currencies = sourced(currencies || [], ['rate', 'change', 'changePercent']);
      } catch (error) {
        console.error('Currency data unavailable for export:', error);
        currencies = [];
      }

      this.addCoverPage(doc, data, colors, pageWidth, pageHeight, contentWidth);

      doc.addPage();
      let yPos = this.addPageHeader(doc, 'Executive Summary', 2, colors, pageWidth, margin);
      yPos = await this.addExecutiveSummary(doc, yPos, economicData, colors, margin, contentWidth);

      doc.addPage();
      yPos = this.addPageHeader(doc, 'Market Overview', 3, colors, pageWidth, margin);
      yPos = await this.addMarketOverview(doc, yPos, economicData, colors, margin, contentWidth);

      doc.addPage();
      yPos = this.addPageHeader(doc, 'Market Reference Data', 4, colors, pageWidth, margin);
      yPos = await this.addMarketReferenceData(doc, yPos, stockIndices, currencies, colors, margin, contentWidth);

      doc.addPage();
      yPos = this.addPageHeader(doc, 'Country Deep Dive', 5, colors, pageWidth, margin);
      yPos = await this.addCountryAnalysis(doc, yPos, economicData, colors, margin, contentWidth, pageHeight);

      doc.addPage();
      yPos = this.addPageHeader(doc, 'Illustrative Digital Discussion Topics', 6, colors, pageWidth, margin);
      yPos = await this.addDigitalEconomy(doc, yPos, economicData, colors, margin, contentWidth);

      doc.addPage();
      yPos = this.addPageHeader(doc, 'Illustrative Investment Strategy', 7, colors, pageWidth, margin);
      await this.addRecommendations(doc, yPos, colors, margin, contentWidth, pageHeight);

      this.addProvenance(doc, economicData, stockIndices, currencies, colors, pageWidth, margin, contentWidth);
      this.addFooter(doc, pageHeight, pageWidth, margin, colors);

      const fileName = `SEA-Market-Intelligence-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Critical error generating PDF:', error);
      throw new Error('Failed to generate PDF report. Please try again or contact support.');
    }
  }

  private addCoverPage(doc: jsPDF, data: PDFReportData, colors: ReportColors, pageWidth: number, pageHeight: number, contentWidth: number): void {
    doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    for (let i = 0; i < 15; i++) {
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.02 + (i * 0.01));
      doc.circle(pageWidth - 30, 40, 50 - (i * 2), 'F');
    }

    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 12, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    doc.text('FLOW', 20, 30);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Market Intelligence Platform', 20, 40);

    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize('Southeast Asian Market Entry Strategy', pageWidth - 40);
    let titleY = 80;
    titleLines.forEach((line: string) => {
      doc.text(line, 20, titleY);
      titleY += 12;
    });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 230, 230);
    doc.text('Market Research Reference Report', 20, titleY + 10);

    const selectedMarketsText = data.selectedCountries.length > 0
      ? data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')
      : 'All Southeast Asian Markets';

    doc.setFontSize(14);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(`Focus Markets: ${selectedMarketsText}`, 20, titleY + 25);

    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(20, titleY + 35, contentWidth - 20, 2, 'F');

    const date = new Date();
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 220);
    doc.text(`Generated: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, titleY + 45);
    doc.text(`Export time: ${date.toLocaleTimeString('en-US')}`, 20, titleY + 52);

    doc.setFontSize(10);
    doc.setTextColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    doc.text(REFERENCE_NOTICE, 20, titleY + 65, { maxWidth: contentWidth });
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text('Supplied figures require verification. Static scenarios: src/services/enhancedPDFService.ts. Generated time is not an observation date.', 20, titleY + 78, { maxWidth: contentWidth });

    const metrics = [
      { label: 'Material', value: 'Reference' },
      { label: 'Verification', value: 'Required' },
      { label: 'Data dates', value: 'Unknown' },
      { label: 'Strategies', value: 'Illustrative' }
    ];

    const boxWidth = (pageWidth - 50) / 4;
    let boxX = 20;
    const boxY = pageHeight - 50;

    metrics.forEach((metric) => {
      doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2], 0.5);
      doc.roundedRect(boxX, boxY, boxWidth - 5, 25, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.label, boxX + 3, boxY + 17);

      doc.setFontSize(11);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, boxX + 3, boxY + 24);

      boxX += boxWidth;
    });

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL - For Internal Use Only', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  private addPageHeader(doc: jsPDF, title: string, pageNum: number, colors: ReportColors, pageWidth: number, margin: number): number {
    doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');

    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 15, pageWidth, 2, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FLOW', margin, 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 200, 200);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 10, { align: 'right' });

    doc.setFontSize(20);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 32);

    return 42;
  }

  private async addExecutiveSummary(doc: jsPDF, yPos: number, economicData: ReportEconomicData[], colors: ReportColors, margin: number, contentWidth: number): Promise<number> {
    const metrics = [
      {
        label: 'Combined GDP',
        value: display(completeTotal(economicData.map(country => country.gdp)), 1, 1e12, '$', 'T'),
        change: 'Reference',
        color: colors.primary
      },
      {
        label: 'Total Population',
        value: display(completeTotal(economicData.map(country => country.population)), 0, 1e6, '', 'M'),
        change: 'Reference',
        color: colors.secondary
      },
      {
        label: 'Avg GDP Growth',
        value: display(completeAverage(economicData.map(country => country.gdpGrowth)), 1, 1, '', '%'),
        change: 'Reference',
        color: colors.accent
      },
      {
        label: 'Digital Users',
        value: display(completeTotal(economicData.map(country => country.internetUsers)), 0, 1e6, '', 'M'),
        change: 'Reference',
        color: colors.warning
      }
    ];

    const boxWidth = (contentWidth - 15) / 4;
    let boxX = margin;

    metrics.forEach((metric) => {
      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2], 0.1);
      doc.roundedRect(boxX, yPos, boxWidth, 28, 2, 2, 'F');

      doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.setLineWidth(0.5);
      doc.line(boxX, yPos, boxX, yPos + 28);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.label, boxX + 2, yPos + 7);

      doc.setFontSize(18);
      doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, boxX + 2, yPos + 17);

      doc.setFontSize(11);
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.change, boxX + 2, yPos + 25);

      boxX += boxWidth + 5;
    });

    yPos += 38;

    doc.setFontSize(16);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Illustrative Discussion Topics', margin, yPos);

    yPos += 10;

    const insights = [
      'Research market size and consumer demand with dated primary sources before selecting an entry market.',
      'Test digital channels, payment methods and customer needs for the specific product and market.',
      'Compare verified growth, demographics and business-specific costs; this report does not establish investment suitability.',
      'Check current country and sector rules with qualified local advisers before committing resources.'
    ];

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');

    insights.forEach((insight, index) => {
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${index + 1}.`, margin, yPos);

      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(insight, contentWidth - 10);
      lines.forEach((line: string) => {
        doc.text(line, margin + 6, yPos);
        yPos += 6;
      });
      yPos += 4;
    });

    yPos += 5;

    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2], 0.15);
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, contentWidth, 24, 2, 2, 'FD');

    doc.setFontSize(13);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ILLUSTRATIVE STRATEGY - VERIFY BEFORE USE', margin + 4, yPos + 8);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    const recText = 'Strategic phased market entry approach: Indonesia first (scale), Vietnam/Philippines (growth), Singapore (premium hub).';
    const recLines = doc.splitTextToSize(recText, contentWidth - 12);
    let recY = yPos + 16;
    recLines.forEach((line: string) => {
      doc.text(line, margin + 4, recY);
      recY += 5;
    });

    return yPos + 25;
  }

  private async addMarketOverview(doc: jsPDF, yPos: number, economicData: ReportEconomicData[], colors: ReportColors, margin: number, contentWidth: number): Promise<number> {
    doc.setFontSize(16);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Country Comparison Matrix', margin, yPos);

    yPos += 10;

    doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.rect(margin, yPos, contentWidth, 8, 'F');

    const headers = ['Country', 'GDP (B)', 'Pop (M)', 'Growth %', 'Inflation', 'Unemployment'];
    const colWidth = contentWidth / headers.length;

    doc.setFontSize(11);
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFont('helvetica', 'bold');

    headers.forEach((header, i) => {
      doc.text(header, margin + (i * colWidth) + 2, yPos + 5);
    });

    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    economicData.slice(0, 6).forEach((country, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, contentWidth, 7, 'F');
      }

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(country.country || 'N/A', margin + 2, yPos + 5);
      doc.text(`$${display(country.gdp, 0, 1e9)}`, margin + colWidth + 2, yPos + 5);
      doc.text(display(country.population, 1, 1e6, '', ''), margin + (colWidth * 2) + 2, yPos + 5);

      const growth = numeric(country.gdpGrowth);
      doc.setTextColor(growth > 0 ? colors.secondary[0] : colors.warning[0], growth > 0 ? colors.secondary[1] : colors.warning[1], growth > 0 ? colors.secondary[2] : colors.warning[2]);
      doc.text(display(growth, 1, 1, '', '%'), margin + (colWidth * 3) + 2, yPos + 5);

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(display(country.inflation, 1, 1, '', '%'), margin + (colWidth * 4) + 2, yPos + 5);
      doc.text(display(country.unemployment, 1, 1, '', '%'), margin + (colWidth * 5) + 2, yPos + 5);

      yPos += 7;
    });

    yPos += 10;

    const topCountries = economicData.filter(country => Number.isFinite(numeric(country.gdp))).sort((a, b) => numeric(b.gdp) - numeric(a.gdp)).slice(0, 3);

    doc.setFontSize(14);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Markets by GDP', margin, yPos);

    yPos += 8;

    if (!topCountries.length) doc.text('GDP chart unavailable: no supplied GDP observations.', margin, yPos + 5);
    const maxGdp = Math.max(1, ...topCountries.map(country => numeric(country.gdp)));

    topCountries.forEach((country, index) => {
      const barWidth = (numeric(country.gdp) / maxGdp) * (contentWidth - 60);

      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.7 - (index * 0.15));
      doc.roundedRect(margin + 45, yPos, barWidth, 12, 1, 1, 'F');

      doc.setFontSize(10);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(country.country || 'N/A', margin, yPos + 8);

      doc.setFontSize(9);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text(display(country.gdp, 1, 1e12, '$', 'T'), margin + 48, yPos + 8);

      yPos += 16;
    });

    yPos += 5;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(REFERENCE_NOTICE, margin, yPos, { maxWidth: contentWidth });

    return yPos + 5;
  }

  private async addMarketReferenceData(doc: jsPDF, yPos: number, stockIndices: ReportStockData[], currencies: ReportCurrencyData[], colors: ReportColors, margin: number, contentWidth: number): Promise<number> {
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2], 0.1);
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('MARKET REFERENCE DATA - UNVERIFIED', margin + 3, yPos + 6);

    doc.setFontSize(8);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Only supplied observations; missing quotes and FX rates are unavailable.', margin + 3, yPos + 10);

    yPos += 18;

    doc.setFontSize(12);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Stock Market Indices', margin, yPos);

    yPos += 8;

    if (!stockIndices.length) doc.text('Stock quotes unavailable: no supplied observations.', margin, yPos + 5);
    const stockBoxWidth = (contentWidth - 10) / 3;
    let stockX = margin;

    stockIndices.slice(0, 6).forEach((stock, index) => {
      if (index > 0 && index % 3 === 0) {
        yPos += 32;
        stockX = margin;
      }

      const isPositive = numeric(stock.changePercent) >= 0;

      doc.setFillColor(isPositive ? colors.secondary[0] : colors.warning[0], isPositive ? colors.secondary[1] : colors.warning[1], isPositive ? colors.secondary[2] : colors.warning[2], 0.1);
      doc.roundedRect(stockX, yPos, stockBoxWidth - 2, 28, 2, 2, 'F');

      doc.setDrawColor(isPositive ? colors.secondary[0] : colors.warning[0], isPositive ? colors.secondary[1] : colors.warning[1], isPositive ? colors.secondary[2] : colors.warning[2]);
      doc.setLineWidth(0.5);
      doc.line(stockX, yPos, stockX + (stockBoxWidth - 2), yPos);

      doc.setFontSize(10);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(stock.symbol || 'N/A', stockX + 2, yPos + 7);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.text(stock.name || 'Market Index', stockX + 2, yPos + 12);

      doc.setFontSize(13);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(display(stock.price, 2), stockX + 2, yPos + 20);

      doc.setFontSize(9);
      doc.setTextColor(isPositive ? colors.secondary[0] : colors.warning[0], isPositive ? colors.secondary[1] : colors.warning[1], isPositive ? colors.secondary[2] : colors.warning[2]);
      doc.text(display(stock.changePercent, 2, 1, isPositive ? '+' : '', '%'), stockX + 2, yPos + 26);

      stockX += stockBoxWidth + 2;
    });

    yPos += 38;

    doc.setFontSize(12);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Currency Exchange Rates (vs USD)', margin, yPos);

    yPos += 8;

    if (!currencies.length) doc.text('FX rates unavailable: no supplied observations.', margin, yPos + 5);
    currencies.slice(0, 6).forEach((currency, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, contentWidth, 8, 'F');
      }

      const isPositive = numeric(currency.changePercent) >= 0;

      doc.setFontSize(9);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(currency.pair || 'N/A', margin + 2, yPos + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(display(currency.rate, 4), margin + 40, yPos + 5);

      doc.setTextColor(isPositive ? colors.secondary[0] : colors.warning[0], isPositive ? colors.secondary[1] : colors.warning[1], isPositive ? colors.secondary[2] : colors.warning[2]);
      doc.text(display(currency.changePercent, 2, 1, isPositive ? '+' : '', '%'), margin + 70, yPos + 5);

      yPos += 8;
    });

    return yPos + 5;
  }

  private async addCountryAnalysis(doc: jsPDF, yPos: number, economicData: ReportEconomicData[], colors: ReportColors, margin: number, contentWidth: number, pageHeight: number): Promise<number> {
    const topCountries = economicData.filter(country => Number.isFinite(numeric(country.gdp))).sort((a, b) => numeric(b.gdp) - numeric(a.gdp)).slice(0, 3);

    topCountries.forEach((country, index) => {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = this.addPageHeader(doc, 'Country Deep Dive (cont.)', 5, colors, doc.internal.pageSize.getWidth(), margin);
      }

      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.1);
      doc.roundedRect(margin, yPos, contentWidth, 60, 2, 2, 'F');

      doc.setFontSize(14);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${country.country || 'Country'}`, margin + 3, yPos + 8);

      doc.setFontSize(9);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'normal');

      const metrics = [
        { label: 'GDP', value: display(country.gdp, 2, 1e12, '$', 'T') },
        { label: 'Population', value: display(country.population, 1, 1e6, '', 'M') },
        { label: 'GDP Growth', value: display(country.gdpGrowth, 1, 1, '', '%') },
        { label: 'GDP per Capita', value: display(country.gdpPerCapita, 0, 1, '$') },
        { label: 'Inflation', value: display(country.inflation, 1, 1, '', '%') },
        { label: 'Interest Rate', value: display(country.interestRate, 2, 1, '', '%') }
      ];

      let metricY = yPos + 16;
      let metricX = margin + 3;

      metrics.forEach((metric, idx) => {
        if (idx > 0 && idx % 3 === 0) {
          metricY += 10;
          metricX = margin + 3;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        doc.text(`${metric.label}:`, metricX, metricY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text(metric.value, metricX + 25, metricY);

        metricX += 60;
      });

      yPos += 65;
    });

    return yPos;
  }

  private async addDigitalEconomy(doc: jsPDF, yPos: number, economicData: ReportEconomicData[], colors: ReportColors, margin: number, contentWidth: number): Promise<number> {
    doc.setFontSize(12);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Digital Adoption Metrics', margin, yPos);

    yPos += 10;

    const digitalMetrics = economicData.filter(country => Number.isFinite(numeric(country.internetUsers))).map(country => ({
      country: country.country,
      internetUsers: numeric(country.internetUsers) / 1e6,
      population: numeric(country.population) / 1e6
    })).sort((a, b) => b.internetUsers - a.internetUsers);

    if (!digitalMetrics.length) doc.text('Internet chart unavailable: no supplied observations.', margin, yPos + 5);
    const maxUsers = Math.max(1, ...digitalMetrics.map(metric => metric.internetUsers));

    digitalMetrics.slice(0, 6).forEach((metric, index) => {
      const barWidth = (metric.internetUsers / maxUsers) * (contentWidth - 60);
      const penetration = display(ratio(metric.internetUsers, metric.population) * 100, 0, 1, '', '%');

      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2], 0.6 - (index * 0.08));
      doc.roundedRect(margin + 40, yPos, barWidth, 10, 1, 1, 'F');

      doc.setFontSize(9);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.country, margin, yPos + 7);

      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text(`${metric.internetUsers.toFixed(1)}M (${penetration})`, margin + 43, yPos + 7);

      yPos += 14;
    });

    yPos += 10;

    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2], 0.1);
    doc.roundedRect(margin, yPos, contentWidth, 40, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Illustrative Digital Discussion Topics', margin + 3, yPos + 8);

    doc.setFontSize(9);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFont('helvetica', 'normal');

    const insights = [
      '• Research device preferences for the target customer segment',
      '• Validate the relevant e-commerce market size and observation year',
      '• Check dated payment adoption and licensing evidence',
      '• Evaluate potential platform partners through primary research'
    ];

    let insightY = yPos + 16;
    insights.forEach(insight => {
      doc.text(insight, margin + 3, insightY);
      insightY += 6;
    });

    return yPos + 45;
  }

  private async addRecommendations(doc: jsPDF, yPos: number, colors: ReportColors, margin: number, contentWidth: number, pageHeight: number): Promise<number> {
    const phases = [
      {
        phase: 'Phase 1: Foundation',
        duration: '0-6 Months',
        color: colors.primary,
        items: [
          'Establish presence in primary market (Indonesia or Singapore)',
          'Secure regulatory approvals and local partnerships',
          'Conduct detailed market research and consumer studies',
          'Build local team with regional expertise'
        ]
      },
      {
        phase: 'Phase 2: Expansion',
        duration: '6-18 Months',
        color: colors.secondary,
        items: [
          'Launch operations in Vietnam and Philippines',
          'Scale primary market beyond initial region',
          'Develop localized products and services',
          'Establish regional supply chain network'
        ]
      },
      {
        phase: 'Phase 3: Optimization',
        duration: '18-36 Months',
        color: colors.accent,
        items: [
          'Enter Thailand and Malaysia markets',
          'Establish Singapore regional headquarters',
          'Achieve profitability in all primary markets',
          'Explore strategic acquisition opportunities'
        ]
      }
    ];

    phases.forEach((phase) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = this.addPageHeader(doc, 'Illustrative Strategy (cont.)', 7, colors, doc.internal.pageSize.getWidth(), margin);
      }

      doc.setFillColor(phase.color[0], phase.color[1], phase.color[2], 0.1);
      doc.roundedRect(margin, yPos, contentWidth, 45, 2, 2, 'F');

      doc.setDrawColor(phase.color[0], phase.color[1], phase.color[2]);
      doc.setLineWidth(2);
      doc.line(margin, yPos, margin, yPos + 45);

      doc.setFillColor(phase.color[0], phase.color[1], phase.color[2]);
      doc.circle(margin + 8, yPos + 8, 4, 'F');

      doc.setFontSize(12);
      doc.setTextColor(phase.color[0], phase.color[1], phase.color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(phase.phase, margin + 15, yPos + 10);

      doc.setFontSize(8);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(phase.duration, contentWidth + margin - 30, yPos + 10, { align: 'right' });

      doc.setFontSize(9);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);

      let itemY = yPos + 18;
      phase.items.forEach(item => {
        doc.text(`• ${item}`, margin + 8, itemY);
        itemY += 7;
      });

      yPos += 50;
    });

    yPos += 5;

    doc.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2], 0.1);
    doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Illustrative Investment Assumptions - Unverified', margin + 3, yPos + 8);

    doc.setFontSize(9);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Example investment assumption: $50-75M over 3 years', margin + 3, yPos + 15);
    doc.text('Example ROI assumption: 25-30% by Year 3; not a forecast', margin + 3, yPos + 20);

    return yPos + 30;
  }

  private addProvenance(doc: jsPDF, economicData: ReportEconomicData[], stockIndices: ReportStockData[], currencies: ReportCurrencyData[], colors: ReportColors, pageWidth: number, margin: number, contentWidth: number): void {
    doc.addPage();
    let y = this.addPageHeader(doc, 'Data Provenance and Limits', doc.getNumberOfPages(), colors, pageWidth, margin);
    const lines = [
      `generatedAt: ${new Date().toISOString()} (export time only)`,
      'observedAt: only explicitly supplied observation periods below. Retrieval/storage times are not observation dates.',
      'Coverage: totals require complete metrics for supplied rows only. Requested markets with no observations may be absent.',
      'Static strategy and financial scenarios: src/services/enhancedPDFService.ts. Illustrative examples, not verified forecasts or recommendations.',
      ...economicData.map(record => `Economics: ${record.country}; source: ${record.source || 'Unavailable'}; observation periods: ${Object.entries(record.metricEvidence || {}).map(([field, evidence]) => `${field}=${evidence.observationPeriod || 'Unavailable'} [${evidence.status}; source: ${evidence.source || 'Unavailable'}; retrievedAt: ${evidence.retrievedAt || 'Unavailable'}]`).join('; ') || 'Unavailable'}`),
      ...stockIndices.map(record => `Stock: ${record.symbol}; source: ${record.source || 'Unavailable'}; status: ${record.sourceStatus || 'unverified'}; observedAt: ${record.observedAt || 'Unavailable'}; storedAt/retrievedAt: ${record.storedAt || record.retrievedAt || 'Unavailable'}`),
      ...currencies.map(record => `FX: ${record.pair}; source: ${record.source || 'Unavailable'}; status: ${record.sourceStatus || 'unverified'}; observedAt: ${record.observedAt || 'Unavailable'}; retrievedAt: ${record.retrievedAt || 'Unavailable'}`)
    ];
    if (!economicData.length) lines.push('Economic observations: Unavailable for requested markets.');
    if (!stockIndices.length) lines.push('Stock quotes: Unavailable.');
    if (!currencies.length) lines.push('FX rates: Unavailable.');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    for (const item of lines) {
      for (const line of doc.splitTextToSize(item, contentWidth)) {
        if (y > 267) { doc.addPage(); y = this.addPageHeader(doc, 'Data Provenance (cont.)', doc.getNumberOfPages(), colors, pageWidth, margin); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40); }
        doc.text(line, margin, y); y += 5;
      }
      y += 3;
    }
  }

  private addFooter(doc: jsPDF, pageHeight: number, pageWidth: number, margin: number, colors: ReportColors): void {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

      doc.setFontSize(7);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(REFERENCE_NOTICE, margin, pageHeight - 8);
      doc.text('Static examples: src/services/enhancedPDFService.ts; supplied data: see Data Provenance.', margin, pageHeight - 4);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
    }
  }
}
