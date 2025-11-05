// [AUTO-GEN-START] RecentClaimants component - Base-44 parity
// Generated: 2025-11-05
// Strategy: Additive only, recent activity widget

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Claimant {
  id: string;
  full_name: string;
  state: string;
  amount: number;
  created_at: string;
}

interface RecentClaimantsProps {
  claimants?: Claimant[];
  limit?: number;
}

export function RecentClaimants({ claimants = [], limit = 5 }: RecentClaimantsProps) {
  const displayClaimants = claimants.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Claimants</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/system-administrator/admin/main/claimants">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {displayClaimants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent claimants</p>
        ) : (
          <div className="space-y-3">
            {displayClaimants.map((claimant) => (
              <div
                key={claimant.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="flex-1">
                  <Link
                    href={`/system-administrator/admin/main/claimants/${claimant.id}`}
                    className="font-medium hover:underline"
                  >
                    {claimant.full_name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {claimant.state} • {new Date(claimant.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${claimant.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentClaimants;
// [AUTO-GEN-END]
