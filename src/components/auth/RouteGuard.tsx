"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export function RouteGuard({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: RouteGuardProps) {
  const { user, loading, session } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authorization when auth state changes
    authCheck();
  }, [user, loading]);

  function authCheck() {
    if (loading) {
      return; // Still loading
    }

    if (requireAuth && !user) {
      // User not authenticated
      router.push('/auth/login');
      return;
    }

    if (allowedRoles.length > 0 && user) {
      // Check role-based access
      const userRole = user.user_metadata?.role || 'user';
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role
        router.push('/unauthorized');
        return;
      }
    }

    setAuthorized(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}