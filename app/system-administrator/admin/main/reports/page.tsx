// [AUTO-GEN-START] Reports page - Base-44 parity
// Generated: 2025-11-05

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export system reports
          </p>
        </div>
        <Button>Generate Report</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No reports generated yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">• Claimant Summary</div>
              <div className="text-sm">• Financial Overview</div>
              <div className="text-sm">• Activity Log</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// [AUTO-GEN-END]
