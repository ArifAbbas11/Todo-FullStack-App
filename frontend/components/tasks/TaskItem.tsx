'use client';

/**
 * TaskItem component for displaying individual task details.
 * Shows title, description, completion status, and action buttons (edit, delete).
 */

import { useState } from 'react';
import { tasksApi, ApiError } from '@/lib/api';
import type { Task } from '@/lib/types';
import EditTaskModal from './EditTaskModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useToast } from '@/lib/toast';

interface TaskItemProps {
  task: Task;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export default function TaskItem({ task, onTaskUpdated, onTaskDeleted }: TaskItemProps) {
  const { success, error: showErrorToast } = useToast();
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /**
   * Handle task completion toggle
   */
  const handleToggle = async () => {
    setError('');
    setIsToggling(true);

    try {
      const response = await tasksApi.toggleTask(task.id);

      // Show success toast
      success(
        response.data.task.is_completed
          ? 'Task marked as completed!'
          : 'Task marked as incomplete!'
      );

      // Notify parent component
      if (onTaskUpdated) {
        onTaskUpdated(response.data.task);
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError
        ? error.message
        : 'Failed to update task. Please try again.';
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setIsToggling(false);
    }
  };

  /**
   * Handle task update from EditTaskModal
   */
  const handleTaskUpdatedFromModal = (updatedTask: Task) => {
    if (onTaskUpdated) {
      onTaskUpdated(updatedTask);
    }
  };

  /**
   * Handle task deletion from DeleteConfirmModal
   */
  const handleTaskDeletedFromModal = (taskId: string) => {
    if (onTaskDeleted) {
      onTaskDeleted(taskId);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    // Parse the date string as UTC by adding 'Z' if not present
    const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-all">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Completion Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[24px] min-h-[24px]"
            style={{
              borderColor: task.is_completed ? '#10b981' : '#d1d5db',
              backgroundColor: task.is_completed ? '#10b981' : 'transparent',
            }}
            aria-label={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.is_completed && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold mb-1 break-words ${
              task.is_completed
                ? 'text-gray-500 dark:text-gray-400 line-through'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-sm mb-2 break-words whitespace-pre-wrap ${
                task.is_completed
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <time dateTime={task.created_at}>
              Created {formatDate(task.created_at)}
            </time>
            {task.updated_at !== task.created_at && (
              <>
                <span>•</span>
                <time dateTime={task.updated_at}>
                  Updated {formatDate(task.updated_at)}
                </time>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            disabled={isToggling}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Edit task"
            title="Edit task"
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
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isToggling}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Delete task"
            title="Delete task"
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
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={task}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdatedFromModal}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        taskId={task.id}
        taskTitle={task.title}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onTaskDeleted={handleTaskDeletedFromModal}
      />
    </>
  );
}
