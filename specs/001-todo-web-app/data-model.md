# Data Model: Todo Full-Stack Web Application

**Feature**: 001-todo-web-app
**Date**: 2026-01-14
**Purpose**: Define entities, relationships, and validation rules for database schema

## Entity Definitions

### User Entity

**Purpose**: Represents a registered user account

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier for user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| hashed_password | VARCHAR(255) | NOT NULL | Bcrypt-hashed password (never store plaintext) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Validation Rules**:
- Email must be valid email format (validated by Pydantic EmailStr)
- Email must be unique across all users
- Password must be at least 8 characters before hashing
- Password must be hashed using bcrypt with salt before storage

**Relationships**:
- One user has many tasks (one-to-many)
- Cascade delete: When user is deleted, all their tasks are deleted

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `email` (automatic from UNIQUE constraint)

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

---

### Task Entity

**Purpose**: Represents a single todo item belonging to a user

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier for task |
| user_id | UUID | FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE, NOT NULL | Owner of the task |
| title | VARCHAR(500) | NOT NULL | Task title (required) |
| description | TEXT | NULL | Optional task description |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Task creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Validation Rules**:
- Title must not be empty or whitespace-only
- Title maximum length: 500 characters
- Description maximum length: 5000 characters
- user_id must reference an existing user
- is_completed defaults to false for new tasks

**Relationships**:
- Many tasks belong to one user (many-to-one)
- Foreign key constraint ensures referential integrity
- CASCADE delete: When user is deleted, all their tasks are deleted

**Indexes**:
- Primary key index on `id` (automatic)
- Foreign key index on `user_id` (for query performance)

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
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship (optional, for ORM convenience)
    # user: Optional[User] = Relationship(back_populates="tasks")
```

---

## Entity Relationships

### User ↔ Task Relationship

**Type**: One-to-Many

**Cardinality**:
- One user can have zero or many tasks
- Each task belongs to exactly one user

**Referential Integrity**:
- Foreign key constraint: `tasks.user_id` → `users.id`
- ON DELETE CASCADE: Deleting a user deletes all their tasks
- ON UPDATE CASCADE: Updating user.id updates all task.user_id (not expected in practice)

**Query Patterns**:

```python
# Get all tasks for a user
tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()

# Get user with their tasks (if using relationships)
user = session.exec(
    select(User).where(User.id == user_id)
).first()
# tasks = user.tasks  # if relationship defined
```

---

## Database Schema Diagram

```
┌─────────────────────────────────────┐
│ users                               │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ email (VARCHAR(255), UNIQUE)        │
│ hashed_password (VARCHAR(255))      │
│ created_at (TIMESTAMP)              │
│ updated_at (TIMESTAMP)              │
└─────────────────────────────────────┘
                │
                │ 1
                │
                │ has many
                │
                │ n
                ▼
┌─────────────────────────────────────┐
│ tasks                               │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ user_id (UUID, FK → users.id)       │
│ title (VARCHAR(500))                │
│ description (TEXT, NULL)            │
│ is_completed (BOOLEAN)              │
│ created_at (TIMESTAMP)              │
│ updated_at (TIMESTAMP)              │
└─────────────────────────────────────┘
```

---

## State Transitions

### Task Completion State

**States**:
- `is_completed = false` (incomplete)
- `is_completed = true` (completed)

**Transitions**:
- Incomplete → Complete: User marks task as done
- Complete → Incomplete: User unmarks task

**Rules**:
- Any task can transition between states at any time
- No restrictions on number of transitions
- State persists across sessions

**State Diagram**:
```
    ┌──────────────┐
    │  Incomplete  │ ◄─────┐
    │ (is_completed│       │
    │   = false)   │       │
    └──────────────┘       │
           │               │
           │ toggle        │ toggle
           │               │
           ▼               │
    ┌──────────────┐       │
    │   Complete   │───────┘
    │ (is_completed│
    │   = true)    │
    └──────────────┘
