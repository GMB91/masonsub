import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('date_range') || 'current_week';
    const contractor = searchParams.get('contractor') || 'all';
    const sortBy = searchParams.get('sort_by') || 'submitted_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const supabase = supabaseServer;

    // Build base query
    let query = supabase
      .from("timesheets")
      .select("*");

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date range filter
    const now = new Date();
    let dateFilter = null;
    
    switch (dateRange) {
      case 'current_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        dateFilter = startOfWeek.toISOString().split('T')[0];
        query = query.gte('week_start', dateFilter);
        break;
      case 'last_week':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 6); // Previous Monday
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // Previous Sunday
        query = query
          .gte('week_start', lastWeekStart.toISOString().split('T')[0])
          .lte('week_start', lastWeekEnd.toISOString().split('T')[0]);
        break;
      case 'current_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('week_start', startOfMonth.toISOString().split('T')[0]);
        break;
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        query = query
          .gte('week_start', lastMonth.toISOString().split('T')[0])
          .lte('week_start', endOfLastMonth.toISOString().split('T')[0]);
        break;
    }

    // Apply contractor filter
    if (contractor !== 'all') {
      query = query.eq('contractor_id', contractor);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const { data: timesheets, error } = await query;

    if (error) throw error;

    // Get contractor details
    const contractorIds = [...new Set(timesheets.map(t => t.contractor_id))];
    const { data: contractors } = await supabase
      .from("claimants")
      .select("id, full_name, email")
      .in("id", contractorIds);

    const contractorMap = new Map(
      contractors?.map(c => [c.id, c]) || []
    );

    // Get timesheet entries for each submission
    const submissionsWithDetails = await Promise.all(
      timesheets.map(async (timesheet) => {
        const contractor = contractorMap.get(timesheet.contractor_id);
        
        // Get entries from activities table
        const { data: entriesActivities } = await supabase
          .from("activities")
          .select("*")
          .eq("actor_id", timesheet.contractor_id)
          .eq("action", "timesheet_entry_saved")
          .eq("entity_type", "timesheet_entry");

        const entries = entriesActivities ? entriesActivities
          .filter(activity => {
            const context = activity.context as any;
            return context && context.timesheet_id === timesheet.id;
          })
          .map(activity => {
            const context = activity.context as any;
            return {
              date: context.date,
              start_time: context.start_time,
              end_time: context.end_time,
              break_minutes: context.break_minutes,
              notes: context.notes,
              hours_worked: context.hours_worked,
              is_overtime: context.is_overtime
            };
          }) : [];

        // Calculate flags
        const flags = [];
        const regularHours = Math.min(timesheet.total_hours, 40);
        const overtimeHours = Math.max(0, timesheet.total_hours - 40);
        
        if (overtimeHours > 0) flags.push('overtime');
        if (timesheet.total_hours > 50) flags.push('excessive_hours');
        if (entries.some((e: any) => e.hours_worked > 12)) flags.push('long_day');

        return {
          ...timesheet,
          contractor_name: contractor?.full_name || 'Unknown',
          contractor_email: contractor?.email || '',
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          entries,
          flags
        };
      })
    );

    // Calculate summary stats
    const stats = {
      pending: submissionsWithDetails.filter(s => s.status === 'submitted').length,
      approved_this_week: submissionsWithDetails.filter(s => {
        if (s.status !== 'approved' || !s.approved_at) return false;
        const approvedDate = new Date(s.approved_at);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        return approvedDate >= weekStart;
      }).length,
      total_hours_pending: submissionsWithDetails
        .filter(s => s.status === 'submitted')
        .reduce((sum, s) => sum + s.total_hours, 0),
      total_amount_pending: submissionsWithDetails
        .filter(s => s.status === 'submitted')
        .reduce((sum, s) => sum + (s.total_amount || 0), 0),
      overtime_alerts: submissionsWithDetails.filter(s => s.flags.includes('overtime')).length
    };

    return NextResponse.json({
      success: true,
      submissions: submissionsWithDetails,
      stats
    });

  } catch (error) {
    console.error("Error loading admin timesheets:", error);
    return NextResponse.json(
      { 
        error: "Failed to load timesheets",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}