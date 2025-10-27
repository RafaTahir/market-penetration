import { supabase } from './supabaseClient';

export interface LaborMarketData {
  id: string;
  country: string;
  city: string;
  industry: string;
  year: number;
  quarter: number;
  total_workforce_size: number;
  available_talent_pool: number;
  unemployment_rate: number;
  youth_unemployment_rate: number;
  labor_force_participation_rate: number;
  average_education_level: string;
  literacy_rate: number;
  english_proficiency_score: number;
  technical_skills_availability: string;
  digital_skills_level: string;
  labor_productivity_index: number;
  workforce_turnover_rate: number;
  average_tenure_years: number;
  union_penetration_rate: number;
  strike_frequency: string;
  talent_retention_challenges: any;
  competitive_advantages: any;
  data_sources: any;
  created_at: string;
}

export interface TalentPool {
  id: string;
  country: string;
  city: string;
  institution_name: string;
  institution_type: string;
  ranking_national: number;
  ranking_international: number;
  total_students: number;
  annual_graduates: number;
  specializations: string[];
  key_programs: any;
  research_focus_areas: string[];
  industry_partnerships: string[];
  graduate_employability_rate: number;
  average_starting_salary_usd: number;
  top_employers_of_graduates: string[];
  english_instruction: boolean;
  international_student_percentage: number;
  internship_programs: boolean;
  career_services: boolean;
  recruitment_events: string;
  contact_information: string;
  website: string;
  last_updated: string;
  created_at: string;
}

export interface EmploymentRegulation {
  id: string;
  country: string;
  regulation_category: string;
  regulation_title: string;
  description: string;
  applicable_to: string[];
  mandatory: boolean;
  minimum_wage_usd_month: number;
  maximum_working_hours_week: number;
  overtime_premium_percentage: number;
  paid_leave_days_annual: number;
  sick_leave_days_annual: number;
  maternity_leave_days: number;
  paternity_leave_days: number;
  probation_period_max_days: number;
  notice_period_days: number;
  severance_payment_formula: string;
  social_security_employer_percentage: number;
  social_security_employee_percentage: number;
  pension_contribution_percentage: number;
  health_insurance_mandatory: boolean;
  penalties_for_non_compliance: string;
  exemptions: string;
  recent_changes: string;
  official_reference: string;
  last_updated: string;
  created_at: string;
}

export interface SalaryBenchmark {
  id: string;
  country: string;
  city: string;
  industry: string;
  job_title: string;
  job_level: string;
  experience_years_min: number;
  experience_years_max: number;
  salary_min_usd_annual: number;
  salary_median_usd_annual: number;
  salary_max_usd_annual: number;
  salary_min_local_annual: number;
  salary_median_local_annual: number;
  salary_max_local_annual: number;
  bonus_percentage_typical: number;
  commission_applicable: boolean;
  stock_options_common: boolean;
  benefits_value_annual_usd: number;
  common_benefits: string[];
  skills_required: string[];
  certifications_preferred: string[];
  remote_work_availability: string;
  salary_growth_annual_percentage: number;
  demand_level: string;
  supply_level: string;
  hiring_difficulty: string;
  year: number;
  data_source: string;
  sample_size: number;
  created_at: string;
}

export interface RecruitmentPartner {
  id: string;
  country: string;
  cities_covered: string[];
  agency_name: string;
  agency_type: string;
  specializations: string[];
  seniority_focus: string[];
  services_offered: string[];
  years_in_business: number;
  number_of_consultants: number;
  placements_per_year: number;
  success_rate_percentage: number;
  average_time_to_hire_days: number;
  fee_structure: string;
  typical_fee_percentage: number;
  guarantee_period_days: number;
  notable_clients: string[];
  key_strengths: string[];
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  linkedin_profile: string;
  client_testimonials: any;
  rating: number;
  last_updated: string;
  created_at: string;
}

export class LaborTalentService {
  async getLaborMarketData(filters: {
    country?: string;
    city?: string;
    industry?: string;
    year?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('labor_market_data')
      .select('*')
      .order('year', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
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
    return data as LaborMarketData[];
  }

  async getTalentPools(filters: {
    country?: string;
    city?: string;
    institution_type?: string;
    specialization?: string;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('talent_pools')
      .select('*')
      .order('ranking_national', { ascending: true });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.institution_type) {
      query = query.eq('institution_type', filters.institution_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as TalentPool[];
  }

  async getEmploymentRegulations(filters: {
    country?: string;
    regulation_category?: string;
    mandatory?: boolean;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('employment_regulations')
      .select('*')
      .order('regulation_category', { ascending: true });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.regulation_category) {
      query = query.eq('regulation_category', filters.regulation_category);
    }

    if (filters.mandatory !== undefined) {
      query = query.eq('mandatory', filters.mandatory);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as EmploymentRegulation[];
  }

  async getSalaryBenchmarks(filters: {
    country?: string;
    city?: string;
    industry?: string;
    job_title?: string;
    job_level?: string;
    year?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('salary_benchmarks')
      .select('*')
      .order('salary_median_usd_annual', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.job_title) {
      query = query.ilike('job_title', `%${filters.job_title}%`);
    }

    if (filters.job_level) {
      query = query.eq('job_level', filters.job_level);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as SalaryBenchmark[];
  }

  async getRecruitmentPartners(filters: {
    country?: string;
    agency_type?: string;
    specialization?: string;
    min_rating?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('recruitment_partners')
      .select('*')
      .order('rating', { ascending: false });

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.agency_type) {
      query = query.eq('agency_type', filters.agency_type);
    }

    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as RecruitmentPartner[];
  }

  async getHighDemandRoles(country: string, industry: string) {
    const { data, error } = await supabase
      .from('salary_benchmarks')
      .select('*')
      .eq('country', country)
      .eq('industry', industry)
      .in('demand_level', ['High', 'Very_High'])
      .order('salary_median_usd_annual', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as SalaryBenchmark[];
  }

  async getTopUniversities(country: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('talent_pools')
      .select('*')
      .eq('country', country)
      .eq('institution_type', 'University')
      .order('ranking_national', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as TalentPool[];
  }

  async compareSalariesAcrossCities(job_title: string, cities: Array<{ country: string; city: string }>) {
    const comparisons = await Promise.all(
      cities.map(({ country, city }) =>
        this.getSalaryBenchmarks({ country, city, job_title, limit: 1 })
      )
    );

    return cities.map((location, index) => ({
      ...location,
      salary: comparisons[index][0] || null
    }));
  }

  async getLaborCostAnalysis(country: string, city: string) {
    const [laborMarket, salaries, regulations] = await Promise.all([
      this.getLaborMarketData({ country, city, limit: 1 }),
      this.getSalaryBenchmarks({ country, city, limit: 50 }),
      this.getEmploymentRegulations({ country, mandatory: true })
    ]);

    return {
      laborMarket: laborMarket[0] || null,
      salaryBenchmarks: salaries,
      regulations
    };
  }
}

export const laborTalentService = new LaborTalentService();
