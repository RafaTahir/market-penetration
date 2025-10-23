/*
  # Expanded Market Data Infrastructure

  This migration creates comprehensive database tables for storing enhanced market intelligence data 
  from multiple credible sources including OECD, UN Comtrade, and additional economic indicators.

  ## New Tables

  1. **trade_statistics** - International trade data by country
     - `country_code` (text) - ISO country code
     - `partner_country` (text) - Trading partner country
     - `trade_flow` (text) - Import/Export
     - `commodity_code` (text) - HS commodity code
     - `commodity_name` (text) - Product description
     - `trade_value_usd` (numeric) - Trade value in USD
     - `year` (integer) - Year of data
     - `month` (integer) - Month of data
     - `data_source` (text) - Source of data
     - `timestamp` (timestamptz) - Record timestamp

  2. **economic_indicators_extended** - Extended economic metrics
     - `country` (text) - Country name
     - `indicator_name` (text) - Indicator type
     - `indicator_code` (text) - Standardized code
     - `value` (numeric) - Indicator value
     - `year` (integer) - Year of data
     - `quarter` (integer) - Quarter if applicable
     - `unit` (text) - Unit of measurement
     - `data_source` (text) - Source organization
     - `timestamp` (timestamptz) - Record timestamp

  3. **industry_metrics** - Industry-specific performance data
     - `country` (text) - Country name
     - `industry_sector` (text) - Industry classification
     - `metric_name` (text) - Metric type
     - `metric_value` (numeric) - Value
     - `growth_rate` (numeric) - YoY growth percentage
     - `market_size_usd` (numeric) - Market size in USD
     - `year` (integer) - Year of data
     - `data_source` (text) - Source
     - `timestamp` (timestamptz) - Record timestamp

  4. **case_studies_data** - Real-world case studies with sources
     - `company_name` (text) - Company name
     - `industry` (text) - Industry sector
     - `country` (text) - Target country
     - `city` (text) - Target city
     - `entry_year` (integer) - Market entry year
     - `case_type` (text) - Success/Failure
     - `investment_amount` (numeric) - Investment in USD
     - `outcome_description` (text) - Detailed outcome
     - `key_factors` (jsonb) - Success/failure factors
     - `lessons_learned` (jsonb) - Key lessons
     - `market_strategy` (text) - Strategy employed
     - `roi_percentage` (numeric) - ROI if available
     - `data_sources` (jsonb) - Source references
     - `last_updated` (timestamptz) - Last update time

  5. **market_opportunities** - Identified market opportunities
     - `country` (text) - Target country
     - `industry` (text) - Industry sector
     - `opportunity_type` (text) - Type of opportunity
     - `opportunity_title` (text) - Brief title
     - `description` (text) - Detailed description
     - `market_size_usd` (numeric) - Estimated market size
     - `growth_potential` (numeric) - Growth percentage
     - `risk_level` (text) - Low/Medium/High
     - `confidence_score` (numeric) - Confidence 0-100
     - `data_sources` (jsonb) - Supporting sources
     - `identified_date` (timestamptz) - When identified
     - `timestamp` (timestamptz) - Record timestamp

  6. **data_refresh_log** - Track data refresh status
     - `data_source` (text) - Source name
     - `endpoint` (text) - API endpoint
     - `last_refresh` (timestamptz) - Last successful refresh
     - `next_refresh` (timestamptz) - Scheduled next refresh
     - `refresh_status` (text) - Success/Failed
     - `records_updated` (integer) - Number of records
     - `error_message` (text) - Error if failed
     - `refresh_frequency` (text) - Hourly/Daily/Weekly

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all data
  - Only service role can insert/update data
  - Public read access for non-sensitive market data

  ## Indexes
  - Performance indexes on frequently queried columns
  - Composite indexes for country + year queries
  - Timestamp indexes for time-series queries
*/

-- Trade Statistics Table
CREATE TABLE IF NOT EXISTS trade_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  partner_country text NOT NULL,
  trade_flow text NOT NULL,
  commodity_code text,
  commodity_name text,
  trade_value_usd numeric NOT NULL DEFAULT 0,
  year integer NOT NULL,
  month integer,
  data_source text DEFAULT 'UN Comtrade',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to trade statistics"
  ON trade_statistics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read trade statistics"
  ON trade_statistics FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_trade_country_year 
  ON trade_statistics(country_code, year DESC);
