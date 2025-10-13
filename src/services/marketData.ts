import { supabase } from '../lib/supabase';
import type { Stock, MarketHours, CurrencyRate, EconomicIndicator } from '../types';

export const marketDataService = {
  async getStocksByCountry(country: string): Promise<Stock[]> {
    const { data, error } = await supabase
      .from('market_stocks')
      .select('*')
      .eq('country', country)
      .order('market_cap', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllStocks(): Promise<Stock[]> {
    const { data, error } = await supabase
      .from('market_stocks')
      .select('*')
      .order('market_cap', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMarketHours(country?: string): Promise<MarketHours[]> {
    let query = supabase.from('market_hours').select('*');

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getCurrencyRates(): Promise<CurrencyRate[]> {
    const { data, error } = await supabase
      .from('currency_rates')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getEconomicIndicators(country?: string): Promise<EconomicIndicator[]> {
    let query = supabase.from('economic_indicators').select('*');

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  subscribeToStocks(callback: (stock: Stock) => void) {
    return supabase
      .channel('market_stocks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_stocks' }, (payload) => {
        callback(payload.new as Stock);
      })
      .subscribe();
  }
};
