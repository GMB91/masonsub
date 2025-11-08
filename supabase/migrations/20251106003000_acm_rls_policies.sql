-- Row Level Security Policies for Access Control Matrix Implementation
-- Created: 2025-11-06
-- Purpose: Comprehensive RLS policies implementing the Mason Vector ACM

-- Enable RLS on all main tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimants ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS users_access_policy ON users;
DROP POLICY IF EXISTS claimants_access_policy ON claimants;
DROP POLICY IF EXISTS claims_access_policy ON claims;
DROP POLICY IF EXISTS tasks_access_policy ON tasks;
DROP POLICY IF EXISTS timesheets_access_policy ON timesheets;
DROP POLICY IF EXISTS documents_access_policy ON client_documents;
DROP POLICY IF EXISTS messages_access_policy ON messages;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_role', true), 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'::UUID);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager() RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USERS TABLE RLS POLICIES
-- Admin: R/W/D | Manager: R/W | Contractor: R (self) | Client: R (self)
-- =====================================================

-- Admin full access
CREATE POLICY users_admin_policy ON users
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Manager access (cannot modify admin users)
CREATE POLICY users_manager_read_policy ON users
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'manager');

CREATE POLICY users_manager_update_policy ON users
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = 'manager' 
  AND role != 'admin'
)
WITH CHECK (
  get_current_user_role() = 'manager' 
  AND role != 'admin'
);

-- Self-access for contractors and clients
CREATE POLICY users_self_access_policy ON users
FOR ALL
TO authenticated
USING (
  id = get_current_user_id() 
  AND get_current_user_role() IN ('contractor', 'client')
)
WITH CHECK (
  id = get_current_user_id() 
  AND get_current_user_role() IN ('contractor', 'client')
);

-- =====================================================
-- CLAIMANTS TABLE RLS POLICIES  
-- Admin: R/W/D | Manager: R/W | Contractor: R (assigned), W (notes/status) | Client: R (self)
-- =====================================================

-- Admin and manager full access
CREATE POLICY claimants_admin_manager_policy ON claimants
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Contractor assigned claimants access
CREATE POLICY claimants_contractor_read_policy ON claimants
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'contractor'
  AND assigned_to = get_current_user_id()
);

CREATE POLICY claimants_contractor_update_policy ON claimants
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = 'contractor'
  AND assigned_to = get_current_user_id()
)
WITH CHECK (
  get_current_user_role() = 'contractor'
  AND assigned_to = get_current_user_id()
);

-- Client self-access (based on email match)
CREATE POLICY claimants_client_policy ON claimants
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'client'
  AND email = (
    SELECT email FROM users WHERE id = get_current_user_id()
  )
);

-- =====================================================
-- CLAIMS TABLE RLS POLICIES
-- Admin: R/W/D | Manager: R/W | Contractor: R (assigned claimants) | Client: R (own claims)
-- =====================================================

-- Admin and manager full access
CREATE POLICY claims_admin_manager_policy ON claims
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Contractor access to claims linked to assigned claimants
CREATE POLICY claims_contractor_policy ON claims
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'contractor'
  AND claimant_id IN (
    SELECT id FROM claimants 
    WHERE assigned_to = get_current_user_id()
  )
);

-- Client access to own claims
CREATE POLICY claims_client_policy ON claims
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'client'
  AND claimant_id IN (
    SELECT id FROM claimants 
    WHERE email = (
      SELECT email FROM users WHERE id = get_current_user_id()
    )
  )
);

-- =====================================================
-- TASKS TABLE RLS POLICIES
-- Admin: R/W/D | Manager: R/W | Contractor: R/W (own) | Client: No access
-- =====================================================

-- Admin and manager full access
CREATE POLICY tasks_admin_manager_policy ON tasks
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Contractor own tasks access
CREATE POLICY tasks_contractor_policy ON tasks
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'contractor'
  AND assigned_to = get_current_user_id()
)
WITH CHECK (
  get_current_user_role() = 'contractor'
  AND assigned_to = get_current_user_id()
);

-- =====================================================
-- TIMESHEETS TABLE RLS POLICIES
-- Admin: R/W/D | Manager: R/W | Contractor: R/W (own) | Client: No access
-- =====================================================

-- Admin and manager full access
CREATE POLICY timesheets_admin_manager_policy ON timesheets
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Contractor own timesheets
CREATE POLICY timesheets_contractor_policy ON timesheets
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'contractor'
  AND user_id = get_current_user_id()
)
WITH CHECK (
  get_current_user_role() = 'contractor'
  AND user_id = get_current_user_id()
);

-- =====================================================
-- CLIENT_DOCUMENTS TABLE RLS POLICIES
-- Admin: R/W/D | Manager: R/W | Contractor: No access | Client: R/W (own)
-- =====================================================

-- Admin and manager full access
CREATE POLICY documents_admin_manager_policy ON client_documents
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Client own documents
CREATE POLICY documents_client_policy ON client_documents
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'client'
  AND uploaded_by = get_current_user_id()
)
WITH CHECK (
  get_current_user_role() = 'client'
  AND uploaded_by = get_current_user_id()
);

-- =====================================================
-- MESSAGES TABLE RLS POLICIES  
-- Admin: R/W/D | Manager: R/W | Contractor: R/W (admin only) | Client: R/W (admin only)
-- =====================================================

