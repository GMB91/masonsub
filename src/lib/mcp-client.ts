/**
 * MCP Client for Next.js/React
 * Connects to Supabase via Model Context Protocol
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface MCPConfig {
  mcpUrl?: string;
  supabaseUrl?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

export class MCPClient {
  private config: MCPConfig;

  constructor() {
    // In development mode, disable MCP client to reduce Supabase instances
    if (process.env.NODE_ENV === 'development') {
      console.warn('MCP_SERVER_URL not found, using direct Supabase connection');
      this.config = {};
      return;
    }
    
    this.config = {
      mcpUrl: process.env.MCP_SERVER_URL || process.env.NEXT_PUBLIC_MCP_SERVER_URL,
      // Support both MCP_* and standard SUPABASE_* envs
      supabaseUrl:
        process.env.MCP_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL,
      anonKey:
        process.env.MCP_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        (process as any).env.SUPABASE_KEY,
      serviceRoleKey:
        process.env.MCP_SUPABASE_SERVICE_ROLE_KEY ||
        (process as any).env.SUPABASE_SERVICE_ROLE_KEY ||
        (process as any).env.SUPABASE_SERVICE_KEY,
    };

    if (!this.config.mcpUrl) {
      console.warn('MCP_SERVER_URL not found, using direct Supabase connection');
    }
  }

  service(serviceName: string): SupabaseClient {
    if (serviceName === 'supabase') {
      return this.connectSupabase();
    }
    throw new Error(`Unknown service: ${serviceName}`);
  }

  private connectSupabase(): SupabaseClient {
    // In development, return a mock client to avoid multiple instances
    if (process.env.NODE_ENV === 'development') {
      return createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    }
    
    if (!this.config.supabaseUrl || !this.config.anonKey) {
      // Defer hard failure: return a client-like error thrower that only errors on use
      const error = new Error('Supabase credentials not found in environment');
      const handler: ProxyHandler<any> = {
        get() {
          throw error;
        },
        apply() {
          throw error;
        },
      };
      return new Proxy({}, handler) as unknown as SupabaseClient;
    }

    // Use service role key if available (server-side only), otherwise use anon key
    const key = this.config.serviceRoleKey || this.config.anonKey;

    return createClient(this.config.supabaseUrl, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
}

export function createMCPClient(): MCPClient {
  return new MCPClient();
}
