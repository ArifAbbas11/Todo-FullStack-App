"""
Task API endpoints.
Handles task CRUD operations with JWT authentication and user isolation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated
from uuid import UUID

from src.core.database import get_session
from src.api.deps import CurrentUser
from src.schemas.task import (
    CreateTaskRequest,
    UpdateTaskRequest,
    TaskResponse,
    TaskListResponse,
    TaskData,
    ErrorResponse
)
from src.services import task as task_service


# ============================================================================
# Router Configuration
# ============================================================================

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Missing or invalid JWT token"
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal server error"
        }
    }
)


# ============================================================================
# Task Endpoints
# ============================================================================

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new task",
    description="Creates a new task for the authenticated user. Title is required, description is optional.",
    responses={
        201: {
            "description": "Task created successfully",
            "model": TaskResponse
        },
        400: {
            "description": "Invalid request data (empty title or exceeds max length)",
            "model": ErrorResponse
        }
    }
)
def create_task(
    request: CreateTaskRequest,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
) -> TaskResponse:
    """
    Create a new task for the authenticated user.

    Security Measures:
    - JWT token required (enforced by CurrentUser dependency)
    - user_id is extracted from JWT token, not from request body
    - Title is validated to not be empty or whitespace-only
    - User can only create tasks for themselves

    Args:
        request: Create task request with title and optional description
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        TaskResponse: Created task data

    Raises:
        HTTPException 400: If validation fails
        HTTPException 401: If JWT token is invalid
        HTTPException 500: If database error occurs
    """
    try:
        # Create task with user_id from JWT token
        # Security: user_id is set from current_user, not from request
        task = task_service.create_task(session, current_user.id, request)

        # Convert task to response schema
        task_data = TaskData.model_validate(task)

        # Return success response
        return TaskResponse(
            data={"task": task_data.model_dump()},
            message="Task created successfully",
            error=None
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions from service layer
        raise e

    except Exception as e:
        # Catch unexpected errors
        # Security: Don't leak internal error details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )


@router.get(
    "",
    response_model=TaskListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all tasks for authenticated user",
    description="Returns all tasks belonging to the authenticated user, ordered by creation date (newest first).",
    responses={
        200: {
            "description": "Tasks retrieved successfully",
            "model": TaskListResponse
        }
    }
)
def list_tasks(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
) -> TaskListResponse:
    """
    Retrieve all tasks for the authenticated user.

    Security Measures:
    - JWT token required (enforced by CurrentUser dependency)
    - Only returns tasks belonging to the authenticated user
    - User isolation enforced at database query level

    Args:
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        TaskListResponse: List of tasks and count

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 500: If database error occurs
    """
    try:
        # Get tasks filtered by user_id
        # Security: user_id from JWT token ensures user isolation
        tasks = task_service.get_user_tasks(session, current_user.id)

        # Convert tasks to response schema
        tasks_data = [TaskData.model_validate(task).model_dump() for task in tasks]

        # Return success response
        message = "Tasks retrieved successfully" if tasks else "No tasks found"
        return TaskListResponse(
            data={
                "tasks": tasks_data,
                "count": len(tasks_data)
            },
            message=message,
            error=None
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions from service layer
        raise e

    except Exception as e:
        # Catch unexpected errors
        # Security: Don't leak internal error details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single task",
    description="Returns a single task if it belongs to the authenticated user.",
    responses={
        200: {
            "description": "Task retrieved successfully",
            "model": TaskResponse
        },
        404: {
            "description": "Task not found or not owned by user",
            "model": ErrorResponse
        }
    }
)
def get_task(
    task_id: UUID,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
) -> TaskResponse:
    """
    Retrieve a single task by ID with ownership verification.

    Security Measures:
    - JWT token required (enforced by CurrentUser dependency)
    - Verifies task belongs to authenticated user
    - Returns 404 if task not found or not owned by user

    Args:
        task_id: Task ID to retrieve
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        TaskResponse: Task data

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or not owned by user
        HTTPException 500: If database error occurs
    """
    try:
        # Get task with ownership verification
        # Security: Verifies task belongs to current_user
        task = task_service.get_task_by_id(session, task_id, current_user.id)

        # Convert task to response schema
        task_data = TaskData.model_validate(task)

        # Return success response
        return TaskResponse(
            data={"task": task_data.model_dump()},
            message="Task retrieved successfully",
            error=None
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions from service layer
        raise e

    except Exception as e:
        # Catch unexpected errors
        # Security: Don't leak internal error details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update task",
    description="Updates task title and/or description. Verifies ownership before updating.",
    responses={
        200: {
            "description": "Task updated successfully",
            "model": TaskResponse
        },
        400: {
            "description": "Invalid request data",
            "model": ErrorResponse
        },
        404: {
            "description": "Task not found or not owned by user",
            "model": ErrorResponse
        }
    }
)
def update_task(
    task_id: UUID,
    request: UpdateTaskRequest,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
) -> TaskResponse:
    """
    Update a task's title and/or description with ownership verification.

    Security Measures:
    - JWT token required (enforced by CurrentUser dependency)
    - Verifies task belongs to authenticated user before updating
    - Title is validated to not be empty or whitespace-only
    - Updates updated_at timestamp automatically

    Args:
        task_id: Task ID to update
        request: Update task request with title and optional description
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        TaskResponse: Updated task data

    Raises:
        HTTPException 400: If validation fails
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or not owned by user
        HTTPException 500: If database error occurs
    """
    try:
        # Update task with ownership verification
        # Security: Verifies task belongs to current_user
        task = task_service.update_task(session, task_id, current_user.id, request)

        # Convert task to response schema
        task_data = TaskData.model_validate(task)

        # Return success response
        return TaskResponse(
            data={"task": task_data.model_dump()},
            message="Task updated successfully",
            error=None
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions from service layer
        raise e

    except Exception as e:
        # Catch unexpected errors
        # Security: Don't leak internal error details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Permanently deletes a task. Verifies ownership before deleting.",
    responses={
        204: {
            "description": "Task deleted successfully (no content)"
        },
        404: {
            "description": "Task not found or not owned by user",
            "model": ErrorResponse
        }
    }
)
def delete_task(
    task_id: UUID,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
) -> None:
    """
    Delete a task with ownership verification.

    Security Measures:
    - JWT token required (enforced by CurrentUser dependency)
    - Verifies task belongs to authenticated user before deleting
    - Permanently deletes task from database

    Args:
        task_id: Task ID to delete
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        None (204 No Content)

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or not owned by user
        HTTPException 500: If database error occurs
    """
    try:
        # Delete task with ownership verification
        # Security: Verifies task belongs to current_user
        task_service.delete_task(session, task_id, current_user.id)

        # Return 204 No Content (no response body)
        return None

    except HTTPException as e:
        # Re-raise HTTP exceptions from service layer
        raise e

    except Exception as e:
        # Catch unexpected errors
        # Security: Don't leak internal error details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )


@router.patch(
    "/{task_id}/toggle",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle task completion status",
    description="Toggles task between completed and incomplete. Verifies ownership before updating.",
    responses={
        200: {
            "description": "Task completion status toggled successfully",
            "model": TaskResponse
        },
        404: {
            "description": "Task not found or not owned by user",
            "model": ErrorResponse
        }
    }
)
def toggle_task(
    task_id: UUID,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
) -> TaskResponse:
    """
    Toggle task completion status with ownership verification.

    Security Measures:
    - JWT token required (enforced by CurrentUser dependency)
    - Verifies task belongs to authenticated user before toggling
    - Updates updated_at timestamp automatically

    Args:
        task_id: Task ID to toggle
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        TaskResponse: Updated task data with toggled completion status

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or not owned by user
        HTTPException 500: If database error occurs
    """
    try:
        # Toggle task completion with ownership verification
        # Security: Verifies task belongs to current_user
        task = task_service.toggle_task_completion(session, task_id, current_user.id)

        # Convert task to response schema
        task_data = TaskData.model_validate(task)

        # Determine message based on new completion status
        message = "Task marked as complete" if task.is_completed else "Task marked as incomplete"

        # Return success response
        return TaskResponse(
            data={"task": task_data.model_dump()},
            message=message,
            error=None
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions from service layer
        raise e

    except Exception as e:
        # Catch unexpected errors
        # Security: Don't leak internal error details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )
