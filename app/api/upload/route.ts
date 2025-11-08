import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabaseClient";
import { findDuplicates, type ClaimantRecord } from "@/lib/dedupe";

interface UploadResponse {
  success: boolean;
  total: number;
  duplicates: number;
  fresh: number;
  stagingId?: string;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<UploadResponse>> {
  const supabase = getSupabaseServiceClient();
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const action = formData.get("action") as string; // "preview" | "import" | "confirm"
    const stagingId = formData.get("stagingId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, total: 0, duplicates: 0, fresh: 0, error: "No file provided" },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    const records = parseCSV(text);

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, total: 0, duplicates: 0, fresh: 0, error: "No valid records found" },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case "preview":
        return handlePreview(records);
      
      case "import":
        return handleImport(records, file.name);
      
      case "confirm":
        if (!stagingId) {
          return NextResponse.json(
            { success: false, total: 0, duplicates: 0, fresh: 0, error: "Staging ID required" },
            { status: 400 }
          );
        }
        return handleConfirm(stagingId);
      
      default:
        return NextResponse.json(
          { success: false, total: 0, duplicates: 0, fresh: 0, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, total: 0, duplicates: 0, fresh: 0, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle preview action - check for duplicates but don't save
 */
async function handlePreview(records: ClaimantRecord[]): Promise<NextResponse<UploadResponse>> {
  const supabase = getSupabaseServiceClient();
  // Fetch existing claimants for duplicate check
  const { data: existingClaimants, error } = await supabase
    .from("claimants")
    .select("full_name, dob, state");

  if (error) throw error;

  // Find duplicates
  const { duplicates, unique } = findDuplicates(records);

  return NextResponse.json({
    success: true,
    total: records.length,
    duplicates: duplicates.length,
    fresh: unique.length,
  });
}

/**
 * Handle import action - save to staging table
 */
async function handleImport(
  records: ClaimantRecord[],
  filename: string
): Promise<NextResponse<UploadResponse>> {
  const supabase = getSupabaseServiceClient();
  // Fetch existing claimants for duplicate check
  const { data: existingClaimants, error: fetchError } = await supabase
    .from("claimants")
    .select("full_name, dob, state");

  if (fetchError) throw fetchError;

  // Find duplicates
  const { duplicates, unique } = findDuplicates(records);

  // Create staging batch
  const { data: staging, error: stagingError } = await supabase
    .from("staging_imports")
    .insert({
      filename,
      total_records: records.length,
      duplicate_count: duplicates.length,
      fresh_count: unique.length,
      status: "pending",
    })
    .select("id")
    .single();

  if (stagingError) throw stagingError;

  // Insert records into staging_claimants
  const stagingRecords = records.map((record) => ({
    ...record,
    staging_import_id: staging.id,
    is_duplicate: duplicates.some(
      (dup) =>
        dup.full_name === record.full_name &&
        dup.dob === record.dob &&
        dup.state === record.state
    ),
  }));

  const { error: insertError } = await supabase
    .from("staging_claimants")
    .insert(stagingRecords);

  if (insertError) throw insertError;

  return NextResponse.json({
    success: true,
    total: records.length,
    duplicates: duplicates.length,
    fresh: unique.length,
    stagingId: staging.id,
  });
}

/**
 * Handle confirm action - move staging data to main table
 */
async function handleConfirm(stagingId: string): Promise<NextResponse<UploadResponse>> {
  const supabase = getSupabaseServiceClient();
  // Fetch staging records
  const { data: stagingRecords, error: fetchError } = await supabase
    .from("staging_claimants")
    .select("*")
    .eq("staging_import_id", stagingId)
    .eq("is_duplicate", false); // Only import non-duplicates by default

  if (fetchError) throw fetchError;

  if (!stagingRecords || stagingRecords.length === 0) {
    return NextResponse.json({
      success: true,
      total: 0,
      duplicates: 0,
      fresh: 0,
    });
  }

  // Insert into claimants table
  const claimants = stagingRecords.map((record: any) => ({
    full_name: record.full_name,
    email: record.email,
    phone: record.phone,
    dob: record.dob,
    address: record.address,
    state: record.state,
    amount: record.amount,
    source: record.source,
    status: "active",
  }));

  const { error: insertError } = await supabase.from("claimants").insert(claimants);

  if (insertError) throw insertError;

  // Update staging import status
  await supabase
    .from("staging_imports")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", stagingId);

  return NextResponse.json({
    success: true,
    total: claimants.length,
    duplicates: 0,
    fresh: claimants.length,
  });
}

/**
 * Simple CSV parser
 * In production, use a library like papaparse
 */
function parseCSV(text: string): ClaimantRecord[] {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const records: ClaimantRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const record: any = {};

    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });

    records.push(record as ClaimantRecord);
  }

  return records;
}
