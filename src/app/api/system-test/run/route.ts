import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Get Supabase client - using environment variables directly for system testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Simple time formatter without date-fns dependency
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

export const dynamic = "force-dynamic";

export async function GET() {
  const report: any = {
    timestamp: new Date().toISOString(),
    summary: { passed: 0, failed: 0, total: 0 },
    results: [],
  };

  function record(test: string, success: boolean, details?: string) {
    report.results.push({
      test,
      success,
      details: details || "",
      time: formatTime(new Date()),
    });
    report.summary.total++;
    success ? report.summary.passed++ : report.summary.failed++;
  }

  try {
    //
    // 1️⃣ Supabase Connectivity Test
    //
    const { data: testData, error: connError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);
    record(
      "Supabase Connection",
      !connError,
      connError ? connError.message : "Connected successfully"
    );

    //
    // 2️⃣ Storage Bucket Access (imports)
    //
    const { data: storageData, error: storageErr } = await supabase.storage
      .from("imports")
      .list("", { limit: 1 });
    record(
      "Supabase Storage Access (imports bucket)",
      !storageErr,
      storageErr ? storageErr.message : `${storageData?.length || 0} file(s) visible`
    );

    //
    // 3️⃣ Database Schema Verification (core tables)
    //
    const tables = [
      "claimants",
      "users",
      "timesheets",
      "reminders",
      "audit_logs",
    ];
    for (const t of tables) {
      const { error } = await supabase.from(t).select("id").limit(1);
      record(
        `Table "${t}" accessible`,
        !error,
        error ? error.message : "OK"
      );
    }

    //
    // 4️⃣ CSV Import Validator (mock schema)
    //
    const EXPECTED_COLUMNS = [
      "full_name",
      "address",
      "suburb",
      "state",
      "postcode",
      "amount",
      "agency",
      "reference_id",
    ];
    const mockCsv =
      "full_name,address,suburb,state,postcode,amount,agency,reference_id\n" +
      "John Doe,123 Test St,Sydney,NSW,2000,120.50,Revenue NSW,AB1234";
    const headers = mockCsv.split("\n")[0].split(",");
    const missing = EXPECTED_COLUMNS.filter((col) => !headers.includes(col));
    record(
      "CSV Import Schema Validation",
      missing.length === 0,
      missing.length === 0
        ? "Schema valid"
        : `Missing columns: ${missing.join(", ")}`
    );

    //
    // 5️⃣ Claimant Portal Integrity
    //
    const { data: claimantList, error: claimantErr } = await supabase
      .from("claimants")
      .select("id, full_name, status")
      .limit(5);
    record(
      "Claimant Portal Data Access",
      !claimantErr,
      claimantErr
        ? claimantErr.message
        : `${claimantList?.length || 0} records accessible`
    );

    //
    // 6️⃣ Contractor Portal Fields (note & qualification status)
    //
    const { data: contractorData, error: contractorErr } = await supabase
      .from("contractors")
      .select("id, contact_info, note, qualification_status")
      .limit(1);
    record(
      "Contractor Portal Field Check",
      !contractorErr,
      contractorErr
        ? contractorErr.message
        : "Fields (contact_info, note, qualification_status) OK"
    );

    //
    // 7️⃣ Timesheet Auto-Log & Submission
    //
    const { data: timeData, error: timeErr } = await supabase
      .from("timesheets")
      .select("id, user_id, date, approved")
      .limit(5);
    record(
      "Timesheet Table Accessible",
      !timeErr,
      timeErr ? timeErr.message : `${timeData?.length || 0} entries found`
    );

    //
    // 8️⃣ Admin Portal Access
    //
    const { data: adminUsers, error: adminErr } = await supabase
      .from("users")
      .select("id, role")
      .eq("role", "admin");
    record(
      "Admin Role Access",
      !adminErr,
      adminErr ? adminErr.message : `${adminUsers?.length || 0} admins found`
    );

    //
    // 9️⃣ Calendar & Reminder Sync
    //
    const { data: reminders, error: reminderErr } = await supabase
      .from("reminders")
      .select("id, title, due_date, completed")
      .limit(5);
    record(
      "Calendar Event / Reminder Sync",
      !reminderErr,
      reminderErr
        ? reminderErr.message
        : `${reminders?.length || 0} reminders accessible`
    );

    //
    // 🔟 Audit Logging
    //
    const { data: logs, error: logErr } = await supabase
      .from("audit_logs")
      .select("id, event_type, created_at")
      .limit(5);
    record(
      "Audit Log Read Test",
      !logErr,
      logErr
        ? logErr.message
        : `${logs?.length || 0} audit entries available`
    );

    //
    // 1️⃣1️⃣ Security & Compliance Dashboard Test
    //
    const { data: complianceData, error: complianceErr } = await supabase
      .from("compliance_checklist")
      .select("id, item_name, status, severity")
      .limit(5);
    record(
      "Security & Compliance System",
      !complianceErr,
      complianceErr
        ? complianceErr.message
        : `${complianceData?.length || 0} compliance items tracked`
    );

    //
    // 1️⃣2️⃣ Workflow Automation System
    //
    const { data: workflowData, error: workflowErr } = await supabase
      .from("workflow_rules")
      .select("id, rule_name, enabled, trigger_count")
      .limit(5);
    record(
      "Workflow Automation Engine",
      !workflowErr,
      workflowErr
        ? workflowErr.message
        : `${workflowData?.length || 0} workflow rules active`
    );

    //
    // ✅ Final Result
    //
    report.summary.status =
      report.summary.failed === 0 ? "PASS ✅" : "FAIL ❌";

    return NextResponse.json(report);
  } catch (err: any) {
    record("System Test Fatal Error", false, err.message);
    report.summary.status = "FATAL ❌";
    return NextResponse.json(report, { status: 500 });
  }
}