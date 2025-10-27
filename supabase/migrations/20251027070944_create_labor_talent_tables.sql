/*
  # Labor Market & Talent Intelligence

  This migration creates comprehensive labor market and talent intelligence tables
  to help businesses understand workforce availability, costs, regulations, and
  hiring practices in Southeast Asian markets.

  ## New Tables

  ### `labor_market_data`
  Comprehensive labor market statistics by country and industry
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `city` (text) - Specific city if applicable
  - `industry` (text) - Industry sector
  - `year` (integer) - Year of data
  - `quarter` (integer) - Quarter if applicable
  - `total_workforce_size` (integer) - Total workforce
  - `available_talent_pool` (integer) - Available workers
  - `unemployment_rate` (numeric) - Overall unemployment rate
  - `youth_unemployment_rate` (numeric) - Youth (15-24) unemployment
  - `labor_force_participation_rate` (numeric) - Participation rate
  - `average_education_level` (text) - Predominant education level
  - `literacy_rate` (numeric) - Literacy percentage
  - `english_proficiency_score` (numeric) - English skills 0-100
  - `technical_skills_availability` (text) - High/Medium/Low
  - `digital_skills_level` (text) - High/Medium/Low
  - `labor_productivity_index` (numeric) - Productivity score
  - `workforce_turnover_rate` (numeric) - Annual turnover percentage
  - `average_tenure_years` (numeric) - Average job tenure
  - `union_penetration_rate` (numeric) - Unionization percentage
  - `strike_frequency` (text) - Rare/Occasional/Frequent
  - `talent_retention_challenges` (jsonb) - Key challenges
  - `competitive_advantages` (jsonb) - Workforce strengths
  - `data_sources` (jsonb) - Source references
  - `created_at` (timestamptz)

  ### `talent_pools`
  Educational institutions and graduate output by specialty
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `city` (text) - City
  - `institution_name` (text) - University or school name
  - `institution_type` (text) - University, technical_college, vocational_school, training_center
  - `ranking_national` (integer) - National ranking
  - `ranking_international` (integer) - International ranking if applicable
  - `total_students` (integer) - Current enrollment
  - `annual_graduates` (integer) - Graduates per year
  - `specializations` (text[]) - Programs offered
  - `key_programs` (jsonb) - Notable programs with details
  - `research_focus_areas` (text[]) - Research specialties
  - `industry_partnerships` (text[]) - Corporate partnerships
  - `graduate_employability_rate` (numeric) - Employment rate percentage
  - `average_starting_salary_usd` (numeric) - Graduate starting salary
  - `top_employers_of_graduates` (text[]) - Where graduates work
  - `english_instruction` (boolean) - English language programs
  - `international_student_percentage` (numeric) - International students
  - `internship_programs` (boolean) - Internship availability
  - `career_services` (boolean) - Career support available
  - `recruitment_events` (text) - How to recruit
  - `contact_information` (text) - Recruitment contact
  - `website` (text) - Institution website
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `employment_regulations`
  Labor laws and employment requirements by country
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `regulation_category` (text) - Hiring, termination, benefits, working_hours, wages, discrimination, safety
  - `regulation_title` (text) - Brief title
  - `description` (text) - Detailed explanation
  - `applicable_to` (text[]) - Who it applies to
  - `mandatory` (boolean) - Required or optional
  - `minimum_wage_usd_month` (numeric) - Minimum wage if applicable
  - `maximum_working_hours_week` (integer) - Legal maximum hours
  - `overtime_premium_percentage` (numeric) - Overtime pay rate
  - `paid_leave_days_annual` (integer) - Annual leave entitlement
  - `sick_leave_days_annual` (integer) - Sick leave days
  - `maternity_leave_days` (integer) - Maternity leave
  - `paternity_leave_days` (integer) - Paternity leave
  - `probation_period_max_days` (integer) - Maximum probation
  - `notice_period_days` (integer) - Termination notice
  - `severance_payment_formula` (text) - Severance calculation
  - `social_security_employer_percentage` (numeric) - Employer contribution
  - `social_security_employee_percentage` (numeric) - Employee contribution
  - `pension_contribution_percentage` (numeric) - Pension contribution
  - `health_insurance_mandatory` (boolean) - Health insurance required
  - `penalties_for_non_compliance` (text) - Consequences
  - `exemptions` (text) - Who is exempt
  - `recent_changes` (text) - Recent legal updates
  - `official_reference` (text) - Law reference number
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `salary_benchmarks`
  Position-specific salary data by country and city
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `city` (text) - City
  - `industry` (text) - Industry sector
  - `job_title` (text) - Position title
  - `job_level` (text) - Entry, junior, mid, senior, executive
  - `experience_years_min` (integer) - Minimum experience
  - `experience_years_max` (integer) - Maximum experience
  - `salary_min_usd_annual` (numeric) - Minimum salary
  - `salary_median_usd_annual` (numeric) - Median salary
  - `salary_max_usd_annual` (numeric) - Maximum salary
  - `salary_min_local_annual` (numeric) - Min in local currency
  - `salary_median_local_annual` (numeric) - Median in local currency
  - `salary_max_local_annual` (numeric) - Max in local currency
  - `bonus_percentage_typical` (numeric) - Typical bonus percentage
  - `commission_applicable` (boolean) - Commission-based pay
  - `stock_options_common` (boolean) - Equity compensation
  - `benefits_value_annual_usd` (numeric) - Value of benefits package
  - `common_benefits` (text[]) - Typical benefits
  - `skills_required` (text[]) - Required skills
  - `certifications_preferred` (text[]) - Preferred certifications
  - `remote_work_availability` (text) - Never/Hybrid/Fully_Remote
  - `salary_growth_annual_percentage` (numeric) - Year-over-year growth
  - `demand_level` (text) - Low/Medium/High/Very_High
  - `supply_level` (text) - Low/Medium/High/Oversupply
  - `hiring_difficulty` (text) - Easy/Moderate/Difficult/Very_Difficult
  - `year` (integer) - Year of data
  - `data_source` (text) - Where data came from
  - `sample_size` (integer) - Number of data points
  - `created_at` (timestamptz)

  ### `recruitment_partners`
  Vetted recruitment agencies and headhunters
  - `id` (uuid, primary key)
  - `country` (text) - Country of operation
  - `cities_covered` (text[]) - Cities they serve
  - `agency_name` (text) - Company name
  - `agency_type` (text) - Recruitment_agency, headhunter, staffing_firm, HR_consultancy
  - `specializations` (text[]) - Industries or functions
  - `seniority_focus` (text[]) - Entry/Mid/Senior/Executive
  - `services_offered` (text[]) - Services provided
  - `years_in_business` (integer) - Years operating
  - `number_of_consultants` (integer) - Team size
  - `placements_per_year` (integer) - Annual placements
  - `success_rate_percentage` (numeric) - Placement success rate
  - `average_time_to_hire_days` (integer) - Time to fill positions
  - `fee_structure` (text) - Pricing model
  - `typical_fee_percentage` (numeric) - Typical fee as % of salary
  - `guarantee_period_days` (integer) - Replacement guarantee
  - `notable_clients` (text[]) - Major clients
  - `key_strengths` (text[]) - What they're good at
  - `contact_person` (text) - Main contact
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `website` (text) - Company website
  - `linkedin_profile` (text) - LinkedIn page
  - `client_testimonials` (jsonb) - Client feedback
  - `rating` (numeric) - Rating 0-5
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all labor market data
  - Public read access for general labor statistics
  - Only service role can insert/update data

  ## Indexes
  - Performance indexes on country, city, and industry
  - Salary and cost indexes for filtering
  - Full-text search on job titles and institutions
*/

