// Mason Vector - Xero Integration Webhook API
// Handles Xero export notifications and status updates

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

interface XeroExportJob {
  timesheet_id: number;
  user_id: string;
  total_hours: number;
  week_start: string;
  idempotency_key: string;
}

interface XeroTimesheetPayload {
  employeeEmail: string;
  employeeName: string;
  date: string;
  hours: number;
  description: string;
  idempotencyKey: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implement based on your security requirements)
    const authHeader = request.headers.get('Authorization');
    const webhookSecret = process.env.TIMESHEET_WEBHOOK_SECRET;
    
    if (!authHeader || !webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process Xero export jobs from notifications
    const { data: exportJobs, error: fetchError } = await supabase
      .from('system_notifications')
      .select('data')
      .eq('type', 'xero_export_job')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Failed to fetch export jobs:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch export jobs' 
      }, { status: 500 });
    }

    const results = [];

    for (const job of exportJobs || []) {
      const jobData = job.data as XeroExportJob;
      
      try {
        // Get user details for Xero payload
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', jobData.user_id)
          .single();

        if (userError || !user) {
          console.error('User not found for timesheet:', jobData.timesheet_id);
          await recordExportFailure(jobData.timesheet_id, 'User not found');
          continue;
        }

        // Build Xero payload
        const xeroPayload: XeroTimesheetPayload = {
          employeeEmail: user.email,
          employeeName: user.full_name,
          date: jobData.week_start,
          hours: jobData.total_hours,
          description: `Mason Vector Portal Activity - Week of ${jobData.week_start}`,
          idempotencyKey: jobData.idempotency_key
        };

        // Send to Xero API
        const xeroResult = await sendToXero(xeroPayload);
        
        if (xeroResult.success) {
          // Record success
          await supabase.rpc('record_xero_export_success', {
            timesheet_id: jobData.timesheet_id,
            xero_timesheet_id: xeroResult.xero_timesheet_id
          });

          // Mark notification as processed
          await supabase
            .from('system_notifications')
            .update({ processed: true })
            .match({ 
              type: 'xero_export_job',
              data: job.data 
            });

          results.push({
            timesheet_id: jobData.timesheet_id,
            status: 'success',
            xero_timesheet_id: xeroResult.xero_timesheet_id
          });

        } else {
          // Record failure
          await supabase.rpc('record_xero_export_failure', {
            timesheet_id: jobData.timesheet_id,
            error_message: xeroResult.error || 'Unknown Xero API error'
          });

          results.push({
            timesheet_id: jobData.timesheet_id,
            status: 'failed',
            error: xeroResult.error
          });
        }

      } catch (error) {
        console.error('Error processing export job:', error);
        await recordExportFailure(
          jobData.timesheet_id, 
          error instanceof Error ? error.message : 'Processing error'
        );

        results.push({
          timesheet_id: jobData.timesheet_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed_count: results.length,
      results: results
    });

  } catch (error) {
    console.error('Xero webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Send timesheet data to Xero Payroll API
 */
async function sendToXero(payload: XeroTimesheetPayload): Promise<{
  success: boolean;
  xero_timesheet_id?: string;
  error?: string;
}> {
  try {
    const xeroApiUrl = process.env.XERO_PAYROLL_API_URL || 'https://api.xero.com/payroll.xro/2.0/Timesheets';
    const xeroAccessToken = process.env.XERO_ACCESS_TOKEN;

    if (!xeroAccessToken) {
      throw new Error('Xero access token not configured');
    }

    const response = await fetch(xeroApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xeroAccessToken}`,
        'Content-Type': 'application/json',
        'Xero-Tenant-Id': process.env.XERO_TENANT_ID || '',
        'Idempotency-Key': payload.idempotencyKey
      },
      body: JSON.stringify({
        TimesheetID: payload.idempotencyKey,
        EmployeeID: payload.employeeEmail, // Map to Xero employee
        StartDate: payload.date,
        EndDate: payload.date,
        Status: 'APPROVED',
        Hours: payload.hours,
        TimesheetLines: [{
          EarningsRateID: process.env.XERO_EARNINGS_RATE_ID || 'ORDINARY',
          TrackingItemID: '',
          NumberOfUnits: [payload.hours],
          Description: payload.description
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Xero API error: ${response.status} - ${errorText}`);
    }

    const xeroResponse = await response.json();
    
    return {
      success: true,
      xero_timesheet_id: xeroResponse.TimesheetID || payload.idempotencyKey
    };

  } catch (error) {
    console.error('Xero API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Xero API error'
    };
  }
}

/**
 * Helper function to record export failure
 */
async function recordExportFailure(timesheetId: number, errorMessage: string): Promise<void> {
  try {
    await supabase.rpc('record_xero_export_failure', {
      timesheet_id: timesheetId,
      error_message: errorMessage
    });
  } catch (error) {
    console.error('Failed to record export failure:', error);
  }
}