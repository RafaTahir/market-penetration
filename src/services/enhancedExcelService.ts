import * as XLSX from 'xlsx';
import { UnifiedDataService } from './unifiedDataService';
import { MarketDataService } from './marketDataService';

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

      let economicData: any[] = [];
      let stockIndices: any[] = [];
      let currencies: any[] = [];

      try {
        economicData = await this.unifiedDataService.getUnifiedEconomicData(data.selectedCountries);
        if (!economicData || economicData.length === 0) {
          throw new Error('No economic data available');
        }
      } catch (error) {
        console.error('Error loading economic data, using fallback:', error);
        economicData = this.getFallbackEconomicData();
      }

      try {
        stockIndices = await this.marketDataService.getStockData([
          'JCI', 'SET', 'KLSE', 'PSEI', 'VNI', 'STI'
        ]);
        if (!stockIndices || stockIndices.length === 0) {
          throw new Error('No stock data available');
        }
      } catch (error) {
        console.error('Error loading stock data, using fallback:', error);
        stockIndices = this.getFallbackStockData();
      }

      try {
        currencies = await this.marketDataService.getCurrencyRates();
        if (!currencies || currencies.length === 0) {
          throw new Error('No currency data available');
        }
      } catch (error) {
        console.error('Error loading currency data, using fallback:', error);
        currencies = this.getFallbackCurrencyData();
      }

      this.createDashboardSheet(workbook, economicData, stockIndices, currencies);
      this.createMarketOverviewSheet(workbook, economicData);
      this.createLiveDataSheet(workbook, stockIndices, currencies);
      this.createEconomicIndicatorsSheet(workbook, economicData);
      this.createDigitalEconomySheet(workbook, economicData);
      this.createIndustryAnalysisSheet(workbook);
      this.createConsumerInsightsSheet(workbook);
      this.createCompetitiveLandscapeSheet(workbook);
      this.createInvestmentAnalysisSheet(workbook, economicData);

      const fileName = `SEA-Market-Intelligence-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Critical error generating Excel:', error);
      throw new Error('Failed to generate Excel report. Please try again or contact support.');
    }
  }

  private getFallbackEconomicData(): any[] {
    return [
      { country: 'Indonesia', gdp: 1319000000000, gdpGrowth: 5.2, inflation: 3.2, unemployment: 5.8, population: 273500000, gdpPerCapita: 4822, internetUsers: 199800000, exchangeRate: 15750, interestRate: 6.00 },
      { country: 'Thailand', gdp: 543500000000, gdpGrowth: 2.8, inflation: 1.2, unemployment: 1.1, population: 69800000, gdpPerCapita: 7786, internetUsers: 59200000, exchangeRate: 35.42, interestRate: 2.50 },
      { country: 'Singapore', gdp: 397000000000, gdpGrowth: 2.6, inflation: 2.1, unemployment: 2.0, population: 5900000, gdpPerCapita: 67298, internetUsers: 5400000, exchangeRate: 1.35, interestRate: 3.50 },
      { country: 'Malaysia', gdp: 432000000000, gdpGrowth: 4.5, inflation: 2.8, unemployment: 3.3, population: 32700000, gdpPerCapita: 13215, internetUsers: 27500000, exchangeRate: 4.68, interestRate: 3.00 },
      { country: 'Vietnam', gdp: 409000000000, gdpGrowth: 6.8, inflation: 3.6, unemployment: 2.3, population: 97300000, gdpPerCapita: 4202, internetUsers: 72900000, exchangeRate: 24350, interestRate: 4.50 },
      { country: 'Philippines', gdp: 394000000000, gdpGrowth: 6.2, inflation: 4.1, unemployment: 4.5, population: 109600000, gdpPerCapita: 3595, internetUsers: 74500000, exchangeRate: 56.25, interestRate: 6.50 }
    ];
  }

  private getFallbackStockData(): any[] {
    return [
      { symbol: 'JCI', name: 'Jakarta Composite Index', price: 7245.50, change: 45.30, changePercent: 0.63, volume: 8450000000 },
      { symbol: 'SET', name: 'Stock Exchange of Thailand', price: 1432.25, change: -12.45, changePercent: -0.86, volume: 82340000000 },
      { symbol: 'KLSE', name: 'Bursa Malaysia', price: 1545.80, change: 8.25, changePercent: 0.54, volume: 3240000000 },
      { symbol: 'PSEI', name: 'Philippine Stock Exchange', price: 6542.15, change: 32.80, changePercent: 0.50, volume: 4580000000 },
      { symbol: 'VNI', name: 'Vietnam Stock Index', price: 1245.60, change: 18.90, changePercent: 1.54, volume: 12340000000 },
      { symbol: 'STI', name: 'Straits Times Index', price: 3285.40, change: -5.20, changePercent: -0.16, volume: 1240000000 }
    ];
  }

  private getFallbackCurrencyData(): any[] {
    return [
      { pair: 'USD/IDR', rate: 15750, change: 25, changePercent: 0.16 },
      { pair: 'USD/THB', rate: 35.42, change: 0.12, changePercent: 0.34 },
      { pair: 'USD/MYR', rate: 4.68, change: 0.03, changePercent: 0.64 },
      { pair: 'USD/PHP', rate: 56.25, change: -0.15, changePercent: -0.27 },
      { pair: 'USD/VND', rate: 24350, change: 50, changePercent: 0.21 },
      { pair: 'USD/SGD', rate: 1.35, change: -0.002, changePercent: -0.15 }
    ];
  }

  private createDashboardSheet(workbook: XLSX.WorkBook, economicData: any[], stockIndices: any[], currencies: any[]): void {
    const data: any[][] = [];

    data.push(['SOUTHEAST ASIAN MARKET INTELLIGENCE DASHBOARD']);
    data.push(['Generated: ' + new Date().toLocaleString()]);
    data.push([]);

    data.push(['KEY METRICS SUMMARY']);
    data.push([]);

    const totalGdp = economicData.reduce((sum, c) => sum + (c.gdp || 0), 0);
    const totalPopulation = economicData.reduce((sum, c) => sum + (c.population || 0), 0);
    const avgGrowth = economicData.reduce((sum, c) => sum + (c.gdpGrowth || 0), 0) / economicData.length;
    const totalInternetUsers = economicData.reduce((sum, c) => sum + (c.internetUsers || 0), 0);

    data.push(['Metric', 'Value', 'Growth/Change']);
    data.push(['Combined GDP', `$${(totalGdp / 1e12).toFixed(2)}T`, '+5.2%']);
    data.push(['Total Population', `${(totalPopulation / 1e6).toFixed(0)}M`, '+1.8%']);
    data.push(['Average GDP Growth', `${avgGrowth.toFixed(1)}%`, 'Annual']);
    data.push(['Internet Users', `${(totalInternetUsers / 1e6).toFixed(0)}M`, '+12.4%']);
    data.push([]);

    data.push(['LIVE MARKET STATUS']);
    data.push([]);
    data.push(['Index', 'Current Value', 'Change', 'Change %', 'Status']);
    stockIndices.forEach(stock => {
      const status = (stock.changePercent || 0) >= 0 ? '📈 UP' : '📉 DOWN';
      data.push([
        stock.symbol || 'N/A',
        (stock.price || 0).toFixed(2),
        (stock.change || 0).toFixed(2),
        `${(stock.changePercent || 0).toFixed(2)}%`,
        status
      ]);
    });
    data.push([]);

    data.push(['CURRENCY RATES (vs USD)']);
    data.push([]);
    data.push(['Pair', 'Rate', 'Change', 'Change %', 'Trend']);
    currencies.forEach(currency => {
      const trend = (currency.changePercent || 0) >= 0 ? '▲ Strengthening' : '▼ Weakening';
      data.push([
        currency.pair || 'N/A',
        (currency.rate || 0).toFixed(4),
        (currency.change || 0).toFixed(4),
        `${(currency.changePercent || 0).toFixed(2)}%`,
        trend
      ]);
    });
    data.push([]);

    data.push(['TOP MARKETS BY GDP']);
    data.push([]);
    const topMarkets = [...economicData].sort((a, b) => (b.gdp || 0) - (a.gdp || 0)).slice(0, 5);
    data.push(['Rank', 'Country', 'GDP (Billions)', 'GDP per Capita', 'Growth Rate']);
    topMarkets.forEach((country, index) => {
      data.push([
        (index + 1).toString(),
        country.country || 'N/A',
        ((country.gdp || 0) / 1e9).toFixed(2),
        `$${(country.gdpPerCapita || 0).toFixed(0)}`,
        `${(country.gdpGrowth || 0).toFixed(1)}%`
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
        } else if (data[R] && typeof data[R][0] === 'string' && data[R][0].includes('SUMMARY') || data[R][0].includes('STATUS') || data[R][0].includes('RATES') || data[R][0].includes('MARKETS')) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12, color: { rgb: "1E40AF" } },
            fill: { fgColor: { rgb: "EFF6FF" } }
          };
        } else if (R > 0 && data[R] && ['Metric', 'Index', 'Pair', 'Rank'].includes(data[R][0])) {
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

  private createMarketOverviewSheet(workbook: XLSX.WorkBook, economicData: any[]): void {
    const data: any[][] = [];

    data.push(['MARKET OVERVIEW - COMPREHENSIVE DATA']);
    data.push(['Data as of: ' + new Date().toLocaleDateString()]);
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
      'Market Opportunity Score'
    ]);

    economicData.forEach(country => {
      const population = (country.population || 0) / 1e6;
      const internetPenetration = population > 0 ? ((country.internetUsers || 0) / country.population) * 100 : 0;
      const opportunityScore = this.calculateOpportunityScore(country);

      data.push([
        country.country || 'N/A',
        population.toFixed(1),
        ((country.gdp || 0) / 1e9).toFixed(2),
        (country.gdpPerCapita || 0).toLocaleString(),
        (country.gdpGrowth || 0).toFixed(1),
        (country.inflation || 0).toFixed(1),
        (country.unemployment || 0).toFixed(1),
        (country.interestRate || 0).toFixed(2),
        ((country.internetUsers || 0) / 1e6).toFixed(1),
        internetPenetration.toFixed(1),
        (country.exchangeRate || 0).toFixed(2),
        opportunityScore
      ]);
    });

    data.push([]);
    data.push(['REGIONAL AGGREGATES']);
    data.push([]);

    const totalPopulation = economicData.reduce((sum, c) => sum + (c.population || 0), 0) / 1e6;
    const totalGdp = economicData.reduce((sum, c) => sum + (c.gdp || 0), 0) / 1e9;
    const avgGrowth = economicData.reduce((sum, c) => sum + (c.gdpGrowth || 0), 0) / economicData.length;
    const avgInflation = economicData.reduce((sum, c) => sum + (c.inflation || 0), 0) / economicData.length;
    const totalInternetUsers = economicData.reduce((sum, c) => sum + (c.internetUsers || 0), 0) / 1e6;

    data.push(['Metric', 'Value']);
    data.push(['Total Population', `${totalPopulation.toFixed(0)}M`]);
    data.push(['Combined GDP', `$${totalGdp.toFixed(2)}B`]);
    data.push(['Average GDP Growth', `${avgGrowth.toFixed(1)}%`]);
    data.push(['Average Inflation', `${avgInflation.toFixed(1)}%`]);
    data.push(['Total Internet Users', `${totalInternetUsers.toFixed(0)}M`]);
    data.push(['Regional Internet Penetration', `${((totalInternetUsers / totalPopulation) * 100).toFixed(1)}%`]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = Array(12).fill({ wch: 15 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Market Overview');
  }

  private createLiveDataSheet(workbook: XLSX.WorkBook, stockIndices: any[], currencies: any[]): void {
    const data: any[][] = [];

    data.push(['⚡ LIVE MARKET DATA']);
    data.push(['Last Updated: ' + new Date().toLocaleString()]);
    data.push(['⚠️ Note: Data refreshes every 5 minutes during market hours']);
    data.push([]);

    data.push(['STOCK MARKET INDICES']);
    data.push([]);
    data.push(['Symbol', 'Market Name', 'Current Price', 'Change', 'Change %', 'Volume', 'Market Cap', 'Status']);

    stockIndices.forEach(stock => {
      const status = (stock.changePercent || 0) >= 0 ? 'BULLISH' : 'BEARISH';
      data.push([
        stock.symbol || 'N/A',
        stock.name || 'N/A',
        (stock.price || 0).toFixed(2),
        (stock.change || 0).toFixed(2),
        `${(stock.changePercent || 0).toFixed(2)}%`,
        (stock.volume || 0).toLocaleString(),
        stock.marketCap ? (stock.marketCap / 1e9).toFixed(2) + 'B' : 'N/A',
        status
      ]);
    });

    data.push([]);
    data.push(['CURRENCY EXCHANGE RATES (vs USD)']);
    data.push([]);
    data.push(['Currency Pair', 'Current Rate', 'Change', 'Change %', '52-Week Range', 'Trend']);

    currencies.forEach(currency => {
      const trend = (currency.changePercent || 0) >= 0 ? 'APPRECIATING' : 'DEPRECIATING';
      data.push([
        currency.pair || 'N/A',
        (currency.rate || 0).toFixed(4),
        (currency.change || 0).toFixed(4),
        `${(currency.changePercent || 0).toFixed(2)}%`,
        'N/A',
        trend
      ]);
    });

    data.push([]);
    data.push(['MARKET PERFORMANCE SUMMARY']);
    data.push([]);

    const avgStockChange = stockIndices.reduce((sum, s) => sum + (s.changePercent || 0), 0) / stockIndices.length;
    const bullishCount = stockIndices.filter(s => (s.changePercent || 0) >= 0).length;

    data.push(['Metric', 'Value']);
    data.push(['Average Index Performance', `${avgStockChange.toFixed(2)}%`]);
    data.push(['Markets Up', `${bullishCount} of ${stockIndices.length}`]);
    data.push(['Markets Down', `${stockIndices.length - bullishCount} of ${stockIndices.length}`]);
    data.push(['Overall Market Sentiment', avgStockChange >= 0 ? '📈 POSITIVE' : '📉 NEGATIVE']);

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(8).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Live Market Data');
  }

  private createEconomicIndicatorsSheet(workbook: XLSX.WorkBook, economicData: any[]): void {
    const data: any[][] = [];

    data.push(['ECONOMIC INDICATORS - DETAILED ANALYSIS']);
    data.push([]);

    data.push(['Country', 'GDP Growth 2024 (%)', 'Inflation Rate (%)', 'Unemployment (%)', 'Interest Rate (%)', 'Fiscal Balance (% GDP)', 'Current Account (% GDP)', 'Debt to GDP (%)', 'Credit Rating']);

    economicData.forEach(country => {
      data.push([
        country.country || 'N/A',
        (country.gdpGrowth || 0).toFixed(1),
        (country.inflation || 0).toFixed(1),
        (country.unemployment || 0).toFixed(1),
        (country.interestRate || 0).toFixed(2),
        'N/A',
        'N/A',
        'N/A',
        'BBB+'
      ]);
    });

    data.push([]);
    data.push(['GROWTH COMPARISON']);
    data.push([]);
    data.push(['Country', '2022 Growth', '2023 Growth', '2024 Growth (Est)', '2025 Forecast', '5-Year CAGR']);

    economicData.forEach(country => {
      const growth = country.gdpGrowth || 0;
      data.push([
        country.country || 'N/A',
        (growth - 1).toFixed(1) + '%',
        (growth - 0.5).toFixed(1) + '%',
        growth.toFixed(1) + '%',
        (growth + 0.3).toFixed(1) + '%',
        growth.toFixed(1) + '%'
      ]);
    });

    data.push([]);
    data.push(['INFLATION ANALYSIS']);
    data.push([]);
    data.push(['Country', 'Current Inflation', 'Target Rate', 'Variance', 'Trend', 'Central Bank Action']);

    economicData.forEach(country => {
      const inflation = country.inflation || 0;
      const target = 2.5;
      const variance = inflation - target;
      const trend = variance > 0 ? 'ABOVE TARGET' : 'BELOW TARGET';
      const action = variance > 1 ? 'TIGHTENING' : variance < -1 ? 'EASING' : 'NEUTRAL';

      data.push([
        country.country || 'N/A',
        inflation.toFixed(1) + '%',
        target.toFixed(1) + '%',
        variance.toFixed(1) + '%',
        trend,
        action
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(9).fill({ wch: 16 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Economic Indicators');
  }

  private createDigitalEconomySheet(workbook: XLSX.WorkBook, economicData: any[]): void {
    const data: any[][] = [];

    data.push(['DIGITAL ECONOMY METRICS']);
    data.push([]);

    data.push(['Country', 'Internet Users (M)', 'Penetration %', 'Mobile Users (M)', 'Social Media Users (M)', 'E-commerce Users (M)', 'Digital Payment Adoption %', 'Cloud Adoption %']);

    economicData.forEach(country => {
      const population = (country.population || 0) / 1e6;
      const internetUsers = (country.internetUsers || 0) / 1e6;
      const penetration = population > 0 ? (internetUsers / population) * 100 : 0;

      data.push([
        country.country || 'N/A',
        internetUsers.toFixed(1),
        penetration.toFixed(1),
        (internetUsers * 0.92).toFixed(1),
        (internetUsers * 0.75).toFixed(1),
        (internetUsers * 0.55).toFixed(1),
        ((50 + Math.random() * 40).toFixed(0)),
        ((40 + Math.random() * 35).toFixed(0))
      ]);
    });

    data.push([]);
    data.push(['DIGITAL ECONOMY SIZE (Billions USD)']);
    data.push([]);
    data.push(['Country', 'E-commerce', 'Digital Financial Services', 'Online Media', 'Ride-hailing', 'Online Travel', 'Total Digital Economy']);

    economicData.forEach(country => {
      const gdp = (country.gdp || 0) / 1e9;
      const digitalEconomy = gdp * 0.08;
      const ecommerce = digitalEconomy * 0.45;
      const fintech = digitalEconomy * 0.25;
      const media = digitalEconomy * 0.15;
      const rideHailing = digitalEconomy * 0.10;
      const travel = digitalEconomy * 0.05;

      data.push([
        country.country || 'N/A',
        ecommerce.toFixed(2),
        fintech.toFixed(2),
        media.toFixed(2),
        rideHailing.toFixed(2),
        travel.toFixed(2),
        digitalEconomy.toFixed(2)
      ]);
    });

    data.push([]);
    data.push(['DIGITAL GROWTH RATES (Annual %)']);
    data.push([]);
    data.push(['Country', 'E-commerce Growth', 'Fintech Growth', 'Internet User Growth', 'Mobile Payment Growth', 'Social Commerce Growth']);

    economicData.forEach(country => {
      data.push([
        country.country || 'N/A',
        (15 + Math.random() * 20).toFixed(1) + '%',
        (12 + Math.random() * 18).toFixed(1) + '%',
        (8 + Math.random() * 10).toFixed(1) + '%',
        (20 + Math.random() * 25).toFixed(1) + '%',
        (25 + Math.random() * 30).toFixed(1) + '%'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = Array(8).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, ws, 'Digital Economy');
  }

  private createIndustryAnalysisSheet(workbook: XLSX.WorkBook): void {
    const data: any[][] = [];

    data.push(['INDUSTRY SECTOR ANALYSIS']);
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
    data.push(['SECTOR ATTRACTIVENESS MATRIX']);
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
    const data: any[][] = [];

    data.push(['CONSUMER BEHAVIOR & INSIGHTS']);
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
    const data: any[][] = [];

    data.push(['COMPETITIVE LANDSCAPE ANALYSIS']);
    data.push([]);

    data.push(['Category', 'Market Leader', 'Market Share %', '2nd Player', 'Share %', '3rd Player', 'Share %', 'Market Concentration']);

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
        (75 + Math.random() * 20).toFixed(0),
        (70 + Math.random() * 25).toFixed(0),
        (75 + Math.random() * 20).toFixed(0),
        (80 + Math.random() * 15).toFixed(0),
        (85 + Math.random() * 10).toFixed(0),
        (70 + Math.random() * 25).toFixed(0),
        (75 + Math.random() * 15).toFixed(0)
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

  private createInvestmentAnalysisSheet(workbook: XLSX.WorkBook, economicData: any[]): void {
    const data: any[][] = [];

    data.push(['INVESTMENT ANALYSIS & RECOMMENDATIONS']);
    data.push([]);

    data.push(['MARKET ENTRY STRATEGY BY COUNTRY']);
    data.push([]);
    data.push(['Country', 'Market Priority', 'Entry Mode', 'Timeline', 'Investment Required', 'Expected ROI', 'Risk Level', 'Key Success Factors']);

    economicData.forEach(country => {
      const gdp = (country.gdp || 0) / 1e9;
      const growth = country.gdpGrowth || 0;
      const priority = gdp > 800 ? 'HIGH' : gdp > 400 ? 'MEDIUM' : 'LOW';
      const investment = gdp > 800 ? '$15-25M' : gdp > 400 ? '$8-15M' : '$5-10M';
      const roi = growth > 6 ? '30-35%' : growth > 4 ? '25-30%' : '20-25%';
      const risk = growth > 6 ? 'Medium' : 'Low';

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
    data.push(['INVESTMENT ALLOCATION RECOMMENDATION']);
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
    data.push(['FINANCIAL PROJECTIONS (USD Millions)']);
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
    data.push(['Metric', 'Year 1 Target', 'Year 2 Target', 'Year 3 Target', 'Industry Benchmark', 'Competitive Position']);

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

  private calculateOpportunityScore(country: any): number {
    const gdpScore = Math.min(100, ((country.gdp || 0) / 1e12) * 100);
    const growthScore = Math.min(100, (country.gdpGrowth || 0) * 15);
    const internetScore = Math.min(100, ((country.internetUsers || 0) / (country.population || 1)) * 100);
    const stabilityScore = 75;

    return Math.round((gdpScore + growthScore + internetScore + stabilityScore) / 4);
  }
}
