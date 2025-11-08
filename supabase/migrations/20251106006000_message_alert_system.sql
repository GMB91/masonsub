-- Mason Vector - Real-Time Message Alert System
-- Migration: 20251106006000_message_alert_system.sql
-- Creates message_alerts table, triggers, and RLS policies for real-time notifications

BEGIN;

-- ================================
-- 1. MESSAGE ALERTS TABLE
-- ================================

CREATE TABLE IF NOT EXISTS message_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  alert_type VARCHAR(50) DEFAULT 'message' CHECK (alert_type IN ('message', 'urgent', 'system', 'reminder')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Ensure no duplicate alerts for same message/user
  UNIQUE(user_id, message_id)
);

-- Indexes for performance
CREATE INDEX idx_message_alerts_user_unread ON message_alerts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_message_alerts_created_at ON message_alerts(created_at DESC);
CREATE INDEX idx_message_alerts_message_id ON message_alerts(message_id);

-- ================================
-- 2. MESSAGE ALERT TRIGGER FUNCTION
-- ================================

CREATE OR REPLACE FUNCTION create_message_alert()
RETURNS TRIGGER AS $$
DECLARE
  recipient_user_id UUID;
BEGIN
  -- Get the recipient user ID from the message
  -- Assuming messages table has recipient_id field
  recipient_user_id := NEW.recipient_id;
  
  -- Only create alert if recipient is different from sender
  IF recipient_user_id != NEW.sender_id THEN
    -- Insert alert record (ON CONFLICT DO NOTHING handles duplicates)
    INSERT INTO message_alerts (user_id, message_id, alert_type)
    VALUES (
      recipient_user_id, 
      NEW.id,
      CASE 
        WHEN NEW.priority = 'urgent' THEN 'urgent'
        WHEN NEW.sender_id IN (
          SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        ) THEN 'system'
        ELSE 'message'
      END
    )
    ON CONFLICT (user_id, message_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 3. TRIGGER SETUP
-- ================================

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS message_alert_trigger ON messages;

CREATE TRIGGER message_alert_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_alert();

-- ================================
-- 4. BULK ALERT CLEANUP FUNCTION
-- ================================

CREATE OR REPLACE FUNCTION cleanup_old_message_alerts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete read alerts older than 30 days
  DELETE FROM message_alerts 
  WHERE is_read = TRUE 
    AND read_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup action
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    NULL, -- System action
    'CLEANUP_MESSAGE_ALERTS',
    'message_alerts',
    NULL,
    json_build_object(
      'deleted_count', deleted_count,
      'cleanup_date', NOW()
    ),
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 5. ALERT MANAGEMENT FUNCTIONS
-- ================================

-- Mark alert as read
CREATE OR REPLACE FUNCTION mark_alert_read(alert_message_id UUID, alert_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE message_alerts 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE message_id = alert_message_id 
    AND user_id = alert_user_id
    AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all user alerts as read
CREATE OR REPLACE FUNCTION mark_all_alerts_read(alert_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE message_alerts 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE user_id = alert_user_id
    AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log bulk read action
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  ) VALUES (
    alert_user_id,
    'MARK_ALL_ALERTS_READ',
    'message_alerts',
    NULL,
    json_build_object('marked_read_count', updated_count),
    NOW()
  );
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread alert count for user
CREATE OR REPLACE FUNCTION get_unread_alert_count(alert_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM message_alerts 
    WHERE user_id = alert_user_id 
      AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on message_alerts
ALTER TABLE message_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own alerts
CREATE POLICY message_alerts_user_policy ON message_alerts
  FOR ALL 
  USING (user_id = auth.uid());

-- Policy: System functions can access all alerts
CREATE POLICY message_alerts_system_policy ON message_alerts
  FOR ALL 
  TO service_role
  USING (true);

-- ================================
-- 7. REALTIME PUBLICATION
-- ================================

-- Enable realtime for message_alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE message_alerts;

-- ================================
-- 8. ALERT ESCALATION SYSTEM
-- ================================

-- Function to detect alert spam/loops for Sentinel monitoring
CREATE OR REPLACE FUNCTION detect_alert_anomalies()
RETURNS TABLE(
  user_id UUID,
  alert_count BIGINT,
  time_window TEXT,
  anomaly_type TEXT
) AS $$
BEGIN
  -- Return users with unusual alert volumes
  RETURN QUERY
  WITH alert_stats AS (
    SELECT 
      ma.user_id,
      COUNT(*) as recent_alerts,
      COUNT(*) FILTER (WHERE ma.created_at > NOW() - INTERVAL '1 hour') as hourly_alerts,
      COUNT(*) FILTER (WHERE ma.created_at > NOW() - INTERVAL '1 day') as daily_alerts
    FROM message_alerts ma
    WHERE ma.created_at > NOW() - INTERVAL '1 day'
    GROUP BY ma.user_id
  )
  SELECT 
    ast.user_id,
    ast.hourly_alerts,
    '1 hour',
    'HIGH_VOLUME'
  FROM alert_stats ast
  WHERE ast.hourly_alerts > 50  -- More than 50 alerts in 1 hour
  
  UNION ALL
  
  SELECT 
    ast.user_id,
    ast.daily_alerts,
    '24 hours', 
    'SPAM_PATTERN'
  FROM alert_stats ast
  WHERE ast.daily_alerts > 200; -- More than 200 alerts in 24 hours
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 9. NOTIFICATION PREFERENCES
-- ================================

-- Table for user notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_alerts BOOLEAN DEFAULT TRUE,
  sound_alerts BOOLEAN DEFAULT TRUE,
  popup_alerts BOOLEAN DEFAULT TRUE,
  digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'never')),
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_preferences_user_policy ON notification_preferences
  FOR ALL 
  USING (user_id = auth.uid());

-- ================================
-- 10. SAMPLE DATA FOR TESTING
-- ================================

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, email_alerts, sound_alerts, popup_alerts)
SELECT 
  id,
  true,
  true,
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Verify table creation
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('message_alerts', 'notification_preferences');

-- Verify functions
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%alert%'
ORDER BY routine_name;