"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Claimant } from '@/types/claimant'
import toast from 'react-hot-toast'
import { optimisticAdd, optimisticUpdate, optimisticRemove } from '@/lib/hooks/optimistic'

export function useClaimants() {
  return useQuery<Claimant[], Error>({
    queryKey: ['claimants'],
    queryFn: async () => {
      const res = await fetch('/api/claimants')
      if (!res.ok) throw new Error('Failed to fetch')
      const body = await res.json()
      return (body?.claimants ?? body) as Claimant[]
    },
  })
}

export function useClaimant(id?: string) {
  return useQuery<Claimant | null, Error>({
    queryKey: ['claimant', id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/claimants/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const body = await res.json()
      return (body?.claimant ?? body) as Claimant
    },
    enabled: !!id,
  })
}

export function useClaimantMutations() {
  const qc = useQueryClient()
  const create = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch('/api/claimants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Create failed')
      return res.json()
    },
    onMutate: async (newBody: any) => {
      await qc.cancelQueries({ queryKey: ['claimants'] })
      const optimisticItem = { id: `tmp-${Date.now().toString(36)}`, ...newBody }
      const previous = optimisticAdd(qc, ['claimants'], optimisticItem)
      return { previous }
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) qc.setQueryData(['claimants'], context.previous)
      toast.error('Create failed')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claimants'] })
      toast.success('Claimant created')
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const res = await fetch(`/api/claimants/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
      if (!res.ok) throw new Error('Update failed')
      return res.json()
    },
    onMutate: async ({ id, patch }: { id: string; patch: any }) => {
      await qc.cancelQueries({ queryKey: ['claimants'] })
      const previous = optimisticUpdate(qc, ['claimants'], id, patch)
      return { previous }
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) qc.setQueryData(['claimants'], context.previous)
      toast.error('Update failed')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claimants'] })
      toast.success('Claimant updated')
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/claimants/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      return res.json()
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['claimants'] })
      const previous = optimisticRemove(qc, ['claimants'], id)
      return { previous }
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) qc.setQueryData(['claimants'], context.previous)
      toast.error('Delete failed')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claimants'] })
      toast.success('Claimant deleted')
    },
  })

  return { create, update, remove }
}
