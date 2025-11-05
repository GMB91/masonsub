// [AUTO-GEN-START] User Management page - Base-44 parity
// Generated: 2025-11-05

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and access control
          </p>
        </div>
        <Button>Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              User list will be populated from Supabase auth...
            </div>
            <div className="grid gap-2">
              <div className="font-medium">Total Users: 0</div>
              <div className="text-sm">Active Sessions: 0</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// [AUTO-GEN-END]
