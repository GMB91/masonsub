import { describe, it, expect, beforeEach } from 'vitest'
import * as submitMod from '../src/app/import/submit/route'
import * as applyMod from '../src/app/import/apply/route'
import fs from 'fs/promises'
import path from 'path'

const TMP_DIR = path.join(process.cwd(), 'tmp', 'imports')

beforeEach(async () => {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const files = await fs.readdir(TMP_DIR)
  for (const f of files) await fs.unlink(path.join(TMP_DIR, f))
})

describe('import submit/apply routes', () => {
  it('saves inferred mapping and preview on submit', async () => {
    const csv = `Full Name,Email\nAlice Example,alice@example.com\nBob Smith,bob@example.com\n`
    const file = { text: async () => csv, name: 'test.csv', type: 'text/csv' } as unknown as File
    const form = { get: (k: string) => (k === 'file' ? file : k === 'org' ? 'demo' : null) }
    const req = { formData: async () => form, url: 'http://localhost/upload' } as unknown as Request

    const res: any = await (submitMod as any).POST(req)
    // expect a redirect
    expect(res.status).toBeGreaterThanOrEqual(300)

    const files = await fs.readdir(TMP_DIR)
    expect(files.length).toBeGreaterThanOrEqual(1)
    const raw = await fs.readFile(path.join(TMP_DIR, files[0]), 'utf-8')
    const data = JSON.parse(raw)
    expect(data).toHaveProperty('suggestedMapping')
    expect(data).toHaveProperty('preview')
    expect(Array.isArray(data.preview)).toBe(true)
  })

  it('applies a mapping and stores mapped results', async () => {
    // first submit
    const csv = `Full Name,Email\nAlice Example,alice@example.com\n`
    const file = { text: async () => csv, name: 'test.csv', type: 'text/csv' } as unknown as File
    const form = { get: (k: string) => (k === 'file' ? file : k === 'org' ? 'demo' : null) }
    const req = { formData: async () => form, url: 'http://localhost/upload' } as unknown as Request
    await (submitMod as any).POST(req)

    const files = await fs.readdir(TMP_DIR)
    expect(files.length).toBeGreaterThanOrEqual(1)
    const id = files[0].replace(/\.json$/, '')

    // apply mapping: map 'Full Name' -> 'name', 'Email' -> 'email'
    const mapping = JSON.stringify({ 'Full Name': 'name', Email: 'email' })
    const form2 = { get: (k: string) => (k === 'id' ? id : k === 'mapping' ? mapping : null) }
    const req2 = { formData: async () => form2, url: 'http://localhost/import/apply' } as unknown as Request
    const res2: any = await (applyMod as any).POST(req2)
    expect(res2.status).toBeGreaterThanOrEqual(300)

    const raw = await fs.readFile(path.join(TMP_DIR, `${id}.json`), 'utf-8')
    const data = JSON.parse(raw)
    expect(data).toHaveProperty('mapped')
    expect(Array.isArray(data.mapped)).toBe(true)
    expect(data.mapped[0]).toHaveProperty('name')
    expect(data.mapped[0]).toHaveProperty('email')
  })
})
