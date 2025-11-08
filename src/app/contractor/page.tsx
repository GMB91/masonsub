"use client";

import { useEffect, useState } from 'react';
import { RouteGuard, useAuth } from '../../contexts/AuthContext';
import { Users, MessageSquare, Mail, Phone, Clock, CheckCircle, X, AlertTriangle } from 'lucide-react';
import ClaimantDetailModal from './components/ClaimantDetailModal';

interface Claimant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  amount: number;
  status_contractor: 'uncontacted' | 'qualified' | 'not_interested' | 'follow_up_later';
  last_contacted: string | null;
  contractor_updated_at: string;
  contractor_note?: string;
}

interface ContractorProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

export default function ContractorPortalPage() {
  return (
    <RouteGuard allowedRoles={['contractor']}>
      <ContractorPortalContent />
    </RouteGuard>
  );
}

function ContractorPortalContent() {
  const { user } = useAuth();
  const [claimants, setClaimants] = useState<Claimant[]>([]);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedClaimant, setSelectedClaimant] = useState<Claimant | null>(null);

  useEffect(() => {
    if (user) {
      loadContractorData();
    }
  }, [user]);

  const loadContractorData = async () => {
    try {
      setLoading(true);
      
      // Load contractor profile and assigned claimants
      const [profileRes, claimantsRes] = await Promise.all([
        fetch('/api/contractor/profile'),
        fetch('/api/contractor/claimants')
      ]);

      if (!profileRes.ok || !claimantsRes.ok) {
        throw new Error('Failed to load contractor data');
      }

      const [profileData, claimantsData] = await Promise.all([
        profileRes.json(),
        claimantsRes.json()
      ]);

      setProfile(profileData.profile);
      setClaimants(claimantsData.claimants);
    } catch (err) {
      console.error('Error loading contractor data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not_interested':
        return <X className="h-4 w-4 text-red-500" />;
      case 'follow_up_later':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'Qualified ✅';
      case 'not_interested':
        return 'Not Interested 🚫';
      case 'follow_up_later':
        return 'Follow Up Later ⏳';
      default:
        return 'Uncontacted';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assigned claimants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadContractorData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Contractor Portal</h1>
                <p className="text-sm text-gray-500">Mason Vector Asset Recovery</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {profile?.full_name || 'Contractor'}
              </span>
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  {profile?.full_name?.charAt(0) || 'C'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contractor Info Section */}
        {profile && (
          <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                <p className="text-2xl font-semibold text-gray-900">{claimants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Qualified</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {claimants.filter(c => c.status_contractor === 'qualified').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Follow Up</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {claimants.filter(c => c.status_contractor === 'follow_up_later').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Uncontacted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {claimants.filter(c => c.status_contractor === 'uncontacted').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Claimants Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Claimants</h2>
            <p className="mt-1 text-sm text-gray-500">
              Contact verification and status updates for your assigned claimants
            </p>
          </div>

          {claimants.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Claimants</h3>
              <p className="text-gray-500">
                You don't have any claimants assigned to you yet. Check back later or contact your manager.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claimants.map((claimant) => (
                    <tr key={claimant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{claimant.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{claimant.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{claimant.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {claimant.city}, {claimant.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(claimant.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(claimant.status_contractor)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getStatusText(claimant.status_contractor)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(claimant.contractor_updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedClaimant(claimant)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Open ➜
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Claimant Detail Modal */}
      {selectedClaimant && (
        <ClaimantDetailModal
          claimant={selectedClaimant}
          isOpen={true}
          onClose={() => setSelectedClaimant(null)}
          onUpdate={(updatedClaimant) => {
            // Update the claimant in the list
            setClaimants(claimants.map(c => 
              c.id === updatedClaimant.id ? updatedClaimant : c
            ));
            setSelectedClaimant(updatedClaimant);
          }}
        />
      )}
    </div>
  );
}