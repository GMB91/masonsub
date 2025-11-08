// Mason Vector - Timesheet Activity Tracker
// Automatically logs client file access and session management for timesheet automation

import { supabase } from '../supabaseClient';

interface ActivityEvent {
  action: string;
  entity: string;
  details: Record<string, any>;
  timestamp?: string;
}

class TimesheetActivityTracker {
  private supabaseClient = supabase;
  private activeSession: boolean = false;
  private sessionStartTime: Date | null = null;
  private lastActivity: Date = new Date();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Initialize activity tracking for the current user session
   */
  public async initializeTracking(): Promise<void> {
    try {
      // Log session start
      await this.logActivity({
        action: 'SESSION_START',
        entity: 'user_session',
        details: { timestamp: new Date().toISOString() }
      });

      this.activeSession = true;
      this.sessionStartTime = new Date();
      this.setupInactivityMonitoring();
      this.setupBeforeUnloadHandler();
      
      console.log('✅ Timesheet activity tracking initialized');
    } catch (error) {
      console.error('❌ Failed to initialize timesheet tracking:', error);
    }
  }

  /**
   * Log client file access (triggers timesheet entry creation)
   */
  public async logClientFileAccess(clientId: string, clientName?: string): Promise<void> {
    try {
      await this.logActivity({
        action: 'ACCESS_CLIENT_FILE',
        entity: 'claimant',
        details: {
          client_id: clientId,
          client_name: clientName || 'Unknown Client',
          access_time: new Date().toISOString()
        }
      });

      this.updateLastActivity();
      console.log(`📋 Logged client file access: ${clientName || clientId}`);
    } catch (error) {
      console.error('❌ Failed to log client file access:', error);
    }
  }

  /**
   * Log claim file access
   */
  public async logClaimAccess(claimId: string, clientId: string): Promise<void> {
    try {
      await this.logActivity({
        action: 'ACCESS_CLAIM_FILE',
        entity: 'claim',
        details: {
          claim_id: claimId,
          client_id: clientId,
          access_time: new Date().toISOString()
        }
      });

      this.updateLastActivity();
      console.log(`📄 Logged claim access: ${claimId}`);
    } catch (error) {
      console.error('❌ Failed to log claim access:', error);
    }
  }

  /**
   * Log task activity
   */
  public async logTaskActivity(taskId: string, action: 'start' | 'complete' | 'update'): Promise<void> {
    try {
      await this.logActivity({
        action: `TASK_${action.toUpperCase()}`,
        entity: 'task',
        details: {
          task_id: taskId,
          task_action: action,
          timestamp: new Date().toISOString()
        }
      });

      this.updateLastActivity();
      console.log(`✅ Logged task ${action}: ${taskId}`);
    } catch (error) {
      console.error('❌ Failed to log task activity:', error);
    }
  }

  /**
   * Log document access
   */
  public async logDocumentAccess(documentId: string, documentType: string): Promise<void> {
    try {
      await this.logActivity({
        action: 'ACCESS_DOCUMENT',
        entity: 'document',
        details: {
          document_id: documentId,
          document_type: documentType,
          access_time: new Date().toISOString()
        }
      });

      this.updateLastActivity();
      console.log(`📎 Logged document access: ${documentType}`);
    } catch (error) {
      console.error('❌ Failed to log document access:', error);
    }
  }

  /**
   * Log user logout (triggers timesheet entry completion)
   */
  public async logUserLogout(): Promise<void> {
    try {
      await this.logActivity({
        action: 'LOGOUT',
        entity: 'user_session',
        details: {
          session_duration: this.getSessionDuration(),
          logout_time: new Date().toISOString()
        }
      });

      this.activeSession = false;
      this.clearInactivityTimer();
      console.log('👋 Logged user logout');
    } catch (error) {
      console.error('❌ Failed to log user logout:', error);
    }
  }

  /**
   * Log session timeout (triggers timesheet entry completion)
   */
  public async logSessionTimeout(): Promise<void> {
    try {
      await this.logActivity({
        action: 'SESSION_TIMEOUT',
        entity: 'user_session',
        details: {
          timeout_duration: this.INACTIVITY_TIMEOUT,
          last_activity: this.lastActivity.toISOString(),
          session_duration: this.getSessionDuration()
        }
      });

      this.activeSession = false;
      console.log('⏰ Logged session timeout');
    } catch (error) {
      console.error('❌ Failed to log session timeout:', error);
    }
  }

  /**
   * Core activity logging function
   */
  private async logActivity(event: ActivityEvent): Promise<void> {
    try {
      const { data: { user } } = await this.supabaseClient.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ No authenticated user for activity logging');
        return;
      }

      const { error } = await this.supabaseClient
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: event.action,
          entity: event.entity,
          details: event.details,
          created_at: event.timestamp || new Date().toISOString()
        });

      if (error) {
        console.error('Database error logging activity:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Update last activity timestamp and reset inactivity timer
   */
  private updateLastActivity(): void {
    this.lastActivity = new Date();
    this.resetInactivityTimer();
  }

  /**
   * Setup inactivity monitoring
   */
  private setupInactivityMonitoring(): void {
    // Monitor user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.updateLastActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    this.resetInactivityTimer();
  }

  /**
   * Reset inactivity timer
   */
  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    
    this.inactivityTimer = setTimeout(async () => {
      if (this.activeSession) {
        await this.logSessionTimeout();
      }
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Clear inactivity timer
   */
  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Setup beforeunload handler for proper logout logging
   */
  private setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', async () => {
      if (this.activeSession) {
        // Use navigator.sendBeacon for reliable logging on page unload
        await this.logUserLogout();
      }
    });

    // Handle visibility change (tab switch, minimize, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.activeSession) {
        // User switched away, start inactivity tracking
        this.resetInactivityTimer();
      } else if (!document.hidden) {
        // User returned, update activity
        this.updateLastActivity();
      }
    });
  }

  /**
   * Calculate current session duration in minutes
   */
  private getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    
    const durationMs = Date.now() - this.sessionStartTime.getTime();
    return Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }

  /**
   * Get current session status
   */
  public getSessionStatus(): { active: boolean; duration: number; lastActivity: Date } {
    return {
      active: this.activeSession,
      duration: this.getSessionDuration(),
      lastActivity: this.lastActivity
    };
  }

  /**
   * Manual session heartbeat (useful for long-running operations)
   */
  public heartbeat(): void {
    this.updateLastActivity();
  }
}

// Create singleton instance
const activityTracker = new TimesheetActivityTracker();

// Auto-initialize on module load (when user is authenticated)
if (typeof window !== 'undefined') {
  // Wait for authentication before initializing
  const checkAuthAndInit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await activityTracker.initializeTracking();
      }
    } catch (error) {
      console.error('Failed to initialize activity tracking:', error);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthAndInit);
  } else {
    checkAuthAndInit();
  }
}

export default activityTracker;

// Convenience exports for common tracking scenarios
export const trackClientAccess = (clientId: string, clientName?: string) => 
  activityTracker.logClientFileAccess(clientId, clientName);

export const trackClaimAccess = (claimId: string, clientId: string) => 
  activityTracker.logClaimAccess(claimId, clientId);

export const trackTaskActivity = (taskId: string, action: 'start' | 'complete' | 'update') => 
  activityTracker.logTaskActivity(taskId, action);

export const trackDocumentAccess = (documentId: string, documentType: string) => 
  activityTracker.logDocumentAccess(documentId, documentType);

export const trackLogout = () => activityTracker.logUserLogout();

export const getSessionStatus = () => activityTracker.getSessionStatus();