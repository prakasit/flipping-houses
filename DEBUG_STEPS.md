# Debug Steps - Login Redirect Issue

## Current Situation
- User login successful (user updated to ACTIVE)
- Session created
- Redirect callback called multiple times (redirect loop)
- No middleware logs visible

## Debug Steps

### 1. Check Console Logs
After restarting server, look for:
- `[Middleware] Running for:` - Should appear for every request
- `[Middleware] Token:` - Should show if token exists
- `[Middleware] ✅ Allowing access` - Should appear for /dashboard

### 2. If No Middleware Logs
This means middleware is not being called. Check:
- Middleware file is in correct location: `apps/web/middleware.ts`
- Matcher pattern is correct
- Next.js version supports middleware

### 3. If Middleware Shows "No token"
This means `withAuth` is not providing token. Possible causes:
- Session not created properly
- Token not in cookie
- Database strategy issue

### 4. Quick Test
Try accessing `/dashboard` directly after login:
- If it works → redirect callback issue
- If it redirects → middleware issue

## Expected Logs After Login

```
[Middleware] Running for: /dashboard Token: exists
[Middleware] Token email: prakasit.aho@gmail.com
[Middleware] User check: { email: '...', user: { status: 'ACTIVE', role: 'ADMIN' } }
[Middleware] ✅ Allowing access to: /dashboard
```

## If Still Not Working

1. **Check Database**:
   ```sql
   SELECT email, status, role FROM "User" WHERE email = 'prakasit.aho@gmail.com';
   ```
   Must show: status = 'ACTIVE'

2. **Check Session Cookie**:
   - Open browser DevTools → Application → Cookies
   - Look for `next-auth.session-token`
   - Should exist after login

3. **Clear Everything**:
   ```bash
   # Clear browser cookies
   # Restart server
   pnpm dev
   ```

4. **Try Incognito Mode**:
   - Fresh session, no cached cookies

