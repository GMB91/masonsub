import { NextResponse } from "next/server"
import claimantStore from "@/lib/claimantStore"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const org = url.searchParams.get("org") ?? undefined
  const items = await claimantStore.getClaimants(org ?? undefined)
  return NextResponse.json({ claimants: items })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    if (!body.name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 })
    }
    const created = await claimantStore.createClaimant(body)
    return NextResponse.json({ claimant: created }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
