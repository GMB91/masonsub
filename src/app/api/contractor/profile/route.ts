import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get contractor profile information
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

    // Get contractor profile from auth.users
    const { data: profile, error: profileError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    const contractorProfile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.raw_user_meta_data?.full_name || profile.email?.split('@')[0] || 'Contractor',
      phone: profile.raw_user_meta_data?.phone || null,
      role: userRole
    };

    return NextResponse.json({
      success: true,
      profile: contractorProfile
    });

  } catch (error) {
    console.error('Contractor profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}