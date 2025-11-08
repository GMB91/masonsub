import { Database, Server, Activity, HardDrive, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DatabaseControlPage() {
  const dbMetrics = {
    totalRecords: 125847,
    activeConnections: 23,
    queryPerformance: "1.2ms",
    storageUsed: "2.4 GB",
    uptime: "99.9%",
    lastBackup: "2025-11-06 03:00:00"
  };

  const recentQueries = [
    {
      id: 1,
      query: "SELECT * FROM claimants WHERE status = 'pending'",
      duration: "0.8ms",
      timestamp: "2025-11-06 14:35:22",
      status: "success"
    },
    {
      id: 2,
      query: "UPDATE claimants SET status = 'processed' WHERE id = ?",
      duration: "1.2ms",
      timestamp: "2025-11-06 14:34:15",
      status: "success"
    },
    {
      id: 3,
      query: "INSERT INTO audit_log (action, user_id, timestamp) VALUES (?,?,?)",
      duration: "0.5ms",
      timestamp: "2025-11-06 14:33:08",
      status: "success"
    }
  ];

  const tableSizes = [
    { name: "claimants", records: 45678, size: "1.2 GB" },
    { name: "audit_log", records: 67890, size: "800 MB" },
    { name: "users", records: 234, size: "15 MB" },
    { name: "organizations", records: 45, size: "2 MB" },
    { name: "files", records: 12345, size: "400 MB" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Database Control</h1>
          <p className="text-slate-600">Monitor database performance, manage backups, and optimize queries</p>
        </div>
        <Link 
          href="/system-admin" 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* Database Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="text-blue-600" size={20} />
            <h3 className="font-medium text-slate-800">Records</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{dbMetrics.totalRecords.toLocaleString()}</p>
          <p className="text-sm text-slate-600">Total Records</p>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Server className="text-green-600" size={20} />
            <h3 className="font-medium text-slate-800">Connections</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{dbMetrics.activeConnections}</p>
          <p className="text-sm text-slate-600">Active</p>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-600" size={20} />
            <h3 className="font-medium text-slate-800">Performance</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{dbMetrics.queryPerformance}</p>
          <p className="text-sm text-slate-600">Avg Query Time</p>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="text-orange-600" size={20} />
            <h3 className="font-medium text-slate-800">Storage</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{dbMetrics.storageUsed}</p>
          <p className="text-sm text-slate-600">Used</p>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-cyan-600" size={20} />
            <h3 className="font-medium text-slate-800">Uptime</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{dbMetrics.uptime}</p>
          <p className="text-sm text-slate-600">Availability</p>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-indigo-600" size={20} />
            <h3 className="font-medium text-slate-800">Backup</h3>
          </div>
          <p className="text-lg font-bold text-slate-800">03:00</p>
          <p className="text-sm text-slate-600">Last Backup</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Queries */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Activity size={20} />
              Recent Queries
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {recentQueries.map((query) => (
              <div key={query.id} className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">{query.timestamp}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {query.duration}
                      </span>
                    </div>
                    <code className="text-sm text-slate-800 bg-slate-100 p-2 rounded block overflow-x-auto">
                      {query.query}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Sizes */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Database size={20} />
              Table Statistics
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {tableSizes.map((table) => (
              <div key={table.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">{table.name}</h4>
                    <p className="text-sm text-slate-600">{table.records.toLocaleString()} records</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">{table.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Server size={20} />
          Database Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <HardDrive className="text-blue-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Create Backup</h4>
              <p className="text-sm text-slate-600">Manual backup</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <TrendingUp className="text-green-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Optimize Tables</h4>
              <p className="text-sm text-slate-600">Improve performance</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <Activity className="text-purple-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Query Monitor</h4>
              <p className="text-sm text-slate-600">Real-time queries</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
            <AlertCircle className="text-orange-600" size={20} />
            <div>
              <h4 className="font-medium text-slate-800">Health Check</h4>
              <p className="text-sm text-slate-600">System diagnostics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Database Status: Healthy</h4>
            <p className="text-green-700 text-sm">
              All database systems are operating normally. Last health check completed at {dbMetrics.lastBackup}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}