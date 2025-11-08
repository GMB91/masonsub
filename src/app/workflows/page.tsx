"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, CheckCircle, Calendar, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Metrics {
  autoActions: number;
  statusChanges: number;
  automationRatio: number;
  reminderCompletion: number;
  upcomingTasks: number;
  overdueReminders: number;
  nearDueReminders: number;
}

interface ChartDataPoint {
  date: string;
  auto: number;
  reminders: number;
  status: number;
}

export default function WorkflowAutomationPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    autoActions: 0,
    statusChanges: 0,
    automationRatio: 0,
    reminderCompletion: 0,
    upcomingTasks: 0,
    overdueReminders: 0,
    nearDueReminders: 0,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // In development, use mock data to avoid external API calls
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock workflow metrics in development mode");
          setMetrics({
            autoActions: 25,
            statusChanges: 42,
            automationRatio: 85,
            reminderCompletion: 92,
            overdueReminders: 3,
            upcomingTasks: 12,
            nearDueReminders: 8
          });
          setChartData([
            { date: "2024-01", auto: 15, reminders: 8, status: 12 },
            { date: "2024-02", auto: 22, reminders: 12, status: 18 },
            { date: "2024-03", auto: 35, reminders: 18, status: 25 }
          ]);
          setError(null);
          setIsLoading(false);
          return;
        }
        
        const res = await fetch("/api/workflows/metrics");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setMetrics(data.metrics);
        setChartData(data.chart);
        setError(null);
      } catch (err) {
        console.error("Error fetching workflow metrics:", err);
        setError(err instanceof Error ? err.message : "Failed to load workflow metrics");
        
        // Fallback to mock data even in production if API fails
        setMetrics({
          autoActions: 0,
          statusChanges: 0,
          automationRatio: 0,
          reminderCompletion: 0,
          overdueReminders: 0,
          upcomingTasks: 0,
          nearDueReminders: 0
        });
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    // Only set up interval in production
    if (process.env.NODE_ENV !== 'development') {
      const interval = setInterval(fetchData, 300000);
      return () => clearInterval(interval);
    }
  }, []);

  // Determine alert color and message
  const hasOverdue = metrics.overdueReminders > 0;
  const hasNearDue = !hasOverdue && metrics.nearDueReminders > 0;
  const alertColor = hasOverdue 
    ? "bg-red-50 border-red-300 text-red-700"
    : hasNearDue 
    ? "bg-amber-50 border-amber-300 text-amber-700"
    : "";

  const alertIconColor = hasOverdue ? "text-red-600" : "text-amber-500";

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Error Loading Workflow Data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="text-purple-600" /> Workflow Automation
        </h1>
        <p className="text-slate-500">Automated actions and workflow performance metrics</p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Auto Actions (30d)" 
          value={metrics.autoActions} 
          subtitle="30-day total" 
          icon={<Zap className="text-purple-500 h-6 w-6" />} 
        />
        <MetricCard 
          title="Status Changes (30d)" 
          value={metrics.statusChanges} 
          subtitle="Workflow triggered" 
          icon={<TrendingUp className="text-blue-500 h-6 w-6" />} 
        />
        <MetricCard 
          title="Automation Ratio" 
          value={`${metrics.automationRatio}%`} 
          subtitle="Auto vs manual" 
          icon={<UsersIcon />} 
        />
        <MetricCard 
          title="Reminder Completion" 
          value={`${metrics.reminderCompletion}%`} 
          subtitle="Completed reminders" 
          icon={<CheckCircle className="text-green-500 h-6 w-6" />} 
        />
        <MetricCard 
          title="Upcoming Tasks" 
          value={metrics.upcomingTasks} 
          subtitle="Next 7 days" 
          icon={<Calendar className="text-amber-500 h-6 w-6" />} 
        />
      </div>

      {/* Dynamic Alert Section */}
      {(hasOverdue || hasNearDue) && (
        <div className={`${alertColor} border px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2`}>
          <AlertTriangle className={`h-5 w-5 ${alertIconColor}`} />
          <div>
            <p className="font-semibold">
              {hasOverdue
                ? `${metrics.overdueReminders} Overdue Reminders`
                : `${metrics.nearDueReminders} Reminders Due Soon`}
            </p>
            <p className="text-sm">
              {hasOverdue
                ? "These tasks require immediate attention"
                : "These tasks are approaching their due dates"}
            </p>
          </div>
        </div>
      )}

      {/* Workflow Activity Chart */}
      <div className="bg-white border rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800">Workflow Activity</h3>
          <div className="text-sm text-slate-500">Last 7 Days</div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
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
              dataKey="auto" 
              stroke="#A855F7" 
              strokeWidth={3}
              dot={{ fill: '#A855F7', strokeWidth: 2, r: 4 }}
              name="Auto Enrichments" 
            />
            <Line 
              type="monotone" 
              dataKey="reminders" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Auto Reminders" 
            />
            <Line 
              type="monotone" 
              dataKey="status" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Status Changes" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Active Workflow Rules */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Active Workflow Rules</h2>
        <WorkflowRule 
          status="Contacted" 
          color="bg-blue-50 border-blue-200" 
          label="Auto Follow-up Reminder" 
          desc='When status changes to "Contacted", automatically create a follow-up reminder for 7 days later' 
          active={true} 
        />
        <WorkflowRule 
          status="In Progress" 
          color="bg-purple-50 border-purple-200" 
          label="Document Check Reminder" 
          desc='When status changes to "In Progress", automatically create a document verification reminder for 3 days later' 
          active={false}
        />
        <WorkflowRule 
          status="Claimed" 
          color="bg-green-50 border-green-200" 
          label="Thank You Letter Reminder" 
          desc='When status changes to "Claimed", automatically create a thank-you letter reminder for 1 day later' 
          active={false}
        />
        <WorkflowRule 
          status="Skip Trace Complete" 
          color="bg-pink-50 border-pink-200" 
          label="Auto Status Update" 
          desc='When skip trace finds data, automatically update status to "Researching"; if none, set to "Deep Search Required"' 
          active={true}
        />
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Workflow Performance Insights</h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-indigo-200">•</span>
            <span>Automated workflows have saved <strong>5 minutes</strong> of manual work (30 days)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-200">•</span>
            <span>Average <strong>{Math.round((metrics.autoActions / 30) * 10) / 10 || 0}</strong> automated actions per day reduce human error</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-200">•</span>
            <span><strong>{metrics.reminderCompletion}%</strong> reminder completion rate ensures follow-through</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-200">•</span>
            <span>Workflows maintain consistent client communication and documentation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* Components */

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

interface WorkflowRuleProps {
  status: string;
  color: string;
  label: string;
  desc: string;
  active: boolean;
}

function WorkflowRule({ status, color, label, desc, active }: WorkflowRuleProps) {
  return (
    <div className={`${color} border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-full border">
          Status: {status}
        </span>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            active
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-orange-100 text-orange-700 border border-orange-200"
          }`}
        >
          {active ? "Active" : "No Recent Activity"}
        </span>
      </div>
      <h4 className="font-semibold text-slate-800 mb-1">{label}</h4>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-6 w-6 text-cyan-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" 
      />
    </svg>
  );
}