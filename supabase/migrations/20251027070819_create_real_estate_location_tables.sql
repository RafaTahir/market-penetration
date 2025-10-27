/*
  # Real Estate & Location Intelligence

  This migration creates comprehensive real estate and location intelligence tables
  to help businesses find optimal locations and understand property markets in
  Southeast Asian countries.

  ## New Tables

  ### `commercial_real_estate`
  Property listings and market data for commercial real estate
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `city` (text) - City
  - `district` (text) - District or neighborhood
  - `property_type` (text) - Office, retail, industrial, warehouse, mixed_use
  - `property_name` (text) - Building or development name
  - `address` (text) - Street address
  - `total_area_sqm` (numeric) - Total area in square meters
  - `available_area_sqm` (numeric) - Currently available space
  - `floor_range` (text) - Available floors
  - `grade` (text) - A, B, C grade classification
  - `year_built` (integer) - Construction year
  - `rent_per_sqm_month_usd` (numeric) - Monthly rent per sqm in USD
  - `rent_per_sqm_month_local` (numeric) - Monthly rent in local currency
  - `service_charge_per_sqm_month` (numeric) - Service charges
  - `deposit_months` (integer) - Security deposit in months
  - `lease_term_min_months` (integer) - Minimum lease term
  - `amenities` (text[]) - Available amenities
  - `transport_access` (jsonb) - Nearby transport links
  - `parking_spaces` (integer) - Available parking
  - `parking_cost_per_space_month` (numeric) - Parking cost
  - `ceiling_height_meters` (numeric) - Floor to ceiling height
  - `floor_loading_capacity` (numeric) - Load bearing capacity
  - `power_capacity_kva` (numeric) - Electrical capacity
  - `certifications` (text[]) - Green building, safety certs
  - `occupancy_rate` (numeric) - Current occupancy percentage
  - `major_tenants` (text[]) - Key tenants
  - `landlord_name` (text) - Property owner
  - `agent_contact` (text) - Leasing agent contact
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `economic_zones`
  Special economic zones, tech parks, and free trade areas
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `zone_name` (text) - Official zone name
  - `zone_type` (text) - SEZ, free_trade_zone, tech_park, industrial_park, export_processing_zone
  - `city` (text) - Nearest city
  - `location_description` (text) - Geographic location
  - `total_area_hectares` (numeric) - Total land area
  - `established_year` (integer) - Year established
  - `managing_authority` (text) - Who operates it
  - `focus_industries` (text[]) - Target industries
  - `incentives_offered` (jsonb) - Tax and other incentives
  - `tax_benefits` (text) - Tax advantages
  - `customs_benefits` (text) - Import/export advantages
  - `infrastructure_quality` (text) - Excellent/Good/Fair/Basic
  - `utilities_available` (text[]) - Power, water, fiber, etc
  - `transport_connectivity` (jsonb) - Road, rail, port, airport access
  - `land_cost_per_sqm_usd` (numeric) - Land purchase price
  - `factory_rent_per_sqm_month` (numeric) - Factory rental rates
  - `office_rent_per_sqm_month` (numeric) - Office rental rates
  - `setup_time_months` (integer) - Time to establish operations
  - `minimum_investment_usd` (numeric) - Minimum capital requirement
  - `employment_requirements` (text) - Hiring obligations
  - `current_occupancy_rate` (numeric) - Occupancy percentage
  - `major_companies_present` (text[]) - Key tenants
  - `success_stories` (jsonb) - Case studies
  - `application_process` (text) - How to apply
  - `contact_information` (text) - Who to contact
  - `website` (text) - Official website
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `infrastructure_projects`
  Major infrastructure projects and their business implications
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `project_name` (text) - Official project name
  - `project_type` (text) - Transport, energy, telecommunications, water, port, airport
  - `description` (text) - Project details
  - `status` (text) - Planned, under_construction, completed, delayed, cancelled
  - `start_date` (date) - Project start
  - `expected_completion_date` (date) - Expected completion
  - `actual_completion_date` (date) - If completed
  - `total_investment_usd` (numeric) - Total project cost
  - `funding_sources` (jsonb) - Who is funding
  - `implementing_agency` (text) - Government body responsible
  - `contractors` (text[]) - Main contractors
  - `location_description` (text) - Where it's being built
  - `affected_regions` (text[]) - Regions impacted
  - `business_opportunities` (jsonb) - Opportunities for businesses
  - `industries_benefiting` (text[]) - Which industries benefit
  - `economic_impact` (text) - Expected economic effects
  - `connectivity_improvements` (text) - How it improves access
  - `completion_percentage` (numeric) - Project progress
  - `challenges` (text) - Current issues or delays
  - `strategic_importance` (text) - Why it matters
  - `related_projects` (text[]) - Connected infrastructure
  - `data_sources` (jsonb) - Source references
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `location_costs`
  Comprehensive cost of doing business by city
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `city` (text) - City
  - `year` (integer) - Year of data
  - `quarter` (integer) - Quarter if applicable
  - `office_rent_grade_a_usd_sqm` (numeric) - Grade A office rent
  - `office_rent_grade_b_usd_sqm` (numeric) - Grade B office rent
  - `retail_rent_prime_usd_sqm` (numeric) - Prime retail rent
  - `industrial_rent_usd_sqm` (numeric) - Industrial space rent
  - `warehouse_rent_usd_sqm` (numeric) - Warehouse rent
  - `electricity_cost_per_kwh` (numeric) - Power cost
  - `water_cost_per_cubic_meter` (numeric) - Water cost
  - `internet_cost_1gbps_month` (numeric) - Fiber internet cost
  - `mobile_plan_unlimited_month` (numeric) - Mobile phone cost
  - `average_hotel_night_usd` (numeric) - Business hotel cost
  - `meal_mid_range_restaurant_usd` (numeric) - Business meal cost
  - `taxi_per_km_usd` (numeric) - Transport cost
  - `car_rental_day_usd` (numeric) - Daily car rental
  - `cost_of_living_index` (numeric) - Compared to NYC (100)
  - `business_cost_index` (numeric) - Overall business costs
  - `data_source` (text) - Where data came from
  - `created_at` (timestamptz)

  ### `site_selection_matrix`
  Scored locations based on multiple business criteria
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `city` (text) - City
  - `district` (text) - Specific area
  - `industry_focus` (text) - Which industry this is for
  - `total_score` (numeric) - Overall score 0-100
  - `market_access_score` (numeric) - Customer access 0-100
  - `talent_availability_score` (numeric) - Workforce quality 0-100
  - `infrastructure_score` (numeric) - Infrastructure quality 0-100
  - `cost_competitiveness_score` (numeric) - Cost advantage 0-100
  - `regulatory_environment_score` (numeric) - Ease of doing business 0-100
  - `quality_of_life_score` (numeric) - Livability 0-100
  - `innovation_ecosystem_score` (numeric) - Tech ecosystem 0-100
  - `transport_connectivity_score` (numeric) - Transport links 0-100
  - `real_estate_availability_score` (numeric) - Property options 0-100
  - `supplier_ecosystem_score` (numeric) - Supply chain access 0-100
  - `strengths` (jsonb) - Key advantages
  - `weaknesses` (jsonb) - Drawbacks
  - `best_suited_for` (text[]) - Ideal business types
  - `comparable_cities` (text[]) - Similar alternatives
  - `assessment_date` (date) - When assessed
  - `methodology` (text) - How scored
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all location data
  - Public read access for general location information
  - Only service role can insert/update data

  ## Indexes
  - Performance indexes on country and city
  - Cost and score indexes for filtering
  - Date indexes for time-series queries
*/

