-- ============================================================================
-- Quick Verification Script
-- Run this in Supabase SQL Editor AFTER applying the migration
-- ============================================================================

-- 1. Check all required tables exist
SELECT 
  'Tables Created' as check_type,
  COUNT(*) as actual_count,
  20 as expected_count,
  CASE 
    WHEN COUNT(*) = 20 THEN '✅ PASS'
    ELSE '❌ FAIL - Missing tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  );

-- 2. Check RLS is enabled on all tables
SELECT 
  'RLS Enabled' as check_type,
  COUNT(*) as actual_count,
  20 as expected_count,
  CASE 
    WHEN COUNT(*) = 20 THEN '✅ PASS'
    ELSE '❌ FAIL - RLS not enabled on all tables'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
  AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  );

-- 3. Check minimum policies exist (at least 1 per table)
SELECT 
  'RLS Policies' as check_type,
  COUNT(DISTINCT tablename) as tables_with_policies,
  20 as expected_tables,
  CASE 
    WHEN COUNT(DISTINCT tablename) >= 20 THEN '✅ PASS'
    ELSE '❌ FAIL - Not all tables have policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  );

-- 4. List all tables with their RLS status
SELECT 
  t.table_name,
  CASE WHEN pt.rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status,
  COALESCE(p.policy_count, 0) as policy_count
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = 'public'
LEFT JOIN (
  SELECT tablename, COUNT(*) as policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
) p ON p.tablename = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )
ORDER BY t.table_name;

-- 5. Show policy details for each table
SELECT 
  tablename,
  policyname,
  CASE cmd
    WHEN '*' THEN 'ALL'
    ELSE cmd::text
  END as operations,
  CASE 
    WHEN policyname LIKE '%system_admin%' THEN 'System Admin'
    WHEN policyname LIKE '%admin%' THEN 'Admin'
    WHEN policyname LIKE '%manager%' THEN 'Manager'
    WHEN policyname LIKE '%contractor%' THEN 'Contractor'
    WHEN policyname LIKE '%client%' THEN 'Client'
    WHEN policyname LIKE '%user%' THEN 'User'
    ELSE 'Other'
  END as role_level
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )
ORDER BY tablename, role_level;

-- 6. Check for any tables without policies (security risk!)
SELECT 
  t.table_name,
  '❌ NO POLICIES!' as warning
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
  AND t.table_name IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )
  AND p.policyname IS NULL;

-- 7. Verify critical indexes exist
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('claimants', 'tasks', 'trace_history', 'payments', 'timesheets')
ORDER BY tablename, indexname;

-- 8. Summary Report
SELECT 
  '================================' as separator,
  '✅ MIGRATION VERIFICATION COMPLETE' as status,
  '================================' as separator2
UNION ALL
SELECT 
  'Total Tables',
  (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )),
  'Expected: 20'
UNION ALL
SELECT 
  'Tables with RLS',
  (SELECT COUNT(*)::text FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )),
  'Expected: 20'
UNION ALL
SELECT 
  'Total RLS Policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public' AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )),
  'Expected: 30+'
UNION ALL
SELECT 
  'Total Indexes',
  (SELECT COUNT(*)::text FROM pg_indexes WHERE schemaname = 'public' AND tablename IN (
    'claimants', 'reminders', 'pending_client_invites', 'activities',
    'email_templates', 'payments', 'timesheets', 'messages', 'xero_sync',
    'sms_messages', 'sms_templates', 'client_messages', 'app_settings',
    'tasks', 'company_essentials', 'trace_history', 'claim_notes',
    'trace_conversations', 'trace_messages', 'trace_tool_runs'
  )),
  'Expected: 20+';
