import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('claimantStore API edge cases', () => {
  it('handles create, list (with org), get, update non-existent, delete non-existent', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'masonsub-'))
    const prev = process.env.CLAIMANT_DATA_DIR
    try {
      process.env.CLAIMANT_DATA_DIR = tmp
      const store = (await import('../src/lib/claimantStore')) as typeof import('../src/lib/claimantStore')

  const DATA_FILE = path.resolve(tmp, 'data', 'claimants.json')
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf-8')

      // create two claimants in different orgs
      const a = await store.createClaimant({ org: 'org-a', name: 'Alice' })
      const b = await store.createClaimant({ org: 'org-b', name: 'Bob' })

      expect(a).toHaveProperty('id')
      expect(b).toHaveProperty('id')
      expect(a.id).not.toBe(b.id)

      // listing
      const all = await store.getClaimants()
      expect(all.length).toBe(2)
      const onlyA = await store.getClaimants('org-a')
      expect(onlyA.length).toBe(1)
      expect(onlyA[0].name).toBe('Alice')

      // get by id
      const got = await store.getClaimantById(a.id)
      expect(got).not.toBeUndefined()
      expect(got?.name).toBe('Alice')

      // update non-existent id should return null
      const upd = await store.updateClaimant('no-such-id', { name: 'X' })
      expect(upd).toBeNull()

      // delete non-existent id should return false
      const del = await store.deleteClaimant('no-such-id')
      expect(del).toBe(false)
    } finally {
      if (prev === undefined) delete process.env.CLAIMANT_DATA_DIR
      else process.env.CLAIMANT_DATA_DIR = prev
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
})
