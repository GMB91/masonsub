export type TargetField = 'name' | 'email' | 'claimId' | 'externalId'

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

const candidates: Record<TargetField, string[]> = {
  name: ['full name', 'fullname', 'name', 'client name', 'claimant'],
  email: ['email', 'email address', 'e-mail'],
  claimId: ['claim id', 'claimid', 'claim_id', 'claim number', 'claim#', 'id'],
  externalId: ['external id', 'externalid', 'external_id', 'legacy id', 'legacyid'],
}

export type MappingCandidate = { target: TargetField; confidence: number }
export type HeaderInferenceResult = Record<string, { top?: MappingCandidate; alternatives: MappingCandidate[] }>

export function inferHeaderMapping(headers: string[], sampleRows: Record<string, string>[] = []): HeaderInferenceResult {
  const result: HeaderInferenceResult = {}

  // examine up to N sample rows for consensus
  const samples = sampleRows.slice(0, 10)

  const normHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }))

  for (const h of normHeaders) {
    const perTargetScores: Record<TargetField, number[]> = { name: [], email: [], claimId: [], externalId: [] }

    // helper: score a single header string against a target's keyword list
    function scoreHeaderAgainst(targetWords: string[], norm: string) {
      let score = 0
      for (const w of targetWords) {
        if (norm === w) {
          score = Math.max(score, 1)
          break
        }
        if (norm.includes(w)) score = Math.max(score, 0.9)
        const tokens = norm.split(' ')
        if (tokens.includes(w.split(' ')[0])) score = Math.max(score, 0.7)
      }
      return score
    }

    // base lexical score
    for (const [target, words] of Object.entries(candidates) as [TargetField, string[]][]) {
      const base = scoreHeaderAgainst(words, h.norm)
      perTargetScores[target].push(Number(base.toFixed(2)))
    }

    // sample-based heuristics: examine multiple sample rows and increase confidence when samples match expected patterns
    for (const row of samples) {
      const rawVal = (row as any)[h.raw] ?? (row as any)[h.norm]
      const v = typeof rawVal === 'string' ? rawVal.trim() : ''
      for (const [target, words] of Object.entries(candidates) as [TargetField, string[]][]) {
        let s = 0
        if (!v) {
          s = 0
        } else {
          if (target === 'email') {
            if (v.includes('@')) s = Math.max(s, 0.95)
          }
          if ((target === 'claimId' || target === 'externalId') && /^[0-9\-]+$/.test(v)) {
            s = Math.max(s, 0.8)
          }
          // name heuristic: contains space and letters
          if (target === 'name' && /[a-zA-Z]+\s+[a-zA-Z]+/.test(v)) s = Math.max(s, 0.85)
        }
        perTargetScores[target].push(Number(s.toFixed(2)))
      }
    }

    // aggregate per-target scores (average), and normalize to [0,1]
    const aggregated: MappingCandidate[] = []
    for (const t of Object.keys(perTargetScores) as TargetField[]) {
      const arr = perTargetScores[t]
      const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
      // small lexical boost if header text explicitly contains a strong keyword
      const lexicalBoost = scoreHeaderAgainst(candidates[t], h.norm)
      let combined = Math.max(avg, lexicalBoost)
      // if combined is near 0 but header equals the canonical token, bump it
      if (combined === 0 && candidates[t].includes(h.norm)) combined = 0.9
      aggregated.push({ target: t, confidence: Number(Math.min(1, combined).toFixed(2)) })
    }

    // sort and prepare result
    aggregated.sort((a, b) => b.confidence - a.confidence)
    const top = aggregated[0].confidence > 0 ? aggregated[0] : undefined
    result[h.raw] = { top, alternatives: aggregated.slice(top ? 1 : 0) }
  }

  return result
}

export default inferHeaderMapping
