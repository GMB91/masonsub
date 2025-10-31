"use client"
import React from "react"

export default function DuplicateDialog({ open, onClose }: { open: boolean; onClose?: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold">Potential Duplicates</h3>
        <p className="text-sm text-slate-600">Review duplicates before import.</p>
        <div className="mt-4 flex justify-end gap-2"><button onClick={onClose} className="px-3 py-1">Close</button></div>
      </div>
    </div>
  )
}
