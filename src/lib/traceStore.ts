import { promises as fs } from 'fs'
import path from 'path'
import { supabaseServer } from './supabaseClient'

const DATA_DIR = process.env.CLAIMANT_DATA_DIR ? path.resolve(process.env.CLAIMANT_DATA_DIR) : path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'trace_history.json')

export type TraceRecord = {
  id: string
  claimant_id: string
  timestamp: string
  type: string
  payload: Record<string, any>
  confidence?: number
}

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(FILE)
  } catch {
    await fs.writeFile(FILE, JSON.stringify([]), 'utf-8')
  }
}

async function readAll(): Promise<TraceRecord[]> {
  await ensureFile()
  const raw = await fs.readFile(FILE, 'utf-8')
  try {
    return JSON.parse(raw) as TraceRecord[]
  } catch {
    return []
  }
}

async function writeAll(items: TraceRecord[]) {
  await ensureFile()
  const tmp = `${FILE}.tmp`
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf-8')
  try {
    await fs.rename(tmp, FILE)
  } catch {
    try {
      await fs.copyFile(tmp, FILE)
      await fs.unlink(tmp)
    } catch {
      await fs.rename(tmp, FILE)
    }
  }
}

// Public API: if a Supabase service client is available, use it; otherwise fall back to file store.
export async function addTrace(trace: TraceRecord) {
  if (supabaseServer) {
    // supabase returns error/data tuple
    const { data, error } = await supabaseServer.from('trace_history').insert({
      id: trace.id,
      claimant_id: trace.claimant_id,
      timestamp: trace.timestamp,
      type: trace.type,
      payload: trace.payload,
      confidence: trace.confidence ?? null,
    })
    if (error) throw error
    return data
  }
  const all = await readAll()
  all.push(trace)
  await writeAll(all)
}

export async function getTracesForClaimant(claimantId: string) {
  if (supabaseServer) {
    const { data, error } = await supabaseServer.from('trace_history').select('*').eq('claimant_id', claimantId).order('timestamp', { ascending: false })
    if (error) throw error
    return (data as any) || []
  }
  const all = await readAll()
  return all.filter((t) => t.claimant_id === claimantId)
}

export default { addTrace, getTracesForClaimant }
