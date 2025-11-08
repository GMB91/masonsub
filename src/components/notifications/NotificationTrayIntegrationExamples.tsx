/**
 * Notification Tray Integration Examples
 * Ready-to-use integration examples for different portals
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

'use client';

import React from 'react';
import { 
  NotificationBell,
  NotificationProvider,
  useNotifications,
  createSystemNotification
} from './index';

// Example 1: Basic Header Integration
export function HeaderWithNotifications() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Mason Vector" className="h-8" />
          <h1 className="text-xl font-semibold text-slate-800">
            Mason Vector Portal
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-slate-600 hover:text-slate-800">
              Dashboard
            </a>
            <a href="/claims" className="text-slate-600 hover:text-slate-800">
              Claims
            </a>
            <a href="/messages" className="text-slate-600 hover:text-slate-800">
              Messages
            </a>
          </nav>
          
          {/* Notification Bell */}
          <NotificationBell variant="ghost" size="md" />
          
          <div className="flex items-center gap-3">
            <img 
              src="/default-avatar.png" 
              alt="User" 
              className="h-8 w-8 rounded-full"
            />
            <button className="text-slate-600 hover:text-slate-800">
              John Doe
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Example 2: Admin Portal Integration
export function AdminHeaderWithNotifications() {
  const { unreadCount } = useNotifications();
  
  return (
    <header className="bg-slate-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Admin Portal</h1>
          <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm">
            System Management
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-300">
            {unreadCount > 0 && (
              <span className="text-yellow-400">
                {unreadCount} pending notification{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <NotificationBell 
            variant="ghost" 
            className="text-white hover:bg-slate-700"
          />
          
          <button className="text-slate-300 hover:text-white">
            Admin User
          </button>
        </div>
      </div>
    </header>
  );
}

// Example 3: Mobile-Responsive Header
export function MobileHeaderWithNotifications() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <h1 className="text-lg font-semibold text-slate-800">
              Mason Vector
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Compact notification bell for mobile */}
            <NotificationBell 
              size="sm" 
              variant="ghost"
              className="sm:hidden"
            />
            
            {/* Regular bell for larger screens */}
            <NotificationBell 
              size="md" 
              variant="ghost"
              className="hidden sm:block"
            />
            
            <button className="p-2 rounded-lg hover:bg-slate-100">
              <img 
                src="/default-avatar.png" 
                alt="Profile" 
                className="h-6 w-6 rounded-full"
              />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4">
            <a href="/dashboard" className="block py-2 text-slate-600">
              Dashboard
            </a>
            <a href="/claims" className="block py-2 text-slate-600">
              Claims
            </a>
            <a href="/messages" className="block py-2 text-slate-600">
              Messages
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

// Example 4: Contractor Portal Integration
export function ContractorHeaderWithNotifications() {
  return (
    <header className="bg-indigo-600 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Contractor Portal</h1>
          <span className="bg-indigo-700 text-indigo-100 px-2 py-1 rounded text-sm">
            Active Assignment
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell 
            variant="ghost"
            className="text-white hover:bg-indigo-700"
          />
          
          <div className="text-sm">
            <div className="font-medium">Sarah Johnson</div>
            <div className="text-indigo-200">Licensed Investigator</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Example 5: Root App Setup with Notification Provider
export function AppWithNotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider
      enablePopups={true}
      popupDuration={6000}
      maxPopups={3}
      position="top-right"
    >
      {children}
    </NotificationProvider>
  );
}

// Example 6: System Alert Creation Utilities
export const NotificationUtils = {
  // Welcome new user
  async welcomeNewUser(userId: string, userName: string) {
    await createSystemNotification(
      userId,
      'Welcome to Mason Vector',
      `Hi ${userName}! Your account has been set up successfully.`,
      'system',
      '/getting-started'
    );
  },

  // Claim status update
  async notifyClaimUpdate(userId: string, claimId: string, status: string) {
    await createSystemNotification(
      userId,
      'Claim Status Update',
      `Claim #${claimId} status changed to: ${status}`,
      'alert',
      `/claims/${claimId}`
    );
  },

  // Document upload notification
  async notifyDocumentUploaded(userId: string, documentName: string) {
    await createSystemNotification(
      userId,
      'Document Uploaded',
      `"${documentName}" has been successfully uploaded`,
      'system',
      '/documents'
    );
  },

  // System maintenance warning
  async notifyMaintenance(userIds: string[], maintenanceTime: string) {
    const { createBulkNotifications } = await import('./index');
    
    await createBulkNotifications(
      userIds,
      'Scheduled Maintenance',
      `System maintenance scheduled for ${maintenanceTime}`,
      'warning',
      '/maintenance-info'
    );
  },

  // Payment processed
  async notifyPayment(userId: string, amount: string) {
    await createSystemNotification(
      userId,
      'Payment Processed',
      `Payment of ${amount} has been successfully processed`,
      'system',
      '/payments'
    );
  }
};

// Example 7: Custom Hook for Portal-Specific Notifications
export function usePortalNotifications(portalType: 'admin' | 'contractor' | 'client') {
  const notifications = useNotifications();
  
  // Filter notifications by portal type if needed
  const portalAlerts = React.useMemo(() => {
    return notifications.alerts.filter((alert: any) => {
      // Add portal-specific filtering logic here
      return true; // For now, show all alerts
    });
  }, [notifications.alerts]);

  // Portal-specific notification creation
  const createPortalNotification = async (
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    // Add portal-specific logic
    return NotificationUtils.notifyClaimUpdate('user-id', 'claim-id', 'updated');
  };

  return {
    ...notifications,
    alerts: portalAlerts,
    createPortalNotification
  };
}

// Example 8: Testing Component
export function NotificationTestPanel() {
  const [userId, setUserId] = React.useState('');
  const [message, setMessage] = React.useState('Test notification message');
  
  const handleTestNotification = async () => {
    if (!userId || !message) return;
    
    try {
      await createSystemNotification(
        userId,
        'Test Notification',
        message,
        'system'
      );
      alert('Test notification sent!');
    } catch (error) {
      alert('Error sending notification: ' + error);
    }
  };
  
  return (
    <div className="p-6 bg-slate-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test Notifications</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter user UUID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Enter notification message"
          />
        </div>
        
        <button
          onClick={handleTestNotification}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Send Test Notification
        </button>
      </div>
    </div>
  );
}