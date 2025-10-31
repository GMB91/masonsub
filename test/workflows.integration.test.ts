import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('workflows integration (file-backed)', () => {
  it('attach enriched_data on create when status becomes researching', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'masonsub-'))
    const prev = process.env.CLAIMANT_DATA_DIR
    try {
      process.env.CLAIMANT_DATA_DIR = tmp
      const store = (await import('../src/lib/claimantStore')) as typeof import('../src/lib/claimantStore')

      const DATA_FILE = path.resolve(tmp, 'data', 'claimants.json')
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
      await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf-8')

      const created = await store.createClaimant({ org: 'test', name: 'Bob', status: 'researching' })
      expect(created).toHaveProperty('id')
      // workflows in dev stub should attach enriched_data
      expect(created).toHaveProperty('enriched_data')
      expect(created.enriched_data).toHaveProperty('confidence')
    } finally {
      if (prev === undefined) delete process.env.CLAIMANT_DATA_DIR
      else process.env.CLAIMANT_DATA_DIR = prev
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
})
