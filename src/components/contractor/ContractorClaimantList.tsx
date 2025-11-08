// Mason Vector - Contractor Claimant List
// Assigned claimants list for contractors that opens tabs

'use client';

import React, { useState, useEffect } from 'react';
import { useContractorWorkspace } from '@/lib/state/useContractorWorkspace';
import { Search, Filter, Users, Phone, Mail, Clock } from 'lucide-react';

interface AssignedClaimant {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  status: 'qualified' | 'not_interested' | 'follow_up';
  last_contact: string | null;
  assigned_date: string;
  priority: 'high' | 'medium' | 'low';
}

// Mock assigned claimants data - replace with real API
const mockAssignedClaimants: AssignedClaimant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+61 400 123 456',
    state: 'NSW',
    status: 'follow_up',
    last_contact: '2024-11-05T14:30:00Z',
    assigned_date: '2024-11-01T09:00:00Z',
    priority: 'high'
  },
  {
    id: '2', 
    name: 'Ava Tan',
    email: 'ava.tan@example.com',
    phone: '+61 400 234 567',
    state: 'VIC',
    status: 'qualified',
    last_contact: null,
    assigned_date: '2024-11-02T10:15:00Z',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Ben Yeo',
    email: 'ben.yeo@example.com', 
    phone: '+61 400 345 678',
    state: 'QLD',
    status: 'not_interested',
    last_contact: '2024-11-04T16:45:00Z',
    assigned_date: '2024-11-03T11:30:00Z',
    priority: 'low'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+61 400 456 789',
    state: 'SA',
    status: 'follow_up',
    last_contact: null,
    assigned_date: '2024-11-04T14:20:00Z',
    priority: 'high'
  }
];

export function ContractorClaimantList() {
  const {
    openTab,
    listFilters,
    listScrollPosition,
    listSearchTerm,
    setListFilters,
    setListScrollPosition,
    setListSearchTerm,
    tabs,
    maxTabs
  } = useContractorWorkspace();
  
  // Local state
  const [claimants] = useState<AssignedClaimant[]>(mockAssignedClaimants);
  const [filteredClaimants, setFilteredClaimants] = useState<AssignedClaimant[]>(claimants);
  const [selectedFilters, setSelectedFilters] = useState({
    status: listFilters.status || 'all',
    state: listFilters.state || 'all',
    priority: listFilters.priority || 'all'
  });
  const [searchTerm, setSearchTerm] = useState(listSearchTerm);
  
  // Filter and search claimants
  useEffect(() => {
    let filtered = claimants;
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(claimant =>
        claimant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claimant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claimant.phone.includes(searchTerm)
      );
    }
    
    // Apply filters
    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(claimant => claimant.status === selectedFilters.status);
    }
    
    if (selectedFilters.state !== 'all') {
      filtered = filtered.filter(claimant => claimant.state === selectedFilters.state);
    }
    
    if (selectedFilters.priority !== 'all') {
      filtered = filtered.filter(claimant => claimant.priority === selectedFilters.priority);
    }
    
    setFilteredClaimants(filtered);
  }, [claimants, searchTerm, selectedFilters]);
  
  // Save filters and search to workspace state
  useEffect(() => {
    setListFilters(selectedFilters);
  }, [selectedFilters, setListFilters]);
  
  useEffect(() => {
    setListSearchTerm(searchTerm);
  }, [searchTerm, setListSearchTerm]);
  
  // Handle claimant selection
  const handleClaimantClick = (claimant: AssignedClaimant, event: React.MouseEvent) => {
    // Check if we can open more tabs
    if (tabs.length >= maxTabs) {
      // Try to open anyway - the workspace will handle closing oldest unpinned tab
      const success = openTab(claimant.id, claimant.name);
      if (!success) {
        alert(`Maximum tabs (${maxTabs}) reached. Close or unpin tabs to open new ones.`);
        return;
      }
    } else {
      openTab(claimant.id, claimant.name);
    }
  };
  
  // Handle scroll position persistence
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setListScrollPosition(event.currentTarget.scrollTop);
  };
  
  // Restore scroll position
  useEffect(() => {
    const listElement = document.getElementById('contractor-claimant-list');
    if (listElement && listScrollPosition > 0) {
      listElement.scrollTop = listScrollPosition;
    }
  }, [listScrollPosition]);
  
  const getStatusColor = (status: AssignedClaimant['status']) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: AssignedClaimant['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatLastContact = (timestamp: string | null) => {
    if (!timestamp) return 'No contact';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  const uniqueStates = [...new Set(claimants.map(c => c.state))];
  const statusOptions = [
    { value: 'qualified', label: '✅ Qualified' },
    { value: 'not_interested', label: '❌ Not Interested' },
    { value: 'follow_up', label: '📞 Follow Up' }
  ];
  
  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Assigned Claimants</h2>
          </div>
          <div className="text-sm text-gray-500">
            {filteredClaimants.length} of {claimants.length}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search claimants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Filters */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {/* Status Filter */}
            <div>
              <select
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* State Filter */}
            <div>
              <select
                value={selectedFilters.state}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, state: e.target.value }))}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            {/* Priority Filter */}
            <div>
              <select
                value={selectedFilters.priority}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          {/* Active tab indicator */}
          {tabs.length > 0 && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              {tabs.length}/{maxTabs} tabs open
            </div>
          )}
        </div>
      </div>
      
      {/* Claimants List */}
      <div 
        id="contractor-claimant-list"
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {filteredClaimants.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <div>No claimants found</div>
            {searchTerm || selectedFilters.status !== 'all' || selectedFilters.state !== 'all' ? (
              <div className="text-sm mt-1">Try adjusting your search or filters</div>
            ) : (
              <div className="text-sm mt-1">No claimants assigned yet</div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClaimants.map((claimant) => {
              const isOpen = tabs.some(tab => tab.claimantId === claimant.id);
              
              return (
                <div
                  key={claimant.id}
                  onClick={(e) => handleClaimantClick(claimant, e)}
                  className={`
                    p-4 cursor-pointer hover:bg-gray-50 transition-colors
                    ${isOpen ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {claimant.name}
                        </h3>
                        {isOpen && (
                          <div className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                            Open
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{claimant.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{claimant.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claimant.status)}`}>
                          {claimant.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(claimant.priority)}`}>
                          {claimant.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {claimant.state}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Last contact: {formatLastContact(claimant.last_contact)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractorClaimantList;