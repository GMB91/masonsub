/**
 * Notification Tray API Endpoints
 * Handles notification tray operations and management
 * Author: Mason Vector System
 * Date: November 7, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '../../../../lib/supabaseClient';

// Request schemas
const markReadSchema = z.object({
  alertId: z.string().uuid(),
});

const markAllReadSchema = z.object({
  userId: z.string().uuid(),
});

const updatePreferencesSchema = z.object({
  userId: z.string().uuid(),
  preferences: z.object({
    show_previews: z.boolean().optional(),
    play_sound: z.boolean().optional(),
    tray_auto_open: z.boolean().optional(),
    max_tray_items: z.number().int().min(1).max(50).optional(),
    quiet_hours_start: z.string().nullable().optional(),
    quiet_hours_end: z.string().nullable().optional(),
  })
});

const createSystemAlertSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  preview: z.string().min(1).max(500),
  actionType: z.enum(['message', 'system', 'alert', 'reminder', 'warning']).optional(),
  actionUrl: z.string().url().optional(),
});

const bulkCreateSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
  title: z.string().min(1).max(200),
  preview: z.string().min(1).max(500),
  actionType: z.enum(['message', 'system', 'alert', 'reminder', 'warning']).optional(),
  actionUrl: z.string().url().optional(),
});

// GET /api/notifications/tray - Get user's notification alerts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const onlyUnread = searchParams.get('onlyUnread') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('message_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    const { data: alerts, error: alertsError } = await query;

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get user preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculate unread count
    const { count: unreadCount } = await supabase
      .from('message_alerts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    return NextResponse.json({
      alerts: alerts || [],
      preferences: preferences || {
        show_previews: true,
        play_sound: true,
        tray_auto_open: false,
        max_tray_items: 20
      },
      unreadCount: unreadCount || 0,
      totalCount: alerts?.length || 0
    });

  } catch (error) {
    console.error('GET /api/notifications/tray error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/tray - Handle various notification operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'markRead':
        return await handleMarkRead(body);
      case 'markAllRead':
        return await handleMarkAllRead(body);
      case 'updatePreferences':
        return await handleUpdatePreferences(body);
      case 'createSystemAlert':
        return await handleCreateSystemAlert(body);
      case 'bulkCreate':
        return await handleBulkCreate(body);
      case 'trackTrayView':
        return await handleTrackTrayView(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/notifications/tray error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark single alert as read
async function handleMarkRead(body: any) {
  const validation = markReadSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { alertId } = validation.data;

  const { error } = await supabase
    .from('message_alerts')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', alertId);

  if (error) {
    console.error('Error marking alert as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark alert as read' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// Mark all alerts as read for user
async function handleMarkAllRead(body: any) {
  const validation = markAllReadSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { userId } = validation.data;

  const { error } = await supabase
    .from('message_alerts')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all alerts as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark alerts as read' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// Update user notification preferences
async function handleUpdatePreferences(body: any) {
  const validation = updatePreferencesSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { userId, preferences } = validation.data;

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// Create system alert
async function handleCreateSystemAlert(body: any) {
  const validation = createSystemAlertSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { userId, title, preview, actionType = 'system', actionUrl } = validation.data;

  const { data, error } = await supabase.rpc('create_system_alert', {
    p_user_id: userId,
    p_title: title,
    p_preview_text: preview,
    p_action_type: actionType,
    p_action_url: actionUrl
  });

  if (error) {
    console.error('Error creating system alert:', error);
    return NextResponse.json(
      { error: 'Failed to create system alert' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, alertId: data });
}

// Bulk create alerts for multiple users
async function handleBulkCreate(body: any) {
  const validation = bulkCreateSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { userIds, title, preview, actionType = 'system', actionUrl } = validation.data;

  const results = await Promise.allSettled(
    userIds.map(userId => 
      supabase.rpc('create_system_alert', {
        p_user_id: userId,
        p_title: title,
        p_preview_text: preview,
        p_action_type: actionType,
        p_action_url: actionUrl
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return NextResponse.json({
    success: true,
    results: {
      successful,
      failed,
      total: userIds.length
    }
  });
}

// Track tray viewing for audit
async function handleTrackTrayView(body: any) {
  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const { data } = await supabase.rpc('mark_alerts_viewed', { 
      p_user_id: userId 
    });

    return NextResponse.json({ success: true, viewedCount: data });
  } catch (error) {
    console.error('Error tracking tray view:', error);
    return NextResponse.json(
      { error: 'Failed to track tray view' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/tray - Clear or cleanup notifications
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'clear';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'clear':
        // Clear all alerts for user
        const { error: clearError } = await supabase
          .from('message_alerts')
          .delete()
          .eq('user_id', userId);

        if (clearError) throw clearError;
        return NextResponse.json({ success: true, message: 'All notifications cleared' });

      case 'cleanup':
        // Run cleanup function
        const { data: cleanupData, error: cleanupError } = await supabase
          .rpc('cleanup_old_notification_alerts');

        if (cleanupError) throw cleanupError;
        return NextResponse.json({ 
          success: true, 
          message: 'Cleanup completed',
          deletedCount: cleanupData 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('DELETE /api/notifications/tray error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}