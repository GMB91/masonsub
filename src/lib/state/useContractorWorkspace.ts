// Mason Vector - Contractor Workspace State Management
// Contractor-specific workspace with restricted functionality and auto-save

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface ContractorTab {
  id: string;
  claimantId: string;
  title: string;
  isPinned: boolean;
  lastAccessed: number;
  unsavedChanges: boolean;
  isActive: boolean;
}

export interface ContractorWorkspaceState {
  // Tab Management
  tabs: ContractorTab[];
  activeTabId: string | null;
  maxTabs: number; // Contractor limit: 5 tabs
  
  // List State Preservation  
  listFilters: Record<string, any>;
  listScrollPosition: number;
  listSearchTerm: string;
  
  // Auto-save Management
  autoSaveInterval: number; // 10 seconds for contractors
  lastAutoSave: Record<string, number>;
  
  // Actions
  openTab: (claimantId: string, title: string, pinned?: boolean) => boolean;
  closeTab: (tabId: string) => void;
  switchToTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  markUnsaved: (tabId: string) => void;
  markSaved: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
  
  // List State Management
  setListFilters: (filters: Record<string, any>) => void;
  setListScrollPosition: (position: number) => void;
  setListSearchTerm: (term: string) => void;
  
  // Auto-save Management
  recordAutoSave: (tabId: string) => void;
  needsAutoSave: (tabId: string) => boolean;
  
  // Cleanup
  cleanupIdleTabs: () => void;
}

