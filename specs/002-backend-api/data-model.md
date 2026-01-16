# Data Model: Todo App Backend API & Database

**Feature**: 002-backend-api
**Date**: 2026-01-15
**Purpose**: Define database entities, relationships, validation rules, and state transitions

## Overview

This document defines the data model for the task management API. The model consists of two primary entities: User and Task, with a one-to-many relationship enforced at the database level.

## Entity Definitions

### User Entity

**Purpose**: Represents an authenticated user account. Users are created and managed by Better Auth (frontend), but referenced by the backend API for task ownership.

**Table Name**: `users`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for authentication) |
| hashed_password | VARCHAR(255) | NOT NULL | Bcrypt-hashed password (managed by Better Auth) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `email` for fast authentication lookups

**Validation Rules**:
- Email must be valid email format (validated by Better Auth)
- Email must be unique across all users
- Password must be bcrypt-hashed (never stored in plaintext)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Notes**:
- User creation/authentication is handled by Better Auth (out of scope for this API)
- Backend API only validates JWT tokens and extracts user ID
- User deletion cascades to tasks (all user's tasks deleted when user deleted)

---

### Task Entity

**Purpose**: Represents a todo item owned by a specific user. Tasks support CRUD operations with user isolation enforced at the query level.

**Table Name**: `tasks`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the task |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL, INDEX | Owner of the task |
| title | VARCHAR(500) | NOT NULL | Task title (required, max 500 chars) |
| description | TEXT | NULLABLE | Optional task description (max 5000 chars) |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- Primary key index on `id` (automatic)
- Index on `user_id` for fast filtering by owner (critical for performance)
- Composite index on `(user_id, created_at DESC)` for ordered task lists

**Foreign Key Constraints**:
- `user_id` references `users.id` with `ON DELETE CASCADE`
- When a user is deleted, all their tasks are automatically deleted

**Validation Rules**:
- Title must not be empty or whitespace-only (FR-009)
- Title maximum length: 500 characters (FR-010)
- Description maximum length: 5000 characters (FR-011)
- is_completed must be boolean (true/false)
- user_id must reference an existing user

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship (optional, for ORM convenience)
    # user: Optional[User] = Relationship(back_populates="tasks")
```

**State Transitions**:
- `is_completed: false → true` (mark as complete)
- `is_completed: true → false` (mark as incomplete)
- No other state transitions (tasks don't have workflow states)

---

## Entity Relationships

### User → Tasks (One-to-Many)

**Relationship Type**: One-to-Many
**Cardinality**: One user can have zero or more tasks
**Foreign Key**: `tasks.user_id` → `users.id`
**Cascade Behavior**: `ON DELETE CASCADE` (delete user → delete all their tasks)

**Relationship Diagram**:
```
┌─────────────────┐         ┌─────────────────┐
│     User        │         │      Task       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────┤│ id (PK)         │
│ email           │    1:N  │ user_id (FK)    │
│ hashed_password │         │ title           │
│ created_at      │         │ description     │
│ updated_at      │         │ is_completed    │
└─────────────────┘         │ created_at      │
                            │ updated_at      │
                            └─────────────────┘
```

**Query Patterns**:
```python
# Get all tasks for a user (most common query)
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user_id)
    .order_by(Task.created_at.desc())
).all()

# Get specific task with ownership check
task = session.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == current_user_id)
).first()

# Create task with automatic user_id assignment
task = Task(
    title=title,
    description=description,
    user_id=current_user_id  # From JWT token
)
session.add(task)
session.commit()
```

---

## Validation Rules Summary

### Task Title Validation
- **Rule**: Must not be empty or whitespace-only
- **Enforcement**: Pydantic schema validation + database NOT NULL constraint
- **Error**: 400 Bad Request with message "Title cannot be empty"
- **Reference**: FR-009

### Task Title Length
- **Rule**: Maximum 500 characters
- **Enforcement**: Pydantic schema `max_length=500` + database VARCHAR(500)
- **Error**: 400 Bad Request with message "Title must be 500 characters or less"
- **Reference**: FR-010

### Task Description Length
- **Rule**: Maximum 5000 characters (optional field)
- **Enforcement**: Pydantic schema `max_length=5000` + database TEXT
- **Error**: 400 Bad Request with message "Description must be 5000 characters or less"
- **Reference**: FR-011

### User Isolation
- **Rule**: Users can only access their own tasks
- **Enforcement**: All queries include `WHERE user_id = {authenticated_user_id}`
- **Error**: 404 Not Found (never reveal if task exists for another user)
- **Reference**: FR-015, FR-018, FR-022, FR-026, FR-033

---

## Database Migrations

### Migration 001: Create Users Table

**File**: `alembic/versions/001_create_users.py`

```python
"""Create users table

Revision ID: 001
Revises:
Create Date: 2026-01-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

def downgrade():
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
```

### Migration 002: Create Tasks Table

**File**: `alembic/versions/002_create_tasks.py`

```python
"""Create tasks table

Revision ID: 002
Revises: 001
Create Date: 2026-01-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'tasks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_user_id_created_at', 'tasks', ['user_id', sa.text('created_at DESC')])

def downgrade():
    op.drop_index('ix_tasks_user_id_created_at', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
```

---

## Performance Considerations

### Index Strategy
- **Primary indexes**: Automatic on all primary keys (id fields)
- **Foreign key index**: `tasks.user_id` for fast filtering (most queries filter by user)
- **Composite index**: `(user_id, created_at DESC)` for ordered task lists
- **Unique index**: `users.email` for authentication lookups

### Query Optimization
- All task queries use indexed `user_id` column (sub-10ms expected)
- Avoid SELECT * - only fetch needed columns
- Use `session.exec()` with explicit column selection for large result sets
- Connection pooling via Neon reduces connection overhead

### Scalability Notes
- Current design supports 10,000+ users with millions of tasks
- Partition tasks table by user_id if single-user task count exceeds 100,000
- Add pagination if task lists exceed 1,000 items per user

---

## Data Integrity

### Referential Integrity
- Foreign key constraint ensures every task has a valid user
- CASCADE delete prevents orphaned tasks
- Database enforces constraints (application cannot bypass)

### Concurrency Control
- PostgreSQL MVCC handles concurrent reads/writes
- No explicit locking needed for simple CRUD operations
- `updated_at` timestamp updated on every modification

### Data Consistency
- NOT NULL constraints prevent missing required fields
- UNIQUE constraint on email prevents duplicate accounts
- Boolean default (false) ensures is_completed always has a value

---

## Security Considerations

### User Isolation
- Every query MUST include `WHERE user_id = {authenticated_user_id}`
- Never expose task IDs without ownership verification
- Return 404 (not 403) to avoid revealing task existence

### SQL Injection Prevention
- SQLModel uses parameterized queries (automatic protection)
- No raw SQL in application code
- Input validation via Pydantic schemas

### Data Exposure
- Never return hashed_password in API responses
- Task responses only include task data (no user data)
- Error messages don't reveal database structure

---

## Testing Strategy

### Data Model Tests
- Test foreign key constraints (cascade delete)
- Test unique constraints (duplicate email)
- Test validation rules (title length, empty title)
- Test default values (is_completed = false)

### Migration Tests
- Test upgrade (apply migrations)
- Test downgrade (rollback migrations)
- Test idempotency (apply twice, no errors)

### Query Tests
- Test user isolation (User A cannot see User B's tasks)
- Test index usage (EXPLAIN ANALYZE queries)
- Test concurrent updates (race conditions)

---

## References

- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
