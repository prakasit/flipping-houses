# Fix Authentication Errors

## Problems Fixed

### 1. PrismaAdapter Error
**Error**: `Cannot read properties of undefined (reading 'findUnique')`

**Cause**: PrismaAdapter requires NextAuth models (Account, Session, VerificationToken) in the Prisma schema, but they were missing.

**Solution**: Added the required models to `packages/db/prisma/schema.prisma`:
- `Account` model for OAuth accounts
- `Session` model for user sessions
- `VerificationToken` model for email verification
- Updated `User` model to include relations and `emailVerified` field

### 2. Metadata Warnings
**Warning**: `Unsupported metadata themeColor is configured in metadata export`

**Cause**: Next.js 14 requires `themeColor` and `viewport` to be in a separate `viewport` export, not in `metadata`.

**Solution**: 
- Moved `themeColor` and `viewport` from `metadata` to a new `viewport` export in `apps/web/app/layout.tsx`
- Updated imports to include `Viewport` type

## Next Steps

After these fixes, you need to:

1. **Regenerate Prisma Client**:
   ```bash
   cd packages/db
   pnpm prisma generate
   cd ../..
   ```

2. **Push Schema to Database** (if needed):
   ```bash
   cd packages/db
   pnpm prisma db push
   cd ../..
   ```

3. **Restart Dev Server**:
   ```bash
   pnpm dev
   ```

## Schema Changes

The following models were added to support NextAuth:

```prisma
model Account {
  // OAuth account information
}

model Session {
  // User session tokens
}

model VerificationToken {
  // Email verification tokens
}
```

The `User` model was updated to:
- Add `emailVerified` field
- Add relations to `Account[]` and `Session[]`

## Verification

After regenerating Prisma client, verify:
- No more "Cannot read properties of undefined" errors
- No more metadata warnings
- Authentication flow works correctly
- Admin email auto-creation works

