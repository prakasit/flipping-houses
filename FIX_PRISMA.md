# Fix: Cannot find module '.prisma/client/default'

## Problem
The error occurs because Prisma client hasn't been generated yet in the pnpm workspace.

## Solution

Run these commands in order:

```bash
# 1. Make sure you're in the root directory
cd /Users/admin/Documents/data/personal/flipping-houses

# 2. Install all dependencies (this will also run postinstall)
pnpm install

# 3. Explicitly generate Prisma client
pnpm --filter @renovate-tracker/db prisma generate

# 4. Verify Prisma client was generated
ls packages/db/node_modules/.prisma/client

# 5. Restart your Next.js dev server
# Stop the current server (Ctrl+C) and run:
pnpm dev
```

## Alternative: Generate from db package directory

```bash
cd packages/db
pnpm prisma generate
cd ../..
pnpm dev
```

## Verify It Works

After generating, you should see:
- `packages/db/node_modules/.prisma/client/index.d.ts` exists
- `packages/db/node_modules/.prisma/client/index.js` exists
- No more "Cannot find module" errors

## Why This Happens

In pnpm workspaces:
1. Prisma client must be generated in `packages/db` directory
2. The `postinstall` script in `packages/db/package.json` will auto-generate after `pnpm install`
3. Next.js needs the Prisma client to be generated before it can import `@renovate-tracker/db`

## Prevention

The `postinstall` script in `packages/db/package.json` will automatically generate Prisma client after each `pnpm install`. However, if you're starting fresh, you may need to run `prisma generate` manually the first time.

