import axios from 'axios';

interface AlphaVantageObservation {
  /** Provider-supplied observation time; empty when the source omits it. */
  lastUpdated: string;
  observationPeriod?: string;
  retrievedAt?: string;
  source?: string;
  sourceStatus?: 'reported';
  sourceTimeZone?: string;
}

export interface StockQuote extends AlphaVantageObservation {
  symbol: string;
  name: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  peRatio: number | null;
  dividendYield: number | null;
}

export interface ForexRate extends AlphaVantageObservation {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  bid: number | null;
  ask: number | null;
}

export interface CommodityPrice extends AlphaVantageObservation {
  commodity: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  unit: string;
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
    const configuredKey = import.meta.env?.VITE_ALPHAVANTAGE_API_KEY;
    const key = typeof configuredKey === 'string' ? configuredKey.trim() : '';
    // The provider's demo key is not a live data configuration.
    this.apiKey = key.toLowerCase() === 'demo' ? '' : key;
  }

  public static getInstance(): AlphaVantageService {
    if (!AlphaVantageService.instance) AlphaVantageService.instance = new AlphaVantageService();
    return AlphaVantageService.instance;
  }

  private async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const wait = this.MIN_REQUEST_INTERVAL - (Date.now() - this.lastRequestTime);
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    this.lastRequestTime = Date.now();
    return requestFn();
  }

  private numeric(value: unknown): number | null {
    if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  private observation(period: unknown, timeZone?: unknown): AlphaVantageObservation {
    const observationPeriod = typeof period === 'string' && period.trim() ? period.trim() : undefined;
    return {
      lastUpdated: observationPeriod || '', observationPeriod, retrievedAt: new Date().toISOString(),
      source: 'Alpha Vantage', sourceStatus: 'reported',
      ...(typeof timeZone === 'string' && timeZone.trim() ? { sourceTimeZone: timeZone.trim() } : {})
    };
  }

  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    if (!this.apiKey || !symbol.trim()) return null;
    try {
      const response = await this.throttleRequest(() => axios.get(this.baseUrl, {
        params: { function: 'GLOBAL_QUOTE', symbol, apikey: this.apiKey }, timeout: 10000
      }));
      const quote = response.data?.['Global Quote'];
      const price = this.numeric(quote?.['05. price']);
      if (price === null || (quote['01. symbol'] && quote['01. symbol'] !== symbol)) return null;
      return {
        symbol, name: Object.entries(this.SEA_STOCKS).find(([code]) => code === symbol)?.[1].name || symbol,
        price, change: this.numeric(quote['09. change']),
        changePercent: this.numeric(typeof quote['10. change percent'] === 'string'
          ? quote['10. change percent'].replace('%', '') : quote['10. change percent']),
        volume: this.numeric(quote['06. volume']), marketCap: null, peRatio: null, dividendYield: null,
        ...this.observation(quote['07. latest trading day'])
      };
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      return null;
    }
  }

  async getForexRate(fromCurrency: string, toCurrency: string): Promise<ForexRate | null> {
    if (!this.apiKey || !fromCurrency.trim() || !toCurrency.trim()) return null;
    try {
      const response = await this.throttleRequest(() => axios.get(this.baseUrl, {
        params: { function: 'CURRENCY_EXCHANGE_RATE', from_currency: fromCurrency,
          to_currency: toCurrency, apikey: this.apiKey }, timeout: 10000
      }));
      const data = response.data?.['Realtime Currency Exchange Rate'];
      const rate = this.numeric(data?.['5. Exchange Rate']);
      if (rate === null ||
        (data['1. From_Currency Code'] && data['1. From_Currency Code'] !== fromCurrency) ||
        (data['3. To_Currency Code'] && data['3. To_Currency Code'] !== toCurrency)) return null;
      return {
        fromCurrency, toCurrency, rate, bid: this.numeric(data['8. Bid Price']), ask: this.numeric(data['9. Ask Price']),
        ...this.observation(data['6. Last Refreshed'], data['7. Time Zone'])
      };
    } catch (error) {
      console.error(`Error fetching forex rate ${fromCurrency}/${toCurrency}:`, error);
      return null;
    }
  }

  async getCommodityPrices(): Promise<CommodityPrice[]> {
    if (!this.apiKey) return [];
    const prices: CommodityPrice[] = [];
    for (const commodity of ['WTI', 'BRENT', 'NATURAL_GAS', 'COPPER', 'ALUMINUM']) {
      try {
        const response = await this.throttleRequest(() => axios.get(this.baseUrl, {
          params: { function: commodity, interval: 'monthly', apikey: this.apiKey }, timeout: 10000
        }));
        const data = response.data?.data;
        if (!Array.isArray(data) || data.length === 0) continue;
        const latest = data[0];
        const price = this.numeric(latest?.value);
        if (price === null) continue;
        const previous = this.numeric(data[1]?.value);
        const change = previous === null ? null : price - previous;
        const changePercent = previous === null || previous === 0 || change === null ? null : (change / previous) * 100;
        prices.push({
          commodity: this.getCommodityName(commodity), price, change,
          changePercent: changePercent !== null && Number.isFinite(changePercent) ? changePercent : null,
          unit: typeof response.data.unit === 'string' && response.data.unit.trim()
            ? response.data.unit.trim() : '',
          ...this.observation(latest.date)
        });
      } catch (error) {
        console.error(`Error fetching commodity price for ${commodity}:`, error);
      }
    }
    return prices;
  }

  async getSEAMarketData(): Promise<StockQuote[]> {
    if (!this.apiKey) return [];
    const quotes: StockQuote[] = [];
    for (const symbol of Object.keys(this.SEA_STOCKS)) {
      const quote = await this.getStockQuote(symbol);
      if (quote) quotes.push(quote);
    }
    return quotes;
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

}
