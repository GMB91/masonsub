# 🔐 Supabase RLS Quick Reference - Mason Vector

## Role Hierarchy

```
system_admin    → Full access to everything
    ↓
admin           → Read/Write operational tables
    ↓
manager         → Assigned tasks & claimants
    ↓
contractor      → Own timesheets & messages
    ↓
client          → Own data only (read-only)
```

## 📋 Table-Level Access Matrix

| Table | system_admin | admin | manager | contractor | client |
|-------|--------------|-------|---------|------------|--------|
| claimants | ✅ All | ✅ Read/Write | ✅ Assigned | ❌ | ✅ Own |
| reminders | ✅ All | ✅ Read/Write | ✅ Assigned | ❌ | ❌ |
| pending_client_invites | ✅ All | ❌ | ❌ | ❌ | ❌ |
| activities | ✅ All | ✅ Read/Write | ❌ | ❌ | ✅ Own |
| email_templates | ✅ All | ❌ | ❌ | ❌ | ❌ |
| payments | ✅ All | ✅ Read/Write | ❌ | ❌ | ❌ |
| timesheets | ✅ All | ✅ Read/Write | ❌ | ✅ Own | ❌ |
| messages | ✅ All | ❌ | ❌ | ✅ Send/Receive | ❌ |
| xero_sync | ✅ All | ❌ | ❌ | ❌ | ❌ |
| sms_messages | ✅ All | ❌ | ❌ | ❌ | ❌ |
| sms_templates | ✅ All | ❌ | ❌ | ❌ | ❌ |
| client_messages | ✅ All | ❌ | ❌ | ❌ | ✅ Own |
| app_settings | ✅ All | ❌ | ❌ | ❌ | ✅ Public only |
| tasks | ✅ All | ✅ Read/Write | ✅ Assigned | ❌ | ❌ |
| company_essentials | ✅ All | ❌ | ❌ | ❌ | ❌ |
| trace_history | ✅ All | ✅ Read/Write | ❌ | ❌ | ❌ |
| claim_notes | ✅ All | ✅ Read/Write | ❌ | ❌ | ❌ |
| trace_conversations | ✅ All | ✅ Read/Write | ❌ | ❌ | ✅ Own |
| trace_messages | ✅ All | ✅ Read/Write | ❌ | ❌ | ✅ Via conversation |
| trace_tool_runs | ✅ All | ❌ | ❌ | ❌ | ❌ |

## 🔑 Policy Patterns

### Pattern 1: System Admin Full Access
```sql
CREATE POLICY "system_admin_full_access"
ON table_name FOR ALL
USING (auth.jwt()->>'role' = 'system_admin');
```

### Pattern 2: Admin Operational Access
```sql
CREATE POLICY "admin_operational_access"
ON table_name FOR SELECT, INSERT, UPDATE
USING (auth.jwt()->>'role' IN ('admin', 'system_admin'));
```

### Pattern 3: Own Records Only
```sql
CREATE POLICY "user_own_records"
ON table_name FOR ALL
USING (
  auth.uid() = created_by 
  AND auth.jwt()->>'role' IN ('client', 'admin', 'system_admin')
);
```

### Pattern 4: Assigned Tasks
```sql
CREATE POLICY "manager_assigned_tasks"
ON tasks FOR ALL
USING (
  auth.uid() = assigned_to 
  AND auth.jwt()->>'role' IN ('manager', 'admin', 'system_admin')
);
```

### Pattern 5: Public Read Access
```sql
CREATE POLICY "public_settings_read"
ON app_settings FOR SELECT
USING (is_public = true);
```

## 🧪 Testing RLS Policies

### Test as System Admin
```sql
SET ROLE authenticated;
SET request.jwt.claims TO '{"role":"system_admin", "sub":"test-user-id"}';

-- Should return all records
SELECT COUNT(*) FROM claimants;
SELECT COUNT(*) FROM payments;
```

### Test as Admin
```sql
SET request.jwt.claims TO '{"role":"admin", "sub":"admin-user-id"}';

-- Should work
SELECT * FROM claimants;
INSERT INTO claimants (full_name, state) VALUES ('Test', 'NSW');

-- Should fail (no delete permission)
DELETE FROM claimants WHERE id = 'some-id';
```

### Test as Client
```sql
SET request.jwt.claims TO '{"role":"client", "sub":"client-user-id"}';

-- Should only see own records
SELECT * FROM claimants WHERE created_by = 'client-user-id';

-- Should fail (not own record)
SELECT * FROM claimants WHERE created_by != 'client-user-id';
```

### Test as Contractor
```sql
SET request.jwt.claims TO '{"role":"contractor", "sub":"contractor-user-id"}';

-- Should see own timesheets
SELECT * FROM timesheets WHERE contractor_id = 'contractor-user-id';

-- Should fail (not own timesheet)
SELECT * FROM timesheets WHERE contractor_id != 'contractor-user-id';
```

### Reset Testing Session
```sql
RESET ROLE;
RESET request.jwt.claims;
```

## 🚨 Common RLS Issues

### Issue: "new row violates row-level security policy"
**Cause:** User doesn't have INSERT permission  
**Fix:** Add INSERT to policy or check role claim

### Issue: "permission denied for table"
**Cause:** No policy matches user's role  
**Fix:** Create appropriate policy for that role

### Issue: "infinite recursion detected"
**Cause:** Policy USING clause references same table  
**Fix:** Use WITH CHECK instead or simplify logic

### Issue: "could not serialize access"
**Cause:** Multiple policies conflicting  
**Fix:** Consolidate policies or use PERMISSIVE

## 📝 Adding New Tables

```sql
-- 1. Create table
CREATE TABLE new_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 3. Add system_admin policy
CREATE POLICY "system_admin_full_access_new_table"
ON new_table FOR ALL
USING (auth.jwt()->>'role' = 'system_admin');

-- 4. Add role-specific policies
CREATE POLICY "user_own_records_new_table"
ON new_table FOR ALL
USING (auth.uid() = created_by);
```

## 🔍 Debugging Policies

### Show all policies for a table
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'claimants';
```

### Check if RLS is enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'claimants';
```

### Test specific policy
```sql
-- Check USING clause
SELECT pg_get_expr(polqual, polrelid) 
FROM pg_policy 
WHERE polname = 'system_admin_full_access_claimants';
```

## 🎯 Best Practices

1. **Always enable RLS** on every table with sensitive data
2. **Start restrictive** - give system_admin access first, then add role-specific policies
3. **Test policies** with different role claims before deployment
4. **Document policies** - comment why each policy exists
5. **Use role hierarchy** - leverage IN ('role1', 'role2') for inheritance
6. **Audit regularly** - check for tables without policies
7. **Never disable RLS** in production without explicit reason

## 📞 Quick Commands

```sql
-- List all tables without RLS
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;

-- Count policies per table
SELECT tablename, COUNT(*) FROM pg_policies 
GROUP BY tablename ORDER BY count DESC;

-- Show policy details
SELECT tablename, policyname, cmd, qual 
FROM pg_policy JOIN pg_class ON polrelid = oid;

-- Drop policy safely
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Disable RLS temporarily (DANGER!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

---

**Migration File:** `supabase/migrations/20251105000000_safe_schema_complete.sql`  
**Verification:** `supabase/verify_migration.sql`  
**Full Guide:** `supabase/MIGRATION_GUIDE.md`
