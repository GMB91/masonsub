// Mason Vector - Claimant Workspace State Management
// Zustand store for managing tabbed claimant workspace

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';

export interface ClaimantTab {
  id: string;
  claimantId: string;
  name: string;
  status?: string;
  isPinned?: boolean;
  lastAccessed: number;
  scrollPosition?: number;
  localState?: Record<string, any>;
}

interface ClaimantWorkspaceState {
  // Tab Management
  tabs: ClaimantTab[];
  activeTabId: string | null;
  
  // List State Preservation
  listFilters: Record<string, any>;
  listScrollPosition: number;
  listPage: number;
  
  // Actions
  openTab: (claimantId: string, name: string, status?: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabState: (tabId: string, state: Partial<ClaimantTab>) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
  
  // List Management  
  setListFilters: (filters: Record<string, any>) => void;
  setListScrollPosition: (position: number) => void;
  setListPage: (page: number) => void;
  
  // Utilities
  getActiveTab: () => ClaimantTab | null;
  getTabByClaimantId: (claimantId: string) => ClaimantTab | null;
  cleanupIdleTabs: (maxIdleMinutes: number) => void;
}

export const useClaimantWorkspace = create<ClaimantWorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      listFilters: {},
      listScrollPosition: 0,
      listPage: 1,

      // Tab Actions
      openTab: (claimantId: string, name: string, status?: string) => {
        const existingTab = get().getTabByClaimantId(claimantId);
        
        if (existingTab) {
          // Switch to existing tab
          set({ activeTabId: existingTab.id });
          get().updateTabState(existingTab.id, { lastAccessed: Date.now() });
        } else {
          // Create new tab
          const newTab: ClaimantTab = {
            id: `tab-${claimantId}-${Date.now()}`,
            claimantId,
            name,
            status,
            isPinned: false,
            lastAccessed: Date.now(),
            localState: {}
          };
          
          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id
          }));
        }
      },

      closeTab: (tabId: string) => {
        set(state => {
          const remainingTabs = state.tabs.filter(t => t.id !== tabId);
          let newActiveId = state.activeTabId;
          
          // If closing active tab, switch to next available
          if (state.activeTabId === tabId) {
            if (remainingTabs.length > 0) {
              // Switch to most recently accessed tab
              const sortedTabs = remainingTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
              newActiveId = sortedTabs[0].id;
            } else {
              newActiveId = null;
            }
          }
          
          return {
            tabs: remainingTabs,
            activeTabId: newActiveId
          };
        });
      },

      setActiveTab: (tabId: string) => {
        const tab = get().tabs.find(t => t.id === tabId);
        if (tab) {
          set({ activeTabId: tabId });
          get().updateTabState(tabId, { lastAccessed: Date.now() });
        }
      },

      updateTabState: (tabId: string, updates: Partial<ClaimantTab>) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId ? { ...tab, ...updates } : tab
          )
        }));
      },

      pinTab: (tabId: string) => {
        get().updateTabState(tabId, { isPinned: true });
      },

      unpinTab: (tabId: string) => {
        get().updateTabState(tabId, { isPinned: false });
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },

      closeOtherTabs: (keepTabId: string) => {
        set(state => {
          const tabToKeep = state.tabs.find(t => t.id === keepTabId);
          return {
            tabs: tabToKeep ? [tabToKeep] : [],
            activeTabId: tabToKeep ? keepTabId : null
          };
        });
      },

      // List Management
      setListFilters: (filters: Record<string, any>) => {
        set({ listFilters: filters });
      },

      setListScrollPosition: (position: number) => {
        set({ listScrollPosition: position });
      },

      setListPage: (page: number) => {
        set({ listPage: page });
      },

      // Utilities
      getActiveTab: () => {
        const state = get();
        return state.tabs.find(t => t.id === state.activeTabId) || null;
      },

      getTabByClaimantId: (claimantId: string) => {
        return get().tabs.find(t => t.claimantId === claimantId) || null;
      },

      cleanupIdleTabs: (maxIdleMinutes: number = 30) => {
        const cutoff = Date.now() - (maxIdleMinutes * 60 * 1000);
        
        set(state => {
          const activeTabs = state.tabs.filter(tab => 
            tab.isPinned || tab.lastAccessed > cutoff || tab.id === state.activeTabId
          );
          
          return {
            tabs: activeTabs,
            activeTabId: activeTabs.find(t => t.id === state.activeTabId) ? state.activeTabId : null
          };
        });
      }
    }),
    {
      name: 'claimant-workspace',
      partialize: (state) => ({
        // Only persist essential state, not React components
        tabs: state.tabs.map(tab => ({
          id: tab.id,
          claimantId: tab.claimantId,
          name: tab.name,
          status: tab.status,
          isPinned: tab.isPinned,
          lastAccessed: tab.lastAccessed,
          scrollPosition: tab.scrollPosition,
          localState: tab.localState
        })),
        listFilters: state.listFilters,
        listPage: state.listPage
      })
    }
  )
);

// Hook for keyboard shortcuts
export const useClaimantWorkspaceShortcuts = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useClaimantWorkspace();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + W: Close active tab
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        event.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }
      
      // Ctrl/Cmd + Tab: Next tab
      if ((event.ctrlKey || event.metaKey) && event.key === 'Tab') {
        event.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTab(tabs[nextIndex].id);
        }
      }
      
      // Ctrl/Cmd + Shift + Tab: Previous tab
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Tab') {
        event.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        if (currentIndex !== -1) {
          const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          setActiveTab(tabs[prevIndex].id);
        }
      }
      
      // Ctrl/Cmd + 1-9: Switch to tab by number
      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const tabIndex = parseInt(event.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, setActiveTab, closeTab]);
};

// Auto-cleanup hook for idle tabs
export const useClaimantWorkspaceCleanup = (maxIdleMinutes: number = 30) => {
  const { cleanupIdleTabs } = useClaimantWorkspace();

  React.useEffect(() => {
    const interval = setInterval(() => {
      cleanupIdleTabs(maxIdleMinutes);
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [cleanupIdleTabs, maxIdleMinutes]);
};