// Mason Vector - Message Alert UI Components
// Real-time persistent notification UI with role-based styling

'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Bell, 
  AlertTriangle, 
  Info, 
  Clock,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MessageAlert, useMessageAlerts, type NotificationPreferences } from '@/lib/hooks/useMessageAlerts';

// ================================
// MAIN ALERT POPUP COMPONENT
// ================================

interface MessageAlertPopupProps {
  alert: MessageAlert;
  onDismiss: () => void;
  onOpenMessage: (messageId: string) => void;
}

export function MessageAlertPopup({ alert, onDismiss, onOpenMessage }: MessageAlertPopupProps) {
  const [visible, setVisible] = useState(true);

  // Auto-show animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  };

  const handleOpenMessage = () => {
    onOpenMessage(alert.message_id);
    handleDismiss();
  };

  // Role-based styling
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-600 border-red-700';
      case 'system':
        return 'bg-blue-600 border-blue-700';
      case 'reminder':
        return 'bg-yellow-600 border-yellow-700';
      default:
        return 'bg-indigo-600 border-indigo-700';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5" />;
      case 'system':
        return <Info className="h-5 w-5" />;
      case 'reminder':
        return <Clock className="h-5 w-5" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!visible) return null;

  return (
    <div 
      className={`
        fixed bottom-4 right-4 text-white shadow-xl rounded-xl p-4 w-80 z-50 border-2
        transform transition-all duration-300 ease-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        ${getAlertStyle(alert.alert_type)}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon(alert.alert_type)}
          <span className="font-semibold text-sm">
            {alert.alert_type === 'urgent' ? 'Urgent Message' : 
             alert.alert_type === 'system' ? 'System Notification' :
             alert.alert_type === 'reminder' ? 'Reminder' :
             'New Message'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs opacity-75">
            {formatTime(alert.created_at)}
          </span>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <div className="font-medium mb-1">
          Message from Mason Vector
        </div>
        <div className="text-sm opacity-90 line-clamp-2">
          {typeof alert.message === 'string' ? alert.message : alert.message?.content || 'You have received a new message'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleOpenMessage}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
        >
          Open Message
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-white/70 hover:text-white transition-colors text-sm"
        >
          Later
        </button>
      </div>

      {/* Pulse animation for urgent alerts */}
      {alert.alert_type === 'urgent' && (
        <div className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping opacity-20"></div>
      )}
    </div>
  );
}

// ================================
// ALERT NOTIFICATION BELL
// ================================

interface AlertBellProps {
  onClick: () => void;
  className?: string;
}

export function AlertBell({ onClick, className = '' }: AlertBellProps) {
  const { unreadCount, alerts } = useMessageAlerts();
  const hasUrgent = alerts.some(alert => alert.alert_type === 'urgent' && !alert.is_read);

  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg transition-colors
        ${hasUrgent ? 'text-red-600 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-100'}
        ${className}
      `}
      aria-label={`${unreadCount} unread notifications`}
    >
      <Bell className={`h-5 w-5 ${hasUrgent ? 'animate-bounce' : ''}`} />
      
      {unreadCount > 0 && (
        <span 
          className={`
            absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center
            text-xs font-bold text-white rounded-full
            ${hasUrgent ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}
          `}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

// ================================
// NOTIFICATION CENTER PANEL
// ================================

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { alerts, unreadCount, markAlertRead, markAllAlertsRead, loading } = useMessageAlerts();

  const handleMarkAllRead = async () => {
    await markAllAlertsRead();
  };

  const handleAlertClick = async (alert: MessageAlert) => {
    await markAlertRead(alert.message_id);
    // Navigate to message - implement based on your routing
    window.location.hash = `#messages/${alert.message_id}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount} unread messages
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading notifications...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <div className="font-medium">No notifications</div>
              <div className="text-sm">You're all caught up!</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={`
                    p-4 cursor-pointer hover:bg-gray-50 transition-colors
                    ${!alert.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      p-2 rounded-full flex-shrink-0
                      ${alert.alert_type === 'urgent' ? 'bg-red-100 text-red-600' :
                        alert.alert_type === 'system' ? 'bg-blue-100 text-blue-600' :
                        alert.alert_type === 'reminder' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {getIcon(alert.alert_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          New Message
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(alert.created_at)}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {typeof alert.message === 'string' ? alert.message : alert.message?.content || 'You have received a message'}
                      </p>
                      
                      {!alert.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// NOTIFICATION PREFERENCES PANEL
// ================================

export function NotificationPreferences({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const { preferences, updatePreferences } = useMessageAlerts();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleSave = async () => {
    if (localPrefs) {
      await updatePreferences(localPrefs);
      onClose();
    }
  };

  if (!isOpen || !localPrefs) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-96">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Preferences
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Alert Types</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localPrefs.popup_alerts}
                  onChange={e => setLocalPrefs(prev => prev ? {...prev, popup_alerts: e.target.checked} : null)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Desktop popup alerts</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localPrefs.sound_alerts}
                  onChange={e => setLocalPrefs(prev => prev ? {...prev, sound_alerts: e.target.checked} : null)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Sound notifications</span>
                  {localPrefs.sound_alerts ? (
                    <Volume2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localPrefs.email_alerts}
                  onChange={e => setLocalPrefs(prev => prev ? {...prev, email_alerts: e.target.checked} : null)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
            </div>
          </div>

          {/* Digest Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email Digest Frequency
            </label>
            <select
              value={localPrefs.digest_frequency}
              onChange={e => setLocalPrefs(prev => prev ? {...prev, digest_frequency: e.target.value as any} : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quiet Hours</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="time"
                  value={localPrefs.quiet_hours_start}
                  onChange={e => setLocalPrefs(prev => prev ? {...prev, quiet_hours_start: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="time"
                  value={localPrefs.quiet_hours_end}
                  onChange={e => setLocalPrefs(prev => prev ? {...prev, quiet_hours_end: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              No sound or popup alerts during quiet hours
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// HELPER FUNCTIONS
// ================================

function getIcon(type: string) {
  switch (type) {
    case 'urgent':
      return <AlertTriangle className="h-4 w-4" />;
    case 'system':
      return <Info className="h-4 w-4" />;
    case 'reminder':
      return <Clock className="h-4 w-4" />;
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return time.toLocaleDateString();
}