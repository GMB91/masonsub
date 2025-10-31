import { NextResponse } from 'next/server'
import tmpStore from '@/lib/importTmpStore'
import store from '@/lib/claimantStore'
import { findDuplicate } from '@/lib/duplicateDetector'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const id = String(form.get('id') || '')
    const org = String(form.get('org') || 'demo')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const data: any = await tmpStore.readImportData(id)
    const mapped: Record<string, string>[] = data.mapped || []
    if (!mapped.length) return NextResponse.json({ error: 'no mapped rows' }, { status: 400 })

    const results: { created: number; updated: number; errors: any[] } = { created: 0, updated: 0, errors: [] }

    // load existing claimants once per org
    const existing = await store.getClaimants(org)

    for (const row of mapped) {
      try {
        const candidate = {
          name: (row.name as string) || row['Full Name'] || row['full_name'] || undefined,
          email: (row.email as string) || row['Email'] || row['email'] || undefined,
          claimId: (row.claimId as string) || row['Claim ID'] || row['claim_id'] || undefined,
          externalId: (row.external_id as string) || row['External ID'] || row['externalId'] || row['id'] || undefined,
        }

        const dup = findDuplicate(candidate as any, existing as any)
        const payload: Record<string, any> = { ...row, org }

        if (dup) {
          // update existing claimant
          await store.updateClaimant(dup.claimant.id, payload)
          results.updated += 1
        } else {
          // create new claimant
          await store.createClaimant(payload)
          results.created += 1
        }
      } catch (e: any) {
        results.errors.push(String(e?.message || e))
      }
    }

    // record summary back on temp snapshot
    data.ingest = { ts: Date.now(), results }
    await tmpStore.writeImportData(data)

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error('[import/ingest] error', err)
    return NextResponse.json({ error: String(err?.message ?? 'ingest failed') }, { status: 500 })
  }
}

export const runtime = 'nodejs'
