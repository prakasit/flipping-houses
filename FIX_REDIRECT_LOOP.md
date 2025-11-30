# Fix Redirect Loop (ERR_TOO_MANY_REDIRECTS)

## Problem
Browser shows "ERR_TOO_MANY_REDIRECTS" - infinite redirect loop between pages.

## Root Cause
1. Middleware redirects to `/login` when no token
2. `/login` page might redirect back
3. Creates infinite loop

## Solution Applied

### 1. Simplified Middleware
- Removed complex database queries from middleware
- Use `withAuth` properly with `req.nextauth.token`
- Only check token.status if available
- Don't redirect if already on auth pages

### 2. Fixed JWT Callback
- Added `trigger` parameter to handle session updates
- Always fetch fresh user data when needed
- Ensure token has status and role

### 3. Authorized Callback
- Always allow auth pages and API routes
- Only require token for protected pages

## Code Changes

### Middleware (Simplified)
```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // Only check status if token exists
    if (token?.status && token.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/login?error=inactive', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/invite');
        const isApiRoute = pathname.startsWith('/api');
        
        // Always allow auth pages
        if (isAuthPage || isApiRoute) return true;
        
        // Require token for other pages
        return !!token;
      },
    },
  }
);
```

## Testing Steps

1. **Clear Browser Cache**:
   - Clear cookies for localhost:3000
   - Or use incognito/private mode

2. **Restart Dev Server**:
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

3. **Try Accessing**:
   - `/login` - Should work without redirect
   - `/dashboard` - Should redirect to `/login` if not authenticated
   - After login - Should redirect to `/dashboard` successfully

## Important Notes

- Middleware now uses `req.nextauth.token` directly (from withAuth)
- No database queries in middleware (faster, no loop risk)
- JWT callback ensures token has status/role
- Auth pages are always allowed (no redirect loop)

## If Still Having Issues

1. Check browser console for errors
2. Check server logs for Prisma errors
3. Verify user exists in database with ACTIVE status
4. Try deleting all cookies for localhost:3000

