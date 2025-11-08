// Mason Vector - Claimants Main Page
// Entry point for claimant workspace system - now managed by layout provider

import React from 'react';

export default function ClaimantsPage() {
  return (
    <>
      {/* Welcome message when no tabs are open */}
      <div className="flex items-center justify-center h-full bg-gray-50 min-h-[400px]">
        <div className="text-center max-w-4xl px-6">
          <div className="text-2xl font-semibold text-gray-900 mb-3">
            Welcome to Claimant Management Workspace
          </div>
          <div className="text-gray-600 mb-8 text-lg">
            Select a claimant from the list to start reviewing their details in the tabbed workspace
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-blue-600 font-semibold mb-3 text-lg">
                🗂️ Tabbed Workspace
              </div>
              <div className="text-gray-600">
                Open multiple claimants in tabs like a web browser. Switch between claimants without losing your place.
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-green-600 font-semibold mb-3 text-lg">
                💾 Preserved Context
              </div>
              <div className="text-gray-600">
                Filters, search terms, and scroll positions are automatically saved across sessions.
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-purple-600 font-semibold mb-3 text-lg">
                ⚡ Efficient Workflow
              </div>
              <div className="text-gray-600">
                Pin important tabs, use keyboard shortcuts, and manage multiple cases simultaneously.
              </div>
            </div>
          </div>
          
          {/* Getting started */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="text-blue-900 font-semibold mb-3">Getting Started</div>
            <div className="text-blue-800 mb-3">
              1. Use the search and filters in the claimant list to find records
            </div>
            <div className="text-blue-800 mb-3">
              2. Click on any claimant name to open their details in a new tab
            </div>
            <div className="text-blue-800">
              3. Continue opening tabs to compare multiple claimants or work on several cases
            </div>
          </div>
          
          {/* Keyboard shortcuts reference */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="font-semibold text-gray-900 mb-3">Keyboard Shortcuts</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+Tab</span>
                <div className="text-gray-600 mt-1">Switch tabs</div>
              </div>
              <div>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+W</span>
                <div className="text-gray-600 mt-1">Close tab</div>
              </div>
              <div>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">Middle-click</span>
                <div className="text-gray-600 mt-1">Open in new tab</div>
              </div>
              <div>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+Click</span>
                <div className="text-gray-600 mt-1">Pin/unpin tab</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
