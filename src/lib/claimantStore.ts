/*
  claimantStore: Supabase-first implementation with a file-backed fallback.

  Exports (named and default):
    - getClaimants(org?)
    - getClaimantById(id)
    - createClaimant(payload)
    - updateClaimant(id, patch)
    - deleteClaimant(id)

  Behavior:
    - If `supabaseServer` (service role client) is available, use the 'claimants' table there.
    - Otherwise fall back to a simple file-backed JSON store at ./data/claimants.json so local dev continues to work.
*/
import { promises as fs } from 'fs'
import path from 'path'
import { supabaseServer } from './supabaseClient'
import { updateClaimantWithWorkflows } from './workflows'

type AnyClaimant = Record<string, any> & { id: string; external_id?: string }

function isUuid(str?: string) {
  if (!str) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

const DATA_DIR = process.env.CLAIMANT_DATA_DIR ? path.resolve(process.env.CLAIMANT_DATA_DIR) : path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'claimants.json')

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(FILE)
  } catch {
    await fs.writeFile(FILE, JSON.stringify([]), 'utf-8')
  }
}

async function readAllFile(): Promise<AnyClaimant[]> {
  await ensureFile()
  const raw = await fs.readFile(FILE, 'utf-8')
  try {
    return JSON.parse(raw) as AnyClaimant[]
  } catch {
    return []
  }
}

async function writeAllFile(items: AnyClaimant[]) {
  await ensureFile()
  // write atomically: write to temp file then rename
  const tmp = `${FILE}.tmp`
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf-8')
  try {
    await fs.rename(tmp, FILE)
  } catch (e) {
    // On some Windows setups, fs.rename can fail with EPERM if the target
    // file is open or locked. Fall back to copy+unlink as a more robust
    // atomic-ish replacement, and finally retry rename as a last resort.
    try {
      await fs.copyFile(tmp, FILE)
      await fs.unlink(tmp)
    } catch {
      // If copy/unlink fails, rethrow the original error by attempting
      // the rename once more (allowing the outer caller to see the real
      // failure if it persists).
      await fs.rename(tmp, FILE)
    }
  }
}

export async function upsertClaimant(payload: Record<string, any>) {
  // Try to update by primary id or external_id; if none matched, create a new claimant.
  // This provides idempotent behavior for ingest flows.
  const inputId = payload.id as string | undefined
  const externalId = inputId && !isUuid(inputId) ? inputId : payload.external_id || undefined

  if (supabaseServer) {
    // Attempt update by id
    if (inputId && isUuid(inputId)) {
      const upd = await supabaseServer.from('claimants').update(payload).eq('id', inputId).select().limit(1).maybeSingle()
      if (upd.error) throw upd.error
      if (upd.data) return { action: 'updated', claimant: upd.data as AnyClaimant }
    }
    // Attempt update by external_id
    if (externalId) {
      const upd2 = await supabaseServer.from('claimants').update(payload).eq('external_id', externalId).select().limit(1).maybeSingle()
      if (upd2.error) throw upd2.error
      if (upd2.data) return { action: 'updated', claimant: upd2.data as AnyClaimant }
    }
    // Fallback: insert
    const { data, error } = await supabaseServer.from('claimants').insert({ ...payload }).select().limit(1).maybeSingle()
    if (error) throw error
    return { action: 'created', claimant: (data as AnyClaimant) || null }
  }

  // file-backed logic
  const all = await readAllFile()
  // find by id or external_id
  const idx = all.findIndex((c) => c.id === inputId || (externalId && c.external_id === externalId))
  if (idx !== -1) {
    const updated = { ...all[idx], ...payload }
    all[idx] = updated
    await writeAllFile(all)
    return { action: 'updated', claimant: updated }
  }

  // create
  const created = await createClaimant(payload)
  return { action: 'created', claimant: created }
}

export async function getClaimants(org?: string) {
  if (supabaseServer) {
    let query = supabaseServer.from('claimants').select('*')
    if (org) query = query.eq('org', org)
    const { data, error } = await query
    if (error) throw error
    return (data as AnyClaimant[]) || []
  }
  // fallback file store
  const all = await readAllFile()
  if (!org) return all
  return all.filter((c) => (c.org ?? 'demo') === org)
}

export async function getClaimantById(id: string) {
  if (supabaseServer) {
    // Try by primary id (uuid) first, then by external_id for legacy ids
    let res = await supabaseServer.from('claimants').select('*').eq('id', id).limit(1).maybeSingle()
    if (res.error) throw res.error
    if (res.data) return res.data as AnyClaimant

    // fallback to external_id
    const alt = await supabaseServer.from('claimants').select('*').eq('external_id', id).limit(1).maybeSingle()
    if (alt.error) throw alt.error
    return (alt.data as AnyClaimant) || null
  }
  const all = await readAllFile()
  return all.find((c) => c.id === id || c.external_id === id) || null
}