export const useContractorWorkspace = create<ContractorWorkspaceState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      tabs: [],
      activeTabId: null,
      maxTabs: 5, // Contractor limit
      listFilters: {},
      listScrollPosition: 0,
      listSearchTerm: '',
      autoSaveInterval: 10000, // 10 seconds
      lastAutoSave: {},
      
      // Tab Management Actions
      openTab: (claimantId: string, title: string, pinned = false) => {
        const state = get();
        
        // Check if tab already exists
        const existingTab = state.tabs.find(tab => tab.claimantId === claimantId);
        if (existingTab) {
          set(draft => {
            draft.activeTabId = existingTab.id;
            existingTab.lastAccessed = Date.now();
          });
          return true;
        }
        
        // Check tab limit
        if (state.tabs.length >= state.maxTabs) {
          // Find oldest unpinned tab to close
          const unpinnedTabs = state.tabs.filter(tab => !tab.isPinned);
          if (unpinnedTabs.length === 0) {
            // All tabs are pinned, cannot open new tab
            return false;
          }
          
          const oldestTab = unpinnedTabs.reduce((oldest, current) => 
            current.lastAccessed < oldest.lastAccessed ? current : oldest
          );
          
          set(draft => {
            draft.tabs = draft.tabs.filter(tab => tab.id !== oldestTab.id);
            delete draft.lastAutoSave[oldestTab.id];
          });
        }
        
        // Create new tab
        const newTab: ContractorTab = {
          id: `contractor-${claimantId}-${Date.now()}`,
          claimantId,
          title,
          isPinned: pinned,
          lastAccessed: Date.now(),
          unsavedChanges: false,
          isActive: true,
        };
        
        set(draft => {
          // Mark all other tabs as inactive
          draft.tabs.forEach(tab => { tab.isActive = false; });
          
          // Add new tab
          draft.tabs.push(newTab);
          draft.activeTabId = newTab.id;
        });
        
        return true;
      },
      
      closeTab: (tabId: string) => {
        set(draft => {
          const tabIndex = draft.tabs.findIndex(tab => tab.id === tabId);
          if (tabIndex === -1) return;
          
          const wasActive = draft.tabs[tabIndex].id === draft.activeTabId;
          
          // Remove tab
          draft.tabs.splice(tabIndex, 1);
          delete draft.lastAutoSave[tabId];
          
          // Handle active tab change
          if (wasActive && draft.tabs.length > 0) {
            const newActiveTab = draft.tabs[Math.max(0, tabIndex - 1)];
            draft.activeTabId = newActiveTab.id;
            newActiveTab.isActive = true;
            newActiveTab.lastAccessed = Date.now();
          } else if (draft.tabs.length === 0) {
            draft.activeTabId = null;
          }
        });
      },
      
      switchToTab: (tabId: string) => {
        set(draft => {
          const tab = draft.tabs.find(t => t.id === tabId);
          if (!tab) return;
          
          // Mark all tabs as inactive
          draft.tabs.forEach(t => { t.isActive = false; });
          
          // Activate selected tab
          tab.isActive = true;
          tab.lastAccessed = Date.now();
          draft.activeTabId = tabId;
        });
      },
      
      pinTab: (tabId: string) => {
        set(draft => {
          const tab = draft.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.isPinned = true;
          }
        });
      },
      
      unpinTab: (tabId: string) => {
        set(draft => {
          const tab = draft.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.isPinned = false;
          }
        });
      },
      
      markUnsaved: (tabId: string) => {
        set(draft => {
          const tab = draft.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.unsavedChanges = true;
          }
        });
      },
      
      markSaved: (tabId: string) => {
        set(draft => {
          const tab = draft.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.unsavedChanges = false;
          }
        });
      },
      
      closeAllTabs: () => {
        set(draft => {
          draft.tabs = [];
          draft.activeTabId = null;
          draft.lastAutoSave = {};
        });
      },
      
      closeOtherTabs: (keepTabId: string) => {
        set(draft => {
          const keepTab = draft.tabs.find(tab => tab.id === keepTabId);
          if (!keepTab) return;
          
          // Keep only pinned tabs and the specified tab
          const newTabs = draft.tabs.filter(tab => 
            tab.id === keepTabId || tab.isPinned
          );
          
          // Update lastAutoSave to only keep relevant entries
          const newLastAutoSave: Record<string, number> = {};
          newTabs.forEach(tab => {
            if (draft.lastAutoSave[tab.id]) {
              newLastAutoSave[tab.id] = draft.lastAutoSave[tab.id];
            }
          });
          
          draft.tabs = newTabs;
          draft.lastAutoSave = newLastAutoSave;
          draft.activeTabId = keepTabId;
          keepTab.isActive = true;
        });
      },
      
      // List State Management
      setListFilters: (filters: Record<string, any>) => {
        set(draft => {
          draft.listFilters = filters;
        });
      },
      
      setListScrollPosition: (position: number) => {
        set(draft => {
          draft.listScrollPosition = position;
        });
      },
      
      setListSearchTerm: (term: string) => {
        set(draft => {
          draft.listSearchTerm = term;
        });
      },
      
      // Auto-save Management
      recordAutoSave: (tabId: string) => {
        set(draft => {
          draft.lastAutoSave[tabId] = Date.now();
        });
      },
      
      needsAutoSave: (tabId: string) => {
        const state = get();
        const lastSave = state.lastAutoSave[tabId] || 0;
        return (Date.now() - lastSave) >= state.autoSaveInterval;
      },
      
      // Cleanup Functions
      cleanupIdleTabs: () => {
        const now = Date.now();
        const idleTimeout = 30 * 60 * 1000; // 30 minutes for contractors
        
        set(draft => {
          const activeTabsBefore = draft.tabs.length;
          
          // Keep pinned tabs and recently accessed tabs
          draft.tabs = draft.tabs.filter(tab => 
            tab.isPinned || (now - tab.lastAccessed) < idleTimeout
          );
          
          // Clean up auto-save records for removed tabs
          const tabIds = new Set(draft.tabs.map(tab => tab.id));
          Object.keys(draft.lastAutoSave).forEach(tabId => {
            if (!tabIds.has(tabId)) {
              delete draft.lastAutoSave[tabId];
            }
          });
          
          // Update active tab if it was removed
          if (draft.activeTabId && !tabIds.has(draft.activeTabId)) {
            if (draft.tabs.length > 0) {
              const newActiveTab = draft.tabs[0];
              draft.activeTabId = newActiveTab.id;
              newActiveTab.isActive = true;
              newActiveTab.lastAccessed = now;
            } else {
              draft.activeTabId = null;
            }
          }
        });
      },
    })),
    {
      name: 'contractor-workspace',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        listFilters: state.listFilters,
        listScrollPosition: state.listScrollPosition,
        listSearchTerm: state.listSearchTerm,
        lastAutoSave: state.lastAutoSave,
      }),
    }
  )
);

// Keyboard shortcuts for contractor workspace (limited)
export const useContractorKeyboardShortcuts = () => {
  const { switchToTab, closeTab, tabs, activeTabId } = useContractorWorkspace();
  
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Tab - Switch to next tab
      if (event.ctrlKey && event.key === 'Tab') {
        event.preventDefault();
        
        if (tabs.length <= 1) return;
        
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        const nextTab = tabs[nextIndex];
        
        if (nextTab) {
          switchToTab(nextTab.id);
        }
      }
      
      // Ctrl+W - Close active tab
      if (event.ctrlKey && event.key === 'w') {
        event.preventDefault();
        
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, switchToTab, closeTab]);
};