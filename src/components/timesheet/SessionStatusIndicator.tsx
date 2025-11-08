// Mason Vector - Session Status Component
// Displays active timesheet session information

import React from 'react';
import { useTimesheetTracking } from '../../lib/hooks/useTimesheetTracking';

/**
 * Session info display component
 */
export function SessionStatusIndicator() {
  const { getSessionInfo } = useTimesheetTracking();
  const sessionInfo = getSessionInfo();

  if (!sessionInfo.active) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Active Session: {sessionInfo.duration}min</span>
    </div>
  );
}

export default SessionStatusIndicator;