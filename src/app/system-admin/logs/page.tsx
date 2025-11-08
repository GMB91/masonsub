import { FileText, Download, Filter, RefreshCw, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function SystemLogsPage() {
  // Mock log data - in a real app this would come from your logging system
  const logs = [
    {
      id: 1,
      timestamp: "2025-11-06 14:32:15",
      level: "ERROR",
      service: "Database",
      message: "Connection timeout to secondary database server",
      source: "db-pool-manager"
    },
    {
      id: 2,
      timestamp: "2025-11-06 14:31:45",
      level: "INFO",
      service: "Auth",
      message: "User login successful: admin@masonvector.com",
      source: "auth-service"
    },
    {
      id: 3,
      timestamp: "2025-11-06 14:30:22",
      level: "WARN",
      service: "API",
      message: "Rate limit approaching for IP 192.168.1.100",
      source: "rate-limiter"
    },
    {
      id: 4,
      timestamp: "2025-11-06 14:29:18",
      level: "INFO",
      service: "Claimants",
      message: "New claimant record created: ID 12345",
      source: "claimant-service"
    },
    {
      id: 5,
      timestamp: "2025-11-06 14:28:03",
      level: "ERROR",
      service: "Email",
      message: "Failed to send notification email to user@example.com",
      source: "email-service"
    }
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <XCircle className="text-red-500" size={16} />;
      case 'WARN':
        return <AlertCircle className="text-yellow-500" size={16} />;
      case 'INFO':
        return <Info className="text-blue-500" size={16} />;
      default:
        return <CheckCircle className="text-green-500" size={16} />;
    }
  };

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'WARN':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'INFO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
          <p className="text-slate-600">Monitor system events, errors, and application activity</p>
        </div>
        <Link 
          href="/system-admin" 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <RefreshCw size={16} />
          Refresh
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
          <Filter size={16} />
          Filter Logs
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Log Entries */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileText size={20} />
            Recent Log Entries
          </h3>
        </div>
        
        <div className="divide-y divide-slate-200">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getLogIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getLogLevelClass(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{log.service}</span>
                    <span className="text-xs text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-800 mb-1">{log.message}</p>
                  <p className="text-xs text-slate-500">Source: {log.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-500" size={20} />
            <div>
              <p className="text-2xl font-bold text-slate-800">12</p>
              <p className="text-sm text-slate-600">Errors Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={20} />
            <div>
              <p className="text-2xl font-bold text-slate-800">28</p>
              <p className="text-sm text-slate-600">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Info className="text-blue-500" size={20} />
            <div>
              <p className="text-2xl font-bold text-slate-800">1,543</p>
              <p className="text-sm text-slate-600">Info Messages</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <div>
              <p className="text-2xl font-bold text-slate-800">99.8%</p>
              <p className="text-sm text-slate-600">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}