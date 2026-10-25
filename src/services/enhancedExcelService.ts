import * as XLSX from 'xlsx';
import { UnifiedDataService } from './unifiedDataService';
import type { UnifiedEconomicData } from './unifiedDataService';
import { MarketDataService } from './marketDataService';
import type { CurrencyRate, MarketData } from './marketDataService';

type EconomicReference = Omit<UnifiedEconomicData, 'source' | 'lastUpdated'> & { source?: string; lastUpdated?: string };
type StockReference = MarketData;
type CurrencyReference = Omit<CurrencyRate, 'lastUpdated'> & { lastUpdated?: string };
type SheetRows = Array<Array<string | number>>;
const REFERENCE_NOTICE = 'Unverified reference; observation dates/current applicability unverified. Missing data is unavailable; see Data Provenance.';
const EXAMPLE_NOTICE = REFERENCE_NOTICE + ' Illustrative example data from src/services/enhancedExcelService.ts, not observed market facts.';

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

export interface ExcelReportData {
  selectedCountries: string[];
  selectedCities: string[];
}

export class EnhancedExcelService {
  private static instance: EnhancedExcelService;
  private unifiedDataService: UnifiedDataService;
  private marketDataService: MarketDataService;

  private constructor() {
    this.unifiedDataService = UnifiedDataService.getInstance();
    this.marketDataService = MarketDataService.getInstance();
  }

  public static getInstance(): EnhancedExcelService {
    if (!EnhancedExcelService.instance) {
      EnhancedExcelService.instance = new EnhancedExcelService();
    }
    return EnhancedExcelService.instance;
  }

  async generateEnhancedExcel(data: ExcelReportData): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

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

      this.createDashboardSheet(workbook, economicData, stockIndices, currencies);
      this.createMarketOverviewSheet(workbook, economicData);
      this.createMarketReferenceSheet(workbook, stockIndices, currencies);
      this.createEconomicIndicatorsSheet(workbook, economicData);
      this.createDigitalEconomySheet(workbook, economicData);
      this.createIndustryAnalysisSheet(workbook);
      this.createConsumerInsightsSheet(workbook);
      this.createCompetitiveLandscapeSheet(workbook);
      this.createInvestmentAnalysisSheet(workbook, economicData);
      this.createProvenanceSheet(workbook, data, economicData, stockIndices, currencies);

