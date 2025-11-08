import { FileSearch, Clock, User, Shield, Download, Filter, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuditCenterPage() {
  const auditStats = {
    totalEvents: 15647,
    todayEvents: 234,
    criticalEvents: 3,
    lastAudit: "2025-11-06 14:00:00"
  };

  const recentAuditEvents = [
    {
      id: 1,
      timestamp: "2025-11-06 14:30:15",
      user: "admin@masonvector.com",
      action: "User Role Updated",
      target: "jane.smith@masonvector.com",
      details: "Changed role from 'analyst' to 'admin'",
      severity: "medium",
      ipAddress: "192.168.1.100"
    },
    {
      id: 2,
      timestamp: "2025-11-06 14:25:30",
      user: "john.smith@masonvector.com",
      action: "Claimant Data Access",
      target: "Claimant ID: 12345",
      details: "Viewed claimant details and contact information",
      severity: "low",
      ipAddress: "192.168.1.105"
    },
    {
      id: 3,
      timestamp: "2025-11-06 14:20:45",
      user: "admin@masonvector.com",
      action: "Database Backup",
      target: "Main Database",
      details: "Manual backup initiated and completed successfully",
      severity: "low",
      ipAddress: "192.168.1.100"
    },
    {
      id: 4,
      timestamp: "2025-11-06 14:15:22",
      user: "unauthorized@external.com",
      action: "Failed Login Attempt",
      target: "System Access",
      details: "Multiple failed login attempts detected",
      severity: "high",
      ipAddress: "203.0.113.42"
    },
    {
      id: 5,
      timestamp: "2025-11-06 14:10:18",
      user: "sarah.j@masonvector.com",
      action: "File Upload",
      target: "Claimant Documents",
      details: "Uploaded 3 verification documents",
      severity: "low",
      ipAddress: "192.168.1.110"
    }
  ];

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'medium':
        return <AlertCircle className="text-yellow-500" size={16} />;
      case 'low':
        return <Shield className="text-green-500" size={16} />;
      default:
        return <Shield className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Center</h1>
          <p className="text-slate-600">Monitor system activity, compliance, and security events</p>
        </div>
        <Link 
          href="/system-admin" 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileSearch className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{auditStats.totalEvents.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Total Events</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{auditStats.todayEvents}</p>
              <p className="text-sm text-slate-600">Today's Events</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{auditStats.criticalEvents}</p>
              <p className="text-sm text-slate-600">Critical Events</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">100%</p>
              <p className="text-sm text-slate-600">Compliance Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Controls */}
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <Eye size={16} />
          Real-time Monitor
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
          <Filter size={16} />
          Filter Events
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
          <Download size={16} />
          Export Audit Log
        </button>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} />
          <span>Last updated: {auditStats.lastAudit}</span>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileSearch size={20} />
            Recent Audit Events
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {recentAuditEvents.map((event) => (
            <div key={event.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getSeverityIcon(event.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityClass(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{event.action}</span>
                    <span className="text-xs text-slate-500">{event.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-700 mb-1">
                        <span className="font-medium">User:</span> {event.user}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Target:</span> {event.target}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-700 mb-1">
                        <span className="font-medium">Details:</span> {event.details}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">IP Address:</span> {event.ipAddress}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={20} />
            Compliance Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Data Protection</h4>
                <p className="text-sm text-slate-600">GDPR/CCPA compliance</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Compliant
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Access Controls</h4>
                <p className="text-sm text-slate-600">User permissions & roles</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Compliant
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Data Retention</h4>
                <p className="text-sm text-slate-600">Retention policy adherence</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Compliant
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Audit Trail</h4>
                <p className="text-sm text-slate-600">Complete activity logging</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} />
            User Activity Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Total Active Users:</span>
              <span className="font-medium text-slate-800">18</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Login Events Today:</span>
              <span className="font-medium text-slate-800">42</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Data Access Events:</span>
              <span className="font-medium text-slate-800">156</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Administrative Actions:</span>
              <span className="font-medium text-slate-800">8</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Failed Access Attempts:</span>
              <span className="font-medium text-red-600">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}