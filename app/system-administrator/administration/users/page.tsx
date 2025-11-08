"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Lock, Mail, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "Glenn Mason",
      email: "glenn@masonvector.com",
      role: "Super Admin", 
      status: "active",
      lastLogin: "2025-11-06 10:30 AM",
      phone: "+61 400 123 456"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@masonvector.com", 
      role: "Admin",
      status: "active",
      lastLogin: "2025-11-06 9:15 AM",
      phone: "+61 400 234 567"
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael@masonvector.com",
      role: "Manager", 
      status: "active", 
      lastLogin: "2025-11-05 4:20 PM",
      phone: "+61 400 345 678"
    },
    {
      id: 4,
      name: "Lisa Wong",
      email: "lisa@masonvector.com",
      role: "Contractor",
      status: "inactive",
      lastLogin: "2025-10-28 2:15 PM", 
      phone: "+61 400 456 789"
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Contractor': return 'bg-green-100 text-green-800';
      case 'Client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800'; 
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">User management operations use mock data only.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system users and their access</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Lock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Last Login: </span>
                  <span className="text-sm font-medium">{user.lastLogin}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}