-- Commercial Real Estate Table
CREATE TABLE IF NOT EXISTS commercial_real_estate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text NOT NULL,
  district text,
  property_type text NOT NULL CHECK (property_type IN ('Office', 'Retail', 'Industrial', 'Warehouse', 'Mixed_Use', 'Land')),
  property_name text NOT NULL,
  address text,
  total_area_sqm numeric DEFAULT 0,
  available_area_sqm numeric DEFAULT 0,
  floor_range text,
  grade text CHECK (grade IN ('A', 'B', 'C', 'Ungraded')),
  year_built integer,
  rent_per_sqm_month_usd numeric DEFAULT 0,
  rent_per_sqm_month_local numeric DEFAULT 0,
  service_charge_per_sqm_month numeric DEFAULT 0,
  deposit_months integer DEFAULT 0,
  lease_term_min_months integer DEFAULT 0,
  amenities text[] DEFAULT ARRAY[]::text[],
  transport_access jsonb DEFAULT '[]'::jsonb,
  parking_spaces integer DEFAULT 0,
  parking_cost_per_space_month numeric DEFAULT 0,
  ceiling_height_meters numeric DEFAULT 0,
  floor_loading_capacity numeric DEFAULT 0,
  power_capacity_kva numeric DEFAULT 0,
  certifications text[] DEFAULT ARRAY[]::text[],
  occupancy_rate numeric DEFAULT 0,
  major_tenants text[] DEFAULT ARRAY[]::text[],
  landlord_name text,
  agent_contact text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE commercial_real_estate ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to commercial real estate"
  ON commercial_real_estate FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read commercial real estate"
  ON commercial_real_estate FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_real_estate_city_type 
  ON commercial_real_estate(country, city, property_type);
