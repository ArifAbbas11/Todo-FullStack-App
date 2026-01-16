"""
FastAPI dependencies for authentication and database sessions.
Provides reusable dependencies for endpoint injection.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import Annotated

from src.core.database import get_session
from src.services.auth import get_current_user
from src.models.user import User


# ============================================================================
# Security Scheme
# ============================================================================

# HTTP Bearer token authentication scheme
# Security: Extracts JWT token from Authorization header
security = HTTPBearer(
    scheme_name="Bearer",
    description="JWT token authentication",
    auto_error=True  # Automatically raise 401 if token is missing
)


# ============================================================================
# Dependencies
# ============================================================================

def get_current_user_dependency(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[Session, Depends(get_session)]
) -> User:
    """
    FastAPI dependency to extract and validate JWT token.

    Security Flow:
    1. Extract token from Authorization header (Bearer <token>)
    2. Validate JWT signature and expiration
    3. Decode token to get user ID
    4. Retrieve user from database
    5. Return authenticated user

    Usage in endpoints:
        @app.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user_dependency)):
            return {"user_id": current_user.id}

    Args:
        credentials: HTTP Bearer credentials from Authorization header
        session: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException 401: If token is invalid, expired, or user not found
    """
    # Extract token from credentials
    # Security: HTTPBearer automatically validates "Bearer <token>" format
    token = credentials.credentials

    # Validate token and get current user
    # Security: Verifies JWT signature, expiration, and user existence
    user = get_current_user(session, token)

    return user


# Type alias for cleaner endpoint signatures
CurrentUser = Annotated[User, Depends(get_current_user_dependency)]
