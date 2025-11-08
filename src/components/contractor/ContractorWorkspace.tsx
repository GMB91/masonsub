// Mason Vector - Contractor Workspace
// Main workspace renderer for contractor claimant tabs

'use client';

import React, { lazy, Suspense } from 'react';
import { useContractorWorkspace } from '@/lib/state/useContractorWorkspace';

// Lazy load the contractor claimant detail component
const ContractorClaimantDetail = lazy(() => import('./ContractorClaimantDetail'));

export function ContractorWorkspace() {
  const { tabs, activeTabId } = useContractorWorkspace();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-lg font-medium text-gray-900 mb-2">
            No Claimant Selected
          </div>
          <div className="text-gray-600 mb-6">
            Select a claimant from your assigned list to start working
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-2">💡 Contractor Tips:</div>
              <ul className="text-left space-y-1">
                <li>• Keep multiple tabs open to compare claimants</li>
                <li>• Use Ctrl+Tab to quickly switch between tabs</li>
                <li>• Notes auto-save every 10 seconds</li>
                <li>• Pin important tabs to prevent closure</li>
                <li>• Maximum 5 tabs to maintain focus</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-hidden">
      {/* Render active tab content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading {activeTab.title}...</div>
            </div>
          </div>
        }
      >
        <ContractorClaimantDetail 
          key={activeTab.claimantId}
          claimantId={activeTab.claimantId}
          tabId={activeTab.id}
        />
      </Suspense>
    </div>
  );
}

export default ContractorWorkspace;