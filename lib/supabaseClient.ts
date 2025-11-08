import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let cachedServiceClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During build time, return a placeholder client
    console.warn('Supabase credentials not available - using placeholder');
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return cachedClient;
}

export function getSupabaseServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // During build time, return a placeholder client
    console.warn('Supabase service credentials not available - using placeholder');
    return createClient('https://placeholder.supabase.co', 'placeholder-service-key');
  }

  if (!cachedServiceClient) {
    cachedServiceClient = createClient(url, key);
  }

  return cachedServiceClient;
}

// No module-level initialization - clients must use getSupabaseClient() or getSupabaseServiceClient()

export type Database = {
  public: {
    Tables: {
      Claimant: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      // Add more table types as needed
    };
  };
};
