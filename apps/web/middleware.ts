import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge Runtime compatible middleware - no Node.js APIs
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Always allow auth pages, API routes, and static files
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/invite');
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/.test(pathname);

  if (isAuthPage || isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // Check for session token cookie (Edge Runtime safe - no Node.js APIs)
  const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                      req.cookies.get('__Secure-next-auth.session-token')?.value;

  // If no session token, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If session token exists, allow request through
  // The actual authentication and authorization will be done in page components using getServerSession
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
  runtime: 'nodejs',
};

