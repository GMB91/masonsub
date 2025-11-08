// Mason Vector - Timesheet Automation Scheduler
// Handles Friday reminders, Monday auto-submit, and admin digest

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

interface CronJobResult {
  job_name: string;
  success: boolean;
  processed_count?: number;
  total_hours?: number;
  error?: string;
  execution_time: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron job authentication
    const cronSecret = request.headers.get('X-Cron-Secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { job_type, timezone = 'Australia/Brisbane' } = body;

    const results: CronJobResult[] = [];
    const executionTime = new Date().toISOString();

    switch (job_type) {
      case 'friday_reminders':
        results.push(await executeFridayReminders(executionTime));
        break;

      case 'monday_autosubmit':
        results.push(await executeMondayAutoSubmit(executionTime));
        break;

      case 'monday_digest':
        results.push(await executeMondayDigest(executionTime));
        break;

      case 'refresh_dashboard':
        results.push(await executeRefreshDashboard(executionTime));
        break;

      case 'all_monday_jobs':
        // Execute all Monday jobs in sequence
        results.push(await executeMondayAutoSubmit(executionTime));
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        results.push(await executeMondayDigest(executionTime));
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        results.push(await executeRefreshDashboard(executionTime));
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid job_type. Use: friday_reminders, monday_autosubmit, monday_digest, refresh_dashboard, or all_monday_jobs' 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      execution_time: executionTime,
      results: results
    });

  } catch (error) {
    console.error('Cron scheduler error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Execute Friday 4PM reminder job
 */
async function executeFridayReminders(executionTime: string): Promise<CronJobResult> {
  try {
    // Check if Friday reminders are enabled
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'timesheet_friday_reminder_enabled')
      .single();

    if (setting?.value !== 'true') {
      return {
        job_name: 'friday_reminders',
        success: true,
        processed_count: 0,
        error: 'Friday reminders disabled in settings',
        execution_time: executionTime
      };
    }

    // Execute Friday reminders function
    const { data: result, error } = await supabase
      .rpc('send_friday_reminders');

    if (error) {
      console.error('Friday reminders error:', error);
      return {
        job_name: 'friday_reminders',
        success: false,
        error: error.message,
        execution_time: executionTime
      };
    }

    const remindersData = result?.[0] || { users_notified: 0, total_draft_hours: 0 };

    return {
      job_name: 'friday_reminders',
      success: true,
      processed_count: remindersData.users_notified,
      total_hours: remindersData.total_draft_hours,
      execution_time: executionTime
    };

  } catch (error) {
    return {
      job_name: 'friday_reminders',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time: executionTime
    };
  }
}

/**
 * Execute Monday 8AM auto-submit job
 */
async function executeMondayAutoSubmit(executionTime: string): Promise<CronJobResult> {
  try {
    // Check if auto-submit is enabled
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'timesheet_monday_autosubmit_enabled')
      .single();

    if (setting?.value !== 'true') {
      return {
        job_name: 'monday_autosubmit',
        success: true,
        processed_count: 0,
        error: 'Monday auto-submit disabled in settings',
        execution_time: executionTime
      };
    }

    // Execute Monday auto-submit function
    const { data: result, error } = await supabase
      .rpc('monday_auto_submit');

    if (error) {
      console.error('Monday auto-submit error:', error);
      return {
        job_name: 'monday_autosubmit',
        success: false,
        error: error.message,
        execution_time: executionTime
      };
    }

    const submitData = result?.[0] || { processed_timesheets: 0, total_users: 0 };

    return {
      job_name: 'monday_autosubmit',
      success: true,
      processed_count: submitData.processed_timesheets,
      execution_time: executionTime
    };

  } catch (error) {
    return {
      job_name: 'monday_autosubmit',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time: executionTime
    };
  }
}

/**
 * Execute Monday 8:15AM admin digest job
 */
async function executeMondayDigest(executionTime: string): Promise<CronJobResult> {
  try {
    // Check if digest is enabled
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'timesheet_monday_digest_enabled')
      .single();

    if (setting?.value !== 'true') {
      return {
        job_name: 'monday_digest',
        success: true,
        processed_count: 0,
        error: 'Monday digest disabled in settings',
        execution_time: executionTime
      };
    }

    // Execute Monday digest function
    const { data: result, error } = await supabase
      .rpc('send_admin_digest');

    if (error) {
      console.error('Monday digest error:', error);
      return {
        job_name: 'monday_digest',
        success: false,
        error: error.message,
        execution_time: executionTime
      };
    }

    const digestData = result?.[0] || { pending_count: 0, total_hours: 0 };

    return {
      job_name: 'monday_digest',
      success: true,
      processed_count: digestData.pending_count,
      total_hours: digestData.total_hours,
      execution_time: executionTime
    };

  } catch (error) {
    return {
      job_name: 'monday_digest',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time: executionTime
    };
  }
}

/**
 * Execute dashboard refresh job
 */
async function executeRefreshDashboard(executionTime: string): Promise<CronJobResult> {
  try {
    // Check if dashboard refresh is enabled
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'timesheet_dashboard_refresh_enabled')
      .single();

    if (setting?.value !== 'true') {
      return {
        job_name: 'refresh_dashboard',
        success: true,
        processed_count: 0,
        error: 'Dashboard refresh disabled in settings',
        execution_time: executionTime
      };
    }

    // Execute dashboard refresh function
    const { error } = await supabase
      .rpc('refresh_admin_dashboard');

    if (error) {
      console.error('Dashboard refresh error:', error);
      return {
        job_name: 'refresh_dashboard',
        success: false,
        error: error.message,
        execution_time: executionTime
      };
    }

    return {
      job_name: 'refresh_dashboard',
      success: true,
      processed_count: 1,
      execution_time: executionTime
    };

  } catch (error) {
    return {
      job_name: 'refresh_dashboard',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time: executionTime
    };
  }
}

// GET method for job status and configuration
export async function GET(request: NextRequest) {
  try {
    // Get current automation settings
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('key, value, description')
      .like('key', 'timesheet_%')
      .order('key');

    if (error) {
      throw error;
    }

    // Get recent job execution logs
    const { data: recentJobs, error: jobError } = await supabase
      .from('audit_logs')
      .select('action, details, created_at')
      .in('action', [
        'TIMESHEET_REMINDER_SENT',
        'TIMESHEET_AUTO_SUBMIT', 
        'TIMESHEET_DIGEST_SENT'
      ])
      .order('created_at', { ascending: false })
      .limit(10);

    if (jobError) {
      console.error('Failed to fetch job logs:', jobError);
    }

    return NextResponse.json({
      success: true,
      automation_settings: settings || [],
      recent_executions: recentJobs || [],
      schedule_info: {
        friday_reminders: '16:00 AEST',
        monday_autosubmit: '08:00 AEST',
        monday_digest: '08:15 AEST',
        dashboard_refresh: 'After Monday jobs'
      }
    });

  } catch (error) {
    console.error('Get cron status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get automation status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}