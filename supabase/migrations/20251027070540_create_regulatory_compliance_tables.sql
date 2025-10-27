/*
  # Regulatory & Compliance Intelligence

  This migration creates comprehensive regulatory and compliance tables to help businesses
  navigate legal requirements, tax incentives, and policy frameworks in Southeast Asian markets.

  ## New Tables

  ### `regulatory_requirements`
  Documents all licenses, permits, and legal requirements by industry and country
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `industry` (text) - Industry sector
  - `requirement_type` (text) - License, permit, registration, certification, approval
  - `requirement_name` (text) - Official name of requirement
  - `description` (text) - What it requires
  - `issuing_authority` (text) - Government body responsible
  - `mandatory` (boolean) - Required or optional
  - `application_process` (text) - How to apply
  - `required_documents` (jsonb) - List of documents needed
  - `processing_time_days` (integer) - Typical processing time
  - `validity_period_months` (integer) - How long it's valid
  - `renewal_required` (boolean) - Must be renewed
  - `cost_local_currency` (numeric) - Application cost
  - `cost_usd` (numeric) - Cost in USD
  - `prerequisites` (jsonb) - Requirements before applying
  - `penalties_for_non_compliance` (text) - Consequences
  - `exemptions` (text) - Who is exempt
  - `official_website` (text) - Where to apply
  - `contact_information` (text) - Who to contact
  - `last_updated` (timestamptz) - Last verification
  - `created_at` (timestamptz)

  ### `tax_incentives`
  Documents tax breaks, subsidies, and government incentives
  - `id` (uuid, primary key)
  - `country` (text) - Country offering incentive
  - `incentive_name` (text) - Official program name
  - `incentive_type` (text) - Tax holiday, reduced rate, grant, subsidy, rebate
  - `eligible_industries` (text[]) - Which industries qualify
  - `eligible_activities` (text[]) - Qualifying activities
  - `description` (text) - Program details
  - `benefit_description` (text) - What you get
  - `percentage_reduction` (numeric) - Tax reduction percentage
  - `maximum_benefit_usd` (numeric) - Maximum benefit amount
  - `duration_years` (integer) - How long it lasts
  - `location_restrictions` (text[]) - Geographic requirements
  - `minimum_investment_usd` (numeric) - Minimum investment needed
  - `minimum_employees` (integer) - Minimum hiring requirement
  - `application_deadline` (date) - Program deadline if applicable
  - `application_process` (text) - How to apply
  - `approval_authority` (text) - Who approves
  - `success_rate` (numeric) - Percentage approved
  - `examples` (jsonb) - Companies that received it
  - `official_website` (text) - Program website
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `compliance_timeline`
  Shows typical timelines for regulatory approvals and compliance processes
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `industry` (text) - Industry sector
  - `process_name` (text) - Name of process
  - `process_type` (text) - business_registration, license_application, tax_registration, etc
  - `description` (text) - Process details
  - `total_duration_days` (integer) - Total time needed
  - `steps` (jsonb) - Array of steps with durations
  - `parallel_possible` (boolean) - Can steps run in parallel
  - `fast_track_available` (boolean) - Expedited option exists
  - `fast_track_cost_usd` (numeric) - Cost to expedite
  - `fast_track_duration_days` (integer) - Expedited timeline
  - `dependencies` (text[]) - Other processes that must complete first
  - `common_delays` (jsonb) - Typical delay causes
  - `tips_for_speed` (jsonb) - How to accelerate
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### `policy_changes`
  Tracks regulatory updates and policy changes affecting business
  - `id` (uuid, primary key)
  - `country` (text) - Country where change occurred
  - `change_type` (text) - new_law, amendment, policy_update, regulation, guideline
  - `title` (text) - Brief title
  - `description` (text) - What changed
  - `industries_affected` (text[]) - Which industries impacted
  - `impact_level` (text) - High/Medium/Low business impact
  - `impact_description` (text) - How it affects business
  - `effective_date` (date) - When it takes effect
  - `announcement_date` (date) - When announced
  - `transition_period_days` (integer) - Time to comply
  - `compliance_actions_required` (jsonb) - What businesses must do
  - `penalties` (text) - Consequences of non-compliance
  - `opportunities` (text) - Business opportunities created
  - `official_reference` (text) - Law/policy number
  - `official_document_url` (text) - Link to official text
  - `analysis` (text) - Expert interpretation
  - `data_sources` (jsonb) - Source references
  - `created_at` (timestamptz)

  ### `government_contacts`
  Directory of relevant government agencies and officials
  - `id` (uuid, primary key)
  - `country` (text) - Country
  - `agency_name` (text) - Official agency name
  - `agency_type` (text) - Ministry, department, bureau, regulatory_body, etc
  - `areas_of_responsibility` (text[]) - What they oversee
  - `relevant_industries` (text[]) - Industries they regulate
  - `services_provided` (text[]) - Services they offer
  - `address` (text) - Physical address
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `website` (text) - Official website
  - `online_portal` (text) - Application portal if available
  - `business_hours` (text) - Operating hours
  - `key_officials` (jsonb) - Names and titles of key people
  - `application_submission_methods` (text[]) - How to submit applications
  - `average_response_time_days` (integer) - Typical response time
  - `notes` (text) - Additional helpful information
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all regulatory data
  - Public read access for critical compliance information
  - Only service role can insert/update data

  ## Indexes
  - Performance indexes on country and industry
  - Date indexes for effective dates and updates
  - Full-text search on descriptions
*/

