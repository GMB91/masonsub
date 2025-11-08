'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye, Type, Smartphone, Mail } from 'lucide-react'

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
}

interface TemplateEditorProps {
  template: Template
  availableVariables: string[]
  categories: string[]
  onSave: (template: Template) => Promise<void>
  onClose: () => void
}

export default function TemplateEditor({
  template: initialTemplate,
  availableVariables,
  categories,
  onSave,
  onClose
}: TemplateEditorProps) {
  const [template, setTemplate] = useState<Template>(initialTemplate)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Character limits
  const SMS_LIMIT = 160
  const EMAIL_SUBJECT_LIMIT = 78

  useEffect(() => {
    // Auto-detect variables when content changes
    const detectedVariables = extractVariablesFromContent(template.content, template.subject)
    if (JSON.stringify(detectedVariables) !== JSON.stringify(template.variables)) {
      setTemplate(prev => ({ ...prev, variables: detectedVariables }))
    }
  }, [template.content, template.subject])

  const extractVariablesFromContent = (content: string, subject?: string): string[] => {
    const variablePattern = /\{([^}]+)\}/g
    const variables = new Set<string>()
    
    // Extract from content
    let match
    while ((match = variablePattern.exec(content)) !== null) {
      variables.add(`{${match[1]}}`)
    }
    
    // Extract from subject if provided
    if (subject) {
      variablePattern.lastIndex = 0
      while ((match = variablePattern.exec(subject)) !== null) {
        variables.add(`{${match[1]}}`)
      }
    }
    
    return Array.from(variables)
  }

  const validateTemplate = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!template.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (!template.category) {
      newErrors.category = 'Category is required'
    }

    if (!template.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (template.type === 'email' && !template.subject?.trim()) {
      newErrors.subject = 'Subject is required for email templates'
    }

    if (template.type === 'sms' && template.content.length > SMS_LIMIT) {
      newErrors.content = `SMS content must be ${SMS_LIMIT} characters or less`
    }

    if (template.type === 'email' && template.subject && template.subject.length > EMAIL_SUBJECT_LIMIT) {
      newErrors.subject = `Subject should be ${EMAIL_SUBJECT_LIMIT} characters or less for better deliverability`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateTemplate()) return

    try {
      setSaving(true)
      
      const method = template.id ? 'PUT' : 'POST'
      const url = template.id ? `/api/admin/templates/${template.id}` : '/api/admin/templates'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        const data = await response.json()
        await onSave(data.template)
      } else {
        const error = await response.json()
        alert(`Failed to save template: ${error.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const content = template.content
      const newContent = content.substring(0, start) + variable + content.substring(end)
      
      setTemplate(prev => ({ ...prev, content: newContent }))
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const renderPreview = () => {
    // Simple preview with sample variable values
    const sampleValues: { [key: string]: string } = {
      '{first_name}': 'John',
      '{last_name}': 'Smith',
      '{full_name}': 'John Smith',
      '{email}': 'john.smith@example.com',
      '{phone}': '0412 345 678',
      '{company}': 'ABC Pty Ltd',
      '{position}': 'Manager',
      '{amount}': '$1,250.00',
      '{reference_number}': 'MV-2024-001',
      '{current_date}': new Date().toLocaleDateString('en-AU'),
      '{current_time}': new Date().toLocaleTimeString('en-AU'),
      '{portal_link}': 'https://portal.masonvector.com.au',
      '{support_email}': 'support@masonvector.com.au',
      '{support_phone}': '1300 123 456',
      '{unsubscribe_link}': 'https://masonvector.com.au/unsubscribe'
    }

    let previewContent = template.content
    let previewSubject = template.subject || ''

    // Replace variables with sample values
    Object.entries(sampleValues).forEach(([variable, value]) => {
      previewContent = previewContent.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
      previewSubject = previewSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

    return { previewContent, previewSubject }
  }

  const { previewContent, previewSubject } = renderPreview()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {template.id ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Design and configure your communication template
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Editor Panel */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto border-r`}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter template name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={template.type === 'email'}
                        onChange={(e) => setTemplate(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'email' | 'sms',
                          subject: e.target.value === 'email' ? (prev.subject || '') : undefined
                        }))}
                        className="mr-2"
                      />
                      <Mail className="h-4 w-4 mr-1 text-blue-500" />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="sms"
                        checked={template.type === 'sms'}
                        onChange={(e) => setTemplate(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'email' | 'sms',
                          subject: undefined
                        }))}
                        className="mr-2"
                      />
                      <Smartphone className="h-4 w-4 mr-1 text-green-500" />
                      SMS
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={template.category}
                    onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={template.active}
                      onChange={(e) => setTemplate(prev => ({ ...prev, active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Subject (Email only) */}
              {template.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={template.subject || ''}
                    onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.subject ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter email subject"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
                    <p className={`text-xs ${(template.subject?.length || 0) > EMAIL_SUBJECT_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
                      {template.subject?.length || 0}/{EMAIL_SUBJECT_LIMIT} characters
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content *
                  </label>
                  {template.type === 'sms' && (
                    <p className={`text-xs ${template.content.length > SMS_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
                      {template.content.length}/{SMS_LIMIT} characters
                    </p>
                  )}
                </div>
                <textarea
                  id="template-content"
                  value={template.content}
                  onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
                  className={`w-full h-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.content ? 'border-red-500' : ''
                  }`}
                  placeholder={template.type === 'email' 
                    ? 'Enter email content...' 
                    : 'Enter SMS message...'
                  }
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>

              {/* Variables Panel */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Available Variables</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableVariables.map((variable) => (
                      <button
                        key={variable}
                        onClick={() => insertVariable(variable)}
                        className="text-left px-3 py-2 bg-white border border-gray-200 rounded text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click any variable to insert it at your cursor position
                  </p>
                </div>
              </div>

              {/* Detected Variables */}
              {template.variables.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Type className="h-3 w-3 mr-1" />
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
              
              <div className="bg-white rounded-lg border p-4">
                {template.type === 'email' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Subject:</label>
                      <p className="text-sm font-medium">{previewSubject}</p>
                    </div>
                    <hr />
                    <div>
                      <label className="text-xs font-medium text-gray-500">Body:</label>
                      <div className="text-sm whitespace-pre-wrap mt-2">{previewContent}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-2">
                      <Smartphone className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-xs font-medium text-gray-500">SMS Message</span>
                    </div>
                    <div className="bg-blue-500 text-white rounded-lg rounded-bl-none p-3 max-w-xs">
                      <p className="text-sm">{previewContent}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  This preview uses sample data. Actual messages will use real recipient data.
                </p>
              </div>
            </div>
          )}
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
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  )
}