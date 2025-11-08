"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCw, Download, Filter, Search, AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";
import { useState } from "react";

export default function LogsPage() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  
  const logStats = [
    { label: "Total Logs Today", value: "8,743", change: "+1,234", icon: FileText },
    { label: "Error Events", value: "23", change: "-5", icon: AlertCircle },
    { label: "Warning Events", value: "156", change: "+12", icon: AlertTriangle },
    { label: "Log Size", value: "2.4 GB", change: "+345 MB", icon: Info }
  ];

  const logs = [
    {
      id: 1,
      timestamp: "2025-11-06 10:35:42",
      level: "info",
      service: "data-collector",
      message: "Successfully processed 1,234 claimant records from NSW database",
      details: "Batch processing completed in 45.2 seconds"
    },
    {
      id: 2,
      timestamp: "2025-11-06 10:34:15", 
      level: "error",
      service: "payment-processor",
      message: "Payment gateway timeout for transaction ID: PAY-2025-001234",
      details: "Gateway response time exceeded 30s threshold. Retrying in 5 minutes."
    },
    {
      id: 3,
      timestamp: "2025-11-06 10:33:28",
      level: "warning",
      service: "email-service",
      message: "Email delivery rate below threshold (85%)",
      details: "Current delivery rate: 82.3%. Bounce rate increased by 3.2%"
    },
    {
      id: 4,
      timestamp: "2025-11-06 10:32:01",
      level: "info", 
      service: "auth-service",
      message: "User login successful: admin@masonvector.com",
      details: "Session created with 2FA verification from IP: 203.45.67.89"
    },
    {
      id: 5,
      timestamp: "2025-11-06 10:31:14",
      level: "error",
      service: "database",
      message: "Query performance degradation detected",
      details: "SELECT query on claimants table took 15.7s (normal: 2.3s)"
    },
    {
      id: 6,
      timestamp: "2025-11-06 10:30:45",
      level: "warning",
      service: "backup-service", 
      message: "Backup storage approaching 85% capacity",
      details: "Current usage: 14.2GB of 16.7GB available. Consider cleanup."
    },
    {
      id: 7,
      timestamp: "2025-11-06 10:29:33",
      level: "info",
      service: "notification-service",
      message: "Sent 234 claimant notifications via email",
      details: "Campaign: Q4-Outreach, Success rate: 97.4%, Bounce rate: 2.6%"
    },
    {
      id: 8,
      timestamp: "2025-11-06 10:28:17",
      level: "debug",
      service: "api-gateway", 
      message: "API rate limit adjusted for client: mobile-app",
      details: "New limit: 1000 req/min (previously 500 req/min)"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'debug': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'debug': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getServiceColor = (service: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800', 
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-cyan-100 text-cyan-800'
    ];
    const hash = service.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const filteredLogs = selectedLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === selectedLevel);

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Log data is simulated for demonstration purposes.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Logs</h1>
          <p className="text-slate-500 mt-1">Monitor system events and troubleshoot issues</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {logStats.map((stat, index) => {
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
                  <span className="text-slate-500 ml-1">from yesterday</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Log Level Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-indigo-600" />
              Filter by Level
            </CardTitle>
            <div className="text-sm text-slate-500">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('all')}
            >
              All
            </Button>
            <Button
              variant={selectedLevel === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('error')}
              className={selectedLevel === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Errors
            </Button>
            <Button
              variant={selectedLevel === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('warning')}
              className={selectedLevel === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              Warnings
            </Button>
            <Button
              variant={selectedLevel === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('info')}
              className={selectedLevel === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Info
            </Button>
            <Button
              variant={selectedLevel === 'debug' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('debug')}
              className={selectedLevel === 'debug' ? 'bg-gray-600 hover:bg-gray-700' : ''}
            >
              Debug
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {log.timestamp}
                  </div>
                  <Badge className={getLevelColor(log.level)}>
                    {getLevelIcon(log.level)}
                    <span className="ml-1 uppercase">{log.level}</span>
                  </Badge>
                  <Badge variant="outline" className={getServiceColor(log.service)}>
                    {log.service}
                  </Badge>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-medium text-slate-900">{log.message}</p>
                <p className="text-sm text-slate-600 mt-1">{log.details}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}