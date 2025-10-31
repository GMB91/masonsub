"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import parseCsv from '@/lib/csvImport'

type Mapping = Record<string, string>

const TARGET_FIELDS = ['ignore', 'name', 'email', 'phone', 'amount', 'claimId', 'source']

export default function UploadPage() {
  const params = useParams() as { org?: string }
  const org = params?.org ?? 'demo'
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
  const [allRows, setAllRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Mapping>({})
  const [showMapping, setShowMapping] = useState(false)
  const [previewInfo, setPreviewInfo] = useState<{ total?: number; duplicates?: Array<{ row: number; matches: Array<{ id: string; name: string; external_id?: string }> }> } | null>(null)
  const [forceCreateRows, setForceCreateRows] = useState<number[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  useEffect(() => {
    if (!file) {
      setHeaders([])
      setPreviewRows([])
      setMapping({})
      setShowMapping(false)
      setPreviewInfo(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const rows = parseCsv(text)
      setAllRows(rows)
      setPreviewRows(rows.slice(0, 5))
      if (rows.length > 0) setHeaders(Object.keys(rows[0]))
      // initialize mapping heuristically
      const initial: Mapping = {}
      if (rows.length > 0) {
        const keys = Object.keys(rows[0])
        for (const k of keys) {
          const lk = k.toLowerCase()
          if (lk.includes('name')) initial[k] = 'name'
          else if (lk.includes('email')) initial[k] = 'email'
          else if (lk.includes('phone') || lk.includes('mobile')) initial[k] = 'phone'
          else if (lk.includes('amount') || lk.includes('claim')) initial[k] = 'amount'
          else initial[k] = 'ignore'
        }
      }
  setMapping(initial)
      setShowMapping(true)
      // request server-side preview (duplicates) once mapping initialized
      setTimeout(async () => {
        try {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('org', org)
          fd.append('mapping', JSON.stringify(initial))
          const res = await fetch('/api/import/preview', { method: 'POST', body: fd })
          const data = await res.json()
          if (res.ok) setPreviewInfo({ total: data.total, duplicates: data.duplicates })
        } catch (e) {
          // ignore preview errors for now
        }
      }, 200)
    }
    reader.readAsText(file)
  }, [file])

  async function handleImport() {
    if (!file) return setStatus('Select a CSV file first')
    setStatus('Importing...')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('org', org)
      fd.append('mapping', JSON.stringify(mapping))
      const res = await fetch('/api/import', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setStatus(`Import failed: ${data?.error ?? 'unknown'}`)
      } else {
        setStatus(`Imported ${data.imported} rows. ${data.duplicates ?? 0} duplicates, ${data.errors?.length ?? 0} errors.`)
        setShowMapping(false)
      }
    } catch (err: any) {
      setStatus(`Upload error: ${err?.message ?? String(err)}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Import Claimants</h1>
      <p className="text-sm text-slate-600 mb-4">Upload a CSV file (up to 1,000 rows). Map columns to claimant fields before importing.</p>

      <div className="space-y-4">
        <label htmlFor="csv-file" className="sr-only">CSV file</label>
        <input
          id="csv-file"
          aria-label="CSV file"
          title="CSV file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="border rounded-lg p-2"
        />

        {file && (
          <div className="p-4 border rounded">
            <div className="flex items-center justify-between">
              <div className="text-sm">Selected: <strong>{file.name}</strong> ({file.size} bytes)</div>
              <div className="text-sm">Rows preview: {previewRows.length}</div>
            </div>

            {showMapping && headers.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Column mapping</h3>
                <div className="grid grid-cols-1 gap-2">
                  {headers.map((h) => (
                    <div key={h} className="flex items-center gap-3">
                      <div className="w-48 text-sm text-slate-700">{h}</div>
                      <select
                        value={mapping[h] ?? 'ignore'}
                        onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                        className="border rounded px-2 py-1"
                      >
                        {TARGET_FIELDS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="text-xs text-slate-500">Sample: {previewRows[0]?.[h]?.slice?.(0, 60)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="overflow-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="px-2 py-1 text-left border">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="odd:bg-slate-50">
                          {headers.map((h) => (
                            <td key={h} className="px-2 py-1 border">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {previewInfo?.duplicates && previewInfo.duplicates.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Detected duplicates (preview)</h3>
                <div className="space-y-2">
                  {previewInfo.duplicates.map((d) => {
                    const rowIdx = d.row - 1
                    const forced = forceCreateRows.includes(rowIdx)
                    return (
                      <div key={d.row} className="p-2 border rounded flex items-center justify-between">
                        <div className="text-sm">
                          Row {d.row}: {allRows[rowIdx] ? JSON.stringify(allRows[rowIdx]) : '—'}
                          <div className="text-xs text-slate-500">Matches: {d.matches.map((m) => m.external_id ? `${m.name} (${m.external_id})` : m.name).join(', ')}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            setForceCreateRows((s) => s.includes(rowIdx) ? s.filter(x => x !== rowIdx) : [...s, rowIdx])
                          }} className={`px-3 py-1 rounded ${forced ? 'bg-yellow-400' : 'bg-slate-100'}`}>
                            {forced ? 'Will create (override)' : 'Create anyway'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} />
                Skip detected duplicates
              </label>
              <button onClick={async () => {
                // re-run preview with current mapping
                if (!file) return
                setStatus('Refreshing preview...')
                try {
                  const fd = new FormData()
                  fd.append('file', file)
                  fd.append('org', org)
                  fd.append('mapping', JSON.stringify(mapping))
                  const res = await fetch('/api/import/preview', { method: 'POST', body: fd })
                  const data = await res.json()
                  if (res.ok) setPreviewInfo({ total: data.total, duplicates: data.duplicates })
                  setStatus(null)
                } catch (e: any) { setStatus('Preview failed') }
              }} className="bg-slate-100 px-3 py-2 rounded">Refresh preview</button>
              <button onClick={async () => {
                // perform import with skipDuplicates flag
                if (!file) return setStatus('Select a CSV first')
                setStatus('Importing...')
                try {
                  const fd = new FormData()
                  fd.append('file', file)
                  fd.append('org', org)
                  fd.append('mapping', JSON.stringify(mapping))
                  fd.append('skipDuplicates', skipDuplicates ? '1' : '0')
                  const res = await fetch('/api/import', { method: 'POST', body: fd })
                  const data = await res.json()
                  if (!res.ok) {
                    setStatus(`Import failed: ${data?.error ?? 'unknown'}`)
                  } else {
                    setStatus(`Imported ${data.imported} rows. ${data.duplicates ?? 0} duplicates, ${data.errors?.length ?? 0} errors.`)
                    setShowMapping(false)
                    setPreviewInfo(null)
                  }
                } catch (err: any) {
                  setStatus(`Upload error: ${err?.message ?? String(err)}`)
                }
              }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Import with mapping</button>
              <button onClick={async () => {
                // Import only selected rows (non-duplicates + forced creates)
                if (allRows.length === 0) return setStatus('Nothing to import')
                setStatus('Preparing selected import...')
                try {
                  const rowsToSend: Record<string, unknown>[] = []
                  const duplicateRows = new Set((previewInfo?.duplicates ?? []).map(d => d.row - 1))
                  for (let i = 0; i < allRows.length; i++) {
                    const isDup = duplicateRows.has(i)
                    if (isDup && !forceCreateRows.includes(i)) continue
                    const r = allRows[i]
                    const payload: Record<string, unknown> = { org }
                    for (const key of Object.keys(r)) {
                      const target = mapping[key]
                      if (!target || target === 'ignore') continue
                      const value = r[key]
                      if (target === 'name') payload.name = value
                      else if (target === 'email') payload.email = value
                      else if (target === 'phone') payload.phone = value
                      else if (target === 'amount') payload.claimAmount = value
                      else if (target === 'claimId') payload.claimId = value
                      else if (target === 'source') payload.source = value
                    }
                    if (!payload.name || String(payload.name).trim() === '') continue
                    rowsToSend.push(payload)
                  }
                  if (rowsToSend.length === 0) return setStatus('No rows selected to import')
                  const fd = new FormData()
                  fd.append('org', org)
                  fd.append('rows', JSON.stringify(rowsToSend))
                  const res = await fetch('/api/import', { method: 'POST', body: fd })
                  const data = await res.json()
                  if (!res.ok) setStatus(`Import failed: ${data?.error ?? 'unknown'}`)
                  else {
                    setStatus(`Imported ${data.imported} rows. ${data.duplicates ?? 0} duplicates, ${data.errors?.length ?? 0} errors.`)
                    setShowMapping(false)
                    setPreviewInfo(null)
                    setForceCreateRows([])
                    setAllRows([])
                    setFile(null)
                  }
                } catch (err: any) {
                  setStatus(`Selected import error: ${err?.message ?? String(err)}`)
                }
              }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Import selected rows</button>
              <button onClick={() => { setFile(null); setStatus(null); setPreviewInfo(null) }} className="bg-slate-200 px-3 py-2 rounded-lg">Clear</button>
            </div>
          </div>
        )}

        {status && <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">{status}</div>}
      </div>
    </div>
  )
}
