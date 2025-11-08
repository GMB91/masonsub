'use client'

import { X, Mail, Smartphone, Copy, Send, Eye } from 'lucide-react'
import { useState } from 'react'

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

interface TemplatePreviewProps {
  template: Template
  onClose: () => void
}

export default function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showVariables, setShowVariables] = useState(false)
  const [copied, setCopied] = useState(false)

  // Sample variable values for preview
  const sampleValues: { [key: string]: string } = {
    '{first_name}': 'Sarah',
    '{last_name}': 'Johnson',
    '{full_name}': 'Sarah Johnson',
    '{email}': 'sarah.johnson@example.com',
    '{phone}': '0412 345 678',
    '{company}': 'Johnson Enterprises Pty Ltd',
    '{position}': 'Operations Manager',
    '{start_date}': '15/03/2024',
    '{end_date}': '15/03/2025',
    '{amount}': '$2,450.75',
    '{reference_number}': 'MV-2024-0156',
    '{current_date}': new Date().toLocaleDateString('en-AU'),
    '{current_time}': new Date().toLocaleTimeString('en-AU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    '{portal_link}': 'https://portal.masonvector.com.au/dashboard',
    '{support_email}': 'support@masonvector.com.au',
    '{support_phone}': '1300 627 466',
    '{unsubscribe_link}': 'https://masonvector.com.au/unsubscribe?token=abc123'
  }

  const renderContent = (content: string) => {
    let renderedContent = content
    
    // Replace variables with sample values
    Object.entries(sampleValues).forEach(([variable, value]) => {
      renderedContent = renderedContent.replace(
        new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), 
        value
      )
    })

    return renderedContent
  }

  const handleCopyContent = async () => {
    try {
      const contentToCopy = template.type === 'email' 
        ? `Subject: ${template.subject}\n\n${template.content}`
        : template.content
        
      await navigator.clipboard.writeText(contentToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy content:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            {template.type === 'email' ? (
              <Mail className="h-6 w-6 text-blue-500 mr-3" />
            ) : (
              <Smartphone className="h-6 w-6 text-green-500 mr-3" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">{template.category}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {template.type === 'email' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    previewMode === 'desktop' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    previewMode === 'mobile' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mobile
                </button>
              </div>
            )}
            
            <button
              onClick={handleCopyContent}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Variables
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Preview Panel */}
          <div className={`${showVariables ? 'w-2/3' : 'w-full'} p-6 overflow-y-auto`}>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Live Preview</h3>
              <p className="text-sm text-gray-500">
                Preview showing with sample data values
              </p>
            </div>

            {template.type === 'email' ? (
              <div className={`bg-white border rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}>
                {/* Email Header */}
                <div className="bg-gray-100 px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">From: Mason Vector</p>
                      <p className="text-sm text-gray-600">To: {sampleValues['{email}']}</p>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(new Date().toISOString())}</p>
                  </div>
                </div>

                {/* Email Subject */}
                <div className="px-4 py-3 border-b bg-blue-50">
                  <h4 className="font-semibold text-gray-900">
                    {renderContent(template.subject || '')}
                  </h4>
                </div>

                {/* Email Body */}
                <div className="px-4 py-6">
                  <div 
                    className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap"
                    style={{ lineHeight: '1.6' }}
                  >
                    {renderContent(template.content)}
                  </div>
                </div>

                {/* Email Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500">
                    This email was sent by Mason Vector. 
                    {template.content.includes('{unsubscribe_link}') && (
                      <span> You can unsubscribe at any time.</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-sm">
                {/* SMS Phone Mockup */}
                <div className="bg-gray-900 rounded-t-3xl rounded-b-3xl p-4 shadow-2xl">
                  <div className="bg-gray-800 rounded-3xl p-4">
                    {/* Phone Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MV</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-white text-sm font-medium">Mason Vector</p>
                          <p className="text-gray-400 text-xs">now</p>
                        </div>
                      </div>
                    </div>

                    {/* SMS Bubble */}
                    <div className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-xs">
                          <p className="text-sm">{renderContent(template.content)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Character Count */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-400">
                        {template.content.length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Variables Sidebar */}
          {showVariables && (
            <div className="w-1/3 p-6 bg-gray-50 border-l overflow-y-auto">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Template Variables</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Used in this template:</h5>
                  <div className="space-y-2">
                    {template.variables.map((variable) => (
                      <div key={variable} className="bg-white p-3 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <code className="text-sm font-mono text-blue-600">{variable}</code>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Sample: {sampleValues[variable] || 'No sample data'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Template Information:</h5>
                  <div className="bg-white p-3 rounded-lg border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{template.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Used:</span>
                      <span className="font-medium">{template.usage_count} times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Updated:</span>
                      <span className="font-medium">{formatDate(template.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Raw Template:</h5>
                  <div className="bg-white p-3 rounded-lg border">
                    {template.type === 'email' && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Subject:</p>
                        <code className="text-xs font-mono text-gray-800 bg-gray-100 p-2 rounded block">
                          {template.subject}
                        </code>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mb-1">Content:</p>
                    <code className="text-xs font-mono text-gray-800 bg-gray-100 p-2 rounded block whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {template.content}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Preview updated: {formatDate(new Date().toISOString())}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}