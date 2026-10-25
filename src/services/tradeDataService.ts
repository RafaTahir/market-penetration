import { supabase } from './supabaseClient';

export interface TradeFlow {
  country: string;
  countryCode: string;
  partner: string;
  partnerCode: string;
  tradeFlow: 'Import' | 'Export';
  commodityCode: string;
  commodityName: string;
  tradeValue: number;
  year: number;
  month?: number;
  source: string;
  observationPeriod?: string;
  retrievedAt?: string;
  sourceStatus?: 'cached-unverified';
}

export interface TradeBalance {
  country: string;
  exports: number;
  imports: number;
  balance: number;
  year: number;
  topExports: Array<{ commodity: string; value: number }>;
  topImports: Array<{ commodity: string; value: number }>;
  topPartners: Array<{ country: string; value: number }>;
  source: string;
  sourceStatus: 'cached-unverified';
  coverage: 'available-records';
  observationPeriod: string;
}

export class TradeDataService {
  private static instance: TradeDataService;
  private readonly COUNTRY_CODES = {
    indonesia: '360', thailand: '764', singapore: '702',
    malaysia: '458', philippines: '608', vietnam: '704'
  };

  public static getInstance(): TradeDataService {
    if (!TradeDataService.instance) TradeDataService.instance = new TradeDataService();
    return TradeDataService.instance;
  }

  async getTradeFlows(
    country: string, year: number = 2023, tradeFlow: 'Import' | 'Export' | 'both' = 'both'
  ): Promise<TradeFlow[]> {
    if (!this.getCountryCode(country) || !Number.isInteger(year) ||
      !['Import', 'Export', 'both'].includes(tradeFlow)) return [];
    // There is no UN Comtrade request/parser implemented here. Existing stored
    // records are explicitly unverified; unavailable storage yields no facts.
    return this.getCachedTradeData(country, year, tradeFlow);
  }

  async getTradeBalance(country: string, year: number = 2023): Promise<TradeBalance | null> {
    try {
      const [exports, imports] = await Promise.all([
        this.getTradeFlows(country, year, 'Export'), this.getTradeFlows(country, year, 'Import')
      ]);
      if (exports.length === 0 || imports.length === 0) return null;
      const totalExports = exports.reduce((sum, trade) => sum + trade.tradeValue, 0);
      const totalImports = imports.reduce((sum, trade) => sum + trade.tradeValue, 0);
      if (!Number.isFinite(totalExports) || !Number.isFinite(totalImports)) return null;
      return {
        country, exports: totalExports, imports: totalImports,
        balance: totalExports - totalImports, year,
        topExports: this.getTopTrades(exports, 5), topImports: this.getTopTrades(imports, 5),
        topPartners: this.getTopPartners([...exports, ...imports], 5),
        source: 'Cached trade records; totals cover available records only',
        sourceStatus: 'cached-unverified', coverage: 'available-records', observationPeriod: String(year)
      };
    } catch (error) {
      console.error('Error calculating trade balance:', error);
      return null;
    }
  }

  async getRegionalTradeMatrix(
    countries: string[] = [], year: number = 2023
  ): Promise<{ [country: string]: TradeBalance }> {
    const matrix: { [country: string]: TradeBalance } = {};
    for (const country of countries.length ? countries : Object.keys(this.COUNTRY_CODES)) {
      const balance = await this.getTradeBalance(country, year);
      if (balance) matrix[country] = balance;
    }
    return matrix;
  }

  async getTopTradingPartners(
    country: string, year: number = 2023, limit: number = 10
  ): Promise<Array<{ country: string; exports: number; imports: number; total: number; sourceStatus: 'cached-unverified'; coverage: 'available-records' }>> {
    const trades = await this.getTradeFlows(country, year, 'both');
    const partners = new Map<string, { exports: number; imports: number }>();
    for (const trade of trades) {
      const totals = partners.get(trade.partner) || { exports: 0, imports: 0 };
      if (trade.tradeFlow === 'Export') totals.exports += trade.tradeValue;
      else totals.imports += trade.tradeValue;
      partners.set(trade.partner, totals);
    }
    return Array.from(partners.entries()).map(([partner, values]) => ({
      country: partner, ...values, total: values.exports + values.imports,
      sourceStatus: 'cached-unverified' as const, coverage: 'available-records' as const
    })).sort((a, b) => b.total - a.total).slice(0, Math.max(0, limit));
  }

  private async getCachedTradeData(country: string, year: number, tradeFlow: string): Promise<TradeFlow[]> {
    try {
      const countryCode = this.getCountryCode(country);
      let query = supabase.from('trade_statistics').select('*')
        .eq('country_code', countryCode).eq('year', year);
      if (tradeFlow !== 'both') query = query.eq('trade_flow', tradeFlow);
      const { data, error } = await query.order('trade_value_usd', { ascending: false }).limit(100);
      if (error || !Array.isArray(data)) return [];
      const retrievedAt = new Date().toISOString();
      return data.flatMap(record => {
        const source = typeof record.data_source === 'string' ? record.data_source.trim() : '';
        if (!source || /estimated|synthetic|demo|fallback|sample/i.test(source) ||
          String(record.country_code) !== countryCode || record.year !== year ||
          !['Import', 'Export'].includes(record.trade_flow) ||
          (tradeFlow !== 'both' && record.trade_flow !== tradeFlow) ||
          typeof record.trade_value_usd !== 'number' || !Number.isFinite(record.trade_value_usd) ||
          record.trade_value_usd < 0 || typeof record.partner_country !== 'string' || !record.partner_country.trim() ||
          (record.month != null && (!Number.isInteger(record.month) || record.month < 1 || record.month > 12))) return [];
        const period = record.month == null ? String(year) : `${year}-${String(record.month).padStart(2, '0')}`;
        return [{
          country, countryCode, partner: record.partner_country, partnerCode: '',
          tradeFlow: record.trade_flow as 'Import' | 'Export',
          commodityCode: record.commodity_code || '', commodityName: record.commodity_name || '',
          tradeValue: record.trade_value_usd, year, month: record.month ?? undefined,
          source: `Cached record (unverified): ${source}`, sourceStatus: 'cached-unverified' as const,
          observationPeriod: period, retrievedAt
        }];
      });
    } catch (error) {
      console.error('Error fetching cached trade data:', error);
      return [];
    }
  }

  private getTopTrades(trades: TradeFlow[], limit: number): Array<{ commodity: string; value: number }> {
    const commodityMap = new Map<string, number>();

    trades.forEach(trade => {
      const current = commodityMap.get(trade.commodityName) || 0;
      commodityMap.set(trade.commodityName, current + trade.tradeValue);
    });

    return Array.from(commodityMap.entries())
      .map(([commodity, value]) => ({ commodity, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  private getTopPartners(trades: TradeFlow[], limit: number): Array<{ country: string; value: number }> {
    const partnerMap = new Map<string, number>();

    trades.forEach(trade => {
      const current = partnerMap.get(trade.partner) || 0;
      partnerMap.set(trade.partner, current + trade.tradeValue);
    });

    return Array.from(partnerMap.entries())
      .map(([country, value]) => ({ country, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  private getCountryCode(country: string): string {
    return Object.entries(this.COUNTRY_CODES).find(([name]) => name === country.trim().toLowerCase())?.[1] || '';
  }


}
