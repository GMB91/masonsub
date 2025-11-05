// [AUTO-GEN-START] Organization Settings page - Base-44 parity
// Generated: 2025-11-05

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OrgSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Configure organization-wide preferences
          </p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Organization Name</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                placeholder="Mason Vector"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default Time Zone</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>UTC</option>
                <option>Australia/Sydney</option>
                <option>America/New_York</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure how long records are kept
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// [AUTO-GEN-END]
