# Fix Middleware Status Check Issue

## Problem
User with `prakasit.aho@gmail.com` can login successfully (queries show user is updated to ACTIVE) but gets redirected back to login page.

## Root Cause
When using `database` strategy in NextAuth:
- Session is stored in database
- JWT token may not have custom fields (role, status) immediately
- Middleware checks `token.status` but it might be undefined

## Solution Applied

### 1. Updated JWT Callback
- Modified to fetch user from database when user signs in
- Sets `token.role` and `token.status` from database
- Ensures token has the necessary fields

### 2. Updated Middleware
- First checks `token.status` if available (from JWT)
- If not available, fetches user from database
- Validates user status before allowing access

## Code Changes

### JWT Callback (auth.ts)
```typescript
async jwt({ token, user, account }) {
  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (dbUser) {
      token.id = dbUser.id;
      token.email = dbUser.email;
      token.role = dbUser.role;
      token.status = dbUser.status;
    }
  }
  return token;
}
```

### Middleware
```typescript
// Check status from token first
let userStatus = token.status as string | undefined;

// If not available, fetch from database
if (!userStatus) {
  const user = await prisma.user.findUnique({
    where: { email: token.email as string },
    select: { status: true, role: true },
  });
  userStatus = user?.status;
}
```

## Testing

After these changes:
1. Login with `prakasit.aho@gmail.com`
2. User should be created/updated to ACTIVE
3. Token should have status set
4. Middleware should allow access
5. Should redirect to `/dashboard` successfully

## Next Steps

1. **Restart Dev Server**:
   ```bash
   # Stop server (Ctrl+C) แล้วรันใหม่
   pnpm dev
   ```

2. **Clear Browser Cache** (optional):
   - Clear cookies for localhost:3000
   - Or use incognito mode

3. **Try Login Again**:
   - Should work now!

