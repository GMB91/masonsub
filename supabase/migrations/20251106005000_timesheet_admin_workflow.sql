-- =============================================
-- Mason Vector Timesheet Admin Workflow Automation (v3)
-- Weekly rhythm automation with state management and Xero integration
-- =============================================

-- 1️⃣ Enhanced Timesheet Schema with Status Management

-- Add status column and retry tracking to existing timesheets table
ALTER TABLE timesheets 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS export_retry_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(64),
ADD COLUMN IF NOT EXISTS rejected_note TEXT,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);

-- Create status enum constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timesheets_status_check') THEN
    ALTER TABLE timesheets ADD CONSTRAINT timesheets_status_check 
    CHECK (status IN ('draft', 'pending', 'approved', 'exported', 'needs_fix', 'paid'));
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_timesheets_status_week ON timesheets(status, week_start);
CREATE INDEX IF NOT EXISTS idx_timesheets_retry_count ON timesheets(export_retry_count);
CREATE INDEX IF NOT EXISTS idx_timesheets_idempotency ON timesheets(idempotency_key);

-- Add user notification preferences
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friday_reminder_enabled BOOLEAN DEFAULT TRUE,
  approval_notification_enabled BOOLEAN DEFAULT TRUE,
  rejection_notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 2️⃣ Weekly Automation Functions

-- Function: Friday reminder job (16:00 AEST)
CREATE OR REPLACE FUNCTION send_friday_reminders()
RETURNS TABLE(users_notified INT, total_draft_hours NUMERIC) AS $$
DECLARE
  notification_count INT := 0;
  total_hours NUMERIC := 0;
  user_record RECORD;
BEGIN
  -- Get users with draft timesheet entries for current week
  FOR user_record IN
    SELECT DISTINCT 
      te.user_id, 
      u.email, 
      u.full_name,
      SUM(COALESCE(te.total_hours, 0)) as week_hours,
      COUNT(te.id) as entry_count
    FROM timesheet_entries te
    JOIN users u ON u.id = te.user_id
    LEFT JOIN user_notification_settings uns ON uns.user_id = te.user_id
    WHERE te.date >= date_trunc('week', (now() AT TIME ZONE 'Australia/Brisbane')::timestamp)
      AND te.date < date_trunc('week', (now() AT TIME ZONE 'Australia/Brisbane')::timestamp) + INTERVAL '7 days'
      AND te.submitted = FALSE
      AND u.role IN ('user', 'manager', 'contractor')
      AND COALESCE(uns.friday_reminder_enabled, TRUE) = TRUE
    GROUP BY te.user_id, u.email, u.full_name
  LOOP
    -- Create notification for each user
    INSERT INTO system_notifications (
      type, 
      title, 
      message, 
      recipient_id,
      data,
      created_at
    ) VALUES (
      'timesheet_reminder',
      'Review Your Timesheet - Week Ending Soon',
      'Please review and submit your timesheet by Monday 8:00 AM AEST. Current week: ' || user_record.week_hours || ' hours.',
      user_record.user_id,
      jsonb_build_object(
        'week_hours', user_record.week_hours,
        'entry_count', user_record.entry_count,
        'deadline', 'Monday 8:00 AM AEST',
        'action_url', '/timesheets?week=' || date_trunc('week', now() AT TIME ZONE 'Australia/Brisbane')::date
      ),
      NOW()
    );

    -- Log reminder sent
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, -- System user
      'TIMESHEET_REMINDER_SENT', 
      'timesheet_entries',
      jsonb_build_object(
        'user_id', user_record.user_id,
        'week_hours', user_record.week_hours,
        'entry_count', user_record.entry_count
      ),
      NOW()
    );

    notification_count := notification_count + 1;
    total_hours := total_hours + user_record.week_hours;
  END LOOP;

  -- Set global reminder flag for UI banners
  INSERT INTO admin_settings (key, value, description) 
  VALUES ('show_timesheet_nudge', 'true', 'Show timesheet reminder banner')
  ON CONFLICT (key) DO UPDATE SET 
    value = 'true', 
    updated_at = NOW();

  RETURN QUERY SELECT notification_count, total_hours;
END;
$$ LANGUAGE plpgsql;

-- Function: Monday auto-submit job (08:00 AEST)
CREATE OR REPLACE FUNCTION monday_auto_submit()
RETURNS TABLE(processed_timesheets INT, total_users INT) AS $$
DECLARE
  timesheet_count INT := 0;
  user_count INT := 0;
  user_record RECORD;
