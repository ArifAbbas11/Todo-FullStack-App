import type { Metadata } from 'next';
import SigninForm from '@/components/auth/SigninForm';

export const metadata: Metadata = {
  title: 'Sign In - Todo App',
  description: 'Sign in to access your tasks',
};

/**
 * Signin page - allows users to authenticate and access their tasks
 */
export default function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Signin Form */}
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <SigninForm />
        </div>
      </div>
    </div>
  );
}
