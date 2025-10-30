import { NextResponse } from "next/server"
import claimantStore from "@/lib/claimantStore"

// Flexible context handling to satisfy Next validator types
export async function GET(_request: Request, context: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = await Promise.resolve((context as any)?.params)
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const item = await claimantStore.getClaimantById(id as string)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ claimant: item })
}

export async function PUT(request: Request, context: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = await Promise.resolve((context as any)?.params)
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  try {
    const body = (await request.json()) as Record<string, unknown>
    const updated = await claimantStore.updateClaimant(id as string, body)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ claimant: updated })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

export async function DELETE(_request: Request, context: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = await Promise.resolve((context as any)?.params)
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const ok = await claimantStore.deleteClaimant(id as string)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ deleted: true })
}
