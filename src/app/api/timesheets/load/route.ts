import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const week_start = searchParams.get('week_start');

    if (!user_id || !week_start) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Get timesheet data
    const { data: timesheet, error: timesheetError } = await supabase
      .from("timesheets")
      .select("*")
      .eq("contractor_id", user_id)
      .eq("week_start", week_start)
      .single();

    // Get timesheet entries from activities table
    const { data: entriesActivities, error: entriesError } = await supabase
      .from("activities")
      .select("*")
      .eq("actor_id", user_id)
      .eq("action", "timesheet_entry_saved")
      .eq("entity_type", "timesheet_entry")
      .order("created_at", { ascending: true });

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
    }

    // Transform activities back to entries format
    const entries = entriesActivities ? entriesActivities
      .filter(activity => activity.context && (activity.context as any).timesheet_id)
      .map(activity => {
        const context = activity.context as any;
        return {
          id: activity.entity_id,
          date: context.date,
          start_time: context.start_time || '',
          end_time: context.end_time || '',
          break_minutes: context.break_minutes || 30,
          notes: context.notes || '',
          hours_worked: context.hours_worked || 0,
          is_overtime: context.is_overtime || false,
          client_files_accessed: context.client_files_accessed || []
        };
      }) : [];

    // Calculate summary if no timesheet exists
    const summary = timesheet ? {
      total_hours: timesheet.total_hours,
      regular_hours: Math.min(timesheet.total_hours, 40),
      overtime_hours: Math.max(0, timesheet.total_hours - 40),
      total_days: entries.filter(e => e.hours_worked > 0).length,
      status: timesheet.status || 'draft'
    } : {
      total_hours: 0,
      regular_hours: 0,
      overtime_hours: 0,
      total_days: 0,
      status: 'draft'
    };

    return NextResponse.json({
      success: true,
      timesheet: timesheet || null,
      entries: entries,
      summary: summary
    });

  } catch (error) {
    console.error("Error loading timesheet:", error);
    return NextResponse.json(
      { 
        error: "Failed to load timesheet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}