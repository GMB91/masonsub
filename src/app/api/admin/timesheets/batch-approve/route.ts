import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { timesheet_ids, approved_by } = await req.json();

    if (!timesheet_ids || !Array.isArray(timesheet_ids) || timesheet_ids.length === 0 || !approved_by) {
      return NextResponse.json(
        { error: "Missing required fields or invalid timesheet_ids" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Get all timesheets to validate they can be approved
    const { data: timesheets, error: fetchError } = await supabase
      .from("timesheets")
      .select("*")
      .in("id", timesheet_ids);

    if (fetchError) throw fetchError;

    // Check if all timesheets can be approved
    const invalidTimesheets = timesheets?.filter(t => t.status !== 'submitted') || [];
    if (invalidTimesheets.length > 0) {
      return NextResponse.json(
        { 
          error: "Some timesheets cannot be approved",
          invalid_timesheets: invalidTimesheets.map(t => t.id)
        },
        { status: 400 }
      );
    }

    const approvalTime = new Date().toISOString();
    
    // Batch update all timesheets to approved
    const { data: updatedTimesheets, error: updateError } = await supabase
      .from("timesheets")
      .update({
        status: 'approved',
        approved_at: approvalTime,
        approved_by,
        updated_at: approvalTime
      })
      .in("id", timesheet_ids)
      .select();

    if (updateError) throw updateError;

    // Create activity records for each approval
    const activityRecords = timesheets?.map(timesheet => ({
      actor_id: approved_by,
      action: "timesheet_batch_approved",
      entity_type: "timesheet",
      entity_id: timesheet.id,
      context: {
        timesheet_id: timesheet.id,
        contractor_id: timesheet.contractor_id,
        week_start: timesheet.week_start,
        total_hours: timesheet.total_hours,
        total_amount: timesheet.total_amount,
        approved_at: approvalTime,
        approved_by,
        batch_size: timesheet_ids.length
      },
      created_at: approvalTime
    })) || [];

    if (activityRecords.length > 0) {
      await supabase
        .from("activities")
        .insert(activityRecords);
    }

    // Calculate totals for summary
    const totalHours = updatedTimesheets?.reduce((sum, t) => sum + t.total_hours, 0) || 0;
    const totalAmount = updatedTimesheets?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      approved_count: updatedTimesheets?.length || 0,
      total_hours: totalHours,
      total_amount: totalAmount,
      timesheets: updatedTimesheets,
      message: `Successfully approved ${updatedTimesheets?.length || 0} timesheets`
    });

  } catch (error) {
    console.error("Error batch approving timesheets:", error);
    return NextResponse.json(
      { 
        error: "Failed to batch approve timesheets",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}