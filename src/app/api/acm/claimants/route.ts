import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkApiAccess, AccessPatterns } from '../../../../middleware/accessControl';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ACM Implementation Example - Claimants API
 * Demonstrates role-based access control per the Access Control Matrix
 */

export async function GET(request: NextRequest) {
  try {
    // Check access permissions based on ACM
    const accessDenied = await checkApiAccess(request, AccessPatterns.authenticatedRead, '/api/claimants');
    if (accessDenied) return accessDenied;

    // Extract user context from headers (set by access control middleware)
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing user context' }, { status: 500 });
    }

    // Set session variables for RLS
    await supabase.rpc('set_session_user', {
      user_id: userId,
      user_role: userRole
    });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Build base query - RLS will automatically filter based on role
    let query = supabase
      .from('claimants')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: claimants, error, count } = await query;

    if (error) {
      console.error('Error fetching claimants:', error);
      return NextResponse.json({ error: 'Failed to fetch claimants' }, { status: 500 });
    }

    // Log successful access for audit
    await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_action: 'CLAIMANTS_READ',
      p_metadata: {
        count: claimants?.length || 0,
        search_term: search,
        page: page
      }
    });

    return NextResponse.json({
      claimants: claimants || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      userRole // Include for frontend to adjust UI
    });

  } catch (error) {
    console.error('Claimants API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admin and manager can create claimants
    const accessDenied = await checkApiAccess(request, AccessPatterns.managerUp, '/api/claimants');
    if (accessDenied) return accessDenied;

    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing user context' }, { status: 500 });
    }

    // Set session variables for RLS
    await supabase.rpc('set_session_user', {
      user_id: userId,
      user_role: userRole
    });

    const claimantData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'amount'];
    for (const field of requiredFields) {
      if (!claimantData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Add metadata
    const newClaimant = {
      ...claimantData,
      created_by: userId,
      status: 'new',
      date_collected: new Date().toISOString()
    };

    const { data: claimant, error } = await supabase
      .from('claimants')
      .insert([newClaimant])
      .select()
      .single();

    if (error) {
      console.error('Error creating claimant:', error);
      return NextResponse.json({ error: 'Failed to create claimant' }, { status: 500 });
    }

    // Log creation for audit
    await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_action: 'CLAIMANT_CREATED',
      p_metadata: {
        claimant_id: claimant.id,
        claimant_name: claimant.name,
        amount: claimant.amount
      }
    });

    return NextResponse.json({ 
      success: true, 
      claimant,
      message: 'Claimant created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create claimant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check update permissions - varies by role
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role') as 'admin' | 'manager' | 'contractor' | 'client';

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing user context' }, { status: 401 });
    }

    // Set session variables for RLS
    await supabase.rpc('set_session_user', {
      user_id: userId,
      user_role: userRole
    });

    const updateData = await request.json();
    const claimantId = updateData.id;

    if (!claimantId) {
      return NextResponse.json({ error: 'Claimant ID required' }, { status: 400 });
    }

    // Different roles have different update permissions per ACM
    let allowedFields: string[] = [];
    
    switch (userRole) {
      case 'admin':
      case 'manager':
        // Full update access
        allowedFields = Object.keys(updateData);
        break;
        
      case 'contractor':
        // Can only update notes and status for assigned claimants
        allowedFields = ['contractor_notes', 'status_contractor', 'last_contacted'];
        
        // Verify claimant is assigned to this contractor
        const { data: assignment } = await supabase
          .from('claimants')
          .select('assigned_to')
          .eq('id', claimantId)
          .single();
        
        if (!assignment || assignment.assigned_to !== userId) {
          return NextResponse.json({ error: 'Not assigned to this claimant' }, { status: 403 });
        }
        break;
        
      case 'client':
        // Clients cannot update claimant records
        return NextResponse.json({ error: 'Clients cannot update claimant records' }, { status: 403 });
        
      default:
        return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    // Filter update data to only allowed fields
    const filteredUpdate = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdate).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add audit metadata
    filteredUpdate.updated_at = new Date().toISOString();
    if (userRole === 'contractor') {
      filteredUpdate.last_contacted = new Date().toISOString();
    }

    const { data: updatedClaimant, error } = await supabase
      .from('claimants')
      .update(filteredUpdate)
      .eq('id', claimantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating claimant:', error);
      return NextResponse.json({ error: 'Failed to update claimant' }, { status: 500 });
    }

    // Log update for audit
    await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_action: 'CLAIMANT_UPDATED',
      p_metadata: {
        claimant_id: claimantId,
        updated_fields: Object.keys(filteredUpdate),
        user_role: userRole
      }
    });

    return NextResponse.json({
      success: true,
      claimant: updatedClaimant,
      message: 'Claimant updated successfully'
    });

  } catch (error) {
    console.error('Update claimant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only admin can delete claimants per ACM
    const accessDenied = await checkApiAccess(request, AccessPatterns.adminOnly, '/api/claimants');
    if (accessDenied) return accessDenied;

    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing user context' }, { status: 500 });
    }

    // Set session variables for RLS
    await supabase.rpc('set_session_user', {
      user_id: userId,
      user_role: userRole
    });

    const { searchParams } = new URL(request.url);
    const claimantId = searchParams.get('id');

    if (!claimantId) {
      return NextResponse.json({ error: 'Claimant ID required' }, { status: 400 });
    }

    // Soft delete by updating status
    const { data: deletedClaimant, error } = await supabase
      .from('claimants')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deleted_by: userId
      })
      .eq('id', claimantId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting claimant:', error);
      return NextResponse.json({ error: 'Failed to delete claimant' }, { status: 500 });
    }

    // Log deletion for audit
    await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_action: 'CLAIMANT_DELETED',
      p_metadata: {
        claimant_id: claimantId,
        claimant_name: deletedClaimant.name
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Claimant deleted successfully'
    });

  } catch (error) {
    console.error('Delete claimant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}