-- Admin and manager full access
CREATE POLICY messages_admin_manager_policy ON messages
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- Contractor and client restricted to admin conversations
CREATE POLICY messages_restricted_policy ON messages
FOR ALL
TO authenticated
USING (
  get_current_user_role() IN ('contractor', 'client')
  AND (
    (sender_id = get_current_user_id() AND receiver_role = 'admin')
    OR
    (receiver_id = get_current_user_id() AND sender_role = 'admin')
  )
)
WITH CHECK (
  get_current_user_role() IN ('contractor', 'client')
  AND (
    (sender_id = get_current_user_id() AND receiver_role = 'admin')
    OR
    (receiver_id = get_current_user_id() AND sender_role = 'admin')
  )
);

-- =====================================================
-- TEMPLATE TABLES RLS POLICIES
-- =====================================================

-- Email templates: Admin R/W, Manager R, others no access
CREATE POLICY email_templates_admin_policy ON email_templates
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY email_templates_manager_policy ON email_templates
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'manager');

-- SMS templates: Admin R/W, Manager R, Contractor R, Client no access
CREATE POLICY sms_templates_admin_policy ON sms_templates
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY sms_templates_manager_contractor_policy ON sms_templates
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('manager', 'contractor'));

-- =====================================================
-- AUDIT AND ADMIN TABLES RLS POLICIES
-- =====================================================

-- Audit logs: Admin R/W, Manager R, others no access
CREATE POLICY audit_logs_admin_policy ON audit_logs
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY audit_logs_manager_policy ON audit_logs
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'manager');

-- Portal invites: Admin only
CREATE POLICY portal_invites_admin_policy ON portal_invites
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- System notifications: Admin R/W, others R based on target roles
CREATE POLICY system_notifications_admin_policy ON system_notifications
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY system_notifications_read_policy ON system_notifications
FOR SELECT
TO authenticated
USING (
  active = true
  AND (get_current_user_role()::user_role = ANY(target_roles))
);

-- Security events: Admin and manager read access
CREATE POLICY security_events_admin_manager_policy ON security_events
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- =====================================================
-- SYSTEM DOCUMENTS RLS POLICIES
-- =====================================================

-- System documents: Admin R/W, others R based on visibility
CREATE POLICY system_documents_admin_policy ON system_documents
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY system_documents_read_policy ON system_documents
FOR SELECT
TO authenticated
USING (
  active = true
  AND (get_current_user_role()::user_role = ANY(visible_to_roles))
);

-- =====================================================
-- SESSION MANAGEMENT RLS POLICIES
-- =====================================================

-- User sessions: Admin R/W/D, others R/W own sessions
CREATE POLICY user_sessions_admin_policy ON user_sessions
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY user_sessions_self_policy ON user_sessions
FOR ALL
TO authenticated
USING (
  user_id = get_current_user_id()
  AND get_current_user_role() IN ('manager', 'contractor', 'client')
)
WITH CHECK (
  user_id = get_current_user_id()
  AND get_current_user_role() IN ('manager', 'contractor', 'client')
);

-- =====================================================
-- ADMIN SETTINGS RLS POLICIES
-- =====================================================

-- Admin settings: Admin only
CREATE POLICY admin_settings_policy ON admin_settings
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- =====================================================
-- UTILITY FUNCTIONS FOR ACCESS CONTROL
-- =====================================================

-- Function to set session variables for RLS
CREATE OR REPLACE FUNCTION set_session_user(
  user_id UUID,
  user_role TEXT,
  user_email TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, false);
  PERFORM set_config('app.current_role', user_role, false);
  IF user_email IS NOT NULL THEN
    PERFORM set_config('app.current_email', user_email, false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear session variables
CREATE OR REPLACE FUNCTION clear_session_user() RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
  PERFORM set_config('app.current_role', '', false);
  PERFORM set_config('app.current_email', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check resource ownership
CREATE OR REPLACE FUNCTION check_resource_ownership(
  resource_table TEXT,
  resource_id UUID,
  user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  is_owner BOOLEAN := FALSE;
BEGIN
  CASE resource_table
    WHEN 'claimants' THEN
      SELECT assigned_to = user_id OR email = (
        SELECT email FROM users WHERE id = user_id
      ) INTO is_owner
      FROM claimants WHERE id = resource_id;
    
    WHEN 'tasks' THEN
      SELECT assigned_to = user_id INTO is_owner
      FROM tasks WHERE id = resource_id;
    
    WHEN 'timesheets' THEN
      SELECT user_id = check_resource_ownership.user_id INTO is_owner
      FROM timesheets WHERE id = resource_id;
    
    WHEN 'client_documents' THEN
      SELECT uploaded_by = user_id INTO is_owner
      FROM client_documents WHERE id = resource_id;
    
    ELSE
      is_owner := FALSE;
  END CASE;
  
  RETURN COALESCE(is_owner, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION set_session_user(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_session_user() TO authenticated;
GRANT EXECUTE ON FUNCTION check_resource_ownership(TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_manager() TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claimants_assigned_to ON claimants(assigned_to);
CREATE INDEX IF NOT EXISTS idx_claimants_email ON claimants(email);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

COMMENT ON FUNCTION set_session_user IS 'Sets session variables for RLS enforcement';
COMMENT ON FUNCTION get_current_user_role IS 'Gets current user role for RLS policies';
COMMENT ON FUNCTION check_resource_ownership IS 'Validates resource ownership for access control';