import { describe, it, expect, beforeEach } from 'vitest'
import { findDuplicate, findPotentialDuplicates } from '../src/lib/duplicateDetector'
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

describe('duplicate detection (import preview)', () => {
  it('matches by email', async () => {
    const all = await store.getClaimants('demo')
    // ensure setup worked
    expect(all.length).toBeGreaterThan(0)
    const dup = findDuplicate({ email: 'alice@example.com' }, all)
    expect(dup).not.toBeNull()
    expect(dup?.reason).toBe('email')
    expect(dup?.claimant.email).toBe('alice@example.com')
  })

  it('matches by external/legacy id', async () => {
    // create claimant with legacy id stored in external_id
    await store.createClaimant({ id: 'legacy-999', name: 'Legacy User', email: 'legacy@example.com' })
    const all = await store.getClaimants('demo')
    const dup = findDuplicate({ id: 'legacy-999' }, all)
    expect(dup).not.toBeNull()
    // implementation maps external id match to reason 'claimId'
    expect(dup?.reason).toBe('claimId')
  })

  it('findPotentialDuplicates returns fuzzy name matches', async () => {
    const matches = await findPotentialDuplicates({ 'Full Name': 'Alice Example' }, 'demo', 0.8)
    expect(matches.length).toBeGreaterThan(0)
    const emails = matches.map((m) => m.email)
    expect(emails).toContain('alice@example.com')
  })
})
