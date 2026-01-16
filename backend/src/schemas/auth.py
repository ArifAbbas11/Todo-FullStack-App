"""
Authentication request and response schemas.
Defines Pydantic models for API input validation and output serialization.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from uuid import UUID
from typing import Optional


# ============================================================================
# Request Schemas (Input Validation)
# ============================================================================

class SignupRequest(BaseModel):
    """
    User signup request schema.

    Security Validations:
    - Email format validated by EmailStr
    - Password minimum length enforced (8 characters)
    - No maximum password length (will be hashed to fixed length)
    """
    email: EmailStr = Field(
        ...,
        description="User's email address",
        max_length=255,
        examples=["user@example.com"]
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User's password (minimum 8 characters)",
        examples=["password123"]
    )

    @field_validator('password')
    @classmethod
    def validate_password_not_empty(cls, v: str) -> str:
        """
        Validate password is not just whitespace.

        Security: Prevents users from creating accounts with whitespace-only passwords.
        """
        if not v or v.strip() == "":
            raise ValueError("Password cannot be empty or whitespace only")
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }


class SigninRequest(BaseModel):
    """
    User signin request schema.

    Security Note:
    - No password length validation on signin (only on signup)
    - This prevents information leakage about password requirements
    """
    email: EmailStr = Field(
        ...,
        description="User's email address",
        max_length=255,
        examples=["user@example.com"]
    )
    password: str = Field(
        ...,
        description="User's password",
        examples=["password123"]
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }


# ============================================================================
# Response Schemas (Output Serialization)
# ============================================================================

class UserResponse(BaseModel):
    """
    User data response schema.

    Security: Never includes hashed_password in API responses.
    """
    id: UUID = Field(
        ...,
        description="User's unique identifier",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    email: str = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"]
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp",
        examples=["2026-01-14T10:30:00Z"]
    )

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2026-01-14T10:30:00Z"
            }
        }


class AuthResponse(BaseModel):
    """
    Authentication response schema (signup/signin).

    Returns user data and JWT token on successful authentication.
    """
    data: dict = Field(
        ...,
        description="Response data containing user and token"
    )
    message: str = Field(
        ...,
        description="Success message",
        examples=["Account created successfully", "Signed in successfully"]
    )
    error: Optional[dict] = Field(
        None,
        description="Error object (null on success)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "data": {
                    "user": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "email": "user@example.com",
                        "created_at": "2026-01-14T10:30:00Z"
                    },
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                },
                "message": "Account created successfully",
                "error": None
            }
        }


class ErrorResponse(BaseModel):
    """
    Error response schema.

    Used for all error responses (400, 401, 409, 500).
    """
    data: Optional[dict] = Field(
        None,
        description="Data object (null on error)"
    )
    message: Optional[str] = Field(
        None,
        description="Message (null on error)"
    )
    error: dict = Field(
        ...,
        description="Error details"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "data": None,
                "message": None,
                "error": {
                    "code": "INVALID_CREDENTIALS",
                    "message": "Invalid email or password",
                    "details": {}
                }
            }
        }
