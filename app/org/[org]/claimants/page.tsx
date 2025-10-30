import React from "react"
import ClaimantList from "@/components/claimants/ClaimantList"

type Props = { params: { org: string } }

export default function Page({ params }: Props) {
  const org = params.org

  return (
    <div>
      {/* Client component handles fetching and interactive UI */}
      {/* Server component could pass initial data if desired */}
      <ClaimantList org={org} />
    </div>
  )
}
