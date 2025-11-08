import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define role-based route access
const roleRoutes = {
  admin: ['/admin/**', '/contractor/**', '/client/**'], // Admin can access all
  manager: ['/admin/**', '/contractor/**', '/client/**'], // Manager can access all
  contractor: ['/contractor/**'], // Contractor only their section
  client: ['/client/**'] // Client only their section
};

// Default redirects for each role
const defaultRedirects = {
  admin: '/admin/dashboard',
  manager: '/admin/dashboard', 
  contractor: '/contractor/dashboard',
  client: '/client/dashboard'
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup', 
  '/auth/callback',
  '/auth/dev-login',
  '/api/auth/**'
];

// API routes (handled separately)
const apiRoutes = ['/api/**'];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('/**')) {
      return pathname.startsWith(route.slice(0, -3));
    }
    return pathname === route;
  });
}

function isApiRoute(pathname: string): boolean {
  return apiRoutes.some(route => {
    if (route.endsWith('/**')) {
      return pathname.startsWith(route.slice(0, -3));
    }
    return pathname === route;
  });
}

function hasRouteAccess(userRole: string, pathname: string): boolean {
  const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
  
  return allowedRoutes.some(route => {
    if (route.endsWith('/**')) {
      return pathname.startsWith(route.slice(0, -3));
    }
    return pathname === route;
  });
}

function getUserRole(user: any): string {
  return user?.user_metadata?.role || user?.app_metadata?.role || 'client';
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for API routes (they handle their own auth)
    if (isApiRoute(pathname)) {
      return NextResponse.next();
    }

    // Skip middleware for public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // In development mode, skip authentication checks for easier testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    // Get session token from cookies
    const response = NextResponse.next();
    const sessionToken = request.cookies.get('supabase-auth-token')?.value;

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Create Supabase client for token validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    // If no user or error, redirect to login
    if (!user || error) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = getUserRole(user);

    // Special handling for root dashboard redirect
    if (pathname === '/dashboard') {
      const defaultRedirect = defaultRedirects[userRole as keyof typeof defaultRedirects] || '/client/dashboard';
      return NextResponse.redirect(new URL(defaultRedirect, request.url));
    }

    // Check if user has access to the requested route
    if (!hasRouteAccess(userRole, pathname)) {
      // Redirect to user's default dashboard if they don't have access
      const defaultRedirect = defaultRedirects[userRole as keyof typeof defaultRedirects] || '/client/dashboard';
      
      // Add a query parameter to show an unauthorized message
      const redirectUrl = new URL(defaultRedirect, request.url);
      redirectUrl.searchParams.set('unauthorized', 'true');
      redirectUrl.searchParams.set('attempted', pathname);
      
      return NextResponse.redirect(redirectUrl);
    }

    // User is authenticated and has access - continue
    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // In case of error, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'middleware_error');
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};