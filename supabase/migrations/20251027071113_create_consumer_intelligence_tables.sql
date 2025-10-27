/*
  # Customer & Consumer Intelligence

  This migration creates comprehensive consumer intelligence tables to help businesses
  understand target demographics, market sizing, consumer trends, and brand perception
  in Southeast Asian markets.

  ## New Tables

  ### `consumer_segments`
  Detailed demographic profiles and consumer behavior segments
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `city` (text) - Specific city if applicable
  - `segment_name` (text) - Segment identifier
  - `segment_description` (text) - Detailed description
  - `segment_size_population` (integer) - Number of people
  - `segment_percentage_of_population` (numeric) - Percentage of total
  - `age_range_min` (integer) - Minimum age
  - `age_range_max` (integer) - Maximum age
  - `median_age` (integer) - Median age
  - `gender_distribution` (jsonb) - Male/female/other percentages
  - `urban_rural_split` (jsonb) - Urban vs rural percentages
  - `education_level_distribution` (jsonb) - Education breakdown
  - `employment_status_distribution` (jsonb) - Employed/unemployed/student
  - `household_income_median_usd_annual` (numeric) - Median household income
  - `household_income_range` (text) - Income range description
  - `disposable_income_usd_annual` (numeric) - Discretionary spending
  - `spending_priorities` (jsonb) - Where they spend money
  - `digital_adoption_level` (text) - High/Medium/Low
  - `smartphone_penetration` (numeric) - Percentage owning smartphones
  - `internet_usage_hours_daily` (numeric) - Daily internet hours
  - `social_media_platforms_used` (text[]) - Platforms they use
  - `shopping_preferences` (jsonb) - Online vs offline, preferences
  - `brand_loyalty_level` (text) - High/Medium/Low
  - `price_sensitivity` (text) - High/Medium/Low
  - `purchase_decision_factors` (jsonb) - What influences purchases
  - `media_consumption` (jsonb) - TV, radio, digital, print
  - `lifestyle_characteristics` (jsonb) - Lifestyle traits
  - `values_and_motivations` (jsonb) - What they value
  - `pain_points` (jsonb) - Consumer challenges
  - `aspirations` (jsonb) - Goals and desires
  - `year` (integer) - Year of data
  - `data_sources` (jsonb) - Source references
  - `created_at` (timestamptz)

  ### `market_size_estimates`
  Total addressable market calculations by industry and segment
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `industry` (text) - Industry sector
  - `sub_sector` (text) - Specific sub-sector
  - `year` (integer) - Year of estimate
  - `tam_usd` (numeric) - Total Addressable Market in USD
  - `sam_usd` (numeric) - Serviceable Available Market in USD
  - `som_usd` (numeric) - Serviceable Obtainable Market in USD
  - `tam_description` (text) - TAM definition and scope
  - `sam_description` (text) - SAM definition and scope
  - `som_description` (text) - SOM definition and scope
  - `market_growth_rate_annual` (numeric) - YoY growth percentage
  - `market_maturity` (text) - Emerging/Growing/Mature/Declining
  - `number_of_customers` (integer) - Total customer count
  - `average_revenue_per_customer` (numeric) - ARPU
  - `market_concentration` (text) - Fragmented/Moderate/Concentrated
  - `top_players_market_share` (numeric) - Top 3 players share
  - `barriers_to_entry` (jsonb) - Entry barriers
  - `market_drivers` (jsonb) - Growth drivers
  - `market_challenges` (jsonb) - Market challenges
  - `forecast_5_year_cagr` (numeric) - 5-year growth forecast
  - `forecast_market_size_5_years_usd` (numeric) - 5-year projection
  - `methodology` (text) - How calculated
  - `assumptions` (jsonb) - Key assumptions
  - `confidence_level` (text) - High/Medium/Low
  - `data_sources` (jsonb) - Source references
  - `created_at` (timestamptz)

  ### `consumer_trends`
  Emerging consumer behavior trends and shifts
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `trend_name` (text) - Brief trend title
  - `trend_category` (text) - Technology, lifestyle, sustainability, health, etc
  - `description` (text) - Detailed description
  - `industries_affected` (text[]) - Which industries impacted
  - `consumer_segments_affected` (text[]) - Which segments
  - `trend_stage` (text) - Emerging/Growing/Mainstream/Declining
  - `adoption_rate_current` (numeric) - Current adoption percentage
  - `adoption_rate_projected_3_years` (numeric) - Projected adoption
  - `growth_velocity` (text) - Rapid/Moderate/Slow
  - `market_impact_level` (text) - Transformative/Significant/Moderate/Minor
  - `business_opportunities` (jsonb) - Opportunities created
  - `business_threats` (jsonb) - Threats to existing businesses
  - `key_drivers` (jsonb) - What's driving the trend
  - `barriers_to_adoption` (jsonb) - What's preventing adoption
  - `successful_examples` (jsonb) - Companies capitalizing on trend
  - `consumer_pain_points_addressed` (jsonb) - Problems it solves
  - `technology_enablers` (text[]) - Technologies enabling trend
  - `regulatory_implications` (text) - Regulatory considerations
  - `sustainability_angle` (text) - Environmental impact
  - `profitability_potential` (text) - High/Medium/Low
  - `longevity_assessment` (text) - Fad/Short-term/Long-term
  - `geographic_spread` (text) - Cities where visible
  - `identification_date` (date) - When trend identified
  - `data_sources` (jsonb) - Source references
  - `created_at` (timestamptz)

  ### `brand_perception`
  Brand awareness and sentiment analysis
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `brand_name` (text) - Brand name
  - `company_name` (text) - Parent company
  - `industry` (text) - Industry sector
  - `survey_date` (date) - When data collected
  - `brand_awareness_percentage` (numeric) - Aided awareness
  - `brand_awareness_unaided_percentage` (numeric) - Unaided awareness
  - `brand_consideration_percentage` (numeric) - Would consider purchasing
  - `brand_preference_percentage` (numeric) - Prefer over competitors
  - `net_promoter_score` (numeric) - NPS score
  - `overall_sentiment` (text) - Positive/Neutral/Negative
  - `positive_sentiment_percentage` (numeric) - Positive mentions
  - `neutral_sentiment_percentage` (numeric) - Neutral mentions
  - `negative_sentiment_percentage` (numeric) - Negative mentions
  - `brand_attributes` (jsonb) - How consumers describe brand
  - `brand_strengths` (jsonb) - Perceived strengths
  - `brand_weaknesses` (jsonb) - Perceived weaknesses
  - `value_for_money_score` (numeric) - Value perception 0-100
  - `quality_perception_score` (numeric) - Quality perception 0-100
  - `innovation_perception_score` (numeric) - Innovation perception 0-100
  - `trustworthiness_score` (numeric) - Trust score 0-100
  - `customer_service_score` (numeric) - Service perception 0-100
  - `environmental_responsibility_score` (numeric) - Sustainability score 0-100
  - `purchase_intent` (numeric) - Likelihood to buy 0-100
  - `competitive_positioning` (jsonb) - Vs competitors
  - `target_demographic` (text) - Who uses the brand
  - `brand_equity_value_estimate_usd` (numeric) - Estimated brand value
  - `sample_size` (integer) - Survey sample size
  - `methodology` (text) - How data collected
  - `data_sources` (jsonb) - Source references
  - `created_at` (timestamptz)

  ### `distribution_channels`
  Available retail and distribution networks
  - `id` (uuid, primary key)
  - `country` (text) - Target country
  - `channel_type` (text) - Retail, online, wholesale, direct, hybrid
  - `channel_name` (text) - Specific channel or platform
  - `channel_description` (text) - Details
  - `market_reach_percentage` (numeric) - Population coverage
  - `number_of_outlets` (integer) - Physical locations
  - `cities_covered` (text[]) - Geographic presence
  - `customer_segments_reached` (text[]) - Target segments
  - `product_categories_carried` (text[]) - What they sell
  - `average_transaction_value_usd` (numeric) - Average sale
  - `annual_revenue_usd` (numeric) - Channel revenue
  - `market_share_in_channel` (numeric) - Share of channel
  - `growth_rate_annual` (numeric) - YoY growth
  - `logistics_capabilities` (jsonb) - Distribution capabilities
  - `technology_integration` (jsonb) - Digital capabilities
  - `partnership_requirements` (text) - How to partner
  - `commission_structure` (text) - Fee structure
  - `minimum_order_quantities` (text) - MOQ requirements
  - `payment_terms` (text) - Payment conditions
  - `advantages` (jsonb) - Channel strengths
  - `disadvantages` (jsonb) - Channel weaknesses
  - `competitive_intensity` (text) - Low/Medium/High
  - `contact_information` (text) - How to reach
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read all consumer intelligence data
  - Public read access for general market data
  - Only service role can insert/update data

  ## Indexes
  - Performance indexes on country and industry
  - Demographic and financial indexes
  - Full-text search on descriptions
*/

