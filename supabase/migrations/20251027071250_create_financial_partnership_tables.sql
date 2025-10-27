/*
  # Financial Intelligence & Partnership Networks

  This migration creates comprehensive financial intelligence and partnership network tables
  to help businesses with financial planning, partner identification, and network building
  in Southeast Asian markets.

  ## New Tables

  ### `investment_requirements`
  Detailed capital needs breakdown for market entry
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `industry` (text) - Industry sector
  - `business_model` (text) - Business model type
  - `market_entry_mode` (text) - Greenfield, acquisition, JV, franchise, etc
  - `company_size` (text) - SME, mid-market, enterprise
  - `initial_capital_usd` (numeric) - Total initial investment
  - `working_capital_usd` (numeric) - Operating capital needed
  - `real_estate_costs_usd` (numeric) - Property costs
  - `equipment_costs_usd` (numeric) - Equipment and machinery
  - `technology_costs_usd` (numeric) - IT and technology
  - `inventory_costs_usd` (numeric) - Initial inventory
  - `licensing_fees_usd` (numeric) - Licenses and permits
  - `legal_and_incorporation_usd` (numeric) - Legal setup costs
  - `recruitment_costs_usd` (numeric) - Hiring and training
  - `marketing_launch_budget_usd` (numeric) - Marketing budget
  - `contingency_percentage` (numeric) - Recommended contingency
  - `total_investment_required_usd` (numeric) - Total needed
  - `funding_sources_recommended` (jsonb) - Suggested funding mix
  - `break_even_timeline_months` (integer) - Expected break-even
  - `payback_period_years` (numeric) - Investment payback
  - `assumptions` (jsonb) - Key assumptions
  - `year` (integer) - Year of estimate
  - `created_at` (timestamptz)

  ### `operating_cost_models`
  Monthly/annual operating cost breakdowns
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `city` (text) - Specific city
  - `industry` (text) - Industry sector
  - `company_size` (text) - SME, mid-market, enterprise
  - `employee_count_range` (text) - Number of employees
  - `salaries_and_wages_monthly_usd` (numeric) - Payroll costs
  - `benefits_and_insurance_monthly_usd` (numeric) - Employee benefits
  - `rent_monthly_usd` (numeric) - Office/facility rent
  - `utilities_monthly_usd` (numeric) - Power, water, internet
  - `equipment_maintenance_monthly_usd` (numeric) - Maintenance costs
  - `technology_subscriptions_monthly_usd` (numeric) - Software, cloud
  - `marketing_monthly_usd` (numeric) - Marketing spend
  - `professional_services_monthly_usd` (numeric) - Legal, accounting
  - `insurance_monthly_usd` (numeric) - Business insurance
  - `transportation_monthly_usd` (numeric) - Transport and logistics
  - `supplies_monthly_usd` (numeric) - Office supplies
  - `taxes_monthly_usd` (numeric) - Corporate taxes
  - `miscellaneous_monthly_usd` (numeric) - Other costs
  - `total_operating_costs_monthly_usd` (numeric) - Total monthly
  - `total_operating_costs_annual_usd` (numeric) - Total annual
  - `cost_escalation_annual_percentage` (numeric) - Annual cost increase
  - `year` (integer) - Year of data
  - `created_at` (timestamptz)

  ### `funding_sources`
  Available financing options and investment sources
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `funding_type` (text) - VC, PE, bank_loan, grant, angel, crowdfunding, corporate
  - `source_name` (text) - Fund or institution name
  - `description` (text) - Details about the source
  - `focus_industries` (text[]) - Target industries
  - `focus_stages` (text[]) - Seed, Series A, B, C, growth, etc
  - `typical_check_size_min_usd` (numeric) - Minimum investment
  - `typical_check_size_max_usd` (numeric) - Maximum investment
  - `equity_stake_typical_percentage` (numeric) - Typical equity taken
  - `geographic_focus` (text[]) - Countries they invest in
  - `investment_criteria` (jsonb) - What they look for
  - `portfolio_companies` (text[]) - Notable investments
  - `total_aum_usd` (numeric) - Assets under management
  - `number_of_deals_annually` (integer) - Deal volume
  - `average_deal_size_usd` (numeric) - Average investment
  - `value_add_services` (jsonb) - Beyond money support
  - `application_process` (text) - How to apply
  - `decision_timeline_weeks` (integer) - Time to decision
  - `contact_information` (text) - How to reach
  - `website` (text) - Website URL
  - `key_partners` (jsonb) - Key people
  - `success_rate_percentage` (numeric) - Approval rate
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `local_partners`
  Vetted local partners for distribution, services, and operations
  - `id` (uuid, primary key)
  - `country` (text) - Country of operation
  - `partner_name` (text) - Company name
  - `partner_type` (text) - Distributor, agent, service_provider, reseller, logistics
  - `industries_served` (text[]) - Industries they work with
  - `services_offered` (text[]) - What they provide
  - `geographic_coverage` (text[]) - Areas they cover
  - `years_in_business` (integer) - Years operating
  - `company_size_employees` (integer) - Number of employees
  - `annual_revenue_usd` (numeric) - Annual revenue
  - `client_portfolio` (text[]) - Notable clients
  - `distribution_network_size` (integer) - Network reach
  - `warehouse_facilities` (integer) - Number of warehouses
  - `logistics_capabilities` (jsonb) - Distribution capabilities
  - `certifications` (text[]) - Quality certifications
  - `financial_stability` (text) - Strong/Moderate/Weak
  - `reputation_rating` (numeric) - Rating 0-5
  - `partnership_terms` (text) - Terms and conditions
  - `exclusivity_requirements` (boolean) - Exclusive required
  - `minimum_commitments` (text) - Minimum requirements
  - `payment_terms` (text) - Payment conditions
  - `contract_duration_typical` (text) - Typical contract length
  - `strengths` (jsonb) - Key advantages
  - `weaknesses` (jsonb) - Known issues
  - `references_available` (boolean) - Can provide references
  - `contact_person` (text) - Main contact
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `website` (text) - Company website
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `professional_services`
  Legal, accounting, consulting, and advisory firms
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `cities_covered` (text[]) - Cities with offices
  - `firm_name` (text) - Firm name
  - `firm_type` (text) - Law_firm, accounting_firm, consultancy, advisory, tax_advisor
  - `specializations` (text[]) - Areas of expertise
  - `industries_served` (text[]) - Industry experience
  - `services_offered` (text[]) - Service catalog
  - `firm_size` (text) - Local, regional, international
  - `number_of_professionals` (integer) - Team size
  - `years_established` (integer) - Years in business
  - `global_network` (text) - International affiliations
  - `languages_offered` (text[]) - Languages spoken
  - `notable_clients` (text[]) - Major clients
  - `market_entry_experience` (boolean) - Market entry expertise
  - `fee_structure` (text) - Pricing model
  - `typical_hourly_rate_usd` (numeric) - Hourly rate
  - `typical_project_fee_range` (text) - Project pricing
  - `rating` (numeric) - Rating 0-5
  - `key_partners` (jsonb) - Senior partners
  - `credentials` (text[]) - Qualifications
  - `awards_recognition` (text[]) - Industry recognition
  - `contact_person` (text) - Main contact
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `website` (text) - Firm website
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `industry_associations`
  Trade associations, chambers of commerce, and business groups
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `association_name` (text) - Official name
  - `association_type` (text) - Chamber, trade_association, business_council, industry_group
  - `focus_industries` (text[]) - Industries represented
  - `member_count` (integer) - Number of members
  - `member_profile` (text) - Type of members
  - `membership_benefits` (jsonb) - What members get
  - `networking_events` (boolean) - Networking opportunities
  - `advocacy_activities` (boolean) - Government relations
  - `market_intelligence` (boolean) - Research and insights
  - `training_programs` (boolean) - Education offerings
  - `certification_programs` (boolean) - Certification available
  - `annual_membership_fee_usd` (numeric) - Membership cost
  - `joining_requirements` (text) - How to join
  - `influence_level` (text) - High/Medium/Low
  - `government_relationships` (text) - Political connections
  - `services_for_new_entrants` (jsonb) - Support for newcomers
  - `contact_person` (text) - Main contact
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `website` (text) - Association website
  - `address` (text) - Physical address
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `supplier_directory`
  Vetted suppliers and vendors by category
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `supplier_name` (text) - Company name
  - `supplier_category` (text) - Product or service category
  - `products_services` (text[]) - What they offer
  - `industries_served` (text[]) - Target industries
  - `quality_rating` (numeric) - Quality score 0-5
  - `reliability_rating` (numeric) - Reliability score 0-5
  - `price_competitiveness` (text) - Expensive/Fair/Competitive/Cheap
  - `minimum_order_quantity` (text) - MOQ requirements
  - `lead_time_days` (integer) - Production/delivery time
  - `payment_terms` (text) - Payment conditions
  - `certifications` (text[]) - Quality certifications
  - `export_capabilities` (boolean) - Can export
  - `languages_supported` (text[]) - Communication languages
  - `years_in_business` (integer) - Years operating
  - `notable_clients` (text[]) - Major customers
  - `capacity` (text) - Production capacity
  - `contact_person` (text) - Main contact
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `website` (text) - Company website
  - `address` (text) - Physical location
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all data
  - Public read access for general information
  - Only service role can insert/update data

  ## Indexes
  - Performance indexes on country and category
  - Financial and cost indexes
  - Full-text search on names and descriptions
*/