CREATE INDEX IF NOT EXISTS idx_real_estate_grade 
  ON commercial_real_estate(grade);
CREATE INDEX IF NOT EXISTS idx_real_estate_rent 
  ON commercial_real_estate(rent_per_sqm_month_usd);
CREATE INDEX IF NOT EXISTS idx_real_estate_updated 
  ON commercial_real_estate(last_updated DESC);

-- Economic Zones Table
CREATE TABLE IF NOT EXISTS economic_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  zone_name text NOT NULL,
  zone_type text NOT NULL CHECK (zone_type IN ('SEZ', 'Free_Trade_Zone', 'Tech_Park', 'Industrial_Park', 'Export_Processing_Zone', 'Science_Park')),
  city text NOT NULL,
  location_description text,
  total_area_hectares numeric DEFAULT 0,
  established_year integer,
  managing_authority text,
  focus_industries text[] DEFAULT ARRAY[]::text[],
  incentives_offered jsonb DEFAULT '[]'::jsonb,
  tax_benefits text,
  customs_benefits text,
  infrastructure_quality text DEFAULT 'Good' CHECK (infrastructure_quality IN ('Excellent', 'Good', 'Fair', 'Basic')),
  utilities_available text[] DEFAULT ARRAY[]::text[],
  transport_connectivity jsonb DEFAULT '{}'::jsonb,
  land_cost_per_sqm_usd numeric DEFAULT 0,
  factory_rent_per_sqm_month numeric DEFAULT 0,
  office_rent_per_sqm_month numeric DEFAULT 0,
  setup_time_months integer DEFAULT 0,
  minimum_investment_usd numeric DEFAULT 0,
  employment_requirements text,
  current_occupancy_rate numeric DEFAULT 0,
  major_companies_present text[] DEFAULT ARRAY[]::text[],
  success_stories jsonb DEFAULT '[]'::jsonb,
  application_process text,
  contact_information text,
  website text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE economic_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to economic zones"
  ON economic_zones FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read economic zones"
  ON economic_zones FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_economic_zones_country_type 
  ON economic_zones(country, zone_type);
CREATE INDEX IF NOT EXISTS idx_economic_zones_city 
  ON economic_zones(city);
CREATE INDEX IF NOT EXISTS idx_economic_zones_occupancy 
  ON economic_zones(current_occupancy_rate);

-- Infrastructure Projects Table
CREATE TABLE IF NOT EXISTS infrastructure_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  project_name text NOT NULL,
  project_type text NOT NULL CHECK (project_type IN ('Transport', 'Energy', 'Telecommunications', 'Water', 'Port', 'Airport', 'Railway', 'Highway', 'Urban_Development')),
  description text NOT NULL,
  status text DEFAULT 'Planned' CHECK (status IN ('Planned', 'Under_Construction', 'Completed', 'Delayed', 'Cancelled', 'On_Hold')),
  start_date date,
  expected_completion_date date,
  actual_completion_date date,
  total_investment_usd numeric DEFAULT 0,
  funding_sources jsonb DEFAULT '[]'::jsonb,
  implementing_agency text,
  contractors text[] DEFAULT ARRAY[]::text[],
  location_description text,
  affected_regions text[] DEFAULT ARRAY[]::text[],
  business_opportunities jsonb DEFAULT '[]'::jsonb,
  industries_benefiting text[] DEFAULT ARRAY[]::text[],
  economic_impact text,
  connectivity_improvements text,
  completion_percentage numeric DEFAULT 0,
  challenges text,
  strategic_importance text,
  related_projects text[] DEFAULT ARRAY[]::text[],
  data_sources jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE infrastructure_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to infrastructure projects"
  ON infrastructure_projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read infrastructure projects"
  ON infrastructure_projects FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_infrastructure_country_type 
  ON infrastructure_projects(country, project_type);
