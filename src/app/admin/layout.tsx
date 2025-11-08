'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText, 
  Clock, 
  DollarSign, 
  Settings, 
  BarChart3, 
  Workflow,
  Shield,
  Mail,
  Smartphone
} from 'lucide-react'

const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'System overview and metrics'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage system users'
  },
  {
    name: 'Contractors',
    href: '/admin/contractors',
    icon: UserCheck,
    description: 'Manage contractor accounts'
  },
  {
    name: 'Timesheets',
    href: '/admin/timesheets',
    icon: Clock,
    description: 'Review and approve timesheets'
  },
  {
    name: 'Communication',
    href: '/admin/templates',
    icon: Mail,
    description: 'Email & SMS templates',
    badge: 'New'
  },
  {
    name: 'Finances',
    href: '/admin/finances',
    icon: DollarSign,
    description: 'Financial management'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
    description: 'Analytics and reports'
  },
  {
    name: 'Workflows',
    href: '/admin/workflows',
    icon: Workflow,
    description: 'Process automation'
  },
  {
    name: 'Audit',
    href: '/admin/audit',
    icon: Shield,
    description: 'System audit logs'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need administrator privileges to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">System Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Logged in as:</span>
              <span className="text-sm font-medium text-gray-900">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`
                      flex-shrink-0 -ml-1 mr-3 h-5 w-5
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/templates"
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  <Mail className="h-4 w-4 inline mr-2" />
                  Create Template
                </Link>
                <Link
                  href="/admin/users"
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Add User
                </Link>
                <Link
                  href="/admin/reports"
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  View Reports
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}