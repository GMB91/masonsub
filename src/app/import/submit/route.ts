import { NextResponse } from 'next/server'
import parseCsv from '@/lib/csvImport'
import inferHeaderMapping from '@/lib/importHeaderInference'
import tmpStore from '@/lib/importTmpStore'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const org = (form.get('org') as string) || 'demo'

    if (!file) return NextResponse.redirect(new URL('/upload?err=nofile', req.url))
    const text = await file.text()
    const rows = parseCsv(text)
    const preview = rows.slice(0, 200)
    const headers = Object.keys(preview[0] || {})
    const suggestedMapping = inferHeaderMapping(headers)

    // cleanup old temp files (default 24h)
    try {
      await tmpStore.cleanupOld(24)
    } catch (e) {
      // ignore cleanup failures
    }

    const id = await tmpStore.writeImportData({
      filename: file.name,
      preview: rows.slice(0, 10),
      org,
      rowCount: rows.length
    })
    return NextResponse.redirect(new URL(`/upload/result/${id}`, req.url))
  } catch (err: any) {
    console.error('[import/submit] error', err)
    return NextResponse.json({ error: err?.message ?? 'submit failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