-- Labor Market Data Table
CREATE TABLE IF NOT EXISTS labor_market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  industry text NOT NULL,
  year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  total_workforce_size integer DEFAULT 0,
  available_talent_pool integer DEFAULT 0,
  unemployment_rate numeric DEFAULT 0,
  youth_unemployment_rate numeric DEFAULT 0,
  labor_force_participation_rate numeric DEFAULT 0,
  average_education_level text DEFAULT 'Secondary' CHECK (average_education_level IN ('Primary', 'Secondary', 'Tertiary', 'Vocational')),
  literacy_rate numeric DEFAULT 0,
  english_proficiency_score numeric DEFAULT 50 CHECK (english_proficiency_score >= 0 AND english_proficiency_score <= 100),
  technical_skills_availability text DEFAULT 'Medium' CHECK (technical_skills_availability IN ('High', 'Medium', 'Low')),
  digital_skills_level text DEFAULT 'Medium' CHECK (digital_skills_level IN ('High', 'Medium', 'Low')),
  labor_productivity_index numeric DEFAULT 100,
  workforce_turnover_rate numeric DEFAULT 0,
  average_tenure_years numeric DEFAULT 0,
  union_penetration_rate numeric DEFAULT 0,
  strike_frequency text DEFAULT 'Rare' CHECK (strike_frequency IN ('Rare', 'Occasional', 'Frequent')),
  talent_retention_challenges jsonb DEFAULT '[]'::jsonb,
  competitive_advantages jsonb DEFAULT '[]'::jsonb,
  data_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE labor_market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to labor market data"
  ON labor_market_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read labor market data"
  ON labor_market_data FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_labor_market_country_industry 
  ON labor_market_data(country, industry, year DESC);
