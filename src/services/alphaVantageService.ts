import axios from 'axios';
import { supabase } from './supabaseClient';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  lastUpdated: string;
}

export interface ForexRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  bid: number;
  ask: number;
  lastUpdated: string;
}

export interface CommodityPrice {
  commodity: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  lastUpdated: string;
}

export class AlphaVantageService {
  private static instance: AlphaVantageService;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 12000;

  private readonly SEA_STOCKS = {
    'SET.BK': { name: 'Stock Exchange of Thailand', exchange: 'SET' },
    'STI.SI': { name: 'Straits Times Index', exchange: 'SGX' },
    'KLSE.KL': { name: 'FTSE Bursa Malaysia KLCI', exchange: 'KLSE' },
    'JCI.JK': { name: 'Jakarta Composite Index', exchange: 'IDX' },
    'PSEI.PS': { name: 'Philippine Stock Exchange Index', exchange: 'PSE' },
    'VNINDEX': { name: 'Ho Chi Minh Stock Index', exchange: 'HOSE' }
  };

  private constructor() {
    this.apiKey = import.meta.env.VITE_ALPHAVANTAGE_API_KEY || 'demo';
  }

  public static getInstance(): AlphaVantageService {
    if (!AlphaVantageService.instance) {
      AlphaVantageService.instance = new AlphaVantageService();
    }
    return AlphaVantageService.instance;
  }

  private async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve =>
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    return requestFn();
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const cached = await this.getCachedStockQuote(symbol);
      if (cached && this.isDataFresh(cached.lastUpdated, 'hourly')) {
        return cached;
      }

