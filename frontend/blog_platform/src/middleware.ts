import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the public paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

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

  const isPublic = PUBLIC_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (token && isPublic) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname || '/');
    return NextResponse.redirect(loginUrl);
  }
  

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|favicon.ico).*)',
  ],
};
