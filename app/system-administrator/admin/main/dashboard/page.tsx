"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { TESTING_MODE, mockData } from "@/lib/testing";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function AdminDashboard() {
  const stats = [
    { label: "Active Claimants", value: mockData.metrics.totalClaimants.toLocaleString(), icon: Users, change: "+12.5%" },
    { label: "Open Claims", value: mockData.metrics.openClaims.toLocaleString(), icon: FileText, change: "+5.2%" },
    { label: "Total Value", value: `$${(mockData.metrics.totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, change: "+18.3%" },
    { label: "Success Rate", value: `${mockData.metrics.successRate}%`, icon: TrendingUp, change: "+3.1%" },
  ];

  const claimsByStatus = [
    { name: "Active", value: 45, color: "#10B981" },
    { name: "Pending", value: 30, color: "#F59E0B" },
    { name: "Completed", value: 20, color: "#3B82F6" },
    { name: "On Hold", value: 5, color: "#6B7280" },
  ];

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">No real data will be modified. All operations use mock data.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to Mason Vector Admin Console</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={claimsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {claimsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{reminder.title}</p>
                    <p className="text-xs text-slate-500">{reminder.date}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    {reminder.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New claimant registered</p>
                  <p className="text-xs text-slate-500">John Smith - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Claim approved</p>
                  <p className="text-xs text-slate-500">QLD-2024-1234 - 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Data import completed</p>
                  <p className="text-xs text-slate-500">NSW Unclaimed Money - 1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-sm transition-colors">
                Add New Claimant
              </button>
              <button className="w-full text-left px-4 py-2 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors">
                Import Data
              </button>
              <button className="w-full text-left px-4 py-2 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors">
                Generate Report
              </button>
              <button className="w-full text-left px-4 py-2 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors">
                View All Tasks
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
