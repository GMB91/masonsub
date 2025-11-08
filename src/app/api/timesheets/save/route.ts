import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { user_id, week_start, entries, summary } = await req.json();

    if (!user_id || !week_start) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Calculate week_end (Sunday of the same week)
    const weekStartDate = new Date(week_start);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    const week_end = weekEndDate.toISOString().split('T')[0];

    // First, check if timesheet already exists
    const { data: existingTimesheet } = await supabase
      .from("timesheets")
      .select("id")
      .eq("contractor_id", user_id)
      .eq("week_start", week_start)
      .single();

    let timesheetId;

    // Store entries as JSON in a custom field or use activities table
    const timesheetData = {
      contractor_id: user_id,
      week_start,
      week_end,
      total_hours: summary.total_hours,
      status: summary.status || 'draft',
      updated_at: new Date().toISOString()
    };

    if (existingTimesheet) {
      // Update existing timesheet
      const { data: updatedTimesheet, error: updateError } = await supabase
        .from("timesheets")
        .update(timesheetData)
        .eq("id", existingTimesheet.id)
        .select()
        .single();

      if (updateError) throw updateError;
      timesheetId = updatedTimesheet.id;
    } else {
      // Create new timesheet
      const { data: newTimesheet, error: createError } = await supabase
        .from("timesheets")
        .insert({
          ...timesheetData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      timesheetId = newTimesheet.id;
    }

    // Store entries as activities for now (this provides flexibility)
    // First, clear existing timesheet entries stored as activities
    await supabase
      .from("activities")
      .delete()
      .eq("actor_id", user_id)
      .eq("action", "timesheet_entry_saved")
      .eq("entity_type", "timesheet_entry");

    // Insert new entries as activities
    const entriesWithData = entries
      .filter((entry: any) => entry.hours_worked > 0 || entry.notes.trim())
      .map((entry: any) => ({
        actor_id: user_id,
        action: "timesheet_entry_saved",
        entity_type: "timesheet_entry",
        entity_id: `${timesheetId}_${entry.date}`,
        context: {
          timesheet_id: timesheetId,
          date: entry.date,
          start_time: entry.start_time || null,
          end_time: entry.end_time || null,
          break_minutes: entry.break_minutes || 0,
          notes: entry.notes || '',
          hours_worked: entry.hours_worked || 0,
          is_overtime: entry.is_overtime || false,
          client_files_accessed: entry.client_files_accessed || []
        },
        created_at: new Date().toISOString()
      }));

    if (entriesWithData.length > 0) {
      const { error: entriesError } = await supabase
        .from("activities")
        .insert(entriesWithData);

      if (entriesError) throw entriesError;
    }

    return NextResponse.json({
      success: true,
      timesheet_id: timesheetId,
      message: "Timesheet saved successfully"
    });

  } catch (error) {
    console.error("Error saving timesheet:", error);
    return NextResponse.json(
      { 
        error: "Failed to save timesheet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}