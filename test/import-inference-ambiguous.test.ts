import { describe, it, expect } from 'vitest'
import { inferHeaderMapping } from '../src/lib/importHeaderInference'

describe('inferHeaderMapping ambiguous headers', () => {
  it('returns multiple candidates for ambiguous header "id"', () => {
    const headers = ['id', 'email']
    const samples = [ { id: '12345', email: 'alice@example.com' }, { id: '67890', email: 'bob@example.com' } ]
    const res = inferHeaderMapping(headers, samples as any)
    expect(res).toHaveProperty('id')
    const idInfo = res['id']
    expect(idInfo).toBeDefined()
    // should have at least two alternatives (claimId and externalId) with non-zero confidence
    const allTargets = [idInfo.top, ...idInfo.alternatives].filter(Boolean).map((c:any) => c.target)
    expect(allTargets).toContain('claimId')
    expect(allTargets).toContain('externalId')
    // confidences should be numeric between 0 and 1
    const allConfs = [idInfo.top, ...idInfo.alternatives].filter(Boolean).map((c:any) => c.confidence)
    for (const v of allConfs) expect(typeof v).toBe('number')
  })

  it('gives high confidence to email header when samples contain emails', () => {
    const headers = ['Email Address']
    const samples = [ { 'Email Address': 'charlie@example.com' }, { 'Email Address': 'd@example.org' } ]
    const res = inferHeaderMapping(headers, samples as any)
    expect(res['Email Address'].top?.target).toBe('email')
    expect(res['Email Address'].top?.confidence).toBeGreaterThan(0.8)
  })
})
