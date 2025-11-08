"use client";

import Link from "next/link";
import { 
  Bot, 
  Database, 
  Shield, 
  Settings, 
  Activity,
  TestTube,
  ChevronRight,
  Users,
  BarChart3,
  Lock
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'online' | 'offline' | 'maintenance';
  capabilities: string[];
  lastActive?: string;
}

const agents: Agent[] = [
  {
    id: "tracer",
    name: "Tracer AI",
    description: "Advanced claimant data tracking and verification system",
    icon: Activity,
    status: "online",
    capabilities: ["Data Tracking", "Verification", "Report Generation", "Audit Trails"],
    lastActive: "2 minutes ago"
  },
  {
    id: "database",
    name: "Database AI", 
    description: "Intelligent database management and query optimization",
    icon: Database,
    status: "online",
    capabilities: ["Query Optimization", "Data Analysis", "Schema Management", "Performance Tuning"],
    lastActive: "5 minutes ago"
  },
  {
    id: "task-manager",
    name: "Task Manager AI",
    description: "Workflow orchestration and task automation platform",
    icon: Settings,
    status: "online",
    capabilities: ["Task Orchestration", "Workflow Automation", "Process Management", "Scheduling"],
    lastActive: "1 minute ago"
  },
  {
    id: "sentinel",
    name: "Sentinel AI",
    description: "Advanced security monitoring and threat detection system",
    icon: Shield,
    status: "online",
    capabilities: ["Security Monitoring", "Threat Detection", "Risk Assessment", "Compliance"],
    lastActive: "30 seconds ago"
  },
  {
    id: "admin",
    name: "Admin AI",
    description: "Administrative operations and system management assistant",
    icon: Users,
    status: "maintenance",
    capabilities: ["System Administration", "User Management", "Configuration", "Monitoring"],
    lastActive: "1 hour ago"
  },
  {
    id: "system-test",
    name: "System Test AI",
    description: "Automated system testing and health validation services",
    icon: TestTube,
    status: "online",
    capabilities: ["System Testing", "Health Checks", "Performance Monitoring", "Diagnostics"],
    lastActive: "3 minutes ago"
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'offline': return 'bg-red-500';
    case 'maintenance': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'online': return 'Online';
    case 'offline': return 'Offline';
    case 'maintenance': return 'Maintenance';
    default: return 'Unknown';
  }
}

export default function AgentsPage() {
  const onlineAgents = agents.filter(agent => agent.status === 'online').length;
  const totalAgents = agents.length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">{onlineAgents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          
          return (
            <div key={agent.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                        <span className="ml-2 text-sm text-gray-500">
                          {getStatusText(agent.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="mt-4 text-sm text-gray-600">{agent.description}</p>
                
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capabilities</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((capability) => (
                      <span
                        key={capability}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{agent.capabilities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {agent.lastActive && (
                  <p className="mt-4 text-xs text-gray-500">
                    Last active: {agent.lastActive}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                {agent.status === 'online' ? (
                  <Link
                    href={`/agents/${agent.id}`}
                    className="flex items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Open Chat Interface
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : agent.status === 'maintenance' ? (
                  <div className="flex items-center justify-between text-sm font-medium text-yellow-600">
                    <span>Under Maintenance</span>
                    <Settings className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm font-medium text-gray-400">
                    <span>Currently Offline</span>
                    <Lock className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(agent.status)}`} />
                <span className="ml-3 text-sm font-medium text-gray-900">{agent.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{agent.lastActive}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'online' 
                    ? 'bg-green-100 text-green-800'
                    : agent.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(agent.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}