'use client';

/**
 * TaskList component for displaying all user tasks.
 * Fetches tasks from API, handles loading/error states, and shows empty state.
 */

import { useState, useEffect } from 'react';
import { tasksApi, ApiError } from '@/lib/api';
import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  refreshTrigger?: number;
}

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch tasks from API
   */
  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await tasksApi.getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle task update
   */
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  /**
   * Handle task deletion
   */
  const handleTaskDeleted = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  /**
   * Add new task to the list (for optimistic updates)
   */
  const addTask = (newTask: Task) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  // Fetch tasks on mount and when refreshTrigger changes
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first task to get started!
          </p>
        </div>
      </div>
    );
  }

  // Task list
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Tasks
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <button
            onClick={fetchTasks}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Refresh tasks"
            title="Refresh tasks"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Task Grid - Responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        ))}
      </div>
    </div>
  );
}
