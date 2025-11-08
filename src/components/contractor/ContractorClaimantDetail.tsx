// Mason Vector - Contractor Claimant Detail
// Restricted claimant view for contractors with auto-save functionality

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useContractorWorkspace } from '@/lib/state/useContractorWorkspace';
import { Phone, Mail, MapPin, FileText, Clock, AlertCircle } from 'lucide-react';

interface ContractorClaimantDetailProps {
  claimantId: string;
  tabId: string;
}

interface ClaimantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  status: 'qualified' | 'not_interested' | 'follow_up';
  contractor_notes: string;
  assigned_to: string;
  last_contact: string | null;
}

// Mock data - replace with real API call
const mockClaimantData: ClaimantData = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+61 400 123 456',
  address: '123 Main St, Sydney NSW 2000',
  state: 'NSW',
  status: 'follow_up',
  contractor_notes: 'Left voicemail on Monday. Requested callback.',
  assigned_to: 'contractor1',
  last_contact: '2024-11-06T14:30:00Z'
};

export function ContractorClaimantDetail({ claimantId, tabId }: ContractorClaimantDetailProps) {
  const { markUnsaved, markSaved, recordAutoSave, needsAutoSave } = useContractorWorkspace();
  
  // Component state
  const [claimant, setClaimant] = useState<ClaimantData>(mockClaimantData);
  const [notes, setNotes] = useState(claimant.contractor_notes || '');
  const [status, setStatus] = useState(claimant.status);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;
    
    setIsSaving(true);
    try {
      // Simulate API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update claimant data
      const updatedClaimant = {
        ...claimant,
        contractor_notes: notes,
        status: status
      };
      
      setClaimant(updatedClaimant);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Update workspace state
      markSaved(tabId);
      recordAutoSave(tabId);
      
      console.log('Auto-saved contractor notes for claimant:', claimantId);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [notes, status, claimant, hasUnsavedChanges, isSaving, tabId, claimantId, markSaved, recordAutoSave]);
  
  // Auto-save timer
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timer = setTimeout(() => {
      if (needsAutoSave(tabId)) {
        autoSave();
      }
    }, 10000); // 10 seconds
    
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, autoSave, needsAutoSave, tabId]);
  
  // Handle notes change
  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasUnsavedChanges(true);
    markUnsaved(tabId);
  };
  
  // Handle status change
  const handleStatusChange = (newStatus: ClaimantData['status']) => {
    setStatus(newStatus);
    setHasUnsavedChanges(true);
    markUnsaved(tabId);
  };
  
  // Send SMS function
  const handleSendSMS = async (template: string) => {
    try {
      // Simulate SMS API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log activity
      console.log(`SMS sent to ${claimant.phone} using template: ${template}`);
      
      // Update last contact
      setClaimant(prev => ({
        ...prev,
        last_contact: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };
  
  // Send email function
  const handleSendEmail = async () => {
    try {
      // Simulate email API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log activity
      console.log(`Introduction email sent to ${claimant.email}`);
      
      // Update last contact
      setClaimant(prev => ({
        ...prev,
        last_contact: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };
  
  const formatLastContact = (timestamp: string | null) => {
    if (!timestamp) return 'No recent contact';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };
  
  const getStatusColor = (status: ClaimantData['status']) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {claimant.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{claimant.state}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Last contact: {formatLastContact(claimant.last_contact)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Auto-save indicator */}
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-1 text-amber-600">
                  {isSaving ? (
                    <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {isSaving ? 'Saving...' : 'Unsaved changes'}
                  </span>
                </div>
              )}
              
              {lastSaved && !hasUnsavedChanges && (
                <div className="text-sm text-green-600">
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium">{claimant.phone}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{claimant.email}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-medium">{claimant.address}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ClaimantData['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="qualified">✅ Qualified</option>
                <option value="not_interested">❌ Not Interested</option>
                <option value="follow_up">📞 Follow Up</option>
              </select>
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          
          <div className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add your notes about this claimant..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            
            <div className="text-sm text-gray-500">
              💡 Notes auto-save every 10 seconds. Include call times, responses, and next steps.
            </div>
          </div>
        </div>
        
        {/* Communication Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Communication</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SMS Panel */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Send SMS</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSendSMS('introduction')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  📱 Send Introduction SMS
                </button>
                <button
                  onClick={() => handleSendSMS('follow_up')}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  📞 Send Follow-up SMS
                </button>
              </div>
            </div>
            
            {/* Email Panel */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Send Email</h3>
              <button
                onClick={handleSendEmail}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                ✉️ Send Introduction Email
              </button>
            </div>
          </div>
        </div>
        
        {/* Documents Section (Read-only) */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <div>No documents available</div>
            <div className="text-sm mt-1">Documents uploaded by admin will appear here</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractorClaimantDetail;