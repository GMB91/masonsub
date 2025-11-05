-- ============================================================================
-- [AUTO-GEN-START] Safe Schema Completion Migration
-- Mason Vector - Complete Entity Schema with RLS
-- ============================================================================
-- Migration: 20251105000000_safe_schema_complete.sql
-- Strategy: NON-DESTRUCTIVE - Only adds missing tables/columns
-- Generated: 2025-11-05
-- Purpose: Ensure all required entities exist with proper RLS policies
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 1: SAFE TABLE CREATION
-- Creates tables only if they don't exist
-- ============================================================================

-- Claimants table (core entity - likely exists, safe create)
CREATE TABLE IF NOT EXISTS claimants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  first_name text,
  last_name text,
  dob date,
  address text,
  suburb text,
  state text NOT NULL,
  postcode text,
  contact_number text,
  email text,
  abn text,
  acn text,
  amount numeric(12,2),
  entity_type text DEFAULT 'individual',
  source_state text,
  record_hash text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_id uuid REFERENCES claimants(id) ON DELETE CASCADE,
  due_date timestamptz NOT NULL,
  description text NOT NULL,
  completed boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pending client invites table
CREATE TABLE IF NOT EXISTS pending_client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE,
  role text DEFAULT 'client',
  expires_at timestamptz NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Activities table (system activity log)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  context jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_id uuid REFERENCES claimants(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'AUD',
  status text DEFAULT 'pending',
  payment_method text,
  paid_at timestamptz,
  reference text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_hours numeric(5,2) NOT NULL,
  hourly_rate numeric(8,2),
  total_amount numeric(10,2),
  status text DEFAULT 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table (internal communication)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  subject text,
  content text NOT NULL,
  type text DEFAULT 'message',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Xero sync table
CREATE TABLE IF NOT EXISTS xero_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  external_id text NOT NULL,
  status text DEFAULT 'pending',
  last_synced_at timestamptz,
  sync_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SMS messages table
CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- SMS templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  body text NOT NULL,
  variables jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client messages table
CREATE TABLE IF NOT EXISTS client_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  sent_by uuid,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table (if not already created by migration 005)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to uuid,
  claimant_id uuid REFERENCES claimants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Company essentials table
CREATE TABLE IF NOT EXISTS company_essentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abn text NOT NULL UNIQUE,
  acn text,
  trading_name text NOT NULL,
  legal_name text,
  director_name text,
  director_details jsonb,
  address text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trace history table (Tracer AI execution logs)
CREATE TABLE IF NOT EXISTS trace_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_id uuid REFERENCES claimants(id) ON DELETE CASCADE,
  trace_agent text NOT NULL,
  status text DEFAULT 'running',
  result_json jsonb,
  confidence_score numeric(3,2),
  execution_time_ms integer,
  error_message text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Claim notes table
CREATE TABLE IF NOT EXISTS claim_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_id uuid REFERENCES claimants(id) ON DELETE CASCADE,
  note text NOT NULL,
  note_type text DEFAULT 'general',
  is_internal boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trace conversations table (Tracer AI chat sessions)
CREATE TABLE IF NOT EXISTS trace_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trace messages table (Tracer AI chat messages)
CREATE TABLE IF NOT EXISTS trace_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES trace_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Trace tool runs table (AI tool execution records)
CREATE TABLE IF NOT EXISTS trace_tool_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES trace_conversations(id) ON DELETE CASCADE,
  message_id uuid REFERENCES trace_messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  args jsonb NOT NULL,
  result jsonb,
  status text DEFAULT 'pending',
  error text,
  execution_time_ms integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ============================================================================
-- SECTION 2: SAFE COLUMN ADDITIONS
-- Adds missing columns to existing tables (if they don't exist)
-- ============================================================================

-- Add missing columns to claimants if not present
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claimants' AND column_name='full_name') THEN
    ALTER TABLE claimants ADD COLUMN full_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claimants' AND column_name='amount') THEN
    ALTER TABLE claimants ADD COLUMN amount numeric(12,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claimants' AND column_name='created_by') THEN
    ALTER TABLE claimants ADD COLUMN created_by uuid;
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY
-- Non-destructively enables RLS on all tables
-- ============================================================================

ALTER TABLE claimants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE xero_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_essentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_tool_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 4: BASE RLS POLICIES
-- Creates policies only if they don't exist
-- ============================================================================

-- System Admin Full Access Policy Template
-- Applies to all tables: system_admin has unrestricted access

DO $$
DECLARE
  tbl text;
  policy_name text;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'claimants', 'reminders', 'pending_client_invites', 'activities',
      'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
      'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
      'tasks', 'company_essentials', 'trace_history', 'claim_notes',
      'trace_conversations', 'trace_messages', 'trace_tool_runs'
    ])
  LOOP
    policy_name := 'system_admin_full_access_' || tbl;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = tbl AND policyname = policy_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (auth.jwt()->''role'' = ''system_admin'')',
        policy_name, tbl
      );
    END IF;
  END LOOP;
END $$;

-- Admin Operational Access (read/write but not delete)
DO $$
DECLARE
  tbl text;
  policy_name text;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'claimants', 'reminders', 'activities', 'payments', 'tasks', 
      'claim_notes', 'trace_history', 'trace_conversations', 'trace_messages'
    ])
  LOOP
    policy_name := 'admin_operational_access_' || tbl;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = tbl AND policyname = policy_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR SELECT, INSERT, UPDATE USING (auth.jwt()->''role'' IN (''admin'', ''system_admin''))',
        policy_name, tbl
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 5: FINE-GRAINED RLS POLICIES
-- Specific access rules for different roles
-- ============================================================================

