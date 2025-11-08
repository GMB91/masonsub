-- Workflow Automation Dashboard Database Functions
-- File: supabase/migrations/20251107002000_workflow_automation_functions.sql

-- Function to count automated actions in the last 30 days
CREATE OR REPLACE FUNCTION count_auto_actions_30d()
RETURNS INTEGER AS $$
BEGIN
  -- Count automated enrichments and status updates from audit logs
  RETURN (
    SELECT COUNT(*) 
    FROM audit_logs 
    WHERE action_type IN ('AUTO_ENRICHMENT', 'AUTO_STATUS_UPDATE', 'AUTO_REMINDER_CREATE')
      AND created_at >= NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to count status changes in the last 30 days
CREATE OR REPLACE FUNCTION count_status_changes_30d()
RETURNS INTEGER AS $$
BEGIN
  -- Count manual and automated status changes
  RETURN (
    SELECT COUNT(*) 
    FROM audit_logs 
    WHERE action_type = 'STATUS_CHANGE'
      AND created_at >= NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to count completed reminders in the last 30 days
CREATE OR REPLACE FUNCTION count_reminders_30d()
RETURNS INTEGER AS $$
BEGIN
  -- Count completed reminders as a completion rate metric
  RETURN (
    SELECT COUNT(*) 
    FROM reminders 
    WHERE completed = true
      AND completed_at >= NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to count overdue reminders (past due date)
CREATE OR REPLACE FUNCTION count_overdue_reminders()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM reminders
    WHERE due_date < NOW()
      AND completed = false
      AND cancelled = false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to count upcoming tasks (next 7 days)
CREATE OR REPLACE FUNCTION count_upcoming_tasks()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM reminders
    WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
      AND completed = false
      AND cancelled = false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to count near-due reminders (due within next 3 days)
CREATE OR REPLACE FUNCTION count_near_due_reminders()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM reminders
    WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      AND completed = false
      AND cancelled = false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get workflow activity summary for charts
CREATE OR REPLACE FUNCTION get_workflow_activity_7d()
RETURNS TABLE(
  activity_date DATE,
  auto_actions INTEGER,
  reminders_created INTEGER,
  status_changes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(al.created_at) as activity_date,
    COUNT(CASE WHEN al.action_type IN ('AUTO_ENRICHMENT', 'AUTO_STATUS_UPDATE') THEN 1 END)::INTEGER as auto_actions,
    COUNT(CASE WHEN al.action_type = 'AUTO_REMINDER_CREATE' THEN 1 END)::INTEGER as reminders_created,
    COUNT(CASE WHEN al.action_type = 'STATUS_CHANGE' THEN 1 END)::INTEGER as status_changes
  FROM audit_logs al
  WHERE al.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(al.created_at)
  ORDER BY activity_date DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get workflow performance insights
CREATE OR REPLACE FUNCTION get_workflow_performance_insights()
RETURNS TABLE(
  total_auto_actions INTEGER,
  total_manual_actions INTEGER,
  automation_ratio DECIMAL(5,2),
  avg_daily_auto_actions DECIMAL(10,2),
  reminder_completion_rate DECIMAL(5,2)
) AS $$
DECLARE
  auto_count INTEGER;
  manual_count INTEGER;
  total_reminders INTEGER;
  completed_reminders INTEGER;
BEGIN
  -- Get auto actions count (30 days)
  SELECT count_auto_actions_30d() INTO auto_count;
  
  -- Get manual actions (assuming non-auto audit log entries)
  SELECT COUNT(*) INTO manual_count
  FROM audit_logs 
  WHERE action_type NOT IN ('AUTO_ENRICHMENT', 'AUTO_STATUS_UPDATE', 'AUTO_REMINDER_CREATE')
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Get reminder metrics
  SELECT COUNT(*) INTO total_reminders
  FROM reminders 
  WHERE created_at >= NOW() - INTERVAL '30 days';
  
  SELECT COUNT(*) INTO completed_reminders
  FROM reminders 
  WHERE completed = true 
    AND created_at >= NOW() - INTERVAL '30 days';
  
  RETURN QUERY SELECT
    auto_count,
    manual_count,
    CASE WHEN (auto_count + manual_count) > 0 
         THEN (auto_count::DECIMAL / (auto_count + manual_count)) * 100 
         ELSE 0 END,
    auto_count::DECIMAL / 30,
    CASE WHEN total_reminders > 0 
         THEN (completed_reminders::DECIMAL / total_reminders) * 100 
         ELSE 0 END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION count_auto_actions_30d() TO authenticated;
GRANT EXECUTE ON FUNCTION count_status_changes_30d() TO authenticated;
GRANT EXECUTE ON FUNCTION count_reminders_30d() TO authenticated;
GRANT EXECUTE ON FUNCTION count_overdue_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION count_upcoming_tasks() TO authenticated;
GRANT EXECUTE ON FUNCTION count_near_due_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_activity_7d() TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_performance_insights() TO authenticated;

-- Add indexes to improve function performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_type_created_at 
ON audit_logs(action_type, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_due_date_status 
ON reminders(due_date, completed, cancelled);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_created_completed_at 
ON reminders(created_at, completed_at, completed);

-- Add comments for documentation
COMMENT ON FUNCTION count_auto_actions_30d() IS 'Returns count of automated actions (enrichments, status updates, reminder creation) in the last 30 days';
COMMENT ON FUNCTION count_status_changes_30d() IS 'Returns count of all status changes in the last 30 days';
COMMENT ON FUNCTION count_reminders_30d() IS 'Returns count of completed reminders in the last 30 days';
COMMENT ON FUNCTION count_overdue_reminders() IS 'Returns count of currently overdue reminders';
COMMENT ON FUNCTION count_upcoming_tasks() IS 'Returns count of tasks/reminders due in the next 7 days';
COMMENT ON FUNCTION count_near_due_reminders() IS 'Returns count of reminders due in the next 3 days (for amber alerts)';
COMMENT ON FUNCTION get_workflow_activity_7d() IS 'Returns daily workflow activity breakdown for the last 7 days';
COMMENT ON FUNCTION get_workflow_performance_insights() IS 'Returns comprehensive workflow performance metrics and ratios';