-- Regulatory Requirements Table
CREATE TABLE IF NOT EXISTS regulatory_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  requirement_type text NOT NULL CHECK (requirement_type IN ('license', 'permit', 'registration', 'certification', 'approval', 'authorization')),
  requirement_name text NOT NULL,
  description text NOT NULL,
  issuing_authority text NOT NULL,
  mandatory boolean DEFAULT true,
  application_process text,
  required_documents jsonb DEFAULT '[]'::jsonb,
  processing_time_days integer DEFAULT 0,
  validity_period_months integer,
  renewal_required boolean DEFAULT false,
  cost_local_currency numeric DEFAULT 0,
  cost_usd numeric DEFAULT 0,
  prerequisites jsonb DEFAULT '[]'::jsonb,
  penalties_for_non_compliance text,
  exemptions text,
  official_website text,
  contact_information text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE regulatory_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to regulatory requirements"
  ON regulatory_requirements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read regulatory requirements"
  ON regulatory_requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_regulatory_country_industry 
  ON regulatory_requirements(country, industry);
CREATE INDEX IF NOT EXISTS idx_regulatory_type 
  ON regulatory_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_regulatory_mandatory 
  ON regulatory_requirements(mandatory) WHERE mandatory = true;
CREATE INDEX IF NOT EXISTS idx_regulatory_updated 
  ON regulatory_requirements(last_updated DESC);

-- Tax Incentives Table
CREATE TABLE IF NOT EXISTS tax_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  incentive_name text NOT NULL,
  incentive_type text NOT NULL CHECK (incentive_type IN ('tax_holiday', 'reduced_rate', 'grant', 'subsidy', 'rebate', 'credit', 'exemption')),
  eligible_industries text[] DEFAULT ARRAY[]::text[],
  eligible_activities text[] DEFAULT ARRAY[]::text[],
  description text NOT NULL,
  benefit_description text NOT NULL,
  percentage_reduction numeric DEFAULT 0,
  maximum_benefit_usd numeric DEFAULT 0,
  duration_years integer DEFAULT 0,
  location_restrictions text[] DEFAULT ARRAY[]::text[],
  minimum_investment_usd numeric DEFAULT 0,
  minimum_employees integer DEFAULT 0,
  application_deadline date,
  application_process text,
  approval_authority text,
  success_rate numeric DEFAULT 50,
  examples jsonb DEFAULT '[]'::jsonb,
  official_website text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tax_incentives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tax incentives"
  ON tax_incentives FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read tax incentives"
  ON tax_incentives FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_incentives_country 
  ON tax_incentives(country);
CREATE INDEX IF NOT EXISTS idx_incentives_type 
  ON tax_incentives(incentive_type);