BEGIN
  -- Enhanced rollup with status management
  INSERT INTO timesheets (user_id, week_start, total_hours, claim_count, status, idempotency_key, created_at)
  SELECT
    te.user_id,
    date_trunc('week', te.date)::date AS week_start,
    ROUND(SUM(COALESCE(te.total_hours, 0))::numeric, 2) AS total_hours,
    COUNT(DISTINCT te.client_id) AS claim_count,
    'pending' AS status,
    encode(sha256((te.user_id::text || date_trunc('week', te.date)::date::text)::bytea), 'hex') AS idempotency_key,
    NOW()
  FROM timesheet_entries te
  WHERE te.submitted = FALSE
    AND te.total_hours > 0
    AND te.date < CURRENT_DATE  -- Only process complete days
    AND te.date >= date_trunc('week', CURRENT_DATE - INTERVAL '7 days') -- Last week only
  GROUP BY te.user_id, date_trunc('week', te.date)
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    total_hours = EXCLUDED.total_hours,
    claim_count = EXCLUDED.claim_count,
    status = 'pending';

  GET DIAGNOSTICS timesheet_count = ROW_COUNT;

  -- Mark entries as submitted
  UPDATE timesheet_entries
  SET submitted = TRUE
  WHERE submitted = FALSE
    AND total_hours > 0
    AND date < CURRENT_DATE
    AND date >= date_trunc('week', CURRENT_DATE - INTERVAL '7 days');

  -- Count unique users processed
  SELECT COUNT(DISTINCT user_id) INTO user_count
  FROM timesheets 
  WHERE week_start = date_trunc('week', CURRENT_DATE - INTERVAL '7 days')::date
    AND status = 'pending';

  -- Log auto-submit operation
  INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'TIMESHEET_AUTO_SUBMIT',
    'timesheets',
    jsonb_build_object(
      'processed_timesheets', timesheet_count,
      'affected_users', user_count,
      'week_start', date_trunc('week', CURRENT_DATE - INTERVAL '7 days')::date
    ),
    NOW()
  );

  -- Clear Friday reminder flag
  UPDATE admin_settings 
  SET value = 'false', updated_at = NOW() 
  WHERE key = 'show_timesheet_nudge';

  RETURN QUERY SELECT timesheet_count, user_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Monday admin digest (08:15 AEST)
CREATE OR REPLACE FUNCTION send_admin_digest()
RETURNS TABLE(pending_count INT, total_hours NUMERIC) AS $$
DECLARE
  digest_count INT := 0;
  digest_hours NUMERIC := 0;
  admin_record RECORD;
BEGIN
  -- Get pending approval statistics
  SELECT 
    COUNT(*)::INT, 
    COALESCE(SUM(total_hours), 0)
  INTO digest_count, digest_hours
  FROM timesheets t
  WHERE t.approved = FALSE
    AND t.status = 'pending'
    AND t.week_start = date_trunc('week', CURRENT_DATE - INTERVAL '7 days')::date;

  -- Send digest to all admins
  FOR admin_record IN
    SELECT id, email, full_name 
    FROM users 
    WHERE role = 'admin' 
      AND status = 'active'
  LOOP
    INSERT INTO system_notifications (
      type, 
      title, 
      message, 
      recipient_id,
      data,
      created_at
    ) VALUES (
      'admin_timesheet_digest',
      'Timesheets Pending Approval - Week of ' || (CURRENT_DATE - INTERVAL '7 days')::date,
      digest_count || ' timesheets pending approval totaling ' || digest_hours || ' hours.',
      admin_record.id,
      jsonb_build_object(
        'pending_count', digest_count,
        'total_hours', digest_hours,
        'week_start', date_trunc('week', CURRENT_DATE - INTERVAL '7 days')::date,
        'action_url', '/admin/timesheets?week=' || (CURRENT_DATE - INTERVAL '7 days')::date || '&status=pending'
      ),
      NOW()
    );
  END LOOP;

  -- Log digest sent
  INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'TIMESHEET_DIGEST_SENT',
    'timesheets',
    jsonb_build_object(
      'pending_count', digest_count,
      'total_hours', digest_hours,
      'admin_count', (SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active')
    ),
    NOW()
  );

  RETURN QUERY SELECT digest_count, digest_hours;
END;
$$ LANGUAGE plpgsql;

-- 3️⃣ Admin Action Functions

