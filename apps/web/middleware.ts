import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/invite');
    const isApiRoute = pathname.startsWith('/api');
    const isStaticFile = pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/);

    // Always allow auth pages, API routes, and static files
    if (isAuthPage || isApiRoute || isStaticFile) {
      return NextResponse.next();
    }

    // Check for session token cookie (Edge Runtime safe)
    const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                        req.cookies.get('__Secure-next-auth.session-token')?.value;

    // If no session token, redirect to login
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If session token exists, allow request through
    // The actual authentication and authorization will be done in page components using getServerSession
    return NextResponse.next();
  } catch (error) {
    // On any error, allow request through to avoid breaking the app
    // The page/API route will handle authentication
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

