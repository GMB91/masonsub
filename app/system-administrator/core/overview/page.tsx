import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Database, Cpu, HardDrive } from "lucide-react";

export default function SystemOverview() {
  const systemStats = [
    { label: "System Uptime", value: "99.9%", icon: Activity, status: "Healthy" },
    { label: "Database", value: "Active", icon: Database, status: "Connected" },
    { label: "API Services", value: "8/8", icon: Cpu, status: "Running" },
    { label: "Storage Used", value: "45%", icon: HardDrive, status: "Normal" },
  ];

  const services = [
    { name: "Web Application", status: "Running", uptime: "99.9%", port: "3000" },
    { name: "Tracer AI", status: "Running", uptime: "99.8%", port: "8005" },
    { name: "Data Gather", status: "Running", uptime: "99.7%", port: "8000" },
    { name: "Task Manager AI", status: "Running", uptime: "99.9%", port: "8080" },
    { name: "Database Admin AI", status: "Running", uptime: "99.6%", port: "8080" },
    { name: "Supabase DB", status: "Running", uptime: "100%", port: "5432" },
    { name: "Redis Cache", status: "Running", uptime: "99.9%", port: "6379" },
    { name: "Nginx Proxy", status: "Running", uptime: "99.9%", port: "80" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">Infrastructure health and monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.status}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-500">Port {service.port}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{service.status}</p>
                  <p className="text-xs text-slate-500">{service.uptime} uptime</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
