import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { timesheet_id, rejection_reason, rejected_by } = await req.json();

    if (!timesheet_id || !rejection_reason || !rejected_by) {
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

    // Check if timesheet can be rejected
    if (timesheet.status !== 'submitted') {
      return NextResponse.json(
        { error: "Timesheet is not in submitted status" },
        { status: 400 }
      );
    }

    // Update timesheet status to rejected
    const { data: updatedTimesheet, error: updateError } = await supabase
      .from("timesheets")
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq("id", timesheet_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create activity record for rejection
    await supabase
      .from("activities")
      .insert({
        actor_id: rejected_by,
        action: "timesheet_rejected",
        entity_type: "timesheet",
        entity_id: timesheet_id,
        context: {
          timesheet_id,
          contractor_id: timesheet.contractor_id,
          week_start: timesheet.week_start,
          total_hours: timesheet.total_hours,
          rejection_reason,
          rejected_at: new Date().toISOString(),
          rejected_by
        },
        created_at: new Date().toISOString()
      });

    // TODO: Send notification to contractor about rejection
    // This could be integrated with the notification system

    return NextResponse.json({
      success: true,
      timesheet: updatedTimesheet,
      message: "Timesheet rejected successfully"
    });

  } catch (error) {
    console.error("Error rejecting timesheet:", error);
    return NextResponse.json(
      { 
        error: "Failed to reject timesheet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}