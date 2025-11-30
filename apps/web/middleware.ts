import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/invite');
  const isApiRoute = pathname.startsWith('/api');

  // Always allow auth pages and API routes
  if (isAuthPage || isApiRoute) {
    return NextResponse.next();
  }

  try {
    // Check if NEXTAUTH_SECRET is set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('[Middleware] NEXTAUTH_SECRET is not set');
      return NextResponse.redirect(new URL('/login?error=Configuration', req.url));
    }

    // Get JWT token from cookie
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token, redirect to login
    if (!token || !token.email) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check if user is active (from JWT token)
    if (token.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/login?error=inactive', req.url));
    }

    // Check admin routes
    const isAdminRoute = pathname.startsWith('/admin');
    if (isAdminRoute && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Log error but don't expose details
    console.error('[Middleware] Error:', error instanceof Error ? error.message : 'Unknown error');
    // Redirect to login on error
    return NextResponse.redirect(new URL('/login?error=Configuration', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

