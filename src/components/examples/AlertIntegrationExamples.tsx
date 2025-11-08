// Mason Vector - Alert System Integration Example
// Shows how to integrate the real-time message alert system into the main app

'use client';

import React, { useEffect } from 'react';
import { MessageAlertManager, AlertProvider, NotificationPermissionManager } from '@/components/notifications/MessageAlertManager';

// ================================
// MAIN APP LAYOUT INTEGRATION
// ================================

interface AppWithAlertsProps {
  children: React.ReactNode;
}

export function AppWithAlerts({ children }: AppWithAlertsProps) {
  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center space-x-8">
                <div className="text-xl font-bold text-gray-900">
                  Mason Vector
                </div>
                <nav className="hidden md:flex space-x-4">
                  <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
                  <a href="/claimants" className="text-gray-700 hover:text-gray-900">Claimants</a>
                  <a href="/messages" className="text-gray-700 hover:text-gray-900">Messages</a>
                </nav>
              </div>
              
              {/* Alert Bell and User Menu */}
              <div className="flex items-center space-x-4">
                {/* Message Alert Bell */}
                <MessageAlertManager 
                  showBell={true}
                  bellClassName="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onOpenMessage={(messageId) => {
                    // Navigate to specific message
                    window.location.href = `/messages/${messageId}`;
                  }}
                />
                
                {/* User Profile Dropdown */}
                <div className="relative">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <span>User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Permission Banner */}
        <NotificationPermissionManager />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Alert Manager (handles popups and real-time updates) */}
        <MessageAlertManager 
          showBell={false} // Already shown in header
          onOpenMessage={(messageId) => {
            window.location.href = `/messages/${messageId}`;
          }}
        />
      </div>
    </AlertProvider>
  );
}

// ================================
// CONTRACTOR PORTAL INTEGRATION
// ================================

export function ContractorPortalWithAlerts({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Contractor Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Mason Vector - Contractor Portal
              </h1>
            </div>
            
            {/* Contractor Alert Bell */}
            <div className="flex items-center space-x-4">
              <MessageAlertManager 
                showBell={true}
                bellClassName="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                onOpenMessage={(messageId) => {
                  // Open message in contractor context
                  window.location.href = `/contractor/messages/${messageId}`;
                }}
              />
              
              <div className="text-sm text-gray-600">
                <div className="font-medium">Contractor Dashboard</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contractor Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Contractor-specific alerts (blue theme) */}
        <MessageAlertManager 
          showBell={false}
          onOpenMessage={(messageId) => {
            window.location.href = `/contractor/messages/${messageId}`;
          }}
        />
      </div>
    </AlertProvider>
  );
}

// ================================
// ADMIN PORTAL INTEGRATION
// ================================

export function AdminPortalWithAlerts({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <div className="h-screen flex bg-gray-900">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-800 text-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Admin Portal</h2>
          </div>
          <nav className="mt-8">
            {/* Navigation items */}
          </nav>
        </aside>
        
        {/* Admin Content */}
        <div className="flex-1 flex flex-col">
          {/* Admin Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              
              {/* Admin Alert Bell */}
              <MessageAlertManager 
                showBell={true}
                bellClassName="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onOpenMessage={(messageId) => {
                  window.location.href = `/admin/messages/${messageId}`;
                }}
              />
            </div>
          </header>
          
          {/* Admin Main Content */}
          <main className="flex-1 overflow-hidden bg-gray-50 p-6">
            {children}
          </main>
        </div>
        
        {/* Admin-specific alerts */}
        <MessageAlertManager 
          showBell={false}
          onOpenMessage={(messageId) => {
            window.location.href = `/admin/messages/${messageId}`;
          }}
        />
      </div>
    </AlertProvider>
  );
}

// ================================
// MESSAGE PAGE INTEGRATION
// ================================

export function MessagesPageWithAlerts() {
  const { markAlertRead } = useMessageAlerts();

  // Mark messages as read when viewing them
  useEffect(() => {
    const messageId = window.location.pathname.split('/').pop();
    if (messageId) {
      markAlertRead(messageId);
    }
  }, [markAlertRead]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        </div>
        
        <div className="p-6">
          {/* Message content */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium text-blue-900 mb-1">New Message</div>
              <div className="text-blue-800">
                This is an example message that would trigger an alert notification.
              </div>
              <div className="text-xs text-blue-600 mt-2">
                2 minutes ago
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">Previous Message</div>
              <div className="text-gray-700">
                This message has been read and won't trigger alerts.
              </div>
              <div className="text-xs text-gray-500 mt-2">
                1 hour ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// USAGE EXAMPLES
// ================================

/*
// In your main app.tsx or layout.tsx:

import { AppWithAlerts } from '@/components/examples/AlertIntegrationExamples';

export default function App() {
  return (
    <AppWithAlerts>
      <YourAppContent />
    </AppWithAlerts>
  );
}

// For contractor portal:
import { ContractorPortalWithAlerts } from '@/components/examples/AlertIntegrationExamples';

export default function ContractorLayout() {
  return (
    <ContractorPortalWithAlerts>
      <ContractorContent />
    </ContractorPortalWithAlerts>
  );
}

// For admin portal:
import { AdminPortalWithAlerts } from '@/components/examples/AlertIntegrationExamples';

export default function AdminLayout() {
  return (
    <AdminPortalWithAlerts>
      <AdminContent />
    </AdminPortalWithAlerts>
  );
}
*/

// ================================
// TESTING ALERTS
// ================================

export function AlertTester() {
  const createTestAlert = async () => {
    try {
      // This would normally be done by inserting a message
      // The database trigger will automatically create the alert
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'This is a test message alert!',
          recipient_id: 'user-id-here',
          priority: 'normal'
        }),
      });

      if (response.ok) {
        console.log('Test alert created successfully');
      }
    } catch (error) {
      console.error('Error creating test alert:', error);
    }
  };

  const createUrgentAlert = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'URGENT: This is an urgent test message!',
          recipient_id: 'user-id-here',
          priority: 'urgent'
        }),
      });

      if (response.ok) {
        console.log('Urgent test alert created successfully');
      }
    } catch (error) {
      console.error('Error creating urgent alert:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Alert System Tester</h3>
      <div className="space-x-4">
        <button
          onClick={createTestAlert}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Test Alert
        </button>
        <button
          onClick={createUrgentAlert}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Create Urgent Alert
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        These buttons simulate receiving new messages that trigger alerts.
      </div>
    </div>
  );
}

// Import hook (will need to be added to imports when the hook file exists)
function useMessageAlerts() {
  // Placeholder - replace with actual hook import
  return {
    markAlertRead: (messageId: string) => console.log('Marking alert read:', messageId)
  };
}