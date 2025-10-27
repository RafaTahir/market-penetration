/*
  # Risk Assessment & Due Diligence

  This migration creates comprehensive risk assessment tables to help businesses
  evaluate and mitigate political, economic, operational, and financial risks
  when entering Southeast Asian markets.

  ## New Tables

  ### `political_risk_index`
  Tracks political stability metrics and risk indicators
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `year` (integer) - Year of assessment
  - `quarter` (integer) - Quarter if applicable
  - `political_stability_score` (numeric) - Overall stability 0-100
  - `corruption_index` (numeric) - Corruption perception index
  - `government_effectiveness` (numeric) - Effectiveness score 0-100
  - `regulatory_quality` (numeric) - Regulatory quality score 0-100
  - `rule_of_law_score` (numeric) - Rule of law index
  - `democratic_accountability` (numeric) - Democracy score
  - `regime_stability` (text) - Stable/Uncertain/Unstable
  - `election_risk` (text) - Low/Medium/High
  - `civil_unrest_risk` (text) - Low/Medium/High
  - `policy_continuity_risk` (text) - Low/Medium/High
  - `recent_events` (jsonb) - Array of significant political events
  - `risk_summary` (text) - Executive summary of risks
  - `mitigation_strategies` (jsonb) - Recommended risk mitigations
  - `data_sources` (jsonb) - Source references (WB, TI, EIU, etc)
  - `assessment_date` (date) - When assessed
  - `created_at` (timestamptz)

  ### `economic_risk_factors`
  Tracks economic stability and financial risks
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `year` (integer) - Year of data
  - `quarter` (integer) - Quarter if applicable
  - `currency_volatility_score` (numeric) - FX volatility 0-100
  - `inflation_risk` (text) - Low/Medium/High
  - `debt_to_gdp_ratio` (numeric) - Government debt percentage
  - `fiscal_balance` (numeric) - Budget surplus/deficit as % GDP
  - `current_account_balance` (numeric) - Trade balance as % GDP
  - `foreign_reserves_months` (numeric) - Import cover in months
  - `banking_sector_health` (text) - Strong/Moderate/Weak
  - `sovereign_default_risk` (text) - Low/Medium/High
  - `exchange_rate_regime` (text) - Fixed, managed, floating
  - `capital_controls` (text) - None, partial, strict
  - `economic_freedom_score` (numeric) - Economic freedom index 0-100
  - `ease_of_repatriation` (text) - Easy/Moderate/Difficult
  - `recession_risk` (text) - Low/Medium/High
  - `risk_summary` (text) - Key economic risks
  - `data_sources` (jsonb) - Source references
  - `assessment_date` (date)
  - `created_at` (timestamptz)

  ### `operational_risks`
  Documents day-to-day business operational risks
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `city` (text) - Specific city if applicable
  - `industry` (text) - Industry sector
  - `risk_category` (text) - Infrastructure, labor, supply_chain, logistics, technology, security
  - `risk_title` (text) - Brief title
  - `risk_description` (text) - Detailed description
  - `severity` (text) - Critical/High/Medium/Low
  - `likelihood` (text) - Very_Likely/Likely/Possible/Unlikely
  - `impact_on_operations` (text) - How it affects business
  - `affected_business_functions` (text[]) - Which functions impacted
  - `historical_incidents` (jsonb) - Past examples
  - `current_status` (text) - Current state of the risk
  - `mitigation_measures` (jsonb) - How to mitigate
  - `contingency_plans` (jsonb) - Backup plans
  - `cost_of_mitigation_usd` (numeric) - Cost to mitigate
  - `monitoring_frequency` (text) - How often to monitor
  - `early_warning_indicators` (jsonb) - Signs of risk escalation
  - `last_incident_date` (date) - Most recent occurrence
  - `data_sources` (jsonb) - Source references
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `country_credit_ratings`
  Stores sovereign credit ratings from major agencies
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `rating_agency` (text) - S&P, Moody's, Fitch, etc
  - `rating` (text) - Credit rating (AAA, AA+, etc)
  - `outlook` (text) - Positive, stable, negative, developing
  - `rating_date` (date) - Date of rating
  - `previous_rating` (text) - Prior rating
  - `rating_change` (text) - Upgrade/Downgrade/Affirmed
  - `rating_score_numeric` (numeric) - Numeric conversion for comparison
  - `key_factors_positive` (jsonb) - Factors supporting rating
  - `key_factors_negative` (jsonb) - Factors constraining rating
  - `rating_rationale` (text) - Agency's explanation
  - `implications_for_business` (text) - What it means for businesses
  - `next_review_date` (date) - Expected next review
  - `source_url` (text) - Link to rating report
  - `created_at` (timestamptz)

  ### `sanctions_compliance`
  Tracks international sanctions and compliance requirements
  - `id` (uuid, primary key)
  - `country` (text) - Country subject to sanctions
  - `sanctioning_authority` (text) - UN, US, EU, etc
  - `sanction_type` (text) - Comprehensive, sectoral, targeted, arms_embargo
  - `sectors_affected` (text[]) - Which industries impacted
  - `transaction_types_restricted` (text[]) - Prohibited transactions
  - `entities_blacklisted` (jsonb) - Sanctioned companies/individuals
  - `effective_date` (date) - When sanctions started
  - `expiration_date` (date) - If temporary
  - `severity` (text) - Comprehensive/Moderate/Limited
  - `business_impact` (text) - How it affects operations
  - `compliance_requirements` (jsonb) - What businesses must do
  - `penalties_for_violation` (text) - Consequences
  - `exemptions` (text) - Activities that are allowed
  - `due_diligence_steps` (jsonb) - Compliance procedures
  - `official_reference` (text) - Legal reference
  - `source_url` (text) - Official document
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all risk assessment data
  - Public read access for critical risk information
  - Only service role can insert/update data

  ## Indexes
  - Performance indexes on country and date
  - Severity and risk level indexes
  - Full-text search on descriptions
*/

