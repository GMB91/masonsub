import React from "react"
import { useClaimant } from '@/lib/hooks/useClaimants'
import ClaimantForm from '@/components/forms/ClaimantForm'

export default function ClaimantDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useClaimant(params.id)

  if (isLoading) return <div>Loading...</div>

  return (
    <section>
      <h2 className="text-2xl font-semibold">Claimant {params.id}</h2>
      {data ? <ClaimantForm initial={data} /> : <p className="text-sm text-slate-600">Not found</p>}
    </section>
  )
}
