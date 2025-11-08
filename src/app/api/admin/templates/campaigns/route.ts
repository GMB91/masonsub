import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/templates/campaigns - Get all campaigns
export async function GET() {
  try {
    // Mock campaigns data for development
    const campaigns = [
      {
        id: '1',
        template_id: '1',
        name: 'New User Welcome Series',
        scheduled_at: null,
        status: 'sent' as const,
        recipient_count: 150,
        sent_count: 150,
        delivered_count: 148,
        opened_count: 89,
        clicked_count: 23,
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        id: '2',
        template_id: '2',
        name: 'Document Reminder Campaign',
        scheduled_at: '2024-01-20T14:00:00Z',
        status: 'scheduled' as const,
        recipient_count: 45,
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        created_at: '2024-01-15T11:30:00Z'
      },
      {
        id: '3',
        template_id: '3',
        name: 'Monthly Newsletter',
        scheduled_at: null,
        status: 'sending' as const,
        recipient_count: 1200,
        sent_count: 800,
        delivered_count: 795,
        opened_count: 312,
        clicked_count: 67,
        created_at: '2024-01-16T08:00:00Z'
      }
    ]

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/templates/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, name, scheduled_at, recipients } = body

    // Validate required fields
    if (!template_id || !name || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create campaign (mock response for development)
    const campaign = {
      id: Date.now().toString(),
      template_id,
      name,
      scheduled_at: scheduled_at || null,
      status: scheduled_at ? 'scheduled' : 'draft' as const,
      recipient_count: recipients.length,
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}