-- Investment Requirements Table
CREATE TABLE IF NOT EXISTS investment_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  business_model text,
  market_entry_mode text CHECK (market_entry_mode IN ('Greenfield', 'Acquisition', 'Joint_Venture', 'Franchise', 'Licensing', 'Partnership')),
  company_size text DEFAULT 'SME' CHECK (company_size IN ('Startup', 'SME', 'Mid-Market', 'Enterprise')),
  initial_capital_usd numeric DEFAULT 0,
  working_capital_usd numeric DEFAULT 0,
  real_estate_costs_usd numeric DEFAULT 0,
  equipment_costs_usd numeric DEFAULT 0,
  technology_costs_usd numeric DEFAULT 0,
  inventory_costs_usd numeric DEFAULT 0,
  licensing_fees_usd numeric DEFAULT 0,
  legal_and_incorporation_usd numeric DEFAULT 0,
  recruitment_costs_usd numeric DEFAULT 0,
  marketing_launch_budget_usd numeric DEFAULT 0,
  contingency_percentage numeric DEFAULT 20,
  total_investment_required_usd numeric DEFAULT 0,
  funding_sources_recommended jsonb DEFAULT '[]'::jsonb,
  break_even_timeline_months integer DEFAULT 0,
  payback_period_years numeric DEFAULT 0,
  assumptions jsonb DEFAULT '[]'::jsonb,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to investment requirements"
  ON investment_requirements FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read investment requirements"
  ON investment_requirements FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_investment_country_industry 
  ON investment_requirements(country, industry, year DESC);
