-- Notification Tray System Enhancement Migration
-- Extends message_alerts table for notification tray functionality
-- Author: Mason Vector System
-- Date: November 7, 2025

-- Add columns for notification tray preview functionality
ALTER TABLE message_alerts 
ADD COLUMN IF NOT EXISTS preview_text TEXT,
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'message',
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_message_alerts_user_unread 
ON message_alerts(user_id, is_read, created_at DESC)
WHERE is_read = false;

-- Create index for efficient cleanup
CREATE INDEX IF NOT EXISTS idx_message_alerts_created_at 
ON message_alerts(created_at);

-- Enhanced trigger function to populate preview data
CREATE OR REPLACE FUNCTION create_message_alert()
RETURNS TRIGGER AS $$
DECLARE
    sender_profile RECORD;
    recipient_profile RECORD;
    preview_length INTEGER := 80;
BEGIN
    -- Only create alerts for direct messages (not system messages)
    IF NEW.sender_id IS NOT NULL AND NEW.recipient_id IS NOT NULL THEN
        
        -- Get sender information
        SELECT u.full_name, up.avatar_url
        INTO sender_profile
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = NEW.sender_id;
        
        -- Get recipient information to check if they want notifications
        SELECT u.full_name
        INTO recipient_profile
        FROM users u
        WHERE u.id = NEW.recipient_id;
        
        -- Create the alert with enhanced data
        INSERT INTO message_alerts (
            user_id,
            message_id,
            preview_text,
            sender_name,
            sender_avatar_url,
            action_type,
            action_url
        ) VALUES (
            NEW.recipient_id,
            NEW.id,
            LEFT(COALESCE(NEW.body, 'New message'), preview_length),
            COALESCE(sender_profile.full_name, 'Unknown User'),
            sender_profile.avatar_url,
            'message',
            '/messages?thread=' || NEW.sender_id
        );
        
        -- Log audit event for alert creation
        INSERT INTO audit_logs (
            user_id,
            action_type,
            action_details,
            ip_address,
            user_agent
        ) VALUES (
            NEW.recipient_id,
            'ALERT_CREATED',
            jsonb_build_object(
                'alert_type', 'message',
                'sender_id', NEW.sender_id,
                'message_id', NEW.id,
                'preview', LEFT(COALESCE(NEW.body, ''), 50)
            ),
            inet_client_addr(),
            current_setting('application.user_agent', true)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create system alerts (non-message alerts)
CREATE OR REPLACE FUNCTION create_system_alert(
    p_user_id UUID,
    p_title TEXT,
    p_preview_text TEXT,
    p_action_type VARCHAR(50) DEFAULT 'system',
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO message_alerts (
        user_id,
        preview_text,
        sender_name,
        action_type,
        action_url
    ) VALUES (
        p_user_id,
        p_preview_text,
        'Mason Vector System',
        p_action_type,
        p_action_url
    ) RETURNING id INTO alert_id;
    
    -- Log audit event
    INSERT INTO audit_logs (
        user_id,
        action_type,
        action_details
    ) VALUES (
        p_user_id,
        'SYSTEM_ALERT_CREATED',
        jsonb_build_object(
            'alert_id', alert_id,
            'alert_type', p_action_type,
            'preview', p_preview_text
        )
    );
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark alerts as viewed (for tray open tracking)
CREATE OR REPLACE FUNCTION mark_alerts_viewed(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    viewed_count INTEGER;
BEGIN
    -- Count unread alerts
    SELECT COUNT(*)
    INTO viewed_count
    FROM message_alerts
    WHERE user_id = p_user_id AND is_read = false;
    
    -- Log audit event for tray viewing
    INSERT INTO audit_logs (
        user_id,
        action_type,
        action_details
    ) VALUES (
        p_user_id,
        'ALERT_TRAY_VIEWED',
        jsonb_build_object(
            'unread_count', viewed_count,
            'viewed_at', NOW()
        )
    );
    
    RETURN viewed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced cleanup function for old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notification_alerts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete alerts older than 30 days
    WITH deleted AS (
        DELETE FROM message_alerts
        WHERE created_at < NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    -- Log cleanup activity
    INSERT INTO audit_logs (
        action_type,
        action_details
    ) VALUES (
        'ALERT_CLEANUP',
        jsonb_build_object(
            'deleted_count', deleted_count,
            'cleanup_date', NOW()
        )
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced Sentinel monitoring for notification spam
CREATE OR REPLACE FUNCTION detect_notification_anomalies()
RETURNS TABLE(
    user_id UUID,
    alert_count BIGINT,
    risk_level TEXT,
    recommended_action TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH alert_stats AS (
        SELECT 
            ma.user_id,
            COUNT(*) as recent_alerts,
            COUNT(DISTINCT ma.sender_name) as unique_senders,
            MAX(ma.created_at) as last_alert
        FROM message_alerts ma
        WHERE ma.created_at > NOW() - INTERVAL '1 hour'
        GROUP BY ma.user_id
    )
    SELECT 
        s.user_id,
        s.recent_alerts,
        CASE 
            WHEN s.recent_alerts > 100 THEN 'CRITICAL'
            WHEN s.recent_alerts > 50 THEN 'HIGH'
            WHEN s.recent_alerts > 20 THEN 'MEDIUM'
            ELSE 'LOW'
        END as risk_level,
        CASE 
            WHEN s.recent_alerts > 100 THEN 'IMMEDIATE_SUSPENSION'
            WHEN s.recent_alerts > 50 THEN 'RATE_LIMIT_USER'
            WHEN s.recent_alerts > 20 THEN 'MONITOR_CLOSELY'
            ELSE 'NORMAL_OPERATION'
        END as recommended_action
    FROM alert_stats s
    WHERE s.recent_alerts > 10
    ORDER BY s.recent_alerts DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy for notification tray access
CREATE POLICY "Users can access own notification alerts"
ON message_alerts FOR ALL
USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON message_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION create_system_alert(UUID, TEXT, TEXT, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_alerts_viewed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notification_alerts() TO service_role;
GRANT EXECUTE ON FUNCTION detect_notification_anomalies() TO service_role;

-- Enable realtime for enhanced message_alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE message_alerts;

-- Create notification preferences if not exists
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    show_previews BOOLEAN DEFAULT true,
    play_sound BOOLEAN DEFAULT true,
    tray_auto_open BOOLEAN DEFAULT false,
    max_tray_items INTEGER DEFAULT 20,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
ON notification_preferences FOR ALL
USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE message_alerts IS 'Enhanced message alerts with notification tray support';
COMMENT ON COLUMN message_alerts.preview_text IS 'Short preview text for notification display';
COMMENT ON COLUMN message_alerts.sender_name IS 'Display name of message sender';
COMMENT ON COLUMN message_alerts.sender_avatar_url IS 'Avatar URL for sender profile picture';
COMMENT ON COLUMN message_alerts.action_type IS 'Type of notification: message, system, alert, etc.';
COMMENT ON COLUMN message_alerts.action_url IS 'URL to navigate when notification is clicked';

COMMENT ON TABLE notification_preferences IS 'User preferences for notification tray behavior';
COMMENT ON FUNCTION create_system_alert IS 'Create system notifications for non-message alerts';
COMMENT ON FUNCTION mark_alerts_viewed IS 'Track notification tray viewing for audit purposes';
COMMENT ON FUNCTION cleanup_old_notification_alerts IS 'Automated cleanup of old notification records';
COMMENT ON FUNCTION detect_notification_anomalies IS 'Sentinel monitoring for notification spam detection';