import React from "react"
import type { Claimant } from "@/types/claimant"

export default function ClaimantsTable({ items }: { items: Claimant[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow">
      <table className="w-full">
        <thead className="text-left text-sm text-slate-500">
          <tr><th className="p-3">Name</th><th>Amount</th><th>Status</th></tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t"><td className="p-3">{c.firstName} {c.lastName}</td><td>${c.amount}</td><td>{c.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
