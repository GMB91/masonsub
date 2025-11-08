"use client";

import { useEffect, useState } from 'react';
import { Briefcase, CheckCircle, Clock, TrendingUp, User, FileText } from 'lucide-react';
import { RouteGuard } from '../../../contexts/AuthContext';

interface ContractorDashboardData {
  myClaimantsCount: number;
  myTotalValue: number;
  myActivitiesCount: number;
  assignedClaimants: any[];
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
  data: ContractorDashboardData;
}

export default function ContractorDashboard() {
  return (
    <RouteGuard allowedRoles={['contractor']}>
      <ContractorDashboardContent />
    </RouteGuard>
  );
}

function ContractorDashboardContent() {
  const [dashboardData, setDashboardData] = useState<ContractorDashboardData | null>(null);
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
      const token = localStorage.getItem('supabase_token') || 'demo-contractor-token';
      
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
        myClaimantsCount: 23,
        myTotalValue: 456789,
        myActivitiesCount: 8,
        assignedClaimants: [
          { 
            id: '1', 
            full_name: 'Alice Cooper', 
            amount: 15000, 
            state: 'NSW',
            created_at: '2025-11-01T10:00:00Z'
          },
          { 
            id: '2', 
            full_name: 'Bob Wilson', 
            amount: 28500, 
            state: 'VIC',
            created_at: '2025-11-02T14:30:00Z'
          },
          { 
            id: '3', 
            full_name: 'Carol Davis', 
            amount: 12200, 
            state: 'QLD',
            created_at: '2025-11-03T09:15:00Z'
          }
        ],
        recentActivities: [
          {
            id: '1',
            action: 'Updated claimant details',
            entity_type: 'claimant',
            entity_id: '1',
            created_at: '2025-11-06T12:00:00Z'
          },
          {
            id: '2', 
            action: 'Uploaded verification document',
            entity_type: 'document',
            entity_id: '2',
            created_at: '2025-11-06T10:30:00Z'
          }
        ]
      });
      setUser({
        id: 'demo-contractor',
        email: 'contractor@masonvector.com',
        role: 'contractor',
        full_name: 'John Contractor'
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
          <p className="text-slate-600">Loading your workbench...</p>
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
              Welcome back, {user?.full_name} 
            </h1>
            <p className="text-slate-600">Contractor Workbench - Your Assigned Claims & Tasks</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Active Contractor
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">My Assigned Claims</h3>
                <p className="text-3xl font-bold text-slate-800">{dashboardData?.myClaimantsCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Value Managed</h3>
                <p className="text-3xl font-bold text-slate-800">
                  ${dashboardData?.myTotalValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-600">Recent Actions</h3>
                <p className="text-3xl font-bold text-slate-800">{dashboardData?.myActivitiesCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Work Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Claimants */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                My Assigned Claimants
              </h3>
              <span className="text-sm text-slate-500">{dashboardData?.assignedClaimants.length} active</span>
            </div>
            <div className="space-y-3">
              {dashboardData?.assignedClaimants.map((claimant) => (
                <div key={claimant.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-800">{claimant.full_name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-600">{claimant.state}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Assigned: {new Date(claimant.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${claimant.amount?.toLocaleString()}</p>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 mt-1">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
              {dashboardData?.assignedClaimants.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No claims assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              My Recent Activities
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
                        {activity.entity_type} #{activity.entity_id}
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
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <User className="h-5 w-5 text-indigo-600" />
              <div>
                <h4 className="font-medium text-slate-800">Add New Claim</h4>
                <p className="text-sm text-slate-600">Register a new claimant</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-slate-800">Upload Documents</h4>
                <p className="text-sm text-slate-600">Add claim documentation</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-slate-800">Update Status</h4>
                <p className="text-sm text-slate-600">Mark claims as processed</p>
              </div>
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-1">Performance This Month</h3>
              <p className="text-indigo-600">You're managing {dashboardData?.myClaimantsCount} claims worth ${dashboardData?.myTotalValue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-800">92%</p>
              <p className="text-sm text-indigo-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}