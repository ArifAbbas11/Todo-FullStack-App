"""
Authentication service layer.
Handles user signup, signin, and JWT token operations.
"""
from sqlmodel import Session, select
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from uuid import UUID

from src.models.user import User
from src.core.security import hash_password, verify_password, create_access_token, decode_access_token
from src.schemas.auth import SignupRequest, SigninRequest, UserResponse


# ============================================================================
# Authentication Service Functions
# ============================================================================

def signup(session: Session, request: SignupRequest) -> tuple[User, str]:
    """
    Create a new user account and generate JWT token.

    Security Measures:
    - Password is hashed with bcrypt before storage
    - Email uniqueness is enforced at database level
    - JWT token includes user ID and email claims

    Args:
        session: Database session
        request: Signup request with email and password

    Returns:
        tuple[User, str]: Created user and JWT token

    Raises:
        HTTPException 400: If email already exists
        HTTPException 500: If database error occurs
    """
    # Check if email already exists
    # Security: Use case-insensitive comparison to prevent duplicate accounts
    existing_user = session.exec(
        select(User).where(User.email == request.email.lower())
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "EMAIL_EXISTS",
                "message": "Email already registered",
                "details": {}
            }
        )

    # Hash password using bcrypt
    # Security: Never store plaintext passwords
    hashed_password = hash_password(request.password)

    # Create new user
    new_user = User(
        email=request.email.lower(),  # Store email in lowercase for consistency
        hashed_password=hashed_password
    )

    try:
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to create user account",
                "details": {}
            }
        )

    # Generate JWT token
    # Security: Include minimal claims (user ID and email)
    token_data = {
        "sub": str(new_user.id),  # Subject: user ID
        "email": new_user.email
    }
    access_token = create_access_token(token_data)

    return new_user, access_token


def signin(session: Session, request: SigninRequest) -> tuple[User, str]:
    """
    Authenticate user and generate JWT token.

    Security Measures:
    - Uses constant-time password comparison (via bcrypt)
    - Returns generic error message to prevent user enumeration
    - Logs authentication attempts (future enhancement)

    Args:
        session: Database session
        request: Signin request with email and password

    Returns:
        tuple[User, str]: Authenticated user and JWT token

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find user by email
    # Security: Case-insensitive email lookup
    user = session.exec(
        select(User).where(User.email == request.email.lower())
    ).first()

    # Security: Use generic error message to prevent user enumeration
    # Don't reveal whether email exists or password is wrong
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
                "details": {}
            }
        )

    # Verify password using bcrypt
    # Security: Uses constant-time comparison to prevent timing attacks
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
                "details": {}
            }
        )

    # Generate JWT token
    # Security: Include minimal claims (user ID and email)
    token_data = {
        "sub": str(user.id),  # Subject: user ID
        "email": user.email
    }
    access_token = create_access_token(token_data)

    return user, access_token


def get_current_user(session: Session, token: str) -> User:
    """
    Decode JWT token and retrieve current user.

    Security Measures:
    - Validates JWT signature and expiration
    - Verifies user still exists in database
    - Returns 401 for invalid/expired tokens

    Args:
        session: Database session
        token: JWT access token

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    # Decode and validate JWT token
    # Security: Verifies signature and expiration
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Invalid or expired token",
                "details": {}
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Extract user ID from token
    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Invalid token payload",
                "details": {}
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Convert string UUID to UUID object
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Invalid user ID in token",
                "details": {}
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Retrieve user from database
    # Security: Verify user still exists (not deleted)
    user = session.exec(
        select(User).where(User.id == user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "User not found",
                "details": {}
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user