CREATE INDEX IF NOT EXISTS idx_investment_total 
  ON investment_requirements(total_investment_required_usd DESC);

-- Operating Cost Models Table
CREATE TABLE IF NOT EXISTS operating_cost_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text NOT NULL,
  industry text NOT NULL,
  company_size text DEFAULT 'SME' CHECK (company_size IN ('Startup', 'SME', 'Mid-Market', 'Enterprise')),
  employee_count_range text,
  salaries_and_wages_monthly_usd numeric DEFAULT 0,
  benefits_and_insurance_monthly_usd numeric DEFAULT 0,
  rent_monthly_usd numeric DEFAULT 0,
  utilities_monthly_usd numeric DEFAULT 0,
  equipment_maintenance_monthly_usd numeric DEFAULT 0,
  technology_subscriptions_monthly_usd numeric DEFAULT 0,
  marketing_monthly_usd numeric DEFAULT 0,
  professional_services_monthly_usd numeric DEFAULT 0,
  insurance_monthly_usd numeric DEFAULT 0,
  transportation_monthly_usd numeric DEFAULT 0,
  supplies_monthly_usd numeric DEFAULT 0,
  taxes_monthly_usd numeric DEFAULT 0,
  miscellaneous_monthly_usd numeric DEFAULT 0,
  total_operating_costs_monthly_usd numeric DEFAULT 0,
  total_operating_costs_annual_usd numeric DEFAULT 0,
  cost_escalation_annual_percentage numeric DEFAULT 0,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operating_cost_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to operating cost models"
  ON operating_cost_models FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read operating cost models"
  ON operating_cost_models FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_operating_costs_city_industry 
  ON operating_cost_models(country, city, industry, year DESC);
