import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check if user is admin or manager
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !['admin', 'manager'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action, userIds } = await request.json();

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Action and userIds are required' }, { status: 400 });
    }

    let results = [];

    switch (action) {
      case 'activate':
        for (const userId of userIds) {
          const { error } = await supabase
            .rpc('update_user_status', {
              p_user_id: userId,
              p_status: 'active',
              p_updated_by: user.id
            });

          if (!error) {
            results.push({ userId, success: true });
          } else {
            results.push({ userId, success: false, error: error.message });
          }
        }
        break;

      case 'deactivate':
        for (const userId of userIds) {
          const { error } = await supabase
            .rpc('update_user_status', {
              p_user_id: userId,
              p_status: 'suspended',
              p_updated_by: user.id
            });

          if (!error) {
            results.push({ userId, success: true });
          } else {
            results.push({ userId, success: false, error: error.message });
          }
        }
        break;

      case 'reset_password':
        // In a real implementation, this would trigger password reset emails
        for (const userId of userIds) {
          // Log the password reset action
          const { error } = await supabase
            .rpc('log_user_activity', {
              p_user_id: userId,
              p_action: 'USER_PASSWORD_RESET',
              p_metadata: { initiated_by: user.id }
            });

          if (!error) {
            results.push({ userId, success: true });
          } else {
            results.push({ userId, success: false, error: error.message });
          }
        }
        break;

      case 'delete':
        // Only admins can delete users
        if (userData.role !== 'admin') {
          return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 });
        }

        for (const userId of userIds) {
          // Soft delete by setting status to expired and clearing sensitive data
          const { error } = await supabase
            .from('users')
            .update({ 
              status: 'expired',
              email: `deleted_${Date.now()}@example.com`,
              name: 'Deleted User'
            })
            .eq('id', userId);

          // Log the deletion
          await supabase
            .rpc('log_user_activity', {
              p_user_id: userId,
              p_action: 'USER_REMOVE',
              p_metadata: { deleted_by: user.id }
            });

          if (!error) {
            results.push({ userId, success: true });
          } else {
            results.push({ userId, success: false, error: error.message });
          }
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log bulk action
    await supabase
      .rpc('log_user_activity', {
        p_user_id: user.id,
        p_action: 'BULK_ACTION',
        p_metadata: { 
          action, 
          user_count: userIds.length,
          successful: results.filter(r => r.success).length
        }
      });

    return NextResponse.json({ 
      success: true, 
      results,
      processed: userIds.length,
      successful: results.filter(r => r.success).length
    });

  } catch (error) {
    console.error('Bulk users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}