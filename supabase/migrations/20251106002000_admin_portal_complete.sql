-- Admin Portal Complete Database Schema
-- Created: 2025-11-06
-- Purpose: Comprehensive admin portal with user management, audit logging, and system control

-- First, create enum types for better type safety
CREATE TYPE portal_status AS ENUM ('active', 'pending', 'expired', 'suspended');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'contractor', 'client');
CREATE TYPE audit_action AS ENUM (
  'CREATE_PORTAL_LINK', 'USER_DEACTIVATE', 'USER_REACTIVATE', 
  'USER_PASSWORD_RESET', 'USER_UPDATE', 'USER_REMOVE',
  'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'SESSION_TIMEOUT',
  'MFA_ENABLED', 'MFA_DISABLED', 'SECURITY_ALERT',
  'TEMPLATE_UPDATE', 'SYSTEM_BROADCAST', 'BULK_ACTION'
);

-- Extend users table for admin portal features
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status portal_status DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_ip INET;
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_info TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_contractor UUID REFERENCES users(id);

-- Portal invites table
CREATE TABLE IF NOT EXISTS portal_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id),
  invite_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, warning, error, maintenance
  target_roles user_role[] DEFAULT ARRAY['client', 'contractor'],
  created_by UUID NOT NULL REFERENCES users(id),
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  active BOOLEAN DEFAULT TRUE
);

-- Enhanced audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action audit_action NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table (enhanced)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[], -- Available template variables
  template_type VARCHAR(50), -- welcome, reset, notification, etc.
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS templates table (enhanced)
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  message TEXT NOT NULL,
  variables TEXT[], -- Available template variables
  template_type VARCHAR(50), -- intro, followup, reminder, etc.
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System documents table (FAQ, policies, etc.)
CREATE TABLE IF NOT EXISTS system_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  document_type VARCHAR(50), -- faq, policy, guide, etc.
  visible_to_roles user_role[] DEFAULT ARRAY['client', 'contractor'],
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events table (for Sentinel integration)
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  user_id UUID REFERENCES users(id),
  ip_address INET,
  description TEXT,
  data JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_portal_invites_token ON portal_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_portal_invites_email ON portal_invites(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

-- Enable Row Level Security
ALTER TABLE portal_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access only
CREATE POLICY "Admin access only" ON portal_invites FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Admin access only" ON admin_settings FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Admin read, manager limited" ON audit_logs FOR SELECT USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Admin write only" ON audit_logs FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' IN ('admin', 'manager', 'contractor', 'client')
);

CREATE POLICY "Admin access" ON user_sessions FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager') OR 
  user_id::text = auth.jwt() ->> 'sub'
);

CREATE POLICY "Admin template access" ON email_templates FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Admin template access" ON sms_templates FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Admin document access" ON system_documents FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Role-based document viewing" ON system_documents FOR SELECT USING (
  (auth.jwt() ->> 'role')::user_role = ANY(visible_to_roles) AND active = TRUE
);

CREATE POLICY "Admin notification access" ON system_notifications FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

CREATE POLICY "Role-based notification viewing" ON system_notifications FOR SELECT USING (
  (auth.jwt() ->> 'role')::user_role = ANY(target_roles) AND active = TRUE
);

CREATE POLICY "Admin security events" ON security_events FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager')
);

-- Helper functions for admin operations

-- Function to create portal invite
CREATE OR REPLACE FUNCTION create_portal_invite(
  p_email VARCHAR(255),
  p_role user_role,
  p_invited_by UUID
) RETURNS UUID AS $$
DECLARE
  v_token TEXT;
  v_invite_id UUID;
BEGIN
  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert invite
  INSERT INTO portal_invites (email, role, invited_by, invite_token)
  VALUES (p_email, p_role, p_invited_by, v_token)
  RETURNING id INTO v_invite_id;
  
  -- Log the action
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (p_invited_by, 'CREATE_PORTAL_LINK', 'portal_invite', v_invite_id, 
          jsonb_build_object('email', p_email, 'role', p_role, 'token', v_token));
  
  RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate/deactivate users
