// [AUTO-GEN-START] Supabase Type Binding - Usage Examples
// Generated: 2025-11-05
// Demonstrates how to use typed Supabase client with Zod validation
// ============================================================================

import { supabaseTyped, type Table, type TableInsert } from "@/lib/supabaseClient";
import { SchemaMap, validateForTable, safeValidateForTable } from "@/types/zodSchemas";
import type { Database } from "@/types/database.types";

// ============================================================================
// Example 1: Typed Query with Automatic Inference
// ============================================================================

export async function getClaimants() {
  // TypeScript automatically infers the return type
  const { data, error } = await supabaseTyped
    .from("claimants")
    .select("id, full_name, state, amount, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching claimants:", error);
    return [];
  }

  // data is typed as: Pick<Claimant, "id" | "full_name" | "state" | "amount" | "created_at">[]
  return data;
}

// ============================================================================
// Example 2: Typed Insert with Runtime Validation
// ============================================================================

export async function createClaimant(record: any) {
  // Runtime validation with Zod
  const validatedData = validateForTable("claimants", record);

  // Type-safe insert
  const { data, error } = await supabaseTyped
    .from("claimants")
    .insert(validatedData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create claimant: ${error.message}`);
  }

  return data;
}

// ============================================================================
// Example 3: Typed Update with Partial Schema
// ============================================================================

export async function updateClaimantAmount(id: string, amount: number) {
  // Type-safe update (only specified fields)
  const { data, error } = await supabaseTyped
    .from("claimants")
    .update({ amount })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update claimant: ${error.message}`);
  }

  return data;
}

// ============================================================================
// Example 4: Safe Validation (No Throw)
// ============================================================================

export async function safeCreateTask(record: any) {
  // Safe validation (doesn't throw)
  const validation = safeValidateForTable("tasks", record);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const { data, error } = await supabaseTyped
    .from("tasks")
    .insert(validation.data)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}

// ============================================================================
// Example 5: Complex Query with Relations
// ============================================================================

export async function getClaimantWithNotes(claimantId: string) {
  // Fetch claimant
  const { data: claimant, error: claimantError } = await supabaseTyped
    .from("claimants")
    .select("*")
    .eq("id", claimantId)
    .single();

  if (claimantError) {
    throw new Error(`Claimant not found: ${claimantError.message}`);
  }

  // Fetch related notes
  const { data: notes, error: notesError } = await supabaseTyped
    .from("claim_notes")
    .select("*")
    .eq("claimant_id", claimantId)
    .order("created_at", { ascending: false });

  if (notesError) {
    console.error("Error fetching notes:", notesError);
    return { ...claimant, notes: [] };
  }

  // Return typed result
  return {
    ...claimant,
    notes: notes || [],
  };
}

// ============================================================================
// Example 6: Batch Operations with Validation
// ============================================================================

export async function batchCreateReminders(reminders: any[]) {
  // Validate all reminders
  const validatedReminders = reminders.map((reminder) =>
    validateForTable("reminders", reminder)
  );

  // Batch insert
  const { data, error } = await supabaseTyped
    .from("reminders")
    .insert(validatedReminders)
    .select();

  if (error) {
    throw new Error(`Failed to create reminders: ${error.message}`);
  }

  return data;
}

// ============================================================================
// Example 7: Type-Safe Filter Building
// ============================================================================

export async function searchClaimants(filters: {
  state?: string;
  minAmount?: number;
  search?: string;
}) {
  let query = supabaseTyped.from("claimants").select("*");

  if (filters.state) {
    query = query.eq("state", filters.state);
  }

  if (filters.minAmount !== undefined) {
    query = query.gte("amount", filters.minAmount);
  }

  if (filters.search) {
    query = query.ilike("full_name", `%${filters.search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  return data;
}

// ============================================================================
// Example 8: React Hook with Type Safety
// ============================================================================

/*
import { useQuery } from "@tanstack/react-query";

export function useClaimant(id: string) {
  return useQuery({
    queryKey: ["claimant", id],
    queryFn: async () => {
      const { data, error } = await supabaseTyped
        .from("claimants")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data; // Fully typed as Table<"claimants">
    },
  });
}
*/

// ============================================================================
// Example 9: API Route with Full Type Safety
// ============================================================================

/*
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Runtime validation
    const validatedData = validateForTable("claimants", body);
    
    // Type-safe database operation
    const { data, error } = await supabaseTyped
      .from("claimants")
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ ok: true, claimant: data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Validation failed" },
      { status: 400 }
    );
  }
}
*/

// ============================================================================
// Example 10: Using Table Type in Components
// ============================================================================

/*
import type { Table } from "@/lib/supabaseClient";

type Claimant = Table<"claimants">;
type Task = Table<"tasks">;

interface ClaimantCardProps {
  claimant: Claimant; // Fully typed from database schema
}

export function ClaimantCard({ claimant }: ClaimantCardProps) {
  return (
    <div>
      <h2>{claimant.full_name}</h2>
      <p>State: {claimant.state}</p>
      <p>Amount: ${claimant.amount}</p>
    </div>
  );
}
*/

// [AUTO-GEN-END]
