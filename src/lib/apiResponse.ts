import { NextResponse } from 'next/server'

export function ok(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status })
}

export function fail(message = 'Internal error', status = 500, detail?: string) {
  const body: Record<string, unknown> = { error: message }
  if (detail) body.message = detail
  return NextResponse.json(body, { status })
}
