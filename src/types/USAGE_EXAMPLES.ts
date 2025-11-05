// [AUTO-GEN-START] Example API Route with Zod Validation
// This demonstrates how to use the generated schemas in API routes
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { ClaimantSchema, TaskSchema, PaymentSchema } from "@/types/zodSchemas";
import { getSupabaseServiceClient } from "@/lib/supabaseClient";

// Example: POST /api/claimants - Create claimant with validation
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    
    // Runtime validation with Zod - throws if invalid
    const validatedData = ClaimantSchema.parse(json);
    
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
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

// Example: POST /api/tasks - Create task with validation
export async function createTask(req: NextRequest) {
  const json = await req.json();
  
  // Validate task data
  const validatedTask = TaskSchema.parse(json);
  
  // Type-safe database operation
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert(validatedTask)
    .select()
    .single();
  
  return { data, error };
}

// Example: Form validation in a React component
/*
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClaimantSchema } from "@/types/zodSchemas";
import type { Claimant } from "@/types/entities";

export function ClaimantForm() {
  const form = useForm<Claimant>({
    resolver: zodResolver(ClaimantSchema),
    defaultValues: {
      full_name: "",
      state: "",
    },
  });
  
  const onSubmit = async (data: Claimant) => {
    const response = await fetch("/api/claimants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log(result);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("full_name")} />
      <input {...form.register("state")} />
      <button type="submit">Submit</button>
    </form>
  );
}
*/

// Example: Update operations with partial schemas
/*
import { ClaimantUpdateSchema } from "@/types/zodSchemas";

export async function PATCH(req: NextRequest) {
  const json = await req.json();
  
  // Validate partial update (only provided fields)
  const updates = ClaimantUpdateSchema.parse(json);
  
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("claimants")
    .update(updates)
    .eq("id", json.id)
    .select()
    .single();
  
  return NextResponse.json({ ok: !error, data, error });
}
*/

// [AUTO-GEN-END]
