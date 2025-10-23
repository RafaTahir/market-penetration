import { supabase } from './supabaseClient';
import { MarketDataService } from './marketDataService';
import { WorldBankService } from './worldBankService';
import { IMFService } from './imfService';
import { OECDService } from './oecdService';
import { AlphaVantageService } from './alphaVantageService';
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
  private syncIntervals: { [key: string]: NodeJS.Timeout | number } = {};

  private readonly SYNC_SCHEDULES = {
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
    console.log('Starting automatic data synchronization...');

    Object.entries(this.SYNC_SCHEDULES).forEach(([source, schedule]) => {
      if (this.syncIntervals[source]) {
        clearInterval(this.syncIntervals[source] as NodeJS.Timeout);
      }

      this.syncIntervals[source] = setInterval(
        () => this.syncDataSource(source),
        schedule.intervalMs
      ) as unknown as number;

      this.syncDataSource(source);
    });
  }

  stopAutomaticSync(): void {
    console.log('Stopping automatic data synchronization...');
    Object.keys(this.syncIntervals).forEach(source => {
      if (this.syncIntervals[source]) {
        clearInterval(this.syncIntervals[source] as NodeJS.Timeout);
        delete this.syncIntervals[source];
      }
    });
  }

  async syncDataSource(source: string): Promise<DataSyncStatus> {
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
        errorMessage
      };

      await this.updateRefreshLog(source, 'failed', 0, errorMessage);
      console.error(`Error syncing ${source}:`, error);
    } finally {
      this.syncInProgress = false;
    }

    return status;
  }

  async getSyncStatus(): Promise<DataSyncStatus[]> {
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
        status: record.refresh_status as any,
        recordsUpdated: record.records_updated || 0,
        errorMessage: record.error_message,
        frequency: record.refresh_frequency as any
      }));
    } catch (error) {
      console.error('Error in getSyncStatus:', error);
      return [];
    }
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
    try {
      const marketService = MarketDataService.getInstance();
      const symbols = ['SET.BK', 'STI.SI', 'KLSE.KL', 'JCI.JK', 'PSEI.PS', 'VN-INDEX.HM'];
      await marketService.getStockData(symbols);
      return symbols.length;
    } catch (error) {
      console.error('Error syncing market data:', error);
      return 0;
    }
  }

  private async syncCurrencyRates(): Promise<number> {
    try {
      const marketService = MarketDataService.getInstance();
      const rates = await marketService.getCurrencyRates();
      return rates.length;
    } catch (error) {
      console.error('Error syncing currency rates:', error);
      return 0;
    }
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
      return 0;
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
      return 0;
    }
  }

  private async syncOECDData(): Promise<number> {
    try {
      const oecdService = OECDService.getInstance();
      const countries = ['indonesia', 'thailand', 'singapore', 'malaysia', 'philippines', 'vietnam'];

      await oecdService.getAllIndicators(countries);
      return countries.length * 4;
    } catch (error) {
      console.error('Error syncing OECD data:', error);
      return 0;
    }
  }

  private async syncTradeData(): Promise<number> {
    try {
      const tradeService = TradeDataService.getInstance();
      const countries = ['indonesia', 'thailand', 'singapore', 'malaysia', 'philippines', 'vietnam'];

      let total = 0;
      for (const country of countries) {
        const balance = await tradeService.getTradeBalance(country, 2023);
        total += balance.topExports.length + balance.topImports.length;
      }

      return total;
    } catch (error) {
      console.error('Error syncing trade data:', error);
      return 0;
    }
  }

  private async syncCaseStudies(): Promise<number> {
    try {
      const caseStudyService = CaseStudyService.getInstance();
      const studies = await caseStudyService.getCaseStudies();
      return studies.length;
    } catch (error) {
      console.error('Error syncing case studies:', error);
      return 0;
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
        console.error('Error updating refresh log:', error);
      }
    } catch (error) {
      console.error('Error in updateRefreshLog:', error);
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
