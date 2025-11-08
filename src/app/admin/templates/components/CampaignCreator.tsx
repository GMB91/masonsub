'use client'

import { useState, useEffect } from 'react'
import { X, Send, Calendar, Users, Mail, Smartphone, Clock, Plus, Trash2, Upload } from 'lucide-react'

interface Template {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  content: string
  variables: string[]
  category: string
  active: boolean
}

interface Recipient {
  id: string
  name: string
  email?: string
  phone?: string
  variables: { [key: string]: string }
}

interface CampaignCreatorProps {
  templates: Template[]
  onSave: () => Promise<void>
  onClose: () => void
}

export default function CampaignCreator({ templates, onSave, onClose }: CampaignCreatorProps) {
  const [campaign, setCampaign] = useState({
    name: '',
    template_id: '',
    scheduled_at: '',
    recipients: [] as Recipient[],
    send_immediately: true
  })
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [recipientMode, setRecipientMode] = useState<'manual' | 'upload' | 'database'>('manual')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPreview, setShowPreview] = useState(false)

  // Sample recipients for database mode
  const [availableRecipients] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '0412345678',
      variables: {
        '{first_name}': 'John',
        '{last_name}': 'Smith',
        '{full_name}': 'John Smith',
        '{company}': 'Smith Enterprises',
        '{amount}': '$1,250.00'
      }
    },
    {
      id: '2', 
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '0423456789',
      variables: {
        '{first_name}': 'Sarah',
        '{last_name}': 'Johnson',
        '{full_name}': 'Sarah Johnson',
        '{company}': 'Johnson & Co',
        '{amount}': '$2,450.75'
      }
    }
  ])

  useEffect(() => {
    if (campaign.template_id) {
      const template = templates.find(t => t.id === campaign.template_id)
      setSelectedTemplate(template || null)
    }
  }, [campaign.template_id, templates])

  const activeTemplates = templates.filter(t => t.active)

  const validateCampaign = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!campaign.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!campaign.template_id) {
      newErrors.template_id = 'Please select a template'
    }

    if (campaign.recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required'
    }

    if (!campaign.send_immediately && !campaign.scheduled_at) {
      newErrors.scheduled_at = 'Scheduled date is required when not sending immediately'
    }

    // Validate recipients have required contact info
    if (selectedTemplate) {
      const invalidRecipients = campaign.recipients.filter(recipient => {
        if (selectedTemplate.type === 'email' && !recipient.email) {
          return true
        }
        if (selectedTemplate.type === 'sms' && !recipient.phone) {
          return true
        }
        return false
      })

      if (invalidRecipients.length > 0) {
        newErrors.recipients = `${invalidRecipients.length} recipients missing required ${selectedTemplate.type === 'email' ? 'email' : 'phone number'}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateCampaign()) return

    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/templates/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...campaign,
          scheduled_at: campaign.send_immediately ? null : campaign.scheduled_at
        })
      })

      if (response.ok) {
        await onSave()
      } else {
        const error = await response.json()
        alert(`Failed to create campaign: ${error.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to create campaign')
    } finally {
      setSaving(false)
    }
  }

  const addManualRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: '',
      email: selectedTemplate?.type === 'email' ? '' : undefined,
      phone: selectedTemplate?.type === 'sms' ? '' : undefined,
      variables: {}
    }
    setCampaign(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }))
  }

  const updateRecipient = (index: number, updates: Partial<Recipient>) => {
    setCampaign(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, ...updates } : recipient
      )
    }))
  }

  const removeRecipient = (index: number) => {
    setCampaign(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }))
  }

  const addSelectedRecipients = (recipientIds: string[]) => {
    const newRecipients = availableRecipients
      .filter(r => recipientIds.includes(r.id))
      .filter(r => !campaign.recipients.some(cr => cr.id === r.id))
    
    setCampaign(prev => ({
      ...prev,
      recipients: [...prev.recipients, ...newRecipients]
    }))
  }

  const renderRecipientForm = () => {
    if (recipientMode === 'manual') {
      return (
        <div className="space-y-4">
          {campaign.recipients.map((recipient, index) => (
            <div key={recipient.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Recipient {index + 1}</h5>
                <button
                  onClick={() => removeRecipient(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(index, { name: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>

                {selectedTemplate?.type === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={recipient.email || ''}
                      onChange={(e) => updateRecipient(index, { email: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                )}

                {selectedTemplate?.type === 'sms' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={recipient.phone || ''}
                      onChange={(e) => updateRecipient(index, { phone: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                )}
              </div>

              {/* Variable fields for template variables */}
              {selectedTemplate && selectedTemplate.variables.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Template Variables</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={recipient.variables[variable] || ''}
                          onChange={(e) => updateRecipient(index, {
                            variables: {
                              ...recipient.variables,
                              [variable]: e.target.value
                            }
                          })}
                          className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder={`Value for ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addManualRecipient}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Recipient
          </button>
        </div>
      )
    }

    if (recipientMode === 'database') {
      return (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2">
              <h5 className="font-medium text-gray-900">Available Recipients</h5>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {availableRecipients.map((recipient) => (
                <label key={recipient.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.recipients.some(r => r.id === recipient.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addSelectedRecipients([recipient.id])
                      } else {
                        setCampaign(prev => ({
                          ...prev,
                          recipients: prev.recipients.filter(r => r.id !== recipient.id)
                        }))
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedTemplate?.type === 'email' ? recipient.email : recipient.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {campaign.recipients.length > 0 && (
            <div className="border rounded-lg">
              <div className="bg-blue-50 px-4 py-2">
                <h5 className="font-medium text-gray-900">Selected Recipients ({campaign.recipients.length})</h5>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {campaign.recipients.map((recipient) => (
                    <span key={recipient.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {recipient.name}
                      <button
                        onClick={() => setCampaign(prev => ({
                          ...prev,
                          recipients: prev.recipients.filter(r => r.id !== recipient.id)
                        }))}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="text-center py-8">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h5 className="text-lg font-medium text-gray-900 mb-2">Upload Recipients</h5>
        <p className="text-gray-500 mb-4">Upload a CSV file with recipient data</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Choose File
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Campaign</h2>
            <p className="text-sm text-gray-500 mt-1">
              Send targeted communications to your recipients
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Campaign Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaign.name}
                  onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter campaign name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template *
                </label>
                <select
                  value={campaign.template_id}
                  onChange={(e) => setCampaign(prev => ({ ...prev, template_id: e.target.value, recipients: [] }))}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.template_id ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select template</option>
                  {activeTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type.toUpperCase()})
                    </option>
                  ))}
                </select>
                {errors.template_id && <p className="text-red-500 text-xs mt-1">{errors.template_id}</p>}
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {selectedTemplate.type === 'email' ? (
                    <Mail className="h-5 w-5 text-blue-500 mr-2" />
                  ) : (
                    <Smartphone className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">{selectedTemplate.category}</span>
                </div>
                {selectedTemplate.subject && (
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Subject:</strong> {selectedTemplate.subject}
                  </p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2">{selectedTemplate.content}</p>
                {selectedTemplate.variables.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Variables: {selectedTemplate.variables.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Scheduling */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Scheduling</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={campaign.send_immediately}
                    onChange={() => setCampaign(prev => ({ ...prev, send_immediately: true }))}
                    className="mr-2"
                  />
                  <Send className="h-4 w-4 mr-2 text-green-500" />
                  Send immediately
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!campaign.send_immediately}
                    onChange={() => setCampaign(prev => ({ ...prev, send_immediately: false }))}
                    className="mr-2"
                  />
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Schedule for later
                </label>

                {!campaign.send_immediately && (
                  <div className="ml-6 mt-2">
                    <input
                      type="datetime-local"
                      value={campaign.scheduled_at}
                      onChange={(e) => setCampaign(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.scheduled_at ? 'border-red-500' : ''
                      }`}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.scheduled_at && <p className="text-red-500 text-xs mt-1">{errors.scheduled_at}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Recipients */}
            {selectedTemplate && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Recipients</h4>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setRecipientMode('manual')}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        recipientMode === 'manual' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => setRecipientMode('database')}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        recipientMode === 'database' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Database
                    </button>
                    <button
                      onClick={() => setRecipientMode('upload')}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        recipientMode === 'upload' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {renderRecipientForm()}
                
                {errors.recipients && (
                  <p className="text-red-500 text-xs mt-2">{errors.recipients}</p>
                )}
              </div>
            )}

            {/* Summary */}
            {campaign.template_id && campaign.recipients.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Campaign Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Template</p>
                    <p className="font-medium">{selectedTemplate?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{selectedTemplate?.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Recipients</p>
                    <p className="font-medium">{campaign.recipients.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Schedule</p>
                    <p className="font-medium">
                      {campaign.send_immediately ? 'Immediate' : 'Scheduled'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            onClick={() => setShowPreview(true)}
            disabled={!selectedTemplate || campaign.recipients.length === 0}
            className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !selectedTemplate || campaign.recipients.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {campaign.send_immediately ? (
              <Send className="h-4 w-4 mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Creating...' : campaign.send_immediately ? 'Send Campaign' : 'Schedule Campaign'}
          </button>
        </div>
      </div>
    </div>
  )
}