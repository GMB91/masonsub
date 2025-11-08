import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '../../../../lib/supabaseClient';
import jwt from 'jsonwebtoken';

interface CompleteInvitationRequest {
  invite_token: string;
  temp_password: string;
  new_password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteInvitationRequest = await request.json();
    const { invite_token, temp_password, new_password } = body;

    // Validate input
    if (!invite_token || !temp_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const hasUppercase = /[A-Z]/.test(new_password);
    const hasLowercase = /[a-z]/.test(new_password);
    const hasNumbers = /\d/.test(new_password);

    if (!(hasUppercase && hasLowercase && hasNumbers)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      decoded = jwt.verify(invite_token, secret);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation token' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Use database function to complete invitation
    const { data: result, error: dbError } = await supabase
      .rpc('use_portal_invitation', {
        p_invite_token: invite_token,
        p_temp_password: temp_password.trim(),
        p_new_password: new_password
      });

    if (dbError) {
      console.error('Database error completing invitation:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to complete invitation: ' + dbError.message },
        { status: 500 }
      );
    }

    // Create Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: result.email,
      password: new_password,
      email_confirm: true,
      user_metadata: {
        role: result.role,
        full_name: result.full_name,
        created_via: 'portal_invitation',
        invitation_completed_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      
      // Log the failure
      await supabase.rpc('log_portal_event', {
        p_action: 'AUTH_USER_CREATION_FAILED',
        p_actor_id: result.user_id,
        p_target_id: result.user_id,
        p_target_email: result.email,
        p_details: { 
          error: authError.message,
          role: result.role 
        },
        p_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || null,
        p_user_agent: request.headers.get('user-agent') || null
      });

      return NextResponse.json(
        { success: false, error: 'Failed to create user account: ' + authError.message },
        { status: 500 }
      );
    }

    // Log successful account creation
    await supabase.rpc('log_portal_event', {
      p_action: 'PORTAL_ACCOUNT_CREATED',
      p_actor_id: authUser.user.id,
      p_target_id: authUser.user.id,
      p_target_email: authUser.user.email,
      p_details: { 
        role: result.role,
        invitation_id: decoded.invitation_id,
        auth_user_id: authUser.user.id
      },
      p_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || null,
      p_user_agent: request.headers.get('user-agent') || null
    });

    // Generate session for immediate login
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.user.email!
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user_id: authUser.user.id,
        email: authUser.user.email,
        role: result.role,
        dashboard_url: getDashboardUrl(result.role),
        // Don't include session data for security - user should login normally
      }
    });

  } catch (error) {
    console.error('Complete invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case 'admin':
    case 'manager':
      return '/admin/dashboard';
    case 'contractor':
      return '/contractor/dashboard';
    case 'client':
    default:
      return '/client/dashboard';
  }
}