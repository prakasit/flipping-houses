# Quick Setup Guide

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Environment Variables

Create `.env.local` in the root directory (use `env.example` as template):

```bash
cp env.example .env.local
# Then edit .env.local with your values
```

Or manually create `.env.local` and copy the contents from `env.example`.

Required variables:
- `DATABASE_URL` - Vercel Postgres connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `RESEND_API_KEY` - From Resend dashboard
- `RESEND_FROM_EMAIL` - Your verified email or onboarding@resend.dev
- `BLOB_READ_WRITE_TOKEN` - From Vercel Blob storage

## 3. Set Up Database

```bash
# Generate Prisma client
pnpm --filter @renovate-tracker/db prisma generate

# Push schema to database
pnpm --filter @renovate-tracker/db prisma db push
```

## 4. Create First Admin User

After database is set up, you need to create an admin user manually:

1. Go to your Vercel Postgres database dashboard
2. Open the SQL editor
3. Run:

```sql
INSERT INTO "User" (id, email, role, status, "createdAt", "updatedAt")
VALUES (
  'clxxxxxxxxxxxxx',  -- Generate a CUID or use: gen_random_uuid()::text
  'your-email@example.com',
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
);
```

4. Then sign in with that email via Google OAuth

## 5. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## 6. Invite More Users

Once signed in as admin:
1. Go to `/profile`
2. Enter email addresses
3. Click "Send Invite"
4. Users will receive email with activation link

## Deployment Checklist

Before deploying to Vercel:

- [ ] All environment variables set in Vercel dashboard
- [ ] Database migrated: `pnpm --filter @renovate-tracker/db prisma db push`
- [ ] Google OAuth redirect URI updated for production
- [ ] Replace placeholder PWA icons (icon-192.png, icon-512.png)
- [ ] Update NEXTAUTH_URL to production URL
- [ ] Verify Resend domain (or use onboarding@resend.dev)

