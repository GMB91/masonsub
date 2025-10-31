import { describe, it, expect, beforeEach } from 'vitest'
import * as submitMod from '../src/app/import/submit/route'
import * as applyMod from '../src/app/import/apply/route'
import * as ingestMod from '../src/app/import/ingest/route'
import store from '../src/lib/claimantStore'
import fs from 'fs/promises'
import path from 'path'

const TMP_DIR = path.join(process.cwd(), 'tmp', 'imports')
const DATA_FILE = path.join(process.cwd(), 'data', 'claimants.json')

beforeEach(async () => {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const files = await fs.readdir(TMP_DIR)
  for (const f of files) await fs.unlink(path.join(TMP_DIR, f))
  // reset data file
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8')
})

describe('import end-to-end ingest', () => {
  it('applies mapping then ingests rows creating and updating claimants', async () => {
    // create existing claimant to be updated
    await store.createClaimant({ id: 'c-existing', name: 'Alice Old', email: 'alice@example.com', org: 'demo' })

    const csv = `Full Name,Email\nAlice Example,alice@example.com\nNew Person,new@example.com\n`
    const file = { text: async () => csv, name: 'test.csv', type: 'text/csv' } as unknown as File
    const form = { get: (k: string) => (k === 'file' ? file : k === 'org' ? 'demo' : null) }
    const req = { formData: async () => form, url: 'http://localhost/upload' } as unknown as Request

    const res: any = await (submitMod as any).POST(req)
    expect(res.status).toBeGreaterThanOrEqual(300)

    const files = await fs.readdir(TMP_DIR)
    expect(files.length).toBeGreaterThanOrEqual(1)
    const id = files[0].replace(/\.json$/, '')

    const mapping = JSON.stringify({ 'Full Name': 'name', Email: 'email' })
    const form2 = { get: (k: string) => (k === 'id' ? id : k === 'mapping' ? mapping : null) }
    const req2 = { formData: async () => form2, url: 'http://localhost/import/apply' } as unknown as Request
    const res2: any = await (applyMod as any).POST(req2)
    expect(res2.status).toBeGreaterThanOrEqual(300)

    // call ingest
    const form3 = { get: (k: string) => (k === 'id' ? id : k === 'org' ? 'demo' : null) }
    const req3 = { formData: async () => form3, url: 'http://localhost/import/ingest' } as unknown as Request
    const res3: any = await (ingestMod as any).POST(req3)
    expect(res3.status).toBeGreaterThanOrEqual(200)
    const body = await res3.json()
    expect(body).toHaveProperty('results')
    expect(body.results.created + body.results.updated).toBeGreaterThanOrEqual(2)

    // verify data file contains both emails and updated name for alice
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const arr = JSON.parse(raw)
    const emails = arr.map((c: any) => c.email)
    expect(emails).toContain('alice@example.com')
    expect(emails).toContain('new@example.com')
    const alice = arr.find((c: any) => c.email === 'alice@example.com')
    expect(alice.name).toBe('Alice Example')
  })
})
