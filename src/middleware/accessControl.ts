import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Access Control Matrix (ACM) Definition
export interface AccessRule {
  resource: string;
  admin: string[];
  manager: string[];
  contractor: string[];
  client: string[];
}

export const ACCESS_CONTROL_MATRIX: AccessRule[] = [
  {
    resource: '/api/users',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_SELF'],
    client: ['R_SELF']
  },
  {
    resource: '/api/auth',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_OWN', 'W_OWN'],
    client: ['R_OWN', 'W_OWN']
  },
  {
    resource: '/api/claimants',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_ASSIGNED', 'W_NOTES'],
    client: ['R_SELF']
  },
  {
    resource: '/api/claims',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_ASSIGNED'],
    client: ['R_SELF']
  },
  {
    resource: '/api/tasks',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_OWN', 'W_OWN'],
    client: []
  },
  {
    resource: '/api/timesheets',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_OWN', 'W_OWN'],
    client: []
  },
  {
    resource: '/api/documents',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: [],
    client: ['R_OWN', 'W_OWN']
  },
  {
    resource: '/api/messages',
    admin: ['R', 'W', 'D'],
    manager: ['R', 'W'],
    contractor: ['R_ADMIN_ONLY', 'W_ADMIN_ONLY'],
    client: ['R_ADMIN_ONLY', 'W_ADMIN_ONLY']
  },
  {
    resource: '/api/email-templates',
    admin: ['R', 'W'],
    manager: ['R'],
    contractor: [],
    client: []
  },
  {
    resource: '/api/sms-templates',
    admin: ['R', 'W'],
    manager: ['R'],
    contractor: ['R'],
    client: []
  },
  {
    resource: '/api/audit',
    admin: ['R', 'W'],
    manager: ['R'],
    contractor: [],
    client: []
  },
  {
    resource: '/api/admin-chat',
    admin: ['R', 'W'],
    manager: ['R'],
    contractor: [],
    client: []
  },
  {
    resource: '/api/policies',
    admin: ['R', 'W'],
    manager: ['R'],
    contractor: ['R'],
    client: ['R']
  },
  {
    resource: '/api/create-portal',
    admin: ['R', 'W'],
    manager: [],
    contractor: [],
    client: []
  },
  {
    resource: '/api/sentinel',
    admin: ['R'],
    manager: ['R'],
    contractor: [],
    client: []
  },
  {
    resource: '/api/tester',
    admin: ['R', 'W'],
    manager: ['R', 'W'],
    contractor: [],
    client: []
  }
];

export type UserRole = 'admin' | 'manager' | 'contractor' | 'client';
export type Permission = 'R' | 'W' | 'D' | 'R_SELF' | 'W_SELF' | 'R_OWN' | 'W_OWN' | 'R_ASSIGNED' | 'W_NOTES' | 'R_ADMIN_ONLY' | 'W_ADMIN_ONLY';

/**
 * Core Access Control Guard - Middleware for API endpoint protection
 */
