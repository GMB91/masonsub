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
    return fail(`Failed to load claimants: ${message}`, 500)
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error in POST /api/claimants:', err)
      const msg = err instanceof Error ? err.message : 'Invalid JSON'
      return fail(`Invalid JSON body: ${msg}`, 400)
    }
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
    const created = await claimantStore.createClaimant(body as any)
    return ok({ claimant: created }, 201)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in POST /api/claimants:', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail(`Failed to create claimant: ${message}`, 500)
  }
}
