// Mason Vector - Claimants Page Layout with Workspace Integration
// Main claimants page that uses the workspace system

import React from 'react';
import ClaimantWorkspaceProvider from '../../components/claimants/ClaimantWorkspaceProvider';

export default function ClaimantsLayout({
  children
}: {
  children?: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Claimant Management</h1>
            <p className="text-gray-600">
              Manage claimant records with tabbed workspace for efficient review
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Add Claimant
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Export List
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 overflow-hidden">
        <ClaimantWorkspaceProvider>
          {children}
        </ClaimantWorkspaceProvider>
      </div>
    </div>
  );
}