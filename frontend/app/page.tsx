'use client';

/**
 * Home page - redirects users based on authentication status.
 * Authenticated users go to /tasks, unauthenticated users go to /signin.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated()) {
      router.push('/tasks');
    } else {
      router.push('/signin');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
