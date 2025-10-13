import { WorldBankService } from './worldBankService';
import { IMFService } from './imfService';
import { MarketDataService } from './marketDataService';
import { MarketHoursService } from './marketHoursService';

export interface UnifiedEconomicData {
  country: string;
  gdp: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  population: number;
  gdpPerCapita: number;
  internetUsers: number;
  exchangeRate: number;
  interestRate: number;
  source: string;
  lastUpdated: string;
}

export interface DataFreshness {
  isFresh: boolean;
  age: number;
  source: string;
  lastUpdated: string;
}

export class UnifiedDataService {
  private static instance: UnifiedDataService;
  private worldBankService: WorldBankService;
  private imfService: IMFService;
  private marketDataService: MarketDataService;
  private marketHoursService: MarketHoursService;

  private dataCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 300000;
  private readonly FAST_TTL = 60000;
  private readonly MARKET_UPDATE_INTERVAL = 300000;

  private updateCallbacks: Map<string, Array<(data: any) => void>> = new Map();
  private updateIntervalId: NodeJS.Timeout | null = null;

  public static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }

  constructor() {
    this.worldBankService = WorldBankService.getInstance();
    this.imfService = IMFService.getInstance();
    this.marketDataService = MarketDataService.getInstance();
    this.marketHoursService = MarketHoursService.getInstance();
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async getUnifiedEconomicData(countries: string[] = []): Promise<UnifiedEconomicData[]> {
    const cacheKey = `economic_${countries.sort().join('_')}`;
    const cached = this.getCachedData<UnifiedEconomicData[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const [worldBankData, imfData, economicIndicators] = await Promise.all([
        this.worldBankService.getAllEconomicIndicators(countries),
        this.imfService.getAllEconomicData(countries),
        Promise.resolve(this.marketDataService.getEconomicIndicators())
      ]);

      const unifiedData: UnifiedEconomicData[] = [];

      const allCountries = new Set([
        ...Object.keys(worldBankData),
        ...Object.keys(imfData),
        ...economicIndicators.map(e => e.country)
      ]);

      for (const country of allCountries) {
        const wb = worldBankData[country] || {};
        const imf = imfData[country] || {};
        const econ = economicIndicators.find(e => e.country === country);

        const latestGrowth = imf.gdpGrowthHistory && imf.gdpGrowthHistory.length > 0
          ? imf.gdpGrowthHistory.sort((a: any, b: any) => b.year - a.year)[0].value
          : 0;

        unifiedData.push({
          country,
          gdp: wb.gdp || econ?.gdp || 0,
          gdpGrowth: latestGrowth,
          inflation: wb.inflation || imf.inflation || econ?.inflation || 0,
          unemployment: wb.unemployment || econ?.unemployment || 0,
          population: wb.population || 0,
          gdpPerCapita: imf.gdpPerCapita || 0,
          internetUsers: wb.internetUsers || 0,
          exchangeRate: econ?.exchangeRate || 1,
          interestRate: econ?.interestRate || 0,
          source: 'World Bank, IMF, Live Market Data',
          lastUpdated: new Date().toISOString()
        });
      }

      this.setCachedData(cacheKey, unifiedData);
      this.notifySubscribers(cacheKey, unifiedData);

      return unifiedData;
    } catch (error) {
      console.error('Error fetching unified economic data:', error);

      const fallbackData = this.marketDataService.getEconomicIndicators();
      return fallbackData.map(e => ({
        country: e.country,
        gdp: e.gdp,
        gdpGrowth: 0,
        inflation: e.inflation,
        unemployment: e.unemployment,
        population: 0,
        gdpPerCapita: 0,
        internetUsers: 0,
        exchangeRate: e.exchangeRate,
        interestRate: e.interestRate,
        source: 'Fallback Data',
        lastUpdated: new Date().toISOString()
      }));
    }
  }

  async getMarketData(symbols: string[]): Promise<any[]> {
    const cacheKey = `market_${symbols.sort().join('_')}`;
    const cached = this.getCachedData<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const data = await this.marketDataService.getStockData(symbols);
      this.setCachedData(cacheKey, data, this.FAST_TTL);
      this.notifySubscribers(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  async getCurrencyRates(): Promise<any[]> {
    const cacheKey = 'currency_rates';
    const cached = this.getCachedData<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const data = await this.marketDataService.getCurrencyRates();
      this.setCachedData(cacheKey, data, this.FAST_TTL);
      this.notifySubscribers(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return [];
    }
  }

  async getGDPGrowthTrends(countries: string[] = []): Promise<any> {
    const cacheKey = `gdp_trends_${countries.sort().join('_')}`;
    const cached = this.getCachedData<any>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const imfData = await this.imfService.getAllEconomicData(countries);

      const trendsData: any[] = [];
      const years = ['2020', '2021', '2022', '2023', '2024', '2025'];

      years.forEach(year => {
        const yearData: any = { year };

        Object.keys(imfData).forEach(country => {
          const growthHistory = imfData[country].gdpGrowthHistory || [];
          const yearValue = growthHistory.find((h: any) => h.year === parseInt(year));
          if (yearValue) {
            yearData[country] = yearValue.value;
          }
        });

        if (Object.keys(yearData).length > 1) {
          trendsData.push(yearData);
        }
      });

      this.setCachedData(cacheKey, trendsData);
      return trendsData;
    } catch (error) {
      console.error('Error fetching GDP growth trends:', error);
      return [];
    }
  }

  async getInstitutionalReports(): Promise<any[]> {
    const cacheKey = 'institutional_reports';
    const cached = this.getCachedData<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const imfReports = this.imfService.getIMFReports();

      const worldBankReports = [
        {
          title: 'East Asia and Pacific Economic Update',
          organization: 'World Bank',
          country: 'East Asia & Pacific',
          summary: 'Latest economic developments and projections for the East Asia and Pacific region, including detailed country analysis for Indonesia, Thailand, Philippines, Vietnam, and Malaysia.',
          publicationDate: '2024-10-01',
          url: 'https://www.worldbank.org/en/region/eap/publication/east-asia-pacific-economic-update',
          type: 'Economic Update'
        },
        {
          title: 'World Development Indicators',
          organization: 'World Bank',
          country: 'Global',
          summary: 'Comprehensive compilation of cross-country comparable data on development covering demographics, economy, environment, education, health, infrastructure, and governance.',
          publicationDate: '2024-09-15',
          url: 'https://datatopics.worldbank.org/world-development-indicators/',
          type: 'Statistical Database'
        },
        {
          title: 'Doing Business in ASEAN',
          organization: 'World Bank',
          country: 'ASEAN',
          summary: 'Analysis of business regulations and their enforcement across ASEAN countries, covering starting a business, dealing with construction permits, getting electricity, registering property, and more.',
          publicationDate: '2024-08-20',
          url: 'https://www.worldbank.org/en/programs/business-enabling-environment',
          type: 'Business Environment Report'
        }
      ];

      const aseanReports = [
        {
          title: 'ASEAN Investment Report 2024',
          organization: 'ASEAN Secretariat',
          country: 'ASEAN',
          summary: 'Comprehensive analysis of FDI flows, investment policies, and opportunities across ASEAN member states. Covers digital economy investments, sustainable finance, and regional integration progress.',
          publicationDate: '2024-11-15',
          url: 'https://asean.org/book/asean-investment-report-2024/',
          type: 'Investment Report'
        },
        {
          title: 'ASEAN Key Figures 2024',
          organization: 'ASEAN Secretariat',
          country: 'ASEAN',
          summary: 'Statistical publication providing key economic and social indicators for ASEAN countries including GDP, trade, investment, population, and sectoral performance.',
          publicationDate: '2024-10-30',
          url: 'https://www.aseanstats.org/publication/asean-key-figures-2024/',
          type: 'Statistical Publication'
        }
      ];

      const allReports = [...imfReports, ...worldBankReports, ...aseanReports];

      this.setCachedData(cacheKey, allReports, 3600000);
      return allReports;
    } catch (error) {
      console.error('Error fetching institutional reports:', error);
      return [];
    }
  }

  getDataFreshness(key: string): DataFreshness {
    const cached = this.dataCache.get(key);

    if (!cached) {
      return {
        isFresh: false,
        age: -1,
        source: 'No data',
        lastUpdated: 'Never'
      };
    }

    const age = Date.now() - cached.timestamp;
    const isFresh = age < cached.ttl;

    return {
      isFresh,
      age,
      source: 'Cached',
      lastUpdated: new Date(cached.timestamp).toISOString()
    };
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, []);
    }

    this.updateCallbacks.get(key)!.push(callback);

    return () => {
      const callbacks = this.updateCallbacks.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifySubscribers(key: string, data: any): void {
    const callbacks = this.updateCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clearCache(key?: string): void {
    if (key) {
      this.dataCache.delete(key);
    } else {
      this.dataCache.clear();
    }
  }

  startRealTimeUpdates(): () => void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }

    const updateIfMarketOpen = async () => {
      const isAnyMarketOpen = this.marketHoursService.isAnyMarketOpen();

      if (isAnyMarketOpen) {
        try {
          await Promise.all([
            this.getMarketData(['SET.BK', 'STI.SI', 'KLCI.KL', 'JKSE.JK', 'PSEI.PS', 'VN-INDEX.HM']),
            this.getCurrencyRates()
          ]);
          console.log('Market data updated at', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Error during real-time update:', error);
        }
      } else {
        console.log('All markets closed. Skipping update.');
      }
    };

    updateIfMarketOpen();

    this.updateIntervalId = setInterval(updateIfMarketOpen, this.MARKET_UPDATE_INTERVAL);

    return () => {
      if (this.updateIntervalId) {
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
      }
    };
  }
}
