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

describe('import end-to-end ingest (module-level)', () => {
  it('submit -> apply -> ingest creates claimants and updates existing', async () => {
    // create existing claimant to be updated
    await store.createClaimant({ id: 'c-existing', name: 'Alice Old', email: 'alice@example.com', org: 'demo' })

    // first CSV: create two claimants
    const csv1 = `Name,Email,ExternalID\nAlice,a@example.com,ext-1\nBob,b@example.com,ext-2\n`
    const file1 = { text: async () => csv1, name: 'test1.csv', type: 'text/csv' } as unknown as File
    const form1 = { get: (k: string) => (k === 'file' ? file1 : k === 'org' ? 'demo' : null) }
    const req1 = { formData: async () => form1, url: 'http://localhost/upload' } as unknown as Request
    const res1: any = await (submitMod as any).POST(req1)
    expect(res1.status).toBeGreaterThanOrEqual(300)

    const files = await fs.readdir(TMP_DIR)
    expect(files.length).toBeGreaterThanOrEqual(1)
    const id = files[0].replace(/\.json$/, '')

    const mapping = JSON.stringify({ Name: 'name', Email: 'email', ExternalID: 'externalId' })
    const form2 = { get: (k: string) => (k === 'id' ? id : k === 'mapping' ? mapping : null) }
    const req2 = { formData: async () => form2, url: 'http://localhost/import/apply' } as unknown as Request
    const res2: any = await (applyMod as any).POST(req2)
    expect(res2.status).toBeGreaterThanOrEqual(300)

    const form3 = { get: (k: string) => (k === 'id' ? id : k === 'org' ? 'demo' : null) }
    const req3 = { formData: async () => form3 } as unknown as Request
    const res3: any = await (ingestMod as any).POST(req3)
    const json3 = await res3.json()
    expect(json3).toHaveProperty('ok', true)
    expect(json3.results).toHaveProperty('created')

    // second CSV: contains an updated Alice and a new person
    const csv2 = `Full Name,Email\nAlice Example,alice@example.com\nNew Person,new@example.com\n`
    const file2 = { text: async () => csv2, name: 'test2.csv', type: 'text/csv' } as unknown as File
    const form4 = { get: (k: string) => (k === 'file' ? file2 : k === 'org' ? 'demo' : null) }
    const req4 = { formData: async () => form4, url: 'http://localhost/upload' } as unknown as Request
    const res4: any = await (submitMod as any).POST(req4)
    expect(res4.status).toBeGreaterThanOrEqual(300)

    const files2 = await fs.readdir(TMP_DIR)
    const id2 = files2.find((f) => f !== `${id}.json`)!.replace(/\.json$/, '')

    const mapping2 = JSON.stringify({ 'Full Name': 'name', Email: 'email' })
    const form5 = { get: (k: string) => (k === 'id' ? id2 : k === 'mapping' ? mapping2 : null) }
    const req5 = { formData: async () => form5, url: 'http://localhost/import/apply' } as unknown as Request
    const res5: any = await (applyMod as any).POST(req5)
    expect(res5.status).toBeGreaterThanOrEqual(300)

    const form6 = { get: (k: string) => (k === 'id' ? id2 : k === 'org' ? 'demo' : null) }
    const req6 = { formData: async () => form6, url: 'http://localhost/import/ingest' } as unknown as Request
    const res6: any = await (ingestMod as any).POST(req6)
  const body6 = await res6.json()
  expect(body6).toHaveProperty('results')
  expect(body6.results.created + body6.results.updated).toBeGreaterThanOrEqual(2)

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
