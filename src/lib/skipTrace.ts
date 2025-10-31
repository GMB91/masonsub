export type SkipTraceResult = {
  phones: string[]
  emails: string[]
  addresses: string[]
  employment?: Array<Record<string, any>>
  confidence: number // 0-100
  raw?: any
}

export async function autoSkipTrace(claimant: { id?: string; full_name?: string; email?: string; phone?: string }, opts?: { provider?: string }): Promise<SkipTraceResult> {
  // Dev-friendly stub: return synthetic data when SKIPTRACE_MODE=stub (default)
  const mode = process.env.SKIPTRACE_MODE || 'stub'
  if (mode === 'stub') {
    const name = claimant.full_name || 'Unknown'
    return {
      phones: claimant.phone ? [claimant.phone] : ['0400 000 000'],
      emails: claimant.email ? [claimant.email] : [`${name.replace(/\s+/g, '.').toLowerCase()}@example.com`],
      addresses: ['123 Example St, Brisbane QLD 4000'],
      employment: [{ company: 'Example Pty Ltd', title: 'Manager' }],
      confidence: 75,
      raw: { provider: 'stub' }
    }
  }

  // Production path TODO: integrate with real LLM / web context provider
  throw new Error('autoSkipTrace: not implemented for mode ' + mode)
}

export default { autoSkipTrace }
