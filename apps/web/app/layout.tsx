import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Renovate Expense Tracker',
  description: 'Track renovation expenses and budgets',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flipping Houses',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icon-57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icon-60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icon-72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icon-76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icon-114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icon-120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flipping Houses" />
        <meta name="application-name" content="Flipping Houses" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icon-144.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <OfflineIndicator />
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}

