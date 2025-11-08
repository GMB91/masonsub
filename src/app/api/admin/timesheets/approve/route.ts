import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { timesheet_id, approved_by } = await req.json();

    if (!timesheet_id || !approved_by) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Get the timesheet first
    const { data: timesheet, error: fetchError } = await supabase
      .from("timesheets")
      .select("*")
      .eq("id", timesheet_id)
      .single();

    if (fetchError || !timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found" },
        { status: 404 }
      );
    }

    // Check if timesheet can be approved
    if (timesheet.status !== 'submitted') {
      return NextResponse.json(
        { error: "Timesheet is not in submitted status" },
        { status: 400 }
      );
    }

    // Update timesheet status to approved
    const { data: updatedTimesheet, error: updateError } = await supabase
      .from("timesheets")
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by,
        updated_at: new Date().toISOString()
      })
      .eq("id", timesheet_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create activity record for approval
    await supabase
      .from("activities")
      .insert({
        actor_id: approved_by,
        action: "timesheet_approved",
        entity_type: "timesheet",
        entity_id: timesheet_id,
        context: {
          timesheet_id,
          contractor_id: timesheet.contractor_id,
          week_start: timesheet.week_start,
          total_hours: timesheet.total_hours,
          total_amount: timesheet.total_amount,
          approved_at: new Date().toISOString(),
          approved_by
        },
        created_at: new Date().toISOString()
      });

    // TODO: Trigger Xero integration for payroll processing
    // This would create the payment record in Xero and mark timesheet as 'paid'

    return NextResponse.json({
      success: true,
      timesheet: updatedTimesheet,
      message: "Timesheet approved successfully"
    });

  } catch (error) {
    console.error("Error approving timesheet:", error);
    return NextResponse.json(
      { 
        error: "Failed to approve timesheet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}