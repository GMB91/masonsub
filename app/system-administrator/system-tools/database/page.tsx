"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Archive, Trash2, Download, Play, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function DatabasePage() {
  const databaseStats = [
    { label: "Total Records", value: "2,847,392", change: "+1,234", icon: Database },
    { label: "Database Size", value: "15.2 GB", change: "+245 MB", icon: Archive },
    { label: "Active Connections", value: "23", change: "+5", icon: CheckCircle },
    { label: "Query Response Time", value: "45ms", change: "-12ms", icon: Clock }
  ];

  const tables = [
    {
      name: "claimants", 
      records: 125847,
      size: "2.3 GB",
      lastUpdate: "2025-11-06 10:30 AM",
      status: "healthy",
      description: "Primary claimant information and contact details"
    },
    {
      name: "claims",
      records: 89234, 
      size: "1.8 GB",
      lastUpdate: "2025-11-06 10:25 AM",
      status: "healthy",
      description: "Claims data and processing status"
    },
    {
      name: "payments",
      records: 67891,
      size: "1.2 GB", 
      lastUpdate: "2025-11-06 10:20 AM",
      status: "healthy",
      description: "Payment processing and transaction records"
    },
    {
      name: "audit_log",
      records: 456789,
      size: "3.4 GB",
      lastUpdate: "2025-11-06 10:35 AM", 
      status: "healthy",
      description: "System audit trail and user activity logs"
    },
    {
      name: "templates",
      records: 234,
      size: "45 MB",
      lastUpdate: "2025-11-05 4:20 PM",
      status: "healthy", 
      description: "Communication and document templates"
    },
    {
      name: "temp_processing",
      records: 12456,
      size: "234 MB",
      lastUpdate: "2025-11-06 10:32 AM",
      status: "warning",
      description: "Temporary data processing table (needs cleanup)"
    }
  ];

  const backups = [
    {
      id: 1,
      filename: "backup_2025-11-06_02-00.sql",
      size: "14.8 GB",
      created: "2025-11-06 2:00 AM",
      type: "Full Backup",
      status: "completed"
    },
    {
      id: 2,
      filename: "backup_2025-11-05_02-00.sql", 
      size: "14.2 GB",
      created: "2025-11-05 2:00 AM",
      type: "Full Backup",
      status: "completed"
    },
    {
      id: 3,
      filename: "backup_2025-11-04_02-00.sql",
      size: "13.9 GB", 
      created: "2025-11-04 2:00 AM",
      type: "Full Backup",
      status: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Database operations are simulated. No real database changes will be made.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Database Management</h1>
          <p className="text-slate-500 mt-1">Monitor database health and manage data operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Play className="h-4 w-4 mr-2" />
            Run Backup
          </Button>
        </div>
      </div>

      {/* Database Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {databaseStats.map((stat, index) => {
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
                  <span className="text-slate-500 ml-1">today</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="h-5 w-5 text-indigo-600" />
            Database Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tables.map((table, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <Database className="h-5 w-5 text-slate-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{table.name}</h4>
                      <Badge className={getStatusColor(table.status)}>
                        {getStatusIcon(table.status)}
                        <span className="ml-1">{table.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{table.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div className="text-right">
                    <div className="font-medium">{table.records.toLocaleString()}</div>
                    <div className="text-slate-500">records</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{table.size}</div>
                    <div className="text-slate-500">size</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{table.lastUpdate}</div>
                    <div className="text-slate-500">last update</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Archive className="h-5 w-5 text-indigo-600" />
            Recent Backups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="font-medium">{backup.filename}</div>
                    <div className="text-sm text-slate-600">{backup.type} • {backup.size}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-600">{backup.created}</div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {backup.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}