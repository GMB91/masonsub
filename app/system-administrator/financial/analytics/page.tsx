"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Users, Calendar, AlertCircle } from "lucide-react";
import { TESTING_MODE } from "@/lib/testing";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function FinancialAnalyticsPage() {
  const financialMetrics = [
    { label: "Total Claims Value", value: "$2.4M", change: "+15.2%", trend: "up" },
    { label: "Payments Processed", value: "$1.8M", change: "+8.7%", trend: "up" },
    { label: "Average Claim Amount", value: "$12,847", change: "-2.1%", trend: "down" },
    { label: "Processing Time", value: "14 days", change: "-18.5%", trend: "up" }
  ];

  const monthlyData = [
    { month: 'Jan', claims: 45000, payments: 38000 },
    { month: 'Feb', claims: 52000, payments: 41000 },
    { month: 'Mar', claims: 48000, payments: 45000 },
    { month: 'Apr', claims: 61000, payments: 48000 },
    { month: 'May', claims: 55000, payments: 52000 },
    { month: 'Jun', claims: 67000, payments: 58000 },
  ];

  const claimsByState = [
    { name: 'NSW', value: 35, color: '#3B82F6' },
    { name: 'VIC', value: 28, color: '#10B981' },
    { name: 'QLD', value: 20, color: '#F59E0B' },
    { name: 'SA', value: 10, color: '#EF4444' },
    { name: 'Others', value: 7, color: '#6B7280' },
  ];

  const paymentMethods = [
    { method: 'Bank Transfer', count: 234, percentage: 68.4 },
    { method: 'Cheque', count: 87, percentage: 25.4 },
    { method: 'PayPal', count: 21, percentage: 6.1 }
  ];

  return (
    <div className="space-y-6">
      {TESTING_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Testing Mode Active</h3>
            <p className="text-sm text-yellow-700">Financial analytics use simulated data for demonstration purposes.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Analytics</h1>
          <p className="text-slate-500 mt-1">Monitor financial performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {metric.label}
              </CardTitle>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs flex items-center ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{metric.change}</span>
                <span className="text-slate-500 ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Claims vs Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="claims" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="payments" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Claims by State */}
        <Card>
          <CardHeader>
            <CardTitle>Claims Distribution by State</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={claimsByState}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {claimsByState.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {claimsByState.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="font-medium">{method.method}</div>
                    <div className="text-sm text-slate-500">{method.count} transactions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{method.percentage}%</div>
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}