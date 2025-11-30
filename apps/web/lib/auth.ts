import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@renovate-tracker/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts by email
    }),
  ],
  events: {
    async createUser({ user }) {
      // After PrismaAdapter creates a new user
      if (user.email === 'prakasit.aho@gmail.com') {
        // Set admin email as ADMIN and ACTIVE
        await prisma.user.update({
          where: { email: user.email },
          data: {
            role: 'ADMIN',
            status: 'ACTIVE',
            activatedAt: new Date(),
          },
        });
      } else {
        // All other users are USER role (default is already USER, but ensure it)
        await prisma.user.update({
          where: { email: user.email },
          data: {
            role: 'USER',
            // Keep existing status (PENDING if invited, or let it be set elsewhere)
          },
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        const email = user.email;
        const isAdminEmail = email === 'prakasit.aho@gmail.com';

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (existingUser) {
          // User exists - check if Account is linked
          const hasGoogleAccount = existingUser.accounts.some(
            (acc: { provider: string; providerAccountId: string }) => acc.provider === 'google' && acc.providerAccountId === account.providerAccountId
          );

          if (!hasGoogleAccount) {
            // Link the Google account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
              },
            });
          }

          // Update admin user - ensure it's ADMIN
          if (isAdminEmail) {
            await prisma.user.update({
              where: { email },
              data: {
                status: 'ACTIVE',
                activatedAt: new Date(),
                role: 'ADMIN',
              },
            });
          } else {
            // For non-admin users:
            // - If user was invited (has invitedAt) and is PENDING, activate them on first login
            // - If user is DISABLED, block sign in
            if (existingUser.status === 'DISABLED') {
              return false; // Block sign in for disabled users
            }
            
            // Activate invited users on first login
            if (existingUser.status === 'PENDING' && existingUser.invitedAt) {
              await prisma.user.update({
                where: { email },
                data: {
                  status: 'ACTIVE',
                  activatedAt: new Date(),
                },
              });
            }
            
            // Ensure non-admin users are USER role (not ADMIN)
            if (existingUser.role === 'ADMIN') {
              await prisma.user.update({
                where: { email },
                data: {
                  role: 'USER',
                },
              });
            }
          }

          return true;
        } else {
          // New user - let PrismaAdapter create it
          if (isAdminEmail) {
            return true; // Allow sign in for admin email
          } else {
            return false; // Block sign in - user doesn't exist
          }
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Don't redirect for static files or API routes
      if (url.includes('/manifest.json') || url.includes('/api/') || url.includes('/_next/')) {
        return url;
      }

      // Redirect to dashboard after successful login
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      // With JWT strategy, token contains the user data
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      // When user signs in, always fetch from database
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
      // On update trigger, refresh from database
      else if (trigger === 'update' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

