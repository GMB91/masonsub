# Supabase Schema Migration - Verification & Execution Guide

## 🎯 Migration Overview

**File:** `20251105000000_safe_schema_complete.sql`  
**Strategy:** Non-destructive, additive only  
**Status:** Ready for execution  

### What This Migration Does ✅

1. **Creates 20+ Core Tables** (only if missing):
   - `claimants`, `reminders`, `pending_client_invites`
   - `activities`, `email_templates`, `payments`
   - `timesheets`, `messages`, `xero_sync`
   - `sms_messages`, `sms_templates`, `client_messages`
   - `app_settings`, `tasks`, `company_essentials`
   - `trace_history`, `claim_notes`
   - `trace_conversations`, `trace_messages`, `trace_tool_runs`

2. **Enables RLS** on all tables
3. **Creates Role-Based Policies**:
   - `system_admin` → Full access to all tables
   - `admin` → Operational access (read/write)
   - `manager` → Task and claimant access
   - `contractor` → Own timesheets
   - `client` → Own data only

4. **Adds Performance Indexes**
5. **Implements Auto-Update Triggers** for `updated_at` columns

### What This Migration Does NOT Do 🛡️

- ❌ Drop or truncate any tables
- ❌ Remove or rename columns
- ❌ Delete existing data
- ❌ Replace existing RLS policies
- ❌ Modify existing schemas

---

## 📋 Pre-Execution Checklist

### 1. Backup Current Database
```sql
-- Run in Supabase SQL Editor to export schema
pg_dump --schema-only --no-owner --no-privileges
```

### 2. Verify Existing Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 3. Check Current RLS Status
```sql
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🚀 Execution Methods

### Method 1: Supabase Dashboard (Recommended)

1. **Navigate to SQL Editor**:
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Click "New Query"

2. **Copy Migration Content**:
   - Open `supabase/migrations/20251105000000_safe_schema_complete.sql`
   - Copy entire file contents
   - Paste into SQL Editor

3. **Execute**:
   - Click "Run" button
   - Monitor output for errors
   - Verify success messages

### Method 2: Supabase CLI

```bash
# From MasonApp directory
cd "C:\Mason Vector\MasonApp"

# Apply migration
supabase migration up

# Or apply specific migration
supabase db push
```

### Method 3: Direct psql Connection

```bash
# Connect to Supabase database
psql "postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"

# Run migration
\i supabase/migrations/20251105000000_safe_schema_complete.sql
```

---

## ✅ Post-Execution Verification

### 1. Verify All Tables Created
```sql
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
```

**Expected Result:** 20 tables listed

### 2. Verify RLS Enabled
```sql
SELECT 
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
```

**Expected Result:** All tables show `rowsecurity = true`

### 3. Count RLS Policies
```sql
SELECT 
  tablename, 
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected Result:** Each table has 1-3 policies

### 4. Test Role Access

```sql
-- Test system_admin access
SET ROLE authenticated;
SET request.jwt.claims TO '{"role":"system_admin"}';
SELECT COUNT(*) FROM claimants; -- Should work

-- Test admin access
SET request.jwt.claims TO '{"role":"admin"}';
SELECT COUNT(*) FROM claimants; -- Should work

-- Test client access (should fail without matching created_by)
SET request.jwt.claims TO '{"role":"client"}';
SELECT COUNT(*) FROM claimants; -- Should return 0 or only own records

-- Reset
RESET ROLE;
```

---

## 🔍 Troubleshooting

### Issue: "relation already exists"
**Solution:** This is expected! The migration uses `CREATE TABLE IF NOT EXISTS`, so existing tables are safely skipped.

### Issue: "policy already exists"
**Solution:** The migration checks for existing policies before creating. Safe to ignore.

### Issue: "permission denied"
**Solution:** Ensure you're running as database owner or with sufficient privileges:
```sql
-- Check current role
SELECT current_user, current_role;

-- Grant necessary privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Issue: "column already exists"
**Solution:** The migration uses conditional column additions. Existing columns are preserved.

---

## 📊 Expected Schema State

### Tables Created: 20
- **Core:** claimants, tasks, activities, claim_notes
- **Communication:** messages, client_messages, sms_messages, email_templates, sms_templates
- **Financial:** payments, timesheets, xero_sync
- **Admin:** app_settings, company_essentials, pending_client_invites, reminders
- **Tracer AI:** trace_history, trace_conversations, trace_messages, trace_tool_runs

### RLS Policies: 30+
- **System Admin:** Full access to all 20 tables
- **Admin:** Operational access to 9 core tables
- **Fine-grained:** 7 role-specific policies (contractors, clients, managers, users)

### Indexes: 20+
- **Performance:** Covering common query patterns
- **Relationships:** Foreign key indexes
- **Time-series:** Created_at DESC indexes

### Triggers: 12+
- **Auto-update:** `updated_at` timestamp triggers on 12 tables

---

## 🎯 Success Criteria

✅ **All 20 tables exist**  
✅ **RLS enabled on every table**  
✅ **Minimum 1 policy per table**  
✅ **No existing data lost**  
✅ **No dropped columns**  
✅ **No errors in Supabase logs**  

---

## 🔐 Security Validation

### Test System Admin Access
```sql
-- Should succeed
SELECT * FROM claimants WHERE auth.jwt()->>'role' = 'system_admin';
SELECT * FROM payments WHERE auth.jwt()->>'role' = 'system_admin';
```

### Test Client Isolation
```sql
-- Client should only see own data
SELECT * FROM claimants 
WHERE created_by = auth.uid() 
  AND auth.jwt()->>'role' = 'client';
```

### Test Contractor Timesheet Access
```sql
-- Contractor should only access own timesheets
SELECT * FROM timesheets 
WHERE contractor_id = auth.uid() 
  AND auth.jwt()->>'role' = 'contractor';
```

---

## 📝 Rollback Plan (If Needed)

**This migration is additive-only**, but if you need to rollback:

### Option 1: Drop New Tables (Nuclear)
```sql
-- WARNING: Only use if you want to remove ALL newly created tables
DROP TABLE IF EXISTS trace_tool_runs CASCADE;
DROP TABLE IF EXISTS trace_messages CASCADE;
DROP TABLE IF EXISTS trace_conversations CASCADE;
DROP TABLE IF EXISTS claim_notes CASCADE;
-- ... continue for all tables
```

### Option 2: Disable RLS (Temporary)
```sql
-- Temporarily disable RLS for testing
ALTER TABLE claimants DISABLE ROW LEVEL SECURITY;
-- Re-enable when ready
ALTER TABLE claimants ENABLE ROW LEVEL SECURITY;
```

### Option 3: Remove Specific Policies
```sql
-- Remove specific policy if causing issues
DROP POLICY IF EXISTS "system_admin_full_access_claimants" ON claimants;
```

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **Migration File:** `supabase/migrations/20251105000000_safe_schema_complete.sql`
- **Verification Queries:** Included at end of migration file (commented)

---

**Migration Status:** ✅ Ready for Production  
**Safety Level:** 🟢 Non-Destructive  
**Review Status:** ✅ Follows Mason Vector Safety Rules
