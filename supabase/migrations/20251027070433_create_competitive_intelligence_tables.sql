/*
  # Competitive Intelligence & Market Monitoring

  This migration creates comprehensive competitive intelligence tables to help businesses
  understand market dynamics, competitor positioning, and competitive threats in Southeast Asian markets.

  ## New Tables

  ### `competitor_profiles`
  Stores detailed profiles of companies operating in target markets
  - `id` (uuid, primary key)
  - `company_name` (text) - Company legal name
  - `brand_names` (text[]) - All brand names operated
  - `country` (text) - Primary country of operation
  - `countries_operated` (text[]) - All countries with presence
  - `industry` (text) - Primary industry sector
  - `sub_sectors` (text[]) - Specific sub-sectors
  - `market_share_percentage` (numeric) - Estimated market share
  - `annual_revenue_usd` (numeric) - Annual revenue in USD
  - `employee_count` (integer) - Number of employees
  - `entry_year` (integer) - Year entered the market
  - `headquarters_location` (text) - HQ city and country
  - `business_model` (text) - Description of business model
  - `competitive_advantages` (jsonb) - Key advantages
  - `weaknesses` (jsonb) - Known weaknesses
  - `expansion_plans` (text) - Future expansion information
  - `parent_company` (text) - Parent organization if applicable
  - `stock_symbol` (text) - Stock ticker if public
  - `website` (text) - Company website
  - `data_sources` (jsonb) - Source references
  - `confidence_score` (numeric) - Data confidence 0-100
  - `last_updated` (timestamptz) - Last verification date
  - `created_at` (timestamptz)

  ### `competitor_activities`
  Tracks significant competitive moves and market events
  - `id` (uuid, primary key)
  - `competitor_id` (uuid) - Foreign key to competitor_profiles
  - `company_name` (text) - Company name for quick reference
  - `activity_type` (text) - Type: acquisition, product_launch, expansion, partnership, exit, funding
  - `activity_title` (text) - Brief title
  - `description` (text) - Detailed description
  - `country` (text) - Country where activity occurred
  - `industry` (text) - Industry sector affected
  - `investment_amount_usd` (numeric) - Investment amount if applicable
  - `impact_level` (text) - High/Medium/Low market impact
  - `strategic_significance` (text) - Why this matters
  - `activity_date` (date) - When activity occurred
  - `data_sources` (jsonb) - Source references
  - `tags` (text[]) - Categorization tags
  - `created_at` (timestamptz)

  ### `market_share_tracking`
  Time-series market share data by industry and country
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `industry` (text) - Industry sector
  - `sub_sector` (text) - Specific sub-sector
  - `company_name` (text) - Company name
  - `market_share_percentage` (numeric) - Market share
  - `rank` (integer) - Market position rank
  - `revenue_usd` (numeric) - Revenue in this market
  - `year` (integer) - Year of data
  - `quarter` (integer) - Quarter if applicable
  - `total_market_size_usd` (numeric) - Total addressable market
  - `growth_rate` (numeric) - YoY growth rate
  - `data_source` (text) - Source of data
  - `methodology` (text) - How share was calculated
  - `created_at` (timestamptz)

  ### `pricing_intelligence`
  Competitive pricing data across markets and products
  - `id` (uuid, primary key)
  - `company_name` (text) - Company offering the product/service
  - `product_name` (text) - Product or service name
  - `product_category` (text) - Category classification
  - `country` (text) - Country where priced
  - `city` (text) - Specific city if relevant
  - `price_local_currency` (numeric) - Price in local currency
  - `currency_code` (text) - Currency (THB, SGD, etc)
  - `price_usd` (numeric) - Converted to USD
  - `pricing_model` (text) - Subscription, one-time, freemium, etc
  - `price_tier` (text) - Basic, premium, enterprise, etc
  - `features_included` (jsonb) - What's included at this price
  - `competitor_comparison` (jsonb) - How it compares to competitors
  - `price_positioning` (text) - Value, mid-range, premium
  - `discounts_available` (text) - Promotions or discounts
  - `observation_date` (date) - When price was observed
  - `data_source` (text) - How price was obtained
  - `created_at` (timestamptz)

  ### `market_entry_barriers`
  Documents barriers to entry by country and industry
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `industry` (text) - Industry sector
  - `barrier_type` (text) - Regulatory, financial, operational, cultural, competitive
  - `barrier_title` (text) - Brief title
  - `description` (text) - Detailed explanation
  - `severity_level` (text) - High/Medium/Low barrier
  - `estimated_cost_usd` (numeric) - Financial cost if applicable
  - `time_to_overcome_days` (integer) - Time needed
  - `mitigation_strategies` (jsonb) - How to overcome
  - `examples` (jsonb) - Real examples from other companies
  - `regulatory_reference` (text) - Legal references if applicable
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all competitive intelligence data
  - Only service role can insert/update data
  - Public read access for non-sensitive competitive data

  ## Indexes
  - Performance indexes on country, industry, and company name
  - Date indexes for time-series queries
  - Full-text search on descriptions and titles
*/

