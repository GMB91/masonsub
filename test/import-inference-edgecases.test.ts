import { describe, it, expect } from 'vitest'
import { inferHeaderMapping } from '../src/lib/importHeaderInference'

describe('inferHeaderMapping edge cases', () => {
  it('handles headers with punctuation and emoji', () => {
    const headers = ['N@me! 😊', 'E-mail?']
    const sample = [{ 'N@me! 😊': 'Alice Example', 'E-mail?': 'alice@example.com' }]
    const res = inferHeaderMapping(headers, sample as any)
    expect(res['N@me! 😊'].top?.target).toBeDefined()
    expect(res['E-mail?'].top?.target).toBe('email')
  })

  it('uses multi-row consensus for conflicting samples', () => {
    const headers = ['id']
    const sample = [ { id: '123' }, { id: 'abc-legacy' }, { id: '456' } ]
    const res = inferHeaderMapping(headers, sample as any)
    // ambiguous: both numeric and legacy-looking; ensure alternatives exist
    expect(res['id'].alternatives.length).toBeGreaterThanOrEqual(1)
    expect(res['id'].top).toBeDefined()
  })

  it('works with very small sample sets', () => {
    const headers = ['Email']
    const sample: any[] = []
    const res = inferHeaderMapping(headers, sample)
    expect(res['Email'].top).toBeDefined()
  })
})
