import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Database, HardDrive, Activity, Zap } from "lucide-react";

export default function DataPage() {
  const databases = [
    { name: "PostgreSQL (Supabase)", status: "Connected", size: "2.4 GB", tables: 15 },
    { name: "Redis Cache", status: "Connected", size: "128 MB", keys: 1234 },
  ];

  const tables = [
    { name: "Claimant", rows: "1,234", size: "45 MB", status: "healthy" },
    { name: "Claims", rows: "2,456", size: "78 MB", status: "healthy" },
    { name: "Tasks", rows: "567", size: "12 MB", status: "healthy" },
    { name: "Audit_Log", rows: "12,345", size: "156 MB", status: "healthy" },
    { name: "Users", rows: "23", size: "2 MB", status: "healthy" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Management</h1>
        <p className="text-slate-500 mt-1">Database connections and table statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {databases.map((db) => (
          <Card key={db.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  {db.name}
                </span>
                <span className="text-sm font-normal text-green-600">{db.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Size</p>
                  <p className="text-lg font-semibold text-slate-900">{db.size}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{db.tables ? "Tables" : "Keys"}</p>
                  <p className="text-lg font-semibold text-slate-900">{db.tables || db.keys}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Table</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rows</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.name} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{table.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{table.rows}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{table.size}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {table.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">
                        View Schema
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
