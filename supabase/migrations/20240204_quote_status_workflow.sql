-- ============================================================================
-- Quote Status Workflow Database Schema
-- Required Supabase tables for the quote status workflow system
-- ============================================================================

-- Quote Status History Table
-- Tracks all status changes for quotes
CREATE TABLE IF NOT EXISTS quote_status_history (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_by_name TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comment TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Ensure valid status values
  CONSTRAINT valid_from_status CHECK (
    from_status IN ('draft', 'pending', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted')
  ),
  CONSTRAINT valid_to_status CHECK (
    to_status IN ('draft', 'pending', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted')
  )
);

-- Index for efficient quote history lookups
CREATE INDEX IF NOT EXISTS idx_quote_status_history_quote_id 
  ON quote_status_history(quote_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_quote_status_history_changed_at 
  ON quote_status_history(changed_at DESC);

-- Composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_quote_status_history_quote_changed 
  ON quote_status_history(quote_id, changed_at DESC);

-- ============================================================================

-- Quote Reminders Table
-- Tracks sent expiration reminders to prevent duplicates
CREATE TABLE IF NOT EXISTS quote_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  days_before_expiry INTEGER NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure we only have one reminder per quote per threshold
  CONSTRAINT unique_quote_reminder UNIQUE (quote_id, days_before_expiry),
  
  -- Ensure positive days
  CONSTRAINT positive_days CHECK (days_before_expiry > 0)
);

-- Index for reminder lookups
CREATE INDEX IF NOT EXISTS idx_quote_reminders_quote_id 
  ON quote_reminders(quote_id);

-- Index for finding unsent reminders
CREATE INDEX IF NOT EXISTS idx_quote_reminders_sent_at 
  ON quote_reminders(sent_at);

-- ============================================================================

-- Activities Table
-- General activity log for the application
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  quote_id TEXT REFERENCES quotes(id) ON DELETE SET NULL,
  quote_number TEXT,
  customer_id TEXT,
  customer_name TEXT,
  user_id TEXT,
  user_name TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for activity lookups
CREATE INDEX IF NOT EXISTS idx_activities_quote_id 
  ON activities(quote_id);

-- Index for time-based activity queries
CREATE INDEX IF NOT EXISTS idx_activities_created_at 
  ON activities(created_at DESC);

-- Index for activity type filtering
CREATE INDEX IF NOT EXISTS idx_activities_type 
  ON activities(type);

-- ============================================================================

-- Update existing quotes table (if needed)
-- Add expiration-related fields
ALTER TABLE quotes 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for expiration queries
CREATE INDEX IF NOT EXISTS idx_quotes_expires_at 
  ON quotes(expires_at) 
  WHERE expires_at IS NOT NULL;

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_quotes_status_expires 
  ON quotes(status, expires_at);

-- ============================================================================

-- Row Level Security (RLS) Policies
-- Enable RLS on new tables

ALTER TABLE quote_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view history for quotes in their shop
CREATE POLICY "Users can view quote status history" 
  ON quote_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_status_history.quote_id
      -- Add shop-based filtering here based on your auth setup
    )
  );

-- Policy: System can insert history records
CREATE POLICY "System can insert quote status history"
  ON quote_status_history
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view activities for their shop
CREATE POLICY "Users can view activities"
  ON activities
  FOR SELECT
  USING (true); -- Adjust based on your auth requirements

-- Policy: System can create activities
CREATE POLICY "System can create activities"
  ON activities
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================

-- Functions

-- Function to get quote status summary
CREATE OR REPLACE FUNCTION get_quote_status_summary(quote_id_param TEXT)
RETURNS TABLE (
  total_changes BIGINT,
  first_status TEXT,
  last_status TEXT,
  days_in_current_status INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_changes,
    MIN(from_status) as first_status,
    (SELECT to_status FROM quote_status_history 
     WHERE quote_id = quote_id_param 
     ORDER BY changed_at DESC LIMIT 1) as last_status,
    EXTRACT(DAY FROM NOW() - MAX(changed_at))::INTEGER as days_in_current_status
  FROM quote_status_history
  WHERE quote_id = quote_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old reminders (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_reminders(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM quote_reminders
  WHERE sent_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
