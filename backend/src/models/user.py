"""
User model for authentication and authorization.
Represents a registered user account in the system.
"""
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional


class User(SQLModel, table=True):
    """
    User entity for authentication.

    Security Considerations:
    - Password is stored as bcrypt hash, never plaintext
    - Email is unique and indexed for fast lookup
    - UUID primary key prevents enumeration attacks
    """
    __tablename__ = "users"

    # Primary key - UUID for security (prevents enumeration)
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Authentication credentials
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address (used for login)"
    )
    hashed_password: str = Field(
        max_length=255,
        description="Bcrypt-hashed password (never store plaintext)"
    )

    # Audit timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2026-01-14T10:30:00Z",
                "updated_at": "2026-01-14T10:30:00Z"
            }
        }