      const fileName = `SEA-Market-Intelligence-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Critical error generating Excel:', error);
      throw new Error('Failed to generate Excel report. Please try again or contact support.');
    }
  }

  private createDashboardSheet(workbook: XLSX.WorkBook, economicData: EconomicReference[], stockIndices: StockReference[], currencies: CurrencyReference[]): void {
    const data: SheetRows = [[REFERENCE_NOTICE]];

    data.push(['SOUTHEAST ASIAN MARKET INTELLIGENCE DASHBOARD']);
    data.push(['Generated: ' + new Date().toLocaleString()]);
    data.push([]);

    data.push(['KEY METRICS SUMMARY']);
    data.push(['Coverage', 'Totals require complete metrics for supplied rows; requested markets without observations may be absent. See Data Provenance.']);
    data.push([]);

    const totalGdp = completeTotal(economicData.map(country => country.gdp));
    const totalPopulation = completeTotal(economicData.map(country => country.population));
    const avgGrowth = completeAverage(economicData.map(country => country.gdpGrowth));
    const totalInternetUsers = completeTotal(economicData.map(country => country.internetUsers));

    data.push(['Metric', 'Value', 'Data status']);
    data.push(['Combined GDP', display(totalGdp, 2, 1e12, '$', 'T'), 'Unverified reference']);
    data.push(['Total Population', display(totalPopulation, 0, 1e6, '', 'M'), 'Unverified reference']);
    data.push(['Average GDP Growth', display(avgGrowth, 1, 1, '', '%'), 'Unverified reference']);
    data.push(['Internet Users', display(totalInternetUsers, 0, 1e6, '', 'M'), 'Unverified reference']);
    data.push([]);

    data.push(['MARKET REFERENCE STATUS']);
    data.push([]);
    data.push(['Index', 'Reference Value', 'Change', 'Change %', 'Status']);
    stockIndices.forEach(stock => {
      const status = !Number.isFinite(numeric(stock.changePercent)) ? 'Unavailable' : numeric(stock.changePercent) > 0 ? 'Reference increase' : numeric(stock.changePercent) < 0 ? 'Reference decrease' : 'No change';
      data.push([
        stock.symbol || 'N/A',
        display(stock.price, 2),
        display(stock.change, 2),
        display(stock.changePercent, 2, 1, '', '%'),
        status
      ]);
    });
    data.push([]);

    data.push(['CURRENCY RATES (vs USD)']);
    data.push([]);
    data.push(['Pair', 'Rate', 'Change', 'Change %', 'Trend']);
    currencies.forEach(currency => {
      const trend = !Number.isFinite(numeric(currency.changePercent)) ? 'Unavailable' : numeric(currency.changePercent) > 0 ? 'Rate increase' : numeric(currency.changePercent) < 0 ? 'Rate decrease' : 'No change';
      data.push([
        currency.pair || 'N/A',
        display(currency.rate, 4),
        display(currency.change, 4),
        display(currency.changePercent, 2, 1, '', '%'),
        trend
      ]);
    });
    data.push([]);

    if (stockIndices.length === 0) data.push(['Stock quotes', 'Unavailable: no supplied observations']);
    if (currencies.length === 0) data.push(['FX rates', 'Unavailable: no supplied observations']);
    data.push(['TOP MARKETS BY GDP']);
    data.push([]);
    const topMarkets = economicData.filter(country => Number.isFinite(numeric(country.gdp))).sort((a, b) => numeric(b.gdp) - numeric(a.gdp)).slice(0, 5);
    data.push(['Rank', 'Country', 'GDP (Billions)', 'GDP per Capita', 'Growth Rate']);
    topMarkets.forEach((country, index) => {
      data.push([
        (index + 1).toString(),
        country.country || 'N/A',
        display(country.gdp, 2, 1e9),
        display(country.gdpPerCapita, 0, 1, '$'),
        display(country.gdpGrowth, 1, 1, '', '%')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        if (R === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
            fill: { fgColor: { rgb: "DBEAFE" } },
            alignment: { horizontal: "center" }
          };
        } else if (typeof data[R]?.[0] === 'string' && ['SUMMARY', 'STATUS', 'RATES', 'MARKETS'].some(section => String(data[R][0]).includes(section))) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12, color: { rgb: "1E40AF" } },
            fill: { fgColor: { rgb: "EFF6FF" } }
          };
        } else if (R > 0 && data[R] && ['Metric', 'Index', 'Pair', 'Rank'].includes(String(data[R][0]))) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "F1F5F9" } },
            alignment: { horizontal: "center" }
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, ws, 'Dashboard');
  }

  private createMarketOverviewSheet(workbook: XLSX.WorkBook, economicData: EconomicReference[]): void {
    const data: SheetRows = [[REFERENCE_NOTICE]];

    data.push(['MARKET OVERVIEW - COMPREHENSIVE DATA']);
    data.push(['Observation dates: unknown; see Data Provenance for supplied metadata.']);
    data.push([]);

    data.push([
      'Country',
      'Population (Millions)',
      'GDP (Billions USD)',
      'GDP per Capita (USD)',
      'GDP Growth Rate (%)',
      'Inflation Rate (%)',
      'Unemployment Rate (%)',
      'Interest Rate (%)',
      'Internet Users (Millions)',
      'Internet Penetration (%)',
      'Exchange Rate (vs USD)',
      'Illustrative Heuristic (not calibrated)'
    ]);

    economicData.forEach(country => {
      const population = numeric(country.population) / 1e6;
      const internetPenetration = ratio(country.internetUsers, country.population) * 100;
      const opportunityScore = this.calculateOpportunityScore(country);

      data.push([
        country.country || 'N/A',
        display(population, 1),
        display(country.gdp, 2, 1e9),
        display(country.gdpPerCapita, 0),
        display(country.gdpGrowth, 1),
        display(country.inflation, 1),
        display(country.unemployment, 1),
        display(country.interestRate, 2),
        display(country.internetUsers, 1, 1e6),
        display(internetPenetration, 1),
        display(country.exchangeRate, 2),
        opportunityScore
      ]);
    });

    data.push([]);
    if (economicData.length === 0) data.push(['Economic observations', 'Unavailable for the requested markets']);
    data.push(['REGIONAL AGGREGATES']);
    data.push([]);

    const totalPopulation = completeTotal(economicData.map(country => country.population)) / 1e6;
    const totalGdp = completeTotal(economicData.map(country => country.gdp)) / 1e9;
    const avgGrowth = completeAverage(economicData.map(country => country.gdpGrowth));
    const avgInflation = completeAverage(economicData.map(country => country.inflation));
    const totalInternetUsers = completeTotal(economicData.map(country => country.internetUsers)) / 1e6;

    data.push(['Metric', 'Value']);
    data.push(['Total Population', display(totalPopulation, 0, 1, '', 'M')]);
    data.push(['Combined GDP', display(totalGdp, 2, 1, '$', 'B')]);
    data.push(['Average GDP Growth', display(avgGrowth, 1, 1, '', '%')]);
    data.push(['Average Inflation', display(avgInflation, 1, 1, '', '%')]);
    data.push(['Total Internet Users', display(totalInternetUsers, 0, 1, '', 'M')]);
    data.push(['Regional Internet Penetration', display(ratio(totalInternetUsers, totalPopulation) * 100, 1, 1, '', '%')]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = Array(12).fill({ wch: 15 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Market Overview');
  }

  private createMarketReferenceSheet(workbook: XLSX.WorkBook, stockIndices: StockReference[], currencies: CurrencyReference[]): void {
    const data: SheetRows = [[REFERENCE_NOTICE]];

    data.push(['MARKET REFERENCE SNAPSHOT']);
    data.push(['Export generated: ' + new Date().toLocaleString()]);
    data.push(['Observation dates unverified; this workbook does not refresh.']);
    data.push([]);

    data.push(['STOCK MARKET INDICES']);
    data.push([]);
    data.push(['Symbol', 'Market Name', 'Reference Price', 'Change', 'Change %', 'Volume', 'Market Cap', 'Status']);

    stockIndices.forEach(stock => {
      const status = !Number.isFinite(numeric(stock.changePercent)) ? 'Unavailable' : numeric(stock.changePercent) > 0 ? 'Reference increase' : numeric(stock.changePercent) < 0 ? 'Reference decrease' : 'No change';
      data.push([
        stock.symbol || 'N/A',
        stock.name || 'N/A',
        display(stock.price, 2),
        display(stock.change, 2),
        display(stock.changePercent, 2, 1, '', '%'),
        display(stock.volume, 0),
        display(stock.marketCap, 2, 1e9, '', 'B'),
        status
      ]);
    });

    data.push([]);
    data.push(['CURRENCY EXCHANGE RATES (vs USD)']);
    data.push([]);
    data.push(['Currency Pair', 'Reference Rate', 'Change', 'Change %', '52-Week Range', 'Trend']);

    currencies.forEach(currency => {
      const trend = !Number.isFinite(numeric(currency.changePercent)) ? 'Unavailable' : numeric(currency.changePercent) > 0 ? 'Rate increase' : numeric(currency.changePercent) < 0 ? 'Rate decrease' : 'No change';
      data.push([
        currency.pair || 'N/A',
        display(currency.rate, 4),
        display(currency.change, 4),
        display(currency.changePercent, 2, 1, '', '%'),
        'N/A',
        trend
      ]);
    });

    data.push([]);
    if (stockIndices.length === 0) data.push(['Stock quotes', 'Unavailable: no supplied observations']);
    if (currencies.length === 0) data.push(['FX rates', 'Unavailable: no supplied observations']);
    data.push(['MARKET PERFORMANCE SUMMARY']);
    data.push([]);

    const avgStockChange = completeAverage(stockIndices.map(stock => stock.changePercent));
    const completeChanges = stockIndices.length > 0 && stockIndices.every(stock => Number.isFinite(numeric(stock.changePercent)));
    const bullishCount = stockIndices.filter(stock => numeric(stock.changePercent) >= 0).length;

    data.push(['Metric', 'Value']);
    data.push(['Average Index Performance', display(avgStockChange, 2, 1, '', '%')]);
    data.push(['Markets Up', completeChanges ? `${bullishCount} of ${stockIndices.length}` : 'Unavailable']);
    data.push(['Markets Down', completeChanges ? `${stockIndices.length - bullishCount} of ${stockIndices.length}` : 'Unavailable']);
    data.push(['Direction of reference changes', !completeChanges ? 'Unavailable' : avgStockChange > 0 ? 'Increase' : avgStockChange < 0 ? 'Decrease' : 'No change']);

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(8).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Market Reference');
  }

  private createEconomicIndicatorsSheet(workbook: XLSX.WorkBook, economicData: EconomicReference[]): void {
    const data: SheetRows = [[REFERENCE_NOTICE]];

    data.push(['ECONOMIC INDICATORS - DETAILED ANALYSIS']);
    data.push([]);

    data.push(['Country', 'Reference GDP Growth (%)', 'Inflation Rate (%)', 'Unemployment (%)', 'Interest Rate (%)', 'Fiscal Balance (% GDP)', 'Current Account (% GDP)', 'Debt to GDP (%)', 'Credit Rating']);

    economicData.forEach(country => {
      data.push([
        country.country || 'N/A',
        display(country.gdpGrowth, 1),
        display(country.inflation, 1),
        display(country.unemployment, 1),
        display(country.interestRate, 2),
        'N/A',
        'N/A',
        'N/A',
        'Unavailable'
      ]);
    });

    data.push([]);
    data.push(['ILLUSTRATIVE GROWTH SCENARIOS - NOT HISTORICAL DATA OR FORECASTS']);
    data.push([]);
    data.push(['Country', 'Reference minus 1pp', 'Reference minus 0.5pp', 'Reference Growth', 'Reference plus 0.3pp', 'CAGR (unavailable)']);

    economicData.forEach(country => {
      const growth = numeric(country.gdpGrowth);
      data.push([
        country.country || 'N/A',
        display(growth - 1, 1, 1, '', '%'),
        display(growth - 0.5, 1, 1, '', '%'),
        display(growth, 1, 1, '', '%'),
        display(growth + 0.3, 1, 1, '', '%'),
        'Unavailable'
      ]);
    });

    data.push([]);
    data.push(['ILLUSTRATIVE INFLATION SCENARIO - ASSUMED 2.5% TARGET']);
    data.push([]);
    data.push(['Country', 'Reference Inflation', 'Assumed Target', 'Variance', 'Scenario', 'Illustrative Action (not policy)']);

    economicData.forEach(country => {
      const inflation = numeric(country.inflation);
      const target = 2.5;
      const variance = inflation - target;
      const trend = !Number.isFinite(variance) ? 'Unavailable' : variance > 0 ? 'ABOVE TARGET' : variance < 0 ? 'BELOW TARGET' : 'AT TARGET';
      const action = !Number.isFinite(variance) ? 'Unavailable' : variance > 1 ? 'TIGHTENING' : variance < -1 ? 'EASING' : 'NEUTRAL';

      data.push([
        country.country || 'N/A',
        display(inflation, 1, 1, '', '%'),
        target.toFixed(1) + '%',
        display(variance, 1, 1, '', '%'),
        trend,
        action
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(9).fill({ wch: 16 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Economic Indicators');
  }

  private createDigitalEconomySheet(workbook: XLSX.WorkBook, economicData: EconomicReference[]): void {
    const data: SheetRows = [[REFERENCE_NOTICE]];

    data.push(['DIGITAL ECONOMY METRICS']);
    data.push([]);

    data.push(['Country', 'Internet Users (M)', 'Penetration %', 'Assumed Mobile Users (92% of internet users)', 'Assumed Social Users (75%)', 'Assumed E-commerce Users (55%)', 'Digital Payment Adoption %', 'Cloud Adoption %']);

    economicData.forEach(country => {
      const population = numeric(country.population) / 1e6;
      const internetUsers = numeric(country.internetUsers) / 1e6;
      const penetration = ratio(internetUsers, population) * 100;

      data.push([
        country.country || 'N/A',
        display(internetUsers, 1),
        display(penetration, 1),
        display(internetUsers * 0.92, 1),
        display(internetUsers * 0.75, 1),
        display(internetUsers * 0.55, 1),
        'Unavailable',
        'Unavailable'
      ]);
    });

    data.push([]);
    data.push(['ILLUSTRATIVE DIGITAL ECONOMY SCENARIO (USD Billions): 8% of GDP; split 45/25/15/10/5%.']);
    data.push([]);
    data.push(['Country', 'E-commerce', 'Digital Financial Services', 'Online Media', 'Ride-hailing', 'Online Travel', 'Total Digital Economy']);

    economicData.forEach(country => {
      const gdp = numeric(country.gdp) / 1e9;
      const digitalEconomy = gdp * 0.08;
      const ecommerce = digitalEconomy * 0.45;
      const fintech = digitalEconomy * 0.25;
      const media = digitalEconomy * 0.15;
      const rideHailing = digitalEconomy * 0.10;
      const travel = digitalEconomy * 0.05;

      data.push([
        country.country || 'N/A',
        display(ecommerce, 2),
        display(fintech, 2),
        display(media, 2),
        display(rideHailing, 2),
        display(travel, 2),
        display(digitalEconomy, 2)
      ]);
    });

    data.push([]);
    data.push(['DIGITAL GROWTH RATES (Annual %) - NOT AVAILABLE']);
    data.push([]);
    data.push(['Country', 'E-commerce Growth', 'Fintech Growth', 'Internet User Growth', 'Mobile Payment Growth', 'Social Commerce Growth']);

    economicData.forEach(country => {
      data.push([
        country.country || 'N/A',
        'Unavailable',
        'Unavailable',
        'Unavailable',
        'Unavailable',
        'Unavailable'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(8).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Digital Economy');
  }

  private createIndustryAnalysisSheet(workbook: XLSX.WorkBook): void {
    const data: SheetRows = [[EXAMPLE_NOTICE]];

    data.push(['ILLUSTRATIVE INDUSTRY EXAMPLES - NOT MARKET OBSERVATIONS']);
    data.push([]);

    data.push(['Industry', 'Market Size (B USD)', 'Growth Rate %', 'Competition Level', 'Entry Barriers', 'Opportunity Score', 'Key Trends', 'Market Leaders']);

    const industries = [
      { name: 'Technology & Software', size: 189.2, growth: 14.8, competition: 'High', barriers: 'Medium', score: 85, trends: 'AI/ML, Cloud Migration, Cybersecurity', leaders: 'Grab, Sea Group, Gojek' },
      { name: 'E-commerce & Retail', size: 234.7, growth: 22.3, competition: 'Very High', barriers: 'Medium', score: 78, trends: 'Social Commerce, Live Streaming, D2C', leaders: 'Shopee, Lazada, Tokopedia' },
      { name: 'Financial Services', size: 167.3, growth: 18.9, competition: 'High', barriers: 'High', score: 92, trends: 'Digital Banking, BNPL, Crypto', leaders: 'GrabPay, OVO, TrueMoney' },
      { name: 'Healthcare & Pharma', size: 98.4, growth: 11.7, competition: 'Medium', barriers: 'High', score: 88, trends: 'Telemedicine, Digital Health, Personalized', leaders: 'Halodoc, Doctor Anywhere' },
      { name: 'Logistics & Delivery', size: 78.9, growth: 16.2, competition: 'High', barriers: 'Medium', score: 75, trends: 'Last-Mile, Automation, Cold Chain', leaders: 'J&T, Flash Express, Ninja Van' },
      { name: 'Education Technology', size: 45.6, growth: 25.4, competition: 'Medium', barriers: 'Low', score: 82, trends: 'Online Learning, Upskilling, Gamification', leaders: 'Ruangguru, Cakap, BYJU\'S' },
      { name: 'Food & Beverage', size: 312.1, growth: 8.9, competition: 'Very High', barriers: 'Low', score: 65, trends: 'Cloud Kitchens, Healthy Food, Sustainability', leaders: 'GrabFood, foodpanda, GoFood' },
      { name: 'Real Estate & PropTech', size: 156.8, growth: 9.2, competition: 'Medium', barriers: 'High', score: 70, trends: 'Smart Buildings, VR Tours, Fractional', leaders: 'PropertyGuru, 99.co' },
      { name: 'Manufacturing', size: 489.2, growth: 7.4, competition: 'High', barriers: 'Very High', score: 68, trends: 'Industry 4.0, IoT, Green Manufacturing', leaders: 'Samsung, Toyota, Unilever' },
      { name: 'Tourism & Hospitality', size: 234.5, growth: 12.8, competition: 'High', barriers: 'Medium', score: 72, trends: 'Digital Booking, Sustainable Travel, Experiences', leaders: 'Traveloka, Agoda, Tiket.com' }
    ];

    industries.forEach(industry => {
      data.push([
        industry.name,
        industry.size,
        industry.growth,
        industry.competition,
        industry.barriers,
        industry.score,
        industry.trends,
        industry.leaders
      ]);
    });

    data.push([]);
    data.push(['ILLUSTRATIVE SECTOR HEURISTIC - NOT CALIBRATED']);
    data.push([]);
    data.push(['Sector', 'Market Size Score', 'Growth Score', 'Competition Score', 'Entry Score', 'Overall Score', 'Investment Priority']);

    industries.forEach(industry => {
      const sizeScore = Math.min(100, (industry.size / 5));
      const growthScore = Math.min(100, industry.growth * 3);
      const compScore = industry.competition === 'Low' ? 90 : industry.competition === 'Medium' ? 70 : industry.competition === 'High' ? 50 : 30;
      const entryScore = industry.barriers === 'Low' ? 90 : industry.barriers === 'Medium' ? 70 : 50;
      const overall = (sizeScore + growthScore + compScore + entryScore) / 4;
      const priority = overall > 75 ? 'HIGH' : overall > 60 ? 'MEDIUM' : 'LOW';

      data.push([
        industry.name,
        sizeScore.toFixed(0),
        growthScore.toFixed(0),
        compScore,
        entryScore,
        overall.toFixed(0),
        priority
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Industry Analysis');
  }

  private createConsumerInsightsSheet(workbook: XLSX.WorkBook): void {
    const data: SheetRows = [[EXAMPLE_NOTICE]];

    data.push(['ILLUSTRATIVE CONSUMER EXAMPLES - NOT SURVEY RESULTS']);
    data.push([]);

    data.push(['Behavior Category', 'Penetration %', 'Growth Rate %', 'Age Group', 'Income Level', 'Urban vs Rural', 'Key Insight']);

    const behaviors = [
      ['Mobile-First Shopping', 82.4, 28.3, '18-45', 'All', '75% Urban', 'Consumers prefer mobile apps over desktop'],
      ['Social Commerce', 68.7, 35.8, '18-35', 'Middle', '70% Urban', 'Social media drives 65% of purchase decisions'],
      ['Digital Payments', 75.1, 31.5, '25-50', 'Middle-High', '80% Urban', 'Cash-to-digital transition accelerating'],
      ['Sustainability Focus', 58.2, 22.7, '25-40', 'Middle-High', '85% Urban', 'Growing preference for eco-friendly products'],
      ['Cross-border Shopping', 47.8, 38.2, '25-45', 'High', '90% Urban', 'International brands gaining popularity'],
      ['Voice Commerce', 32.5, 48.6, '18-35', 'All', '65% Urban', 'Voice assistants driving new behaviors'],
      ['Subscription Services', 41.3, 42.1, '25-45', 'Middle-High', '80% Urban', 'Preference for convenience and predictability'],
      ['Live Streaming Shopping', 55.9, 52.3, '18-30', 'All', '70% Urban', 'Entertainment + shopping hybrid model']
    ];

    behaviors.forEach(behavior => {
      data.push(behavior);
    });

    data.push([]);
    data.push(['CONSUMER SEGMENTS']);
    data.push([]);
    data.push(['Segment', 'Size (Millions)', '% of Population', 'Avg Income (USD)', 'Digital Adoption', 'Purchase Power', 'Brand Loyalty']);

    const segments = [
      ['Digital Natives (Gen Z)', 145.2, 21.3, 12500, 'Very High', 'Growing', 'Low'],
      ['Millennials', 187.6, 27.5, 28500, 'High', 'High', 'Medium'],
      ['Gen X', 124.8, 18.3, 42000, 'Medium', 'Very High', 'High'],
      ['Baby Boomers', 98.4, 14.4, 38000, 'Low', 'High', 'Very High'],
      ['Silver Spenders', 45.6, 6.7, 35000, 'Low', 'Medium', 'Very High']
    ];

    segments.forEach(segment => {
      data.push(segment);
    });

    data.push([]);
    data.push(['PURCHASE DRIVERS BY PRIORITY']);
    data.push([]);
    data.push(['Driver', 'Priority Score', 'Indonesia', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Philippines']);

    const drivers = [
      ['Price/Value', 92, 95, 88, 94, 78, 85, 96],
      ['Quality', 88, 85, 92, 82, 95, 90, 80],
      ['Convenience', 85, 82, 88, 78, 92, 87, 75],
      ['Brand Reputation', 78, 75, 85, 70, 90, 82, 72],
      ['Social Proof', 82, 88, 78, 85, 70, 80, 90],
      ['Sustainability', 65, 60, 70, 55, 85, 68, 52],
      ['Innovation', 72, 68, 75, 78, 88, 72, 65]
    ];

    drivers.forEach(driver => {
      data.push(driver);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(7).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Consumer Insights');
  }

  private createCompetitiveLandscapeSheet(workbook: XLSX.WorkBook): void {
    const data: SheetRows = [[EXAMPLE_NOTICE]];

    data.push(['ILLUSTRATIVE COMPETITOR EXAMPLES - NOT VERIFIED MARKET SHARES']);
    data.push([]);

    data.push(['Category', 'Market Leader', 'Example Share %', '2nd Player', 'Example Share %', '3rd Player', 'Example Share %', 'Market Concentration']);

    const categories = [
      ['E-commerce', 'Shopee', 68, 'Lazada', 22, 'Tokopedia', 15, 'High'],
      ['Ride-hailing', 'Grab', 81, 'Gojek', 35, 'InDriver', 8, 'Very High'],
      ['Food Delivery', 'Grab Food', 52, 'foodpanda', 28, 'GoFood', 24, 'Medium'],
      ['Digital Payments', 'GrabPay', 38, 'OVO', 32, 'GoPay', 28, 'Medium'],
      ['Cloud Services', 'AWS', 45, 'Alibaba Cloud', 28, 'Google Cloud', 18, 'Medium'],
      ['Telecommunications', 'Telkomsel', 42, 'AIS', 35, 'Singtel', 28, 'Medium'],
      ['Banking', 'DBS', 15, 'Maybank', 12, 'CIMB', 10, 'Low'],
      ['Logistics', 'J&T Express', 32, 'Flash Express', 24, 'Ninja Van', 18, 'Medium']
    ];

    categories.forEach(category => {
      data.push(category);
    });

    data.push([]);
    data.push(['COMPETITIVE DYNAMICS']);
    data.push([]);
    data.push(['Company', 'Valuation (B USD)', 'Founded', 'Markets Present', 'Key Strengths', 'Key Weaknesses', 'Growth Strategy']);

    const companies = [
      ['Sea Group (Shopee)', 28.5, 2009, 'All 6', 'Scale, Gaming ecosystem, Payments', 'Profitability', 'Regional dominance'],
      ['Grab', 12.3, 2012, 'All 6', 'Super app, Market leader', 'Unit economics', 'Expand financial services'],
      ['Gojek', 10.8, 2010, 'Indonesia primarily', 'Local expertise, Network effects', 'Limited geography', 'Merge with Tokopedia'],
      ['Lazada', 6.4, 2012, 'All 6', 'Alibaba backing, Logistics', 'Losing market share', 'Supply chain innovation'],
      ['Bukalapak', 2.5, 2010, 'Indonesia', 'SME focus, Community', 'Scale limitations', 'Diversification'],
      ['Traveloka', 3.2, 2012, 'All 6', 'Travel focus, Loyalty', 'Sector recovery', 'Fintech integration']
    ];

    companies.forEach(company => {
      data.push(company);
    });

    data.push([]);
    data.push(['COMPETITIVE ADVANTAGE MATRIX']);
    data.push([]);
    data.push(['Company', 'Product Quality', 'Price Competitiveness', 'Brand Strength', 'Distribution', 'Technology', 'Customer Service', 'Overall Score']);

    companies.forEach(company => {
      const scores = [
        company[0],
        'Unavailable',
        'Unavailable',
        'Unavailable',
        'Unavailable',
        'Unavailable',
        'Unavailable',
        'Unavailable'
      ];
      data.push(scores);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Competitive Landscape');
  }

  private createInvestmentAnalysisSheet(workbook: XLSX.WorkBook, economicData: EconomicReference[]): void {
    const data: SheetRows = [[EXAMPLE_NOTICE]];

    data.push(['ILLUSTRATIVE INVESTMENT SCENARIOS - NOT RECOMMENDATIONS OR FORECASTS']);
    data.push([]);

    data.push(['MARKET ENTRY STRATEGY BY COUNTRY']);
    data.push([]);
    data.push(['Country', 'Assumed Priority', 'Assumed Entry Mode', 'Assumed Timeline', 'Assumed Investment', 'Illustrative ROI', 'Assumed Risk', 'Example Success Factors']);

    economicData.forEach(country => {
      const gdp = numeric(country.gdp) / 1e9;
      const growth = numeric(country.gdpGrowth);
      const priority = !Number.isFinite(gdp) ? 'Unavailable' : gdp > 800 ? 'HIGH' : gdp > 400 ? 'MEDIUM' : 'LOW';
      const investment = !Number.isFinite(gdp) ? 'Unavailable' : gdp > 800 ? '$15-25M' : gdp > 400 ? '$8-15M' : '$5-10M';
      const roi = !Number.isFinite(growth) ? 'Unavailable' : growth > 6 ? '30-35%' : growth > 4 ? '25-30%' : '20-25%';
      const risk = !Number.isFinite(growth) ? 'Unavailable' : growth > 6 ? 'Medium' : 'Low';

      data.push([
        country.country || 'N/A',
        priority,
        'Joint Venture',
        '12-18 months',
        investment,
        roi,
        risk,
        'Local partnerships, Regulatory compliance'
      ]);
    });

    data.push([]);
    data.push(['ILLUSTRATIVE INVESTMENT ALLOCATION EXAMPLE']);
    data.push([]);
    data.push(['Phase', 'Duration', 'Total Investment', 'Market Development', 'Technology', 'Marketing', 'Operations', 'Working Capital']);

    const phases = [
      ['Phase 1: Foundation', '0-6 months', '$10M', '$3M', '$2.5M', '$1.5M', '$2M', '$1M'],
      ['Phase 2: Expansion', '6-18 months', '$25M', '$8M', '$6M', '$5M', '$4M', '$2M'],
      ['Phase 3: Scale', '18-36 months', '$35M', '$10M', '$8M', '$8M', '$6M', '$3M'],
      ['Total 3-Year Plan', '36 months', '$70M', '$21M', '$16.5M', '$14.5M', '$12M', '$6M']
    ];

    phases.forEach(phase => {
      data.push(phase);
    });

    data.push([]);
    data.push(['ILLUSTRATIVE FINANCIAL SCENARIO (USD Millions) - UNVERIFIED ASSUMPTIONS']);
    data.push([]);
    data.push(['Year', 'Revenue', 'Gross Profit', 'Operating Expenses', 'EBITDA', 'Net Income', 'Cash Flow', 'Cumulative Investment']);

    const projections = [
      ['Year 1', 5, 3, 8, -5, -6, -10, 10],
      ['Year 2', 18, 12, 15, -3, -4, -7, 25],
      ['Year 3', 45, 32, 28, 4, 2, 5, 35],
      ['Year 4', 95, 71, 52, 19, 14, 22, 40],
      ['Year 5', 175, 140, 88, 52, 42, 58, 40]
    ];

    projections.forEach(projection => {
      data.push(projection);
    });

    data.push([]);
    data.push(['KEY PERFORMANCE INDICATORS']);
    data.push([]);
    data.push(['Metric', 'Year 1 Target', 'Year 2 Target', 'Year 3 Target', 'Assumed Benchmark', 'Competitive Position']);

    const kpis = [
      ['Customer Acquisition Cost', '$45', '$38', '$32', '$40', 'Better'],
      ['Lifetime Value', '$180', '$250', '$380', '$220', 'Much Better'],
      ['LTV/CAC Ratio', '4.0x', '6.6x', '11.9x', '5.5x', 'Better'],
      ['Monthly Active Users (K)', '250', '750', '2,100', '1,500', 'Better'],
      ['Gross Margin %', '60%', '67%', '71%', '65%', 'Better'],
      ['Churn Rate %', '12%', '8%', '5%', '10%', 'Better'],
      ['Net Promoter Score', '45', '58', '68', '52', 'Better']
    ];

    kpis.forEach(kpi => {
      data.push(kpi);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(8).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Investment Analysis');
  }

  private createProvenanceSheet(
    workbook: XLSX.WorkBook,
    selection: ExcelReportData,
    economicData: EconomicReference[],
    stockIndices: StockReference[],
    currencies: CurrencyReference[]
  ): void {
    const data: SheetRows = [
      [REFERENCE_NOTICE],
      ['generatedAt', new Date().toISOString()],
      ['observedAt', 'Unavailable unless explicitly supplied below; generatedAt is only the export time.'],
      ['Requested countries', selection.selectedCountries.join(', ') || 'All supplied markets'],
      ['Requested cities', selection.selectedCities.join(', ') || 'None; national data does not establish city applicability.'],
      ['Scope', 'Economic totals cover supplied rows only and require every listed row to have that metric. Requested markets without observations may be absent; compare the requested and supplied market lists. Quotes/FX are regional. No fallback observations are generated.'],
      ['Supplied economic markets', economicData.map(record => record.country).join(', ') || 'Unavailable'],
      ['Static example source', 'src/services/enhancedExcelService.ts: Industry Analysis, Consumer Insights, Competitive Landscape and Investment Analysis example tables; no independently verified external provenance.'],
      ['Applicability', 'Current laws, sector permissions, market shares and suitability for a business are unverified.'],
      ['Illustrative calculations', 'Growth offsets, assumed 2.5% inflation target, internet-user proxies (92/75/55%), digital economy (8% GDP split 45/25/15/10/5%), financial scenarios and heuristic scores are examples, not observations or forecasts.'],
      ['Country heuristic', 'Mean of capped GDP/1T*100, GDP growth*15, internet users/population*100, and assumed stability=75. Missing inputs make the heuristic unavailable.'],
      ['Sector heuristic', 'Mean of size/5, growth*3 (each capped at 100), assumed competition and entry scores; not calibrated.'],
      [],
      ['Category', 'Series / field', 'Data status', 'Supplied source', 'observedAt / observation period', 'retrievedAt / storedAt (not observation)', 'Limitation']
    ];
    economicData.forEach(record => {
      data.push(['Economics', record.country, 'Supplied; verification required', record.source || 'Unavailable', 'See field evidence; no observation date inferred', '']);
      for (const [field, evidence] of Object.entries(record.metricEvidence || {})) {
        data.push(['Economic field', `${record.country} / ${field}`, evidence.status, evidence.source || 'Unavailable', evidence.observationPeriod || 'Unavailable', evidence.retrievedAt || 'Unavailable', evidence.limitation || 'Verification required']);
      }
    });
    stockIndices.forEach(record => data.push([
      'Stock quote', record.symbol, record.sourceStatus || 'Stored/supplied; unverified', record.source || 'Unavailable', record.observedAt || 'Unavailable', record.storedAt || record.retrievedAt || 'Unavailable'
    ]));
    currencies.forEach(record => data.push([
      'FX rate', record.pair, record.sourceStatus || 'Supplied; verification required', record.source || 'Unavailable', record.observedAt || 'Unavailable', record.retrievedAt || 'Unavailable'
    ]));
    if (!economicData.length) data.push(['Economics', 'Requested markets', 'Unavailable', 'No supplied observations']);
    if (!stockIndices.length) data.push(['Stock quote', 'Regional series', 'Unavailable', 'No supplied observations']);
    if (!currencies.length) data.push(['FX rate', 'Regional series', 'Unavailable', 'No supplied observations']);
    const sheet = XLSX.utils.aoa_to_sheet(data);
    sheet['!cols'] = [{ wch: 28 }, { wch: 48 }, { wch: 38 }, { wch: 70 }, { wch: 40 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, sheet, 'Data Provenance');
  }

  private calculateOpportunityScore(country: EconomicReference): number | string {
    const gdpScore = Math.min(100, (numeric(country.gdp) / 1e12) * 100);
    const growthScore = Math.min(100, numeric(country.gdpGrowth) * 15);
    const internetScore = Math.min(100, ratio(country.internetUsers, country.population) * 100);
    const stabilityScore = 75;

    const score = (gdpScore + growthScore + internetScore + stabilityScore) / 4;
    return Number.isFinite(score) ? Math.round(score) : 'Unavailable';
  }
}
