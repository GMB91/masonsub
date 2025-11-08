"use client";

import { useEffect, useState } from 'react';
import { Shield, FileText, Clock, DollarSign, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { RouteGuard } from '../../../contexts/AuthContext';

interface ClientDashboardData {
  myClaims: any[];
  totalClaimValue: number;
  totalPendingValue: number;
  recentActivities: any[];
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
  data: ClientDashboardData;
}

export default function ClientDashboard() {
  return (
    <RouteGuard allowedRoles={['client']}>
      <ClientDashboardContent />
    </RouteGuard>
  );
}

function ClientDashboardContent() {
  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null);
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
      const token = localStorage.getItem('supabase_token') || 'demo-client-token';
      
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
        myClaims: [
          { 
            id: '1', 
            full_name: 'Jane Client', 
            amount: 25000, 
            state: 'NSW',
            status: 'in_progress',
            created_at: '2025-10-15T10:00:00Z',
            updated_at: '2025-11-05T14:30:00Z'
          },
          { 
            id: '2', 
            full_name: 'Jane Client', 
            amount: 8500, 
            state: 'VIC',
            status: 'completed',
            created_at: '2025-09-20T09:00:00Z',
            updated_at: '2025-10-25T16:45:00Z'
          }
        ],
        totalClaimValue: 33500,
        totalPendingValue: 25000,
        recentActivities: [
          {
            id: '1',
            action: 'Document verification completed',
            entity_type: 'claim',
            entity_id: '1',
            created_at: '2025-11-05T14:30:00Z'
          },
          {
            id: '2', 
            action: 'Claim payment processed',
            entity_type: 'claim',
            entity_id: '2',
            created_at: '2025-10-25T16:45:00Z'
          }
        ]
      });
      setUser({
        id: 'demo-client',
        email: 'client@example.com',
        role: 'client',
        full_name: 'Jane Client'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your claims...</p>
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

  const completedClaims = dashboardData?.myClaims.filter(claim => claim.status === 'completed').length || 0;
  const pendingClaims = dashboardData?.myClaims.filter(claim => claim.status !== 'completed').length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-slate-600">Client Portal - Your Claims & Recovery Status</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Verified Client
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Claims</h3>
                <p className="text-3xl font-bold text-slate-800">{dashboardData?.myClaims.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{completedClaims}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Value</h3>
                <p className="text-3xl font-bold text-slate-800">
                  ${dashboardData?.totalClaimValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Pending Value</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  ${dashboardData?.totalPendingValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Claims Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Your Claims</h3>
            <span className="text-sm text-slate-500">{dashboardData?.myClaims.length} total</span>
          </div>
          
          <div className="space-y-4">
            {dashboardData?.myClaims.map((claim) => (
              <div key={claim.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">Claim #{claim.id}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        {claim.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium text-slate-700">State:</span> {claim.state}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Submitted:</span> {new Date(claim.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Last Update:</span> {new Date(claim.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">${claim.amount?.toLocaleString()}</p>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 mt-2">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {dashboardData?.myClaims.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Claims Yet</h3>
                <p>You don't have any claims in the system yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities & Communication */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {dashboardData?.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-indigo-100 rounded-full mt-1">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">
                        Claim #{activity.entity_id}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {dashboardData?.recentActivities.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <div>
                  <h4 className="font-medium text-slate-800">Contact Support</h4>
                  <p className="text-sm text-slate-600">Get help with your claims</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-slate-800">Upload Documents</h4>
                  <p className="text-sm text-slate-600">Provide additional documentation</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-slate-800">Payment History</h4>
                  <p className="text-sm text-slate-600">View completed payments</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Your Recovery Progress</h3>
              <p className="text-green-700">
                {completedClaims} of {dashboardData?.myClaims.length} claims completed
                {dashboardData?.totalClaimValue ? ` - $${dashboardData.totalClaimValue.toLocaleString()} total value` : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    {dashboardData?.myClaims.length ? Math.round((completedClaims / dashboardData.myClaims.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-green-600">Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}