'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  FileText, 
  Mail, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  Database,
  Bell
} from 'lucide-react';

interface PortalStats {
  active_clients: number;
  pending_clients: number;
  active_contractors: number;
  total_claims: number;
  open_claims: number;
  recent_logins: number;
  pending_invites: number;
  security_alerts: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user_email: string;
  resource_type: string;
  created_at: string;
  success: boolean;
}

interface SecurityAlert {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  created_at: string;
  resolved: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin access
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
      router.push('/unauthorized');
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, activityRes, alertsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-activity'),
        fetch('/api/admin/security-alerts')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setSecurityAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionIcon = (action: string, success: boolean) => {
    if (!success) return <XCircle className="h-4 w-4 text-red-500" />;
    
    switch (action) {
      case 'CREATE_PORTAL_LINK':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'LOGIN_SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'USER_UPDATE':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Mason Vector Admin Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                {securityAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {securityAlerts.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('userRole');
                  router.push('/auth/login');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Menu */}
        <nav className="mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Link>
            <Link href="/admin/audit" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <FileText className="h-4 w-4 mr-2" />
              Audit Logs
            </Link>
            <Link href="/admin/system" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <Database className="h-4 w-4 mr-2" />
              System Status
            </Link>
            <Link href="/admin/templates" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <Mail className="h-4 w-4 mr-2" />
              Templates
            </Link>
            <Link href="/admin/security" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </Link>
          </div>
        </nav>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Clients */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Clients
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.active_clients}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500">
                    {stats.pending_clients} pending
                  </div>
                </div>
              </div>
            </div>

            {/* Active Contractors */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Contractors
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.active_contractors}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Claims Summary */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Open Claims
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.open_claims} / {stats.total_claims}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Alerts */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Security Alerts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.security_alerts}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500">
                    {stats.recent_logins} recent logins (24h)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {getActionIcon(activity.action, activity.success)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action.replace(/_/g, ' ').toLowerCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          by {activity.user_email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
            {recentActivity.length > 10 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <Link href="/admin/audit" className="text-sm text-blue-600 hover:text-blue-800">
                  View all activity →
                </Link>
              </div>
            )}
          </div>

          {/* Security Alerts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {securityAlerts.length > 0 ? (
                securityAlerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.event_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {alert.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(alert.created_at)}
                        </p>
                        {!alert.resolved && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                            Unresolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  No security alerts
                </div>
              )}
            </div>
            {securityAlerts.length > 10 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <Link href="/admin/security" className="text-sm text-blue-600 hover:text-blue-800">
                  View all alerts →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/users/create" className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create Portal</p>
                    <p className="text-xs text-gray-500">Invite new user</p>
                  </div>
                </Link>
                
                <Link href="/admin/system/broadcast" className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                  <Bell className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Send Broadcast</p>
                    <p className="text-xs text-gray-500">System notification</p>
                  </div>
                </Link>
                
                <Link href="/admin/audit" className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <Eye className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">View Logs</p>
                    <p className="text-xs text-gray-500">Audit trail</p>
                  </div>
                </Link>
                
                <Link href="/admin/system" className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <Database className="h-6 w-6 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Health</p>
                    <p className="text-xs text-gray-500">Monitor status</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}