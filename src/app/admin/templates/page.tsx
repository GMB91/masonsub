'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
// Using Lucide React icons instead of Heroicons
import { Plus, Edit, Trash2, Eye, Copy, Send, Mail, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react'
// Import the actual components
import TemplateEditor from './components/TemplateEditor'
import TemplatePreview from './components/TemplatePreview'
import CampaignCreator from './components/CampaignCreator'

interface Template {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  content: string
  variables: string[]
  category: string
  active: boolean
  created_at: string
  updated_at: string
  usage_count: number
  last_used?: string
}

interface Campaign {
  id: string
  template_id: string
  name: string
  scheduled_at?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  recipient_count: number
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  created_at: string
}

export default function TemplatesAdmin() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showCampaignCreator, setShowCampaignCreator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'email' | 'sms',
    category: 'all',
    status: 'all' as 'all' | 'active' | 'inactive'
  })

  // Template categories
  const categories = [
    'General', 'Welcome', 'Reminders', 'Updates', 'Notifications', 
    'Marketing', 'Support', 'Administrative', 'Legal', 'Emergency'
  ]

  // Available variables for templates
  const availableVariables = [
    '{first_name}', '{last_name}', '{full_name}', '{email}', '{phone}',
    '{company}', '{position}', '{start_date}', '{end_date}', '{amount}',
    '{reference_number}', '{current_date}', '{current_time}', '{portal_link}',
    '{support_email}', '{support_phone}', '{unsubscribe_link}'
  ]

  useEffect(() => {
    if (user?.role !== 'admin') return
    loadTemplates()
    loadCampaigns()
  }, [user])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/templates/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    }
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      category: 'General',
      active: true,
      created_at: '',
      updated_at: '',
      usage_count: 0
    })
    setShowEditor(true)
  }

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate({ ...template })
    setShowEditor(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadTemplates()
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleDuplicateTemplate = (template: Template) => {
    setSelectedTemplate({
      ...template,
      id: '',
      name: `${template.name} (Copy)`,
      created_at: '',
      updated_at: '',
      usage_count: 0
    })
    setShowEditor(true)
  }

  const filteredTemplates = templates.filter(template => {
    if (filters.type !== 'all' && template.type !== filters.type) return false
    if (filters.category !== 'all' && template.category !== filters.category) return false
    if (filters.status === 'active' && !template.active) return false
    if (filters.status === 'inactive' && template.active) return false
    return true
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (user?.role !== 'admin') {
    return <div className="p-6 text-center text-red-600">Access denied. Admin privileges required.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Communication Templates</h1>
          <p className="mt-2 text-gray-600">Manage email and SMS templates for automated communications</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Campaigns ({campaigns.length})
            </button>
          </nav>
        </div>

        {activeTab === 'templates' && (
          <>
            {/* Templates Filters and Actions */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Template
              </button>
            </div>

            {/* Templates Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {template.type === 'email' ? (
                            <Mail className="h-6 w-6 text-blue-500 mr-2" />
                          ) : (
                            <Smartphone className="h-6 w-6 text-green-500 mr-2" />
                          )}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-500">{template.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {template.subject && (
                        <p className="text-sm font-medium text-gray-700 mb-2">Subject: {template.subject}</p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Used {template.usage_count} times</span>
                        <span>Updated {formatDate(template.updated_at)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowPreview(true)
                          }}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-sm font-medium rounded-md text-white hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-500">Get started by creating your first template</p>
                    <button
                      onClick={handleCreateTemplate}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Template
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'campaigns' && (
          <>
            {/* Campaigns Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">Manage and track your communication campaigns</p>
              <button
                onClick={() => setShowCampaignCreator(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Send className="h-5 w-5 mr-2" />
                Create Campaign
              </button>
            </div>

            {/* Campaigns List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">Template ID: {campaign.template_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                          campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.sent_count}/{campaign.recipient_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-xs text-gray-500">
                          Delivered: {campaign.delivered_count} | Opened: {campaign.opened_count} | Clicked: {campaign.clicked_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.scheduled_at ? formatDate(campaign.scheduled_at) : 'Immediate'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        {campaign.status === 'draft' && (
                          <button className="text-green-600 hover:text-green-900 mr-3">Send</button>
                        )}
                        {campaign.status === 'scheduled' && (
                          <button className="text-red-600 hover:text-red-900">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {campaigns.length === 0 && (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-500">Create your first communication campaign</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Template Editor, Preview, and Campaign Creator Modals */}
        {showEditor && selectedTemplate && (
          <TemplateEditor
            template={selectedTemplate}
            availableVariables={availableVariables}
            categories={categories}
            onSave={async (template: Template) => {
              await loadTemplates()
              setShowEditor(false)
            }}
            onClose={() => setShowEditor(false)}
          />
        )}

        {showPreview && selectedTemplate && (
          <TemplatePreview
            template={selectedTemplate}
            onClose={() => setShowPreview(false)}
          />
        )}

        {showCampaignCreator && (
          <CampaignCreator
            templates={templates}
            onSave={async () => {
              await loadCampaigns()
              setShowCampaignCreator(false)
            }}
            onClose={() => setShowCampaignCreator(false)}
          />
        )}
      </div>
    </div>
  )
}