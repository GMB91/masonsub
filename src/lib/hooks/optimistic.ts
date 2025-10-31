import type { QueryClient, QueryKey } from '@tanstack/react-query'

export function optimisticAdd(qc: QueryClient, key: QueryKey, item: any) {
  const previous = qc.getQueryData<any[]>(key) ?? []
  qc.setQueryData(key, [...previous, item])
  return previous
}

export function optimisticUpdate(qc: QueryClient, key: QueryKey, id: string, patch: Record<string, any>) {
  const previous = qc.getQueryData<any[]>(key) ?? []
  const next = previous.map((it) => {
    if (it.id === id || it.external_id === id) return { ...it, ...patch }
    return it
  })
  qc.setQueryData(key, next)
  return previous
}

export function optimisticRemove(qc: QueryClient, key: QueryKey, id: string) {
  const previous = qc.getQueryData<any[]>(key) ?? []
  const next = previous.filter((it) => !(it.id === id || it.external_id === id))
  qc.setQueryData(key, next)
  return previous
}
