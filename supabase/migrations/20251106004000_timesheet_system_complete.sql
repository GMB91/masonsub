-- =============================================
-- Mason Vector Timesheet System (v2)
-- Event-driven timesheet automation with audit_logs integration
-- =============================================

-- 1️⃣ Core Timesheet Tables

-- timesheet_entries: Daily-level user activity tracking
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES claimants(id),
  date DATE DEFAULT CURRENT_DATE,
  start_time TIMESTAMP DEFAULT NOW(),
  finish_time TIMESTAMP,
  total_hours NUMERIC(6,2),
  auto_generated BOOLEAN DEFAULT TRUE,
  submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one entry per user per day
  UNIQUE(user_id, date)
);

-- timesheets: Weekly summaries for admin approval and Xero export
CREATE TABLE IF NOT EXISTS timesheets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE,
  total_hours NUMERIC(6,2),
  claim_count INT,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  exported_to_xero BOOLEAN DEFAULT FALSE,
  xero_timesheet_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one timesheet per user per week
  UNIQUE(user_id, week_start)
);

-- timesheet_notes: Daily editable notes per entry
CREATE TABLE IF NOT EXISTS timesheet_notes (
  id SERIAL PRIMARY KEY,
  entry_id INT REFERENCES timesheet_entries(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_user_date ON timesheet_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_client ON timesheet_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_user_week ON timesheets(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_timesheets_approved ON timesheets(approved, approved_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_action ON audit_logs(actor_id, action);

-- 2️⃣ Event-Driven Trigger Functions

-- Trigger 1: Start timesheet entry on first client file access
CREATE OR REPLACE FUNCTION start_timesheet_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for client file access by users/managers
  IF NEW.action = 'ACCESS_CLIENT_FILE' AND NEW.actor_id IS NOT NULL THEN
    INSERT INTO timesheet_entries (user_id, client_id, date, start_time)
    VALUES (
      NEW.actor_id, 
      (NEW.details->>'client_id')::uuid, 
      CURRENT_DATE, 
      NOW()
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      updated_at = NOW(),
      client_id = COALESCE(timesheet_entries.client_id, EXCLUDED.client_id);

    -- Log the auto-creation
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      NEW.actor_id, 
      'TIMESHEET_AUTO_START', 
      'timesheet_entries', 
      '{"event":"auto_start","date":"' || CURRENT_DATE || '"}', 
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 2: Finish timesheet entry on logout
CREATE OR REPLACE FUNCTION finish_timesheet_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action IN ('LOGOUT', 'SESSION_TIMEOUT') AND NEW.actor_id IS NOT NULL THEN
    UPDATE timesheet_entries
    SET 
      finish_time = NOW(),
      total_hours = EXTRACT(EPOCH FROM (NOW() - start_time)) / 3600,
      updated_at = NOW()
    WHERE user_id = NEW.actor_id
      AND date = CURRENT_DATE
      AND finish_time IS NULL;

    -- Log the auto-finish
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      NEW.actor_id, 
      'TIMESHEET_AUTO_FINISH', 
      'timesheet_entries', 
      '{"event":"' || NEW.action || '","date":"' || CURRENT_DATE || '"}', 
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 3: Handle manual timesheet edits
CREATE OR REPLACE FUNCTION log_timesheet_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- Log manual edits (not auto-generated changes)
  IF OLD.start_time IS DISTINCT FROM NEW.start_time OR 
     OLD.finish_time IS DISTINCT FROM NEW.finish_time THEN
    
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      NEW.user_id, 
      'TIMESHEET_EDIT', 
      'timesheet_entries', 
      jsonb_build_object(
        'entry_id', NEW.id,
        'old_start', OLD.start_time,
        'new_start', NEW.start_time,
        'old_finish', OLD.finish_time,
        'new_finish', NEW.finish_time
      ), 
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3️⃣ Create Database Triggers

DROP TRIGGER IF EXISTS timesheet_start_trigger ON audit_logs;
CREATE TRIGGER timesheet_start_trigger
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION start_timesheet_entry();

DROP TRIGGER IF EXISTS timesheet_finish_trigger ON audit_logs;
CREATE TRIGGER timesheet_finish_trigger
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION finish_timesheet_entry();

DROP TRIGGER IF EXISTS timesheet_edit_trigger ON timesheet_entries;
CREATE TRIGGER timesheet_edit_trigger
  AFTER UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION log_timesheet_edit();

-- 4️⃣ Weekly Roll-Up Functions

-- Function to rollup weekly timesheets
CREATE OR REPLACE FUNCTION rollup_timesheets()
RETURNS TABLE(processed_count INT) AS $$
DECLARE
  rollup_count INT := 0;
BEGIN
  -- Insert weekly summaries for unsubmitted entries
  INSERT INTO timesheets (user_id, week_start, total_hours, claim_count, created_at)
  SELECT
    te.user_id,
    date_trunc('week', te.date)::date AS week_start,
    ROUND(SUM(COALESCE(te.total_hours, 0))::numeric, 2) AS total_hours,
    COUNT(DISTINCT te.client_id) AS claim_count,
    NOW()
  FROM timesheet_entries te
  WHERE te.submitted = FALSE
    AND te.total_hours > 0
    AND te.date < CURRENT_DATE  -- Only process complete days
  GROUP BY te.user_id, date_trunc('week', te.date)
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    total_hours = EXCLUDED.total_hours,
    claim_count = EXCLUDED.claim_count;

  GET DIAGNOSTICS rollup_count = ROW_COUNT;

  -- Mark entries as submitted
  UPDATE timesheet_entries
  SET submitted = TRUE
  WHERE submitted = FALSE
    AND total_hours > 0
    AND date < CURRENT_DATE;

  -- Log the rollup operation
  INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- System user
    'TIMESHEET_ROLLUP', 
    'timesheets', 
    jsonb_build_object('processed_count', rollup_count), 
    NOW()
  );

  RETURN QUERY SELECT rollup_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get timesheet statistics
CREATE OR REPLACE FUNCTION get_timesheet_stats()
RETURNS TABLE(
  pending_entries INT,
  pending_approvals INT,
  total_hours_week NUMERIC,
  active_users INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INT FROM timesheet_entries WHERE submitted = FALSE),
    (SELECT COUNT(*)::INT FROM timesheets WHERE approved = FALSE),
    (SELECT COALESCE(SUM(total_hours), 0) FROM timesheets WHERE week_start = date_trunc('week', CURRENT_DATE)),
    (SELECT COUNT(DISTINCT user_id)::INT FROM timesheet_entries WHERE date >= CURRENT_DATE - INTERVAL '7 days')
  ;
END;
$$ LANGUAGE plpgsql;

-- 5️⃣ Xero Integration Functions

-- Function to handle timesheet approval and Xero notification
CREATE OR REPLACE FUNCTION approve_timesheet(
  timesheet_id INT,
  approver_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  timesheet_record RECORD;
  success BOOLEAN := FALSE;
BEGIN
  -- Update timesheet approval
  UPDATE timesheets 
  SET 
    approved = TRUE,
    approved_at = NOW(),
    approved_by = approver_id
  WHERE id = timesheet_id
  RETURNING * INTO timesheet_record;

  IF FOUND THEN
    -- Log the approval
    INSERT INTO audit_logs (actor_id, action, entity, details, created_at)
    VALUES (
      approver_id, 
      'TIMESHEET_APPROVED', 
      'timesheets', 
      jsonb_build_object(
        'timesheet_id', timesheet_id,
        'user_id', timesheet_record.user_id,
        'total_hours', timesheet_record.total_hours,
        'week_start', timesheet_record.week_start
      ), 
      NOW()
    );

    success := TRUE;
  END IF;

  RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Xero export notification
CREATE OR REPLACE FUNCTION notify_xero_export()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on approval changes
  IF NEW.approved = TRUE AND (OLD.approved IS DISTINCT FROM TRUE) THEN
    -- Create a notification event for external processing
    INSERT INTO system_notifications (
      type, 
      title, 
      message, 
      data, 
      created_at
    ) VALUES (
      'xero_export',
      'Timesheet Ready for Xero Export',
      'Timesheet ID ' || NEW.id || ' approved and ready for payroll export',
      jsonb_build_object(
        'timesheet_id', NEW.id,
        'user_id', NEW.user_id,
        'total_hours', NEW.total_hours,
        'week_start', NEW.week_start
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS xero_export_trigger ON timesheets;
CREATE TRIGGER xero_export_trigger
  AFTER UPDATE ON timesheets
  FOR EACH ROW
  EXECUTE FUNCTION notify_xero_export();

-- 6️⃣ Row Level Security Policies

-- Enable RLS on timesheet tables
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_notes ENABLE ROW LEVEL SECURITY;

-- Timesheet entries: Users can only see their own, admins/managers can see all
CREATE POLICY timesheet_entries_self_access ON timesheet_entries
  FOR SELECT USING (
    user_id = get_current_user_id() OR 
    get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY timesheet_entries_self_update ON timesheet_entries
  FOR UPDATE USING (
    user_id = get_current_user_id() AND submitted = FALSE
  );

CREATE POLICY timesheet_entries_system_insert ON timesheet_entries
  FOR INSERT WITH CHECK (
    user_id = get_current_user_id() OR 
    get_current_user_role() = 'admin'
  );

-- Timesheets: Users can see their own, admins can manage all
CREATE POLICY timesheets_self_access ON timesheets
  FOR SELECT USING (
    user_id = get_current_user_id() OR 
    get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY timesheets_admin_manage ON timesheets
  FOR ALL USING (get_current_user_role() = 'admin');

-- Timesheet notes: Users can manage their own entry notes
CREATE POLICY timesheet_notes_access ON timesheet_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM timesheet_entries te 
      WHERE te.id = timesheet_notes.entry_id 
      AND (te.user_id = get_current_user_id() OR get_current_user_role() IN ('admin', 'manager'))
    )
  );

-- 7️⃣ Helper Views for UI

-- View for current week timesheet summary
CREATE OR REPLACE VIEW current_week_timesheet AS
SELECT 
  te.user_id,
  te.date,
  te.start_time,
  te.finish_time,
  te.total_hours,
  te.auto_generated,
  te.submitted,
  tn.note,
  u.email,
  u.full_name,
  c.name as client_name
FROM timesheet_entries te
LEFT JOIN timesheet_notes tn ON te.id = tn.entry_id
LEFT JOIN users u ON te.user_id = u.id
LEFT JOIN claimants c ON te.client_id = c.id
WHERE te.date >= date_trunc('week', CURRENT_DATE)
  AND te.date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY te.date DESC, te.start_time DESC;

-- View for admin timesheet approval queue
CREATE OR REPLACE VIEW pending_timesheet_approvals AS
SELECT 
  ts.id,
  ts.user_id,
  u.full_name,
  u.email,
  ts.week_start,
  ts.total_hours,
  ts.claim_count,
  ts.created_at,
  COUNT(te.id) as entry_count
FROM timesheets ts
JOIN users u ON ts.user_id = u.id
LEFT JOIN timesheet_entries te ON te.user_id = ts.user_id 
  AND te.date >= ts.week_start 
  AND te.date < ts.week_start + INTERVAL '7 days'
WHERE ts.approved = FALSE
GROUP BY ts.id, ts.user_id, u.full_name, u.email, ts.week_start, ts.total_hours, ts.claim_count, ts.created_at
ORDER BY ts.created_at ASC;

-- 8️⃣ Initial Data and Configuration

-- Insert system configuration for timesheet automation
INSERT INTO admin_settings (key, value, description) VALUES
('timesheet_auto_rollup', 'true', 'Enable automatic weekly timesheet rollup'),
('timesheet_rollup_day', 'monday', 'Day of week for automatic rollup'),
('timesheet_rollup_time', '08:00', 'Time for automatic rollup (AEST)'),
('xero_integration_enabled', 'true', 'Enable Xero payroll integration'),
('timesheet_max_daily_hours', '12', 'Maximum allowed daily hours'),
('timesheet_overtime_threshold', '40', 'Weekly overtime threshold')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON timesheet_entries TO authenticated;
GRANT SELECT ON timesheets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON timesheet_notes TO authenticated;
GRANT SELECT ON current_week_timesheet TO authenticated;
GRANT SELECT ON pending_timesheet_approvals TO authenticated;

-- Grant admin permissions
GRANT ALL ON timesheets TO service_role;
GRANT EXECUTE ON FUNCTION rollup_timesheets() TO service_role;
GRANT EXECUTE ON FUNCTION approve_timesheet(INT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_timesheet_stats() TO service_role;

-- Create comment documentation
COMMENT ON TABLE timesheet_entries IS 'Daily time tracking entries automatically created from user activity';
COMMENT ON TABLE timesheets IS 'Weekly timesheet summaries for admin approval and payroll export';
COMMENT ON TABLE timesheet_notes IS 'User-editable notes for daily timesheet entries';
COMMENT ON FUNCTION rollup_timesheets() IS 'Weekly cron function to collate timesheet entries into weekly summaries';
COMMENT ON FUNCTION approve_timesheet(INT, UUID) IS 'Admin function to approve timesheets and trigger Xero export';

-- Success notification
DO $$
BEGIN
  RAISE NOTICE 'Mason Vector Timesheet System (v2) migration completed successfully';
  RAISE NOTICE 'Event-driven timesheet automation with audit_logs integration enabled';
  RAISE NOTICE 'Tables created: timesheet_entries, timesheets, timesheet_notes';
  RAISE NOTICE 'Triggers enabled for ACCESS_CLIENT_FILE, LOGOUT, SESSION_TIMEOUT events';
  RAISE NOTICE 'RLS policies applied for multi-role access control';
END $$;