-- Consumer Segments Table
CREATE TABLE IF NOT EXISTS consumer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  segment_name text NOT NULL,
  segment_description text NOT NULL,
  segment_size_population integer DEFAULT 0,
  segment_percentage_of_population numeric DEFAULT 0,
  age_range_min integer DEFAULT 0,
  age_range_max integer DEFAULT 0,
  median_age integer DEFAULT 0,
  gender_distribution jsonb DEFAULT '{}'::jsonb,
  urban_rural_split jsonb DEFAULT '{}'::jsonb,
  education_level_distribution jsonb DEFAULT '{}'::jsonb,
  employment_status_distribution jsonb DEFAULT '{}'::jsonb,
  household_income_median_usd_annual numeric DEFAULT 0,
  household_income_range text,
  disposable_income_usd_annual numeric DEFAULT 0,
  spending_priorities jsonb DEFAULT '[]'::jsonb,
  digital_adoption_level text DEFAULT 'Medium' CHECK (digital_adoption_level IN ('High', 'Medium', 'Low')),
  smartphone_penetration numeric DEFAULT 0,
  internet_usage_hours_daily numeric DEFAULT 0,
  social_media_platforms_used text[] DEFAULT ARRAY[]::text[],
  shopping_preferences jsonb DEFAULT '{}'::jsonb,
  brand_loyalty_level text DEFAULT 'Medium' CHECK (brand_loyalty_level IN ('High', 'Medium', 'Low')),
  price_sensitivity text DEFAULT 'Medium' CHECK (price_sensitivity IN ('High', 'Medium', 'Low')),
  purchase_decision_factors jsonb DEFAULT '[]'::jsonb,
  media_consumption jsonb DEFAULT '{}'::jsonb,
  lifestyle_characteristics jsonb DEFAULT '[]'::jsonb,
  values_and_motivations jsonb DEFAULT '[]'::jsonb,
  pain_points jsonb DEFAULT '[]'::jsonb,
  aspirations jsonb DEFAULT '[]'::jsonb,
  year integer NOT NULL,
  data_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consumer_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to consumer segments"
  ON consumer_segments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read consumer segments"
  ON consumer_segments FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_consumer_segments_country_year 
  ON consumer_segments(country, year DESC);
