// Mason Vector - Timesheet Tracking Hook
// React hook for seamless timesheet activity integration

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import activityTracker, { 
  trackClientAccess, 
  trackClaimAccess, 
  trackTaskActivity, 
  trackDocumentAccess,
  getSessionStatus 
} from '../timesheet/activityTracker';

export interface TimesheetHookReturn {
  // Activity tracking functions
  logClientAccess: (clientId: string, clientName?: string) => void;
  logClaimAccess: (claimId: string, clientId: string) => void;
  logTaskActivity: (taskId: string, action: 'start' | 'complete' | 'update') => void;
  logDocumentAccess: (documentId: string, documentType: string) => void;
  
  // Session management
  getSessionInfo: () => { active: boolean; duration: number; lastActivity: Date };
  heartbeat: () => void;
}

/**
 * Hook for integrating timesheet activity tracking into React components
 * Automatically handles session initialization and cleanup
 */
export function useTimesheetTracking(): TimesheetHookReturn {
  const router = useRouter();

  // Initialize tracking when component mounts
  useEffect(() => {
    // Activity tracker auto-initializes on module load
    // This effect ensures it's ready for use
    return () => {
      // Cleanup on unmount - activity tracker handles this internally
    };
  }, []);

  // Track route changes for navigation logging
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Log navigation events for activity tracking
      activityTracker.heartbeat();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Wrapper functions with error handling
  const logClientAccess = useCallback(async (clientId: string, clientName?: string) => {
    try {
      await trackClientAccess(clientId, clientName);
    } catch (error) {
      console.error('Failed to log client access:', error);
    }
  }, []);

  const logClaimAccess = useCallback(async (claimId: string, clientId: string) => {
    try {
      await trackClaimAccess(claimId, clientId);
    } catch (error) {
      console.error('Failed to log claim access:', error);
    }
  }, []);

  const logTaskActivity = useCallback(async (taskId: string, action: 'start' | 'complete' | 'update') => {
    try {
      await trackTaskActivity(taskId, action);
    } catch (error) {
      console.error('Failed to log task activity:', error);
    }
  }, []);

  const logDocumentAccess = useCallback(async (documentId: string, documentType: string) => {
    try {
      await trackDocumentAccess(documentId, documentType);
    } catch (error) {
      console.error('Failed to log document access:', error);
    }
  }, []);

  const getSessionInfo = useCallback(() => {
    return getSessionStatus();
  }, []);

  const heartbeat = useCallback(() => {
    activityTracker.heartbeat();
  }, []);

  return {
    logClientAccess,
    logClaimAccess,
    logTaskActivity,
    logDocumentAccess,
    getSessionInfo,
    heartbeat
  };
}

/**
 * Hook specifically for client/claimant pages that automatically logs access
 */
export function useClientPageTracking(clientId?: string, clientName?: string) {
  const { logClientAccess, ...rest } = useTimesheetTracking();

  useEffect(() => {
    if (clientId) {
      logClientAccess(clientId, clientName);
    }
  }, [clientId, clientName, logClientAccess]);

  return {
    logClientAccess,
    ...rest
  };
}

/**
 * Hook for claim pages that automatically logs claim access
 */
export function useClaimPageTracking(claimId?: string, clientId?: string) {
  const { logClaimAccess, ...rest } = useTimesheetTracking();

  useEffect(() => {
    if (claimId && clientId) {
      logClaimAccess(claimId, clientId);
    }
  }, [claimId, clientId, logClaimAccess]);

  return {
    logClaimAccess,
    ...rest
  };
}

// Note: SessionStatusIndicator component moved to separate .tsx file for JSX support