-- Competitor Profiles Table
CREATE TABLE IF NOT EXISTS competitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  brand_names text[] DEFAULT ARRAY[]::text[],
  country text NOT NULL,
  countries_operated text[] DEFAULT ARRAY[]::text[],
  industry text NOT NULL,
  sub_sectors text[] DEFAULT ARRAY[]::text[],
  market_share_percentage numeric DEFAULT 0,
  annual_revenue_usd numeric DEFAULT 0,
  employee_count integer DEFAULT 0,
  entry_year integer,
  headquarters_location text,
  business_model text,
  competitive_advantages jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  expansion_plans text,
  parent_company text,
  stock_symbol text,
  website text,
  data_sources jsonb DEFAULT '[]'::jsonb,
  confidence_score numeric DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competitor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to competitor profiles"
  ON competitor_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read competitor profiles"
  ON competitor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_competitor_profiles_country 
  ON competitor_profiles(country);
CREATE INDEX IF NOT EXISTS idx_competitor_profiles_industry 
  ON competitor_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_competitor_profiles_company 
  ON competitor_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_competitor_profiles_updated 
  ON competitor_profiles(last_updated DESC);

-- Competitor Activities Table
CREATE TABLE IF NOT EXISTS competitor_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitor_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('acquisition', 'product_launch', 'expansion', 'partnership', 'exit', 'funding', 'restructuring', 'merger')),
  activity_title text NOT NULL,
  description text NOT NULL,
  country text NOT NULL,
  industry text NOT NULL,
  investment_amount_usd numeric DEFAULT 0,
  impact_level text DEFAULT 'Medium' CHECK (impact_level IN ('High', 'Medium', 'Low')),
  strategic_significance text,
  activity_date date NOT NULL,
  data_sources jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competitor_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to competitor activities"
  ON competitor_activities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read competitor activities"
  ON competitor_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_activities_company 
  ON competitor_activities(company_name);
CREATE INDEX IF NOT EXISTS idx_activities_country 
  ON competitor_activities(country);
CREATE INDEX IF NOT EXISTS idx_activities_type 
  ON competitor_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_date 
  ON competitor_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_impact 
  ON competitor_activities(impact_level);

-- Market Share Tracking Table
CREATE TABLE IF NOT EXISTS market_share_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  sub_sector text,
  company_name text NOT NULL,
  market_share_percentage numeric NOT NULL DEFAULT 0,
  rank integer DEFAULT 0,
  revenue_usd numeric DEFAULT 0,
  year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  total_market_size_usd numeric DEFAULT 0,
  growth_rate numeric DEFAULT 0,
  data_source text NOT NULL,
  methodology text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_share_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to market share data"
  ON market_share_tracking FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read market share data"
  ON market_share_tracking FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_market_share_country_industry 
  ON market_share_tracking(country, industry, year DESC);
CREATE INDEX IF NOT EXISTS idx_market_share_company 
  ON market_share_tracking(company_name, year DESC);
CREATE INDEX IF NOT EXISTS idx_market_share_rank 
  ON market_share_tracking(country, industry, rank);

-- Pricing Intelligence Table
CREATE TABLE IF NOT EXISTS pricing_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  product_name text NOT NULL,
  product_category text NOT NULL,
  country text NOT NULL,
  city text,
  price_local_currency numeric NOT NULL DEFAULT 0,
  currency_code text NOT NULL,
  price_usd numeric NOT NULL DEFAULT 0,
  pricing_model text DEFAULT 'one-time',
  price_tier text,
  features_included jsonb DEFAULT '[]'::jsonb,
  competitor_comparison jsonb DEFAULT '[]'::jsonb,
  price_positioning text DEFAULT 'mid-range' CHECK (price_positioning IN ('budget', 'value', 'mid-range', 'premium', 'luxury')),
  discounts_available text,
  observation_date date NOT NULL,
  data_source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to pricing intelligence"
  ON pricing_intelligence FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read pricing intelligence"
  ON pricing_intelligence FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_pricing_country_category 
  ON pricing_intelligence(country, product_category);
CREATE INDEX IF NOT EXISTS idx_pricing_company 
  ON pricing_intelligence(company_name);
CREATE INDEX IF NOT EXISTS idx_pricing_date 
  ON pricing_intelligence(observation_date DESC);

-- Market Entry Barriers Table
CREATE TABLE IF NOT EXISTS market_entry_barriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  barrier_type text NOT NULL CHECK (barrier_type IN ('regulatory', 'financial', 'operational', 'cultural', 'competitive', 'technological', 'legal')),
  barrier_title text NOT NULL,
  description text NOT NULL,
  severity_level text DEFAULT 'Medium' CHECK (severity_level IN ('High', 'Medium', 'Low')),
  estimated_cost_usd numeric DEFAULT 0,
  time_to_overcome_days integer DEFAULT 0,
  mitigation_strategies jsonb DEFAULT '[]'::jsonb,
  examples jsonb DEFAULT '[]'::jsonb,
  regulatory_reference text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_entry_barriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to market barriers"
  ON market_entry_barriers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read market barriers"
  ON market_entry_barriers FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_barriers_country_industry 
  ON market_entry_barriers(country, industry);
CREATE INDEX IF NOT EXISTS idx_barriers_type 
  ON market_entry_barriers(barrier_type);
CREATE INDEX IF NOT EXISTS idx_barriers_severity 
  ON market_entry_barriers(severity_level);
CREATE INDEX IF NOT EXISTS idx_barriers_updated 
  ON market_entry_barriers(last_updated DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_competitor_profiles_search 
  ON competitor_profiles USING gin(to_tsvector('english', company_name || ' ' || COALESCE(business_model, '')));
CREATE INDEX IF NOT EXISTS idx_activities_search 
  ON competitor_activities USING gin(to_tsvector('english', activity_title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_barriers_search 
  ON market_entry_barriers USING gin(to_tsvector('english', barrier_title || ' ' || description));