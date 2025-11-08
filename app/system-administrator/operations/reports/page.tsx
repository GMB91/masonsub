"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Filter, BarChart3, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function OperationsReportsPage() {
  const reports = [
    {
      id: 1,
      name: "Daily Operations Summary",
      type: "operational",
      frequency: "Daily",
      lastGenerated: "2025-11-06 8:00 AM",
      nextRun: "2025-11-07 8:00 AM",
      format: "PDF",
      status: "active"
    },
    {
      id: 2,
      name: "Weekly Performance Metrics",
      type: "performance",
      frequency: "Weekly",
      lastGenerated: "2025-11-04 9:00 AM", 
      nextRun: "2025-11-11 9:00 AM",
      format: "Excel",
      status: "active"
    },
    {
      id: 3,
      name: "Monthly Compliance Report",
      type: "compliance",
      frequency: "Monthly",
      lastGenerated: "2025-11-01 10:00 AM",
      nextRun: "2025-12-01 10:00 AM", 
      format: "PDF",
      status: "active"
    },
    {
      id: 4,
      name: "Quarterly Financial Summary",
      type: "financial",
      frequency: "Quarterly",
      lastGenerated: "2025-10-01 2:00 PM",
      nextRun: "2025-01-01 2:00 PM",
      format: "PDF",
      status: "draft"
    }
  ];

  const quickStats = [
    { label: "Reports Generated Today", value: "12", change: "+3", icon: FileText },
    { label: "Average Generation Time", value: "2.3s", change: "-0.4s", icon: TrendingUp },
    { label: "Active Scheduled Reports", value: "18", change: "+2", icon: Calendar },
    { label: "Total Downloads This Week", value: "145", change: "+23", icon: Download }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-orange-100 text-orange-800';
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
            <p className="text-sm text-yellow-700">Report generation uses mock data. No real reports will be created.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operations Reports</h1>
          <p className="text-slate-500 mt-1">Generate and manage operational reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <span>{stat.change}</span>
                  <span className="text-slate-500 ml-1">from last period</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {report.frequency}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Last Generated</span>
                  <div className="font-medium">{report.lastGenerated}</div>
                </div>
                <div>
                  <span className="text-slate-500">Next Run</span>
                  <div className="font-medium">{report.nextRun}</div>
                </div>
                <div>
                  <span className="text-slate-500">Format</span>
                  <div className="font-medium">{report.format}</div>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <Badge className={report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {report.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}