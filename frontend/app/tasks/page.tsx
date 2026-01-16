'use client';

/**
 * Tasks page - displays user's task list (protected route).
 * Integrates CreateTaskForm and TaskList components for full task management.
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import TaskList from '@/components/tasks/TaskList';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const taskListRef = useRef<HTMLDivElement>(null);

  // Track when component has mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Client-side route protection
  useEffect(() => {
    if (isMounted && !isAuthenticated()) {
      router.push('/signin');
    }
  }, [isMounted, router]);

  /**
   * Handle task creation - refresh the task list
   */
  const handleTaskCreated = (task: Task) => {
    // Trigger task list refresh
    setRefreshTrigger((prev) => prev + 1);

    // Scroll to task list to show the new task
    if (taskListRef.current) {
      taskListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Show loading state until component is mounted and we can check auth
  if (!isMounted || !isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your daily tasks and stay organized
          </p>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="space-y-8">
          {/* Create Task Form */}
          <div className="w-full">
            <CreateTaskForm onTaskCreated={handleTaskCreated} />
          </div>

          {/* Task List */}
          <div ref={taskListRef} className="w-full">
            <TaskList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
