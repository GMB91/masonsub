import { describe, it, expect, vi } from 'vitest'

describe('API error handling (routes)', () => {
  it('POST /api/claimants returns 500 when store.createClaimant throws', async () => {
    vi.resetModules()
    vi.doMock('../src/lib/claimantStore', () => ({
      createClaimant: async () => {
        throw new Error('boom')
      },
    }))

    const route = await import('../app/api/claimants/route')

    const req = new Request('http://localhost/api/claimants', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    })

    const res: any = await route.POST(req)
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body).toHaveProperty('error')
    expect(body.error).toMatch(/Failed to create|Failed/)
  })

  it('GET /api/claimants returns 500 when store.getClaimants throws', async () => {
    vi.resetModules()
    vi.doMock('../src/lib/claimantStore', () => ({
      getClaimants: async () => {
        throw new Error('boom2')
      },
    }))

    const route = await import('../app/api/claimants/route')
    const req = new Request('http://localhost/api/claimants')
    const res: any = await route.GET(req)
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body).toHaveProperty('error')
  })
})
