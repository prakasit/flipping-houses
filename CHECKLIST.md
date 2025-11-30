# Pre-Deployment Checklist

## Environment Setup
- [ ] All environment variables configured (see ENV_EXAMPLE.txt)
- [ ] DATABASE_URL points to Vercel Postgres
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXTAUTH_URL set correctly (localhost for dev, production URL for prod)
- [ ] Google OAuth credentials configured
- [ ] Resend API key configured
- [ ] Vercel Blob token configured

## Database
- [ ] Vercel Postgres database created
- [ ] Prisma schema pushed: `npm run db:push`
- [ ] First admin user created manually in database
- [ ] Test connection works

## Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs configured:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://your-domain.vercel.app/api/auth/callback/google`
- [ ] Client ID and Secret added to environment variables

## Resend Email
- [ ] Resend account created
- [ ] API key generated
- [ ] Domain verified OR using onboarding@resend.dev
- [ ] RESEND_FROM_EMAIL configured

## Vercel Blob Storage
- [ ] Blob store created in Vercel dashboard
- [ ] Read/Write token generated
- [ ] BLOB_READ_WRITE_TOKEN added to environment variables

## Assets
- [ ] Replace placeholder icons (icon-192.png, icon-512.png) with actual images
- [ ] Replace placeholder favicon.ico
- [ ] Update manifest.json if needed

## Testing (Local)
- [ ] `npm install` runs successfully
- [ ] `npm run dev` starts without errors
- [ ] Can access login page
- [ ] Google OAuth login works
- [ ] Can create budget (if admin)
- [ ] Can create withdraw request
- [ ] Can approve withdraw (if admin)
- [ ] Can create expense
- [ ] Can upload slip
- [ ] Mobile bottom navigation appears on mobile screens
- [ ] PWA manifest loads correctly

## Deployment
- [ ] Repository pushed to GitHub
- [ ] Vercel project connected to GitHub
- [ ] All environment variables added to Vercel
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Database migrations run in production
- [ ] Admin user can sign in
- [ ] Can send invites
- [ ] File uploads work

## Post-Deployment
- [ ] Test on mobile device
- [ ] Test PWA installation
- [ ] Verify all API endpoints work
- [ ] Check email delivery
- [ ] Monitor error logs

## Security
- [ ] Environment variables not committed to git
- [ ] .env.local in .gitignore
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database connection string is secure
- [ ] File upload size limits configured

---

**Note**: Check off items as you complete them. This ensures nothing is missed before going live.