CREATE INDEX IF NOT EXISTS idx_labor_market_city 
  ON labor_market_data(city, year DESC);
CREATE INDEX IF NOT EXISTS idx_labor_market_unemployment 
  ON labor_market_data(unemployment_rate);

-- Talent Pools Table
CREATE TABLE IF NOT EXISTS talent_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text NOT NULL,
  institution_name text NOT NULL,
  institution_type text NOT NULL CHECK (institution_type IN ('University', 'Technical_College', 'Vocational_School', 'Training_Center', 'Business_School')),
  ranking_national integer DEFAULT 0,
  ranking_international integer DEFAULT 0,
  total_students integer DEFAULT 0,
  annual_graduates integer DEFAULT 0,
  specializations text[] DEFAULT ARRAY[]::text[],
  key_programs jsonb DEFAULT '[]'::jsonb,
  research_focus_areas text[] DEFAULT ARRAY[]::text[],
  industry_partnerships text[] DEFAULT ARRAY[]::text[],
  graduate_employability_rate numeric DEFAULT 0,
  average_starting_salary_usd numeric DEFAULT 0,
  top_employers_of_graduates text[] DEFAULT ARRAY[]::text[],
  english_instruction boolean DEFAULT false,
  international_student_percentage numeric DEFAULT 0,
  internship_programs boolean DEFAULT false,
  career_services boolean DEFAULT false,
  recruitment_events text,
  contact_information text,
  website text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE talent_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to talent pools"
  ON talent_pools FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read talent pools"
  ON talent_pools FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_talent_pools_country_city 
  ON talent_pools(country, city);
CREATE INDEX IF NOT EXISTS idx_talent_pools_type 
  ON talent_pools(institution_type);
CREATE INDEX IF NOT EXISTS idx_talent_pools_ranking 
  ON talent_pools(ranking_national);
CREATE INDEX IF NOT EXISTS idx_talent_pools_graduates 
  ON talent_pools(annual_graduates DESC);

-- Employment Regulations Table
CREATE TABLE IF NOT EXISTS employment_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  regulation_category text NOT NULL CHECK (regulation_category IN ('Hiring', 'Termination', 'Benefits', 'Working_Hours', 'Wages', 'Discrimination', 'Safety', 'Leave', 'Social_Security')),
  regulation_title text NOT NULL,
  description text NOT NULL,
  applicable_to text[] DEFAULT ARRAY[]::text[],
  mandatory boolean DEFAULT true,
  minimum_wage_usd_month numeric DEFAULT 0,
  maximum_working_hours_week integer DEFAULT 0,
  overtime_premium_percentage numeric DEFAULT 0,
  paid_leave_days_annual integer DEFAULT 0,
  sick_leave_days_annual integer DEFAULT 0,
  maternity_leave_days integer DEFAULT 0,
  paternity_leave_days integer DEFAULT 0,
  probation_period_max_days integer DEFAULT 0,
  notice_period_days integer DEFAULT 0,
  severance_payment_formula text,
  social_security_employer_percentage numeric DEFAULT 0,
  social_security_employee_percentage numeric DEFAULT 0,
  pension_contribution_percentage numeric DEFAULT 0,
  health_insurance_mandatory boolean DEFAULT false,
  penalties_for_non_compliance text,
  exemptions text,
  recent_changes text,
  official_reference text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employment_regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to employment regulations"
  ON employment_regulations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read employment regulations"
  ON employment_regulations FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_employment_regs_country_category 
  ON employment_regulations(country, regulation_category);
CREATE INDEX IF NOT EXISTS idx_employment_regs_mandatory 
  ON employment_regulations(mandatory) WHERE mandatory = true;
CREATE INDEX IF NOT EXISTS idx_employment_regs_updated 
  ON employment_regulations(last_updated DESC);

