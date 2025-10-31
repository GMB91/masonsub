import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import tmpStore from '../src/lib/importTmpStore'

const TMP_DIR = path.join(process.cwd(), 'tmp', 'imports')

beforeEach(async () => {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const files = await fs.readdir(TMP_DIR)
  for (const f of files) await fs.unlink(path.join(TMP_DIR, f))
})

describe('importTmpStore TTL enforcement', () => {
  it('throws when snapshot is older than TTL', async () => {
    const id = await tmpStore.writeImportData({ id: 'ttl-test', suggestedMapping: {}, preview: [] })
    const p = path.join(TMP_DIR, `${id}.json`)
    // set mtime to 48 hours ago
    const old = Date.now() - 48 * 3600 * 1000
    await fs.utimes(p, old / 1000, old / 1000)
    try {
      await tmpStore.readImportData(id)
      throw new Error('expected expired')
    } catch (e: any) {
      expect(String(e.message || e)).toContain('expired')
    }
  })
})
