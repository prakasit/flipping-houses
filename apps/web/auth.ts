import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@renovate-tracker/db';

// Validate required environment variables
function validateEnv() {
  const required = [
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Only validate in production or when explicitly checking
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Don't throw in middleware - let it fail gracefully
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  events: {
    async createUser({ user }: { user: { email?: string | null } }) {
      if (user.email === 'prakasit.aho@gmail.com') {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            role: 'ADMIN',
            status: 'ACTIVE',
            activatedAt: new Date(),
          },
        });
      } else {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            role: 'USER',
          },
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: { email?: string | null }; account: any; profile?: any }) {
      if (account?.provider === 'google' && user.email) {
        const email = user.email;
        const isAdminEmail = email === 'prakasit.aho@gmail.com';

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true },
          });

          if (existingUser) {
            const hasGoogleAccount = existingUser.accounts.some(
              (acc: { provider: string; providerAccountId: string }) =>
                acc.provider === 'google' &&
                acc.providerAccountId === account.providerAccountId
            );

            if (!hasGoogleAccount) {
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
              if (existingUser.status === 'DISABLED') {
                return false;
              }

              if (existingUser.status === 'PENDING' && existingUser.invitedAt) {
                await prisma.user.update({
                  where: { email },
                  data: {
                    status: 'ACTIVE',
                    activatedAt: new Date(),
                  },
                });
              }

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
            if (isAdminEmail) {
              return true;
            } else {
              return false;
            }
          }
        } catch (error) {
          console.error('SignIn callback error:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes('/manifest.json') || url.includes('/api/') || url.includes('/_next/')) {
        return url;
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
    async jwt({ token, user, account, trigger }: { token: any; user?: any; account?: any; trigger?: string }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      } else if (trigger === 'update' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
        } catch (error) {
          console.error('JWT update callback error:', error);
        }
      }
      return token;
    },
  },
};

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Export for API routes
export { handler as GET, handler as POST };

