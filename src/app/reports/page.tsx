"use client";

import { useEffect, useState } from "react";
import { Download, DollarSign, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface Metrics {
  totalRevenue: number;
  totalCommission: number;
  conversionRate: number;
  avgProcessing: number;
  withinSLA: number;
  staleClaims: number;
  slaRate: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  commission: number;
}

interface ClaimStatus {
  name: string;
  value: number;
  [key: string]: any;
}

interface TimeTracked {
  name: string;
  hours: number;
}

export default function ReportsPage() {
  // Placeholder metrics (to be replaced by Xero + Supabase data)
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: 0,
    totalCommission: 0,
    conversionRate: 0,
    avgProcessing: 0,
    withinSLA: 11,
    staleClaims: 1856,
    slaRate: 1,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Mock data for charts - ready to replace with real data
  const mockRevenueData: RevenueData[] = [
    { month: "Jun 2025", revenue: 2.5, commission: 0.4 },
    { month: "Jul 2025", revenue: 3.1, commission: 0.5 },
    { month: "Aug 2025", revenue: 2.8, commission: 0.42 },
    { month: "Sep 2025", revenue: 3.4, commission: 0.51 },
    { month: "Oct 2025", revenue: 4.1, commission: 0.6 },
    { month: "Nov 2025", revenue: 0, commission: 0 },
  ];

  const mockClaimStatus: ClaimStatus[] = [
    { name: "New", value: 11 },
    { name: "In Progress", value: 814 },
    { name: "Closed", value: 20 },
  ];

  const mockTimeTracked: TimeTracked[] = [
    { name: "Glenn Bromley", hours: 120 },
    { name: "Sarah Johnson", hours: 98 },
    { name: "Mike Chen", hours: 85 },
    { name: "Lisa Anderson", hours: 67 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would fetch from:
      // - /api/xero/financials for revenue/commission
      // - /api/claims/analytics for claim status
      // - /api/timesheets/analytics for time tracking
      // - /api/sla/metrics for SLA performance
      
      setMetrics({
        totalRevenue: 15920.50,
        totalCommission: 2388.08,
        conversionRate: 2.3,
        avgProcessing: 28.5,
        withinSLA: 11,
        staleClaims: 1856,
        slaRate: 0.6,
      });
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleExportReport = () => {
    // TODO: Implement report export functionality
    // This would generate PDF/Excel reports with current data
    console.log("Exporting report...");
    alert("Report export functionality will be implemented with Xero integration");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500">Financial performance and operational metrics</p>
        </div>
        <button 
          onClick={handleExportReport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Download className="h-5 w-5" /> 
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          icon={<DollarSign className="text-green-600 h-6 w-6" />} 
          title="Total Revenue" 
          value={`$${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
          subtitle="Money received from authorities"
          trend="+12.5%"
          trendUp={true}
        />
        <KpiCard 
          icon={<TrendingUp className="text-blue-600 h-6 w-6" />} 
          title="Total Commission" 
          value={`$${metrics.totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
          subtitle="15% commission earned"
          trend="+8.3%"
          trendUp={true}
        />
        <KpiCard 
          icon={<Users className="text-amber-600 h-6 w-6" />} 
          title="Conversion Rate" 
          value={`${metrics.conversionRate}%`} 
          subtitle="20 of 1867 claimed"
          trend="-2.1%"
          trendUp={false}
        />
        <KpiCard 
          icon={<Clock className="text-purple-600 h-6 w-6" />} 
          title="Avg Processing Time" 
          value={`${metrics.avgProcessing} days`} 
          subtitle="From contact to claimed"
          trend="-5.2 days"
          trendUp={true}
        />
      </div>

      {/* SLA Performance */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">SLA Performance</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>Real-time monitoring</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SlaCard 
            color="bg-green-50 text-green-700 border-green-200" 
            value={metrics.withinSLA} 
            label="Claims Within SLA"
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          />
          <SlaCard 
            color="bg-red-50 text-red-700 border-red-200" 
            value={metrics.staleClaims} 
            label="Stale Claims (Action Required)"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
          <SlaCard 
            color="bg-blue-50 text-blue-700 border-blue-200" 
            value={`${metrics.slaRate}%`} 
            label="SLA Compliance Rate"
            icon={<XCircle className="h-5 w-5 text-blue-600" />}
          />
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-600">
            <p className="font-semibold mb-2 text-slate-800">SLA Thresholds:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ul className="list-disc ml-5 space-y-1">
                <li><span className="font-medium">Contacted:</span> 30 days</li>
                <li><span className="font-medium">In Progress:</span> 45 days</li>
              </ul>
              <ul className="list-disc ml-5 space-y-1">
                <li><span className="font-medium">Researching:</span> 14 days</li>
                <li><span className="font-medium">Deep Search Required:</span> 7 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Revenue & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Monthly Revenue & Commission</h3>
            <div className="text-sm text-slate-500">Last 6 Months</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mockRevenueData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}K`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}K`, 
                  name === 'revenue' ? 'Revenue' : 'Commission'
                ]}
                labelStyle={{ color: '#475569' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="commission" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Commission"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Claims by Status */}
        <div className="bg-white p-6 border rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Claims by Status</h3>
            <div className="text-sm text-slate-500">
              Total: {mockClaimStatus.reduce((sum, item) => sum + item.value, 0)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={mockClaimStatus} 
                dataKey="value" 
                outerRadius={90}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {mockClaimStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value, 'Claims']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Time Tracking */}
      <div className="bg-white p-6 border rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Time Tracked by User</h3>
          <div className="text-sm text-slate-500">Current Month</div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockTimeTracked} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} hours`, 'Time Tracked']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="hours" 
              fill="#14B8A6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Pipeline */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Payment Pipeline</h2>
          <div className="text-sm text-slate-500">Updated 2 minutes ago</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PipelineCard 
            title="Pending from Authority" 
            value={0} 
            color="text-amber-600"
            subtitle="Awaiting payment from state authorities"
            icon="⏳"
          />
          <PipelineCard 
            title="Ready to Send to Client" 
            value={0} 
            color="text-blue-600"
            subtitle="Processed and ready for distribution"
            icon="📤"
          />
          <PipelineCard 
            title="Completed Payments" 
            value={0} 
            color="text-green-600"
            subtitle="Successfully paid to clients"
            icon="✅"
          />
        </div>
        
        {/* Pipeline Flow Visualization */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="text-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
              <span>Authority</span>
            </div>
            <div className="flex-1 h-px bg-slate-200 mx-4"></div>
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
              <span>Processing</span>
            </div>
            <div className="flex-1 h-px bg-slate-200 mx-4"></div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
              <span>Client</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Xero Integration Ready</h3>
            <p className="text-sm text-blue-700">
              This dashboard is configured with placeholder data. Once Xero API integration is complete, 
              all metrics will automatically populate with real financial data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Enhanced Components */
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
}

function KpiCard({ icon, title, value, subtitle, trend, trendUp }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
          <div className="flex items-center gap-2">
            {icon}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={`mr-1 ${trendUp ? '↗' : '↘'}`}>
              {trendUp ? '↗' : '↘'}
            </span>
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

interface SlaCardProps {
  color: string;
  value: number | string;
  label: string;
  icon?: React.ReactNode;
}

function SlaCard({ color, value, label, icon }: SlaCardProps) {
  return (
    <div className={`p-5 rounded-xl text-center border ${color} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

interface PipelineCardProps {
  title: string;
  value: number;
  color: string;
  subtitle?: string;
  icon?: string;
}

function PipelineCard({ title, value, color, subtitle, icon }: PipelineCardProps) {
  return (
    <div className="bg-slate-50 p-5 rounded-xl border text-center hover:shadow-md transition-shadow">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className={`text-3xl font-bold mb-1 ${color}`}>
        {value.toLocaleString()}
      </h3>
      <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}