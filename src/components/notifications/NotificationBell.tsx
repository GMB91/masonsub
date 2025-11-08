/**
 * NotificationBell Component
 * Header bell icon with badge counter and tray toggle
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotifications, useUnreadCount, useIsTrayOpen } from '../../lib/hooks/useNotifications';
import { NotificationTray } from './NotificationTray';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function NotificationBell({ 
  className,
  variant = 'ghost',
  size = 'md' 
}: NotificationBellProps) {
  const { user } = useAuth();
  const unreadCount = useUnreadCount();
  const isTrayOpen = useIsTrayOpen();
  const { setTrayOpen } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Track tray viewing for audit when opened
  const handleToggleTray = async () => {
    const newOpenState = !isTrayOpen;
    setTrayOpen(newOpenState);
    
    // Track tray viewing for audit
    if (newOpenState && user) {
      try {
        await supabase.rpc('mark_alerts_viewed', { p_user_id: user.id });
      } catch (error) {
        console.error('Error tracking tray view:', error);
      }
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const badgeSizeClasses = {
    sm: 'text-xs px-1',
    md: 'text-xs px-1.5',
    lg: 'text-sm px-2'
  };

  const variantClasses = {
    default: 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border',
    ghost: 'hover:bg-slate-100 text-slate-700',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700'
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleTray}
        className={cn(
          'relative rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          buttonSizeClasses[size],
          variantClasses[variant],
          {
            'ring-2 ring-indigo-500 ring-offset-2': isTrayOpen,
            'animate-pulse': isAnimating
          },
          className
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isTrayOpen}
      >
        {unreadCount > 0 ? (
          <BellRing 
            className={cn(
              sizeClasses[size],
              'text-indigo-600 transition-transform',
              {
                'animate-bounce': isAnimating
              }
            )} 
          />
        ) : (
          <Bell className={cn(sizeClasses[size], 'transition-transform')} />
        )}
        
        {unreadCount > 0 && (
          <span 
            className={cn(
              'absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full font-medium min-w-[1.25rem] h-5 flex items-center justify-center transition-all duration-200',
              badgeSizeClasses[size],
              {
                'animate-ping': isAnimating && unreadCount === 1,
                'scale-110': isAnimating
              }
            )}
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isTrayOpen && (
        <NotificationTray 
          onClose={() => setTrayOpen(false)}
        />
      )}
    </div>
  );
}

// Variant for use in different contexts
export function NotificationBellCompact({ className }: { className?: string }) {
  return (
    <NotificationBell 
      variant="ghost" 
      size="sm" 
      className={className} 
    />
  );
}

// Enhanced variant with tooltip
export function NotificationBellWithTooltip({ 
  className,
  tooltip = "Notifications" 
}: { 
  className?: string;
  tooltip?: string;
}) {
  const unreadCount = useUnreadCount();
  
  return (
    <div className="relative group">
      <NotificationBell className={className} />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {unreadCount > 0 ? `${unreadCount} unread ${tooltip.toLowerCase()}` : tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}