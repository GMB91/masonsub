import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

// note: import routes after setting CLAIMANT_DATA_DIR in the test so the store picks up the env override

describe('API workflows e2e (file-backed)', () => {
  it('creates claimant via POST and GET shows enriched_data and trace persisted', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'masonsub-'))
    const prev = process.env.CLAIMANT_DATA_DIR
    try {
      process.env.CLAIMANT_DATA_DIR = tmp
      // import routes after setting env so the store/traceStore pick up CLAIMANT_DATA_DIR override
      const claimantRoute = await import('../app/api/claimants/route')
      const claimantByIdRoute = await import('../app/api/claimants/[id]/route')

      // initialize empty claimants store file (some tests create under tmp/data historically; ensure both places exist)
      const DATA_FILE = path.resolve(tmp, 'claimants.json')
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
      await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf-8')

      const postReq = new Request('http://localhost/api/claimants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ org: 'test', name: 'E2E Bob', status: 'researching' }),
      })
      const postRes: any = await claimantRoute.POST(postReq)
      expect(postRes.status).toBe(201)
      const postBody = await postRes.json()
      const created = postBody.claimant
      expect(created).toHaveProperty('id')
      expect(created).toHaveProperty('enriched_data')

      // call GET /api/claimants/[id]
      const ctx = { params: { id: created.id } }
  const getRes: any = await claimantByIdRoute.GET(new Request('http://localhost'), ctx)
      expect(getRes.status).toBe(200)
      const getBody = await getRes.json()
      expect(getBody.claimant).toHaveProperty('enriched_data')
      // also check trace_store file contains an entry for this claimant
  const traceFile = path.resolve(tmp, 'trace_history.json')
      const raw = await fs.readFile(traceFile, 'utf-8')
      const traces = JSON.parse(raw)
      const found = traces.find((t: any) => t.claimant_id === created.id)
      expect(found).toBeTruthy()
    } finally {
      if (prev === undefined) delete process.env.CLAIMANT_DATA_DIR
      else process.env.CLAIMANT_DATA_DIR = prev
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
})
