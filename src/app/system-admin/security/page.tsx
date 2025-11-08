import { Shield, Key, Users, Lock, AlertTriangle, CheckCircle, Settings, Eye } from "lucide-react";
import Link from "next/link";

export default function SecurityCenterPage() {
  const securityMetrics = {
    activeThreats: 0,
    failedLogins: 3,
    activeSessions: 12,
    lastSecurityScan: "2025-11-06 09:00:00"
  };

  const recentSecurityEvents = [
    {
      id: 1,
      timestamp: "2025-11-06 14:25:30",
      type: "Authentication",
      severity: "info",
      message: "Successful admin login from 192.168.1.100",
      user: "admin@masonvector.com"
    },
    {
      id: 2,
      timestamp: "2025-11-06 13:45:12",
      type: "Access Control",
      severity: "warning",
      message: "Failed login attempt detected",
      user: "unknown@suspicious.com"
    },
    {
      id: 3,
      timestamp: "2025-11-06 12:30:45",
      type: "Permission",
      severity: "info",
      message: "User role updated: analyst → admin",
      user: "jane.smith@masonvector.com"
    }
  ];

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info':
        return <CheckCircle className="text-blue-500" size={16} />;
      default:
        return <CheckCircle className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Security Center</h1>
          <p className="text-slate-600">Monitor system security, access controls, and threat detection</p>
        </div>
        <Link 
          href="/system-admin" 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{securityMetrics.activeThreats}</p>
              <p className="text-sm text-slate-600">Active Threats</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Lock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{securityMetrics.failedLogins}</p>
              <p className="text-sm text-slate-600">Failed Logins (24h)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{securityMetrics.activeSessions}</p>
              <p className="text-sm text-slate-600">Active Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">Clean</p>
              <p className="text-sm text-slate-600">Last Scan Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Settings size={20} />
              Security Controls
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Multi-Factor Authentication</h4>
                <p className="text-sm text-slate-600">Require MFA for admin access</p>
              </div>
              <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Enabled
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Session Timeout</h4>
                <p className="text-sm text-slate-600">Auto-logout after inactivity</p>
              </div>
              <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                30 min
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Password Policy</h4>
                <p className="text-sm text-slate-600">Enforce strong passwords</p>
              </div>
              <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Rate Limiting</h4>
                <p className="text-sm text-slate-600">API request rate limits</p>
              </div>
              <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                100/min
              </button>
            </div>
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} />
              Recent Security Events
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {recentSecurityEvents.map((event) => (
              <div key={event.id} className="p-4">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityClass(event.severity)}`}>
                        {event.type}
                      </span>
                      <span className="text-xs text-slate-500">{event.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-800 mb-1">{event.message}</p>
                    <p className="text-xs text-slate-500">User: {event.user}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Key size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Shield className="text-indigo-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Run Security Scan</h4>
              <p className="text-sm text-slate-600">Check for vulnerabilities</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Users className="text-indigo-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Manage Users</h4>
              <p className="text-sm text-slate-600">User roles & permissions</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Lock className="text-indigo-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Force Logout</h4>
              <p className="text-sm text-slate-600">End all active sessions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}