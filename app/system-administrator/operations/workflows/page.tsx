"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Settings, Plus, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";

export default function WorkflowsPage() {
  const workflows = [
    {
      id: 1,
      name: "Data Collection Pipeline",
      status: "running",
      lastRun: "2025-11-06 10:30 AM",
      nextRun: "2025-11-06 2:30 PM", 
      success: 98.5,
      description: "Automated data gathering from state unclaimed money databases"
    },
    {
      id: 2,
      name: "Claimant Notification",
      status: "paused",
      lastRun: "2025-11-05 6:00 PM",
      nextRun: "Manual",
      success: 95.2,
      description: "Send notifications to potential claimants about unclaimed funds"
    },
    {
      id: 3,
      name: "Compliance Check",
      status: "running", 
      lastRun: "2025-11-06 9:15 AM",
      nextRun: "2025-11-06 12:15 PM",
      success: 99.1,
      description: "Verify all data collection meets regulatory requirements"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
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
            <p className="text-sm text-yellow-700">Workflow operations use mock data and won't affect real systems.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflows</h1>
          <p className="text-slate-500 mt-1">Manage automated data collection and processing pipelines</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <Badge className={getStatusColor(workflow.status)}>
                    {getStatusIcon(workflow.status)}
                    <span className="ml-1 capitalize">{workflow.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    {workflow.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{workflow.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Last Run</span>
                  <div className="font-medium">{workflow.lastRun}</div>
                </div>
                <div>
                  <span className="text-slate-500">Next Run</span>
                  <div className="font-medium">{workflow.nextRun}</div>
                </div>
                <div>
                  <span className="text-slate-500">Success Rate</span>
                  <div className="font-medium text-green-600">{workflow.success}%</div>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <div className="font-medium capitalize">{workflow.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}