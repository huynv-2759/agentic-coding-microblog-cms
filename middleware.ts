/**
 * Next.js Middleware for Authentication
 * 
 * Protects admin routes and updates Supabase session.
 * Runs on all /admin/* routes except /admin/login.
 * 
 * Flow:
 * 1. Check if user is authenticated
 * 2. Verify user role from JWT
 * 3. Redirect to login if not authenticated
 * 4. Return 403 if insufficient permissions
 * 5. Update session if needed
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protected route configurations
 */
const PROTECTED_ROUTES = {
  // Routes that require any admin role (admin or author)
  ADMIN_ONLY: ['/admin/dashboard', '/admin/posts', '/admin/profile'],
  
  // Routes that require super_admin role
  SUPER_ADMIN_ONLY: ['/admin/users', '/admin/settings'],
  
  // Public admin routes (no auth required)
  PUBLIC: ['/admin/login'],
};

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') && 
         !PROTECTED_ROUTES.PUBLIC.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires super admin
 */
function requiresSuperAdmin(pathname: string): boolean {
  return PROTECTED_ROUTES.SUPER_ADMIN_ONLY.some(route => pathname.startsWith(route));
}

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    redirectUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check user role
  const userRole = user.user_metadata?.role || 'reader';
  
  // Check if user has required permissions
  const hasAdminRole = ['admin', 'author', 'super_admin'].includes(userRole);
  const hasSuperAdminRole = userRole === 'super_admin';

  // Block readers from all admin routes
  if (!hasAdminRole) {
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to access this page.',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Block non-super-admins from super-admin-only routes
  if (requiresSuperAdmin(pathname) && !hasSuperAdminRole) {
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'This page requires super admin privileges.',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
};
