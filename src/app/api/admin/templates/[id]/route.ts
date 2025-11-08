import { NextRequest, NextResponse } from 'next/server'

// PUT /api/admin/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, type, subject, content, category, active } = body

    // Validate required fields
    if (!name || !type || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract variables from content
    const extractedVariables = extractVariablesFromContent(content, subject)

    // Update template (mock response for development)
    const template = {
      id: params.id,
      name,
      type,
      subject: type === 'email' ? subject : null,
      content,
      category,
      active: active ?? true,
      variables: extractedVariables,
      created_at: '2024-01-01T10:00:00Z', // Would come from database
      updated_at: new Date().toISOString(),
      usage_count: 0 // Would come from database
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you would:
    // 1. Check if template is being used in active campaigns
    // 2. Delete from database
    // For now, return success
    
    return NextResponse.json({ success: true })
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