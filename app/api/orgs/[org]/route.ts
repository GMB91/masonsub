import { ok, fail } from '@/lib/apiResponse'
import { error as logError } from '@/lib/logger'

// Use a flexible context type to satisfy Next.js generated validator types
// which may provide params as a plain object or a Promise-wrapped object.
export async function GET(_request: Request, context: unknown) {
  try {
    // context.params can be either { org: string } or Promise<{ org: string }>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = await Promise.resolve((context as any)?.params)
    const org = params?.org ?? "demo"

    // Return a small mocked organization payload
    const data = {
      id: org,
      name: `Demo Organization (${org})`,
      members: 5,
      claims: 12,
      storageMB: 240,
    }

    return ok({ org: data })
  } catch (err) {
    logError('Error in GET /api/orgs/[org]', { err: err instanceof Error ? err.message : String(err) })
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Failed to load organization', 500, message)
  }
}
