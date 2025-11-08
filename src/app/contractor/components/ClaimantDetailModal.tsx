"use client";

import { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Mail, Phone, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

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

interface ClaimantDetailModalProps {
  claimant: Claimant;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (claimant: Claimant) => void;
}

export default function ClaimantDetailModal({ claimant, isOpen, onClose, onUpdate }: ClaimantDetailModalProps) {
  const [notes, setNotes] = useState(claimant.contractor_note || '');
  const [status, setStatus] = useState(claimant.status_contractor);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Auto-save notes after 2 seconds of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notes !== (claimant.contractor_note || '')) {
        handleSaveNote();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [notes, claimant.contractor_note]);

  const handleSaveNote = async () => {
    if (isSavingNote) return;
    
    setIsSavingNote(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/contractor/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          claimant_id: claimant.id,
          note_text: notes
        })
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage('Note saved ✓');
        setTimeout(() => setSaveMessage(''), 2000);
        
        // Update the parent component
        onUpdate({
          ...claimant,
          contractor_note: notes,
          contractor_updated_at: result.updated_at
        });
      } else {
        setSaveMessage('Failed to save note');
      }
    } catch (error) {
      console.error('Save note error:', error);
      setSaveMessage('Error saving note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/contractor/update', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          claimant_id: claimant.id,
          status: newStatus
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus(newStatus as any);
        setSaveMessage('Status updated ✓');
        setTimeout(() => setSaveMessage(''), 2000);
        
        // Update the parent component
        onUpdate({
          ...claimant,
          status_contractor: newStatus as any,
          contractor_updated_at: result.updated_at
        });
      } else {
        setSaveMessage('Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      setSaveMessage('Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{claimant.name}</h2>
              <p className="text-sm text-gray-500">Contact Verification & Status Update</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm text-gray-900 font-medium">{claimant.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">{claimant.phone}</p>
                      <a
                        href={`tel:${claimant.phone}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">{claimant.email}</p>
                      <a
                        href={`mailto:${claimant.email}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900">
                      {claimant.address}<br />
                      {claimant.city}, {claimant.state} {claimant.postcode}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-500">Claim Amount</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(claimant.amount)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Contact</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(claimant.last_contacted)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowSMSModal(true)}
                    className="w-full flex items-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Send SMS Message
                  </button>
                  
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full flex items-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-3" />
                    Send Introduction Email
                  </button>
                  
                  <a
                    href={`tel:${claimant.phone}`}
                    className="w-full flex items-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-3" />
                    Call {claimant.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Notes and Status */}
            <div className="lg:col-span-2">
              {/* Status Section */}
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleStatusChange('qualified')}
                    disabled={isUpdatingStatus}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      status === 'qualified'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-sm font-medium">Qualified ✅</div>
                    <div className="text-xs text-gray-500 mt-1">Contact verified & interested</div>
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('not_interested')}
                    disabled={isUpdatingStatus}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      status === 'not_interested'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="text-sm font-medium">Not Interested 🚫</div>
                    <div className="text-xs text-gray-500 mt-1">Declined or not responsive</div>
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('follow_up_later')}
                    disabled={isUpdatingStatus}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      status === 'follow_up_later'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="text-sm font-medium">Follow Up Later ⏳</div>
                    <div className="text-xs text-gray-500 mt-1">Need to contact again</div>
                  </button>
                </div>

                {saveMessage && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">{saveMessage}</p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Call Notes & Comments</h3>
                  <div className="flex items-center space-x-2">
                    {isSavingNote && (
                      <span className="text-sm text-gray-500">Saving...</span>
                    )}
                    <Save className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record call outcomes, key details, client responses, next steps, or any important information from your contact attempts..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Notes auto-save as you type. Last updated: {formatDate(claimant.contractor_updated_at)}
                  </p>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isSavingNote ? 'Saving...' : 'Save Now'}
                  </button>
                </div>
              </div>

              {/* Contact History Placeholder */}
              <div className="bg-gray-50 border rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Communication History</h3>
                <p className="text-sm text-gray-500">
                  SMS and email history will appear here once messaging features are implemented.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Modal Placeholder */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send SMS</h3>
              <button
                onClick={() => setShowSMSModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              SMS messaging will be implemented with predefined templates and Twilio integration.
            </p>
            <button
              onClick={() => setShowSMSModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Email Modal Placeholder */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Introduction Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Email templates and sending functionality will be implemented with pre-approved content.
            </p>
            <button
              onClick={() => setShowEmailModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}