import pptxgen from 'pptxgenjs';
import { UnifiedDataService } from './unifiedDataService';
import type { UnifiedEconomicData } from './unifiedDataService';
import { MarketDataService } from './marketDataService';
import type { CurrencyRate, MarketData } from './marketDataService';

type EconomicReference = UnifiedEconomicData;
type StockReference = MarketData;
type CurrencyReference = CurrencyRate;

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

export interface PPTXReportData {
  selectedCountries: string[];
  selectedCities: string[];
}

export class EnhancedPPTXService {
  private static instance: EnhancedPPTXService;
  private unifiedDataService: UnifiedDataService;
  private marketDataService: MarketDataService;

  private constructor() {
    this.unifiedDataService = UnifiedDataService.getInstance();
    this.marketDataService = MarketDataService.getInstance();
  }

  public static getInstance(): EnhancedPPTXService {
    if (!EnhancedPPTXService.instance) {
      EnhancedPPTXService.instance = new EnhancedPPTXService();
    }
    return EnhancedPPTXService.instance;
  }

  async generateEnhancedPPTX(data: PPTXReportData): Promise<void> {
    try {
      const pres = new pptxgen();

      pres.author = 'FLOW Market Intelligence';
      pres.company = 'FLOW';
      pres.subject = 'Southeast Asian Market Analysis';
      pres.title = 'Market Entry Strategy Presentation';

      pres.layout = 'LAYOUT_WIDE';

      pres.defineSlideMaster({
        title: 'FLOW_MASTER',
        background: { color: '0F172A' },
        objects: [
          {
            rect: {
              x: 0,
              y: 0,
              w: '100%',
              h: 0.3,
              fill: { color: '3B82F6' }
            }
          },
          {
            text: {
              text: 'FLOW',
              options: {
                x: 0.5,
                y: 0.05,
                w: 2,
                h: 0.2,
                fontSize: 14,
                bold: true,
                color: 'FFFFFF',
                fontFace: 'Arial'
              }
            }
          },
          {
            text: {
              text: 'Unverified reference. Static examples: src/services/enhancedPPTXService.ts. Supplied data: see Data Provenance.',
              options: {
                x: 0.5,
                y: 7.1,
                w: 12,
                h: 0.25,
                fontSize: 9,
                color: '94A3B8',
                fontFace: 'Arial'
              }
            }
          }
        ],
        slideNumber: { x: 12.5, y: 0.05, color: 'FFFFFF', fontFace: 'Arial', fontSize: 10 }
      });

      let economicData: EconomicReference[] = [];
      let stockIndices: StockReference[] = [];
      let currencies: CurrencyReference[] = [];

      try {
        economicData = await this.unifiedDataService.getUnifiedEconomicData(data.selectedCountries);
        economicData = sourced(economicData || [], ['gdp', 'gdpGrowth', 'inflation', 'unemployment', 'population', 'gdpPerCapita', 'internetUsers', 'exchangeRate', 'interestRate']);
      } catch (error) {
        console.error('Economic data unavailable for export:', error);
        economicData = [];
      }

      try {
        stockIndices = await this.marketDataService.getStockData(['JCI', 'SET', 'KLSE', 'PSEI', 'VNI', 'STI']);
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


      this.addTitleSlide(pres, data);
      this.addExecutiveSummary(pres, economicData);
      this.addMarketOpportunity(pres, economicData);
      this.addLiveMarketData(pres, stockIndices, currencies);
      this.addCountryAnalysis(pres, economicData);
      this.addDigitalEconomy(pres, economicData);
      this.addCompetitiveLandscape(pres);
      this.addInvestmentStrategy(pres);
      this.addRoadmap(pres);
      this.addCallToAction(pres);
      this.addProvenance(pres, economicData, stockIndices, currencies);

      const fileName = `SEA-Market-Strategy-${new Date().toISOString().split('T')[0]}.pptx`;
      await pres.writeFile({ fileName });
    } catch (error) {
      console.error('Critical error generating PowerPoint:', error);
      throw new Error('Failed to generate PowerPoint presentation. Please try again or contact support.');
    }
  }

  private addTitleSlide(pres: pptxgen, data: PPTXReportData): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });

    slide.background = { color: '0F172A' };

    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.8,
      fill: { color: '3B82F6' }
    });

    for (let i = 0; i < 10; i++) {
      slide.addShape(pres.ShapeType.ellipse, {
        x: 11 - (i * 0.15),
        y: 1.5 - (i * 0.1),
        w: 2 + (i * 0.2),
        h: 2 + (i * 0.2),
        fill: { color: '3B82F6', transparency: 95 - (i * 3) }
      });
    }

    slide.addText('FLOW', {
      x: 1,
      y: 1.5,
      w: 4,
      h: 0.6,
      fontSize: 54,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    slide.addText('Market Intelligence Platform', {
      x: 1,
      y: 2.2,
      w: 6,
      h: 0.3,
      fontSize: 16,
      color: 'E2E8F0',
      fontFace: 'Arial'
    });

    slide.addText('Southeast Asian\nMarket Entry Strategy', {
      x: 1,
      y: 3,
      w: 8,
      h: 1.2,
      fontSize: 36,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
      valign: 'top'
    });

    const selectedMarketsText = data.selectedCountries.length > 0
      ? data.selectedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ')
      : 'All Southeast Asian Markets';

    slide.addText(`Focus Markets: ${selectedMarketsText}`, {
      x: 1,
      y: 4.5,
      w: 10,
      h: 0.4,
      fontSize: 16,
      color: '10B981',
      fontFace: 'Arial',
      bold: true
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 1,
      y: 5,
      w: 8,
      h: 0.05,
      fill: { color: '3B82F6' }
    });

    const date = new Date();
    slide.addText(`Generated: ${date.toLocaleDateString()} | ${date.toLocaleTimeString()}`, {
      x: 1,
      y: 5.3,
      w: 8,
      h: 0.3,
      fontSize: 12,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    const metrics = [
      { label: 'Material', value: 'Reference', icon: '📊' },
      { label: 'Scope', value: 'National', icon: '🌏' },
      { label: 'Observation dates', value: 'Unknown', icon: '⚡' },
      { label: 'Applicability', value: 'Unverified', icon: '📈' }
    ];

    metrics.forEach((metric, index) => {
      const x = 1 + (index * 2.3);
      slide.addShape(pres.ShapeType.rect, {
        x,
        y: 6,
        w: 2,
        h: 0.8,
        fill: { color: '1E293B', transparency: 50 },
        line: { color: '3B82F6', width: 1 }
      });

      slide.addText(metric.icon, {
        x,
        y: 6.1,
        w: 2,
        h: 0.3,
        fontSize: 18,
        align: 'center'
      });

      slide.addText(metric.label, {
        x,
        y: 6.4,
        w: 2,
        h: 0.2,
        fontSize: 10,
        color: '94A3B8',
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(metric.value, {
        x,
        y: 6.6,
        w: 2,
        h: 0.2,
        fontSize: 12,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial'
      });
    });
  }

  private addExecutiveSummary(pres: pptxgen, economicData: EconomicReference[]): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('Executive Summary', {
      x: 0.5,
      y: 0.8,
      w: 8,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '3B82F6',
      fontFace: 'Arial'
    });

    const totalGdp = completeTotal(economicData.map(country => country.gdp));
    const totalPopulation = completeTotal(economicData.map(country => country.population));
    const avgGrowth = completeAverage(economicData.map(country => country.gdpGrowth));
    const totalInternetUsers = completeTotal(economicData.map(country => country.internetUsers));

    const metrics = [
      { label: 'Combined GDP', value: display(totalGdp, 2, 1e12, '$', 'T'), change: 'Reference', color: '3B82F6' },
      { label: 'Total Population', value: display(totalPopulation, 0, 1e6, '', 'M'), change: 'Reference', color: '10B981' },
      { label: 'Avg Growth', value: display(avgGrowth, 1, 1, '', '%'), change: 'Reference', color: '8B5CF6' },
      { label: 'Digital Users', value: display(totalInternetUsers, 0, 1e6, '', 'M'), change: 'Reference', color: 'F59E0B' }
    ];

    metrics.forEach((metric, index) => {
      const x = 0.5 + (index * 3.2);
      slide.addShape(pres.ShapeType.rect, {
        x,
        y: 1.8,
        w: 3,
        h: 1.2,
        fill: { color: metric.color, transparency: 85 },
        line: { color: metric.color, width: 2 }
      });

      slide.addText(metric.label, {
        x,
        y: 1.9,
        w: 3,
        h: 0.3,
        fontSize: 11,
        color: '94A3B8',
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(metric.value, {
        x,
        y: 2.3,
        w: 3,
        h: 0.4,
        fontSize: 24,
        bold: true,
        color: metric.color,
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(metric.change, {
        x,
        y: 2.75,
        w: 3,
        h: 0.2,
        fontSize: 12,
        color: '10B981',
        align: 'center',
        fontFace: 'Arial'
      });
    });

    slide.addText('Illustrative Discussion Topics', {
      x: 0.5,
      y: 3.3,
      w: 12,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    const insights = [
      '• Research market size and demand using dated primary sources',
      '• Test digital channels and payment methods for the specific business',
      '• Compare verified growth and costs before selecting entry markets',
      '• Check current country and sector rules with qualified local advisers'
    ];

    insights.forEach((insight, index) => {
      slide.addText(insight, {
        x: 0.5,
        y: 3.8 + (index * 0.35),
        w: 12,
        h: 0.3,
        fontSize: 13,
        color: 'E2E8F0',
        fontFace: 'Arial'
      });
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 0.5,
      y: 5.5,
      w: 12,
      h: 0.9,
      fill: { color: '10B981', transparency: 85 },
      line: { color: '10B981', width: 3 }
    });

    slide.addText('ILLUSTRATIVE STRATEGY: VERIFY BEFORE MARKET ENTRY', {
      x: 0.7,
      y: 5.6,
      w: 11.6,
      h: 0.3,
      fontSize: 16,
      bold: true,
      color: '10B981',
      fontFace: 'Arial'
    });

    slide.addText('Strategic phased approach: Indonesia first (scale), Vietnam/Philippines (growth), Singapore (premium hub)', {
      x: 0.7,
      y: 5.95,
      w: 11.6,
      h: 0.35,
      fontSize: 12,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });
  }

  private addMarketOpportunity(pres: pptxgen, economicData: EconomicReference[]): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('Market Reference Comparison', {
      x: 0.5,
      y: 0.8,
      w: 8,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '3B82F6',
      fontFace: 'Arial'
    });

    const chartData = economicData.filter(country => [country.gdp, country.gdpGrowth, country.internetUsers, country.population].every(value => Number.isFinite(numeric(value))) && numeric(country.population) > 0).slice(0, 6).map(country => ({
      name: country.country || 'N/A',
      labels: ['GDP (USD 10B)', 'Growth (x10)', 'Internet (%)', 'Population (10M)'],
      values: [
        (numeric(country.gdp) / 1e12) * 100,
        numeric(country.gdpGrowth) * 10,
        ratio(country.internetUsers, country.population) * 100,
        (numeric(country.population) / 1e9) * 100
      ]
    }));

    if (!chartData[0]?.values.length) slide.addText('Chart unavailable: required observations are missing.', { x: 0.5, y: 2, w: 6, h: 1, fontSize: 18, color: 'FFFFFF' });
    else slide.addChart(pres.ChartType.bar, chartData, {
      x: 0.5,
      y: 1.8,
      w: 12,
      h: 4,
      barDir: 'bar',
      chartColors: ['3B82F6', '10B981', '8B5CF6', 'F59E0B'],
      showLegend: true,
      legendPos: 'b',
      showTitle: false,
      catAxisLabelColor: 'FFFFFF',
      valAxisLabelColor: 'FFFFFF',
      legendColor: 'FFFFFF',
      plotArea: { fill: { color: '1E293B' }, border: { pt: 1, color: '3B82F6' } }
    });

    slide.addText('Scaled reference indicators use different units; they do not form an opportunity score.', {
      x: 0.5,
      y: 6.2,
      w: 12,
      h: 0.3,
      fontSize: 10,
      color: '94A3B8',
      italic: true,
      fontFace: 'Arial'
    });
  }

  private addLiveMarketData(pres: pptxgen, stockIndices: StockReference[], currencies: CurrencyReference[]): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addShape(pres.ShapeType.rect, {
      x: 0.5,
      y: 0.8,
      w: 12,
      h: 0.5,
      fill: { color: '10B981', transparency: 80 }
    });

    slide.addText('MARKET REFERENCE SNAPSHOT', {
      x: 0.7,
      y: 0.9,
      w: 6,
      h: 0.3,
      fontSize: 24,
      bold: true,
      color: '10B981',
      fontFace: 'Arial'
    });

    slide.addText('Data dates unverified', {
      x: 10,
      y: 0.95,
      w: 2.3,
      h: 0.2,
      fontSize: 11,
      color: 'FFFFFF',
      align: 'right',
      fontFace: 'Arial'
    });

    slide.addText('Stock Market Indices', {
      x: 0.5,
      y: 1.6,
      w: 6,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    if (!stockIndices.length) slide.addText('Stock quotes unavailable: no supplied observations.', { x: 0.5, y: 2.2, w: 12, h: 0.5, fontSize: 18, color: 'FFFFFF' });
    stockIndices.slice(0, 6).forEach((stock, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = 0.5 + (col * 4.2);
      const y = 2.2 + (row * 1.2);
      const isPositive = numeric(stock.changePercent) >= 0;
      const color = isPositive ? '10B981' : 'EF4444';

      slide.addShape(pres.ShapeType.rect, {
        x,
        y,
        w: 4,
        h: 1,
        fill: { color: '1E293B', transparency: 50 },
        line: { color, width: 2 }
      });

      slide.addText(stock.symbol || 'N/A', {
        x: x + 0.1,
        y: y + 0.1,
        w: 3.8,
        h: 0.25,
        fontSize: 14,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });

      slide.addText(stock.name || 'Market Index', {
        x: x + 0.1,
        y: y + 0.35,
        w: 3.8,
        h: 0.2,
        fontSize: 10,
        color: '94A3B8',
        fontFace: 'Arial'
      });

      slide.addText(display(stock.price, 2), {
        x: x + 0.1,
        y: y + 0.58,
        w: 2,
        h: 0.3,
        fontSize: 16,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });

      slide.addText(display(stock.changePercent, 2, 1, isPositive ? '+' : '', '%'), {
        x: x + 2.4,
        y: y + 0.65,
        w: 1.5,
        h: 0.25,
        fontSize: 13,
        bold: true,
        color,
        align: 'right',
        fontFace: 'Arial'
      });
    });

    slide.addText('Currency Exchange Rates (vs USD)', {
      x: 0.5,
      y: 4.7,
      w: 8,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    const currencyRows: pptxgen.TableRow[] = [
      ['Pair', 'Rate', 'Change', 'Change %', 'Trend'].map(text => ({ text }))
    ];

    currencies.slice(0, 6).forEach(currency => {
      const isPositive = numeric(currency.changePercent) >= 0;
      currencyRows.push([
        currency.pair || 'N/A',
        display(currency.rate, 4),
        display(currency.change, 4),
        display(currency.changePercent, 2, 1, isPositive ? '+' : '', '%'),
        !Number.isFinite(numeric(currency.changePercent)) ? 'Unavailable' : numeric(currency.changePercent) === 0 ? 'No change' : isPositive ? 'Increase' : 'Decrease'
      ].map(text => ({ text })));
    });

    if (!currencies.length) currencyRows.push([{ text: 'FX rates unavailable: no supplied observations.' }]);
    slide.addTable(currencyRows, {
      x: 0.5,
      y: 5.2,
      w: 12,
      h: 1.3,
      fontSize: 11,
      color: 'FFFFFF',
      fill: { color: '1E293B' },
      border: { pt: 1, color: '3B82F6' },
      fontFace: 'Arial'
    });
  }

  private addCountryAnalysis(pres: pptxgen, economicData: EconomicReference[]): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('Country Deep Dive', {
      x: 0.5,
      y: 0.8,
      w: 8,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '3B82F6',
      fontFace: 'Arial'
    });

    const topCountries = economicData.filter(country => Number.isFinite(numeric(country.gdp))).sort((a, b) => numeric(b.gdp) - numeric(a.gdp)).slice(0, 3);

    topCountries.forEach((country, index) => {
      const y = 1.8 + (index * 1.6);

      slide.addShape(pres.ShapeType.rect, {
        x: 0.5,
        y,
        w: 12,
        h: 1.4,
        fill: { color: '1E293B', transparency: 50 },
        line: { color: '3B82F6', width: 2 }
      });

      slide.addText(`${index + 1}. ${country.country || 'Country'}`, {
        x: 0.7,
        y: y + 0.1,
        w: 6,
        h: 0.3,
        fontSize: 18,
        bold: true,
        color: '3B82F6',
        fontFace: 'Arial'
      });

      const metrics = [
        { label: 'GDP', value: display(country.gdp, 2, 1e12, '$', 'T') },
        { label: 'Population', value: display(country.population, 0, 1e6, '', 'M') },
        { label: 'Growth', value: display(country.gdpGrowth, 1, 1, '', '%') },
        { label: 'GDP/Capita', value: display(country.gdpPerCapita, 0, 1, '$') },
        { label: 'Inflation', value: display(country.inflation, 1, 1, '', '%') },
        { label: 'Interest', value: display(country.interestRate, 2, 1, '', '%') }
      ];

      metrics.forEach((metric, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const mx = 0.7 + (col * 4);
        const my = y + 0.5 + (row * 0.4);

        slide.addText(`${metric.label}: `, {
          x: mx,
          y: my,
          w: 1.2,
          h: 0.25,
          fontSize: 11,
          color: '94A3B8',
          fontFace: 'Arial'
        });

        slide.addText(metric.value, {
          x: mx + 1.2,
          y: my,
          w: 2.5,
          h: 0.25,
          fontSize: 11,
          bold: true,
          color: 'FFFFFF',
          fontFace: 'Arial'
        });
      });
    });
  }

  private addDigitalEconomy(pres: pptxgen, economicData: EconomicReference[]): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('Digital Economy Landscape', {
      x: 0.5,
      y: 0.8,
      w: 8,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '8B5CF6',
      fontFace: 'Arial'
    });

    const countries = economicData.filter(country => Number.isFinite(ratio(country.internetUsers, country.population))).slice(0, 6);
    const chartData = [{
      name: 'Internet penetration',
      labels: countries.map(country => country.country || 'N/A'),
      values: countries.map(country => ratio(country.internetUsers, country.population) * 100)
    }];

    if (!chartData[0]?.values.length) slide.addText('Chart unavailable: required observations are missing.', { x: 0.5, y: 2, w: 6, h: 1, fontSize: 18, color: 'FFFFFF' });
    else slide.addChart(pres.ChartType.bar, chartData, {
      x: 0.5,
      y: 1.8,
      w: 6,
      h: 4,
      barDir: 'bar',
      chartColors: ['8B5CF6'],
      showLegend: false,
      showTitle: false,
      valAxisMaxVal: 100,
      catAxisLabelColor: 'FFFFFF',
      valAxisLabelColor: 'FFFFFF',
      plotArea: { fill: { color: '1E293B' }, border: { pt: 1, color: '8B5CF6' } }
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 7,
      y: 1.8,
      w: 5.5,
      h: 4,
      fill: { color: '8B5CF6', transparency: 85 }
    });

    slide.addText('Illustrative Digital Discussion Topics', {
      x: 7.3,
      y: 2,
      w: 5,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: '8B5CF6',
      fontFace: 'Arial'
    });

    const insights = [
      '• Research customer device preferences',
      '• Validate e-commerce size and dates',
      '• Check payment adoption evidence',
      '• Evaluate platform partnerships',
      '• Test social commerce demand',
      '• Verify network and device coverage'
    ];

    insights.forEach((insight, index) => {
      slide.addText(insight, {
        x: 7.3,
        y: 2.6 + (index * 0.45),
        w: 5,
        h: 0.3,
        fontSize: 13,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });
    });

    slide.addText('Internet Penetration Rate (%)', {
      x: 0.5,
      y: 6.2,
      w: 6,
      h: 0.3,
      fontSize: 11,
      color: '94A3B8',
      italic: true,
      align: 'center',
      fontFace: 'Arial'
    });
  }

  private addCompetitiveLandscape(pres: pptxgen): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('Illustrative Competitor Examples', {
      x: 0.5,
      y: 0.8,
      w: 8,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: 'F59E0B',
      fontFace: 'Arial'
    });

    const tableData: pptxgen.TableRow[] = [
      ['Sector', 'Example Company', 'Example Share %', 'Assumed Advantage', 'Example Opportunity'],
      ['E-commerce', 'Shopee', '68%', 'Scale + Gaming', 'Premium segment'],
      ['Ride-hailing', 'Grab', '81%', 'Super app model', 'B2B services'],
      ['Food Delivery', 'Grab Food', '52%', 'Integrated platform', 'Cloud kitchens'],
      ['Fintech', 'GrabPay', '38%', 'User base', 'SME lending'],
      ['Logistics', 'J&T Express', '32%', 'Regional network', 'Cross-border'],
      ['Cloud', 'AWS', '45%', 'Global scale', 'Local compliance']
    ].map(row => row.map(text => ({ text })));

    slide.addTable(tableData, {
      x: 0.5,
      y: 1.8,
      w: 12,
      h: 4,
      fontSize: 11,
      color: 'FFFFFF',
      fill: { color: '1E293B' },
      border: { pt: 1, color: 'F59E0B' },
      fontFace: 'Arial',
      colW: [2.2, 2.2, 1.5, 3, 3.1]
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 0.5,
      y: 6.1,
      w: 12,
      h: 0.6,
      fill: { color: 'F59E0B', transparency: 85 }
    });

    slide.addText('Strategic Positioning: Differentiate through superior UX, local adaptation, and vertical integration', {
      x: 0.7,
      y: 6.25,
      w: 11.6,
      h: 0.3,
      fontSize: 13,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });
  }

  private addInvestmentStrategy(pres: pptxgen): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('Illustrative Investment Strategy', {
      x: 0.5,
      y: 0.8,
      w: 10,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '10B981',
      fontFace: 'Arial'
    });

    const phases = [
      {
        phase: 'Phase 1: Foundation',
        duration: '0-6 Months',
        investment: '$10M',
        color: '3B82F6',
        items: ['Market research & setup', 'Regulatory approvals', 'Local partnerships', 'Team building']
      },
      {
        phase: 'Phase 2: Expansion',
        duration: '6-18 Months',
        investment: '$25M',
        color: '10B981',
        items: ['Multi-market launch', 'Product localization', 'Marketing campaigns', 'Operations scale']
      },
      {
        phase: 'Phase 3: Scale',
        duration: '18-36 Months',
        investment: '$35M',
        color: '8B5CF6',
        items: ['Regional expansion', 'Market leadership', 'Profitability focus', 'Strategic M&A']
      }
    ];

    phases.forEach((phase, index) => {
      const x = 0.5 + (index * 4.2);

      slide.addShape(pres.ShapeType.rect, {
        x,
        y: 1.8,
        w: 4,
        h: 3.5,
        fill: { color: phase.color, transparency: 85 },
        line: { color: phase.color, width: 3 }
      });

      slide.addShape(pres.ShapeType.ellipse, {
        x: x + 1.7,
        y: 1.6,
        w: 0.6,
        h: 0.6,
        fill: { color: phase.color }
      });

      slide.addText(`${index + 1}`, {
        x: x + 1.7,
        y: 1.75,
        w: 0.6,
        h: 0.3,
        fontSize: 20,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(phase.phase, {
        x: x + 0.2,
        y: 2.4,
        w: 3.6,
        h: 0.3,
        fontSize: 14,
        bold: true,
        color: phase.color,
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(phase.duration, {
        x: x + 0.2,
        y: 2.75,
        w: 3.6,
        h: 0.25,
        fontSize: 11,
        color: '94A3B8',
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(phase.investment, {
        x: x + 0.2,
        y: 3.05,
        w: 3.6,
        h: 0.3,
        fontSize: 16,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial'
      });

      phase.items.forEach((item, idx) => {
        slide.addText(`• ${item}`, {
          x: x + 0.3,
          y: 3.5 + (idx * 0.35),
          w: 3.4,
          h: 0.3,
          fontSize: 10,
          color: 'E2E8F0',
          fontFace: 'Arial'
        });
      });
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 0.5,
      y: 5.6,
      w: 12,
      h: 0.9,
      fill: { color: '10B981', transparency: 85 }
    });

    slide.addText('Illustrative assumptions: $70M investment | 25-30% ROI by Year 3 | 18-24 month break-even', {
      x: 0.7,
      y: 5.8,
      w: 11.6,
      h: 0.25,
      fontSize: 14,
      bold: true,
      color: '10B981',
      align: 'center',
      fontFace: 'Arial'
    });

    slide.addText('Investment amounts and returns are unverified examples; build a business-specific financial model.', {
      x: 0.7,
      y: 6.1,
      w: 11.6,
      h: 0.25,
      fontSize: 12,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial'
    });
  }

  private addRoadmap(pres: pptxgen): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    slide.addText('12-Month Implementation Timeline', {
      x: 0.5,
      y: 0.8,
      w: 10,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: '3B82F6',
      fontFace: 'Arial'
    });

    const milestones = [
      { month: 'Month 1-2', title: 'Setup & Planning', items: ['Legal entity formation', 'Office setup', 'Initial hiring'] },
      { month: 'Month 3-4', title: 'Product Development', items: ['Platform localization', 'Payment integration', 'Beta testing'] },
      { month: 'Month 5-6', title: 'Market Launch', items: ['Soft launch', 'Marketing campaign', 'First 10K users'] },
      { month: 'Month 7-8', title: 'Growth Phase', items: ['Scale operations', 'Expand team', 'Second market entry'] },
      { month: 'Month 9-10', title: 'Optimization', items: ['Process improvement', 'Cost optimization', 'Feature expansion'] },
      { month: 'Month 11-12', title: 'Scale & Review', items: ['Regional expansion', 'Year 1 review', 'Year 2 planning'] }
    ];

    milestones.forEach((milestone, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 0.5 + (col * 6.3);
      const y = 1.8 + (row * 1.5);

      slide.addShape(pres.ShapeType.rect, {
        x,
        y,
        w: 6,
        h: 1.3,
        fill: { color: '1E293B', transparency: 50 },
        line: { color: '3B82F6', width: 2 }
      });

      slide.addText(milestone.month, {
        x: x + 0.2,
        y: y + 0.1,
        w: 5.6,
        h: 0.25,
        fontSize: 11,
        bold: true,
        color: '3B82F6',
        fontFace: 'Arial'
      });

      slide.addText(milestone.title, {
        x: x + 0.2,
        y: y + 0.4,
        w: 5.6,
        h: 0.25,
        fontSize: 13,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });

      milestone.items.forEach((item, idx) => {
        slide.addText(`• ${item}`, {
          x: x + 0.2,
          y: y + 0.7 + (idx * 0.25),
          w: 5.6,
          h: 0.2,
          fontSize: 10,
          color: 'E2E8F0',
          fontFace: 'Arial'
        });
      });
    });
  }

  private addCallToAction(pres: pptxgen): void {
    const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
    slide.background = { color: '0F172A' };

    for (let i = 0; i < 15; i++) {
      slide.addShape(pres.ShapeType.ellipse, {
        x: 6.5 - (i * 0.2),
        y: 3.5 - (i * 0.15),
        w: 3 + (i * 0.3),
        h: 3 + (i * 0.3),
        fill: { color: '10B981', transparency: 93 - (i * 2) }
      });
    }

    slide.addText('Ready to Transform\nYour Market Entry?', {
      x: 1,
      y: 2,
      w: 11.5,
      h: 1.2,
      fontSize: 42,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial'
    });

    slide.addText('Start your Southeast Asian expansion with confidence', {
      x: 1,
      y: 3.5,
      w: 11.5,
      h: 0.4,
      fontSize: 18,
      color: 'E2E8F0',
      align: 'center',
      fontFace: 'Arial'
    });

    const ctaBoxes = [
      { title: 'Expert Team', desc: 'Market analysts & data scientists', icon: '👥' },
      { title: 'Reference Data', desc: 'Verify sources and observation dates', icon: '📊' },
      { title: 'Fast Results', desc: 'Instant reports & insights', icon: '⚡' }
    ];

    ctaBoxes.forEach((box, index) => {
      const x = 1.5 + (index * 3.6);

      slide.addShape(pres.ShapeType.rect, {
        x,
        y: 4.3,
        w: 3.2,
        h: 1.2,
        fill: { color: '10B981', transparency: 80 },
        line: { color: '10B981', width: 2 }
      });

      slide.addText(box.icon, {
        x,
        y: 4.4,
        w: 3.2,
        h: 0.3,
        fontSize: 24,
        align: 'center'
      });

      slide.addText(box.title, {
        x,
        y: 4.85,
        w: 3.2,
        h: 0.3,
        fontSize: 14,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial'
      });

      slide.addText(box.desc, {
        x,
        y: 5.15,
        w: 3.2,
        h: 0.25,
        fontSize: 11,
        color: 'E2E8F0',
        align: 'center',
        fontFace: 'Arial'
      });
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 2,
      y: 6,
      w: 9.5,
      h: 0.7,
      fill: { color: '1E293B', transparency: 30 }
    });

    slide.addText('"Together, we\'re building data-driven market entry strategies\nthat unlock Southeast Asia\'s tremendous growth potential."', {
      x: 2.2,
      y: 6.1,
      w: 9.1,
      h: 0.5,
      fontSize: 12,
      italic: true,
      color: 'E2E8F0',
      align: 'center',
      fontFace: 'Arial'
    });
  }
  private addProvenance(pres: pptxgen, economicData: EconomicReference[], stockIndices: StockReference[], currencies: CurrencyReference[]): void {
    const records = [
      ...economicData.flatMap(record => [
        `Economics: ${record.country} | supplied source summary: ${record.source || 'Unavailable'}`,
        ...Object.entries(record.metricEvidence || {}).map(([field, evidence]) => `${record.country} / ${field} | ${evidence.status} | source: ${evidence.source || 'Unavailable'} | observation period: ${evidence.observationPeriod || 'Unavailable'} | retrievedAt: ${evidence.retrievedAt || 'Unavailable'}`)
      ]),
      ...stockIndices.map(record => `Stock: ${record.symbol} | source: ${record.source || 'Unavailable'} | status: ${record.sourceStatus || 'unverified'} | observedAt: ${record.observedAt || 'Unavailable'} | storedAt/retrievedAt: ${record.storedAt || record.retrievedAt || 'Unavailable'}`),
      ...currencies.map(record => `FX: ${record.pair} | source: ${record.source || 'Unavailable'} | status: ${record.sourceStatus || 'unverified'} | observedAt: ${record.observedAt || 'Unavailable'} | retrievedAt: ${record.retrievedAt || 'Unavailable'}`)
    ];
    if (!economicData.length) records.push('Economic observations: Unavailable for requested markets.');
    if (!stockIndices.length) records.push('Stock quotes: Unavailable.');
    if (!currencies.length) records.push('FX rates: Unavailable.');
    for (let offset = 0; offset < records.length; offset += 5) {
      const slide = pres.addSlide({ masterName: 'FLOW_MASTER' });
      slide.addText('Data Provenance and Limits', { x: 0.5, y: 0.8, w: 12, h: 0.6, fontSize: 28, color: '3B82F6', bold: true });
      slide.addText(`generatedAt: ${new Date().toISOString()} (export time only)\nobservedAt is unavailable unless supplied; retrieval/storage is separate. Totals cover complete supplied rows only; requested markets without observations may be absent.\nStatic competitor/strategy/financial/roadmap examples: src/services/enhancedPPTXService.ts. No verified external provenance or forecast.`, { x: 0.5, y: 1.5, w: 12, h: 1.1, fontSize: 12, color: 'E2E8F0', breakLine: false });
      slide.addText(records.slice(offset, offset + 5).join('\n\n'), { x: 0.5, y: 2.8, w: 12, h: 3.9, fontSize: 12, color: 'FFFFFF', fit: 'shrink' });
    }
  }


}