-- Function: Approve timesheet(s) - supports bulk operations
CREATE OR REPLACE FUNCTION approve_timesheets(
  timesheet_ids INT[],
  approver_id UUID
)
RETURNS TABLE(approved_count INT, total_hours NUMERIC, xero_jobs_created INT) AS $$
DECLARE
  approval_count INT := 0;
  hours_total NUMERIC := 0;
  xero_count INT := 0;
  timesheet_record RECORD;
BEGIN
  -- Process each timesheet
  FOR timesheet_record IN
    SELECT * FROM timesheets 
    WHERE id = ANY(timesheet_ids) 
      AND status = 'pending'
  LOOP
    -- Update timesheet status
    UPDATE timesheets 
    SET 
      approved = TRUE,
      approved_at = NOW(),
      approved_by = approver_id,
      status = 'approved'
    WHERE id = timesheet_record.id;

    -- Create Xero export job notification
    INSERT INTO system_notifications (
      type, 
      title, 
      message, 
      data,
      created_at
    ) VALUES (
      'xero_export_job',
      'Timesheet Ready for Xero Export',
      'Timesheet ' || timesheet_record.id || ' approved and queued for payroll export',
      jsonb_build_object(
        'timesheet_id', timesheet_record.id,
        'user_id', timesheet_record.user_id,
        'total_hours', timesheet_record.total_hours,
        'week_start', timesheet_record.week_start,
        'idempotency_key', timesheet_record.idempotency_key
      ),
      NOW()
    );

    -- Log approval
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      approver_id,
      'TIMESHEET_APPROVED',
      'timesheets',
      jsonb_build_object(
        'timesheet_id', timesheet_record.id,
        'user_id', timesheet_record.user_id,
        'total_hours', timesheet_record.total_hours,
        'week_start', timesheet_record.week_start
      ),
      NOW()
    );

    approval_count := approval_count + 1;
    hours_total := hours_total + timesheet_record.total_hours;
    xero_count := xero_count + 1;
  END LOOP;

  RETURN QUERY SELECT approval_count, hours_total, xero_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Reject timesheet with note
CREATE OR REPLACE FUNCTION reject_timesheet(
  timesheet_id INT,
  rejector_id UUID,
  rejection_note TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  timesheet_record RECORD;
  success BOOLEAN := FALSE;
BEGIN
  -- Get timesheet details
  SELECT * INTO timesheet_record 
  FROM timesheets 
  WHERE id = timesheet_id AND status = 'pending';

  IF FOUND THEN
    -- Update timesheet status
    UPDATE timesheets 
    SET 
      status = 'needs_fix',
      rejected_at = NOW(),
      rejected_by = rejector_id,
      rejected_note = rejection_note
    WHERE id = timesheet_id;

    -- Reopen timesheet entries for editing
    UPDATE timesheet_entries
    SET submitted = FALSE
    WHERE user_id = timesheet_record.user_id
      AND date >= timesheet_record.week_start
      AND date < timesheet_record.week_start + INTERVAL '7 days';

    -- Notify user
    INSERT INTO system_notifications (
      type, 
      title, 
      message, 
      recipient_id,
      data,
      created_at
    ) VALUES (
      'timesheet_rejected',
      'Timesheet Requires Changes - Week of ' || timesheet_record.week_start,
      'Your timesheet has been returned for revision. Note: ' || rejection_note,
      timesheet_record.user_id,
      jsonb_build_object(
        'timesheet_id', timesheet_id,
        'rejection_note', rejection_note,
        'action_url', '/timesheets?week=' || timesheet_record.week_start,
        'week_start', timesheet_record.week_start
      ),
      NOW()
    );

    -- Log rejection
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      rejector_id,
      'TIMESHEET_REJECTED',
      'timesheets',
      jsonb_build_object(
        'timesheet_id', timesheet_id,
        'user_id', timesheet_record.user_id,
        'rejection_note', rejection_note,
        'week_start', timesheet_record.week_start
      ),
      NOW()
    );

    success := TRUE;
  END IF;

  RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Function: Record Xero export success
