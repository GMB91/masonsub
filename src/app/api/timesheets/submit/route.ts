import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { user_id, week_start } = await req.json();

    if (!user_id || !week_start) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Find the timesheet
    const { data: timesheet, error: fetchError } = await supabase
      .from("timesheets")
      .select("*")
      .eq("contractor_id", user_id)
      .eq("week_start", week_start)
      .single();

    if (fetchError || !timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found" },
        { status: 404 }
      );
    }

    // Check if timesheet can be submitted
    if (timesheet.status === 'submitted' || timesheet.status === 'approved') {
      return NextResponse.json(
        { error: "Timesheet has already been submitted" },
        { status: 400 }
      );
    }

    // Update timesheet status to submitted
    const { data: updatedTimesheet, error: updateError } = await supabase
      .from("timesheets")
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", timesheet.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create activity record for submission
    await supabase
      .from("activities")
      .insert({
        actor_id: user_id,
        action: "timesheet_submitted",
        entity_type: "timesheet",
        entity_id: timesheet.id,
        context: {
          timesheet_id: timesheet.id,
          week_start,
          total_hours: timesheet.total_hours,
          submitted_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      timesheet: updatedTimesheet,
      message: "Timesheet submitted successfully for approval"
    });

  } catch (error) {
    console.error("Error submitting timesheet:", error);
    return NextResponse.json(
      { 
        error: "Failed to submit timesheet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}