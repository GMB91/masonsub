// Mason Vector - Contractor Workspace Provider
// Context provider for contractor workspace layout

'use client';

import React, { useState } from 'react';
import { ContractorTabsBar } from './ContractorTabsBar';
import { ContractorWorkspace } from './ContractorWorkspace';
import { ContractorClaimantList } from './ContractorClaimantList';
import { useContractorWorkspace } from '@/lib/state/useContractorWorkspace';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContractorWorkspaceProviderProps {
  children?: React.ReactNode;
}

export function ContractorWorkspaceProvider({ children }: ContractorWorkspaceProviderProps) {
  const { tabs } = useContractorWorkspace();
  const [showList, setShowList] = useState(true);
  
  const hasOpenTabs = tabs.length > 0;
  
  return (
    <div className="flex h-full bg-gray-100">
      {/* Claimant List Panel */}
      <div className={`
        transition-all duration-300 ease-in-out border-r border-gray-200 bg-white
        ${showList ? 'w-80' : 'w-0'}
        ${!showList && 'overflow-hidden'}
      `}>
        <ContractorClaimantList />
      </div>
      
      {/* Toggle List Button */}
      <div className="flex flex-col justify-start bg-gray-200">
        <button
          onClick={() => setShowList(!showList)}
          className="p-2 hover:bg-gray-300 transition-colors"
          title={showList ? 'Hide claimant list' : 'Show claimant list'}
        >
          {showList ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs Bar - only show when there are open tabs */}
        {hasOpenTabs && <ContractorTabsBar />}
        
        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden">
          {hasOpenTabs ? (
            <ContractorWorkspace />
          ) : (
            // Show welcome screen when no tabs are open
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-lg px-6">
                <div className="text-2xl font-semibold text-gray-900 mb-3">
                  Welcome to Contractor Portal
                </div>
                <div className="text-gray-600 mb-8 text-lg">
                  Select a claimant from your assigned list to start working
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-blue-600 font-semibold mb-3">
                      📋 Your Tasks
                    </div>
                    <ul className="text-left text-gray-600 space-y-2">
                      <li>• Contact assigned claimants</li>
                      <li>• Update status and notes</li>
                      <li>• Send intro SMS/email</li>
                      <li>• Follow up on responses</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-green-600 font-semibold mb-3">
                      ⚡ Workflow Tips
                    </div>
                    <ul className="text-left text-gray-600 space-y-2">
                      <li>• Open multiple claimants in tabs</li>
                      <li>• Notes save automatically</li>
                      <li>• Pin important tabs</li>
                      <li>• Use keyboard shortcuts</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="text-amber-800 text-sm">
                    <div className="font-semibold mb-2">💡 Contractor Limits:</div>
                    <div>• Maximum 5 tabs open at once</div>
                    <div>• Only assigned claimants visible</div>
                    <div>• Auto-save every 10 seconds</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Render any additional children */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default ContractorWorkspaceProvider;