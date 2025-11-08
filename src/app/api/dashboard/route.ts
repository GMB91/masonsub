import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '../../../../lib/supabaseClient';
import { Database } from '../../../types/database.types';

type UserRole = 'admin' | 'manager' | 'contractor' | 'client';

interface DashboardUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

interface ClaimantData {
  id: string;
  full_name: string;
  amount: number | null;
  state: string;
  created_at: string | null;
  updated_at?: string | null;
  email?: string | null;
}

interface ActivityData {
  id: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string | null;
  context?: any;
}

// Helper function to get user from session, validate role, and set session variables
async function getAuthenticatedUser(request: NextRequest): Promise<DashboardUser | null> {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get session from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }

    // Get user role from metadata or profiles table
    const role = user.user_metadata?.role || user.app_metadata?.role || 'client';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User';
    
    const dashboardUser = {
      id: user.id,
      email: user.email || '',
      role: role as UserRole,
      full_name: fullName
    };

    // 🔑 SET SESSION VARIABLES for RLS policies
    await supabase.rpc('set_session_variables', {
      user_id: user.id,
      user_role: role,
      user_email: user.email || ''
    });

    return dashboardUser;
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    return null;
  }
}

// Admin/Manager dashboard data
async function getAdminDashboardData(supabase: any) {
  try {
    // Get overall system statistics
    const { data: claimantStats } = await supabase
      .from('claimants')
      .select('id, state, amount, created_at')
      .order('created_at', { ascending: false });

    const { data: activityStats } = await supabase
      .from('activities')
      .select('id, action, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Calculate metrics
    const totalClaimants = claimantStats?.length || 0;
    const totalValue = claimantStats?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;
    const todayActivity = activityStats?.length || 0;

    // Get claimants by state
    const claimantsByState = claimantStats?.reduce((acc: any, c: any) => {
      acc[c.state] = (acc[c.state] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      totalClaimants,
      totalValue,
      todayActivity,
      claimantsByState,
      recentClaimants: claimantStats?.slice(0, 10) || []
    };
  } catch (error) {
    console.error('Failed to get admin dashboard data:', error);
    throw error;
  }
}

// Contractor dashboard data
async function getContractorDashboardData(supabase: any, userId: string) {
  try {
    // Get assigned claimants (assuming assigned_to field or similar)
    const { data: myClaimants } = await supabase
      .from('claimants')
      .select('id, full_name, amount, state, created_at')
      .eq('created_by', userId) // Using created_by as proxy for assignment
      .order('created_at', { ascending: false });

    // Get my recent activities
    const { data: myActivities } = await supabase
      .from('activities')
      .select('id, action, entity_type, entity_id, created_at')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const myClaimantsCount = myClaimants?.length || 0;
    const myTotalValue = myClaimants?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;
    const myActivitiesCount = myActivities?.length || 0;

    return {
      myClaimantsCount,
      myTotalValue,
      myActivitiesCount,
      assignedClaimants: myClaimants || [],
      recentActivities: myActivities || []
    };
  } catch (error) {
    console.error('Failed to get contractor dashboard data:', error);
    throw error;
  }
}

// Client dashboard data
async function getClientDashboardData(supabase: any, userEmail: string) {
  try {
    // Get claimant records for this client (by email)
    const { data: myClaimants } = await supabase
      .from('claimants')
      .select('id, full_name, amount, state, created_at, updated_at')
      .eq('email', userEmail)
      .order('created_at', { ascending: false });

    // Get activities related to my claimant records
    const claimantIds = myClaimants?.map((c: any) => c.id) || [];
    let myActivities: any[] = [];
    
    if (claimantIds.length > 0) {
      const { data: activities } = await supabase
        .from('activities')
        .select('id, action, entity_type, entity_id, created_at, context')
        .eq('entity_type', 'claimant')
        .in('entity_id', claimantIds)
        .order('created_at', { ascending: false })
        .limit(10);
        
      myActivities = activities || [];
    }

    const myClaimsCount = myClaimants?.length || 0;
    const myTotalAmount = myClaimants?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

    return {
      myClaimsCount,
      myTotalAmount,
      myClaims: myClaimants || [],
      myActivities: myActivities || []
    };
  } catch (error) {
    console.error('Failed to get client dashboard data:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get role
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServiceClient();
    let dashboardData;

    // Route to appropriate dashboard data based on role
    switch (user.role) {
      case 'admin':
      case 'manager':
        dashboardData = await getAdminDashboardData(supabase);
        break;
        
      case 'contractor':
        dashboardData = await getContractorDashboardData(supabase, user.id);
        break;
        
      case 'client':
        dashboardData = await getClientDashboardData(supabase, user.email);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid user role' },
          { status: 403 }
        );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for updating dashboard preferences
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    // Here you could save user dashboard preferences
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard preferences updated'
    });

  } catch (error) {
    console.error('Dashboard preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}