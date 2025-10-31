import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('workflows unit', () => {
  it('updateClaimantWithWorkflows attaches enriched_data and persists trace (file-backed)', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'masonsub-'))
    const prev = process.env.CLAIMANT_DATA_DIR
    try {
      process.env.CLAIMANT_DATA_DIR = tmp
      const workflows = await import('../src/lib/workflows')
      const traceStore = await import('../src/lib/traceStore')

      const newClaimant = { id: 'cw-1', name: 'W Test', status: 'researching' }
      const after = await workflows.updateClaimantWithWorkflows(null, newClaimant)
      expect(after).toHaveProperty('enriched_data')
      const traces = await traceStore.getTracesForClaimant(after.id)
      expect(traces.length).toBeGreaterThanOrEqual(1)
      expect(traces[0]).toHaveProperty('type', 'skip-trace')
    } finally {
      if (prev === undefined) delete process.env.CLAIMANT_DATA_DIR
      else process.env.CLAIMANT_DATA_DIR = prev
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
})
