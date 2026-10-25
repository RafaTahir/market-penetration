import { WorldBankService } from './worldBankService';
import { IMFService, IMFReport } from './imfService';
import { MarketDataService, MarketData, CurrencyRate } from './marketDataService';
import { MarketHoursService } from './marketHoursService';
import { BrowserCacheService } from './browserCacheService';

export type EconomicMetric = 'gdp' | 'gdpGrowth' | 'inflation' | 'unemployment' | 'population' | 'gdpPerCapita' | 'internetUsers' | 'exchangeRate' | 'interestRate';

export interface MetricEvidence {
  source: string;
  observationPeriod: string | null;
  retrievedAt: string | null;
  status: 'reported' | 'cached-unverified' | 'derived' | 'unavailable';
  limitation: string;
}

export interface UnifiedEconomicData {
  country: string;
  gdp: number | null;
  gdpGrowth: number | null;
  inflation: number | null;
  unemployment: number | null;
  population: number | null;
  gdpPerCapita: number | null;
  internetUsers: number | null;
  exchangeRate: number | null;
  interestRate: number | null;
  source: string;
  lastUpdated: string;
  metricEvidence?: Partial<Record<EconomicMetric, MetricEvidence>>;
}

export interface DataFreshness {
  isFresh: boolean;
  age: number;
  source: string;
  lastUpdated: string;
}

interface ProviderEconomicData extends Record<string, unknown> {
  gdp?: number;
  inflation?: number;
  unemployment?: number;
  population?: number;
  internetUsers?: number;
  gdpPerCapita?: number;
  gdpGrowthHistory?: Array<{ year: number; value: number; observationPeriod?: string; retrievedAt?: string; dataStatus?: string }>;
}

interface GDPGrowthTrend {
  year: string;
  [country: string]: number | string;
}

export class UnifiedDataService {
  private static instance: UnifiedDataService;
  private worldBankService: WorldBankService;
  private imfService: IMFService;
  private marketDataService: MarketDataService;
  private marketHoursService: MarketHoursService;

  private dataCache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  private browserCache: BrowserCacheService;
  private readonly DEFAULT_TTL = 300000;
  private readonly FAST_TTL = 60000;
  private readonly MARKET_UPDATE_INTERVAL = 300000;
  private readonly BROWSER_CACHE_TTL = 600000;

