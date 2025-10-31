import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('API route handlers — claimant CRUD (file-backed)', () => {
  let tmpDir: string
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'masonsub-api-'))
    process.env.CLAIMANT_DATA_DIR = tmpDir
    const dataFile = path.join(tmpDir, 'claimants.json')
    await fs.mkdir(path.dirname(dataFile), { recursive: true })
    await fs.writeFile(dataFile, JSON.stringify([]), 'utf-8')
  })

  it('handles create -> list -> get -> update -> delete via route handlers', async () => {
    // import after setting env so claimantStore uses file fallback
    const routes = await import('../app/api/claimants/route')
    const idRoutes = await import('../app/api/claimants/[id]/route')

    // create
    const reqCreate = new Request('http://localhost/api/claimants', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ org: 'test-org', name: 'Alice', email: 'alice@example.com' }),
    })
    const resCreate = await routes.POST(reqCreate)
    const bodyCreate = await resCreate.json()
    expect(bodyCreate).toHaveProperty('claimant')
    const created = bodyCreate.claimant
    expect(created.name).toBe('Alice')
    expect(created).toHaveProperty('id')

    // list
    const resList = await routes.GET(new Request('http://localhost/api/claimants'))
    const listBody = await resList.json()
    expect(Array.isArray(listBody.claimants)).toBe(true)
    expect(listBody.claimants.length).toBeGreaterThanOrEqual(1)

    // get by id
    const ctx = { params: { id: created.id } }
    const resGet = await idRoutes.GET(new Request('http://localhost/api/claimants/' + created.id), ctx)
    const getBody = await resGet.json()
    expect(getBody.claimant).toBeTruthy()
    expect(getBody.claimant.name).toBe('Alice')

    // update
    const reqUpdate = new Request('http://localhost/api/claimants/' + created.id, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Updated' }),
    })
    const resUpdate = await idRoutes.PUT(reqUpdate, ctx)
    const updBody = await resUpdate.json()
    expect(updBody.claimant).toBeTruthy()
    expect(updBody.claimant.name).toBe('Alice Updated')

    // delete
    const resDel = await idRoutes.DELETE(new Request('http://localhost/api/claimants/' + created.id), ctx)
    const delBody = await resDel.json()
    expect(delBody).toHaveProperty('deleted')
    expect(delBody.deleted).toBe(true)
  })
})
