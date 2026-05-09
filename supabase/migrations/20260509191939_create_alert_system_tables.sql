/*
  # Create Alert System Tables

  1. New Tables
    - `alert_rules` - User-defined alert conditions and thresholds
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Alert rule name
      - `description` (text) - Human readable description
      - `rule_type` (enum) - price_threshold, competitor_activity, regulatory_change, labor_market
      - `conditions` (jsonb) - Flexible conditions object
      - `priority` (enum) - critical, high, medium, low
      - `is_active` (boolean)
      - `notification_channels` (text array) - in_app, email, slack_webhook
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `alerts_triggered` - History of triggered alerts
      - `id` (uuid, primary key)
      - `rule_id` (uuid, foreign key to alert_rules)
      - `user_id` (uuid, foreign key to auth.users)
      - `alert_data` (jsonb) - Context/details of what triggered
      - `message` (text) - Alert message
      - `priority` (enum) - critical, high, medium, low
      - `is_read` (boolean)
      - `is_actioned` (boolean)
      - `triggered_at` (timestamp)
    
    - `alert_templates` - Pre-built alert templates
      - `id` (uuid, primary key)
      - `name` (text) - Template name
      - `description` (text)
      - `rule_type` (enum)
      - `default_conditions` (jsonb)
      - `icon` (text) - Lucide icon name
      - `color` (text) - Tailwind color class
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own rules and alerts
    - Alert templates are readable by all authenticated users

  3. Indexes
    - Index on user_id + is_active for efficient rule lookups
    - Index on triggered_at for recent alerts
    - Index on is_read for unread alerts count
*/

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL CHECK (rule_type IN ('price_threshold', 'competitor_activity', 'regulatory_change', 'labor_market', 'market_entry')),
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  is_active boolean DEFAULT true,
  notification_channels text[] DEFAULT ARRAY['in_app']::text[],
  last_checked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alerts Triggered Table
CREATE TABLE IF NOT EXISTS alerts_triggered (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  message text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  is_read boolean DEFAULT false,
  is_actioned boolean DEFAULT false,
  action_taken text,
  triggered_at timestamptz DEFAULT now(),
  dismissed_at timestamptz
);

-- Alert Templates Table
CREATE TABLE IF NOT EXISTS alert_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  rule_type text NOT NULL CHECK (rule_type IN ('price_threshold', 'competitor_activity', 'regulatory_change', 'labor_market', 'market_entry')),
  default_conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon text,
  color text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_triggered ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert_rules
CREATE POLICY "Users can view own alert rules"
  ON alert_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create alert rules"
  ON alert_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert rules"
  ON alert_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert rules"
  ON alert_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for alerts_triggered
CREATE POLICY "Users can view own triggered alerts"
  ON alerts_triggered FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own triggered alerts"
  ON alerts_triggered FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for alert_templates (public read for authenticated users)
CREATE POLICY "Authenticated users can view alert templates"
  ON alert_templates FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_active ON alert_rules(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_user_read ON alerts_triggered(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_timestamp ON alerts_triggered(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_rules_rule_type ON alert_rules(rule_type);