CREATE INDEX IF NOT EXISTS idx_consumer_segments_income 
  ON consumer_segments(household_income_median_usd_annual DESC);
CREATE INDEX IF NOT EXISTS idx_consumer_segments_age 
  ON consumer_segments(median_age);

-- Market Size Estimates Table
CREATE TABLE IF NOT EXISTS market_size_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  industry text NOT NULL,
  sub_sector text,
  year integer NOT NULL,
  tam_usd numeric DEFAULT 0,
  sam_usd numeric DEFAULT 0,
  som_usd numeric DEFAULT 0,
  tam_description text,
  sam_description text,
  som_description text,
  market_growth_rate_annual numeric DEFAULT 0,
  market_maturity text DEFAULT 'Growing' CHECK (market_maturity IN ('Emerging', 'Growing', 'Mature', 'Declining')),
  number_of_customers integer DEFAULT 0,
  average_revenue_per_customer numeric DEFAULT 0,
  market_concentration text DEFAULT 'Moderate' CHECK (market_concentration IN ('Fragmented', 'Moderate', 'Concentrated')),
  top_players_market_share numeric DEFAULT 0,
  barriers_to_entry jsonb DEFAULT '[]'::jsonb,
  market_drivers jsonb DEFAULT '[]'::jsonb,
  market_challenges jsonb DEFAULT '[]'::jsonb,
  forecast_5_year_cagr numeric DEFAULT 0,
  forecast_market_size_5_years_usd numeric DEFAULT 0,
  methodology text,
  assumptions jsonb DEFAULT '[]'::jsonb,
  confidence_level text DEFAULT 'Medium' CHECK (confidence_level IN ('High', 'Medium', 'Low')),
  data_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_size_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to market size estimates"
  ON market_size_estimates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read market size estimates"
  ON market_size_estimates FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_market_size_country_industry 
  ON market_size_estimates(country, industry, year DESC);
