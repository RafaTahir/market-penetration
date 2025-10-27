import { supabase } from './supabaseClient';

export interface PoliticalRiskIndex {
  id: string;
  country: string;
  year: number;
  quarter: number;
  political_stability_score: number;
  corruption_index: number;
  government_effectiveness: number;
  regulatory_quality: number;
  rule_of_law_score: number;
  democratic_accountability: number;
  regime_stability: string;
  election_risk: string;
  civil_unrest_risk: string;
  policy_continuity_risk: string;
  recent_events: any;
  risk_summary: string;
  mitigation_strategies: any;
  data_sources: any;
  assessment_date: string;
  created_at: string;
}

export interface EconomicRiskFactor {
  id: string;
  country: string;
  year: number;
  quarter: number;
  currency_volatility_score: number;
  inflation_risk: string;
  debt_to_gdp_ratio: number;
  fiscal_balance: number;
  current_account_balance: number;
  foreign_reserves_months: number;
  banking_sector_health: string;
  sovereign_default_risk: string;
  exchange_rate_regime: string;
  capital_controls: string;
  economic_freedom_score: number;
  ease_of_repatriation: string;
  recession_risk: string;
  risk_summary: string;
  data_sources: any;
  assessment_date: string;
  created_at: string;
}

export interface OperationalRisk {
  id: string;
  country: string;
  city: string;
  industry: string;
  risk_category: string;
  risk_title: string;
  risk_description: string;
  severity: string;
  likelihood: string;
  impact_on_operations: string;
  affected_business_functions: string[];
  historical_incidents: any;
  current_status: string;
  mitigation_measures: any;
  contingency_plans: any;
  cost_of_mitigation_usd: number;
  monitoring_frequency: string;
  early_warning_indicators: any;
  last_incident_date: string;
  data_sources: any;
  last_updated: string;
  created_at: string;
}

export interface CountryCreditRating {
  id: string;
  country: string;
  rating_agency: string;
  rating: string;
  outlook: string;
  rating_date: string;
  previous_rating: string;
  rating_change: string;
  rating_score_numeric: number;
  key_factors_positive: any;
  key_factors_negative: any;
  rating_rationale: string;
  implications_for_business: string;
  next_review_date: string;
  source_url: string;
  created_at: string;
}

export interface SanctionsCompliance {
  id: string;
  country: string;
  sanctioning_authority: string;
  sanction_type: string;
  sectors_affected: string[];
  transaction_types_restricted: string[];
  entities_blacklisted: any;
  effective_date: string;
  expiration_date: string;
  severity: string;
  business_impact: string;
  compliance_requirements: any;
  penalties_for_violation: string;
  exemptions: string;
  due_diligence_steps: any;
  official_reference: string;
  source_url: string;
  last_updated: string;
  created_at: string;
}

export class RiskAssessmentService {
  async getPoliticalRiskIndex(filters: {
    country?: string;
    year?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('political_risk_index')
      .select('*')
      .order('assessment_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PoliticalRiskIndex[];
  }

  async getEconomicRiskFactors(filters: {
    country?: string;
    year?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('economic_risk_factors')
      .select('*')
      .order('assessment_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as EconomicRiskFactor[];
  }

  async getOperationalRisks(filters: {
    country?: string;
    industry?: string;
    risk_category?: string;
    severity?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('operational_risks')
      .select('*')
      .order('last_updated', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.risk_category) {
      query = query.eq('risk_category', filters.risk_category);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as OperationalRisk[];
  }

  async getCountryCreditRatings(filters: {
    country?: string;
    rating_agency?: string;
    outlook?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('country_credit_ratings')
      .select('*')
      .order('rating_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.rating_agency) {
      query = query.eq('rating_agency', filters.rating_agency);
    }

    if (filters.outlook) {
      query = query.eq('outlook', filters.outlook);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CountryCreditRating[];
  }

  async getSanctionsCompliance(filters: {
    country?: string;
    sanctioning_authority?: string;
    severity?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('sanctions_compliance')
      .select('*')
      .order('effective_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.sanctioning_authority) {
      query = query.eq('sanctioning_authority', filters.sanctioning_authority);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as SanctionsCompliance[];
  }

  async getComprehensiveRiskProfile(country: string) {
    const [political, economic, operational, credit, sanctions] = await Promise.all([
      this.getPoliticalRiskIndex({ country, limit: 1 }),
      this.getEconomicRiskFactors({ country, limit: 1 }),
      this.getOperationalRisks({ country, limit: 10 }),
      this.getCountryCreditRatings({ country, limit: 5 }),
      this.getSanctionsCompliance({ country, limit: 5 })
    ]);

    return {
      political: political[0] || null,
      economic: economic[0] || null,
      operational,
      credit,
      sanctions
    };
  }

  async getCriticalRisks(country: string, industry: string) {
    const { data, error } = await supabase
      .from('operational_risks')
      .select('*')
      .eq('country', country)
      .eq('industry', industry)
      .eq('severity', 'Critical')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return data as OperationalRisk[];
  }

  async getRiskTrends(country: string) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    const politicalTrends = await Promise.all(
      years.map(year => this.getPoliticalRiskIndex({ country, year, limit: 1 }))
    );

    const economicTrends = await Promise.all(
      years.map(year => this.getEconomicRiskFactors({ country, year, limit: 1 }))
    );

    return {
      political: politicalTrends.flat(),
      economic: economicTrends.flat()
    };
  }
}

export const riskAssessmentService = new RiskAssessmentService();
