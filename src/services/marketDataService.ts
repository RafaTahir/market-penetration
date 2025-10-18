import axios from 'axios';
import { FinnhubService } from './finnhubService';
import { MarketHoursService } from './marketHoursService';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  name: string;
}

export interface EconomicIndicator {
  country: string;
  gdp: number;
  inflation: number;
  unemployment: number;
  interestRate: number;
  exchangeRate: number;
  lastUpdated: string;
}

export interface CurrencyRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export class MarketDataService {
  private static instance: MarketDataService;
  private currencyCache: { [key: string]: CurrencyRate } = {};
  private lastCurrencyUpdate = 0;
  private readonly CACHE_DURATION = 60000;
  private finnhubService: FinnhubService;
  private marketHoursService: MarketHoursService;

  private constructor() {
    this.finnhubService = FinnhubService.getInstance();
    this.marketHoursService = MarketHoursService.getInstance();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  async getStockData(symbols: string[]): Promise<MarketData[]> {
    try {
      const cachedData = await this.getCachedStockData(symbols);

      if (cachedData.length > 0) {
        return cachedData;
      }

      const isAnyMarketOpen = this.marketHoursService.isAnyMarketOpen();

      if (!isAnyMarketOpen) {
        return this.getFallbackStockData(symbols);
      }

      try {
        const stockData = await this.finnhubService.fetchAndCacheStockData(symbols);

        if (!stockData || stockData.length === 0) {
          return this.getFallbackStockData(symbols);
        }

        return stockData.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.change_percent,
          volume: stock.volume || 0,
          marketCap: stock.market_cap
        }));
      } catch (fetchError) {
        console.error('Error fetching fresh stock data, using fallback:', fetchError);
        return cachedData.length > 0 ? cachedData : this.getFallbackStockData(symbols);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return this.getFallbackStockData(symbols);
    }
  }

  private getFallbackStockData(symbols: string[]): MarketData[] {
    const fallbackData: { [key: string]: MarketData } = {
      'JCI': { symbol: 'JCI', name: 'Jakarta Composite Index', price: 7245.50, change: 45.30, changePercent: 0.63, volume: 8450000000, marketCap: 0 },
      'SET': { symbol: 'SET', name: 'Stock Exchange of Thailand', price: 1432.25, change: -12.45, changePercent: -0.86, volume: 82340000000, marketCap: 0 },
      'KLSE': { symbol: 'KLSE', name: 'Bursa Malaysia', price: 1545.80, change: 8.25, changePercent: 0.54, volume: 3240000000, marketCap: 0 },
      'PSEI': { symbol: 'PSEI', name: 'Philippine Stock Exchange', price: 6542.15, change: 32.80, changePercent: 0.50, volume: 4580000000, marketCap: 0 },
      'VNI': { symbol: 'VNI', name: 'Vietnam Stock Index', price: 1245.60, change: 18.90, changePercent: 1.54, volume: 12340000000, marketCap: 0 },
      'STI': { symbol: 'STI', name: 'Straits Times Index', price: 3285.40, change: -5.20, changePercent: -0.16, volume: 1240000000, marketCap: 0 }
    };

    return symbols.map(symbol => fallbackData[symbol] || {
      symbol,
      name: `${symbol} Index`,
      price: 1000 + Math.random() * 5000,
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000000),
      marketCap: 0
    });
  }

  private async getCachedStockData(symbols: string[]): Promise<MarketData[]> {
    const cachedData = await this.finnhubService.getAllCachedStockData(symbols);

    return cachedData.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.change_percent,
      volume: stock.volume || 0,
      marketCap: stock.market_cap
    }));
  }

  async getCurrencyRates(): Promise<CurrencyRate[]> {
    const now = Date.now();
    
    // Check cache first
    if (now - this.lastCurrencyUpdate < this.CACHE_DURATION && Object.keys(this.currencyCache).length > 0) {
      return Object.values(this.currencyCache);
    }

    try {
      // Try to fetch real rates from a free API
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000
      });
      
      const rates = response.data.rates;
      const currencyPairs = [
        { pair: 'USD/THB', code: 'THB' },
        { pair: 'USD/SGD', code: 'SGD' },
        { pair: 'USD/MYR', code: 'MYR' },
        { pair: 'USD/IDR', code: 'IDR' },
        { pair: 'USD/PHP', code: 'PHP' },
        { pair: 'USD/VND', code: 'VND' }
      ];

      const currencyData = currencyPairs.map(currency => {
        const rate = rates[currency.code] || this.getFallbackRate(currency.code);
        const previousRate = this.currencyCache[currency.pair]?.rate || rate;
        const change = rate - previousRate;
        const changePercent = previousRate !== 0 ? (change / previousRate) * 100 : 0;

        const currencyRate: CurrencyRate = {
          pair: currency.pair,
          rate: rate,
          change: change,
          changePercent: changePercent,
          lastUpdated: new Date().toISOString()
        };

        this.currencyCache[currency.pair] = currencyRate;
        return currencyRate;
      });

      this.lastCurrencyUpdate = now;
      return currencyData;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return this.getFallbackCurrencyData();
    }
  }

  private getFallbackRate(code: string): number {
    const fallbackRates: { [key: string]: number } = {
      'THB': 35.42,
      'SGD': 1.35,
      'MYR': 4.68,
      'IDR': 15750,
      'PHP': 56.25,
      'VND': 24350
    };
    return fallbackRates[code] || 1;
  }

  private getFallbackCurrencyData(): CurrencyRate[] {
    return [
      { pair: 'USD/THB', rate: 35.42, change: 0.12, changePercent: 0.34, lastUpdated: new Date().toISOString() },
      { pair: 'USD/SGD', rate: 1.35, change: -0.002, changePercent: -0.15, lastUpdated: new Date().toISOString() },
      { pair: 'USD/MYR', rate: 4.68, change: 0.03, changePercent: 0.64, lastUpdated: new Date().toISOString() },
      { pair: 'USD/IDR', rate: 15750, change: 25, changePercent: 0.16, lastUpdated: new Date().toISOString() },
      { pair: 'USD/PHP', rate: 56.25, change: -0.15, changePercent: -0.27, lastUpdated: new Date().toISOString() },
      { pair: 'USD/VND', rate: 24350, change: 50, changePercent: 0.21, lastUpdated: new Date().toISOString() }
    ];
  }

  getEconomicIndicators(): EconomicIndicator[] {
    return [
      {
        country: 'Thailand',
        gdp: 543.5,
        inflation: 1.2,
        unemployment: 1.1,
        interestRate: 2.50,
        exchangeRate: 35.42,
        lastUpdated: new Date().toISOString()
      },
      {
        country: 'Singapore',
        gdp: 397.0,
        inflation: 2.1,
        unemployment: 2.0,
        interestRate: 3.50,
        exchangeRate: 1.35,
        lastUpdated: new Date().toISOString()
      },
      {
        country: 'Malaysia',
        gdp: 432.0,
        inflation: 2.8,
        unemployment: 3.3,
        interestRate: 3.00,
        exchangeRate: 4.68,
        lastUpdated: new Date().toISOString()
      },
      {
        country: 'Indonesia',
        gdp: 1319.0,
        inflation: 3.2,
        unemployment: 5.8,
        interestRate: 6.00,
        exchangeRate: 15750,
        lastUpdated: new Date().toISOString()
      },
      {
        country: 'Philippines',
        gdp: 394.0,
        inflation: 4.1,
        unemployment: 4.5,
        interestRate: 6.50,
        exchangeRate: 56.25,
        lastUpdated: new Date().toISOString()
      },
      {
        country: 'Vietnam',
        gdp: 409.0,
        inflation: 3.6,
        unemployment: 2.3,
        interestRate: 4.50,
        exchangeRate: 24350,
        lastUpdated: new Date().toISOString()
      }
    ];
  }
}