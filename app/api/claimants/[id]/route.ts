import claimantStore from "@/lib/claimantStore"
import { ok, fail } from '@/lib/apiResponse'

// Flexible context handling to satisfy Next validator types
export async function GET(_request: Request, context: unknown) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = await Promise.resolve((context as any)?.params)
    const id = params?.id
    if (!id) return fail('Missing id', 400)
    const item = await claimantStore.getClaimantById(id as string)
    if (!item) return fail('Not found', 404)
    return ok({ claimant: item })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in GET /api/claimants/[id]:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Failed to load claimant', 500, message)
  }
}

export async function PUT(request: Request, context: unknown) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = await Promise.resolve((context as any)?.params)
    const id = params?.id
    if (!id) return fail('Missing id', 400)
    try {
      const body = (await request.json()) as Record<string, unknown>
      const updated = await claimantStore.updateClaimant(id as string, body)
      if (!updated) return fail('Not found', 404)
      return ok({ claimant: updated })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error parsing JSON in PUT /api/claimants/[id]:', err)
      return fail('Invalid JSON', 400, err instanceof Error ? err.message : undefined)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in PUT /api/claimants/[id]:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Failed to update claimant', 500, message)
  }
}

export async function DELETE(_request: Request, context: unknown) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = await Promise.resolve((context as any)?.params)
    const id = params?.id
    if (!id) return fail('Missing id', 400)
  const deleted = await claimantStore.deleteClaimant(id as string)
  if (!deleted) return fail('Not found', 404)
  return ok({ deleted: true })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in DELETE /api/claimants/[id]:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Failed to delete claimant', 500, message)
  }
}
