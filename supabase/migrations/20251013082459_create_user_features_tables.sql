/*
  # Enhanced User Features Tables

  1. New Tables
    - `user_preferences`
      - Stores user settings including theme, display preferences, and notifications
    - `saved_searches`
      - Stores user's saved market searches and filters
    - `bookmarks`
      - Stores bookmarked countries, industries, and reports
    - `market_alerts`
      - Stores user-configured market alerts and notifications
    - `shared_dashboards`
      - Enables dashboard sharing and collaboration

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for shared dashboards with read access

  3. Notes
    - All tables include timestamps for tracking
    - UUID primary keys for scalability
    - Proper foreign key relationships where applicable
*/

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme text DEFAULT 'dark',
  language text DEFAULT 'en',
  default_countries text[] DEFAULT ARRAY[]::text[],
  default_view text DEFAULT 'overview',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT false,
  data_refresh_interval integer DEFAULT 300,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  countries text[] DEFAULT ARRAY[]::text[],
  industries text[] DEFAULT ARRAY[]::text[],
  filters jsonb DEFAULT '{}'::jsonb,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own searches"
  ON saved_searches
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_id text NOT NULL,
  item_data jsonb DEFAULT '{}'::jsonb,
  notes text,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Market Alerts Table
CREATE TABLE IF NOT EXISTS market_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  alert_type text NOT NULL,
  target_country text,
  target_symbol text,
  condition text NOT NULL,
  threshold numeric NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON market_alerts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Shared Dashboards Table
CREATE TABLE IF NOT EXISTS shared_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  share_token text UNIQUE,
  allowed_users uuid[] DEFAULT ARRAY[]::uuid[],
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shared_dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their dashboards"
  ON shared_dashboards
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can view shared dashboards"
  ON shared_dashboards
  FOR SELECT
  TO authenticated
  USING (
    is_public = true 
    OR owner_id = auth.uid() 
    OR auth.uid() = ANY(allowed_users)
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_item_type ON bookmarks(item_type);
CREATE INDEX IF NOT EXISTS idx_market_alerts_user_id ON market_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_market_alerts_active ON market_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shared_dashboards_owner ON shared_dashboards(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_dashboards_public ON shared_dashboards(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_dashboards_token ON shared_dashboards(share_token);