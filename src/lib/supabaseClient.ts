// Supabase clients using MCP (Model Context Protocol)
// Unified access to Supabase through centralized MCP configuration
import { createMCPClient } from './mcp-client'
import type { SupabaseClient } from '@supabase/supabase-js'

// [AUTO-GEN-START] Type binding imports
import type { Database } from '@/types/database.types'
export type { Database }
// [AUTO-GEN-END]

// Lazy init to avoid resolving credentials during Next.js build/import time
let _supabase: SupabaseClient | null = null
function getClient(): SupabaseClient {
	if (!_supabase) {
		const mcp = createMCPClient()
		_supabase = mcp.service('supabase')
	}
	return _supabase
}

// Export lazy proxies that act like clients but initialize on first property access
function lazyClient(): SupabaseClient {
	return new Proxy({} as any, {
		get(_target, prop) {
			const client = getClient() as any
			return client[prop]
		},
		set(_t, prop, value) {
			const client = getClient() as any
			client[prop] = value
			return true
		},
		apply(_t, thisArg, argArray) {
			const client = getClient() as any
			return client.apply(thisArg, argArray)
		},
	}) as unknown as SupabaseClient
}

export const supabase: SupabaseClient = lazyClient()
export const supabaseServer: SupabaseClient = supabase

// [AUTO-GEN-START] Typed client exports
// Import typed client for type-safe queries
// Usage: import { supabaseTyped } from '@/lib/supabaseClient'
export { supabaseTyped, getSupabaseTypedClient } from './withTypedSupabase'
export type { Table, TableInsert, TableUpdate } from './withTypedSupabase'
// [AUTO-GEN-END]

export default supabase
