import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cpu, Activity, Zap, Server } from "lucide-react";

export default function AgentsPage() {
  const agents = [
    {
      name: "Tracer AI",
      status: "Running",
      uptime: "99.8%",
      port: "8005",
      description: "AI-powered search and discovery across state databases",
      lastActivity: "2 minutes ago",
    },
    {
      name: "Data Gather",
      status: "Running",
      uptime: "99.7%",
      port: "8000",
      description: "Multi-state data collection and normalization service",
      lastActivity: "5 minutes ago",
    },
    {
      name: "Task Manager AI",
      status: "Running",
      uptime: "99.9%",
      port: "8080",
      description: "Intelligent task orchestration and workflow automation",
      lastActivity: "1 minute ago",
    },
    {
      name: "Database Admin AI",
      status: "Running",
      uptime: "99.6%",
      port: "8080",
      description: "Database health monitoring and optimization",
      lastActivity: "3 minutes ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Agents</h1>
        <p className="text-slate-500 mt-1">Monitor and manage autonomous agents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Avg Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">99.8%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Requests/min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">324</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Server className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">45%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {agents.map((agent) => (
          <Card key={agent.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{agent.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{agent.status}</span>
                  <p className="text-xs text-slate-500 mt-1">Port {agent.port}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="text-sm font-semibold text-slate-900">{agent.uptime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Last Activity</p>
                    <p className="text-sm font-semibold text-slate-900">{agent.lastActivity}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50">
                    View Logs
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50">
                    Restart
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
