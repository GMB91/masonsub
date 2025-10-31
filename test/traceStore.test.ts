import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('traceStore (file-backed)', () => {
  it('addTrace and getTracesForClaimant persist and retrieve traces', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'masonsub-'))
    const prev = process.env.CLAIMANT_DATA_DIR
    try {
      process.env.CLAIMANT_DATA_DIR = tmp
      const traceStore = (await import('../src/lib/traceStore')) as typeof import('../src/lib/traceStore')

      const claimantId = 'c-test-1'
      await traceStore.addTrace({
        id: 't1',
        claimant_id: claimantId,
        timestamp: new Date().toISOString(),
        type: 'skip-trace',
        payload: { foo: 'bar' },
        confidence: 42,
      })

  const traces = await traceStore.getTracesForClaimant(claimantId)
  expect(traces.length).toBeGreaterThanOrEqual(1)
  const found = traces.find((t: any) => t.id === 't1')
      expect(found).toBeTruthy()
      expect(found?.payload).toMatchObject({ foo: 'bar' })
    } finally {
      if (prev === undefined) delete process.env.CLAIMANT_DATA_DIR
      else process.env.CLAIMANT_DATA_DIR = prev
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
})
