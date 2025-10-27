import { supabase } from './supabaseClient';

export interface CommercialRealEstate {
  id: string;
  country: string;
  city: string;
  district: string;
  property_type: string;
  property_name: string;
  address: string;
  total_area_sqm: number;
  available_area_sqm: number;
  floor_range: string;
  grade: string;
  year_built: number;
  rent_per_sqm_month_usd: number;
  rent_per_sqm_month_local: number;
  service_charge_per_sqm_month: number;
  deposit_months: number;
  lease_term_min_months: number;
  amenities: string[];
  transport_access: any;
  parking_spaces: number;
  parking_cost_per_space_month: number;
  ceiling_height_meters: number;
  floor_loading_capacity: number;
  power_capacity_kva: number;
  certifications: string[];
  occupancy_rate: number;
  major_tenants: string[];
  landlord_name: string;
  agent_contact: string;
  last_updated: string;
  created_at: string;
}

export interface EconomicZone {
  id: string;
  country: string;
  zone_name: string;
  zone_type: string;
  city: string;
  location_description: string;
  total_area_hectares: number;
  established_year: number;
  managing_authority: string;
  focus_industries: string[];
  incentives_offered: any;
  tax_benefits: string;
  customs_benefits: string;
  infrastructure_quality: string;
  utilities_available: string[];
  transport_connectivity: any;
  land_cost_per_sqm_usd: number;
  factory_rent_per_sqm_month: number;
  office_rent_per_sqm_month: number;
  setup_time_months: number;
  minimum_investment_usd: number;
  employment_requirements: string;
  current_occupancy_rate: number;
  major_companies_present: string[];
  success_stories: any;
  application_process: string;
  contact_information: string;
  website: string;
  last_updated: string;
  created_at: string;
}

export interface InfrastructureProject {
  id: string;
  country: string;
  project_name: string;
  project_type: string;
  description: string;
  status: string;
  start_date: string;
  expected_completion_date: string;
  actual_completion_date: string;
  total_investment_usd: number;
  funding_sources: any;
  implementing_agency: string;
  contractors: string[];
  location_description: string;
  affected_regions: string[];
  business_opportunities: any;
  industries_benefiting: string[];
  economic_impact: string;
  connectivity_improvements: string;
  completion_percentage: number;
  challenges: string;
  strategic_importance: string;
  related_projects: string[];
  data_sources: any;
  last_updated: string;
  created_at: string;
}

export interface LocationCosts {
  id: string;
  country: string;
  city: string;
  year: number;
  quarter: number;
  office_rent_grade_a_usd_sqm: number;
  office_rent_grade_b_usd_sqm: number;
  retail_rent_prime_usd_sqm: number;
  industrial_rent_usd_sqm: number;
  warehouse_rent_usd_sqm: number;
  electricity_cost_per_kwh: number;
  water_cost_per_cubic_meter: number;
  internet_cost_1gbps_month: number;
  mobile_plan_unlimited_month: number;
  average_hotel_night_usd: number;
  meal_mid_range_restaurant_usd: number;
  taxi_per_km_usd: number;
  car_rental_day_usd: number;
  cost_of_living_index: number;
  business_cost_index: number;
  data_source: string;
  created_at: string;
}

export interface SiteSelectionMatrix {
  id: string;
  country: string;
  city: string;
  district: string;
  industry_focus: string;
  total_score: number;
  market_access_score: number;
  talent_availability_score: number;
  infrastructure_score: number;
  cost_competitiveness_score: number;
  regulatory_environment_score: number;
  quality_of_life_score: number;
  innovation_ecosystem_score: number;
  transport_connectivity_score: number;
  real_estate_availability_score: number;
  supplier_ecosystem_score: number;
  strengths: any;
  weaknesses: any;
  best_suited_for: string[];
  comparable_cities: string[];
  assessment_date: string;
  methodology: string;
  created_at: string;
}

export class RealEstateLocationService {
  async getCommercialRealEstate(filters: {
    country?: string;
    city?: string;
    property_type?: string;
    grade?: string;
    max_rent_usd?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('commercial_real_estate')
      .select('*')
      .order('rent_per_sqm_month_usd', { ascending: true });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }

    if (filters.grade) {
      query = query.eq('grade', filters.grade);
    }

    if (filters.max_rent_usd) {
      query = query.lte('rent_per_sqm_month_usd', filters.max_rent_usd);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CommercialRealEstate[];
  }

  async getEconomicZones(filters: {
    country?: string;
    zone_type?: string;
    industry?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('economic_zones')
      .select('*')
      .order('current_occupancy_rate', { ascending: true });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.zone_type) {
      query = query.eq('zone_type', filters.zone_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as EconomicZone[];
  }

  async getInfrastructureProjects(filters: {
    country?: string;
    project_type?: string;
    status?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('infrastructure_projects')
      .select('*')
      .order('total_investment_usd', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.project_type) {
      query = query.eq('project_type', filters.project_type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as InfrastructureProject[];
  }

  async getLocationCosts(filters: {
    country?: string;
    city?: string;
    year?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('location_costs')
      .select('*')
      .order('year', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as LocationCosts[];
  }

  async getSiteSelectionMatrix(filters: {
    country?: string;
    city?: string;
    industry_focus?: string;
    min_total_score?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('site_selection_matrix')
      .select('*')
      .order('total_score', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.industry_focus) {
      query = query.eq('industry_focus', filters.industry_focus);
    }

    if (filters.min_total_score) {
      query = query.gte('total_score', filters.min_total_score);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as SiteSelectionMatrix[];
  }

  async compareLocations(cities: Array<{ country: string; city: string }>) {
    const comparisons = await Promise.all(
      cities.map(({ country, city }) =>
        Promise.all([
          this.getLocationCosts({ country, city, limit: 1 }),
          this.getSiteSelectionMatrix({ country, city, limit: 1 }),
          this.getCommercialRealEstate({ country, city, limit: 5 })
        ])
      )
    );

    return cities.map((location, index) => ({
      ...location,
      costs: comparisons[index][0][0] || null,
      siteSelection: comparisons[index][1][0] || null,
      properties: comparisons[index][2] || []
    }));
  }

  async getUpcomingInfrastructureProjects(country: string) {
    const { data, error } = await supabase
      .from('infrastructure_projects')
      .select('*')
      .eq('country', country)
      .in('status', ['Planned', 'Under_Construction'])
      .order('expected_completion_date', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data as InfrastructureProject[];
  }

  async getBestLocationsForIndustry(industry: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('site_selection_matrix')
      .select('*')
      .eq('industry_focus', industry)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SiteSelectionMatrix[];
  }
}

export const realEstateLocationService = new RealEstateLocationService();