      const response = await this.throttleRequest(() =>
        axios.get(this.baseUrl, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: this.apiKey
          },
          timeout: 10000
        })
      );

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        return this.getFallbackStockQuote(symbol);
      }

      const stockQuote: StockQuote = {
        symbol,
        name: this.SEA_STOCKS[symbol as keyof typeof this.SEA_STOCKS]?.name || symbol,
        price: parseFloat(quote['05. price']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
        volume: parseInt(quote['06. volume']) || 0,
        marketCap: 0,
        peRatio: 0,
        dividendYield: 0,
        lastUpdated: new Date().toISOString()
      };

      await this.cacheStockQuote(stockQuote);
      return stockQuote;
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      return this.getFallbackStockQuote(symbol);
    }
  }

  async getForexRate(fromCurrency: string, toCurrency: string): Promise<ForexRate | null> {
    try {
      const cached = await this.getCachedForexRate(fromCurrency, toCurrency);
      if (cached && this.isDataFresh(cached.lastUpdated, 'hourly')) {
        return cached;
      }

      const response = await this.throttleRequest(() =>
        axios.get(this.baseUrl, {
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: fromCurrency,
            to_currency: toCurrency,
            apikey: this.apiKey
          },
          timeout: 10000
        })
      );

      const data = response.data['Realtime Currency Exchange Rate'];
      if (!data) {
        return this.getFallbackForexRate(fromCurrency, toCurrency);
      }

      const forexRate: ForexRate = {
        fromCurrency,
        toCurrency,
        rate: parseFloat(data['5. Exchange Rate']) || 1,
        bid: parseFloat(data['8. Bid Price']) || 0,
        ask: parseFloat(data['9. Ask Price']) || 0,
        lastUpdated: data['6. Last Refreshed'] || new Date().toISOString()
      };

      await this.cacheForexRate(forexRate);
      return forexRate;
    } catch (error) {
      console.error(`Error fetching forex rate ${fromCurrency}/${toCurrency}:`, error);
      return this.getFallbackForexRate(fromCurrency, toCurrency);
    }
  }

  async getCommodityPrices(): Promise<CommodityPrice[]> {
    const commodities = ['WTI', 'BRENT', 'NATURAL_GAS', 'COPPER', 'ALUMINUM'];
    const prices: CommodityPrice[] = [];

    for (const commodity of commodities) {
      try {
        const cached = await this.getCachedCommodityPrice(commodity);
        if (cached && this.isDataFresh(cached.lastUpdated, 'hourly')) {
          prices.push(cached);
          continue;
        }

        const response = await this.throttleRequest(() =>
          axios.get(this.baseUrl, {
            params: {
              function: commodity,
              interval: 'monthly',
              apikey: this.apiKey
            },
            timeout: 10000
          })
        );

        const data = response.data.data;
        if (data && data.length > 0) {
          const latest = data[0];
          const commodityPrice: CommodityPrice = {
            commodity: this.getCommodityName(commodity),
            price: parseFloat(latest.value) || 0,
            change: 0,
            changePercent: 0,
            unit: this.getCommodityUnit(commodity),
            lastUpdated: latest.date || new Date().toISOString()
          };

          if (data.length > 1) {
            const previous = parseFloat(data[1].value);
            commodityPrice.change = commodityPrice.price - previous;
            commodityPrice.changePercent = (commodityPrice.change / previous) * 100;
          }

          await this.cacheCommodityPrice(commodityPrice);
          prices.push(commodityPrice);
        }
      } catch (error) {
        console.error(`Error fetching commodity price for ${commodity}:`, error);
        prices.push(this.getFallbackCommodityPrice(commodity));
      }
    }

    return prices;
  }

  async getSEAMarketData(): Promise<StockQuote[]> {
    const symbols = Object.keys(this.SEA_STOCKS);
    const quotes: StockQuote[] = [];

    for (const symbol of symbols) {
      const quote = await this.getStockQuote(symbol);
      if (quote) {
        quotes.push(quote);
      }
    }

    return quotes;
  }

  private async getCachedStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const { data, error } = await supabase
        .from('market_stocks')
        .select('*')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.change_percent,
        volume: data.volume || 0,
        marketCap: data.market_cap || 0,
        peRatio: 0,
        dividendYield: 0,
        lastUpdated: data.timestamp
      };
    } catch (error) {
      return null;
    }
  }

  private async cacheStockQuote(quote: StockQuote): Promise<void> {
    try {
      await supabase.from('market_stocks').insert({
        symbol: quote.symbol,
        name: quote.name,
        exchange: this.SEA_STOCKS[quote.symbol as keyof typeof this.SEA_STOCKS]?.exchange || '',
        country: '',
        price: quote.price,
        change: quote.change,
        change_percent: quote.changePercent,
        volume: quote.volume,
        market_cap: quote.marketCap,
        timestamp: quote.lastUpdated
      });
    } catch (error) {
      console.error('Error caching stock quote:', error);
    }
  }

  private async getCachedForexRate(from: string, to: string): Promise<ForexRate | null> {
    try {
      const pair = `${from}/${to}`;
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .eq('pair', pair)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        fromCurrency: from,
        toCurrency: to,
        rate: data.rate,
        bid: 0,
        ask: 0,
        lastUpdated: data.timestamp
      };
    } catch (error) {
      return null;
    }
  }

  private async cacheForexRate(rate: ForexRate): Promise<void> {
    try {
      await supabase.from('currency_rates').insert({
        pair: `${rate.fromCurrency}/${rate.toCurrency}`,
        rate: rate.rate,
        change: 0,
        change_percent: 0,
        timestamp: rate.lastUpdated
      });
    } catch (error) {
      console.error('Error caching forex rate:', error);
    }
  }

  private async getCachedCommodityPrice(commodity: string): Promise<CommodityPrice | null> {
    return null;
  }

  private async cacheCommodityPrice(price: CommodityPrice): Promise<void> {
  }

  private isDataFresh(timestamp: string, frequency: 'hourly' | 'daily'): boolean {
    const now = new Date();
    const lastUpdate = new Date(timestamp);
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return frequency === 'hourly' ? diffHours < 1 : diffHours < 24;
  }

  private getFallbackStockQuote(symbol: string): StockQuote {
    const fallbackData: { [key: string]: Partial<StockQuote> } = {
      'SET.BK': { price: 1432.25, change: -12.45, changePercent: -0.86, volume: 82340000000 },
      'STI.SI': { price: 3285.40, change: -5.20, changePercent: -0.16, volume: 1240000000 },
      'KLSE.KL': { price: 1545.80, change: 8.25, changePercent: 0.54, volume: 3240000000 },
      'JCI.JK': { price: 7245.50, change: 45.30, changePercent: 0.63, volume: 8450000000 },
      'PSEI.PS': { price: 6542.15, change: 32.80, changePercent: 0.50, volume: 4580000000 },
      'VNINDEX': { price: 1245.60, change: 18.90, changePercent: 1.54, volume: 12340000000 }
    };

    const data = fallbackData[symbol] || {};
    return {
      symbol,
      name: this.SEA_STOCKS[symbol as keyof typeof this.SEA_STOCKS]?.name || symbol,
      price: data.price || 1000,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      volume: data.volume || 0,
      marketCap: 0,
      peRatio: 0,
      dividendYield: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  private getFallbackForexRate(from: string, to: string): ForexRate {
    const rates: { [key: string]: number } = {
      'USD/THB': 35.42,
      'USD/SGD': 1.35,
      'USD/MYR': 4.68,
      'USD/IDR': 15750,
      'USD/PHP': 56.25,
      'USD/VND': 24350
    };

    const pair = `${from}/${to}`;
    return {
      fromCurrency: from,
      toCurrency: to,
      rate: rates[pair] || 1,
      bid: 0,
      ask: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  private getFallbackCommodityPrice(commodity: string): CommodityPrice {
    const prices: { [key: string]: { price: number; unit: string } } = {
      'WTI': { price: 78.50, unit: 'USD/barrel' },
      'BRENT': { price: 82.30, unit: 'USD/barrel' },
      'NATURAL_GAS': { price: 2.85, unit: 'USD/MMBtu' },
      'COPPER': { price: 8450, unit: 'USD/ton' },
      'ALUMINUM': { price: 2340, unit: 'USD/ton' }
    };

    const data = prices[commodity] || { price: 0, unit: '' };
    return {
      commodity: this.getCommodityName(commodity),
      price: data.price,
      change: 0,
      changePercent: 0,
      unit: data.unit,
      lastUpdated: new Date().toISOString()
    };
  }

  private getCommodityName(code: string): string {
    const names: { [key: string]: string } = {
      'WTI': 'WTI Crude Oil',
      'BRENT': 'Brent Crude Oil',
      'NATURAL_GAS': 'Natural Gas',
      'COPPER': 'Copper',
      'ALUMINUM': 'Aluminum'
    };
    return names[code] || code;
  }

  private getCommodityUnit(code: string): string {
    const units: { [key: string]: string } = {
      'WTI': 'USD/barrel',
      'BRENT': 'USD/barrel',
      'NATURAL_GAS': 'USD/MMBtu',
      'COPPER': 'USD/ton',
      'ALUMINUM': 'USD/ton'
    };
    return units[code] || 'USD';
  }
}