export async function createClaimant(payload: Record<string, any>) {
  if (supabaseServer) {
    // If caller provided a UUID as id, respect it. If caller provided a legacy/text id
    // (like c-123), store it in external_id and generate a UUID for the primary id.
    const inputId = payload.id as string | undefined
    const externalId = inputId && !isUuid(inputId) ? inputId : undefined
    const id = inputId && isUuid(inputId) ? inputId : (globalThis.crypto && (globalThis.crypto as any).randomUUID ? (globalThis.crypto as any).randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`)

    const record: Record<string, any> = {
      id,
      ...payload,
    }
    if (externalId) {
      record.external_id = externalId
      // avoid inserting the legacy id value into the uuid id column
      delete record.id // will be re-set below
      record.id = id
    }

    const { data, error } = await supabaseServer.from('claimants').insert(record).select().limit(1).maybeSingle()
    if (error) throw error

    let created = (data as AnyClaimant) || null
    try {
      created = await updateClaimantWithWorkflows(null, created)
      // persist any workflow-attached data (dev/stub enrichments)
      if (created?.enriched_data) {
        await supabaseServer.from('claimants').update({ enriched_data: created.enriched_data }).eq('id', created.id)
      }
    } catch (e) {
      // swallow workflow errors; workflows should not break create
      // eslint-disable-next-line no-console
      console.warn('[claimantStore] workflows failed:', (e as any)?.message || e)
    }
    return created
  }
  const all = await readAllFile()
  const inputId = payload.id as string | undefined
  const externalId = inputId && !isUuid(inputId) ? inputId : undefined
  const id = inputId && isUuid(inputId) ? inputId : (payload.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
  const claimant: AnyClaimant = {
    id,
    ...payload,
  }
  if (externalId) claimant.external_id = externalId
  all.push(claimant)
  await writeAllFile(all)

  // run workflows in dev: if they add enriched_data, persist it
  try {
    const after = await updateClaimantWithWorkflows(null, claimant)
    if (after?.enriched_data) {
      const idx = all.findIndex((c) => c.id === after.id || c.external_id === after.external_id)
      if (idx !== -1) {
        all[idx] = after
        await writeAllFile(all)
      }
      return after
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[claimantStore] workflows failed (file):', (e as any)?.message || e)
  }

  return claimant
}

export async function updateClaimant(id: string, patch: Partial<AnyClaimant>) {
  if (supabaseServer) {
    // fetch existing claimant for workflows
    const existingRes = await supabaseServer.from('claimants').select('*').or(`id.eq.${id},external_id.eq.${id}`).limit(1).maybeSingle()
    if (existingRes.error) throw existingRes.error
    const oldClaimant = (existingRes.data as AnyClaimant) || null

    // Try update by primary id first
    let res = await supabaseServer.from('claimants').update(patch).eq('id', id).select().limit(1).maybeSingle()
    if (res.error) throw res.error
    let updated = (res.data as AnyClaimant) || null
    if (!updated) {
      // fallback: try update by external_id
      const alt = await supabaseServer.from('claimants').update(patch).eq('external_id', id).select().limit(1).maybeSingle()
      if (alt.error) throw alt.error
      updated = (alt.data as AnyClaimant) || null
    }

    if (updated) {
      try {
        const after = await updateClaimantWithWorkflows(oldClaimant, updated)
        if (after?.enriched_data) {
          await supabaseServer.from('claimants').update({ enriched_data: after.enriched_data }).eq('id', after.id)
        }
        return after
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[claimantStore] workflows failed:', (e as any)?.message || e)
        return updated
      }
    }
    return null
  }
  const all = await readAllFile()
  const idx = all.findIndex((c) => c.id === id || c.external_id === id)
  if (idx === -1) return null
  const oldClaimant = all[idx]
  const updated = { ...all[idx], ...patch }
  all[idx] = updated
  await writeAllFile(all)
  try {
    const after = await updateClaimantWithWorkflows(oldClaimant, updated)
    if (after && after !== updated) {
      all[idx] = after
      await writeAllFile(all)
      return after
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[claimantStore] workflows failed (file):', (e as any)?.message || e)
  }
  return updated
}

export async function deleteClaimant(id: string) {
  if (supabaseServer) {
    // Try delete by primary id first
    let res = await supabaseServer.from('claimants').delete().eq('id', id)
    if (res.error) throw res.error
    if (res.count && res.count > 0) return true

    // fallback: delete by external_id
    const alt = await supabaseServer.from('claimants').delete().eq('external_id', id)
    if (alt.error) throw alt.error
    return !!(alt.count && alt.count > 0)
  }
  const all = await readAllFile()
  const filtered = all.filter((c) => c.id !== id && c.external_id !== id)
  if (filtered.length === all.length) return false
  await writeAllFile(filtered)
  return true
}

const store = {
  getClaimants,
  getClaimantById,
  createClaimant,
  updateClaimant,
  deleteClaimant,
  upsertClaimant,
}

export default store