CREATE OR REPLACE FUNCTION update_user_status(
  p_user_id UUID,
  p_status portal_status,
  p_updated_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_old_status portal_status;
  v_action audit_action;
BEGIN
  -- Get current status
  SELECT status INTO v_old_status FROM users WHERE id = p_user_id;
  
  -- Update user status
  UPDATE users SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Determine audit action
  v_action := CASE 
    WHEN p_status = 'suspended' THEN 'USER_DEACTIVATE'
    WHEN p_status = 'active' AND v_old_status = 'suspended' THEN 'USER_REACTIVATE'
    ELSE 'USER_UPDATE'
  END;
  
  -- Log the action
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (p_updated_by, v_action, 'user', p_user_id,
          jsonb_build_object('status', v_old_status),
          jsonb_build_object('status', p_status));
  
  -- If deactivating, terminate active sessions
  IF p_status = 'suspended' THEN
    UPDATE user_sessions SET active = FALSE WHERE user_id = p_user_id AND active = TRUE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action audit_action,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, ip_address, user_agent, metadata)
  VALUES (p_user_id, p_action, p_ip_address, p_user_agent, p_metadata)
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create system notification
CREATE OR REPLACE FUNCTION create_system_notification(
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info',
  p_target_roles user_role[] DEFAULT ARRAY['client', 'contractor'],
  p_created_by UUID DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO system_notifications (title, message, type, target_roles, created_by, expires_at)
  VALUES (p_title, p_message, p_type, p_target_roles, p_created_by, p_expires_at)
  RETURNING id INTO v_notification_id;
  
  -- Log the action
  IF p_created_by IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
    VALUES (p_created_by, 'SYSTEM_BROADCAST', 'system_notification', v_notification_id,
            jsonb_build_object('title', p_title, 'target_roles', p_target_roles));
  END IF;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get portal statistics for dashboard
CREATE OR REPLACE FUNCTION get_portal_statistics()
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'active_clients', (SELECT COUNT(*) FROM users WHERE role = 'client' AND status = 'active'),
    'pending_clients', (SELECT COUNT(*) FROM users WHERE role = 'client' AND status = 'pending'),
    'active_contractors', (SELECT COUNT(*) FROM users WHERE role = 'contractor' AND status = 'active'),
    'total_claims', (SELECT COUNT(*) FROM claimants),
    'open_claims', (SELECT COUNT(*) FROM claimants WHERE status NOT IN ('closed', 'completed')),
    'recent_logins', (SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '24 hours'),
    'pending_invites', (SELECT COUNT(*) FROM portal_invites WHERE used_at IS NULL AND expires_at > NOW()),
    'security_alerts', (SELECT COUNT(*) FROM security_events WHERE resolved = FALSE AND created_at > NOW() - INTERVAL '7 days')
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
('session_timeout_minutes', '15', 'Session timeout in minutes for admin users'),
('mfa_required_roles', '["admin"]', 'Roles that require MFA'),
('max_login_attempts', '5', 'Maximum login attempts before account lock'),
('password_min_length', '8', 'Minimum password length requirement'),
('invite_expiry_days', '7', 'Portal invite expiry in days')
ON CONFLICT (key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables, template_type) VALUES
('portal_invite', 'Welcome to Mason Vector Portal', 
 'Hi there,\n\nYou have been invited to access the Mason Vector portal.\n\nClick here to set up your account: {{invite_link}}\n\nThis link expires in {{expiry_days}} days.\n\nBest regards,\nMason Vector Team', 
 ARRAY['invite_link', 'expiry_days'], 'welcome'),
('password_reset', 'Reset Your Password', 
 'Hi {{user_name}},\n\nClick the link below to reset your password:\n{{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nMason Vector Team',
 ARRAY['user_name', 'reset_link'], 'reset'),
('account_suspended', 'Account Suspended', 
 'Hi {{user_name}},\n\nYour account has been suspended. Please contact support for assistance.\n\nBest regards,\nMason Vector Team',
 ARRAY['user_name'], 'notification')
ON CONFLICT (name) DO NOTHING;

-- Insert default SMS templates
INSERT INTO sms_templates (name, message, variables, template_type) VALUES
('intro_message', 'Hi {{name}}, I''m contacting you about your unclaimed funds of {{amount}}. Can we schedule a quick call? - Mason Vector', 
 ARRAY['name', 'amount'], 'intro'),
('followup_message', 'Hi {{name}}, following up on your unclaimed funds. Are you still interested in claiming {{amount}}? Reply STOP to opt out.', 
 ARRAY['name', 'amount'], 'followup'),
('appointment_reminder', 'Reminder: Your appointment with Mason Vector is tomorrow at {{time}}. Reply to confirm or reschedule.',
 ARRAY['time'], 'reminder')
ON CONFLICT (name) DO NOTHING;

-- Insert default FAQ documents
INSERT INTO system_documents (title, content, document_type, visible_to_roles) VALUES
('How to Access Your Portal', 'To access your portal, click the link in your invitation email and follow the setup instructions. Your portal gives you secure access to your claim information and allows direct communication with your assigned contractor.', 'faq', ARRAY['client']),
('Contractor Guidelines', 'As a Mason Vector contractor, you have access to assigned claimants and communication tools. Always maintain professional communication and log all interactions for audit purposes.', 'guide', ARRAY['contractor']),
('Privacy Policy', 'Mason Vector takes your privacy seriously. All personal information is encrypted and access is strictly controlled. We never share your information without explicit consent.', 'policy', ARRAY['client', 'contractor'])
ON CONFLICT (title) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;