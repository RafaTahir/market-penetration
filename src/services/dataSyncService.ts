import { supabase, isSupabaseConfigured, SUPABASE_UNAVAILABLE_MESSAGE } from './supabaseClient';
import { WorldBankService } from './worldBankService';
import { IMFService } from './imfService';
import { OECDService } from './oecdService';
import { TradeDataService } from './tradeDataService';
import { CaseStudyService } from './caseStudyService';

export interface DataSyncStatus {
  source: string;
  lastSync: Date | null;
  nextSync: Date | null;
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  recordsUpdated: number;
  errorMessage?: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export class DataSyncService {
  private static instance: DataSyncService;
  private syncInProgress = false;
  private syncIntervals: Record<string, ReturnType<typeof setInterval>> = {};
  private hasStarted = false;

  private readonly SYNC_SCHEDULES: Record<string, { frequency: DataSyncStatus['frequency']; intervalMs: number }> = {
    'market_data': { frequency: 'hourly' as const, intervalMs: 3600000 },
    'currency_rates': { frequency: 'hourly' as const, intervalMs: 3600000 },
    'world_bank': { frequency: 'daily' as const, intervalMs: 86400000 },
    'imf_data': { frequency: 'daily' as const, intervalMs: 86400000 },
    'oecd_data': { frequency: 'daily' as const, intervalMs: 86400000 },
    'trade_data': { frequency: 'weekly' as const, intervalMs: 604800000 },
    'case_studies': { frequency: 'monthly' as const, intervalMs: 2592000000 }
  };

  private constructor() {}

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  async startAutomaticSync(): Promise<void> {
    if (!isSupabaseConfigured || this.hasStarted) {
      return;
    }
    this.hasStarted = true;

    console.log('Starting automatic data synchronization...');

    const sources = Object.entries(this.SYNC_SCHEDULES);

    // Scheduling is explicit and never triggers an initial remote write.
    sources.forEach(([source, schedule]) => {
      if (this.syncIntervals[source]) {
        clearInterval(this.syncIntervals[source]);
      }
      let nextSyncAt = Date.now() + schedule.intervalMs;
      this.syncIntervals[source] = setInterval(
        () => {
          if (Date.now() < nextSyncAt) return;
          nextSyncAt = Date.now() + schedule.intervalMs;
          void this.syncDataSource(source);
        },
        // Monthly delays exceed the browser's signed 32-bit timer limit.
        Math.min(schedule.intervalMs, 86400000)
      );
    });
  }

  stopAutomaticSync(): void {
    console.log('Stopping automatic data synchronization...');
    Object.keys(this.syncIntervals).forEach(source => {
      if (this.syncIntervals[source]) {
        clearInterval(this.syncIntervals[source]);
        delete this.syncIntervals[source];
      }
    });
    this.hasStarted = false;
  }

  async syncDataSource(source: string): Promise<DataSyncStatus> {
    if (!isSupabaseConfigured) return this.unavailableStatus(source);

    if (this.syncInProgress) {
      return {
        source,
        lastSync: null,
        nextSync: null,
        status: 'pending',
        recordsUpdated: 0,
        errorMessage: 'Another sync is in progress',
        frequency: this.SYNC_SCHEDULES[source]?.frequency || 'daily'
      };
    }

    this.syncInProgress = true;
    const startTime = new Date();
    let status: DataSyncStatus = {
      source,
      lastSync: startTime,
      nextSync: this.calculateNextSync(source),
      status: 'in_progress',
      recordsUpdated: 0,
      frequency: this.SYNC_SCHEDULES[source]?.frequency || 'daily'
    };

    try {
      await this.updateRefreshLog(source, 'in_progress');

      let recordsUpdated = 0;
      let lastError: Error | null = null;

      // Retry up to 2 times with exponential backoff for rate-limit (429) errors
      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          switch (source) {
            case 'market_data':
              recordsUpdated = await this.syncMarketData();
              break;
            case 'currency_rates':
              recordsUpdated = await this.syncCurrencyRates();
              break;
            case 'world_bank':
              recordsUpdated = await this.syncWorldBankData();
              break;
            case 'imf_data':
              recordsUpdated = await this.syncIMFData();
              break;
            case 'oecd_data':
              recordsUpdated = await this.syncOECDData();
              break;
            case 'trade_data':
              recordsUpdated = await this.syncTradeData();
              break;
            case 'case_studies':
              recordsUpdated = await this.syncCaseStudies();
              break;
            default:
              throw new Error(`Unknown data source: ${source}`);
          }
          lastError = null;
          break; // success — no retry needed
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          const isRateLimit = lastError.message.includes('429') || lastError.message.toLowerCase().includes('rate limit');
          if (isRateLimit && attempt < MAX_RETRIES) {
            const backoffMs = (attempt + 1) * 3000; // 3s, then 6s
            console.warn(`Rate limited on ${source}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
          throw lastError;
        }
      }

      if (recordsUpdated === 0) {
        throw new Error('No source records were available to synchronize. Check the provider connection and data coverage before retrying.');
      }

      status = {
        ...status,
        status: 'success',
        recordsUpdated,
        lastSync: new Date()
      };

      await this.updateRefreshLog(source, 'success', recordsUpdated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      status = {
        ...status,
        status: 'failed',
        lastSync: null,
        nextSync: null,
        recordsUpdated: 0,
        errorMessage
      };

      await this.updateRefreshLog(source, 'failed', 0, errorMessage).catch(logError => {
        console.error('Could not record sync failure:', logError);
      });
      console.error(`Error syncing ${source}:`, error);
    } finally {
      this.syncInProgress = false;
    }

    return status;
  }

  async getSyncStatus(): Promise<DataSyncStatus[]> {
    if (!isSupabaseConfigured) {
      return Object.keys(this.SYNC_SCHEDULES).map(source => this.unavailableStatus(source));
    }

    try {
      const { data, error } = await supabase
        .from('data_refresh_log')
        .select('*')
        .order('last_refresh', { ascending: false });

      if (error) {
        console.error('Error fetching sync status:', error);
        return [];
      }

      return (data || []).map(record => ({
        source: record.data_source,
        lastSync: record.last_refresh ? new Date(record.last_refresh) : null,
        nextSync: record.next_refresh ? new Date(record.next_refresh) : null,
        status: record.refresh_status as DataSyncStatus['status'],
        recordsUpdated: record.records_updated || 0,
        errorMessage: record.error_message,
        frequency: record.refresh_frequency as DataSyncStatus['frequency']
      }));
    } catch (error) {
      console.error('Error in getSyncStatus:', error);
      return [];
    }
  }

  private unavailableStatus(source: string): DataSyncStatus {
    return {
      source,
      lastSync: null,
      nextSync: null,
      status: 'failed',
      recordsUpdated: 0,
      errorMessage: SUPABASE_UNAVAILABLE_MESSAGE,
      frequency: this.SYNC_SCHEDULES[source]?.frequency || 'daily',
    };
  }

  async forceSync(source?: string): Promise<DataSyncStatus[]> {
    const sources = source
      ? [source]
      : Object.keys(this.SYNC_SCHEDULES);

    const results: DataSyncStatus[] = [];

    for (const src of sources) {
      const result = await this.syncDataSource(src);
      results.push(result);
    }

    return results;
  }

  private async syncMarketData(): Promise<number> {
    throw new Error('Market quote refresh is unavailable. Browsing reads stored quotes only; cached records are not newly synchronized provider observations.');
  }

  private async syncCurrencyRates(): Promise<number> {
    throw new Error('Currency synchronization is unavailable. Browsing may reuse provider cache; a cache read cannot establish a successful source refresh.');
  }

  private async syncWorldBankData(): Promise<number> {
    try {
      const wbService = WorldBankService.getInstance();
      const countries = ['indonesia', 'thailand', 'singapore', 'malaysia', 'philippines', 'vietnam'];

      const [gdp, inflation, unemployment, population] = await Promise.all([
        wbService.getGDPData(countries),
        wbService.getInflationData(countries),
        wbService.getUnemploymentData(countries),
        wbService.getPopulationData(countries)
      ]);

      return gdp.length + inflation.length + unemployment.length + population.length;
    } catch (error) {
      console.error('Error syncing World Bank data:', error);
      throw error;
    }
  }

  private async syncIMFData(): Promise<number> {
    try {
      const imfService = IMFService.getInstance();
      const countries = ['indonesia', 'thailand', 'singapore', 'malaysia', 'philippines', 'vietnam'];

      const [gdpGrowth, inflation, gdpPerCapita] = await Promise.all([
        imfService.getGDPGrowth(countries),
        imfService.getInflationRate(countries),
        imfService.getGDPPerCapita(countries)
      ]);

      return gdpGrowth.length + inflation.length + gdpPerCapita.length;
    } catch (error) {
      console.error('Error syncing IMF data:', error);
      throw error;
    }
  }

  private async syncOECDData(): Promise<number> {
    try {
      const oecdService = OECDService.getInstance();
      const countries = ['indonesia', 'thailand', 'singapore', 'malaysia', 'philippines', 'vietnam'];

      const indicators: Record<string, Record<string, unknown>> = await oecdService.getAllIndicators(countries);
      return Object.values(indicators).reduce((total, country) => total + Object.values(country).filter(value =>
        value !== null && typeof value === 'object' && 'value' in value
      ).length, 0);
    } catch (error) {
      console.error('Error syncing OECD data:', error);
      throw error;
    }
  }

  private async syncTradeData(): Promise<number> {
    try {
      const tradeService = TradeDataService.getInstance();
      const countries = ['indonesia', 'thailand', 'singapore', 'malaysia', 'philippines', 'vietnam'];

      let total = 0;
      for (const country of countries) {
        const balance = await tradeService.getTradeBalance(country, 2023);
        if (balance) total += balance.topExports.length + balance.topImports.length;
      }

      return total;
    } catch (error) {
      console.error('Error syncing trade data:', error);
      throw error;
    }
  }

  private async syncCaseStudies(): Promise<number> {
    try {
      const caseStudyService = CaseStudyService.getInstance();
      const studies = await caseStudyService.getCaseStudies();
      return studies.length;
    } catch (error) {
      console.error('Error syncing case studies:', error);
      throw error;
    }
  }

  private async updateRefreshLog(
    source: string,
    status: 'success' | 'failed' | 'pending' | 'in_progress',
    recordsUpdated: number = 0,
    errorMessage?: string
  ): Promise<void> {
    try {
      const schedule = this.SYNC_SCHEDULES[source];
      const now = new Date();
      const nextRefresh = schedule
        ? new Date(now.getTime() + schedule.intervalMs)
        : null;

      const { error } = await supabase.from('data_refresh_log').upsert({
        data_source: source,
        endpoint: source,
        last_refresh: now.toISOString(),
        next_refresh: nextRefresh?.toISOString(),
        refresh_status: status,
        records_updated: recordsUpdated,
        error_message: errorMessage,
        refresh_frequency: schedule?.frequency || 'daily'
      }, {
        onConflict: 'data_source'
      });

      if (error) {
        throw new Error(`Could not update the sync log: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in updateRefreshLog:', error);
      throw error;
    }
  }

  private calculateNextSync(source: string): Date {
    const schedule = this.SYNC_SCHEDULES[source];
    if (!schedule) {
      return new Date(Date.now() + 86400000);
    }

    return new Date(Date.now() + schedule.intervalMs);
  }

  async getDataFreshness(): Promise<{ [source: string]: { age: number; status: string } }> {
    const status = await this.getSyncStatus();
    const freshness: { [source: string]: { age: number; status: string } } = {};

    status.forEach(s => {
      if (s.lastSync) {
        const ageMs = Date.now() - s.lastSync.getTime();
        const ageHours = ageMs / (1000 * 60 * 60);

        let freshnessStatus = 'fresh';
        if (s.frequency === 'hourly' && ageHours > 2) freshnessStatus = 'stale';
        if (s.frequency === 'daily' && ageHours > 48) freshnessStatus = 'stale';
        if (s.frequency === 'weekly' && ageHours > 168 * 1.5) freshnessStatus = 'stale';

        freshness[s.source] = {
          age: ageHours,
          status: freshnessStatus
        };
      }
    });

    return freshness;
  }
}
