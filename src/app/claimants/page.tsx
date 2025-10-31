import React, { useState } from "react"
import { useClaimants } from '@/lib/hooks/useClaimants'
import ClaimantsTable from '@/components/tables/ClaimantsTable'
import ClaimantForm from '@/components/forms/ClaimantForm'

export default function ClaimantsPage() {
  const { data, isLoading, error } = useClaimants()
  const [creating, setCreating] = useState(false)

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Claimants</h2>
        <div>
          <button onClick={() => setCreating((c) => !c)} className="btn bg-blue-600 text-white px-3 py-2 rounded">{creating ? 'Close' : 'New Claimant'}</button>
        </div>
      </div>
      {creating && <div className="mt-4"><ClaimantForm onSaved={() => setCreating(false)} /></div>}
      <div className="mt-6">
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-600">Failed to load</div>}
        {data && <ClaimantsTable items={data} />}
      </div>
    </section>
  )
}
