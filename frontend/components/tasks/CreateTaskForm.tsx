'use client';

/**
 * CreateTaskForm component for creating new tasks.
 * Handles title (required) and description (optional) fields with validation.
 */

import { useState, FormEvent } from 'react';
import { tasksApi, ApiError } from '@/lib/api';
import type { CreateTaskRequest, Task } from '@/lib/types';
import { useToast } from '@/lib/toast';

interface CreateTaskFormProps {
  onTaskCreated?: (task: Task) => void;
}

export default function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const { success, error: showErrorToast } = useToast();
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation (required)
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Description validation (optional, but check length if provided)
    if (formData.description && formData.description.trim().length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data (remove description if empty)
      const taskData: CreateTaskRequest = {
        title: formData.title.trim(),
      };

      if (formData.description && formData.description.trim()) {
        taskData.description = formData.description.trim();
      }

      // Call create task API
      const response = await tasksApi.createTask(taskData);

      // Show success toast
      success('Task created successfully!');

      // Reset form
      setFormData({ title: '', description: '' });
      setErrors({});

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(response.data.task);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        showErrorToast(error.message);
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setApiError(errorMsg);
        showErrorToast(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create New Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              setErrors({ ...errors, title: '' });
              setApiError('');
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter task title"
            disabled={isLoading}
            maxLength={200}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Description <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setErrors({ ...errors, description: '' });
              setApiError('');
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-vertical ${
              errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter task description (optional)"
            disabled={isLoading}
            maxLength={1000}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {(formData.description || '').length}/1000 characters
          </p>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating task...
            </span>
          ) : (
            'Create Task'
          )}
        </button>
      </form>
    </div>
  );
}
