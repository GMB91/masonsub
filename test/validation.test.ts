import { describe, it, expect } from 'vitest'

describe('API validation errors', () => {
  it('POST /api/claimants returns 400 for invalid JSON', async () => {
    const route = await import('../app/api/claimants/route')
    // make a Request with invalid JSON body
    const req = new Request('http://localhost/api/claimants', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid-json}',
    })
    const res: any = await route.POST(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
  })

  it('PUT /api/claimants/[id] returns 400 for invalid JSON', async () => {
    const route = await import('../app/api/claimants/[id]/route')
    const req = new Request('http://localhost/api/claimants/1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: '{not-json}',
    })
    const res: any = await route.PUT(req, { params: { id: '1' } })
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
  })
})
