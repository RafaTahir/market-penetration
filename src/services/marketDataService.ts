import axios from 'axios';
import { FinnhubService } from './finnhubService';

export interface MarketData {
  symbol: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap?: number;
  name: string;
  source?: string;
  lastUpdated?: string;
  storedAt?: string;
  observedAt?: string;
  retrievedAt?: string;
  sourceStatus?: 'reported' | 'cached-unverified';
}

export interface EconomicIndicator {
  country: string;
  gdp: number;
  inflation: number;
  unemployment: number;
  interestRate: number;
  exchangeRate: number;
  lastUpdated: string;
  source?: string;
}

export interface CurrencyRate {
  pair: string;
  rate: number;
  change: number | null;
  changePercent: number | null;
  lastUpdated: string;
  source?: string;
  hasPreviousRate?: boolean;
  observedAt?: string;
  retrievedAt?: string;
  sourceStatus?: 'reported' | 'cached-unverified';
}

export class MarketDataService {
  private static instance: MarketDataService;
  private currencyCache: { [key: string]: CurrencyRate } = {};
  private lastCurrencyUpdate = 0;
  private readonly CACHE_DURATION = 60000;
  private finnhubService: FinnhubService;

  private constructor() {
    this.finnhubService = FinnhubService.getInstance();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  async getStockData(symbols: string[]): Promise<MarketData[]> {
    try {
      // Browsing is read-only. Provider requests and database writes require a
      // separately configured integration; opening a page must not trigger them.
      return await this.getCachedStockData(symbols);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return [];
    }
  }

  private async getCachedStockData(symbols: string[]): Promise<MarketData[]> {
    const cachedData = await this.finnhubService.getAllCachedStockData(symbols);

    return cachedData.filter(stock =>
      symbols.includes(stock.symbol) && Number.isFinite(stock.price) && stock.price > 0 &&
      typeof stock.data_source === 'string' && stock.data_source.trim().length > 0 &&
      !/unknown|unavailable|synthetic|demo|sample|fallback/i.test(stock.data_source) &&
      typeof stock.observed_at === 'string' && Number.isFinite(Date.parse(stock.observed_at))
    ).map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: Number.isFinite(stock.change) ? stock.change : null,
      changePercent: Number.isFinite(stock.change_percent) ? stock.change_percent : null,
      volume: Number.isFinite(stock.volume) && stock.volume >= 0 ? stock.volume : null,
      marketCap: stock.market_cap,
      source: `Stored record claiming ${stock.data_source}; not independently verified`,
      lastUpdated: stock.observed_at || '',
      observedAt: stock.observed_at || '',
      retrievedAt: stock.retrieved_at && Number.isFinite(Date.parse(stock.retrieved_at)) ? stock.retrieved_at : '',
      sourceStatus: 'cached-unverified',
      storedAt: Number.isFinite(Date.parse(stock.timestamp)) ? stock.timestamp : ''
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
      
      const rates = response.data?.rates;
      const providerDate = response.data?.date;
      const lastUpdated = typeof providerDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(providerDate) && Number.isFinite(Date.parse(providerDate)) && new Date(providerDate).toISOString().slice(0, 10) === providerDate
        ? providerDate : '';
      const currencyPairs = [
        { pair: 'USD/THB', code: 'THB' },
        { pair: 'USD/SGD', code: 'SGD' },
        { pair: 'USD/MYR', code: 'MYR' },
        { pair: 'USD/IDR', code: 'IDR' },
        { pair: 'USD/PHP', code: 'PHP' },
        { pair: 'USD/VND', code: 'VND' }
      ];

      const currencyData = currencyPairs.flatMap(currency => {
        const rate = rates?.[currency.code];
        if (!Number.isFinite(rate) || rate <= 0) return [];
        const previous = this.currencyCache[currency.pair];
        const previousRate = previous?.rate ?? rate;
        const change = rate - previousRate;
        const changePercent = previousRate !== 0 ? (change / previousRate) * 100 : 0;

        const currencyRate: CurrencyRate = {
          pair: currency.pair,
          rate: rate,
          change: previous ? change : null,
          changePercent: previous ? changePercent : null,
          lastUpdated,
          observedAt: lastUpdated,
          retrievedAt: new Date().toISOString(),
          sourceStatus: 'reported',
          source: 'exchangerate-api.com (provider-dated reference rate)',
          hasPreviousRate: Boolean(previous)
        };

        this.currencyCache[currency.pair] = currencyRate;
        return [currencyRate];
      });

      this.lastCurrencyUpdate = now;
      return currencyData;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return Object.values(this.currencyCache).map(rate => ({ ...rate, sourceStatus: 'cached-unverified' }));
    }
  }

  getEconomicIndicators(): EconomicIndicator[] {
    // No connected source implements this synchronous API. Missing records are
    // unavailable; bundled macroeconomic assumptions are not provider results.
    return [];
  }
}
