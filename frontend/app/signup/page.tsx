import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up - Todo App',
  description: 'Create a new account to manage your tasks',
};

/**
 * Signup page - allows users to create a new account
 */
export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start managing your tasks efficiently
          </p>
        </div>

        {/* Signup Form */}
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
