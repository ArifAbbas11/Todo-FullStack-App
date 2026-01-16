'use client';

/**
 * DeleteConfirmModal component for confirming task deletion.
 * Provides a modal dialog with confirmation message and action buttons.
 * Implements accessibility features including focus trap and keyboard navigation.
 */

import { useState, useEffect, useRef } from 'react';
import { tasksApi, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface DeleteConfirmModalProps {
  taskId: string;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskDeleted: (taskId: string) => void;
}

export default function DeleteConfirmModal({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onTaskDeleted,
}: DeleteConfirmModalProps) {
  const { success, error: showErrorToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
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
  }, [isOpen, isDeleting, onClose]);

  // Focus trap implementation
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button:not(:disabled)'
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
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);

    try {
      await tasksApi.deleteTask(taskId);

      // Show success toast
      success('Task deleted successfully!');

      // Notify parent component
      onTaskDeleted(taskId);

      // Close modal
      onClose();
    } catch (error) {
      const errorMsg = error instanceof ApiError
        ? error.message
        : 'Failed to delete task. Please try again.';
      setError(errorMsg);
      showErrorToast(errorMsg);
      setIsDeleting(false);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    if (!isDeleting) {
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
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      aria-describedby="delete-confirm-description"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        onKeyDown={handleTabKey}
      >
        {/* Modal Header */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Warning Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>

            <div className="flex-1">
              <h2
                id="delete-confirm-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                Delete Task
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="mb-6">
            <p
              id="delete-confirm-description"
              className="text-gray-600 dark:text-gray-300 mb-2"
            >
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                {taskTitle}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Cancel
            </button>
            <button
              ref={deleteButtonRef}
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
            >
              {isDeleting ? (
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
                  Deleting...
                </>
              ) : (
                'Delete Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
