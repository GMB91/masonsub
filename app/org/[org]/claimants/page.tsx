import React from "react"
import Link from "next/link"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import claimantStore from "@/lib/claimantStore"

type Props = { params: { org: string } }

export default async function Page({ params }: Props) {
  const org = params.org
  const claimants = await claimantStore.getClaimants(org)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Claimants — {org}</h1>
        <Link href={`/org/${org}/claimants/new`}>
          <Button>Create claimant</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {claimants.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No claimants yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create a claimant to get started.
            </CardContent>
          </Card>
        ) : (
          claimants.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">{c.email}</div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/org/${org}/claimants/${c.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
