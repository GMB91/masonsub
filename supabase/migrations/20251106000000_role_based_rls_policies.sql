-- ============================================================================
-- Row Level Security (RLS) Policies for Role-Based Access Control
-- Mason Vector - Multi-Role Dashboard Security Using Session Variables
-- ============================================================================
-- Migration: 20251106000000_role_based_rls_policies.sql
-- Purpose: Implement comprehensive RLS policies for admin, contractor, client roles
-- Security: Backend enforcement at database level with role-based data isolation
-- Pattern: Uses current_setting() for session variables set by application
--
-- Required session setup in application code:
-- SET app.current_user_id = '<uuid>';   -- the user's id
-- SET app.current_role = '<role>';      -- admin | manager | contractor | client  
-- SET app.current_email = '<email>';    -- used for client matching
-- ============================================================================

-- Enable RLS on all core tables
ALTER TABLE claimants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLAIMANTS TABLE POLICIES
-- Admin/Manager: Full access to all claimants
-- Contractor: Only claimants assigned to them (created_by or task assignment)
-- Client: Only their own claimant records (by email match)
-- ============================================================================

CREATE POLICY "claimants_access_policy" ON claimants
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor: see assigned claimants
    OR (
      current_setting('app.current_role', true) = 'contractor'
      AND (
        created_by::text = current_setting('app.current_user_id', true)
        OR id IN (
          SELECT claimant_id FROM tasks 
          WHERE assigned_to::text = current_setting('app.current_user_id', true)
        )
      )
    )
    -- Client: see their own record by email
    OR (
      current_setting('app.current_role', true) = 'client'
      AND LOWER(email) = LOWER(current_setting('app.current_email', true))
    )
  );

-- ============================================================================
-- ACTIVITIES TABLE POLICIES (Audit logs visible to admin/manager only)
-- Admin/Manager: All activities
-- Contractor/Client: No access (audit data should be admin-only)
-- ============================================================================

CREATE POLICY "activities_admin_only_policy" ON activities
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.current_role', true) IN ('admin', 'manager')
  );

-- ============================================================================
-- REMINDERS TABLE POLICIES
-- Admin/Manager: All reminders
-- Contractor: Reminders for assigned claimants
-- Client: Reminders related to their claims
-- ============================================================================

CREATE POLICY "reminders_access_policy" ON reminders
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor: reminders for assigned claimants
    OR (
      current_setting('app.current_role', true) = 'contractor'
      AND claimant_id IN (
        SELECT id FROM claimants
        WHERE created_by::text = current_setting('app.current_user_id', true)
        OR id IN (
          SELECT claimant_id FROM tasks 
          WHERE assigned_to::text = current_setting('app.current_user_id', true)
        )
      )
    )
    -- Client: reminders for their own claimant records
    OR (
      current_setting('app.current_role', true) = 'client'
      AND claimant_id IN (
        SELECT id FROM claimants
        WHERE LOWER(email) = LOWER(current_setting('app.current_email', true))
      )
    )
  );

-- ============================================================================
-- TASKS TABLE POLICIES
-- Admin/Manager: All tasks
-- Contractor: Tasks assigned to them
-- Client: No access to tasks (internal workflow)
-- ============================================================================

CREATE POLICY "tasks_access_policy" ON tasks
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all tasks
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor: only tasks assigned to them
    OR (
      current_setting('app.current_role', true) = 'contractor'
      AND assigned_to::text = current_setting('app.current_user_id', true)
    )
    -- Client: no access to tasks (internal workflow)
  );

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- Admin/Manager: All messages
-- Contractor/Client: Messages where they are sender or recipient
-- ============================================================================

CREATE POLICY "messages_access_policy" ON messages
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all messages
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor/Client: messages they sent or received
    OR (
      current_setting('app.current_role', true) IN ('contractor', 'client')
      AND (
        sender_id::text = current_setting('app.current_user_id', true)
        OR recipient_id::text = current_setting('app.current_user_id', true)
      )
    )
  );

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- Admin/Manager: All payments
-- Contractor: Payments for assigned claimants
-- Client: Payments for their claims
-- ============================================================================

CREATE POLICY "payments_access_policy" ON payments
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all payments
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor: payments for assigned claimants
    OR (
      current_setting('app.current_role', true) = 'contractor'
      AND claimant_id IN (
        SELECT id FROM claimants
        WHERE created_by::text = current_setting('app.current_user_id', true)
        OR id IN (
          SELECT claimant_id FROM tasks 
          WHERE assigned_to::text = current_setting('app.current_user_id', true)
        )
      )
    )
    -- Client: payments for their own claimant records
    OR (
      current_setting('app.current_role', true) = 'client'
      AND claimant_id IN (
        SELECT id FROM claimants
        WHERE LOWER(email) = LOWER(current_setting('app.current_email', true))
      )
    )
  );

-- ============================================================================
-- TIMESHEETS TABLE POLICIES
-- Admin/Manager: All timesheets
-- Contractor: Only their own timesheets
-- Client: No access to timesheets
-- ============================================================================

CREATE POLICY "timesheets_access_policy" ON timesheets
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all timesheets
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor: only their own timesheets
    OR (
      current_setting('app.current_role', true) = 'contractor'
      AND contractor_id::text = current_setting('app.current_user_id', true)
    )
    -- Client: no access to timesheets
  );

-- Allow contractors to insert their own timesheets
CREATE POLICY "timesheets_insert_policy" ON timesheets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_setting('app.current_role', true) = 'contractor'
    AND contractor_id::text = current_setting('app.current_user_id', true)
  );