-- Political Risk Index Table
CREATE TABLE IF NOT EXISTS political_risk_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  political_stability_score numeric DEFAULT 50 CHECK (political_stability_score >= 0 AND political_stability_score <= 100),
  corruption_index numeric DEFAULT 50 CHECK (corruption_index >= 0 AND corruption_index <= 100),
  government_effectiveness numeric DEFAULT 50 CHECK (government_effectiveness >= 0 AND government_effectiveness <= 100),
  regulatory_quality numeric DEFAULT 50 CHECK (regulatory_quality >= 0 AND regulatory_quality <= 100),
  rule_of_law_score numeric DEFAULT 50 CHECK (rule_of_law_score >= 0 AND rule_of_law_score <= 100),
  democratic_accountability numeric DEFAULT 50 CHECK (democratic_accountability >= 0 AND democratic_accountability <= 100),
  regime_stability text DEFAULT 'Stable' CHECK (regime_stability IN ('Stable', 'Uncertain', 'Unstable')),
  election_risk text DEFAULT 'Low' CHECK (election_risk IN ('Low', 'Medium', 'High')),
  civil_unrest_risk text DEFAULT 'Low' CHECK (civil_unrest_risk IN ('Low', 'Medium', 'High')),
  policy_continuity_risk text DEFAULT 'Low' CHECK (policy_continuity_risk IN ('Low', 'Medium', 'High')),
  recent_events jsonb DEFAULT '[]'::jsonb,
  risk_summary text,
  mitigation_strategies jsonb DEFAULT '[]'::jsonb,
  data_sources jsonb DEFAULT '[]'::jsonb,
  assessment_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE political_risk_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to political risk data"
  ON political_risk_index FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read political risk data"
  ON political_risk_index FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_political_risk_country_year 
  ON political_risk_index(country, year DESC);
CREATE INDEX IF NOT EXISTS idx_political_risk_stability 
  ON political_risk_index(political_stability_score);
CREATE INDEX IF NOT EXISTS idx_political_risk_date 
  ON political_risk_index(assessment_date DESC);

-- Economic Risk Factors Table
CREATE TABLE IF NOT EXISTS economic_risk_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  currency_volatility_score numeric DEFAULT 50 CHECK (currency_volatility_score >= 0 AND currency_volatility_score <= 100),
  inflation_risk text DEFAULT 'Medium' CHECK (inflation_risk IN ('Low', 'Medium', 'High')),
  debt_to_gdp_ratio numeric DEFAULT 0,
  fiscal_balance numeric DEFAULT 0,
  current_account_balance numeric DEFAULT 0,
  foreign_reserves_months numeric DEFAULT 0,
  banking_sector_health text DEFAULT 'Moderate' CHECK (banking_sector_health IN ('Strong', 'Moderate', 'Weak')),
  sovereign_default_risk text DEFAULT 'Low' CHECK (sovereign_default_risk IN ('Low', 'Medium', 'High')),
  exchange_rate_regime text DEFAULT 'Managed' CHECK (exchange_rate_regime IN ('Fixed', 'Managed', 'Floating')),
  capital_controls text DEFAULT 'Partial' CHECK (capital_controls IN ('None', 'Partial', 'Strict')),
  economic_freedom_score numeric DEFAULT 50 CHECK (economic_freedom_score >= 0 AND economic_freedom_score <= 100),
  ease_of_repatriation text DEFAULT 'Moderate' CHECK (ease_of_repatriation IN ('Easy', 'Moderate', 'Difficult')),
  recession_risk text DEFAULT 'Low' CHECK (recession_risk IN ('Low', 'Medium', 'High')),
  risk_summary text,
  data_sources jsonb DEFAULT '[]'::jsonb,
  assessment_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE economic_risk_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to economic risk data"
  ON economic_risk_factors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read economic risk data"
  ON economic_risk_factors FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_economic_risk_country_year 
  ON economic_risk_factors(country, year DESC);
CREATE INDEX IF NOT EXISTS idx_economic_risk_inflation 
  ON economic_risk_factors(inflation_risk);
