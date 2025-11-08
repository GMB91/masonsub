// Mason Vector - Claimant Workspace Provider
// Context provider for workspace state management

import React from 'react';
import { ClaimantTabsBar, ClaimantTabBreadcrumb } from './ClaimantTabsBar';
import ClaimantWorkspace from './ClaimantWorkspace';
import WorkspaceClaimantList from './WorkspaceClaimantList';
import { useClaimantWorkspace } from '../../lib/state/useClaimantWorkspace';

interface ClaimantWorkspaceProviderProps {
  children?: React.ReactNode;
}

export function ClaimantWorkspaceProvider({ children }: ClaimantWorkspaceProviderProps) {
  const { tabs } = useClaimantWorkspace();
  const hasOpenTabs = tabs.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Bar - only show if tabs are open */}
      {hasOpenTabs && <ClaimantTabsBar />}
      
      {/* Breadcrumb - only show if tabs are open */}
      {hasOpenTabs && <ClaimantTabBreadcrumb />}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Claimant List */}
        <div className={`${hasOpenTabs ? 'w-96 border-r border-gray-200' : 'flex-1'} flex flex-col`}>
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Claimants {hasOpenTabs && '(List)'}
            </h2>
            <div className="text-sm text-gray-600">
              {hasOpenTabs 
                ? 'Click claimants to open in workspace tabs' 
                : 'Select a claimant to begin reviewing'
              }
            </div>
          </div>
          <WorkspaceClaimantList className="flex-1" />
        </div>
        
        {/* Main Workspace - only show if tabs are open */}
        {hasOpenTabs && (
          <div className="flex-1 flex flex-col">
            <ClaimantWorkspace />
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}

export default ClaimantWorkspaceProvider;