-- ============================================================================
-- CLAIM_NOTES TABLE POLICIES
-- Admin/Manager: All notes
-- Contractor: Notes for assigned claimants
-- Client: Notes for their claimant records (read-only)
-- ============================================================================

CREATE POLICY "claim_notes_access_policy" ON claim_notes
  FOR SELECT
  TO authenticated
  USING (
    -- Admin/Manager: see all notes
    current_setting('app.current_role', true) IN ('admin', 'manager')
    -- Contractor: notes for assigned claimants
    OR (
      current_setting('app.current_role', true) = 'contractor'
      AND claimant_id IN (
        SELECT id FROM claimants
        WHERE created_by::text = current_setting('app.current_user_id', true)
        OR id IN (
          SELECT claimant_id FROM tasks 
          WHERE assigned_to::text = current_setting('app.current_user_id', true)
        )
      )
    )
    -- Client: notes for their own claimant records (read-only)
    OR (
      current_setting('app.current_role', true) = 'client'
      AND claimant_id IN (
        SELECT id FROM claimants
        WHERE LOWER(email) = LOWER(current_setting('app.current_email', true))
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR SESSION-BASED RLS
-- ============================================================================

-- Function to safely get current setting with fallback
CREATE OR REPLACE FUNCTION get_app_setting(setting_name TEXT, fallback TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(current_setting(setting_name, true), fallback);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin/manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_app_setting('app.current_role', 'anonymous') IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contractor's assigned claimant IDs
CREATE OR REPLACE FUNCTION get_contractor_claimant_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT c.id
    FROM claimants c
    WHERE c.created_by::text = get_app_setting('app.current_user_id')
    UNION
    SELECT DISTINCT t.claimant_id
    FROM tasks t
    WHERE t.assigned_to::text = get_app_setting('app.current_user_id');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client's claimant IDs (by email match)
CREATE OR REPLACE FUNCTION get_client_claimant_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
    SELECT c.id
    FROM claimants c
    WHERE LOWER(c.email) = LOWER(get_app_setting('app.current_email'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SESSION MANAGEMENT FUNCTIONS
-- Application calls this to set session variables for RLS
-- ============================================================================

-- Function to set session variables (called by application)
CREATE OR REPLACE FUNCTION set_session_variables(
  user_id UUID,
  user_role TEXT,
  user_email TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Set session variables for RLS policies
  PERFORM set_config('app.current_user_id', user_id::text, true);
  PERFORM set_config('app.current_role', user_role, true);
  PERFORM set_config('app.current_email', user_email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear session variables (for cleanup)
CREATE OR REPLACE FUNCTION clear_session_variables()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', NULL, true);
  PERFORM set_config('app.current_role', NULL, true);
  PERFORM set_config('app.current_email', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES (Commented - run manually for testing)
-- ============================================================================

/*
-- ✅ 1. Test RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('claimants', 'activities', 'reminders', 'tasks', 'payments', 'messages', 'timesheets', 'claim_notes')
ORDER BY tablename;

-- ✅ 2. Count policies per table
SELECT 
  tablename, 
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('claimants', 'activities', 'reminders', 'tasks', 'payments', 'messages', 'timesheets', 'claim_notes')
GROUP BY tablename
ORDER BY tablename;

-- ✅ 3. Show all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('claimants', 'activities', 'reminders', 'tasks', 'payments', 'messages', 'timesheets', 'claim_notes')
ORDER BY tablename, policyname;

-- ✅ 4. Test contractor access (should see only assigned claimants)
SET app.current_user_id = '00000000-0000-0000-0000-000000000003';
SET app.current_role = 'contractor';
SET app.current_email = 'contractor@masonvector.ai';

SELECT * FROM claimants;       -- should return only assigned ones
SELECT * FROM tasks;           -- only tasks assigned to this contractor
SELECT * FROM activities;      -- empty set (forbidden for contractors)
SELECT * FROM timesheets;      -- only their own timesheets

-- ✅ 5. Test client access (should see only their own records)
SET app.current_user_id = '00000000-0000-0000-0000-000000000004';
SET app.current_role = 'client';
SET app.current_email = 'client@example.com';

SELECT * FROM claimants;       -- only records with matching email
SELECT * FROM payments;        -- only payments for their claims
SELECT * FROM activities;      -- empty set (forbidden for clients)
SELECT * FROM tasks;           -- empty set (forbidden for clients)

-- ✅ 6. Test admin access (should see everything)
SET app.current_user_id = '00000000-0000-0000-0000-000000000001';
SET app.current_role = 'admin';
SET app.current_email = 'admin@masonvector.ai';

SELECT COUNT(*) FROM claimants;   -- all claimants
SELECT COUNT(*) FROM activities;  -- all activities
SELECT COUNT(*) FROM tasks;       -- all tasks
SELECT COUNT(*) FROM timesheets;  -- all timesheets

-- ✅ 7. Test helper functions
SELECT get_app_setting('app.current_role', 'none');
SELECT is_admin_or_manager();
SELECT * FROM get_contractor_claimant_ids();
SELECT * FROM get_client_claimant_ids();

-- ✅ 8. Reset session (cleanup)
RESET app.current_user_id;
RESET app.current_role; 
RESET app.current_email;
*/

-- ============================================================================
-- Migration Complete: RLS Policies Active
-- Database-level security enforcement for role-based access control
-- Admin/Manager: Full system access
-- Contractor: Assigned work only
-- Client: Personal records only
-- ============================================================================