import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '../../../../lib/supabaseClient';
import jwt from 'jsonwebtoken';

interface VerifyInvitationRequest {
  invite_token: string;
  temp_password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyInvitationRequest = await request.json();
    const { invite_token, temp_password } = body;

    // Validate input
    if (!invite_token || !temp_password) {
      return NextResponse.json(
        { success: false, error: 'Missing invite token or temporary password' },
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

    // Check invitation in database
    const { data: invitation, error } = await supabase
      .from('portal_invitations')
      .select('*')
      .eq('user_id', decoded.uid)
      .eq('temp_password', temp_password.trim())
      .gt('expires_at', new Date().toISOString())
      .is('used_at', null)
      .single();

    if (error || !invitation) {
      console.error('Invitation verification error:', error);
      
      // Log failed attempt
      await supabase.rpc('log_portal_event', {
        p_action: 'INVITATION_VERIFICATION_FAILED',
        p_actor_id: null,
        p_target_id: decoded.uid,
        p_target_email: decoded.email,
        p_details: { reason: 'Invalid credentials or expired invitation' },
        p_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || null,
        p_user_agent: request.headers.get('user-agent') || null
      });

      return NextResponse.json(
        { success: false, error: 'Invalid temporary password or expired invitation' },
        { status: 400 }
      );
    }

    // Log successful verification
    await supabase.rpc('log_portal_event', {
      p_action: 'INVITATION_TEMP_PASSWORD_VERIFIED',
      p_actor_id: invitation.user_id,
      p_target_id: invitation.user_id,
      p_target_email: invitation.email,
      p_details: { 
        invitation_id: invitation.id,
        role: invitation.role 
      },
      p_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || null,
      p_user_agent: request.headers.get('user-agent') || null
    });

    return NextResponse.json({
      success: true,
      message: 'Temporary password verified',
      data: {
        user_id: invitation.user_id,
        email: invitation.email,
        role: invitation.role
      }
    });

  } catch (error) {
    console.error('Verify invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}