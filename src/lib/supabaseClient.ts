// Supabase clients for browser (public) and server (service role).
// The server/client will only be created when SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)
// and SUPABASE_URL are present in the environment. Otherwise the export will be `null` so
// callers can fall back to file-backed or mocked implementations in dev.
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Resolution order:
// 1. Environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_* variants)
// 2. Optional local MCP-provided file at .mcp/supabase.json (opt-in; do NOT commit credentials).
// This lets CI or local tooling write a small creds file when running in ephemeral environments.

function readLocalMcp() {
	try {
		const p = path.join(process.cwd(), '.mcp', 'supabase.json')
		if (!fs.existsSync(p)) return null
		const raw = fs.readFileSync(p, 'utf-8')
		return JSON.parse(raw)
	} catch (e) {
		// ignore parse errors — prefer env vars
		return null
	}
}

const mcp = readLocalMcp()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || (mcp && mcp.url) || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || (mcp && mcp.anonKey) || ''

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || (mcp && mcp.serviceRoleKey) || ''

export const supabaseServer = supabaseUrl && supabaseServiceRoleKey
	? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
	: null

export default supabase
