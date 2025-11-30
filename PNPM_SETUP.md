# pnpm Workspace Setup Guide

This project uses **pnpm workspaces** with Turborepo. Follow these steps to get started.

## Prerequisites

- Node.js 18+
- pnpm 8+ (install with: `npm install -g pnpm`)

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the root and all workspace packages.

### 2. Generate Prisma Client

```bash
cd packages/db
pnpm prisma generate
```

Or from root:
```bash
pnpm --filter @renovate-tracker/db prisma generate
```

### 3. Set Up Database

Create `.env.local` in the root directory (see `env.example`):

```bash
DATABASE_URL="postgresql://..."
```

Then push the schema:
```bash
cd packages/db
pnpm prisma db push
```

### 4. Run Development Server

From root:
```bash
pnpm dev
```

Or from apps/web:
```bash
cd apps/web
pnpm dev
```

## Workspace Structure

```
/
├── apps/
│   └── web/              # Next.js 14 app
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities
└── pnpm-workspace.yaml   # Workspace configuration
```

## Workspace Dependencies

Internal packages use `workspace:*` protocol:

```json
{
  "dependencies": {
    "@renovate-tracker/db": "workspace:*",
    "@renovate-tracker/types": "workspace:*",
    "@renovate-tracker/utils": "workspace:*"
  }
}
```

## Prisma Client Usage

**Always import Prisma from the workspace package:**

```typescript
// ✅ Correct
import { prisma } from '@renovate-tracker/db';

// ❌ Wrong - Don't import directly
import { PrismaClient } from '@prisma/client';
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Run dev for all packages
pnpm dev

# Run command in specific package
pnpm --filter @renovate-tracker/db prisma generate
pnpm --filter @renovate-tracker/web dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint
```

## Troubleshooting

### "Cannot find module '@prisma/client'"

1. Make sure you've generated Prisma client:
   ```bash
   cd packages/db
   pnpm prisma generate
   ```

2. Check that `packages/db/package.json` has Prisma dependencies

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### "Cannot find module '@renovate-tracker/db'"

1. Make sure pnpm-workspace.yaml exists
2. Run `pnpm install` from root
3. Check that package names match exactly

### Prisma Client Not Found in Next.js

1. Ensure Prisma is generated: `cd packages/db && pnpm prisma generate`
2. Check that `apps/web/package.json` has `@renovate-tracker/db: "workspace:*"`
3. Restart Next.js dev server

## Notes

- Prisma client is generated in `packages/db/node_modules/.prisma/client`
- Always import from `@renovate-tracker/db`, never directly from `@prisma/client`
- Use `workspace:*` for all internal package dependencies
- External packages (like `next`, `react`) use regular version numbers

