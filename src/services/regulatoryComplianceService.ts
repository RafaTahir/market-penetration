import { supabase } from './supabaseClient';

export interface RegulatoryRequirement {
  id: string;
  country: string;
  industry: string;
  requirement_type: string;
  requirement_name: string;
  description: string;
  issuing_authority: string;
  mandatory: boolean;
  application_process: string;
  required_documents: any;
  processing_time_days: number;
  validity_period_months: number;
  renewal_required: boolean;
  cost_local_currency: number;
  cost_usd: number;
  prerequisites: any;
  penalties_for_non_compliance: string;
  exemptions: string;
  official_website: string;
  contact_information: string;
  last_updated: string;
  created_at: string;
}

export interface TaxIncentive {
  id: string;
  country: string;
  incentive_name: string;
  incentive_type: string;
  eligible_industries: string[];
  eligible_activities: string[];
  description: string;
  benefit_description: string;
  percentage_reduction: number;
  maximum_benefit_usd: number;
  duration_years: number;
  location_restrictions: string[];
  minimum_investment_usd: number;
  minimum_employees: number;
  application_deadline: string;
  application_process: string;
  approval_authority: string;
  success_rate: number;
  examples: any;
  official_website: string;
  last_updated: string;
  created_at: string;
}

export interface ComplianceTimeline {
  id: string;
  country: string;
  industry: string;
  process_name: string;
  process_type: string;
  description: string;
  total_duration_days: number;
  steps: any;
  parallel_possible: boolean;
  fast_track_available: boolean;
  fast_track_cost_usd: number;
  fast_track_duration_days: number;
  dependencies: string[];
  common_delays: any;
  tips_for_speed: any;
  last_updated: string;
  created_at: string;
}

export interface PolicyChange {
  id: string;
  country: string;
  change_type: string;
  title: string;
  description: string;
  industries_affected: string[];
  impact_level: string;
  impact_description: string;
  effective_date: string;
  announcement_date: string;
  transition_period_days: number;
  compliance_actions_required: any;
  penalties: string;
  opportunities: string;
  official_reference: string;
  official_document_url: string;
  analysis: string;
  data_sources: any;
  created_at: string;
}

export interface GovernmentContact {
  id: string;
  country: string;
  agency_name: string;
  agency_type: string;
  areas_of_responsibility: string[];
  relevant_industries: string[];
  services_provided: string[];
  address: string;
  phone: string;
  email: string;
  website: string;
  online_portal: string;
  business_hours: string;
  key_officials: any;
  application_submission_methods: string[];
  average_response_time_days: number;
  notes: string;
  last_updated: string;
  created_at: string;
}

export class RegulatoryComplianceService {
  async getRegulatoryRequirements(filters: {
    country?: string;
    industry?: string;
    requirement_type?: string;
    mandatory?: boolean;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('regulatory_requirements')
      .select('*')
      .order('last_updated', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.requirement_type) {
      query = query.eq('requirement_type', filters.requirement_type);
    }

    if (filters.mandatory !== undefined) {
      query = query.eq('mandatory', filters.mandatory);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as RegulatoryRequirement[];
  }

  async getTaxIncentives(filters: {
    country?: string;
    incentive_type?: string;
    minimum_investment_max?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('tax_incentives')
      .select('*')
      .order('maximum_benefit_usd', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.incentive_type) {
      query = query.eq('incentive_type', filters.incentive_type);
    }

    if (filters.minimum_investment_max) {
      query = query.lte('minimum_investment_usd', filters.minimum_investment_max);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as TaxIncentive[];
  }

  async getComplianceTimelines(filters: {
    country?: string;
    industry?: string;
    process_type?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('compliance_timeline')
      .select('*')
      .order('total_duration_days', { ascending: true });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.process_type) {
      query = query.eq('process_type', filters.process_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ComplianceTimeline[];
  }

  async getPolicyChanges(filters: {
    country?: string;
    impact_level?: string;
    change_type?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('policy_changes')
      .select('*')
      .order('effective_date', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.impact_level) {
      query = query.eq('impact_level', filters.impact_level);
    }

    if (filters.change_type) {
      query = query.eq('change_type', filters.change_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PolicyChange[];
  }

  async getGovernmentContacts(filters: {
    country?: string;
    agency_type?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('government_contacts')
      .select('*')
      .order('agency_name', { ascending: true });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.agency_type) {
      query = query.eq('agency_type', filters.agency_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as GovernmentContact[];
  }

  async getRecentPolicyChanges(limit: number = 10) {
    const { data, error } = await supabase
      .from('policy_changes')
      .select('*')
      .order('announcement_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as PolicyChange[];
  }

  async getUpcomingDeadlines(country: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tax_incentives')
      .select('*')
      .eq('country', country)
      .gte('application_deadline', today)
      .order('application_deadline', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data as TaxIncentive[];
  }

  async getMandatoryRequirements(country: string, industry: string) {
    const { data, error } = await supabase
      .from('regulatory_requirements')
      .select('*')
      .eq('country', country)
      .eq('industry', industry)
      .eq('mandatory', true)
      .order('processing_time_days', { ascending: false });

    if (error) throw error;
    return data as RegulatoryRequirement[];
  }
}

export const regulatoryComplianceService = new RegulatoryComplianceService();
