/**
 * NotificationProvider Component
 * Global notification system provider and popup manager
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { 
  useNotifications,
  useNotificationAlerts,
  type NotificationAlert 
} from '../../lib/hooks/useNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
  enablePopups?: boolean;
  popupDuration?: number;
  maxPopups?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface PopupAlert extends NotificationAlert {
  popupId: string;
  showTime: number;
}

export function NotificationProvider({ 
  children,
  enablePopups = true,
  popupDuration = 5000,
  maxPopups = 3,
  position = 'top-right'
}: NotificationProviderProps) {
  const alerts = useNotificationAlerts();
  const { markRead } = useNotifications();
  const [popupAlerts, setPopupAlerts] = useState<PopupAlert[]>([]);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  // Handle new alerts for popups
  useEffect(() => {
    if (!enablePopups) return;

    const newAlerts = alerts.slice(0, alerts.length - lastAlertCount);
    
    if (newAlerts.length > 0) {
      const newPopups = newAlerts
        .filter(alert => !alert.is_read)
        .slice(0, maxPopups)
        .map(alert => ({
          ...alert,
          popupId: `popup-${alert.id}-${Date.now()}`,
          showTime: Date.now()
        }));

      if (newPopups.length > 0) {
        setPopupAlerts(prev => [...newPopups, ...prev].slice(0, maxPopups));
      }
    }

    setLastAlertCount(alerts.length);
  }, [alerts, enablePopups, maxPopups, lastAlertCount]);

  // Auto-dismiss popups after duration
  useEffect(() => {
    if (popupAlerts.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setPopupAlerts(prev => 
        prev.filter(popup => now - popup.showTime < popupDuration)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [popupAlerts, popupDuration]);

  const dismissPopup = (popupId: string) => {
    setPopupAlerts(prev => prev.filter(p => p.popupId !== popupId));
  };

  const handlePopupClick = async (alert: PopupAlert) => {
    // Mark as read
    if (!alert.is_read) {
      await markRead(alert.id);
    }

    // Navigate if URL provided
    if (alert.action_url) {
      window.location.href = alert.action_url;
    }

    // Dismiss popup
    dismissPopup(alert.popupId);
  };

  const getPopupIcon = (alert: NotificationAlert) => {
    switch (alert.action_type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'system':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPopupColors = (alert: NotificationAlert) => {
    switch (alert.action_type) {
      case 'alert':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          accent: 'bg-red-500'
        };
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          accent: 'bg-yellow-500'
        };
      case 'system':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          accent: 'bg-green-500'
        };
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          accent: 'bg-blue-500'
        };
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <>
      {children}
      
      {/* Popup Notifications */}
      {enablePopups && popupAlerts.length > 0 && (
        <div className={cn(
          'fixed z-50 flex flex-col gap-3 w-96 max-w-[calc(100vw-2rem)]',
          positionClasses[position]
        )}>
          {popupAlerts.map((alert) => {
            const colors = getPopupColors(alert);
            const timeRemaining = popupDuration - (Date.now() - alert.showTime);
            const progress = (timeRemaining / popupDuration) * 100;
            
            return (
              <div
                key={alert.popupId}
                onClick={() => handlePopupClick(alert)}
                className={cn(
                  'relative overflow-hidden rounded-lg shadow-lg border cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]',
                  colors.border,
                  colors.bg,
                  'animate-in slide-in-from-right-full'
                )}
              >
                {/* Progress bar */}
                <div 
                  className={cn('h-1 transition-all duration-1000 ease-linear', colors.accent)}
                  style={{ width: `${Math.max(0, progress)}%` }}
                />
                
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getPopupIcon(alert)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">
                            {alert.sender_name || 'Mason Vector System'}
                          </h4>
                          
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {alert.preview_text || 'New notification'}
                          </p>
                          
                          <div className="text-xs text-slate-500 mt-2">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissPopup(alert.popupId);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors ml-2"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Show count if more notifications exist */}
          {alerts.filter(a => !a.is_read).length > popupAlerts.length && (
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                +{alerts.filter(a => !a.is_read).length - popupAlerts.length} more notifications
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// HOC for easy integration
export function withNotifications<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<NotificationProviderProps> = {}
) {
  return function WithNotificationsComponent(props: P) {
    return (
      <NotificationProvider {...options}>
        <Component {...props} />
      </NotificationProvider>
    );
  };
}

// Hook for manual popup creation (for system alerts)
export function useCreateNotificationPopup() {
  const { } = useNotifications();
  
  return async (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    actionUrl?: string
  ) => {
    // This would create a system alert that gets picked up by the popup system
    try {
      // Note: This would typically call a server function to create the alert
      console.log('Creating popup:', { title, message, type, actionUrl });
    } catch (error) {
      console.error('Error creating notification popup:', error);
    }
  };
}