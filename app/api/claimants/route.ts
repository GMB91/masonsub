import claimantStore from "@/lib/claimantStore"
import { ok, fail } from '@/lib/apiResponse'
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const org = url.searchParams.get("org") ?? undefined
    const items = await claimantStore.getClaimants(org ?? undefined)
    return ok({ claimants: items })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in GET /api/claimants:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Failed to load claimants', 500, message)
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    if (!body.name) {
      return fail('Missing required field: name', 400)
    }
    // validate optional fields
    if (body.email && typeof body.email === 'string' && !isValidEmail(body.email)) {
      return fail('Invalid email format', 400)
    }
    if (body.phone && typeof body.phone === 'string' && !isValidPhone(body.phone)) {
      return fail('Invalid phone number', 400)
    }
    // normalize phone before persisting
    if (body.phone && typeof body.phone === 'string') {
      body.phone = normalizePhone(body.phone)
    }
    const created = await claimantStore.createClaimant(body)
    return ok({ claimant: created }, 201)
  } catch (err) {
    // Distinguish invalid JSON from other server errors
    // eslint-disable-next-line no-console
    console.error('Error in POST /api/claimants:', err)
    if (err instanceof SyntaxError) {
      return fail('Invalid JSON body', 400, err.message)
    }
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Failed to create claimant', 500, message)
  }
}
