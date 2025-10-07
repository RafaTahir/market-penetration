/*
  # Market Data Caching Schema
  
  Creates tables for caching live market data from Finnhub API to minimize API calls
  and provide fallback data when API limits are reached.

  ## New Tables
  
  ### `market_stocks`
  Stores real-time stock market data for Southeast Asian exchanges
  - `id` (uuid, primary key)
  - `symbol` (text) - Stock symbol (e.g., 'SET.BK')
  - `name` (text) - Full name of the index
  - `exchange` (text) - Exchange identifier
  - `country` (text) - Country name
  - `price` (numeric) - Current price
  - `change` (numeric) - Price change
  - `change_percent` (numeric) - Percentage change
  - `volume` (bigint) - Trading volume
  - `market_cap` (numeric) - Market capitalization
  - `timestamp` (timestamptz) - When data was fetched
  - `created_at` (timestamptz) - Record creation time
  
  ### `market_hours`
  Stores trading hours configuration for each exchange
  - `id` (uuid, primary key)
  - `exchange` (text) - Exchange identifier
  - `country` (text) - Country name
  - `timezone` (text) - Timezone identifier
  - `open_time` (time) - Market open time (local)
  - `close_time` (time) - Market close time (local)
  - `is_weekend_trading` (boolean) - Whether market trades on weekends
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `currency_rates`
  Stores currency exchange rates
  - `id` (uuid, primary key)
  - `pair` (text) - Currency pair (e.g., 'USD/THB')
  - `rate` (numeric) - Exchange rate
  - `change` (numeric) - Rate change
  - `change_percent` (numeric) - Percentage change
  - `timestamp` (timestamptz) - When data was fetched
  - `created_at` (timestamptz)
  
  ### `economic_indicators`
  Stores economic indicator data
  - `id` (uuid, primary key)
  - `country` (text) - Country name
  - `gdp` (numeric) - GDP in billions
  - `inflation` (numeric) - Inflation rate
  - `unemployment` (numeric) - Unemployment rate
  - `interest_rate` (numeric) - Interest rate
  - `exchange_rate` (numeric) - USD exchange rate
  - `timestamp` (timestamptz) - When data was fetched
  - `created_at` (timestamptz)

  ## Security
  
  - Enable RLS on all tables
  - Allow public read access (data is public market information)
  - Restrict write access to service role only
  
  ## Indexes
  
  - Index on symbol and timestamp for fast stock queries
  - Index on country for economic indicators
  - Index on pair and timestamp for currency rates
*/

-- Create market_stocks table
CREATE TABLE IF NOT EXISTS market_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  exchange text NOT NULL,
  country text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  change numeric NOT NULL DEFAULT 0,
  change_percent numeric NOT NULL DEFAULT 0,
  volume bigint NOT NULL DEFAULT 0,
  market_cap numeric DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on symbol and timestamp for fast queries
CREATE INDEX IF NOT EXISTS idx_market_stocks_symbol_timestamp 
  ON market_stocks(symbol, timestamp DESC);

-- Create index on country
CREATE INDEX IF NOT EXISTS idx_market_stocks_country 
  ON market_stocks(country);

-- Enable RLS
ALTER TABLE market_stocks ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for market stocks"
  ON market_stocks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create market_hours table
CREATE TABLE IF NOT EXISTS market_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange text UNIQUE NOT NULL,
  country text NOT NULL,
  timezone text NOT NULL,
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_weekend_trading boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE market_hours ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for market hours"
  ON market_hours
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert market hours data for Southeast Asian exchanges
INSERT INTO market_hours (exchange, country, timezone, open_time, close_time, is_weekend_trading) 
VALUES 
  ('SET', 'Thailand', 'Asia/Bangkok', '10:00:00', '16:30:00', false),
  ('SGX', 'Singapore', 'Asia/Singapore', '09:00:00', '17:00:00', false),
  ('MYX', 'Malaysia', 'Asia/Kuala_Lumpur', '09:00:00', '17:00:00', false),
  ('IDX', 'Indonesia', 'Asia/Jakarta', '09:00:00', '16:15:00', false),
  ('PSE', 'Philippines', 'Asia/Manila', '09:30:00', '15:30:00', false),
  ('HOSE', 'Vietnam', 'Asia/Ho_Chi_Minh', '09:00:00', '15:00:00', false)
ON CONFLICT (exchange) DO NOTHING;

-- Create currency_rates table
CREATE TABLE IF NOT EXISTS currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL,
  rate numeric NOT NULL DEFAULT 0,
  change numeric NOT NULL DEFAULT 0,
  change_percent numeric NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on pair and timestamp
CREATE INDEX IF NOT EXISTS idx_currency_rates_pair_timestamp 
  ON currency_rates(pair, timestamp DESC);

-- Enable RLS
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for currency rates"
  ON currency_rates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create economic_indicators table
CREATE TABLE IF NOT EXISTS economic_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  gdp numeric NOT NULL DEFAULT 0,
  inflation numeric NOT NULL DEFAULT 0,
  unemployment numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 0,
  exchange_rate numeric NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on country and timestamp
CREATE INDEX IF NOT EXISTS idx_economic_indicators_country_timestamp 
  ON economic_indicators(country, timestamp DESC);

-- Enable RLS
ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for economic indicators"
  ON economic_indicators
  FOR SELECT
  TO anon, authenticated
  USING (true);