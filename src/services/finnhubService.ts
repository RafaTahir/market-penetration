import axios from 'axios';
import { supabase, MarketStockRow } from './supabaseClient';
import { MarketHoursService } from './marketHoursService';

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export class FinnhubService {
  private static instance: FinnhubService;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://finnhub.io/api/v1';
  private requestQueue: Promise<any>[] = [];
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1100;

  private readonly symbolMap = new Map([
    ['SET.BK', { finnhubSymbol: 'SET.BK', name: 'Stock Exchange of Thailand Index', exchange: 'SET', country: 'Thailand' }],
    ['STI.SI', { finnhubSymbol: '^STI', name: 'Straits Times Index', exchange: 'SGX', country: 'Singapore' }],
    ['KLCI.KL', { finnhubSymbol: '^KLSE', name: 'FTSE Bursa Malaysia KLCI', exchange: 'MYX', country: 'Malaysia' }],
    ['JKSE.JK', { finnhubSymbol: '^JKSE', name: 'Jakarta Composite Index', exchange: 'IDX', country: 'Indonesia' }],
    ['PSEI.PS', { finnhubSymbol: 'PSEI.PS', name: 'Philippine Stock Exchange Index', exchange: 'PSE', country: 'Philippines' }],
    ['VN-INDEX.HM', { finnhubSymbol: 'VNINDEX', name: 'Ho Chi Minh Stock Index', exchange: 'HOSE', country: 'Vietnam' }]
  ]);

  private constructor() {
    this.apiKey = import.meta.env.VITE_FINNHUB_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'your_finnhub_api_key_here') {
      console.warn('Finnhub API key not configured. Using cached data only.');
    }
  }

  public static getInstance(): FinnhubService {
    if (!FinnhubService.instance) {
      FinnhubService.instance = new FinnhubService();
    }
    return FinnhubService.instance;
  }

  private async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
    return requestFn();
  }

  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    if (!this.apiKey || this.apiKey === 'your_finnhub_api_key_here') {
      return null;
    }

    const symbolInfo = this.symbolMap.get(symbol);
    if (!symbolInfo) {
      console.warn(`Unknown symbol: ${symbol}`);
      return null;
    }

    try {
      const response = await this.throttleRequest(() =>
        axios.get<FinnhubQuote>(`${this.baseUrl}/quote`, {
          params: {
            symbol: symbolInfo.finnhubSymbol,
            token: this.apiKey
          },
          timeout: 10000
        })
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async fetchAndCacheStockData(symbols: string[]): Promise<MarketStockRow[]> {
    const marketHoursService = MarketHoursService.getInstance();
    const results: MarketStockRow[] = [];

    for (const symbol of symbols) {
      const symbolInfo = this.symbolMap.get(symbol);
      if (!symbolInfo) continue;

      const marketStatus = marketHoursService.getMarketStatus(symbolInfo.exchange);

      if (!marketStatus.isOpen) {
        const cachedData = await this.getCachedStockData(symbol);
        if (cachedData) {
          results.push(cachedData);
          continue;
        }
      }

      const quote = await this.getQuote(symbol);

      if (quote && quote.c > 0) {
        const stockData: MarketStockRow = {
          symbol,
          name: symbolInfo.name,
          exchange: symbolInfo.exchange,
          country: symbolInfo.country,
          price: quote.c,
          change: quote.d,
          change_percent: quote.dp,
          volume: 0,
          timestamp: new Date().toISOString()
        };

        await this.cacheStockData(stockData);
        results.push(stockData);
      } else {
        const cachedData = await this.getCachedStockData(symbol);
        if (cachedData) {
          results.push(cachedData);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  private async cacheStockData(data: MarketStockRow): Promise<void> {
    try {
      const { error } = await supabase
        .from('market_stocks')
        .insert({
          symbol: data.symbol,
          name: data.name,
          exchange: data.exchange,
          country: data.country,
          price: data.price,
          change: data.change,
          change_percent: data.change_percent,
          volume: data.volume,
          market_cap: data.market_cap,
          timestamp: data.timestamp
        });

      if (error) {
        console.error('Error caching stock data:', error);
      }
    } catch (error) {
      console.error('Error caching stock data:', error);
    }
  }

  async getCachedStockData(symbol: string): Promise<MarketStockRow | null> {
    try {
      const { data, error } = await supabase
        .from('market_stocks')
        .select('*')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cached stock data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching cached stock data:', error);
      return null;
    }
  }

  async getAllCachedStockData(symbols: string[]): Promise<MarketStockRow[]> {
    try {
      const { data, error } = await supabase
        .from('market_stocks')
        .select('*')
        .in('symbol', symbols)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching cached stock data:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const latestBySymbol = new Map<string, MarketStockRow>();
      data.forEach((row: MarketStockRow) => {
        if (!latestBySymbol.has(row.symbol)) {
          latestBySymbol.set(row.symbol, row);
        }
      });

      return Array.from(latestBySymbol.values());
    } catch (error) {
      console.error('Error fetching all cached stock data:', error);
      return [];
    }
  }

  getSymbolInfo(symbol: string) {
    return this.symbolMap.get(symbol);
  }
}
