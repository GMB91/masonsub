import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { optimisticAdd, optimisticUpdate, optimisticRemove } from '../src/lib/hooks/optimistic'

describe('optimistic helpers', () => {
  it('adds optimistically and rollbacks', () => {
    const qc = new QueryClient()
    qc.setQueryData(['claimants'], [{ id: '1', name: 'A' }])
    const prev = optimisticAdd(qc, ['claimants'], { id: 'tmp-2', name: 'B' })
    const after = qc.getQueryData<any[]>(['claimants'])
    expect(after?.length).toBe(2)
    // rollback
    qc.setQueryData(['claimants'], prev)
    const rolled = qc.getQueryData<any[]>(['claimants'])
    expect(rolled?.length).toBe(1)
  })

  it('updates optimistically and rollbacks', () => {
    const qc = new QueryClient()
    qc.setQueryData(['claimants'], [{ id: '1', name: 'A' }])
    const prev = optimisticUpdate(qc, ['claimants'], '1', { name: 'A2' })
    const after = qc.getQueryData<any[]>(['claimants'])
    expect(after?.[0].name).toBe('A2')
    // rollback
    qc.setQueryData(['claimants'], prev)
    const rolled = qc.getQueryData<any[]>(['claimants'])
    expect(rolled?.[0].name).toBe('A')
  })

  it('removes optimistically and rollbacks', () => {
    const qc = new QueryClient()
    qc.setQueryData(['claimants'], [{ id: '1', name: 'A' }, { id: '2', name: 'B' }])
    const prev = optimisticRemove(qc, ['claimants'], '2')
    const after = qc.getQueryData<any[]>(['claimants'])
    expect(after?.length).toBe(1)
    // rollback
    qc.setQueryData(['claimants'], prev)
    const rolled = qc.getQueryData<any[]>(['claimants'])
    expect(rolled?.length).toBe(2)
  })
})
