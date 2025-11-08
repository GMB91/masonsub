// Mason Vector - Message Alert Hooks (Build Compatible Version)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MessageAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string | { content: string };
  message_id: string;
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
  popup_alerts: boolean;
  sound_alerts: boolean;
  email_alerts: boolean;
  digest_frequency: string;
  alert_types: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export function useMessageAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<MessageAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    popup_alerts: true,
    sound_alerts: true,
    email_alerts: true,
    digest_frequency: 'daily',
    alert_types: ['system', 'document', 'payment']
  });

  useEffect(() => {
    if (user) {
      const mockAlerts: MessageAlert[] = [
        {
          id: '1',
          message_id: '1',
          alert_type: 'system',
          title: 'System Maintenance',
          message: { content: 'Scheduled maintenance will occur tonight from 2-4 AM AEST' },
          severity: 'medium',
          created_at: new Date().toISOString(),
          is_read: false,
          alert_user_id: user.id
        }
      ];
      setAlerts(mockAlerts);
      setUnreadCount(1);
    }
  }, [user]);

  const markAsRead = useCallback(async (alertId: string): Promise<boolean> => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    return true;
  }, []);

  const markAlertRead = markAsRead;

  const markAllAsRead = useCallback(async (): Promise<number> => {
    const count = unreadCount;
    setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
    setUnreadCount(0);
    return count;
  }, [unreadCount]);

  const markAllAlertsRead = markAllAsRead;

  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>): Promise<boolean> => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    return true;
  }, []);

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    markAlertRead,
    markAllAlertsRead,
    updatePreferences,
    preferences
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