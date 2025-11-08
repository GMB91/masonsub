-- ============================================================================
-- Portal Creation Support - User Table Extensions
-- Mason Vector - Secure Account Creation and Management
-- ============================================================================
-- Migration: 20251106000100_portal_creation_support.sql
-- Purpose: Add fields to support secure portal invitations with temporary credentials
-- Security: Temporary passwords with expiry, audit logging, account status tracking
-- ============================================================================

-- Add portal creation support columns to users table (if it exists)
-- Note: Using auth.users for Supabase, but preparing for custom users table

-- For Supabase auth.users, we'll use user_metadata for these fields
-- For custom users table (future), add these columns:
/*
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temp_password TEXT,
ADD COLUMN IF NOT EXISTS temp_expires TIMESTAMPTZ,  
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
*/

-- Create portal invitations table for tracking invite tokens
CREATE TABLE IF NOT EXISTS portal_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'contractor', 'manager')),
  temp_password text NOT NULL,
  invite_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on portal invitations
ALTER TABLE portal_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage portal invitations
CREATE POLICY "portal_invitations_admin_only" ON portal_invitations
  FOR ALL
  TO authenticated
  USING (
    current_setting('app.current_role', true) IN ('admin', 'manager')
  );

-- Create audit log table for portal creation events
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid,
  target_id uuid,
  target_email text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.current_role', true) IN ('admin', 'manager')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portal_invitations_token ON portal_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_email ON portal_invitations(email);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_expires ON portal_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

-- Create function to log portal events
CREATE OR REPLACE FUNCTION log_portal_event(
  p_action TEXT,
  p_actor_id UUID,
  p_target_id UUID DEFAULT NULL,
  p_target_email TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    action, actor_id, target_id, target_email, 
    details, ip_address, user_agent
  )
  VALUES (
    p_action, p_actor_id, p_target_id, p_target_email,
    p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Delete expired invitations
  DELETE FROM portal_invitations 
  WHERE expires_at < NOW() 
    AND used_at IS NULL;
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Log cleanup event
  PERFORM log_portal_event(
    'CLEANUP_EXPIRED_INVITATIONS',
    NULL,
    NULL,
    NULL,
    jsonb_build_object('cleaned_count', cleaned_count)
  );
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate secure temporary password
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT AS $$
BEGIN
  -- Generate a 12-character secure password
  RETURN encode(gen_random_bytes(9), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create portal invitation
CREATE OR REPLACE FUNCTION create_portal_invitation(
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_temp_password TEXT;
  v_invite_token TEXT;
  v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '24 hours';
  v_invitation_id UUID;
BEGIN
  -- Validate role
  IF p_role NOT IN ('client', 'contractor', 'manager') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM portal_invitations WHERE email = p_email AND used_at IS NULL) THEN
    RAISE EXCEPTION 'Active invitation already exists for email: %', p_email;
  END IF;
  
  -- Generate temporary password
  v_temp_password := generate_temp_password();
  
  -- Generate JWT-style token (simplified - in production use proper JWT)
  v_invite_token := encode(
    convert_to(
      jsonb_build_object(
        'uid', v_user_id,
        'email', p_email,
        'role', p_role,
        'exp', extract(epoch from v_expires_at)
      )::text, 
      'utf8'
    ), 
    'base64'
  );
  
  -- Create invitation record
  INSERT INTO portal_invitations (
    user_id, email, full_name, role, temp_password,
    invite_token, expires_at, created_by
  )
  VALUES (
    v_user_id, p_email, p_full_name, p_role, v_temp_password,
    v_invite_token, v_expires_at, p_created_by
  )
  RETURNING id INTO v_invitation_id;
  
  -- Log the event
  PERFORM log_portal_event(
    'CREATE_PORTAL_INVITATION',
    p_created_by,
    v_user_id,
    p_email,
    jsonb_build_object(
      'role', p_role,
      'invitation_id', v_invitation_id,
      'expires_at', v_expires_at
    )
  );
  
  -- Return invitation details
  RETURN jsonb_build_object(
    'invitation_id', v_invitation_id,
    'user_id', v_user_id,
    'email', p_email,
    'temp_password', v_temp_password,
    'invite_token', v_invite_token,
    'invite_url', 'https://portal.masonvector.ai/invite/' || v_invite_token,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify and use invitation
CREATE OR REPLACE FUNCTION use_portal_invitation(
  p_invite_token TEXT,
  p_temp_password TEXT,
  p_new_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_invitation portal_invitations%ROWTYPE;
  v_user_data JSONB;
BEGIN
  -- Find and lock invitation
  SELECT * INTO v_invitation
  FROM portal_invitations
  WHERE invite_token = p_invite_token
    AND expires_at > NOW()
    AND used_at IS NULL
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Verify temporary password
  IF v_invitation.temp_password != p_temp_password THEN
    RAISE EXCEPTION 'Invalid temporary password';
  END IF;
  
  -- Mark invitation as used
  UPDATE portal_invitations
  SET used_at = NOW(),
      updated_at = NOW()
  WHERE id = v_invitation.id;
  
  -- Prepare user data for Supabase
  v_user_data := jsonb_build_object(
    'user_id', v_invitation.user_id,
    'email', v_invitation.email,
    'full_name', v_invitation.full_name,
    'role', v_invitation.role,
    'password', p_new_password
  );
  
  -- Log successful invitation use
  PERFORM log_portal_event(
    'PORTAL_INVITATION_USED',
    v_invitation.user_id,
    v_invitation.user_id,
    v_invitation.email,
    jsonb_build_object(
      'invitation_id', v_invitation.id,
      'role', v_invitation.role
    )
  );
  
  RETURN v_user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger to new tables
CREATE TRIGGER IF NOT EXISTS update_portal_invitations_updated_at 
  BEFORE UPDATE ON portal_invitations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES (Commented - run manually for testing)
-- ============================================================================

/*
-- Test portal invitation creation
SELECT create_portal_invitation(
  'test@example.com',
  'Test User', 
  'client',
  '00000000-0000-0000-0000-000000000001'::uuid
);

-- View created invitations
SELECT * FROM portal_invitations ORDER BY created_at DESC;

-- Test invitation usage (replace with actual token)
SELECT use_portal_invitation(
  'eyJ1aWQiOiI...',
  'temp_password_here',
  'new_secure_password'
);

-- View audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- Cleanup expired invitations
SELECT cleanup_expired_invitations();
*/

-- ============================================================================
-- Migration Complete: Portal Creation Support Added
-- Features: Secure invitations, temporary credentials, audit logging
-- Security: RLS policies, password expiry, token validation
-- ============================================================================