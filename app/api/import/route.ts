import { NextResponse } from 'next/server'
import parseCsv from '@/lib/csvImport'
import store from '@/lib/claimantStore'
import duplicateDetector from '@/lib/duplicateDetectorImpl'

function normalizeKey(k: string) {
  return k.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function mapRowToClaimant(row: Record<string, string>, org = 'demo') {
  const normalized: Record<string, string> = {}
  for (const k of Object.keys(row)) {
    normalized[normalizeKey(k)] = (row[k] ?? '').trim()
  }

  // heuristics for common column names
  const name = normalized['name'] || normalized['fullname'] || normalized['fullnam'] || ''
  const email = normalized['email'] || normalized['emailaddress'] || ''
  const phone = normalized['phone'] || normalized['phonenumber'] || normalized['mobile'] || ''
  const claimAmount = normalized['amount'] || normalized['claimamount'] || ''
  const claimId = normalized['claimid'] || normalized['claim'] || normalized['clmid'] || ''
  const source = normalized['source'] || normalized['datasource'] || ''

  const out: Record<string, unknown> = {
    org,
    name: name || 'Unnamed',
  }
  if (email) out.email = email
  if (phone) out.phone = phone
  if (claimAmount) out.claimAmount = claimAmount
  if (claimId) out.claimId = claimId
  if (source) out.source = source
  return out
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const rowsRaw = form.get('rows')
    const file = form.get('file') as File | null
    const orgFromForm = form.get('org')?.toString()
    const url = new URL(req.url)
    const org = orgFromForm ?? url.searchParams.get('org') ?? 'demo'

    let rows: Record<string, string>[] = []
    // If client sent a JSON 'rows' payload (pre-mapped or raw), prefer it
    if (rowsRaw) {
      try {
        const parsed = JSON.parse(String(rowsRaw))
        if (Array.isArray(parsed)) rows = parsed
      } catch (e) {
        return NextResponse.json({ error: 'Invalid rows JSON' }, { status: 400 })
      }
    } else {
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      const text = await file.text()
      rows = parseCsv(text)
    }
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Failed to parse CSV' }, { status: 400 })
    }
    const MAX = 1000
    if (rows.length > MAX) {
      return NextResponse.json({ error: `CSV exceeds maximum rows (${MAX})` }, { status: 413 })
    }

  const imported: any[] = []
  const errors: any[] = []
  const duplicates: any[] = []

  // honor optional mapping provided from client
  const mappingRaw = form.get('mapping')
  const mapping: Record<string, string> | null = mappingRaw ? JSON.parse(String(mappingRaw)) : null
  const skipRaw = form.get('skipDuplicates')
  const skipDuplicates = skipRaw === null ? true : !(String(skipRaw).toLowerCase() === 'false' || String(skipRaw) === '0')

  // preload existing claimants for duplicate detection
  const existing = (await store.getClaimants(org)) as any[]

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      // build a tolerant payload from the row, or apply mapping if provided
      let payload: Record<string, unknown>
      // If the client supplied rows (pre-mapped payloads), accept them as-is
      if (rowsRaw) {
        payload = r as Record<string, unknown>
        if (!payload.name || String(payload.name).trim() === '') {
          errors.push({ row: i + 1, error: 'missing name in provided rows' })
          continue
        }
      } else if (mapping) {
        payload = { org }
        for (const key of Object.keys(r)) {
          const target = mapping[key]
          if (!target || target === 'ignore') continue
          const value = (r as Record<string, string>)[key]
          if (target === 'name') payload.name = value
          else if (target === 'email') payload.email = value
          else if (target === 'phone') payload.phone = value
          else if (target === 'amount') payload.claimAmount = value
          else if (target === 'claimId') payload.claimId = value
          else if (target === 'source') payload.source = value
        }
        if (!payload.name || String(payload.name).trim() === '') {
          errors.push({ row: i + 1, error: 'missing name (mapped)' })
          continue
        }
      } else {
        const directName = r['Full Name'] ?? r['full_name'] ?? r['Name'] ?? r['name'] ?? Object.values(r)[0]
        if (!directName || String(directName).trim() === '') {
          payload = mapRowToClaimant(r as Record<string, string>, org)
          if (!payload.name || String(payload.name).trim() === '') {
            errors.push({ row: i + 1, error: 'missing name' })
            continue
          }
        } else {
          payload = { org, name: String(directName) }
          const email = (r['Email'] ?? r['email'] ?? r['Email Address'] ?? r['email_address']) as string | undefined
          const phone = (r['Phone'] ?? r['phone']) as string | undefined
          if (email) payload.email = email
          if (phone) payload.phone = phone
          const claimId = (r['Claim ID'] ?? r['claim_id'] ?? r['ClaimId'] ?? r['claimid']) as string | undefined
          if (claimId) payload.claimId = claimId
        }
      }

      try {
        // detect duplicate against preloaded existing
        const dup = duplicateDetector.findDuplicate({ name: payload.name as string, email: payload.email as string | undefined, claimId: (payload as any).claimId as string | undefined }, existing)
        if (dup && skipDuplicates) {
          duplicates.push({ row: i + 1, reason: dup.reason, claimantId: dup.claimant.id, score: (dup as any).score })
          continue
        }

        const created = await store.createClaimant(payload)
        // add to existing so subsequent rows detect duplicates against created rows
        existing.push(created)
        imported.push(created)
      } catch (e: any) {
        errors.push({ row: i + 1, error: e?.message ?? String(e) })
      }
    }

    return NextResponse.json({ total: rows.length, imported: imported.length, errors, duplicates })
  } catch (err: any) {
    console.error('[api/import] error', err)
    return NextResponse.json({ error: err?.message ?? 'Import failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