  private updateCallbacks: Map<string, Array<(data: unknown) => void>> = new Map();
  private updateIntervalId: ReturnType<typeof setInterval> | null = null;

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
    this.browserCache = BrowserCacheService.getInstance();
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }

    const browserCached = this.browserCache.get<T>(key);
    if (browserCached) {
      this.dataCache.set(key, {
        data: browserCached,
        timestamp: Date.now(),
        ttl: this.DEFAULT_TTL
      });
      return browserCached;
    }

    return null;
  }

  private setCachedData(key: string, data: unknown, ttl: number = this.DEFAULT_TTL): void {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    this.browserCache.set(key, data, this.BROWSER_CACHE_TTL);
  }

  async getUnifiedEconomicData(countries: string[] = []): Promise<UnifiedEconomicData[]> {
    const cacheKey = `economic_integrity_v1_${[...countries].sort().join('_')}`;
    const cached = this.getCachedData<UnifiedEconomicData[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const stale = this.browserCache.getStale<UnifiedEconomicData[]>(cacheKey);
    if (stale && stale.age < 3600000) {
      void this.fetchAndCacheEconomicData(countries, cacheKey);
      return stale.data;
    }

    return this.fetchAndCacheEconomicData(countries, cacheKey);
  }

  private async fetchAndCacheEconomicData(countries: string[], cacheKey: string): Promise<UnifiedEconomicData[]> {
    const supported = ['Indonesia', 'Thailand', 'Singapore', 'Malaysia', 'Vietnam', 'Philippines'];
    const selected = supported.filter(country => countries.length === 0 || countries.some(requested => requested.trim().toLowerCase() === country.toLowerCase()));
    if (selected.length === 0) return [];
    const [wbResult, imfResult] = await Promise.allSettled([
      this.worldBankService.getAllEconomicIndicators(selected),
      this.imfService.getAllEconomicData(selected)
    ]);
    const worldBank: Record<string, ProviderEconomicData> = wbResult.status === 'fulfilled' ? wbResult.value : {};
    const imfData: Record<string, ProviderEconomicData> = imfResult.status === 'fulfilled' ? imfResult.value : {};
    const metrics: EconomicMetric[] = ['gdp', 'gdpGrowth', 'inflation', 'unemployment', 'population', 'gdpPerCapita', 'internetUsers', 'exchangeRate', 'interestRate'];
    const rows: UnifiedEconomicData[] = [];
    const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
    const period = (record: ProviderEconomicData, field: string): string | null => {
      const explicit = record[field + 'ObservationPeriod'];
      if (typeof explicit === 'string' && /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(explicit)) return explicit;
      const year = record[field + 'Year'];
      return typeof year === 'number' && Number.isInteger(year) ? String(year) : null;
    };
    const retrieved = (record: ProviderEconomicData, field: string): string | null => {
      const value = record[field + 'RetrievedAt'] ?? record.retrievedAt;
      return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
    };
    for (const country of selected) {
      const wb = worldBank[country] || (country === 'Vietnam' ? worldBank['Viet Nam'] : undefined) || {};
      const imf = imfData[country] || {};
      const evidence = Object.fromEntries(metrics.map(metric => [metric, {
        source: 'Unavailable', observationPeriod: null, retrievedAt: null, status: 'unavailable',
        limitation: 'No source record is available. No estimate or zero was substituted.'
      }])) as Record<EconomicMetric, MetricEvidence>;
      const data: UnifiedEconomicData = {
        country, gdp: null, gdpGrowth: null, inflation: null, unemployment: null, population: null,
        gdpPerCapita: null, internetUsers: null, exchangeRate: null, interestRate: null,
        source: '', lastUpdated: '', metricEvidence: evidence
      };
      const put = (metric: EconomicMetric, record: ProviderEconomicData, key: string, source: string, scale = 1) => {
        const value = record[key];
        if (!finite(value)) return;
        const scaled = value * scale;
        if (!Number.isFinite(scaled)) return;
        data[metric] = scaled;
        evidence[metric] = {
          source, observationPeriod: period(record, key), retrievedAt: retrieved(record, key), status: 'reported',
          limitation: 'Provider-reported series; source contents and actual/estimate classification have not been independently verified. Retrieval time is not an observation date.'
        };
      };
      put('gdp', wb, 'gdp', 'World Bank API', 1e9);
      put('population', wb, 'population', 'World Bank API', 1e6);
      put('inflation', wb, 'inflation', 'World Bank API');
      if (data.inflation === null) put('inflation', imf, 'inflation', 'IMF DataMapper');
      put('unemployment', wb, 'unemployment', 'World Bank API');
      put('gdpPerCapita', imf, 'gdpPerCapita', 'IMF DataMapper');
      const growth = [...(imf.gdpGrowthHistory || [])].filter(item =>
        finite(item.value) && item.year < new Date().getUTCFullYear() && item.dataStatus !== 'forecast'
      ).sort((a, b) => b.year - a.year)[0];
      if (growth) {
        data.gdpGrowth = growth.value;
        evidence.gdpGrowth = { source: 'IMF DataMapper', observationPeriod: growth.observationPeriod || String(growth.year), retrievedAt: growth.retrievedAt || null,
          status: 'reported', limitation: 'Reported past-year series; actual/estimate classification has not been independently verified. Forecast/current-year rows are excluded.' };
      }
      const populationPeriod = period(wb, 'population');
      const internetPeriod = period(wb, 'internetUsers');
      if (finite(wb.internetUsers) && wb.internetUsers >= 0 && wb.internetUsers <= 100 && data.population !== null && populationPeriod && populationPeriod === internetPeriod) {
        data.internetUsers = data.population * (wb.internetUsers / 100);
        evidence.internetUsers = { source: 'Derived from World Bank population and internet-use percentage', observationPeriod: populationPeriod,
          retrievedAt: retrieved(wb, 'internetUsers'), status: 'derived', limitation: 'Arithmetic estimate from same-period series, not a directly observed person count; source accuracy has not been independently verified.' };
      } else {
        evidence.internetUsers.limitation = 'A count cannot be derived without same-period population and internet-use percentage. No cross-year estimate was substituted.';
      }
      if (!metrics.some(metric => data[metric] !== null)) continue;
      data.source = [...new Set(metrics.filter(metric => data[metric] !== null).map(metric => evidence[metric].source))].join('; ') + ' — provider-reported or derived, not independently verified';
      rows.push(data);
    }
    this.setCachedData(cacheKey, rows);
    this.notifySubscribers(cacheKey, rows);
    return rows;
  }

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    const cacheKey = `market_integrity_v1_${[...symbols].sort().join('_')}`;
    const cached = this.getCachedData<MarketData[]>(cacheKey);

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

  async getCurrencyRates(): Promise<CurrencyRate[]> {
    const cacheKey = 'currency_rates_integrity_v1';
    const cached = this.getCachedData<CurrencyRate[]>(cacheKey);

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

  async getGDPGrowthTrends(countries: string[] = []): Promise<GDPGrowthTrend[]> {
    const cacheKey = `gdp_trends_${[...countries].sort().join('_')}`;
    const cached = this.getCachedData<GDPGrowthTrend[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const imfData: Record<string, ProviderEconomicData> = await this.imfService.getAllEconomicData(countries);

      const trendsData: GDPGrowthTrend[] = [];
      const years = ['2020', '2021', '2022', '2023', '2024', '2025'];

      years.forEach(year => {
        const yearData: GDPGrowthTrend = { year };

        Object.keys(imfData).forEach(country => {
          const growthHistory = imfData[country].gdpGrowthHistory || [];
          const yearValue = growthHistory.find(history => history.year === parseInt(year));
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

  async getInstitutionalReports(): Promise<IMFReport[]> {
    // Discovery links are not fetched reports or verified publication records.
    return [
      { title: 'IMF DataMapper', organization: 'IMF', country: 'Global', summary: 'Official data discovery portal. Contents, editions, observation periods and applicability have not been verified.', publicationDate: '', url: 'https://www.imf.org/external/datamapper/', type: 'Reference link (unverified)' },
      { title: 'World Bank Open Data', organization: 'World Bank', country: 'Global', summary: 'Official data discovery portal. No publication date or current business applicability is established by this directory.', publicationDate: '', url: 'https://data.worldbank.org/', type: 'Reference link (unverified)' },
      { title: 'ASEANstats Data Portal', organization: 'ASEAN Secretariat', country: 'ASEAN', summary: 'Regional data discovery portal. Linked content has not been fetched, checked or incorporated as verified research.', publicationDate: '', url: 'https://data.aseanstats.org/', type: 'Reference link (unverified)' }
    ];
  }

  getDataFreshness(key: string): DataFreshness {
    const cached = this.dataCache.get(key);
    const rows: unknown[] = Array.isArray(cached?.data) ? cached.data : [];
    const timestamps = rows.map(row => {
      if (typeof row !== 'object' || row === null || !('lastUpdated' in row)) return NaN;
      return typeof row.lastUpdated === 'string' ? Date.parse(row.lastUpdated) : NaN;
    });
    if (!cached || rows.length === 0 || timestamps.some((timestamp: number) => !Number.isFinite(timestamp))) {
      return {
        isFresh: false,
        age: -1,
        source: rows.length ? 'Observation date unavailable' : 'No data',
        lastUpdated: ''
      };
    }

    const oldestObservation = Math.min(...timestamps);
    const age = Date.now() - oldestObservation;
    const isFresh = age >= 0 && age < cached.ttl;

    return {
      isFresh,
      age,
      source: 'Stored observation dates; provider provenance requires review',
      lastUpdated: new Date(oldestObservation).toISOString()
    };
  }

  subscribe(key: string, callback: (data: unknown) => void): () => void {
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

  private notifySubscribers(key: string, data: unknown): void {
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
          await Promise.allSettled([
            this.getMarketData(['SET.BK', 'STI.SI', 'KLCI.KL', 'JKSE.JK', 'PSEI.PS', 'VN-INDEX.HM']),
            this.getCurrencyRates()
          ]);
        } catch (error) {
          console.error('Error during real-time update:', error);
        }
      }
    };

    this.updateIntervalId = setInterval(updateIfMarketOpen, this.MARKET_UPDATE_INTERVAL);

    return () => {
      if (this.updateIntervalId) {
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
      }
    };
  }
}
