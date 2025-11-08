import Link from "next/link";
import { 
  FileText, Shield, Database, Smartphone, FileSearch, 
  Server, Users, Settings, Activity, Lock 
} from "lucide-react";

const adminTools = [
  { 
    name: "System Logs", 
    path: "/system-admin/logs", 
    description: "View application logs, error reports, and system events",
    icon: FileText,
    color: "text-blue-600 bg-blue-50"
  },
  { 
    name: "Security Center", 
    path: "/system-admin/security", 
    description: "Manage security settings, permissions, and access controls",
    icon: Shield,
    color: "text-red-600 bg-red-50"
  },
  { 
    name: "Database Control", 
    path: "/system-admin/database", 
    description: "Database administration, backups, and performance monitoring",
    icon: Database,
    color: "text-green-600 bg-green-50"
  },
  { 
    name: "MFA Setup", 
    path: "/system-admin/mfa-setup", 
    description: "Multi-factor authentication configuration and management",
    icon: Smartphone,
    color: "text-purple-600 bg-purple-50"
  },
  { 
    name: "Audit Center", 
    path: "/system-admin/audit", 
    description: "Audit trails, compliance reports, and system monitoring",
    icon: FileSearch,
    color: "text-orange-600 bg-orange-50"
  },
  { 
    name: "Server Health", 
    path: "/system-admin/server-health", 
    description: "Server performance, resource usage, and health monitoring",
    icon: Server,
    color: "text-cyan-600 bg-cyan-50"
  },
  { 
    name: "User Management", 
    path: "/system-admin/users", 
    description: "Manage user accounts, roles, and permissions",
    icon: Users,
    color: "text-indigo-600 bg-indigo-50"
  },
  { 
    name: "System Settings", 
    path: "/system-admin/settings", 
    description: "Application configuration and system preferences",
    icon: Settings,
    color: "text-slate-600 bg-slate-50"
  },
  { 
    name: "Activity Monitor", 
    path: "/system-admin/activity", 
    description: "Real-time system activity and performance metrics",
    icon: Activity,
    color: "text-emerald-600 bg-emerald-50"
  },
  { 
    name: "Backup & Recovery", 
    path: "/system-admin/backup", 
    description: "Data backup management and disaster recovery options",
    icon: Lock,
    color: "text-amber-600 bg-amber-50"
  },
];

export default function SystemAdminHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          System Administration
        </h1>
        <p className="text-slate-600 text-lg">
          Manage and monitor all aspects of the Mason Vector system. Select a category below to access administrative tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              href={tool.path}
              className="group block p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${tool.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="text-yellow-600 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Security Notice</h4>
            <p className="text-yellow-700 text-sm">
              System administration functions are restricted to authorized personnel only. 
              All activities in this section are logged and monitored for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}