-- Salary Benchmarks Table
CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text NOT NULL,
  industry text NOT NULL,
  job_title text NOT NULL,
  job_level text NOT NULL CHECK (job_level IN ('Entry', 'Junior', 'Mid', 'Senior', 'Executive', 'C-Level')),
  experience_years_min integer DEFAULT 0,
  experience_years_max integer DEFAULT 0,
  salary_min_usd_annual numeric DEFAULT 0,
  salary_median_usd_annual numeric DEFAULT 0,
  salary_max_usd_annual numeric DEFAULT 0,
  salary_min_local_annual numeric DEFAULT 0,
  salary_median_local_annual numeric DEFAULT 0,
  salary_max_local_annual numeric DEFAULT 0,
  bonus_percentage_typical numeric DEFAULT 0,
  commission_applicable boolean DEFAULT false,
  stock_options_common boolean DEFAULT false,
  benefits_value_annual_usd numeric DEFAULT 0,
  common_benefits text[] DEFAULT ARRAY[]::text[],
  skills_required text[] DEFAULT ARRAY[]::text[],
  certifications_preferred text[] DEFAULT ARRAY[]::text[],
  remote_work_availability text DEFAULT 'Hybrid' CHECK (remote_work_availability IN ('Never', 'Hybrid', 'Fully_Remote', 'Flexible')),
  salary_growth_annual_percentage numeric DEFAULT 0,
  demand_level text DEFAULT 'Medium' CHECK (demand_level IN ('Low', 'Medium', 'High', 'Very_High')),
  supply_level text DEFAULT 'Medium' CHECK (supply_level IN ('Low', 'Medium', 'High', 'Oversupply')),
  hiring_difficulty text DEFAULT 'Moderate' CHECK (hiring_difficulty IN ('Easy', 'Moderate', 'Difficult', 'Very_Difficult')),
  year integer NOT NULL,
  data_source text NOT NULL,
  sample_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE salary_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to salary benchmarks"
  ON salary_benchmarks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read salary benchmarks"
  ON salary_benchmarks FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_city_industry 
  ON salary_benchmarks(country, city, industry, year DESC);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_title_level 
  ON salary_benchmarks(job_title, job_level);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_median 
  ON salary_benchmarks(salary_median_usd_annual DESC);
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_demand 
  ON salary_benchmarks(demand_level, hiring_difficulty);

-- Recruitment Partners Table
CREATE TABLE IF NOT EXISTS recruitment_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  cities_covered text[] DEFAULT ARRAY[]::text[],
  agency_name text NOT NULL,
  agency_type text NOT NULL CHECK (agency_type IN ('Recruitment_Agency', 'Headhunter', 'Staffing_Firm', 'HR_Consultancy', 'RPO_Provider')),
  specializations text[] DEFAULT ARRAY[]::text[],
  seniority_focus text[] DEFAULT ARRAY[]::text[],
  services_offered text[] DEFAULT ARRAY[]::text[],
  years_in_business integer DEFAULT 0,
  number_of_consultants integer DEFAULT 0,
  placements_per_year integer DEFAULT 0,
  success_rate_percentage numeric DEFAULT 0,
  average_time_to_hire_days integer DEFAULT 0,
  fee_structure text,
  typical_fee_percentage numeric DEFAULT 0,
  guarantee_period_days integer DEFAULT 0,
  notable_clients text[] DEFAULT ARRAY[]::text[],
  key_strengths text[] DEFAULT ARRAY[]::text[],
  contact_person text,
  email text,
  phone text,
  website text,
  linkedin_profile text,
  client_testimonials jsonb DEFAULT '[]'::jsonb,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recruitment_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to recruitment partners"
  ON recruitment_partners FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read recruitment partners"
  ON recruitment_partners FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_recruitment_partners_country 
  ON recruitment_partners(country);
CREATE INDEX IF NOT EXISTS idx_recruitment_partners_type 
  ON recruitment_partners(agency_type);
CREATE INDEX IF NOT EXISTS idx_recruitment_partners_rating 
  ON recruitment_partners(rating DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_talent_pools_search 
  ON talent_pools USING gin(to_tsvector('english', institution_name));
CREATE INDEX IF NOT EXISTS idx_salary_benchmarks_search 
  ON salary_benchmarks USING gin(to_tsvector('english', job_title));
CREATE INDEX IF NOT EXISTS idx_recruitment_partners_search 
  ON recruitment_partners USING gin(to_tsvector('english', agency_name));