CREATE INDEX IF NOT EXISTS idx_economic_risk_date 
  ON economic_risk_factors(assessment_date DESC);

-- Operational Risks Table
CREATE TABLE IF NOT EXISTS operational_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  industry text NOT NULL,
  risk_category text NOT NULL CHECK (risk_category IN ('infrastructure', 'labor', 'supply_chain', 'logistics', 'technology', 'security', 'legal', 'environmental')),
  risk_title text NOT NULL,
  risk_description text NOT NULL,
  severity text DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  likelihood text DEFAULT 'Possible' CHECK (likelihood IN ('Very_Likely', 'Likely', 'Possible', 'Unlikely')),
  impact_on_operations text,
  affected_business_functions text[] DEFAULT ARRAY[]::text[],
  historical_incidents jsonb DEFAULT '[]'::jsonb,
  current_status text,
  mitigation_measures jsonb DEFAULT '[]'::jsonb,
  contingency_plans jsonb DEFAULT '[]'::jsonb,
  cost_of_mitigation_usd numeric DEFAULT 0,
  monitoring_frequency text DEFAULT 'Monthly' CHECK (monitoring_frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually')),
  early_warning_indicators jsonb DEFAULT '[]'::jsonb,
  last_incident_date date,
  data_sources jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operational_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to operational risks"
  ON operational_risks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read operational risks"
  ON operational_risks FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_operational_risks_country_industry 
  ON operational_risks(country, industry);
CREATE INDEX IF NOT EXISTS idx_operational_risks_category 
  ON operational_risks(risk_category);
CREATE INDEX IF NOT EXISTS idx_operational_risks_severity 
  ON operational_risks(severity, likelihood);
CREATE INDEX IF NOT EXISTS idx_operational_risks_updated 
  ON operational_risks(last_updated DESC);

-- Country Credit Ratings Table
CREATE TABLE IF NOT EXISTS country_credit_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  rating_agency text NOT NULL CHECK (rating_agency IN ('S&P', 'Moody''s', 'Fitch', 'DBRS', 'R&I', 'Other')),
  rating text NOT NULL,
  outlook text DEFAULT 'Stable' CHECK (outlook IN ('Positive', 'Stable', 'Negative', 'Developing', 'Under_Review')),
  rating_date date NOT NULL,
  previous_rating text,
  rating_change text DEFAULT 'Affirmed' CHECK (rating_change IN ('Upgrade', 'Downgrade', 'Affirmed', 'New')),
  rating_score_numeric numeric DEFAULT 0,
  key_factors_positive jsonb DEFAULT '[]'::jsonb,
  key_factors_negative jsonb DEFAULT '[]'::jsonb,
  rating_rationale text,
  implications_for_business text,
  next_review_date date,
  source_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE country_credit_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to credit ratings"
  ON country_credit_ratings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read credit ratings"
  ON country_credit_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_credit_ratings_country 
  ON country_credit_ratings(country, rating_date DESC);
CREATE INDEX IF NOT EXISTS idx_credit_ratings_agency 
  ON country_credit_ratings(rating_agency);
CREATE INDEX IF NOT EXISTS idx_credit_ratings_outlook 
  ON country_credit_ratings(outlook);

-- Sanctions Compliance Table
CREATE TABLE IF NOT EXISTS sanctions_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  sanctioning_authority text NOT NULL CHECK (sanctioning_authority IN ('UN', 'US', 'EU', 'UK', 'Other')),
  sanction_type text NOT NULL CHECK (sanction_type IN ('Comprehensive', 'Sectoral', 'Targeted', 'Arms_Embargo', 'Financial', 'Travel_Ban')),
  sectors_affected text[] DEFAULT ARRAY[]::text[],
  transaction_types_restricted text[] DEFAULT ARRAY[]::text[],
  entities_blacklisted jsonb DEFAULT '[]'::jsonb,
  effective_date date NOT NULL,
  expiration_date date,
  severity text DEFAULT 'Moderate' CHECK (severity IN ('Comprehensive', 'Moderate', 'Limited')),
  business_impact text,
  compliance_requirements jsonb DEFAULT '[]'::jsonb,
  penalties_for_violation text,
  exemptions text,
  due_diligence_steps jsonb DEFAULT '[]'::jsonb,
  official_reference text,
  source_url text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sanctions_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sanctions data"
  ON sanctions_compliance FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read sanctions data"
  ON sanctions_compliance FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_sanctions_country 
  ON sanctions_compliance(country);
CREATE INDEX IF NOT EXISTS idx_sanctions_authority 
  ON sanctions_compliance(sanctioning_authority);
CREATE INDEX IF NOT EXISTS idx_sanctions_effective 
  ON sanctions_compliance(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_sanctions_severity 
  ON sanctions_compliance(severity);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_political_risk_search 
  ON political_risk_index USING gin(to_tsvector('english', COALESCE(risk_summary, '')));
CREATE INDEX IF NOT EXISTS idx_operational_risks_search 
  ON operational_risks USING gin(to_tsvector('english', risk_title || ' ' || risk_description));