"use client"

import React, { useState } from 'react'

export default function TraceViewer() {
  const [claimantId, setClaimantId] = useState('')
  const [traces, setTraces] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchTraces() {
    setLoading(true)
    setError(null)
    setTraces(null)
    try {
      const res = await fetch(`/api/claimants/${encodeURIComponent(claimantId)}/traces`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setTraces(data.traces || [])
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Trace Viewer</h2>
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-2 py-1 flex-1" placeholder="Claimant ID or external id" value={claimantId} onChange={(e) => setClaimantId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={!claimantId || loading} onClick={fetchTraces}>Fetch</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {traces && (
        <div>
          <h3 className="font-medium mb-2">{traces.length} traces</h3>
          <ul className="space-y-2">
            {traces.map((t) => (
              <li key={t.id} className="border rounded p-2 bg-white">
                <div className="text-sm text-gray-600">{new Date(t.timestamp).toLocaleString()}</div>
                <div className="font-mono text-sm mt-1">{t.type} (confidence: {t.confidence ?? '—'})</div>
                <pre className="mt-2 text-xs overflow-x-auto">{JSON.stringify(t.payload, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
