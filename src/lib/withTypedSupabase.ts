// [AUTO-GEN-START] Typed Supabase Client Wrapper
// Generated: 2025-11-05
// Strategy: Type-safe Supabase client with automatic table type inference
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Type helper to extract table row types
export type Table<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Type helper for insert operations
export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

// Type helper for update operations
export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create typed Supabase client (lazy initialization)
let _typedClient: SupabaseClient<Database> | null = null;

function getTypedClient(): SupabaseClient<Database> {
  if (!_typedClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials not available - using placeholder");
      // Return a mock client for build-time
      return {} as SupabaseClient<Database>;
    }
    _typedClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _typedClient;
}

// Export typed client with lazy initialization
export function getSupabaseTypedClient(): SupabaseClient<Database> {
  return getTypedClient();
}

// Export as default for convenience
export const supabaseTyped = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getTypedClient() as any;
    return client[prop];
  },
  set(_t, prop, value) {
    const client = getTypedClient() as any;
    client[prop] = value;
    return true;
  },
});

// Export Database type for external use
export type { Database };

// ============================================================================
// Usage Examples:
// ============================================================================

/*
// 1. Typed query with automatic inference:
const { data } = await supabaseTyped
  .from("claimants")
  .select("id, full_name, state, amount");
// data is typed as Claimant[]

// 2. Typed insert:
const newClaimant: TableInsert<"claimants"> = {
  full_name: "John Doe",
  state: "NSW",
  amount: 5000,
};
const { data } = await supabaseTyped.from("claimants").insert(newClaimant);

// 3. Typed update:
const updates: TableUpdate<"claimants"> = {
  amount: 6000,
};
await supabaseTyped.from("claimants").update(updates).eq("id", "123");

// 4. Use Table type in components:
type Claimant = Table<"claimants">;
const claimant: Claimant = { ... };
*/

// [AUTO-GEN-END]
