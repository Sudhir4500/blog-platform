import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the public paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session_access_token')?.value;

  // Allow access to static files
  const isStaticFile =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(.*)$/); // matches .css, .js, .png, etc.

  if (isStaticFile) {
    return NextResponse.next();
  }

  // Check if the path is a public path
  const isPublic = PUBLIC_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If user is authenticated and trying to access public paths, redirect to dashboard
  if (token && isPublic) {
    const dashboardUrl = new URL('/profile', request.url); // Redirect to dashboard or another protected route
    return NextResponse.redirect(dashboardUrl);
  }

  // If no token and path is protected, redirect to login
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // Optional: to redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated or accessing allowed content
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
      Middleware applies to all routes EXCEPT:
      - /api/* (API routes)
      - /_next/static/*, /favicon.ico, etc.
    */
    '/((?!api|_next/static|favicon.ico).*)',
  ],
};