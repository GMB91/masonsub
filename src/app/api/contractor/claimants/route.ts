import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get contractor's assigned claimants
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
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

    // Set session variable for RLS
    await supabase.rpc('set_session_variable', {
      name: 'user.role',
      value: userRole
    });

    // Get assigned claimants with contractor notes
    const { data: claimants, error: claimantsError } = await supabase
      .from('claimants')
      .select(`
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        postcode,
        amount,
        status_contractor,
        last_contacted,
        contractor_updated_at,
        contractor_notes!contractor_notes_claimant_id_fkey (
          note_text
        )
      `)
      .eq('assigned_to', user.id)
      .order('contractor_updated_at', { ascending: false });

    if (claimantsError) {
      console.error('Claimants fetch error:', claimantsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch assigned claimants' },
        { status: 500 }
      );
    }

    // Transform the data to include contractor notes
    const transformedClaimants = (claimants || []).map(claimant => ({
      id: claimant.id,
      name: claimant.name,
      email: claimant.email,
      phone: claimant.phone,
      address: claimant.address,
      city: claimant.city,
      state: claimant.state,
      postcode: claimant.postcode,
      amount: claimant.amount,
      status_contractor: claimant.status_contractor || 'uncontacted',
      last_contacted: claimant.last_contacted,
      contractor_updated_at: claimant.contractor_updated_at,
      contractor_note: claimant.contractor_notes?.[0]?.note_text || ''
    }));

    return NextResponse.json({
      success: true,
      claimants: transformedClaimants,
      total: transformedClaimants.length,
      summary: {
        uncontacted: transformedClaimants.filter(c => c.status_contractor === 'uncontacted').length,
        qualified: transformedClaimants.filter(c => c.status_contractor === 'qualified').length,
        not_interested: transformedClaimants.filter(c => c.status_contractor === 'not_interested').length,
        follow_up_later: transformedClaimants.filter(c => c.status_contractor === 'follow_up_later').length
      }
    });

  } catch (error) {
    console.error('Contractor claimants API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}