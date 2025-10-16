/*
  # Add Collaboration Features

  1. New Tables
    - `comments`
      - Real-time comments and annotations on markets, reports, etc.
      - User identification and timestamps
    - `user_activity`
      - Track user activity and presence
      - Session management
    - `scheduled_exports`
      - Background job scheduling for exports
      - Configurable intervals and formats

  2. Security
    - Enable RLS on all tables
    - Comments visible to authenticated users
    - Users can only edit/delete their own comments
    - Activity tracking for analytics

  3. Indexes
    - Performance indexes for common queries
    - Full-text search on comments
*/

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  content text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  parent_id uuid,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- User Activity Table
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON user_activity
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can log activity"
  ON user_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Scheduled Exports Table
CREATE TABLE IF NOT EXISTS scheduled_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  export_type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_cron text NOT NULL,
  is_active boolean DEFAULT true,
  last_run timestamptz,
  next_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exports"
  ON scheduled_exports
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_exports_user ON scheduled_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_exports_active ON scheduled_exports(is_active) WHERE is_active = true;

-- Full-text search on comments
CREATE INDEX IF NOT EXISTS idx_comments_content_fts ON comments USING gin(to_tsvector('english', content));