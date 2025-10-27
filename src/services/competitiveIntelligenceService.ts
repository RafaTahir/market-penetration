import { supabase } from './supabaseClient';

export interface CompetitorProfile {
  id: string;
  company_name: string;
  brand_names: string[];
  country: string;
  countries_operated: string[];
  industry: string;
  sub_sectors: string[];
  market_share_percentage: number;
  annual_revenue_usd: number;
  employee_count: number;
  entry_year: number;
  headquarters_location: string;
  business_model: string;
  competitive_advantages: any;
  weaknesses: any;
  expansion_plans: string;
  parent_company: string;
  stock_symbol: string;
  website: string;
  data_sources: any;
  confidence_score: number;
  last_updated: string;
  created_at: string;
}

export interface CompetitorActivity {
  id: string;
  competitor_id: string;
  company_name: string;
  activity_type: string;
  activity_title: string;
  description: string;
  country: string;
  industry: string;
  investment_amount_usd: number;
  impact_level: string;
  strategic_significance: string;
  activity_date: string;
  data_sources: any;
  tags: string[];
  created_at: string;
}

export interface MarketShare {
  id: string;
  country: string;
  industry: string;
  sub_sector: string;
  company_name: string;
  market_share_percentage: number;
  rank: number;
  revenue_usd: number;
  year: number;
  quarter: number;
  total_market_size_usd: number;
  growth_rate: number;
  data_source: string;
  methodology: string;
  created_at: string;
}

export interface PricingIntelligence {
  id: string;
  company_name: string;
  product_name: string;
  product_category: string;
  country: string;
  city: string;
  price_local_currency: number;
  currency_code: string;
  price_usd: number;
  pricing_model: string;
  price_tier: string;
  features_included: any;
  competitor_comparison: any;
  price_positioning: string;
  discounts_available: string;
  observation_date: string;
  data_source: string;
  created_at: string;
}

export interface MarketEntryBarrier {
  id: string;
  country: string;
  industry: string;
  barrier_type: string;
  barrier_title: string;
  description: string;
  severity_level: string;
  estimated_cost_usd: number;
  time_to_overcome_days: number;
  mitigation_strategies: any;
  examples: any;
  regulatory_reference: string;
  last_updated: string;
  created_at: string;
}

export class CompetitiveIntelligenceService {
  async getCompetitorProfiles(filters: {
    country?: string;
    industry?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('competitor_profiles')
      .select('*')
      .order('market_share_percentage', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CompetitorProfile[];
  }

  async getCompetitorById(id: string) {
    const { data, error } = await supabase
      .from('competitor_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as CompetitorProfile | null;
  }

  async getCompetitorActivities(filters: {
    country?: string;
    company_name?: string;
    activity_type?: string;
    impact_level?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('competitor_activities')
      .select('*')
      .order('activity_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.company_name) {
      query = query.eq('company_name', filters.company_name);
    }

    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type);
    }

    if (filters.impact_level) {
      query = query.eq('impact_level', filters.impact_level);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CompetitorActivity[];
  }

  async getMarketShareData(filters: {
    country?: string;
    industry?: string;
    year?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('market_share_tracking')
      .select('*')
      .order('market_share_percentage', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as MarketShare[];
  }

  async getPricingIntelligence(filters: {
    country?: string;
    company_name?: string;
    product_category?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('pricing_intelligence')
      .select('*')
      .order('observation_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.company_name) {
      query = query.eq('company_name', filters.company_name);
    }

    if (filters.product_category) {
      query = query.eq('product_category', filters.product_category);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PricingIntelligence[];
  }

  async getMarketEntryBarriers(filters: {
    country?: string;
    industry?: string;
    barrier_type?: string;
    severity_level?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('market_entry_barriers')
      .select('*')
      .order('severity_level', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.barrier_type) {
      query = query.eq('barrier_type', filters.barrier_type);
    }

    if (filters.severity_level) {
      query = query.eq('severity_level', filters.severity_level);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as MarketEntryBarrier[];
  }

  async searchCompetitors(searchTerm: string) {
    const { data, error } = await supabase
      .from('competitor_profiles')
      .select('*')
      .or(`company_name.ilike.%${searchTerm}%,business_model.ilike.%${searchTerm}%`)
      .limit(20);

    if (error) throw error;
    return data as CompetitorProfile[];
  }

  async getTopCompetitorsByMarketShare(country: string, industry: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('competitor_profiles')
      .select('*')
      .eq('country', country)
      .eq('industry', industry)
      .order('market_share_percentage', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CompetitorProfile[];
  }

  async getRecentActivities(limit: number = 20) {
    const { data, error } = await supabase
      .from('competitor_activities')
      .select('*')
      .order('activity_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CompetitorActivity[];
  }
}

export const competitiveIntelligenceService = new CompetitiveIntelligenceService();
