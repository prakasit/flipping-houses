# Quick Fix - Login Redirect Issue

## Problem
User login successfully but keeps redirecting back to login page.

## Root Cause
- Middleware checks `token.status` but token may not have it when using database strategy
- Need to fetch user status from database directly

## Solution
Middleware now:
1. Allows auth pages and API routes (no redirect)
2. Checks if token exists
3. Fetches user from database to get fresh status
4. Only redirects if user is not ACTIVE

## What Changed

### Middleware
- Uses `req.nextauth.token` from `withAuth`
- Fetches user from database to check status
- No redirect loop because auth pages are always allowed

### Auth Flow
- `signIn` callback: Updates admin user to ACTIVE
- `session` callback: Always fetches fresh user data
- `redirect` callback: Redirects to dashboard after login

## Testing

1. **Clear everything**:
   ```bash
   # Clear browser cookies for localhost:3000
   # Or use incognito mode
   ```

2. **Restart server**:
   ```bash
   # Stop (Ctrl+C) and restart
   pnpm dev
   ```

3. **Login with prakasit.aho@gmail.com**:
   - Should create/update user to ACTIVE
   - Should redirect to /dashboard
   - Should NOT redirect back to /login

## Debugging

If still not working, check:

1. **Database**: User exists with status = 'ACTIVE'?
   ```sql
   SELECT email, status, role FROM "User" WHERE email = 'prakasit.aho@gmail.com';
   ```

2. **Console logs**: Check for Prisma errors

3. **Network tab**: Check redirect chain in browser DevTools

## Expected Flow

```
User clicks login
  ↓
Google OAuth
  ↓
Callback: /api/auth/callback/google
  ↓
signIn callback: Updates user to ACTIVE
  ↓
redirect callback: /dashboard
  ↓
Middleware: Checks user.status = ACTIVE ✅
  ↓
Dashboard page loads ✅
```

