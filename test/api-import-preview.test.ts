import { describe, it, expect, beforeEach } from 'vitest'
import * as routeMod from '../app/api/import/preview/route'
import store from '../src/lib/claimantStore'
import fs from 'fs/promises'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'claimants.json')

beforeEach(async () => {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify([], null, 2), 'utf-8')
  // create two claimants for testing
  await store.createClaimant({ id: 'c-123', name: 'Alice Example', email: 'alice@example.com' })
  await store.createClaimant({ id: 'c-456', name: 'Bob Smith', email: 'bob@example.com' })
})

describe('API /api/import/preview', () => {
  it('returns a preview and detects duplicates by email', async () => {
    const csv = `Full Name,Email\nAlice Example,alice@example.com\nCharlie Other,charlie@example.com\n` 

    const file = { text: async () => csv, name: 'test.csv', type: 'text/csv' } as unknown as File
    const form = { get: (k: string) => {
      if (k === 'file') return file
      if (k === 'org') return 'demo'
      return null
    }}

    const req = { formData: async () => form } as unknown as Request
    const res: any = await (routeMod as any).POST(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toHaveProperty('total')
    expect(body.total).toBe(2)
    expect(body).toHaveProperty('preview')
    expect(body).toHaveProperty('duplicates')
  // header inference should suggest mapping for our CSV headers (detailed form)
  expect(body).toHaveProperty('suggestedMapping')
  // suggestedMapping now includes a detailed object per header with a `top` candidate
  expect(body.suggestedMapping['Full Name']).toBeDefined()
  expect(body.suggestedMapping['Full Name'].top).toBeDefined()
  expect(body.suggestedMapping['Full Name'].top.target).toBe('name')
  expect(body.suggestedMapping['Email']).toBeDefined()
  expect(body.suggestedMapping['Email'].top).toBeDefined()
  expect(body.suggestedMapping['Email'].top.target).toBe('email')
    // first row should match existing Alice by email
    expect(body.duplicates.length).toBeGreaterThanOrEqual(1)
    expect(body.duplicates[0].row).toBe(1)
  })
})
