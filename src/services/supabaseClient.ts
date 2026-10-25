import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_UNAVAILABLE_MESSAGE =
  'Connected services are unavailable. Configure valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables, then restart the app.';

function createConfiguredClient(): SupabaseClient | null {
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) return null;

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    // Invalid configuration must not prevent access to the guest workspace.
    return null;
  }
}

const configuredClient = createConfiguredClient();
export const isSupabaseConfigured = configuredClient !== null;

// Keep the existing client interface for connected features. The unavailable
// boundary fails locally before constructing a request, channel, or auth client.
// It never supplies placeholder credentials or reports a successful operation.
export const supabase: SupabaseClient = configuredClient ?? new Proxy({} as SupabaseClient, {
  get() {
    throw new Error(SUPABASE_UNAVAILABLE_MESSAGE);
  },
});

export interface MarketStockRow {
  // Optional provenance; legacy rows lacking it are not provider observations.
  data_source?: string;
  observed_at?: string;
  retrieved_at?: string;
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