CREATE INDEX IF NOT EXISTS idx_trade_partner 
  ON trade_statistics(partner_country, year DESC);
CREATE INDEX IF NOT EXISTS idx_trade_timestamp 
  ON trade_statistics(timestamp DESC);

-- Economic Indicators Extended Table
CREATE TABLE IF NOT EXISTS economic_indicators_extended (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  indicator_name text NOT NULL,
  indicator_code text NOT NULL,
  value numeric NOT NULL,
  year integer NOT NULL,
  quarter integer,
  unit text NOT NULL,
  data_source text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE economic_indicators_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to economic indicators"
  ON economic_indicators_extended FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read economic indicators"
  ON economic_indicators_extended FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_econ_country_year 
  ON economic_indicators_extended(country, year DESC);
CREATE INDEX IF NOT EXISTS idx_econ_indicator 
  ON economic_indicators_extended(indicator_code, year DESC);
CREATE INDEX IF NOT EXISTS idx_econ_timestamp 
  ON economic_indicators_extended(timestamp DESC);

-- Industry Metrics Table
CREATE TABLE IF NOT EXISTS industry_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry_sector text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  growth_rate numeric,
  market_size_usd numeric,
  year integer NOT NULL,
  data_source text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE industry_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to industry metrics"
  ON industry_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read industry metrics"
  ON industry_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_industry_country_sector 
  ON industry_metrics(country, industry_sector, year DESC);
CREATE INDEX IF NOT EXISTS idx_industry_timestamp 
  ON industry_metrics(timestamp DESC);

-- Case Studies Data Table
CREATE TABLE IF NOT EXISTS case_studies_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  industry text NOT NULL,
  country text NOT NULL,
  city text,
  entry_year integer NOT NULL,
  case_type text NOT NULL CHECK (case_type IN ('success', 'failure', 'ongoing')),
  investment_amount numeric,
  outcome_description text NOT NULL,
  key_factors jsonb DEFAULT '[]'::jsonb,
  lessons_learned jsonb DEFAULT '[]'::jsonb,
  market_strategy text,
  roi_percentage numeric,
  data_sources jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_studies_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to case studies"
  ON case_studies_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read case studies"
  ON case_studies_data FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_case_country_industry 
  ON case_studies_data(country, industry);
CREATE INDEX IF NOT EXISTS idx_case_type 
  ON case_studies_data(case_type, entry_year DESC);

-- Market Opportunities Table
CREATE TABLE IF NOT EXISTS market_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  opportunity_type text NOT NULL,
  opportunity_title text NOT NULL,
  description text NOT NULL,
  market_size_usd numeric,
  growth_potential numeric,
  risk_level text DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High')),
  confidence_score numeric DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  data_sources jsonb DEFAULT '[]'::jsonb,
  identified_date timestamptz DEFAULT now(),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to market opportunities"
  ON market_opportunities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read market opportunities"
  ON market_opportunities FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_opps_country_industry 
  ON market_opportunities(country, industry);
CREATE INDEX IF NOT EXISTS idx_opps_risk_confidence 
  ON market_opportunities(risk_level, confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_opps_timestamp 
  ON market_opportunities(timestamp DESC);

-- Data Refresh Log Table
CREATE TABLE IF NOT EXISTS data_refresh_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source text NOT NULL,
  endpoint text NOT NULL,
  last_refresh timestamptz DEFAULT now(),
  next_refresh timestamptz,
  refresh_status text DEFAULT 'pending' CHECK (refresh_status IN ('success', 'failed', 'pending', 'in_progress')),
  records_updated integer DEFAULT 0,
  error_message text,
  refresh_frequency text DEFAULT 'daily' CHECK (refresh_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_refresh_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read refresh log"
  ON data_refresh_log FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_refresh_source 
  ON data_refresh_log(data_source, last_refresh DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_status 
  ON data_refresh_log(refresh_status, last_refresh DESC);