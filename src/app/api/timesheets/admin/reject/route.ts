// Mason Vector - Admin Timesheet Rejection API
// Reject timesheet with note and reopen for editing

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
    const { timesheetId, note } = body;
    
    if (!timesheetId || !note) {
      return NextResponse.json({ 
        error: 'Invalid request: timesheetId and note required' 
      }, { status: 400 });
    }

    const rejectorId = accessCheck.user!.id;

    // Call rejection function
    const { data: rejectionResult, error: rejectionError } = await supabase
      .rpc('reject_timesheet', {
        timesheet_id: timesheetId,
        rejector_id: rejectorId,
        rejection_note: note
      });

    if (rejectionError) {
      console.error('Rejection error:', rejectionError);
      return NextResponse.json({ 
        error: 'Failed to reject timesheet',
        details: rejectionError.message 
      }, { status: 500 });
    }

    if (!rejectionResult) {
      return NextResponse.json({ 
        error: 'Timesheet not found or not in pending status' 
      }, { status: 404 });
    }

    // Get rejected timesheet details for response
    const { data: rejectedTimesheet, error: fetchError } = await supabase
      .from('timesheets')
      .select(`
        id,
        user_id,
        week_start,
        total_hours,
        status,
        rejected_at,
        rejected_note,
        users!inner(full_name, email)
      `)
      .eq('id', timesheetId)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    return NextResponse.json({
      success: true,
      message: 'Timesheet rejected and reopened for editing',
      rejected_timesheet: rejectedTimesheet || null
    });

  } catch (error) {
    console.error('Timesheet rejection error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}