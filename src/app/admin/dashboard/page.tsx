"use client";

import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, TrendingUp, BarChart3, Clock, PieChart } from 'lucide-react';
import { RouteGuard } from '../../../contexts/AuthContext';

interface AdminDashboardData {
  totalClaimants: number;
  totalValue: number;
  todayActivity: number;
  claimantsByState: Record<string, number>;
  recentClaimants: any[];
}

interface DashboardUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

interface DashboardResponse {
  success: boolean;
  user: DashboardUser;
  data: AdminDashboardData;
}

export default function AdminDashboard() {
  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <AdminDashboardContent />
    </RouteGuard>
  );
}

function AdminDashboardContent() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would get the token from auth context
      const token = localStorage.getItem('supabase_token') || 'demo-admin-token';
      
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const result: DashboardResponse = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setUser(result.user);
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Mock data for development
      setDashboardData({
        totalClaimants: 2847,
        totalValue: 15426789,
        todayActivity: 42,
        claimantsByState: {
          'NSW': 1234,
          'VIC': 891,
          'QLD': 456,
          'SA': 178,
          'WA': 88
        },
        recentClaimants: [
          { id: '1', full_name: 'John Smith', amount: 15000, state: 'NSW' },
          { id: '2', full_name: 'Sarah Johnson', amount: 8500, state: 'VIC' },
          { id: '3', full_name: 'Michael Brown', amount: 22000, state: 'QLD' }
        ]
      });
      setUser({
        id: 'demo-admin',
        email: 'admin@masonvector.com',
        role: 'admin',
        full_name: 'System Administrator'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome, {user?.full_name} ({user?.role?.toUpperCase()})
            </h1>
            <p className="text-slate-600">System Overview & Management Dashboard</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Claimants</h3>
                <p className="text-3xl font-bold text-slate-800">{dashboardData?.totalClaimants.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Value</h3>
                <p className="text-3xl font-bold text-slate-800">
                  ${dashboardData?.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Today's Activity</h3>
                <p className="text-3xl font-bold text-slate-800">{dashboardData?.todayActivity}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Growth Rate</h3>
                <p className="text-3xl font-bold text-slate-800">+12.5%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Claims by State */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Claims by State
            </h3>
            <div className="space-y-3">
              {Object.entries(dashboardData?.claimantsByState || {}).map(([state, count]) => (
                <div key={state} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="font-medium text-slate-700">{state}</span>
                  </div>
                  <span className="text-slate-600">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Claimants */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Claimants
            </h3>
            <div className="space-y-3">
              {dashboardData?.recentClaimants.map((claimant) => (
                <div key={claimant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-800">{claimant.full_name}</h4>
                    <p className="text-sm text-slate-600">{claimant.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${claimant.amount?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <h4 className="font-medium text-slate-800">Manage Users</h4>
                <p className="text-sm text-slate-600">Add or edit user accounts</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-slate-800">Process Claims</h4>
                <p className="text-sm text-slate-600">Review pending claims</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-slate-800">View Reports</h4>
                <p className="text-sm text-slate-600">Generate system reports</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-slate-800">System Health</h4>
                <p className="text-sm text-slate-600">Monitor system status</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}