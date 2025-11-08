// Mason Vector - Claimant Tabs Bar Component
// Browser-like tabs interface for claimant workspace

import React from 'react';
import { X, Pin, PinOff, MoreHorizontal } from 'lucide-react';
import { useClaimantWorkspace, ClaimantTab } from '../../lib/state/useClaimantWorkspace';

// Simple UI components (replace with your UI library)
const Button = ({ children, variant, size, className, ...props }: any) => (
  <button className={`btn ${variant} ${size} ${className}`} {...props}>{children}</button>
);

const DropdownMenu = ({ children }: any) => <div className="relative">{children}</div>;
const DropdownMenuTrigger = ({ children, asChild, ...props }: any) => <div {...props}>{children}</div>;
const DropdownMenuContent = ({ children, align, className }: any) => (
  <div className={`absolute bg-white border shadow-lg ${className}`}>{children}</div>
);
const DropdownMenuItem = ({ children, onClick, className }: any) => (
  <div className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${className}`} onClick={onClick}>{children}</div>
);
const DropdownMenuSeparator = () => <hr className="my-1" />;

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export function ClaimantTabsBar() {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    pinTab,
    unpinTab,
    closeAllTabs,
    closeOtherTabs
  } = useClaimantWorkspace();

  // Handle middle-click to close tab
  const handleMouseDown = (event: React.MouseEvent, tabId: string) => {
    if (event.button === 1) { // Middle mouse button
      event.preventDefault();
      closeTab(tabId);
    }
  };

  // Handle drag and drop for tab reordering (future enhancement)
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    closeTab(tabId);
  };

  const handlePinToggle = (event: React.MouseEvent, tab: any) => {
    event.stopPropagation();
    if (tab.isPinned) {
      unpinTab(tab.id);
    } else {
      pinTab(tab.id);
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center border-b border-gray-200 bg-white overflow-x-auto">
      {/* Tab Headers */}
      <div className="flex flex-1 min-w-0">
        {tabs.map((tab: ClaimantTab, index: number) => (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center px-3 py-2 border-r border-gray-200 cursor-pointer min-w-0 max-w-xs",
              "hover:bg-gray-50 transition-colors duration-150",
              activeTabId === tab.id 
                ? "bg-blue-50 border-b-2 border-b-blue-500" 
                : "bg-white",
              tab.isPinned ? "border-l-2 border-l-orange-400" : ""
            )}
            onClick={() => handleTabClick(tab.id)}
            onMouseDown={(e) => handleMouseDown(e, tab.id)}
            title={`${tab.name}${tab.status ? ` (${tab.status})` : ''}`}
          >
            {/* Pin indicator */}
            {tab.isPinned && (
              <Pin className="h-3 w-3 text-orange-500 mr-2 flex-shrink-0" />
            )}
            
            {/* Tab content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {tab.name}
              </div>
              {tab.status && (
                <div className="text-xs text-gray-500 truncate">
                  {tab.status}
                </div>
              )}
            </div>

            {/* Tab number badge */}
            <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
              {index + 1}
            </div>
            
            {/* Close button */}
            <button
              className="ml-2 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => handleCloseTab(e, tab.id)}
              title="Close tab (Ctrl+W)"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Tab Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2 flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {activeTabId && (
            <>
              <DropdownMenuItem onClick={() => {
                const activeTab = tabs.find((t: ClaimantTab) => t.id === activeTabId);
                if (activeTab) {
                  if (activeTab.isPinned) {
                    unpinTab(activeTabId);
                  } else {
                    pinTab(activeTabId);
                  }
                }
              }}>
                {tabs.find((t: ClaimantTab) => t.id === activeTabId)?.isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin Tab
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin Tab
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => closeOtherTabs(activeTabId)}>
                Close Other Tabs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem 
            onClick={closeAllTabs}
            className="text-red-600 focus:text-red-600"
          >
            Close All Tabs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Tab navigation breadcrumb
export function ClaimantTabBreadcrumb() {
  const { getActiveTab } = useClaimantWorkspace();
  const activeTab = getActiveTab();

  if (!activeTab) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 px-4 py-2 bg-gray-50 border-b">
      <span>Claimants</span>
      <span>/</span>
      <span className="font-medium">{activeTab.name}</span>
      {activeTab.status && (
        <>
          <span>/</span>
          <span className="text-blue-600">{activeTab.status}</span>
        </>
      )}
    </div>
  );
}

export default ClaimantTabsBar;