export class AccessControlGuard {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Verify user has required permissions for endpoint access
   */
  async checkAccess(
    request: NextRequest, 
    requiredPermissions: Permission[],
    resourcePath?: string
  ): Promise<{
    allowed: boolean;
    user?: any;
    role?: UserRole;
    reason?: string;
  }> {
    try {
      // Extract JWT token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return { allowed: false, reason: 'No authorization header' };
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await this.supabase.auth.getUser(token);
      
      if (authError || !user) {
        return { allowed: false, reason: 'Invalid token' };
      }

      // Get user role from database
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('role, status, assigned_contractor')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return { allowed: false, reason: 'User not found' };
      }

      const userRole = userData.role as UserRole;
      const userStatus = userData.status;

      // Check if user is active
      if (userStatus !== 'active') {
        return { allowed: false, reason: 'User account not active' };
      }

      // Find ACM rule for the resource
      const pathname = new URL(request.url).pathname;
      const acmRule = this.findAccessRule(resourcePath || pathname);
      
      if (!acmRule) {
        // Default deny for unknown resources
        return { allowed: false, reason: 'Resource not in ACM' };
      }

      // Get allowed permissions for user role
      const allowedPermissions = acmRule[userRole] || [];

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(required => 
        allowedPermissions.includes(required)
      );

      if (!hasPermission) {
        return { 
          allowed: false, 
          role: userRole,
          reason: `Role ${userRole} lacks required permissions: ${requiredPermissions.join(', ')}` 
        };
      }

      return {
        allowed: true,
        user: user,
        role: userRole
      };

    } catch (error) {
      console.error('Access control check failed:', error);
      return { allowed: false, reason: 'Internal error' };
    }
  }

  /**
   * Find the appropriate ACM rule for a resource path
   */
  private findAccessRule(pathname: string): AccessRule | null {
    // Find exact match first
    let rule = ACCESS_CONTROL_MATRIX.find(rule => rule.resource === pathname);
    
    if (rule) return rule;

    // Find parent path match
    for (const acmRule of ACCESS_CONTROL_MATRIX) {
      if (pathname.startsWith(acmRule.resource)) {
        rule = acmRule;
        break;
      }
    }

    return rule || null;
  }

  /**
   * Log access attempt for audit trail
   */
  async logAccess(
    userId: string,
    resource: string,
    action: string,
    allowed: boolean,
    reason?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await this.supabase
        .rpc('log_user_activity', {
          p_user_id: userId,
          p_action: allowed ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
          p_ip_address: ipAddress,
          p_metadata: {
            resource,
            action,
            reason: reason || 'Success',
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  }
}

/**
 * Middleware function for route-level access control
 */
export function withRoleAccess(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const guard = new AccessControlGuard();
    
    // Map roles to basic permissions
    const requiredPermissions: Permission[] = allowedRoles.includes('admin') ? ['R', 'W', 'D'] : ['R'];
    
    const accessCheck = await guard.checkAccess(request, requiredPermissions);
    
    if (!accessCheck.allowed) {
      // Log denied access
      if (accessCheck.user) {
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';
        await guard.logAccess(
          accessCheck.user.id,
          new URL(request.url).pathname,
          request.method,
          false,
          accessCheck.reason,
          clientIP
        );
      }

      return NextResponse.json(
        { error: 'Access denied', reason: accessCheck.reason },
        { status: 403 }
      );
    }

    // Check role-specific access
    if (!allowedRoles.includes(accessCheck.role!)) {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await guard.logAccess(
        accessCheck.user!.id,
        new URL(request.url).pathname,
        request.method,
        false,
        `Role ${accessCheck.role} not in allowed roles: ${allowedRoles.join(', ')}`,
        clientIP
      );

      return NextResponse.json(
        { error: 'Insufficient role permissions' },
        { status: 403 }
      );
    }

    // Log successful access
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    await guard.logAccess(
      accessCheck.user!.id,
      new URL(request.url).pathname,
      request.method,
      true,
      'Access granted',
      clientIP
    );

    // Continue to the actual handler
    return NextResponse.next();
  };
}

/**
 * API helper for checking specific permissions
 */
export async function checkApiAccess(
  request: NextRequest,
  requiredPermissions: Permission[],
  resourcePath?: string
): Promise<NextResponse | null> {
  const guard = new AccessControlGuard();
  const accessCheck = await guard.checkAccess(request, requiredPermissions, resourcePath);
  
  if (!accessCheck.allowed) {
    return NextResponse.json(
      { error: 'Access denied', reason: accessCheck.reason },
      { status: 403 }
    );
  }

  // Set user context for database RLS
  if (accessCheck.user && accessCheck.role) {
    // This would be used to set session variables for RLS
    request.headers.set('X-User-ID', accessCheck.user.id);
    request.headers.set('X-User-Role', accessCheck.role);
  }

  return null; // Access granted, continue processing
}

/**
 * Route protection decorator for Next.js API routes
 */
export function protectRoute(allowedPermissions: Permission[]) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(request: NextRequest, ...args: any[]) {
      const accessDenied = await checkApiAccess(request, allowedPermissions);
      if (accessDenied) {
        return accessDenied;
      }
      
      return originalMethod.apply(this, [request, ...args]);
    };
    
    return descriptor;
  };
}

/**
 * Utility functions for common access patterns
 */
export const AccessPatterns = {
  // Admin only access
  adminOnly: ['R', 'W', 'D'] as Permission[],
  
  // Manager and admin access  
  managerUp: ['R', 'W'] as Permission[],
  
  // Read access for all authenticated users
  authenticatedRead: ['R', 'R_SELF', 'R_OWN', 'R_ASSIGNED'] as Permission[],
  
  // Self-service access (own data only)
  selfService: ['R_SELF', 'W_SELF', 'R_OWN', 'W_OWN'] as Permission[],
  
  // Contractor assigned resources
  contractorAssigned: ['R_ASSIGNED', 'W_NOTES'] as Permission[],
  
  // Admin communication channels
  adminCommunication: ['R_ADMIN_ONLY', 'W_ADMIN_ONLY'] as Permission[]
};

export default AccessControlGuard;