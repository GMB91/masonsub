// Mason Vector - Message Alert Manager
// Central component for managing real-time message alerts across the application

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageAlertPopup, 
  NotificationCenter, 
  NotificationPreferences,
  AlertBell 
} from '@/components/notifications/MessageAlerts';
import { useMessageAlerts, MessageAlert } from '@/lib/hooks/useMessageAlerts';

interface MessageAlertManagerProps {
  /** Whether to show the alert bell in navigation */
  showBell?: boolean;
  /** Custom className for the alert bell */
  bellClassName?: string;
  /** Function to handle message navigation */
  onOpenMessage?: (messageId: string) => void;
}

export function MessageAlertManager({
  showBell = true,
  bellClassName = '',
  onOpenMessage
}: MessageAlertManagerProps) {
  const { 
    alerts, 
    unreadCount, 
    markAlertRead, 
    preferences 
  } = useMessageAlerts();

  // UI State
  const [activePopups, setActivePopups] = useState<MessageAlert[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Handle new alerts - show popups for unread alerts
  useEffect(() => {
    const newUnreadAlerts = alerts.filter(alert => 
      !alert.is_read && 
      !activePopups.some(popup => popup.id === alert.id)
    );

    if (newUnreadAlerts.length > 0 && preferences?.popup_alerts) {
      // Only show popup if not in quiet hours
      const isQuietTime = isQuietHours(preferences);
      
      if (!isQuietTime) {
        setActivePopups(prev => [...prev, ...newUnreadAlerts]);
      }
    }
  }, [alerts, activePopups, preferences]);

  // Handle message navigation
  const handleOpenMessage = useCallback((messageId: string) => {
    if (onOpenMessage) {
      onOpenMessage(messageId);
    } else {
      // Default navigation - adjust based on your routing
      window.location.hash = `#messages/${messageId}`;
    }
    
    // Mark alert as read
    markAlertRead(messageId);
  }, [onOpenMessage, markAlertRead]);

  // Dismiss popup
  const handleDismissPopup = useCallback((alertId: string) => {
    setActivePopups(prev => prev.filter(popup => popup.id !== alertId));
  }, []);

  // Auto-dismiss popups after 10 seconds
  useEffect(() => {
    if (activePopups.length === 0) return;

    const timers = activePopups.map(popup => 
      setTimeout(() => {
        handleDismissPopup(popup.id);
      }, 10000) // 10 second auto-dismiss
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [activePopups, handleDismissPopup]);

  return (
    <>
      {/* Alert Bell (for navigation bars) */}
      {showBell && (
        <AlertBell
          onClick={() => setShowNotificationCenter(true)}
          className={bellClassName}
        />
      )}

      {/* Popup Alerts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {activePopups.map((alert, index) => (
          <div
            key={alert.id}
            style={{ 
              transform: `translateY(${index * -10}px)`,
              zIndex: 50 + index
            }}
          >
            <MessageAlertPopup
              alert={alert}
              onDismiss={() => handleDismissPopup(alert.id)}
              onOpenMessage={handleOpenMessage}
            />
          </div>
        ))}
      </div>

      {/* Notification Center Panel */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      {/* Preferences Panel */}
      <NotificationPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* Preferences Trigger (can be called from settings) */}
      <div className="hidden">
        <button onClick={() => setShowPreferences(true)}>
          Open Notification Preferences
        </button>
      </div>
    </>
  );
}

// ================================
// ALERT SOUND MANAGER
// ================================

export function AlertSoundManager() {
  const { alerts, preferences } = useMessageAlerts();
  const [playedAlerts, setPlayedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!preferences?.sound_alerts) return;

    const newAlerts = alerts.filter(alert => 
      !alert.is_read && 
      !playedAlerts.has(alert.id)
    );

    newAlerts.forEach(alert => {
      const isQuietTime = isQuietHours(preferences);
      
      if (!isQuietTime) {
        playNotificationSound(alert.alert_type);
        setPlayedAlerts(prev => new Set([...prev, alert.id]));
      }
    });
  }, [alerts, preferences, playedAlerts]);

  return null; // This component doesn't render anything
}

// ================================
// GLOBAL ALERT CONTEXT PROVIDER
// ================================

interface AlertContextValue {
  showNotificationCenter: () => void;
  showPreferences: () => void;
  unreadCount: number;
}

const AlertContext = React.createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const { unreadCount } = useMessageAlerts();

  const contextValue: AlertContextValue = {
    showNotificationCenter: () => setShowNotificationCenter(true),
    showPreferences: () => setShowPreferences(true),
    unreadCount
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      
      {/* Global Alert Components */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
      
      <NotificationPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
      
      <AlertSoundManager />
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
}

// ================================
// HELPER FUNCTIONS
// ================================

function isQuietHours(preferences: any): boolean {
  if (!preferences?.quiet_hours_start || !preferences?.quiet_hours_end) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const startTime = parseTime(preferences.quiet_hours_start);
  const endTime = parseTime(preferences.quiet_hours_end);
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function playNotificationSound(alertType: string) {
  try {
    const audio = new Audio();
    
    // Different sounds for different alert types
    switch (alertType) {
      case 'urgent':
        audio.src = '/sounds/urgent-alert.mp3';
        break;
      case 'system':
        audio.src = '/sounds/system-alert.mp3';
        break;
      default:
        audio.src = '/sounds/message-alert.mp3';
    }
    
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Fallback to system beep if audio files not available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        speechSynthesis.speak(utterance);
      }
    });
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

// ================================
// NOTIFICATION PERMISSION MANAGER
// ================================

export function NotificationPermissionManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  };

  useEffect(() => {
    // Auto-request permission on first visit
    if (permission === 'default') {
      setTimeout(requestPermission, 2000); // Delay to avoid immediate popup
    }
  }, [permission]);

  if (!('Notification' in window)) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="text-sm text-yellow-800">
          <strong>Desktop notifications are blocked.</strong> 
          <br />
          To receive real-time alerts, please enable notifications in your browser settings.
        </div>
      </div>
    );
  }

  if (permission === 'default') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <strong>Enable desktop notifications</strong> to get real-time message alerts.
          </div>
          <button
            onClick={requestPermission}
            className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Enable
          </button>
        </div>
      </div>
    );
  }

  return null;
}