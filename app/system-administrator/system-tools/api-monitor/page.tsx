"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, Network, Server, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ApiMonitorPage() {
  const apiMetrics = [
    { label: "Total Requests", value: "45,328", change: "+2,143", icon: Activity },
    { label: "Success Rate", value: "99.2%", change: "+0.3%", icon: CheckCircle },
    { label: "Avg Response", value: "247ms", change: "-15ms", icon: Zap },
    { label: "Active Endpoints", value: "24", change: "+2", icon: Network }
  ];

  const endpoints = [
    {
      name: "/api/claimants",
      method: "GET",
      status: "healthy",
      responseTime: 156,
      requests: 12456,
      errorRate: 0.1,
      lastCheck: "2025-11-06 10:35 AM"
    },
    {
      name: "/api/claims/create", 
      method: "POST",
      status: "healthy",
      responseTime: 342,
      requests: 3421,
      errorRate: 0.3,
      lastCheck: "2025-11-06 10:34 AM"
    },
    {
      name: "/api/payments/process",
      method: "POST", 
      status: "warning",
      responseTime: 1247,
      requests: 891,
      errorRate: 2.1,
      lastCheck: "2025-11-06 10:33 AM"
    },
    {
      name: "/api/reports/generate",
      method: "POST",
      status: "healthy", 
      responseTime: 2341,
      requests: 234,
      errorRate: 0.8,
      lastCheck: "2025-11-06 10:32 AM"
    },
    {
      name: "/api/auth/login",
      method: "POST",
      status: "healthy",
      responseTime: 89,
      requests: 8765,
      errorRate: 0.05,
      lastCheck: "2025-11-06 10:35 AM"
    },
    {
      name: "/api/notifications/send",
      method: "POST", 
      status: "error",
      responseTime: 5000,
      requests: 156,
      errorRate: 15.2,
      lastCheck: "2025-11-06 10:30 AM"
    }
  ];

  const performanceData = [
    { time: '10:00', responseTime: 245, requests: 156 },
    { time: '10:05', responseTime: 267, requests: 189 },
    { time: '10:10', responseTime: 234, requests: 201 },
    { time: '10:15', responseTime: 289, requests: 178 },
    { time: '10:20', responseTime: 256, requests: 234 },
    { time: '10:25', responseTime: 298, requests: 267 },
    { time: '10:30', responseTime: 312, requests: 298 },
    { time: '10:35', responseTime: 247, requests: 321 }
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
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
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
            <p className="text-sm text-yellow-700">API monitoring shows simulated data for demonstration purposes.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">API Monitor</h1>
          <p className="text-slate-500 mt-1">Monitor API performance and endpoint health</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Server className="h-4 w-4 mr-2" />
            Health Check
          </Button>
        </div>
      </div>

      {/* API Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <span>{metric.change}</span>
                  <span className="text-slate-500 ml-1">last hour</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Network className="h-5 w-5 text-indigo-600" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <Activity className="h-5 w-5 text-slate-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium font-mono text-sm">{endpoint.name}</h4>
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <Badge className={getStatusColor(endpoint.status)}>
                        {getStatusIcon(endpoint.status)}
                        <span className="ml-1">{endpoint.status}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Last checked: {endpoint.lastCheck}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div className="text-right">
                    <div className="font-medium">{endpoint.responseTime}ms</div>
                    <div className="text-slate-500">response time</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{endpoint.requests.toLocaleString()}</div>
                    <div className="text-slate-500">requests</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${endpoint.errorRate > 5 ? 'text-red-600' : endpoint.errorRate > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {endpoint.errorRate}%
                    </div>
                    <div className="text-slate-500">error rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}