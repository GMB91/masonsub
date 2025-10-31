import fs from 'fs/promises'
import path from 'path'

const TMP_DIR = path.join(process.cwd(), 'tmp', 'imports')

export async function ensureTmpDir() {
  await fs.mkdir(TMP_DIR, { recursive: true })
}

export function makeId() {
  return (globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
}

export async function writeImportData(obj: any) {
  await ensureTmpDir()
  const id = obj.id ?? makeId()
  const savePath = path.join(TMP_DIR, `${id}.json`)
  await fs.writeFile(savePath, JSON.stringify({ ...obj, id }, null, 2), 'utf-8')
  return id
}

export async function readImportData(id: string) {
  const p = path.join(TMP_DIR, `${id}.json`)
  const st = await fs.stat(p)
  // enforce TTL when reading: default 24 hours unless IMPORT_TMP_TTL_HOURS is set
  const hoursEnv = Number(process.env.IMPORT_TMP_TTL_HOURS)
  const hours = Number.isFinite(hoursEnv) && hoursEnv > 0 ? hoursEnv : 24
  const cutoff = Date.now() - hours * 3600 * 1000
  if (st.mtimeMs < cutoff) {
    // treat as expired
    throw new Error('import snapshot expired')
  }
  const raw = await fs.readFile(p, 'utf-8')
  return JSON.parse(raw)
}

export async function applyMapping(id: string, mapping: Record<string, string>) {
  const data = await readImportData(id)
  const preview: Record<string, string>[] = data.preview || []
  const mapped = preview.map((r) => {
    const out: Record<string, string> = {}
    for (const key of Object.keys(r)) {
      const target = mapping[key]
      if (target && target !== '') out[target] = r[key]
      else out[key] = r[key]
    }
    return out
  })
  data.mapped = mapped
  await writeImportData(data)
  return data
}

export async function cleanupOld(hours = 24) {
  await ensureTmpDir()
  const files = await fs.readdir(TMP_DIR)
  const now = Date.now()
  const cutoff = now - hours * 3600 * 1000
  for (const f of files) {
    try {
      const st = await fs.stat(path.join(TMP_DIR, f))
      if (st.mtimeMs < cutoff) {
        await fs.unlink(path.join(TMP_DIR, f))
      }
    } catch (e) {
      // ignore
    }
  }
}

export async function listTempFiles() {
  await ensureTmpDir()
  return await fs.readdir(TMP_DIR)
}

export default { ensureTmpDir, writeImportData, readImportData, applyMapping, cleanupOld, listTempFiles }
