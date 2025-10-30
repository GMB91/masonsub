import { NextResponse } from "next/server"

import { ok, fail } from '@/lib/apiResponse'
import { error as logError } from '@/lib/logger'

export async function GET() {
  try {
    return ok({ status: 'ok' })
  } catch (err) {
    logError('Error in GET /api/health', { err: err instanceof Error ? err.message : String(err) })
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return fail('Health check failed', 500, message)
  }
}
