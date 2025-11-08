// Mason Vector - Contractor Tabs Bar
// Simplified tabs interface for contractor workspace with 5-tab limit

'use client';

import React, { useState } from 'react';
import { 
  useContractorWorkspace, 
  useContractorKeyboardShortcuts,
  ContractorTab
} from '@/lib/state/useContractorWorkspace';
import { 
  X, 
  MoreHorizontal,
  Pin,
  Clock,
  PinOff
} from 'lucide-react';

export function ContractorTabsBar() {
  const {
    tabs,
    activeTabId,
    maxTabs,
    switchToTab,
    closeTab,
    pinTab,
    unpinTab,
    closeAllTabs,
    closeOtherTabs
  } = useContractorWorkspace();
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Enable keyboard shortcuts
  useContractorKeyboardShortcuts();
  
  if (tabs.length === 0) {
    return null;
  }
  
  const handleTabClick = (tabId: string, event: React.MouseEvent) => {
    // Middle click to close tab
    if (event.button === 1) {
      event.preventDefault();
      closeTab(tabId);
      return;
    }
    
    // Regular click to switch
    if (event.button === 0) {
      switchToTab(tabId);
    }
  };
  
  const handlePinToggle = (tabId: string, isPinned: boolean, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isPinned) {
      unpinTab(tabId);
    } else {
      pinTab(tabId);
    }
  };
  
  const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    closeTab(tabId);
  };
  
  const formatLastAccessed = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };
  
  return (
    <div className="bg-white border-b border-gray-200 px-4">
      <div className="flex items-center justify-between">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide flex-1">
            {tabs.map((tab: ContractorTab) => (
              <div
                key={tab.id}
                className={`
                  relative flex items-center space-x-2 px-3 py-2 rounded-t-lg cursor-pointer
                  border-b-2 transition-colors min-w-0 max-w-48 group
                  ${tab.isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                  }
                `}
                onClick={(e) => handleTabClick(tab.id, e)}
                onMouseDown={(e) => {
                  // Prevent text selection on middle click
                  if (e.button === 1) {
                    e.preventDefault();
                  }
                }}
              >
                {/* Pin indicator */}
                {tab.isPinned && (
                  <Pin className="h-3 w-3 text-amber-500 flex-shrink-0 fill-current" />
                )}
                
                {/* Unsaved changes indicator */}
                {tab.unsavedChanges && (
                  <div className="h-2 w-2 bg-orange-400 rounded-full flex-shrink-0" 
                       title="Unsaved changes" />
                )}
                
                {/* Tab title */}
                <span className="text-sm font-medium truncate flex-1">
                  {tab.title}
                </span>
                
                {/* Last accessed time (show on hover) */}
                <div className="hidden group-hover:flex items-center space-x-1 flex-shrink-0">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatLastAccessed(tab.lastAccessed)}
                  </span>
                </div>
                
                {/* Pin/Unpin button */}
                <button
                  onClick={(e) => handlePinToggle(tab.id, tab.isPinned, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                  title={tab.isPinned ? 'Unpin tab' : 'Pin tab'}
                >
                  {tab.isPinned ? (
                    <PinOff className="h-3 w-3 text-amber-600" />
                  ) : (
                    <Pin className="h-3 w-3 text-gray-500" />
                  )}
                </button>
                
                {/* Close button */}
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                  title="Close tab (Ctrl+W)"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Tab limit indicator */}
          <div className="flex-shrink-0 ml-2">
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {tabs.length}/{maxTabs}
            </div>
          </div>
        </div>
        
        {/* Actions Dropdown */}
        <div className="relative ml-4 flex-shrink-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Tab actions"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                <div className="py-1">
                  {activeTabId && (
                    <button
                      onClick={() => {
                        closeOtherTabs(activeTabId);
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Close Other Tabs
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      closeAllTabs();
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Close All Tabs
                  </button>
                  
                  <div className="border-t border-gray-100 my-1" />
                  
                  <div className="px-4 py-2 text-xs text-gray-500">
                    <div>Shortcuts:</div>
                    <div className="mt-1 space-y-1">
                      <div>Ctrl+Tab: Switch tabs</div>
                      <div>Ctrl+W: Close tab</div>
                      <div>Middle-click: Close tab</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Tab limit warning */}
      {tabs.length >= maxTabs && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm text-amber-800">
              Maximum tabs reached ({maxTabs}). Close or unpin tabs to open new ones.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}