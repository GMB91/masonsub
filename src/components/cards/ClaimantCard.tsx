import React from "react"
import type { Claimant } from "@/types/claimant"

export default function ClaimantCard({ claimant }: { claimant: Claimant }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4">
      <div className="font-semibold">{claimant.firstName} {claimant.lastName}</div>
      <div className="text-sm text-slate-500">{claimant.city} — ${claimant.amount}</div>
    </div>
  )
}
