'use client';

/**
 * Header component with navigation and sign out functionality.
 * Displays user email and provides sign out button.
 */

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuthUser, clearAuth, isAuthenticated } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getAuthUser());
    }
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    clearAuth();
    router.push('/signin');
  };

  // Don't render on auth pages or before mounting (to avoid hydration mismatch)
  if (!mounted || pathname === '/signin' || pathname === '/signup') {
    return null;
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Todo App
            </h1>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* User Email */}
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              aria-label="Sign out"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
