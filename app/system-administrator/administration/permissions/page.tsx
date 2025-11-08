"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Edit, Eye, Trash2, Plus, Lock, Check, X, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function PermissionsPage() {
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access with all permissions",
      userCount: 1,
      permissions: {
        users: ["create", "read", "update", "delete"],
        claims: ["create", "read", "update", "delete"],
        payments: ["create", "read", "update", "delete"],
        reports: ["create", "read", "update", "delete"],
        settings: ["create", "read", "update", "delete"]
      },
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: 2,
      name: "Admin",
      description: "Administrative access with most permissions",
      userCount: 3,
      permissions: {
        users: ["create", "read", "update"],
        claims: ["create", "read", "update", "delete"],
        payments: ["read", "update"],
        reports: ["create", "read", "update"],
        settings: ["read", "update"]
      },
      color: "bg-red-100 text-red-800"
    },
    {
      id: 3,
      name: "Manager",
      description: "Management level access to operations",
      userCount: 5,
      permissions: {
        users: ["read"],
        claims: ["create", "read", "update"],
        payments: ["read"],
        reports: ["create", "read"],
        settings: ["read"]
      },
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: 4,
      name: "Contractor",
      description: "Limited access for contractor operations",
      userCount: 12,
      permissions: {
        users: [],
        claims: ["create", "read"],
        payments: ["read"],
        reports: ["read"],
        settings: []
      },
      color: "bg-green-100 text-green-800"
    },
    {
      id: 5,
      name: "Client",
      description: "Basic client access to own data only",
      userCount: 156,
      permissions: {
        users: [],
        claims: ["read"],
        payments: ["read"],
        reports: [],
        settings: []
      },
      color: "bg-gray-100 text-gray-800"
    }
  ];

  const permissionCategories = [
    { key: "users", label: "User Management", icon: Users },
    { key: "claims", label: "Claims Management", icon: Shield },
    { key: "payments", label: "Payment Processing", icon: Lock },
    { key: "reports", label: "Reporting", icon: Eye },
    { key: "settings", label: "System Settings", icon: Edit }
  ];

  const permissionLabels = {
    create: "Create",
    read: "Read", 
    update: "Update",
    delete: "Delete"
  };

  const hasPermission = (role: any, category: string, permission: string) => {
    return role.permissions[category]?.includes(permission) || false;
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Permission changes use mock data and won't affect real system access.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Role Permissions</h1>
          <p className="text-slate-500 mt-1">Manage user roles and their system permissions</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Role
        </Button>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-500" />
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <p className="text-slate-600 text-sm mt-1">{role.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={role.color}>
                        {role.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {role.userCount} users
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Permissions Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 font-medium text-slate-600">Module</th>
                      <th className="text-center py-2 font-medium text-slate-600">Create</th>
                      <th className="text-center py-2 font-medium text-slate-600">Read</th>
                      <th className="text-center py-2 font-medium text-slate-600">Update</th>
                      <th className="text-center py-2 font-medium text-slate-600">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <tr key={category.key} className="border-b border-slate-100">
                          <td className="py-3 flex items-center gap-2">
                            <Icon className="h-4 w-4 text-slate-500" />
                            {category.label}
                          </td>
                          {["create", "read", "update", "delete"].map((permission) => (
                            <td key={permission} className="py-3 text-center">
                              {hasPermission(role, category.key, permission) ? (
                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-red-400 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}