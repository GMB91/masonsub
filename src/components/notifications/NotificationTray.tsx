/**
 * NotificationTray Component
 * Sliding tray panel showing notification alerts
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { X, Check, CheckCheck, MessageCircle, AlertCircle, Info, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '../../lib/utils';
import { 
  useNotifications, 
  useNotificationAlerts, 
  useUnreadCount,
  type NotificationAlert 
} from '../../lib/hooks/useNotifications';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationTrayProps {
  onClose: () => void;
  className?: string;
  maxHeight?: number;
}

export function NotificationTray({ onClose, className, maxHeight = 400 }: NotificationTrayProps) {
  const { user } = useAuth();
  const alerts = useNotificationAlerts();
  const unreadCount = useUnreadCount();
  const { markRead, markAllRead, removeAlert } = useNotifications();
  const trayRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close tray
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAlertClick = async (alert: NotificationAlert) => {
    // Mark as read
    if (!alert.is_read) {
      await markRead(alert.id);
    }

    // Navigate to action URL if available
    if (alert.action_url) {
      window.location.href = alert.action_url;
    }

    // Close tray
    onClose();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    
    try {
      const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
      
      if (unreadIds.length > 0) {
        const { error } = await supabase
          .from('message_alerts')
          .update({ 
            is_read: true, 
            read_at: new Date().toISOString() 
          })
          .in('id', unreadIds);

        if (error) throw error;
        
        await markAllRead();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('message_alerts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Clear from store
      alerts.forEach(alert => removeAlert(alert.id));
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  };

  const getAlertIcon = (alert: NotificationAlert) => {
    switch (alert.action_type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  const getAlertPriority = (alert: NotificationAlert) => {
    if (alert.action_type === 'alert' || alert.action_type === 'warning') {
      return 'high';
    }
    if (alert.action_type === 'reminder') {
      return 'medium';
    }
    return 'normal';
  };

  // Group alerts by priority and date
  const groupedAlerts = alerts.reduce((groups: any, alert) => {
    const priority = getAlertPriority(alert);
    const date = format(new Date(alert.created_at), 'yyyy-MM-dd');
    
    if (!groups[priority]) groups[priority] = {};
    if (!groups[priority][date]) groups[priority][date] = [];
    
    groups[priority][date].push(alert);
    return groups;
  }, {});

  return (
    <div 
      ref={trayRef}
      className={cn(
        'absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border z-50 overflow-hidden transition-all duration-200 animate-in slide-in-from-top-2',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <>
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 inline mr-1" />
                Mark All Read
              </button>
              
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-500 hover:text-slate-700 hover:underline transition-colors ml-2"
              >
                Clear All
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm text-slate-500">No notifications</div>
            <div className="text-xs text-slate-400 mt-1">
              You're all caught up!
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {Object.entries(groupedAlerts).map(([priority, dateGroups]) => (
              <div key={priority}>
                {Object.entries(dateGroups as Record<string, any>).map(([date, dateAlerts]) => (
                  <div key={date}>
                    <div className="px-4 py-2 bg-slate-50 border-b">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        {format(new Date(date), 'EEEE, MMM d')}
                        {priority === 'high' && (
                          <span className="ml-2 text-red-600">• High Priority</span>
                        )}
                      </div>
                    </div>
                    
                    {(dateAlerts as NotificationAlert[]).map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className={cn(
                          'p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4',
                          {
                            'border-l-indigo-500 bg-indigo-50/30': !alert.is_read,
                            'border-l-slate-200': alert.is_read,
                            'border-l-red-400': priority === 'high',
                            'border-l-orange-400': priority === 'medium'
                          }
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getAlertIcon(alert)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className={cn(
                                  'text-sm font-medium truncate',
                                  alert.is_read ? 'text-slate-600' : 'text-slate-800'
                                )}>
                                  {alert.sender_name || 'Mason Vector System'}
                                </div>
                                
                                <div className={cn(
                                  'text-sm mt-1',
                                  alert.is_read ? 'text-slate-500' : 'text-slate-700'
                                )}>
                                  {alert.preview_text || 'New notification'}
                                </div>
                                
                                <div className="flex items-center mt-2 gap-2">
                                  <div className="text-xs text-slate-400">
                                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                  </div>
                                  
                                  {alert.action_url && (
                                    <ExternalLink className="h-3 w-3 text-slate-400" />
                                  )}
                                </div>
                              </div>
                              
                              {!alert.is_read && (
                                <div className="flex-shrink-0 ml-2">
                                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="p-3 border-t bg-slate-50 text-center">
          <button
            onClick={() => {
              window.location.href = '/messages';
              onClose();
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View All Messages
          </button>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
export function NotificationTrayCompact({ onClose }: { onClose: () => void }) {
  return (
    <NotificationTray 
      onClose={onClose}
      className="w-80 sm:w-96"
      maxHeight={300}
    />
  );
}