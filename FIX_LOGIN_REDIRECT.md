# Fix Login Redirect Issue

## Problem
After clicking "Login with Google", the user is redirected back to the login page instead of the dashboard.

## Root Causes

1. **PrismaAdapter Conflict**: We were trying to create users manually in `signIn` callback, but PrismaAdapter also creates users automatically, causing conflicts.

2. **User Status Not Updated**: After PrismaAdapter creates a user, the role and status weren't being updated immediately, causing middleware to block access.

3. **Missing Redirect Callback**: No explicit redirect handling after successful authentication.

## Solutions Applied

### 1. Use Events Instead of Manual Creation
- Removed manual user creation from `signIn` callback
- Added `events.createUser` to update admin user after PrismaAdapter creates it
- Added `events.signIn` to ensure admin user is always active

### 2. Added Redirect Callback
- Added `redirect` callback to properly handle post-login redirects
- Ensures users are redirected to `/dashboard` after successful login

### 3. Improved Session Callback
- Always fetch fresh user data from database in session callback
- Ensures role and status are always up-to-date

## Code Changes

### Before
```typescript
async signIn({ user, account }) {
  // Manually creating user - conflicts with PrismaAdapter
  if (!existingUser) {
    await prisma.user.create({ ... });
  }
}
```

### After
```typescript
events: {
  async createUser({ user }) {
    // Update after PrismaAdapter creates user
    if (user.email === 'prakasit.aho@gmail.com') {
      await prisma.user.update({ ... });
    }
  },
},
callbacks: {
  async redirect({ url, baseUrl }) {
    // Proper redirect handling
    return `${baseUrl}/dashboard`;
  },
}
```

## Testing

After these changes:
1. Login with `prakasit.aho@gmail.com` should:
   - Create user automatically (via PrismaAdapter)
   - Update role to ADMIN and status to ACTIVE (via events)
   - Redirect to `/dashboard` successfully

2. Login with other emails should:
   - Check if user exists
   - Check if user is ACTIVE
   - Redirect to `/dashboard` if valid
   - Show error if invalid

## Next Steps

1. **Regenerate Prisma Client** (if schema changed):
   ```bash
   cd packages/db
   pnpm prisma generate
   ```

2. **Restart Dev Server**:
   ```bash
   pnpm dev
   ```

3. **Test Login Flow**:
   - Try logging in with admin email
   - Verify redirect to dashboard
   - Check user is created with correct role/status

