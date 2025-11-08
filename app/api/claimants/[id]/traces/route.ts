import traceStore from '@/lib/traceStore'
import claimantStore from '@/lib/claimantStore'
import { ok, fail } from '@/lib/apiResponse'

export async function GET(_request: Request, context: unknown) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = await Promise.resolve((context as any)?.params)
    const id = params?.id
    if (!id) return fail('Missing id', 400)

    const claimant = await claimantStore.getClaimantById(id as string)
    if (!claimant) return fail('Not found', 404)

    const claimantId = claimant.id || (id as string)
    const traces = await traceStore.getTracesForClaimant(claimantId)
    return ok({ traces })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in GET /api/claimants/[id]/traces:', err)
    const message = err instanceof Error ? err.message : String(err)
    return fail(`Failed to load traces: ${message}`, 500)
  }
}

export default { GET }
