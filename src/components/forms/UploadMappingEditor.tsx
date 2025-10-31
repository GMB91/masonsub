import React from 'react'
import UploadMappingClient from '@/components/forms/UploadMappingClient'

type Candidate = { target: string; confidence: number }
type HeaderInfo = { top?: Candidate; alternatives: Candidate[] }

export default function UploadMappingEditor({
  id,
  headers,
  suggestedMapping,
  preview,
  mapped,
}: {
  id: string
  headers: string[]
  suggestedMapping: Record<string, HeaderInfo>
  preview: Record<string, string>[]
  mapped?: Record<string, string>[]
}) {
  const commonTargets = ['name', 'email', 'external_id', 'claimId', 'phone', 'address', '']

  return (
    <div className="mt-4">
      <form method="post" action="/import/apply" id={`upload-mapping-form-${id}`}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="mapping" id={`mapping-json-${id}`} />

        <div className="mb-3 text-sm text-slate-600">Tip: review suggested mappings and adjust any column before applying. Confidence badges show how confident the inference is.</div>
        <div className="mb-3 text-sm space-y-2">
          <label className="inline-flex items-center gap-2">
            <input id={`auto-apply-${id}`} defaultChecked type="checkbox" className="rounded" />
            <span>Auto-apply confident mappings</span>
          </label>
          <div className="flex items-center gap-3">
            <label htmlFor={`threshold-${id}`} className="text-sm">Confidence threshold</label>
            <input id={`threshold-${id}`} type="range" min={50} max={95} defaultValue={70} className="w-48" />
            <div id={`threshold-display-${id}`} className="text-sm w-12">70%</div>
          </div>
        </div>

        <div className="grid gap-4">
          {headers.map((h) => {
            const info = suggestedMapping?.[h]
            const top = info?.top
            const conf = top?.confidence ?? 0
            const confPct = Math.round(conf * 100)
            const confBg = conf >= 0.8 ? 'bg-emerald-100 text-emerald-800' : conf >= 0.5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
            return (
              <div key={h} className="p-3 border rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{h}</div>
                    <div id={`suggested-${h}`} className="text-sm text-slate-600">Suggested: {top ? `${top.target} (${confPct}%)` : '—'}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded ${confBg}`}>{top ? `${confPct}%` : '—'}</div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor={`mapping-${encodeURIComponent(h)}`} className="text-sm">Map to</label>
                  <select aria-describedby={`suggested-${h}`} id={`mapping-${encodeURIComponent(h)}`} name={`mapping[${h}]`} defaultValue={top?.target ?? ''} className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200" data-top={top?.target ?? ''} data-confidence={String(top?.confidence ?? 0)}>
                    {commonTargets.map((t) => (
                      <option key={t} value={t}>{t || '(keep raw)'}</option>
                    ))}
                    {info?.alternatives.map((a) => (
                      <option key={a.target} value={a.target}>{a.target} ({Math.round(a.confidence*100)}%)</option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Apply mapping</button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold">Preview (first rows)</h3>
        <div className="overflow-auto mt-2 border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h} className="text-left px-2 py-1 border-b">
                    <div className="flex flex-col">
                      <span className="font-medium">{h}</span>
                          <span className="text-xs text-slate-500" data-preview-mapped-for={h} aria-live="polite" role="status" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(0,5).map((r, i) => (
                <tr key={i}>
                  {headers.map((h) => <td key={h} className="px-2 py-1 border-b">{r[h]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mapped && (
        <div className="mt-6">
          <h3 className="font-semibold">Mapped preview</h3>
          <div className="overflow-auto mt-2 border rounded">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {headers.map((h) => {
                    return (
                      <th key={h} className="text-left px-2 py-1 border-b">
                        <div className="flex flex-col">
                          <span className="font-medium" data-mapped-header-for={h}>{h}</span>
                              <span className="text-xs text-slate-500" data-mapped-original-for={h} aria-live="polite" role="status" />
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {mapped.slice(0,5).map((r, i) => (
                  <tr key={i}>
                    {headers.map((h) => {
                      const val = Object.prototype.hasOwnProperty.call(r, h) ? r[h] : Object.values(r)[0] ?? ''
                      return <td key={h} className="px-2 py-1 border-b">{val}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* client-side behavior moved to UploadMappingClient to avoid inline scripts */}
      {/* @ts-ignore */}
      <UploadMappingClient id={id} headers={headers} suggested={suggestedMapping || {}} />
    </div>
  )
}
