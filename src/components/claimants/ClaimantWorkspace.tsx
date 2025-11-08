// Mason Vector - Claimant Workspace Component
// Main workspace that renders active claimant content

import React, { Suspense, lazy } from 'react';
import { useClaimantWorkspace, useClaimantWorkspaceShortcuts, useClaimantWorkspaceCleanup } from '../../lib/state/useClaimantWorkspace';
import { useTimesheetTracking } from '../../lib/hooks/useTimesheetTracking';

// Lazy load the claimant detail component for performance
const ClaimantDetailLazy = lazy(() => import('./ClaimantDetail'));

// Loading component
const LoadingClaimant = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading claimant details...</span>
  </div>
);

// Empty state component
const EmptyWorkspace = () => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <div className="text-lg font-medium mb-2">No claimant selected</div>
    <div className="text-sm">
      Click on a claimant from the list to begin reviewing their details.
    </div>
    <div className="text-xs mt-4 text-gray-400">
      💡 Tip: Use Ctrl+Tab to switch between open tabs
    </div>
  </div>
);

export function ClaimantWorkspace() {
  const { getActiveTab, updateTabState } = useClaimantWorkspace();
  const { logClientAccess } = useTimesheetTracking();
  
  // Enable keyboard shortcuts
  useClaimantWorkspaceShortcuts();
  
  // Auto-cleanup idle tabs (30 minutes)
  useClaimantWorkspaceCleanup(30);

  const activeTab = getActiveTab();

  // Log activity when switching to a tab
  React.useEffect(() => {
    if (activeTab) {
      logClientAccess(activeTab.claimantId, activeTab.name);
    }
  }, [activeTab?.id, logClientAccess]);

  // Save scroll position when tab becomes inactive
  const workspaceRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (activeTab && workspaceRef.current) {
        const scrollPosition = workspaceRef.current.scrollTop;
        updateTabState(activeTab.id, { scrollPosition });
      }
    };

    const element = workspaceRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [activeTab?.id, updateTabState]);

  // Restore scroll position when tab becomes active
  React.useEffect(() => {
    if (activeTab && activeTab.scrollPosition && workspaceRef.current) {
      workspaceRef.current.scrollTop = activeTab.scrollPosition;
    }
  }, [activeTab?.id]);

  if (!activeTab) {
    return <EmptyWorkspace />;
  }

  return (
    <div 
      ref={workspaceRef}
      className="flex-1 overflow-y-auto bg-white"
    >
      <div className="p-6">
        <Suspense fallback={<LoadingClaimant />}>
          <ClaimantDetailLazy 
            claimantId={activeTab.claimantId}
            tabId={activeTab.id}
            onStateChange={(state) => updateTabState(activeTab.id, { localState: state })}
            initialState={activeTab.localState}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default ClaimantWorkspace;