CREATE INDEX IF NOT EXISTS idx_incentives_deadline 
  ON tax_incentives(application_deadline) WHERE application_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incentives_investment 
  ON tax_incentives(minimum_investment_usd);

-- Compliance Timeline Table
CREATE TABLE IF NOT EXISTS compliance_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  process_name text NOT NULL,
  process_type text NOT NULL CHECK (process_type IN ('business_registration', 'license_application', 'tax_registration', 'work_permit', 'import_permit', 'environmental_approval', 'other')),
  description text NOT NULL,
  total_duration_days integer NOT NULL DEFAULT 0,
  steps jsonb DEFAULT '[]'::jsonb,
  parallel_possible boolean DEFAULT false,
  fast_track_available boolean DEFAULT false,
  fast_track_cost_usd numeric DEFAULT 0,
  fast_track_duration_days integer DEFAULT 0,
  dependencies text[] DEFAULT ARRAY[]::text[],
  common_delays jsonb DEFAULT '[]'::jsonb,
  tips_for_speed jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to compliance timeline"
  ON compliance_timeline FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read compliance timeline"
  ON compliance_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_timeline_country_industry 
  ON compliance_timeline(country, industry);
CREATE INDEX IF NOT EXISTS idx_timeline_type 
  ON compliance_timeline(process_type);
CREATE INDEX IF NOT EXISTS idx_timeline_duration 
  ON compliance_timeline(total_duration_days);
CREATE INDEX IF NOT EXISTS idx_timeline_fast_track 
  ON compliance_timeline(fast_track_available) WHERE fast_track_available = true;

-- Policy Changes Table
CREATE TABLE IF NOT EXISTS policy_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  change_type text NOT NULL CHECK (change_type IN ('new_law', 'amendment', 'policy_update', 'regulation', 'guideline', 'directive')),
  title text NOT NULL,
  description text NOT NULL,
  industries_affected text[] DEFAULT ARRAY[]::text[],
  impact_level text DEFAULT 'Medium' CHECK (impact_level IN ('High', 'Medium', 'Low')),
  impact_description text,
  effective_date date NOT NULL,
  announcement_date date NOT NULL,
  transition_period_days integer DEFAULT 0,
  compliance_actions_required jsonb DEFAULT '[]'::jsonb,
  penalties text,
  opportunities text,
  official_reference text,
  official_document_url text,
  analysis text,
  data_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE policy_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to policy changes"
  ON policy_changes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read policy changes"
  ON policy_changes FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_policy_country 
  ON policy_changes(country);
CREATE INDEX IF NOT EXISTS idx_policy_effective_date 
  ON policy_changes(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_policy_impact 
  ON policy_changes(impact_level);
CREATE INDEX IF NOT EXISTS idx_policy_type 
  ON policy_changes(change_type);

-- Government Contacts Table
CREATE TABLE IF NOT EXISTS government_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  agency_name text NOT NULL,
  agency_type text NOT NULL CHECK (agency_type IN ('ministry', 'department', 'bureau', 'regulatory_body', 'commission', 'authority', 'council')),
  areas_of_responsibility text[] DEFAULT ARRAY[]::text[],
  relevant_industries text[] DEFAULT ARRAY[]::text[],
  services_provided text[] DEFAULT ARRAY[]::text[],
  address text,
  phone text,
  email text,
  website text,
  online_portal text,
  business_hours text,
  key_officials jsonb DEFAULT '[]'::jsonb,
  application_submission_methods text[] DEFAULT ARRAY[]::text[],
  average_response_time_days integer DEFAULT 0,
  notes text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE government_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to government contacts"
  ON government_contacts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read government contacts"
  ON government_contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_gov_contacts_country 
  ON government_contacts(country);
CREATE INDEX IF NOT EXISTS idx_gov_contacts_type 
  ON government_contacts(agency_type);
CREATE INDEX IF NOT EXISTS idx_gov_contacts_updated 
  ON government_contacts(last_updated DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_regulatory_search 
  ON regulatory_requirements USING gin(to_tsvector('english', requirement_name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_incentives_search 
  ON tax_incentives USING gin(to_tsvector('english', incentive_name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_policy_search 
  ON policy_changes USING gin(to_tsvector('english', title || ' ' || description));