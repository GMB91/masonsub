/**
 * Enhanced Notifications Hook for Notification Tray System
 * Provides comprehensive notification management with tray functionality
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useCallback } from 'react';

export interface NotificationAlert {
  id: string;
  user_id: string;
  message_id?: string;
  preview_text: string;
  sender_name: string;
  sender_avatar_url?: string;
  action_type: 'message' | 'system' | 'alert' | 'reminder' | 'warning';
  action_url?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  show_previews: boolean;
  play_sound: boolean;
  tray_auto_open: boolean;
  max_tray_items: number;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface NotificationState {
  // Core state
  alerts: NotificationAlert[];
  unreadCount: number;
  isLoading: boolean;
  isTrayOpen: boolean;
  preferences: NotificationPreferences;
  
  // Connection state
  isSubscribed: boolean;
  lastSync: string | null;
  error: string | null;
  
  // Actions
  setTrayOpen: (open: boolean) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => Promise<void>;
  
  // Preferences
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  
  // Internal actions
  _addAlert: (alert: NotificationAlert) => void;
  _setAlerts: (alerts: NotificationAlert[]) => void;
  _setUnreadCount: (count: number) => void;
  _setLoading: (loading: boolean) => void;
  _setError: (error: string | null) => void;
  _setSubscribed: (subscribed: boolean) => void;
}

// Default preferences
const defaultPreferences: NotificationPreferences = {
  show_previews: true,
  play_sound: true,
  tray_auto_open: false,
  max_tray_items: 20,
  quiet_hours_start: undefined,
  quiet_hours_end: undefined,
};

// Create the store
export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        alerts: [],
        unreadCount: 0,
        isLoading: false,
        isTrayOpen: false,
        preferences: defaultPreferences,
        isSubscribed: false,
        lastSync: null,
        error: null,

        // Actions
        setTrayOpen: (open: boolean) => {
          set({ isTrayOpen: open });
          
          // Track tray viewing for audit will be handled by the component
        },

        markRead: async (id: string) => {
          const { alerts } = get();
          
          // Optimistic update
          set(state => ({
            alerts: state.alerts.map(alert =>
              alert.id === id ? { ...alert, is_read: true, read_at: new Date().toISOString() } : alert
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));

          // Update database
          try {
            const { error } = await supabase
              .from('message_alerts')
              .update({ 
                is_read: true, 
                read_at: new Date().toISOString() 
              })
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Error marking alert as read:', error);
            // Revert optimistic update on error
            set({ alerts });
          }
        },

        markAllRead: async () => {
          const { alerts } = get();
          const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
          
          if (unreadIds.length === 0) return;

          // Optimistic update
          set(state => ({
            alerts: state.alerts.map(alert => ({ 
              ...alert, 
              is_read: true, 
              read_at: alert.is_read ? alert.read_at : new Date().toISOString() 
            })),
            unreadCount: 0
          }));

          // Update database
          try {
            const { error } = await supabase
              .from('message_alerts')
              .update({ 
                is_read: true, 
                read_at: new Date().toISOString() 
              })
              .in('id', unreadIds);

            if (error) throw error;
          } catch (error) {
            console.error('Error marking all alerts as read:', error);
            // Revert optimistic update on error
            set({ alerts });
          }
        },

        removeAlert: (id: string) => {
          set(state => {
            const alert = state.alerts.find(a => a.id === id);
            return {
              alerts: state.alerts.filter(a => a.id !== id),
              unreadCount: alert && !alert.is_read ? 
                Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
          });
        },

        clearAllAlerts: async () => {
          // User validation will be handled by the component
          set({ alerts: [], unreadCount: 0 });
        },

        updatePreferences: async (newPrefs: Partial<NotificationPreferences>) => {
          // User validation will be handled by the component
          const updatedPrefs = { ...get().preferences, ...newPrefs };
          set({ preferences: updatedPrefs });
        },

        // Internal actions
        _addAlert: (alert: NotificationAlert) => {
          set(state => {
            const exists = state.alerts.some(a => a.id === alert.id);
            if (exists) return state;

            const newAlerts = [alert, ...state.alerts].slice(0, state.preferences.max_tray_items);
            return {
              alerts: newAlerts,
              unreadCount: alert.is_read ? state.unreadCount : state.unreadCount + 1
            };
          });
        },

        _setAlerts: (alerts: NotificationAlert[]) => {
          const unreadCount = alerts.filter(a => !a.is_read).length;
          set({ alerts, unreadCount, lastSync: new Date().toISOString() });
        },

        _setUnreadCount: (count: number) => set({ unreadCount: count }),
        _setLoading: (loading: boolean) => set({ isLoading: loading }),
        _setError: (error: string | null) => set({ error }),
        _setSubscribed: (subscribed: boolean) => set({ isSubscribed: subscribed }),
      }),
      {
        name: 'mason-notifications',
        partialize: (state) => ({
          preferences: state.preferences,
          lastSync: state.lastSync
        })
      }
    )
  )
);

// Custom hook for notification management
export const useNotifications = () => {
  const store = useNotificationStore();
  const { user } = useAuth();

  // Initialize notifications on user login
  const initializeNotifications = useCallback(async () => {
    if (!user) return;

    store._setLoading(true);
    store._setError(null);

    try {
      // Load user preferences
      const { data: prefsData } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefsData) {
        store.updatePreferences(prefsData);
      }

      // Load existing alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('message_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(store.preferences.max_tray_items);

      if (alertsError) throw alertsError;

      store._setAlerts(alertsData || []);

    } catch (error) {
      console.error('Error initializing notifications:', error);
      store._setError(error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      store._setLoading(false);
    }
  }, [user, store]);

  // Subscribe to realtime updates
  const subscribeToAlerts = useCallback(() => {
    if (!user || store.isSubscribed) return;

    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const newAlert = payload.new as NotificationAlert;
          store._addAlert(newAlert);

          // Play notification sound if enabled
          if (store.preferences.play_sound && !isQuietHours(store.preferences)) {
            playNotificationSound();
          }

          // Auto-open tray if enabled
          if (store.preferences.tray_auto_open) {
            store.setTrayOpen(true);
          }

          // Show browser notification if permission granted
          showBrowserNotification(newAlert, store.preferences);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const updatedAlert = payload.new as NotificationAlert;
          store._setAlerts(
            store.alerts.map(alert => 
              alert.id === updatedAlert.id ? updatedAlert : alert
            )
          );
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          store._setSubscribed(true);
        } else if (status === 'CHANNEL_ERROR') {
          store._setError('Connection error');
          store._setSubscribed(false);
        }
      });

    return () => {
      channel.unsubscribe();
      store._setSubscribed(false);
    };
  }, [user, store]);

  // Initialize when user changes
  useEffect(() => {
    if (user) {
      initializeNotifications();
      const unsubscribe = subscribeToAlerts();
      return unsubscribe;
    } else {
      // Clear state when user logs out
      store._setAlerts([]);
      store._setSubscribed(false);
    }
  }, [user, initializeNotifications, subscribeToAlerts]);

  return store;
};

// Utility functions
const isQuietHours = (preferences: NotificationPreferences): boolean => {
  if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const startTime = parseTime(preferences.quiet_hours_start);
  const endTime = parseTime(preferences.quiet_hours_end);

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime <= endTime;
  }
};

const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Fallback to system beep
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    });
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

const showBrowserNotification = (alert: NotificationAlert, preferences: NotificationPreferences) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = alert.sender_name || 'Mason Vector';
  const body = preferences.show_previews ? alert.preview_text : 'You have a new message';

  const notification = new Notification(title, {
    body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/notification-badge.png',
    tag: alert.id,
    requireInteraction: false,
    silent: isQuietHours(preferences)
  });

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  // Handle click to open relevant page
  notification.onclick = () => {
    window.focus();
    if (alert.action_url) {
      window.location.href = alert.action_url;
    }
    notification.close();
  };
};

// Export individual selectors for performance
export const useNotificationAlerts = () => useNotificationStore(state => state.alerts);
export const useUnreadCount = () => useNotificationStore(state => state.unreadCount);
export const useIsTrayOpen = () => useNotificationStore(state => state.isTrayOpen);
export const useNotificationPreferences = () => useNotificationStore(state => state.preferences);
export const useNotificationError = () => useNotificationStore(state => state.error);
export const useNotificationLoading = () => useNotificationStore(state => state.isLoading);