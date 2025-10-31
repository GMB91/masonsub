import type { Claimant } from '@/types/claimant'

function normalizeName(n?: string) {
  if (!n) return ''
  return n
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

function nameSimilarity(a?: string, b?: string) {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const dist = levenshtein(na, nb)
  const maxLen = Math.max(na.length, nb.length)
  if (maxLen === 0) return 0
  return 1 - dist / maxLen
}

export type DuplicateMatch = {
  claimant: Claimant
  reason: 'email' | 'claimId' | 'name'
  score?: number
}

export function findDuplicate(candidate: { name?: string; email?: string; claimId?: string; id?: string; externalId?: string }, existing: Claimant[]): DuplicateMatch | null {
  const cEmail = candidate.email?.toLowerCase().trim()
  const cClaimId = candidate.claimId?.toLowerCase().trim()
  const cExternal = candidate.externalId?.toString().toLowerCase().trim() || candidate.id?.toString().toLowerCase().trim()
  // exact email
  if (cEmail) {
    const m = existing.find((e) => typeof e.email === 'string' && String(e.email).toLowerCase().trim() === cEmail)
    if (m) return { claimant: m, reason: 'email' }
  }
  // exact claim id
  if (cClaimId) {
    const m = existing.find((e) => {
      const v = (e as any).claimId || (e as any).claimID || (e as any).claimid
      return typeof v === 'string' && String(v).toLowerCase().trim() === cClaimId
    })
    if (m) return { claimant: m, reason: 'claimId' }
  }

  // exact external id (legacy id stored in external_id or metadata.externalId)
  if (cExternal) {
    const m = existing.find((e) => {
      const ext = (e as any).external_id ?? ((e as any).metadata && (e as any).metadata.externalId)
      return typeof ext === 'string' && String(ext).toLowerCase().trim() === cExternal
    })
    if (m) return { claimant: m, reason: 'claimId' }
  }

  // fuzzy name
  if (candidate.name) {
    let best: { claimant: Claimant; score: number } | null = null
    for (const e of existing) {
      const ename = (e as any).name ?? `${(e as any).firstName ?? ''} ${(e as any).lastName ?? ''}`.trim()
      const score = nameSimilarity(candidate.name, ename)
      if (!best || score > best.score) best = { claimant: e, score }
    }
    if (best && best.score >= 0.8) {
      return { claimant: best.claimant, reason: 'name', score: best.score }
    }
  }

  return null
}

export async function findPotentialDuplicates(row: Record<string, string>, org = 'demo', threshold = 0.85) {
  // During tests prefer the file-backed store to avoid depending on SUPABASE_* env.
  let all: Claimant[] = []
  if (process.env.NODE_ENV === 'test') {
    try {
      const { promises: fs } = await import('fs')
      const path = await import('path')
      const p = path.join(process.cwd(), 'data', 'claimants.json')
      const raw = await fs.readFile(p, 'utf-8')
      all = JSON.parse(raw) as Claimant[]
    } catch (e) {
      all = []
    }
  } else {
    const mod = await import('./claimantStore')
    const store = (mod as any).default ?? mod
    all = await store.getClaimants(org)
  }
  const name = row['Full Name'] ?? row['full_name'] ?? row['Name'] ?? row['name'] ?? Object.values(row)[0]
  const email = row['Email'] ?? row['email'] ?? row['Email Address'] ?? row['email_address']
  const claimId = row['Claim ID'] ?? row['claim_id'] ?? row['ClaimId'] ?? row['claimid']
  const externalId = row['External ID'] ?? row['external_id'] ?? row['externalId'] ?? row['id']

  const matches: Claimant[] = []

  for (const c of all) {
    // exact email or claim id
    if (email && c.email && String(c.email).toLowerCase() === String(email).toLowerCase()) {
      matches.push(c)
      continue
    }
    if (claimId && (c as any).claimId && String((c as any).claimId).toLowerCase() === String(claimId).toLowerCase()) {
      matches.push(c)
      continue
    }

    // fuzzy name match
    const cName = (c as any).name ?? `${(c as any).firstName ?? ''} ${(c as any).lastName ?? ''}`.trim()
    const sim = nameSimilarity(String(name), String(cName))
    if (sim >= threshold) matches.push(c)
  }

  return matches
}

export default { findDuplicate, findPotentialDuplicates }