CREATE INDEX IF NOT EXISTS idx_market_size_tam 
  ON market_size_estimates(tam_usd DESC);
CREATE INDEX IF NOT EXISTS idx_market_size_growth 
  ON market_size_estimates(market_growth_rate_annual DESC);

-- Consumer Trends Table
CREATE TABLE IF NOT EXISTS consumer_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  trend_name text NOT NULL,
  trend_category text NOT NULL CHECK (trend_category IN ('Technology', 'Lifestyle', 'Sustainability', 'Health', 'Social', 'Economic', 'Cultural')),
  description text NOT NULL,
  industries_affected text[] DEFAULT ARRAY[]::text[],
  consumer_segments_affected text[] DEFAULT ARRAY[]::text[],
  trend_stage text DEFAULT 'Growing' CHECK (trend_stage IN ('Emerging', 'Growing', 'Mainstream', 'Declining')),
  adoption_rate_current numeric DEFAULT 0,
  adoption_rate_projected_3_years numeric DEFAULT 0,
  growth_velocity text DEFAULT 'Moderate' CHECK (growth_velocity IN ('Rapid', 'Moderate', 'Slow')),
  market_impact_level text DEFAULT 'Moderate' CHECK (market_impact_level IN ('Transformative', 'Significant', 'Moderate', 'Minor')),
  business_opportunities jsonb DEFAULT '[]'::jsonb,
  business_threats jsonb DEFAULT '[]'::jsonb,
  key_drivers jsonb DEFAULT '[]'::jsonb,
  barriers_to_adoption jsonb DEFAULT '[]'::jsonb,
  successful_examples jsonb DEFAULT '[]'::jsonb,
  consumer_pain_points_addressed jsonb DEFAULT '[]'::jsonb,
  technology_enablers text[] DEFAULT ARRAY[]::text[],
  regulatory_implications text,
  sustainability_angle text,
  profitability_potential text DEFAULT 'Medium' CHECK (profitability_potential IN ('High', 'Medium', 'Low')),
  longevity_assessment text DEFAULT 'Long-term' CHECK (longevity_assessment IN ('Fad', 'Short-term', 'Long-term')),
  geographic_spread text,
  identification_date date NOT NULL,
  data_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consumer_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to consumer trends"
  ON consumer_trends FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read consumer trends"
  ON consumer_trends FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_consumer_trends_country_category 
  ON consumer_trends(country, trend_category);
CREATE INDEX IF NOT EXISTS idx_consumer_trends_stage 
  ON consumer_trends(trend_stage);
CREATE INDEX IF NOT EXISTS idx_consumer_trends_impact 
  ON consumer_trends(market_impact_level);
CREATE INDEX IF NOT EXISTS idx_consumer_trends_date 
  ON consumer_trends(identification_date DESC);

