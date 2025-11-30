import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/invite');
  const isApiRoute = pathname.startsWith('/api');

  console.log('[Middleware] Running for:', pathname);

  // Always allow auth pages and API routes - NO REDIRECT
  if (isAuthPage || isApiRoute) {
    console.log('[Middleware] Allowing auth/api page:', pathname);
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log('[Middleware] Token:', token ? 'exists' : 'missing', token?.email);

  // If no token, redirect to login
  if (!token || !token.email) {
    console.log('[Middleware] No token or email, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check if user is active (from JWT token)
  if (token.status !== 'ACTIVE') {
    console.log('[Middleware] User not active:', token.status, 'redirecting to login');
    return NextResponse.redirect(new URL('/login?error=inactive', req.url));
  }

  // Check admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute && token.role !== 'ADMIN') {
    console.log('[Middleware] Not admin, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  console.log('[Middleware] ✅ Allowing access to:', pathname, 'User:', token.email, 'Status:', token.status);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