CREATE INDEX IF NOT EXISTS idx_operating_costs_total 
  ON operating_cost_models(total_operating_costs_annual_usd DESC);

-- Funding Sources Table
CREATE TABLE IF NOT EXISTS funding_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  funding_type text NOT NULL CHECK (funding_type IN ('VC', 'PE', 'Bank_Loan', 'Grant', 'Angel', 'Crowdfunding', 'Corporate_VC', 'Government', 'Family_Office')),
  source_name text NOT NULL,
  description text NOT NULL,
  focus_industries text[] DEFAULT ARRAY[]::text[],
  focus_stages text[] DEFAULT ARRAY[]::text[],
  typical_check_size_min_usd numeric DEFAULT 0,
  typical_check_size_max_usd numeric DEFAULT 0,
  equity_stake_typical_percentage numeric DEFAULT 0,
  geographic_focus text[] DEFAULT ARRAY[]::text[],
  investment_criteria jsonb DEFAULT '[]'::jsonb,
  portfolio_companies text[] DEFAULT ARRAY[]::text[],
  total_aum_usd numeric DEFAULT 0,
  number_of_deals_annually integer DEFAULT 0,
  average_deal_size_usd numeric DEFAULT 0,
  value_add_services jsonb DEFAULT '[]'::jsonb,
  application_process text,
  decision_timeline_weeks integer DEFAULT 0,
  contact_information text,
  website text,
  key_partners jsonb DEFAULT '[]'::jsonb,
  success_rate_percentage numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funding_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to funding sources"
  ON funding_sources FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read funding sources"
  ON funding_sources FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_funding_country_type 
  ON funding_sources(country, funding_type);
CREATE INDEX IF NOT EXISTS idx_funding_check_size 
  ON funding_sources(typical_check_size_max_usd DESC);

-- Local Partners Table
CREATE TABLE IF NOT EXISTS local_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  partner_name text NOT NULL,
  partner_type text NOT NULL CHECK (partner_type IN ('Distributor', 'Agent', 'Service_Provider', 'Reseller', 'Logistics', 'Manufacturer', 'Wholesaler')),
  industries_served text[] DEFAULT ARRAY[]::text[],
  services_offered text[] DEFAULT ARRAY[]::text[],
  geographic_coverage text[] DEFAULT ARRAY[]::text[],
  years_in_business integer DEFAULT 0,
  company_size_employees integer DEFAULT 0,
  annual_revenue_usd numeric DEFAULT 0,
  client_portfolio text[] DEFAULT ARRAY[]::text[],
  distribution_network_size integer DEFAULT 0,
  warehouse_facilities integer DEFAULT 0,
  logistics_capabilities jsonb DEFAULT '{}'::jsonb,
  certifications text[] DEFAULT ARRAY[]::text[],
  financial_stability text DEFAULT 'Moderate' CHECK (financial_stability IN ('Strong', 'Moderate', 'Weak', 'Unknown')),
  reputation_rating numeric DEFAULT 0 CHECK (reputation_rating >= 0 AND reputation_rating <= 5),
  partnership_terms text,
  exclusivity_requirements boolean DEFAULT false,
  minimum_commitments text,
  payment_terms text,
  contract_duration_typical text,
  strengths jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  references_available boolean DEFAULT false,
  contact_person text,
  email text,
  phone text,
  website text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE local_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to local partners"
  ON local_partners FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read local partners"
  ON local_partners FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_local_partners_country_type 
  ON local_partners(country, partner_type);
CREATE INDEX IF NOT EXISTS idx_local_partners_rating 
  ON local_partners(reputation_rating DESC);

