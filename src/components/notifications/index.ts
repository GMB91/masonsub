/**
 * Notification System Entry Point
 * Exports all notification components and utilities
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

// Core components
export { NotificationBell, NotificationBellCompact, NotificationBellWithTooltip } from './NotificationBell';
export { NotificationTray, NotificationTrayCompact } from './NotificationTray';
export { NotificationProvider, withNotifications, useCreateNotificationPopup } from './NotificationProvider';

// Hooks
export {
  useNotifications,
  useNotificationAlerts,
  useUnreadCount,
  useIsTrayOpen,
  useNotificationPreferences,
  useNotificationError,
  useNotificationLoading,
  type NotificationAlert,
  type NotificationPreferences
} from '../../lib/hooks/useNotifications';

// Utility functions for creating system notifications
export const createSystemNotification = async (
  userId: string,
  title: string,
  preview: string,
  actionType: string = 'system',
  actionUrl?: string
) => {
  const { supabase } = await import('../../lib/supabaseClient');
  
  try {
    const { data, error } = await supabase.rpc('create_system_alert', {
      p_user_id: userId,
      p_title: title,
      p_preview_text: preview,
      p_action_type: actionType,
      p_action_url: actionUrl
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
};

// Batch notification creation for multiple users
export const createBulkNotifications = async (
  userIds: string[],
  title: string,
  preview: string,
  actionType: string = 'system',
  actionUrl?: string
) => {
  const results = await Promise.allSettled(
    userIds.map(userId => 
      createSystemNotification(userId, title, preview, actionType, actionUrl)
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed, total: userIds.length };
};

// Notification cleanup utility
export const cleanupOldNotifications = async () => {
  const { supabase } = await import('../../lib/supabaseClient');
  
  try {
    const { data, error } = await supabase.rpc('cleanup_old_notification_alerts');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    throw error;
  }
};

// Check for notification anomalies (Sentinel integration)
export const checkNotificationAnomalies = async () => {
  const { supabase } = await import('../../lib/supabaseClient');
  
  try {
    const { data, error } = await supabase.rpc('detect_notification_anomalies');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking notification anomalies:', error);
    throw error;
  }
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Test notification system
export const testNotificationSystem = async (userId: string) => {
  try {
    await createSystemNotification(
      userId,
      'Test Notification',
      'This is a test notification from Mason Vector System',
      'system',
      '/notifications/test'
    );
    
    return { success: true, message: 'Test notification created successfully' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};