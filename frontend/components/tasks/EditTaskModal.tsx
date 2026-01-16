'use client';

/**
 * EditTaskModal component for editing task details.
 * Provides a modal dialog with form fields for title and description.
 * Implements accessibility features including focus trap and keyboard navigation.
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { tasksApi, ApiError } from '@/lib/api';
import type { Task, UpdateTaskRequest } from '@/lib/types';
import { useToast } from '@/lib/toast';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

export default function EditTaskModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: EditTaskModalProps) {
  const { success, error: showErrorToast } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description || '');
      setError('');
      setValidationError('');

      // Focus title input when modal opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, task]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, onClose]);

  // Focus trap implementation
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), textarea:not(:disabled)'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Title is required');
      return false;
    }

    if (title.trim().length > 200) {
      setValidationError('Title must be 200 characters or less');
      return false;
    }

    if (description.trim().length > 1000) {
      setValidationError('Description must be 1000 characters or less');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const updateData: UpdateTaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
      };

      const response = await tasksApi.updateTask(task.id, updateData);

      // Show success toast
      success('Task updated successfully!');

      // Notify parent component
      onTaskUpdated(response.data.task);

      // Close modal
      onClose();
    } catch (error) {
      const errorMsg = error instanceof ApiError
        ? error.message
        : 'Failed to update task. Please try again.';
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking overlay (but not the modal content)
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onKeyDown={handleTabKey}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="edit-task-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Edit Task
          </h2>
          <button
            ref={firstFocusableRef}
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
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
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title Field */}
          <div>
            <label
              htmlFor="edit-task-title-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="edit-task-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError('');
              }}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter task title"
              maxLength={200}
              required
              aria-required="true"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'title-error' : undefined}
            />
            {validationError && (
              <p
                id="title-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {validationError}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="edit-task-description-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="edit-task-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
              placeholder="Enter task description (optional)"
              rows={4}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Cancel
            </button>
            <button
              ref={lastFocusableRef}
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
