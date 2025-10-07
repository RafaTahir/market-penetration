import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MarketStockRow {
  id?: string;
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  timestamp: string;
  created_at?: string;
}

export interface CurrencyRateRow {
  id?: string;
  pair: string;
  rate: number;
  change: number;
  change_percent: number;
  timestamp: string;
  created_at?: string;
}

export interface EconomicIndicatorRow {
  id?: string;
  country: string;
  gdp: number;
  inflation: number;
  unemployment: number;
  interest_rate: number;
  exchange_rate: number;
  timestamp: string;
  created_at?: string;
}
