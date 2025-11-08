// Mason Vector - Claimant Detail Component
// Individual claimant details view with state management

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ClaimantDetailProps {
  claimantId: string;
  tabId: string;
  onStateChange?: (state: any) => void;
  initialState?: any;
}

interface Claimant {
  id: string;
  name: string;
  address: string;
  amount: number;
  state: string;
  status: string;
  date_collected: string;
  created_at: string;
  updated_at: string;
}

export function ClaimantDetail({ 
  claimantId, 
  tabId, 
  onStateChange, 
  initialState = {} 
}: ClaimantDetailProps) {
  const [claimant, setClaimant] = useState<Claimant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(initialState.activeSection || 'overview');

  // Load claimant data
  useEffect(() => {
    const loadClaimant = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('claimants')
          .select('*')
          .eq('id', claimantId)
          .single();

        if (error) throw error;
        
        setClaimant(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load claimant');
      } finally {
        setLoading(false);
      }
    };

    loadClaimant();
  }, [claimantId]);

  // Sync state changes with parent
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ activeSection });
    }
  }, [activeSection, onStateChange]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-800 font-medium mb-2">Error Loading Claimant</div>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!claimant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-yellow-800">Claimant not found</div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'claims', label: 'Claims' },
    { id: 'documents', label: 'Documents' },
    { id: 'history', label: 'History' },
    { id: 'notes', label: 'Notes' }
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{claimant.name}</h1>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              claimant.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : claimant.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {claimant.status}
            </span>
            <span className="text-lg font-bold text-green-600">
              ${claimant.amount?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
        
        <div className="mt-2 text-gray-600">
          <div>{claimant.address}</div>
          <div className="text-sm">
            State: {claimant.state} • 
            Collected: {new Date(claimant.date_collected).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 border-b border-gray-200">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      <div className="min-h-96">
        {activeSection === 'overview' && (
          <ClaimantOverview claimant={claimant} />
        )}
        {activeSection === 'claims' && (
          <ClaimantClaims claimantId={claimant.id} />
        )}
        {activeSection === 'documents' && (
          <ClaimantDocuments claimantId={claimant.id} />
        )}
        {activeSection === 'history' && (
          <ClaimantHistory claimantId={claimant.id} />
        )}
        {activeSection === 'notes' && (
          <ClaimantNotes claimantId={claimant.id} />
        )}
      </div>
    </div>
  );
}

// Sub-components for different sections
function ClaimantOverview({ claimant }: { claimant: Claimant }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium">Name:</dt>
            <dd>{claimant.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Amount:</dt>
            <dd className="font-bold text-green-600">${claimant.amount?.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">State:</dt>
            <dd>{claimant.state}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Status:</dt>
            <dd>{claimant.status}</dd>
          </div>
        </dl>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium">Date Collected:</dt>
            <dd>{new Date(claimant.date_collected).toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Created:</dt>
            <dd>{new Date(claimant.created_at).toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Last Updated:</dt>
            <dd>{new Date(claimant.updated_at).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ClaimantClaims({ claimantId }: { claimantId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Claims</h3>
      <p className="text-gray-600">Claims management interface will be implemented here.</p>
    </div>
  );
}

function ClaimantDocuments({ claimantId }: { claimantId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Documents</h3>
      <p className="text-gray-600">Document management interface will be implemented here.</p>
    </div>
  );
}

function ClaimantHistory({ claimantId }: { claimantId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">History</h3>
      <p className="text-gray-600">Activity history will be implemented here.</p>
    </div>
  );
}

function ClaimantNotes({ claimantId }: { claimantId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Notes</h3>
      <p className="text-gray-600">Notes management interface will be implemented here.</p>
    </div>
  );
}

export default ClaimantDetail;