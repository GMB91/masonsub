// Mason Vector - Workspace Claimant List Component
// Enhanced claimant list with workspace tab integration

import React, { useState, useEffect, useRef } from 'react';
import { useClaimantWorkspace } from '../../lib/state/useClaimantWorkspace';
import { supabase } from '../../lib/supabaseClient';

interface Claimant {
  id: string;
  name: string;
  address: string;
  amount: number;
  state: string;
  status: string;
  date_collected: string;
}

interface WorkspaceClaimantListProps {
  className?: string;
}

export function WorkspaceClaimantList({ className = '' }: WorkspaceClaimantListProps) {
  const { 
    openTab, 
    listFilters, 
    listScrollPosition, 
    listPage,
    setListFilters, 
    setListScrollPosition, 
    setListPage 
  } = useClaimantWorkspace();

  const [claimants, setClaimants] = useState<Claimant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const listRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 25;

  // Load claimants with filters
  useEffect(() => {
    const loadClaimants = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('claimants')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((listPage - 1) * itemsPerPage, listPage * itemsPerPage - 1);

        // Apply filters
        if (listFilters.status) {
          query = query.eq('status', listFilters.status);
        }
        if (listFilters.state) {
          query = query.eq('state', listFilters.state);
        }
        if (listFilters.search) {
          query = query.ilike('name', `%${listFilters.search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        
        setClaimants(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load claimants');
      } finally {
        setLoading(false);
      }
    };

    loadClaimants();
  }, [listFilters, listPage]);

  // Handle claimant click - opens tab instead of navigating
  const handleClaimantClick = (event: React.MouseEvent, claimant: Claimant) => {
    event.preventDefault();
    openTab(claimant.id, claimant.name, claimant.status);
  };

  // Filter handlers
  const updateFilter = (key: string, value: any) => {
    setListFilters({ ...listFilters, [key]: value });
    setListPage(1);
  };

  const clearFilters = () => {
    setListFilters({});
    setListPage(1);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search claimants..."
              value={listFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={listFilters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          {Object.keys(listFilters).length > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg m-4 p-6">
            <div className="text-red-800">{error}</div>
          </div>
        ) : claimants.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No claimants found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {claimants.map((claimant) => (
              <div
                key={claimant.id}
                onClick={(e) => handleClaimantClick(e, claimant)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {claimant.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {claimant.address}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    ${claimant.amount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceClaimantList;