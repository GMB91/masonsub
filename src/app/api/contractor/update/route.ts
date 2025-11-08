import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Update contractor note for a claimant
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const { claimant_id, note_text } = await request.json();

    if (!claimant_id) {
      return NextResponse.json(
        { success: false, error: 'Missing claimant_id' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const userSupabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Verify user is a contractor
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (userRole !== 'contractor') {
      return NextResponse.json(
        { success: false, error: 'Access denied - contractor role required' },
        { status: 403 }
      );
    }

    // Use the database function to update note
    const { data: result, error } = await supabase
      .rpc('update_contractor_note', {
        p_claimant_id: claimant_id,
        p_note_text: note_text || ''
      });

    if (error) {
      console.error('Update note error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update note' },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      updated_at: result.updated_at
    });

  } catch (error) {
    console.error('Update contractor note API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update contractor status for a claimant
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const { claimant_id, status } = await request.json();

    if (!claimant_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing claimant_id or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['qualified', 'not_interested', 'follow_up_later'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const userSupabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Verify user is a contractor
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (userRole !== 'contractor') {
      return NextResponse.json(
        { success: false, error: 'Access denied - contractor role required' },
        { status: 403 }
      );
    }

    // Use the database function to update status
    const { data: result, error } = await supabase
      .rpc('update_contractor_status', {
        p_claimant_id: claimant_id,
        p_status: status
      });

    if (error) {
      console.error('Update status error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update status' },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      status: result.status,
      updated_at: result.updated_at
    });

  } catch (error) {
    console.error('Update contractor status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}