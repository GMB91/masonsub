// Mason Vector - Message Alert Hooks (Simplified Mock Version)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MessageAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  expires_at?: string;
  is_read: boolean;
  alert_user_id: string;
  metadata?: any;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  alert_types: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

// Simplified mock implementations
export function useMessageAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<MessageAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data for development
  useEffect(() => {
    if (user) {
      const mockAlerts: MessageAlert[] = [
        {
          id: '1',
          alert_type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2-4 AM AEST',
          severity: 'medium',
          created_at: new Date().toISOString(),
          is_read: false,
          alert_user_id: user.id
        },
        {
          id: '2',
          alert_type: 'document',
          title: 'Document Review Required',
          message: 'New documents have been uploaded and require your review',
          severity: 'high',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true,
          alert_user_id: user.id
        }
      ];
      setAlerts(mockAlerts);
      setUnreadCount(mockAlerts.filter(a => !a.is_read).length);
    }
  }, [user]);

  const markAsRead = useCallback(async (alertId: string): Promise<boolean> => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    return true;
  }, []);

  const markAllAsRead = useCallback(async (): Promise<number> => {
    const unreadAlerts = alerts.filter(a => !a.is_read);
    setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
    setUnreadCount(0);
    return unreadAlerts.length;
  }, [alerts]);

  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>): Promise<boolean> => {
    // Mock implementation
    console.log('Updating preferences:', newPrefs);
    return true;
  }, []);

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    preferences: {
      email_enabled: true,
      push_enabled: true,
      alert_types: ['system', 'document', 'payment'],
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00'
    } as NotificationPreferences
  };
}

export function useNotificationStats(timeRange: 'week' | 'month' | 'year' = 'week') {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAlerts: 0,
    readAlerts: 0,
    unreadAlerts: 0,
    alertsByType: {} as Record<string, number>,
    peakHours: [] as number[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Mock stats
      setStats({
        totalAlerts: 45,
        readAlerts: 32,
        unreadAlerts: 13,
        alertsByType: {
          system: 12,
          document: 18,
          payment: 8,
          security: 4,
          general: 3
        },
        peakHours: [9, 10, 11, 14, 15, 16]
      });
    }
  }, [user, timeRange]);

  return { stats, loading };
}