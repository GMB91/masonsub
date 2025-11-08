"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../lib/supabaseClient';

export type UserRole = 'admin' | 'manager' | 'contractor' | 'client';

export interface AuthUser extends User {
  role?: UserRole;
  full_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasRouteAccess: (route: string) => boolean;
  devSignIn: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based route access configuration
const ROLE_ROUTES = {
  admin: ['/admin', '/contractor', '/client'],
  manager: ['/admin', '/contractor', '/client'],
  contractor: ['/contractor'],
  client: ['/client']
};

// Default dashboard routes for each role
export const DEFAULT_DASHBOARDS = {
  admin: '/admin/dashboard',
  manager: '/admin/dashboard',
  contractor: '/contractor/dashboard',
  client: '/client/dashboard'
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Only create Supabase client in production to avoid multiple instances
  const supabase = process.env.NODE_ENV === 'production' ? getSupabaseClient() : null;

  // Get user role from metadata
  const getUserRole = (user: User | null): UserRole => {
    if (!user) return 'client';
    return (user.user_metadata?.role || 
            user.app_metadata?.role || 
            'client') as UserRole;
  };

  // Enhance user object with role and name
  const enhanceUser = (user: User | null): AuthUser | null => {
    if (!user) return null;
    
    return {
      ...user,
      role: getUserRole(user),
      full_name: user.user_metadata?.full_name || 
                 user.user_metadata?.name || 
                 user.email?.split('@')[0] || 
                 'Unknown User'
    };
  };

  // Load user on mount and set up auth state listener
  useEffect(() => {
    const getInitialUser = async () => {
      try {
        // In development, check for mock user first
        if (process.env.NODE_ENV === 'development') {
          const mockUserData = localStorage.getItem('mason-vector-dev-user');
          if (mockUserData) {
            const mockUser = JSON.parse(mockUserData);
            setUser(mockUser);
            setLoading(false);
            return;
          }
          // In development without mock user, just set null user
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(enhanceUser(user));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes (skip in development with mock user)
    let subscription: any = null;
    
    if (supabase && (process.env.NODE_ENV !== 'development' || !localStorage.getItem('mason-vector-dev-user'))) {
      const authListener = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          setUser(enhanceUser(session?.user || null));
          setLoading(false);
        }
      );
      subscription = authListener.data.subscription;
    }

    return () => subscription?.unsubscribe();
  }, []);

  // Refresh user data
  const refreshUser = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const mockUserData = localStorage.getItem('mason-vector-dev-user');
        if (mockUserData) {
          const mockUser = JSON.parse(mockUserData);
          setUser(mockUser);
        }
        return;
      }
      
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(enhanceUser(user));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear dev user in development
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem('mason-vector-dev-user');
        setUser(null);
        return;
      }
      
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check if user has specific role(s)
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Check if user has access to a route
  const hasRouteAccess = (route: string): boolean => {
    if (!user?.role) return false;
    
    const userRoutes = ROLE_ROUTES[user.role] || [];
    return userRoutes.some(allowedRoute => 
      route.startsWith(allowedRoute)
    );
  };

  // Development sign-in function
  const devSignIn = async (role: UserRole): Promise<void> => {
    const mockUser: AuthUser = {
      id: `dev-${role}-${Date.now()}`,
      email: `${role}@dev.masonvector.com`,
      role,
      full_name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: { role },
      user_metadata: { 
        full_name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role 
      }
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('mason-vector-dev-user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    refreshUser,
    hasRole,
    hasRouteAccess,
    devSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for route protection
interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackRoute?: string;
}

export function RouteGuard({ 
  children, 
  allowedRoles = [], 
  fallbackRoute = '/auth/login' 
}: RouteGuardProps) {
  const { user, loading, hasRole } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated - redirect to login
      setRedirecting(true);
      window.location.href = '/auth/login';
      return;
    }

    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
      // Not authorized - redirect to their default dashboard
      setRedirecting(true);
      const defaultRoute = user.role ? DEFAULT_DASHBOARDS[user.role] : '/client/dashboard';
      window.location.href = `${defaultRoute}?unauthorized=true`;
      return;
    }
  }, [user, loading, hasRole, allowedRoles]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}