-- Brand Perception Table
CREATE TABLE IF NOT EXISTS brand_perception (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  brand_name text NOT NULL,
  company_name text NOT NULL,
  industry text NOT NULL,
  survey_date date NOT NULL,
  brand_awareness_percentage numeric DEFAULT 0,
  brand_awareness_unaided_percentage numeric DEFAULT 0,
  brand_consideration_percentage numeric DEFAULT 0,
  brand_preference_percentage numeric DEFAULT 0,
  net_promoter_score numeric DEFAULT 0,
  overall_sentiment text DEFAULT 'Neutral' CHECK (overall_sentiment IN ('Positive', 'Neutral', 'Negative', 'Mixed')),
  positive_sentiment_percentage numeric DEFAULT 0,
  neutral_sentiment_percentage numeric DEFAULT 0,
  negative_sentiment_percentage numeric DEFAULT 0,
  brand_attributes jsonb DEFAULT '[]'::jsonb,
  brand_strengths jsonb DEFAULT '[]'::jsonb,
  brand_weaknesses jsonb DEFAULT '[]'::jsonb,
  value_for_money_score numeric DEFAULT 50 CHECK (value_for_money_score >= 0 AND value_for_money_score <= 100),
  quality_perception_score numeric DEFAULT 50 CHECK (quality_perception_score >= 0 AND quality_perception_score <= 100),
  innovation_perception_score numeric DEFAULT 50 CHECK (innovation_perception_score >= 0 AND innovation_perception_score <= 100),
  trustworthiness_score numeric DEFAULT 50 CHECK (trustworthiness_score >= 0 AND trustworthiness_score <= 100),
  customer_service_score numeric DEFAULT 50 CHECK (customer_service_score >= 0 AND customer_service_score <= 100),
  environmental_responsibility_score numeric DEFAULT 50 CHECK (environmental_responsibility_score >= 0 AND environmental_responsibility_score <= 100),
  purchase_intent numeric DEFAULT 50 CHECK (purchase_intent >= 0 AND purchase_intent <= 100),
  competitive_positioning jsonb DEFAULT '{}'::jsonb,
  target_demographic text,
  brand_equity_value_estimate_usd numeric DEFAULT 0,
  sample_size integer DEFAULT 0,
  methodology text,
  data_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brand_perception ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to brand perception"
  ON brand_perception FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read brand perception"
  ON brand_perception FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_brand_perception_country_brand 
  ON brand_perception(country, brand_name);
CREATE INDEX IF NOT EXISTS idx_brand_perception_industry 
  ON brand_perception(industry);
CREATE INDEX IF NOT EXISTS idx_brand_perception_nps 
  ON brand_perception(net_promoter_score DESC);
CREATE INDEX IF NOT EXISTS idx_brand_perception_date 
  ON brand_perception(survey_date DESC);

-- Distribution Channels Table
CREATE TABLE IF NOT EXISTS distribution_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  channel_type text NOT NULL CHECK (channel_type IN ('Retail', 'Online', 'Wholesale', 'Direct', 'Hybrid', 'Marketplace')),
  channel_name text NOT NULL,
  channel_description text NOT NULL,
  market_reach_percentage numeric DEFAULT 0,
  number_of_outlets integer DEFAULT 0,
  cities_covered text[] DEFAULT ARRAY[]::text[],
  customer_segments_reached text[] DEFAULT ARRAY[]::text[],
  product_categories_carried text[] DEFAULT ARRAY[]::text[],
  average_transaction_value_usd numeric DEFAULT 0,
  annual_revenue_usd numeric DEFAULT 0,
  market_share_in_channel numeric DEFAULT 0,
  growth_rate_annual numeric DEFAULT 0,
  logistics_capabilities jsonb DEFAULT '{}'::jsonb,
  technology_integration jsonb DEFAULT '{}'::jsonb,
  partnership_requirements text,
  commission_structure text,
  minimum_order_quantities text,
  payment_terms text,
  advantages jsonb DEFAULT '[]'::jsonb,
  disadvantages jsonb DEFAULT '[]'::jsonb,
  competitive_intensity text DEFAULT 'Medium' CHECK (competitive_intensity IN ('Low', 'Medium', 'High')),
  contact_information text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE distribution_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to distribution channels"
  ON distribution_channels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to read distribution channels"
  ON distribution_channels FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_distribution_country_type 
  ON distribution_channels(country, channel_type);
CREATE INDEX IF NOT EXISTS idx_distribution_reach 
  ON distribution_channels(market_reach_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_revenue 
  ON distribution_channels(annual_revenue_usd DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_consumer_segments_search 
  ON consumer_segments USING gin(to_tsvector('english', segment_name || ' ' || segment_description));
CREATE INDEX IF NOT EXISTS idx_consumer_trends_search 
  ON consumer_trends USING gin(to_tsvector('english', trend_name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_brand_perception_search 
  ON brand_perception USING gin(to_tsvector('english', brand_name || ' ' || company_name));