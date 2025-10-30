import { promises as fs } from "fs"
import path from "path"

export type Claimant = {
  id: string
  org: string
  name: string
  email?: string
  phone?: string
  createdAt: string
  [key: string]: unknown
}

// allow overriding data dir for tests via CLAIMANT_DATA_DIR env var
const DATA_DIR = process.env.CLAIMANT_DATA_DIR
  ? path.resolve(process.env.CLAIMANT_DATA_DIR)
  : path.resolve(process.cwd(), "data")
const FILE = path.join(DATA_DIR, "claimants.json")

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(FILE)
  } catch {
    await fs.writeFile(FILE, JSON.stringify([]), "utf-8")
  }
}

async function readAll(): Promise<Claimant[]> {
  await ensureFile()
  const raw = await fs.readFile(FILE, "utf-8")
  try {
    return JSON.parse(raw) as Claimant[]
  } catch {
    return []
  }
}

async function writeAll(items: Claimant[]) {
  await ensureFile()
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf-8")
}

export async function getClaimants(org?: string) {
  const all = await readAll()
  if (!org) return all
  return all.filter((c) => c.org === org)
}

export async function getClaimantById(id: string) {
  const all = await readAll()
  return all.find((c) => c.id === id)
}

export async function createClaimant(payload: Partial<Claimant>) {
  const all = await readAll()
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  const claimant: Claimant = {
    id,
    org: payload.org ?? "demo",
    name: (payload.name as string) ?? "Unnamed",
    email: payload.email as string | undefined,
    phone: payload.phone as string | undefined,
    createdAt: now,
    ...payload,
  }
  all.push(claimant)
  await writeAll(all)
  return claimant
}

export async function updateClaimant(id: string, patch: Partial<Claimant>) {
  const all = await readAll()
  const idx = all.findIndex((c) => c.id === id)
  if (idx === -1) return null
  const updated = { ...all[idx], ...patch }
  all[idx] = updated
  await writeAll(all)
  return updated
}

export async function deleteClaimant(id: string) {
  const all = await readAll()
  const filtered = all.filter((c) => c.id !== id)
  if (filtered.length === all.length) return false
  await writeAll(filtered)
  return true
}

const store = {
  getClaimants,
  getClaimantById,
  createClaimant,
  updateClaimant,
  deleteClaimant,
}

export default store