-- Professional Services Table
CREATE TABLE IF NOT EXISTS professional_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  cities_covered text[] DEFAULT ARRAY[]::text[],
  firm_name text NOT NULL,
  firm_type text NOT NULL CHECK (firm_type IN ('Law_Firm', 'Accounting_Firm', 'Consultancy', 'Advisory', 'Tax_Advisor', 'HR_Consultancy')),
  specializations text[] DEFAULT ARRAY[]::text[],
  industries_served text[] DEFAULT ARRAY[]::text[],
  services_offered text[] DEFAULT ARRAY[]::text[],
  firm_size text DEFAULT 'Local' CHECK (firm_size IN ('Local', 'Regional', 'International', 'Big_Four')),
  number_of_professionals integer DEFAULT 0,
  years_established integer DEFAULT 0,
  global_network text,
  languages_offered text[] DEFAULT ARRAY[]::text[],
  notable_clients text[] DEFAULT ARRAY[]::text[],
  market_entry_experience boolean DEFAULT false,
  fee_structure text,
  typical_hourly_rate_usd numeric DEFAULT 0,
  typical_project_fee_range text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  key_partners jsonb DEFAULT '[]'::jsonb,
  credentials text[] DEFAULT ARRAY[]::text[],
  awards_recognition text[] DEFAULT ARRAY[]::text[],
  contact_person text,
  email text,
  phone text,
  website text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to professional services"
  ON professional_services FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read professional services"
  ON professional_services FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_professional_services_country_type 
  ON professional_services(country, firm_type);
CREATE INDEX IF NOT EXISTS idx_professional_services_rating 
  ON professional_services(rating DESC);

-- Industry Associations Table
CREATE TABLE IF NOT EXISTS industry_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  association_name text NOT NULL,
  association_type text NOT NULL CHECK (association_type IN ('Chamber', 'Trade_Association', 'Business_Council', 'Industry_Group', 'Professional_Body')),
  focus_industries text[] DEFAULT ARRAY[]::text[],
  member_count integer DEFAULT 0,
  member_profile text,
  membership_benefits jsonb DEFAULT '[]'::jsonb,
  networking_events boolean DEFAULT false,
  advocacy_activities boolean DEFAULT false,
  market_intelligence boolean DEFAULT false,
  training_programs boolean DEFAULT false,
  certification_programs boolean DEFAULT false,
  annual_membership_fee_usd numeric DEFAULT 0,
  joining_requirements text,
  influence_level text DEFAULT 'Medium' CHECK (influence_level IN ('High', 'Medium', 'Low')),
  government_relationships text,
  services_for_new_entrants jsonb DEFAULT '[]'::jsonb,
  contact_person text,
  email text,
  phone text,
  website text,
  address text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE industry_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to industry associations"
  ON industry_associations FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read industry associations"
  ON industry_associations FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_industry_associations_country_type 
  ON industry_associations(country, association_type);
CREATE INDEX IF NOT EXISTS idx_industry_associations_influence 
  ON industry_associations(influence_level);

-- Supplier Directory Table
CREATE TABLE IF NOT EXISTS supplier_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  supplier_name text NOT NULL,
  supplier_category text NOT NULL,
  products_services text[] DEFAULT ARRAY[]::text[],
  industries_served text[] DEFAULT ARRAY[]::text[],
  quality_rating numeric DEFAULT 0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
  reliability_rating numeric DEFAULT 0 CHECK (reliability_rating >= 0 AND reliability_rating <= 5),
  price_competitiveness text DEFAULT 'Fair' CHECK (price_competitiveness IN ('Expensive', 'Fair', 'Competitive', 'Cheap')),
  minimum_order_quantity text,
  lead_time_days integer DEFAULT 0,
  payment_terms text,
  certifications text[] DEFAULT ARRAY[]::text[],
  export_capabilities boolean DEFAULT false,
  languages_supported text[] DEFAULT ARRAY[]::text[],
  years_in_business integer DEFAULT 0,
  notable_clients text[] DEFAULT ARRAY[]::text[],
  capacity text,
  contact_person text,
  email text,
  phone text,
  website text,
  address text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE supplier_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to supplier directory"
  ON supplier_directory FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to read supplier directory"
  ON supplier_directory FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_supplier_directory_country_category 
  ON supplier_directory(country, supplier_category);
CREATE INDEX IF NOT EXISTS idx_supplier_directory_ratings 
  ON supplier_directory(quality_rating DESC, reliability_rating DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_funding_sources_search 
  ON funding_sources USING gin(to_tsvector('english', source_name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_local_partners_search 
  ON local_partners USING gin(to_tsvector('english', partner_name));
CREATE INDEX IF NOT EXISTS idx_professional_services_search 
  ON professional_services USING gin(to_tsvector('english', firm_name));
CREATE INDEX IF NOT EXISTS idx_supplier_directory_search 
  ON supplier_directory USING gin(to_tsvector('english', supplier_name));