CREATE INDEX IF NOT EXISTS idx_infrastructure_status 
  ON infrastructure_projects(status);
CREATE INDEX IF NOT EXISTS idx_infrastructure_completion_date 
  ON infrastructure_projects(expected_completion_date);
CREATE INDEX IF NOT EXISTS idx_infrastructure_updated 
  ON infrastructure_projects(last_updated DESC);

-- Location Costs Table
CREATE TABLE IF NOT EXISTS location_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text NOT NULL,
  year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  office_rent_grade_a_usd_sqm numeric DEFAULT 0,
  office_rent_grade_b_usd_sqm numeric DEFAULT 0,
  retail_rent_prime_usd_sqm numeric DEFAULT 0,
  industrial_rent_usd_sqm numeric DEFAULT 0,
  warehouse_rent_usd_sqm numeric DEFAULT 0,
  electricity_cost_per_kwh numeric DEFAULT 0,
  water_cost_per_cubic_meter numeric DEFAULT 0,
  internet_cost_1gbps_month numeric DEFAULT 0,
  mobile_plan_unlimited_month numeric DEFAULT 0,
  average_hotel_night_usd numeric DEFAULT 0,
  meal_mid_range_restaurant_usd numeric DEFAULT 0,
  taxi_per_km_usd numeric DEFAULT 0,
  car_rental_day_usd numeric DEFAULT 0,
  cost_of_living_index numeric DEFAULT 100,
  business_cost_index numeric DEFAULT 100,
  data_source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE location_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to location costs"
  ON location_costs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read location costs"
  ON location_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_location_costs_city_year 
  ON location_costs(country, city, year DESC);
CREATE INDEX IF NOT EXISTS idx_location_costs_index 
  ON location_costs(business_cost_index);

-- Site Selection Matrix Table
CREATE TABLE IF NOT EXISTS site_selection_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text NOT NULL,
  district text,
  industry_focus text NOT NULL,
  total_score numeric DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  market_access_score numeric DEFAULT 0 CHECK (market_access_score >= 0 AND market_access_score <= 100),
  talent_availability_score numeric DEFAULT 0 CHECK (talent_availability_score >= 0 AND talent_availability_score <= 100),
  infrastructure_score numeric DEFAULT 0 CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
  cost_competitiveness_score numeric DEFAULT 0 CHECK (cost_competitiveness_score >= 0 AND cost_competitiveness_score <= 100),
  regulatory_environment_score numeric DEFAULT 0 CHECK (regulatory_environment_score >= 0 AND regulatory_environment_score <= 100),
  quality_of_life_score numeric DEFAULT 0 CHECK (quality_of_life_score >= 0 AND quality_of_life_score <= 100),
  innovation_ecosystem_score numeric DEFAULT 0 CHECK (innovation_ecosystem_score >= 0 AND innovation_ecosystem_score <= 100),
  transport_connectivity_score numeric DEFAULT 0 CHECK (transport_connectivity_score >= 0 AND transport_connectivity_score <= 100),
  real_estate_availability_score numeric DEFAULT 0 CHECK (real_estate_availability_score >= 0 AND real_estate_availability_score <= 100),
  supplier_ecosystem_score numeric DEFAULT 0 CHECK (supplier_ecosystem_score >= 0 AND supplier_ecosystem_score <= 100),
  strengths jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  best_suited_for text[] DEFAULT ARRAY[]::text[],
  comparable_cities text[] DEFAULT ARRAY[]::text[],
  assessment_date date NOT NULL,
  methodology text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_selection_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to site selection matrix"
  ON site_selection_matrix FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read site selection matrix"
  ON site_selection_matrix FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_site_selection_city_industry 
  ON site_selection_matrix(country, city, industry_focus);
CREATE INDEX IF NOT EXISTS idx_site_selection_score 
  ON site_selection_matrix(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_site_selection_date 
  ON site_selection_matrix(assessment_date DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_real_estate_search 
  ON commercial_real_estate USING gin(to_tsvector('english', property_name || ' ' || COALESCE(address, '')));
CREATE INDEX IF NOT EXISTS idx_economic_zones_search 
  ON economic_zones USING gin(to_tsvector('english', zone_name || ' ' || COALESCE(location_description, '')));
CREATE INDEX IF NOT EXISTS idx_infrastructure_search 
  ON infrastructure_projects USING gin(to_tsvector('english', project_name || ' ' || description));