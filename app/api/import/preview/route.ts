import { NextResponse } from 'next/server'
import parseCsv from '@/lib/csvImport'
import { findPotentialDuplicates } from '@/lib/duplicateDetector'
import inferHeaderMapping, { HeaderInferenceResult } from '@/lib/importHeaderInference'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const org = (form.get('org') as string) || 'demo'
    const mappingRaw = form.get('mapping')

    let mapping: Record<string, string> | null = null
    if (mappingRaw) {
      try {
        mapping = JSON.parse(String(mappingRaw))
      } catch (e) {
        return NextResponse.json({ error: 'Invalid mapping JSON' }, { status: 400 })
      }
    }

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    const text = await file.text()
    const rows = parseCsv(text)
    if (!Array.isArray(rows)) return NextResponse.json({ error: 'Failed to parse CSV' }, { status: 400 })

  const preview = rows.slice(0, 200)
    const duplicates: Array<{ row: number; matches: Array<{ id: string; name: string; external_id?: string }>; reason?: string }> = []
    // suggest a detailed mapping when caller didn't provide one
    const suggestedMappingDetailed: HeaderInferenceResult = mapping
      ? Object.fromEntries(Object.keys(rows[0] || {}).map((k) => [k, { top: mapping[k] ? { target: mapping[k] as any, confidence: 1 } : undefined, alternatives: [] }])) as any
      : inferHeaderMapping(Object.keys(rows[0] || {}))

    for (let i = 0; i < preview.length; i++) {
      const r = preview[i]
      // apply mapping using top candidate when confidence is reasonable
      const mappedRow: Record<string, string> = {}
      const meta = suggestedMappingDetailed as any
      if (meta) {
        for (const k of Object.keys(r)) {
          const info = meta[k] as any
          if (!info) {
            mappedRow[k] = r[k]
            continue
          }
          const top = info.top
          if (top && top.confidence >= 0.7) {
            mappedRow[top.target] = r[k]
            continue
          }
          // fallback: keep raw
          mappedRow[k] = r[k]
        }
      } else {
        for (const k of Object.keys(r)) mappedRow[k] = r[k]
      }

      // pass the mapped row into duplicate detection
      const matches = await findPotentialDuplicates([mappedRow as any], [])
      if (matches && matches.duplicates && matches.duplicates.length > 0) {
        duplicates.push({
          row: i + 1,
          matches: matches.duplicates.map((m: any) => ({
            id: m.id,
            external_id: (m as any).external_id ?? ((m as any).metadata && (m as any).metadata.externalId) ?? null,
            name: ((m as any).name ?? `${(m as any).firstName ?? ''} ${(m as any).lastName ?? ''}`.trim()) || '',
          })),
        })
      }
    }

  return NextResponse.json({ total: rows.length, preview: preview, duplicates, suggestedMapping: suggestedMappingDetailed })
  } catch (err: any) {
    console.error('[api/import/preview] error', err)
    return NextResponse.json({ error: err?.message ?? 'preview failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
