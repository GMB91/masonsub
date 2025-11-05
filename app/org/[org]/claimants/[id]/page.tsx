import claimantStore from "@/lib/claimantStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

type Props = { params: { org: string; id: string } }

export default async function Page({ params }: Props) {
  const { id } = params
  const claimant = await claimantStore.getClaimantById(id)

  if (!claimant) {
    return <div className="text-muted-foreground">Claimant not found</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{claimant.full_name}</h1>
        <Link href={`/org/${params.org}/claimants`}>
          <span className="text-sm text-primary underline">Back</span>
        </Link>
      </div>

      <div className="mt-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Email: {claimant.email ?? "—"}</div>
            <div className="text-sm">Phone: {claimant.phone ?? "—"}</div>
            <div className="text-sm">Created: {claimant.created_at ? new Date(claimant.created_at).toLocaleString() : 'N/A'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