CREATE OR REPLACE FUNCTION record_xero_export_success(
  timesheet_id INT,
  xero_timesheet_id VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE timesheets 
  SET 
    exported_to_xero = TRUE,
    xero_timesheet_id = xero_timesheet_id,
    status = 'exported',
    export_retry_count = 0
  WHERE id = timesheet_id;

  -- Log success
  INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'XERO_EXPORT_OK',
    'timesheets',
    jsonb_build_object(
      'timesheet_id', timesheet_id,
      'xero_timesheet_id', xero_timesheet_id
    ),
    NOW()
  );

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Record Xero export failure with retry logic
CREATE OR REPLACE FUNCTION record_xero_export_failure(
  timesheet_id INT,
  error_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_retry_count INT;
  max_retries INT := 3;
BEGIN
  -- Increment retry count
  UPDATE timesheets 
  SET export_retry_count = export_retry_count + 1
  WHERE id = timesheet_id
  RETURNING export_retry_count INTO current_retry_count;

  -- If max retries exceeded, mark as needs_fix
  IF current_retry_count >= max_retries THEN
    UPDATE timesheets 
    SET status = 'needs_fix'
    WHERE id = timesheet_id;
  END IF;

  -- Log failure
  INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'XERO_EXPORT_FAIL',
    'timesheets',
    jsonb_build_object(
      'timesheet_id', timesheet_id,
      'error_message', error_message,
      'retry_count', current_retry_count,
      'max_retries_exceeded', current_retry_count >= max_retries
    ),
    NOW()
  );

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 4️⃣ Admin Dashboard Views

-- Materialized view for fast admin dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_timesheets_admin_dashboard AS
SELECT 
  t.id,
  t.user_id,
  u.full_name,
  u.email,
  t.week_start,
  t.total_hours,
  t.claim_count,
  t.status,
  t.approved,
  t.approved_at,
  t.approved_by,
  t.exported_to_xero,
  t.export_retry_count,
  t.rejected_note,
  t.created_at,
  CASE 
    WHEN t.total_hours > 80 THEN 'overtime_alert'
    WHEN t.export_retry_count > 0 THEN 'export_issue'
    WHEN t.status = 'needs_fix' THEN 'needs_attention'
    ELSE 'normal'
  END as alert_level
FROM timesheets t
JOIN users u ON u.id = t.user_id
WHERE t.week_start >= CURRENT_DATE - INTERVAL '4 weeks'
ORDER BY t.week_start DESC, t.created_at DESC;

-- Create indexes on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS mv_timesheets_admin_dashboard_id 
ON mv_timesheets_admin_dashboard(id);

CREATE INDEX IF NOT EXISTS mv_timesheets_admin_dashboard_status_week 
ON mv_timesheets_admin_dashboard(status, week_start);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_admin_dashboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_timesheets_admin_dashboard;
END;
$$ LANGUAGE plpgsql;

-- 5️⃣ Automated Job Scheduling Configuration

-- Insert cron job configurations
INSERT INTO admin_settings (key, value, description) VALUES
('timesheet_friday_reminder_enabled', 'true', 'Enable Friday 4PM timesheet reminders'),
('timesheet_friday_reminder_time', '16:00', 'Time for Friday reminders (AEST)'),
('timesheet_monday_autosubmit_enabled', 'true', 'Enable Monday 8AM auto-submission'),
('timesheet_monday_autosubmit_time', '08:00', 'Time for Monday auto-submission (AEST)'),
('timesheet_monday_digest_enabled', 'true', 'Enable Monday admin digest'),
('timesheet_monday_digest_time', '08:15', 'Time for Monday admin digest (AEST)'),
('xero_integration_enabled', 'true', 'Enable Xero payroll integration'),
('xero_max_retry_attempts', '3', 'Maximum Xero export retry attempts'),
('timesheet_max_weekly_hours', '80', 'Alert threshold for weekly hours'),
('timesheet_dashboard_refresh_enabled', 'true', 'Enable automatic dashboard refresh')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Grant permissions for automation functions
GRANT EXECUTE ON FUNCTION send_friday_reminders() TO service_role;
GRANT EXECUTE ON FUNCTION monday_auto_submit() TO service_role;
GRANT EXECUTE ON FUNCTION send_admin_digest() TO service_role;
GRANT EXECUTE ON FUNCTION approve_timesheets(INT[], UUID) TO service_role;
GRANT EXECUTE ON FUNCTION reject_timesheet(INT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION record_xero_export_success(INT, VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION record_xero_export_failure(INT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION refresh_admin_dashboard() TO service_role;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE 'Mason Vector Timesheet Admin Workflow Automation (v3) completed successfully';
  RAISE NOTICE 'Weekly rhythm automation: Friday reminders, Monday auto-submit, admin digest';
  RAISE NOTICE 'Status management: draft → pending → approved → exported → paid';
  RAISE NOTICE 'Xero integration pipeline with retry logic and error handling';
  RAISE NOTICE 'Admin dashboard with materialized view for performance';
END $$;