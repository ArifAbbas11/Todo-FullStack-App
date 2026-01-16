"""
Authentication API endpoints.
Handles user signup and signin operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Annotated

from src.core.database import get_session
from src.schemas.auth import (
    SignupRequest,
    SigninRequest,
    AuthResponse,
    UserResponse,
    ErrorResponse
)
from src.services import auth as auth_service


# ============================================================================
# Router Configuration
# ============================================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={
        500: {
            "model": ErrorResponse,
            "description": "Internal server error"
        }
    }
)


# ============================================================================
# Authentication Endpoints
# ============================================================================

@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new user account",
    description="Register a new user with email and password. Returns JWT token on success.",
    responses={
        201: {
            "description": "User created successfully",
            "model": AuthResponse
        },
        400: {
            "description": "Invalid request data (invalid email, weak password, or email already exists)",
            "model": ErrorResponse
        }
    }
)
def signup(
    request: SignupRequest,
    session: Annotated[Session, Depends(get_session)]
) -> AuthResponse:
    """
    Create a new user account.

    Security Validations:
    - Email format validated by Pydantic EmailStr
    - Password minimum length enforced (8 characters)
    - Email uniqueness checked at database level
    - Password hashed with bcrypt before storage

    Args:
        request: Signup request with email and password
        session: Database session

    Returns:
        AuthResponse: User data and JWT token

    Raises:
        HTTPException 400: If email already exists or validation fails
        HTTPException 500: If database error occurs
    """
    try:
        # Create user and generate JWT token
        # Security: Password is hashed, token includes minimal claims
        user, token = auth_service.signup(session, request)

        # Convert user to response schema
        # Security: Never include hashed_password in response
        user_response = UserResponse.model_validate(user)

        # Return success response
        return AuthResponse(
            data={
                "user": user_response.model_dump(),
                "token": token
            },
            message="Account created successfully",
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


@router.post(
    "/signin",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign in existing user",
    description="Authenticate user with email and password. Returns JWT token on success.",
    responses={
        200: {
            "description": "User authenticated successfully",
            "model": AuthResponse
        },
        401: {
            "description": "Invalid credentials (wrong email or password)",
            "model": ErrorResponse
        }
    }
)
def signin(
    request: SigninRequest,
    session: Annotated[Session, Depends(get_session)]
) -> AuthResponse:
    """
    Authenticate an existing user.

    Security Measures:
    - Uses constant-time password comparison (via bcrypt)
    - Returns generic error message to prevent user enumeration
    - Generates new JWT token on each signin

    Args:
        request: Signin request with email and password
        session: Database session

    Returns:
        AuthResponse: User data and JWT token

    Raises:
        HTTPException 401: If credentials are invalid
        HTTPException 500: If database error occurs
    """
    try:
        # Authenticate user and generate JWT token
        # Security: Generic error prevents user enumeration
        user, token = auth_service.signin(session, request)

        # Convert user to response schema
        # Security: Never include hashed_password in response
        user_response = UserResponse.model_validate(user)

        # Return success response
        return AuthResponse(
            data={
                "user": user_response.model_dump(),
                "token": token
            },
            message="Signed in successfully",
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