-- Contractors manage own timesheets
CREATE POLICY IF NOT EXISTS "contractor_manage_own_timesheets"
ON timesheets
FOR ALL
USING (
  auth.uid() = contractor_id 
  AND auth.jwt()->>'role' IN ('contractor', 'admin', 'system_admin')
);

-- Clients view their own messages
CREATE POLICY IF NOT EXISTS "client_view_own_messages"
ON client_messages
FOR SELECT
USING (
  auth.uid() = client_id 
  AND auth.jwt()->>'role' = 'client'
);

-- Managers can view/update assigned tasks
CREATE POLICY IF NOT EXISTS "manager_assigned_tasks"
ON tasks
FOR ALL
USING (
  (auth.uid() = assigned_to OR auth.uid() = created_by)
  AND auth.jwt()->>'role' IN ('manager', 'admin', 'system_admin')
);

-- Users can view their own activities
CREATE POLICY IF NOT EXISTS "user_view_own_activities"
ON activities
FOR SELECT
USING (
  auth.uid() = actor_id 
  OR auth.jwt()->>'role' IN ('admin', 'system_admin')
);

-- Clients can view claimants they created
CREATE POLICY IF NOT EXISTS "client_view_own_claimants"
ON claimants
FOR SELECT
USING (
  auth.uid() = created_by 
  AND auth.jwt()->>'role' = 'client'
);

-- Public read access to app_settings marked as public
CREATE POLICY IF NOT EXISTS "public_app_settings_read"
ON app_settings
FOR SELECT
USING (is_public = true);

-- Trace conversations: users can view their own
CREATE POLICY IF NOT EXISTS "user_view_own_conversations"
ON trace_conversations
FOR SELECT
USING (
  auth.uid() = created_by 
  OR auth.jwt()->>'role' IN ('admin', 'system_admin')
);

-- Trace messages: can view if conversation is accessible
CREATE POLICY IF NOT EXISTS "user_view_conversation_messages"
ON trace_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM trace_conversations 
    WHERE id = trace_messages.conversation_id 
    AND (created_by = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'system_admin'))
  )
);

-- Claim notes: can view if associated claimant is accessible
CREATE POLICY IF NOT EXISTS "user_view_claimant_notes"
ON claim_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM claimants 
    WHERE id = claim_notes.claimant_id 
    AND (created_by = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'system_admin'))
  )
);

-- ============================================================================
-- SECTION 6: INDEXES FOR PERFORMANCE
-- Creates indexes only if they don't exist
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_claimants_state ON claimants(state);
CREATE INDEX IF NOT EXISTS idx_claimants_created_by ON claimants(created_by);
CREATE INDEX IF NOT EXISTS idx_reminders_claimant ON reminders(claimant_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_claimant ON payments(claimant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_contractor ON timesheets(contractor_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_week ON timesheets(week_start);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_claimant ON tasks(claimant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_trace_history_claimant ON trace_history(claimant_id);
CREATE INDEX IF NOT EXISTS idx_trace_history_created_at ON trace_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_notes_claimant ON claim_notes(claimant_id);
CREATE INDEX IF NOT EXISTS idx_trace_messages_conversation ON trace_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_trace_tool_runs_conversation ON trace_tool_runs(conversation_id);

-- ============================================================================
-- SECTION 7: UPDATE TIMESTAMP TRIGGERS
-- Automatically updates updated_at column on row modification
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'claimants', 'reminders', 'email_templates', 'payments', 
      'timesheets', 'xero_sync', 'sms_templates', 'app_settings',
      'tasks', 'company_essentials', 'claim_notes', 'trace_conversations'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER IF NOT EXISTS update_%I_updated_at 
       BEFORE UPDATE ON %I 
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 8: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE claimants IS 'Core claimant records with PII';
COMMENT ON TABLE reminders IS 'Task reminders linked to claimants';
COMMENT ON TABLE pending_client_invites IS 'Pending user invitation tokens';
COMMENT ON TABLE activities IS 'System-wide activity audit log';
COMMENT ON TABLE email_templates IS 'Reusable email templates';
COMMENT ON TABLE payments IS 'Financial transaction records';
COMMENT ON TABLE timesheets IS 'Contractor timesheet submissions';
COMMENT ON TABLE messages IS 'Internal messaging system';
COMMENT ON TABLE xero_sync IS 'Xero integration sync state';
COMMENT ON TABLE sms_messages IS 'Outgoing SMS message log';
COMMENT ON TABLE sms_templates IS 'Reusable SMS templates';
COMMENT ON TABLE client_messages IS 'Client-facing communications';
COMMENT ON TABLE app_settings IS 'Global application configuration';
COMMENT ON TABLE tasks IS 'Work task assignments';
COMMENT ON TABLE company_essentials IS 'Company master information';
COMMENT ON TABLE trace_history IS 'Tracer AI execution audit trail';
COMMENT ON TABLE claim_notes IS 'Notes attached to claimants';
COMMENT ON TABLE trace_conversations IS 'Tracer AI chat sessions';
COMMENT ON TABLE trace_messages IS 'Messages within Tracer conversations';
COMMENT ON TABLE trace_tool_runs IS 'AI tool execution logs';

-- ============================================================================
-- VERIFICATION QUERIES (Commented out - run manually for validation)
-- ============================================================================

/*
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )
ORDER BY tablename;

-- Count policies per table
SELECT 
  tablename, 
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Show all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- ============================================================================
-- [AUTO-GEN-END]
-- Migration Complete
-- All tables created with RLS enabled
-- No existing data modified or deleted
-- ============================================================================
