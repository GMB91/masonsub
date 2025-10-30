import { NextResponse } from "next/server"

// Use a flexible context type to satisfy Next.js generated validator types
// which may provide params as a plain object or a Promise-wrapped object.
export async function GET(_request: Request, context: any) {
  // context.params can be either { org: string } or Promise<{ org: string }>
  const params = await Promise.resolve(context?.params)
  const org = params?.org ?? "demo"

  // Return a small mocked organization payload
  const data = {
    id: org,
    name: `Demo Organization (${org})`,
    members: 5,
    claims: 12,
    storageMB: 240,
  }

  return NextResponse.json({ org: data })
}
