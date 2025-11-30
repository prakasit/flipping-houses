# Renovate Expense Tracker

A complete expense tracking system for renovation projects built with Next.js 14, Turborepo, and Vercel services.

## 🚀 Features

- ✅ Google Authentication (NextAuth)
- ✅ Email Invite System (Resend)
- ✅ Budget Management
- ✅ Withdraw Request & Approval
- ✅ Expense Tracking
- ✅ Slip Upload (Vercel Blob)
- ✅ Difference Calculation (Withdraw vs Expenses)
- ✅ User Access Control (ADMIN / USER)
- ✅ PWA Support (Installable on mobile)
- ✅ Mobile Responsive with Bottom Navigation
- ✅ Dashboard with Summaries

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Monorepo**: Turborepo
- **Database**: Vercel Postgres (Prisma ORM)
- **File Storage**: Vercel Blob
- **Email**: Resend
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS
- **PWA**: next-pwa
- **Type Safety**: TypeScript

## 🏗️ Project Structure

```
renovate-tracker/
├── apps/
│   └── web/              # Next.js 14 PWA Application
├── packages/
│   ├── db/               # Prisma schema & client
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utility functions
├── package.json
└── turbo.json
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Vercel account (free tier)
- Google OAuth credentials
- Resend account (free tier)

### 2. Clone and Install

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### 3. Database Setup (Vercel Postgres)

1. Go to your Vercel dashboard
2. Create a new Postgres database (free tier: 256MB)
3. Copy the connection string (DATABASE_URL)

### 4. Environment Variables

Create `.env.local` in the root directory using `env.example` as a template:

```bash
cp env.example .env.local
# Then edit .env.local with your actual values
```

Or create `.env.local` manually with these variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

#### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### Get Resend API Key:
1. Sign up at [Resend](https://resend.com) (free tier: 100 emails/day)
2. Create an API key
3. Set up a domain or use `onboarding@resend.dev` for testing

#### Get Vercel Blob Token:
1. Go to Vercel dashboard → Storage
2. Create a Blob store (free tier: 5GB)
3. Copy the read/write token

### 5. Database Migration

```bash
# Generate Prisma client
pnpm --filter @renovate-tracker/db prisma generate

# Push schema to database
pnpm --filter @renovate-tracker/db prisma db push

# Or run migrations
pnpm --filter @renovate-tracker/db prisma migrate dev
```

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 👤 Creating First Admin User

After setting up the database:

1. Go to your database and manually create a user record:
   - Set `status = 'ACTIVE'`
   - Set `role = 'ADMIN'`
   - Add your email

2. Or use the invite system:
   - First, manually create one ADMIN user in the database
   - Sign in with that account
   - Use the Profile page to invite other users

## 📱 PWA Setup

The app is already configured as a PWA:

- **Mobile**: Install from browser menu "Add to Home Screen"
- **Desktop**: Install prompt will appear (Chrome/Edge)

Icons needed:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)

Replace the placeholder icons with actual images.

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production URL
   - Update Google OAuth redirect URI to production

5. Install Vercel Postgres:
   - Go to Storage tab in Vercel project
   - Add Postgres database
   - Copy DATABASE_URL to environment variables

6. Install Vercel Blob:
   - Go to Storage tab
   - Add Blob store
   - Copy BLOB_READ_WRITE_TOKEN to environment variables

### 3. Build Configuration

Vercel will auto-detect Next.js. The build command is:
```
pnpm build
```

Root directory: Leave empty or set to repository root.

### 4. Post-Deployment

After first deployment:

```bash
# Run migrations in production
vercel env pull .env.production
# Then run migrations manually or via Vercel CLI
```

Or use Vercel's dashboard to run:
```bash
pnpm --filter @renovate-tracker/db prisma db push
```

## 📚 API Routes

- `POST /api/invite` - Send invite (ADMIN only)
- `GET /api/invite/activate?token=xxx` - Activate account
- `POST /api/budget` - Create budget
- `GET /api/budget` - List budgets
- `GET /api/budget/[id]/summary` - Budget summary
- `POST /api/withdraw` - Create withdraw request
- `GET /api/withdraw` - List withdraws
- `PATCH /api/withdraw/[id]/status` - Update withdraw status (ADMIN)
- `POST /api/expense` - Create expense
- `GET /api/expense` - List expenses
- `POST /api/slip/upload` - Upload expense slip
- `GET /api/dashboard/stats` - Dashboard statistics

## 🎨 Pages

- `/login` - Google sign-in
- `/invite?token=xxx` - Activate account
- `/dashboard` - Overview with stats
- `/budgets` - List all budgets
- `/budgets/[id]` - Budget details
- `/withdraws` - List withdraw requests
- `/withdraws/[id]` - Withdraw details & approval
- `/expenses` - List expenses
- `/expenses/[id]` - Expense details & slip upload
- `/expenses/new` - Create new expense
- `/profile` - User profile & invite (if ADMIN)

## 🔒 User Roles

- **ADMIN**: Can approve/reject withdraws, send invites
- **USER**: Can create budgets, withdraws, expenses

## 📊 Status Logic

**Withdraw Status:**
- `PENDING` - Awaiting approval
- `APPROVED` - Approved by admin
- `REJECTED` - Rejected by admin

**Expense Status (calculated):**
- `NEED_SLIP` - Withdrawn amount > expenses (difference > 0)
- `OK` - Withdrawn amount = expenses (difference = 0)
- `OVERSPENT` - Expenses > withdrawn amount (difference < 0)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if Vercel Postgres is active
- Run `pnpm --filter @renovate-tracker/db prisma db push` to sync schema

### Authentication Issues
- Verify Google OAuth credentials
- Check redirect URIs match
- Ensure NEXTAUTH_SECRET is set

### File Upload Issues
- Verify BLOB_READ_WRITE_TOKEN is set
- Check Vercel Blob store is active
- Verify file size limits

### Email Issues
- Check Resend API key
- Verify RESEND_FROM_EMAIL domain
- Check Resend dashboard for delivery status

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

