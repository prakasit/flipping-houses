'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDeviceInfo } from '@renovate-tracker/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/projects', label: 'Projects', icon: '💰' },
  { href: '/withdraws', label: 'Withdraws', icon: '💸' },
  { href: '/expenses', label: 'Expenses', icon: '📝' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const device = getDeviceInfo();
      setIsMobile(device.isMobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Hide on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/invite')) {
    return null;
  }

  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

