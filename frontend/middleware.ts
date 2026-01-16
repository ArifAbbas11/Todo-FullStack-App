import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for basic route handling.
 * Note: Since we're using localStorage for token storage (client-side only),
 * actual authentication checks are performed client-side in the page components.
 * This middleware primarily handles route matching and could be extended
 * for cookie-based auth in the future.
 */

export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Client-side route guards in pages will handle authentication redirects
  return NextResponse.next();
}

// Configure which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
