// Mason Vector - Admin Timesheet Approval API
// Bulk approve timesheets and trigger Xero integration

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabaseClient';
import { AccessControlGuard } from '../../../../../middleware/accessControl';

export async function POST(request: NextRequest) {
  const guard = new AccessControlGuard();
  
  // Check admin access
  const accessCheck = await guard.checkAccess(request, ['R', 'W', 'D']);
  if (!accessCheck.allowed || accessCheck.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { timesheetIds } = body;
    
    if (!Array.isArray(timesheetIds) || timesheetIds.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request: timesheetIds array required' 
      }, { status: 400 });
    }

    const approverId = accessCheck.user!.id;

    // Call approval function
    const { data: approvalResult, error: approvalError } = await supabase
      .rpc('approve_timesheets', {
        timesheet_ids: timesheetIds,
        approver_id: approverId
      });

    if (approvalError) {
      console.error('Approval error:', approvalError);
      return NextResponse.json({ 
        error: 'Failed to approve timesheets',
        details: approvalError.message 
      }, { status: 500 });
    }

    // Get approved timesheet details for response
    const { data: approvedTimesheets, error: fetchError } = await supabase
      .from('timesheets')
      .select(`
        id,
        user_id,
        week_start,
        total_hours,
        status,
        approved_at,
        users!inner(full_name, email)
      `)
      .in('id', timesheetIds);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    return NextResponse.json({
      success: true,
      approved_count: approvalResult[0]?.approved_count || 0,
      total_hours: approvalResult[0]?.total_hours || 0,
      xero_jobs_created: approvalResult[0]?.xero_jobs_created || 0,
      approved_timesheets: approvedTimesheets || []
    });

  } catch (error) {
    console.error('Timesheet approval error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to fetch pending approvals
export async function GET(request: NextRequest) {
  const guard = new AccessControlGuard();
  
  // Check admin/manager access
  const accessCheck = await guard.checkAccess(request, ['R']);
  if (!accessCheck.allowed || !['admin', 'manager'].includes(accessCheck.role!)) {
    return NextResponse.json({ error: 'Admin or manager access required' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const week = url.searchParams.get('week');
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = supabase
      .from('mv_timesheets_admin_dashboard')
      .select('*')
      .eq('status', status)
      .order('week_start', { ascending: false })
      .order('total_hours', { ascending: false })
      .limit(limit);

    if (week) {
      query = query.eq('week_start', week);
    }

    const { data: pendingTimesheets, error: fetchError } = await query;

    if (fetchError) {
      console.error('Fetch pending timesheets error:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch pending timesheets',
        details: fetchError.message 
      }, { status: 500 });
    }

    // Get summary statistics
    const { data: stats, error: statsError } = await supabase
      .from('timesheets')
      .select('status, total_hours', { count: 'exact' })
      .eq('status', status);

    const totalHours = stats?.reduce((sum, t) => sum + (t.total_hours || 0), 0) || 0;
    const totalCount = stats?.length || 0;

    return NextResponse.json({
      success: true,
      timesheets: pendingTimesheets || [],
      summary: {
        total_count: totalCount,
        total_hours: totalHours,
        status: status,
        week_filter: week
      }
    });

  } catch (error) {
    console.error('Fetch pending timesheets error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}