import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    // Mock templates data for development
    const templates = [
      {
        id: '1',
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to Mason Vector',
        content: 'Hello {first_name},\n\nWelcome to Mason Vector! We\'re excited to help you recover your unclaimed money.\n\nBest regards,\nThe Mason Vector Team',
        variables: ['{first_name}'],
        category: 'Welcome',
        active: true,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        usage_count: 15,
        last_used: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        name: 'Document Request SMS',
        type: 'sms',
        content: 'Hi {first_name}, we need additional documents for your claim #{reference_number}. Please upload them via {portal_link}',
        variables: ['{first_name}', '{reference_number}', '{portal_link}'],
        category: 'Reminders',
        active: true,
        created_at: '2024-01-02T11:00:00Z',
        updated_at: '2024-01-02T11:00:00Z',
        usage_count: 8,
        last_used: '2024-01-14T09:15:00Z'
      },
      {
        id: '3',
        name: 'Claim Approved',
        type: 'email',
        subject: 'Your claim has been approved - {reference_number}',
        content: 'Dear {full_name},\n\nGreat news! Your claim #{reference_number} for ${amount} has been approved.\n\nPayment will be processed within 5-7 business days.\n\nThank you for choosing Mason Vector.',
        variables: ['{full_name}', '{reference_number}', '{amount}'],
        category: 'Updates',
        active: true,
        created_at: '2024-01-03T12:00:00Z',
        updated_at: '2024-01-03T12:00:00Z',
        usage_count: 22,
        last_used: '2024-01-16T16:45:00Z'
      }
    ]

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, subject, content, category, active } = body

    // Validate required fields
    if (!name || !type || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract variables from content
    const extractedVariables = extractVariablesFromContent(content, subject)

    // Create template (mock response for development)
    const template = {
      id: Date.now().toString(),
      name,
      type,
      subject: type === 'email' ? subject : null,
      content,
      category,
      active: active ?? true,
      variables: extractedVariables,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to extract variables from template content
function extractVariablesFromContent(content: string, subject?: string): string[] {
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