```

---

## Data Validation Rules

### User Validation

**Email Validation**:
- Must match email regex pattern
- Must be unique (database constraint)
- Case-insensitive comparison for uniqueness
- Maximum length: 255 characters

**Password Validation**:
- Minimum length: 8 characters (before hashing)
- No maximum length (will be hashed to fixed length)
- Must be hashed with bcrypt before storage
- Salt automatically generated by bcrypt

### Task Validation

**Title Validation**:
- Required (cannot be null or empty)
- Cannot be only whitespace
- Maximum length: 500 characters
- Trimmed before storage

**Description Validation**:
- Optional (can be null)
- Maximum length: 5000 characters
- Trimmed before storage if provided

**Ownership Validation**:
- user_id must reference existing user
- Cannot be null
- Cannot be modified after creation (immutable)

---

## Database Migrations

### Initial Migration (001_create_tables.sql)

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tasks table
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Query Optimization

### Common Query Patterns

**1. Get all tasks for authenticated user** (most frequent):
```sql
SELECT * FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC;
```
- Uses index: `idx_tasks_user_id`
- Performance: O(log n) for index lookup + O(k) for result set

**2. Get single task with ownership verification**:
```sql
SELECT * FROM tasks
WHERE id = $1 AND user_id = $2;
```
- Uses index: Primary key on `id`
- Performance: O(log n)

**3. Update task with ownership verification**:
```sql
UPDATE tasks
SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $3 AND user_id = $4;
```
- Uses index: Primary key on `id`
- Performance: O(log n)

**4. Toggle task completion**:
```sql
UPDATE tasks
SET is_completed = NOT is_completed, updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND user_id = $2;
```
- Uses index: Primary key on `id`
- Performance: O(log n)

---

## Data Integrity Constraints

### Database-Level Constraints

1. **Primary Keys**: Ensure uniqueness of records
2. **Foreign Keys**: Ensure referential integrity (tasks → users)
3. **Unique Constraints**: Prevent duplicate emails
4. **NOT NULL Constraints**: Ensure required fields are present
5. **CHECK Constraints**: (Optional) Validate data ranges
6. **CASCADE Deletes**: Maintain consistency when users are deleted

### Application-Level Validation

1. **Email Format**: Validated by Pydantic EmailStr
2. **Password Strength**: Minimum 8 characters
3. **Title Not Empty**: Trim and check for non-whitespace
4. **Length Limits**: Enforce max lengths before database
5. **Ownership Verification**: Check user_id matches JWT token

---

## Sample Data

### Test Users

```sql
INSERT INTO users (email, hashed_password) VALUES
('alice@example.com', '$2b$12$...'),  -- password: "password123"
('bob@example.com', '$2b$12$...');     -- password: "password123"
```

### Test Tasks

```sql
INSERT INTO tasks (user_id, title, description, is_completed) VALUES
-- Alice's tasks
((SELECT id FROM users WHERE email = 'alice@example.com'),
 'Buy groceries', 'Milk, eggs, bread', false),
((SELECT id FROM users WHERE email = 'alice@example.com'),
 'Finish project', 'Complete Phase II hackathon', false),
((SELECT id FROM users WHERE email = 'alice@example.com'),
 'Call dentist', null, true),

-- Bob's tasks
((SELECT id FROM users WHERE email = 'bob@example.com'),
 'Review code', 'Check PR #123', false),
((SELECT id FROM users WHERE email = 'bob@example.com'),
 'Update documentation', null, false);
```

---

## Security Considerations

### Data Protection

1. **Password Storage**: Never store plaintext passwords, always hash with bcrypt
2. **User Isolation**: Always filter queries by authenticated user_id
3. **SQL Injection**: Use parameterized queries (SQLModel handles this)
4. **Data Leakage**: Never return other users' data in API responses

### Audit Trail

- `created_at`: Track when records were created
- `updated_at`: Track when records were last modified
- Consider adding `deleted_at` for soft deletes (not in current scope)

---

## Performance Benchmarks

**Expected Query Performance** (with proper indexes):

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Get user tasks | <50ms | Index on user_id |
| Create task | <20ms | Single INSERT |
| Update task | <20ms | Single UPDATE with PK |
| Delete task | <20ms | Single DELETE with PK |
| Toggle completion | <20ms | Single UPDATE with PK |

**Scalability Limits**:
- Up to 1000 users: No performance issues
- Up to 100 tasks per user: No pagination needed
- Beyond 100 tasks: Consider implementing pagination
