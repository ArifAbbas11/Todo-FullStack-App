# Research: Todo App Backend API & Database

**Feature**: 002-backend-api
**Date**: 2026-01-15
**Purpose**: Document technical decisions, rationale, and alternatives considered for the backend API implementation

## Overview

This document captures the research and decision-making process for building a secure, user-isolated REST API for task management. The API validates JWT tokens from Better Auth and enforces data isolation at the database query level.

## Key Technical Decisions

### Decision 1: JWT Token Validation Strategy

**Decision**: Validate JWT tokens using python-jose library with shared secret from Better Auth

**Rationale**:
- Better Auth (frontend) already issues JWT tokens with HS256 algorithm
- Shared secret approach is simpler than public/private key pairs for this use case
- python-jose is the standard JWT library for Python with excellent FastAPI integration
- Stateless validation enables horizontal scaling without session storage

**Alternatives Considered**:
1. **OAuth 2.0 with token introspection**: Rejected - adds unnecessary complexity and latency (network call per request)
2. **Session-based authentication**: Rejected - violates stateless API constraint (C-008) and complicates scaling
3. **Public/private key JWT (RS256)**: Rejected - overkill for single-issuer scenario, adds key management complexity

**Implementation Notes**:
- JWT secret stored in environment variable (JWT_SECRET)
- Token extracted from Authorization header: `Bearer <token>`
- Token validation includes signature verification and expiration check
- User ID extracted from token payload for database query filtering

---

### Decision 2: User Isolation Enforcement Pattern

**Decision**: Enforce user isolation at the database query level using SQLModel filters

**Rationale**:
- Database-level filtering is the most secure approach - cannot be bypassed by application logic bugs
- SQLModel's query API makes it easy to add `.where(Task.user_id == current_user_id)` to all queries
- Prevents accidental data leaks from missing authorization checks
- Aligns with security-first development principle (Constitution III)

**Alternatives Considered**:
1. **Application-level authorization checks**: Rejected - prone to human error, easy to forget checks
2. **Database row-level security (RLS)**: Rejected - Neon PostgreSQL supports RLS but adds complexity, harder to debug
3. **Separate database per user**: Rejected - massive operational overhead, not scalable

**Implementation Pattern**:
```python
# All task queries MUST include user_id filter
tasks = session.exec(
    select(Task).where(Task.user_id == current_user.id)
).all()

# Create operations automatically set user_id
task = Task(title=title, description=description, user_id=current_user.id)
```

---

### Decision 3: Database Schema Design

**Decision**: Use SQLModel with Alembic migrations for schema management

**Rationale**:
- SQLModel combines Pydantic validation with SQLAlchemy ORM - single source of truth for models
- Type-safe queries with excellent IDE support
- Alembic provides version-controlled, reversible migrations
- Neon PostgreSQL is fully compatible with standard PostgreSQL tools

**Alternatives Considered**:
1. **Raw SQL with psycopg2**: Rejected - no type safety, manual query building, prone to SQL injection
2. **Django ORM**: Rejected - requires full Django framework, overkill for API-only backend
3. **Tortoise ORM**: Rejected - less mature ecosystem, fewer FastAPI examples

**Schema Design**:
- Users table: id (UUID), email (unique), hashed_password, created_at, updated_at
- Tasks table: id (UUID), user_id (FK to users), title, description (nullable), is_completed (boolean), created_at, updated_at
- Foreign key constraint with CASCADE delete (when user deleted, tasks deleted)
- Indexes on user_id for fast filtering, email for fast lookup

---

### Decision 4: API Design Pattern

**Decision**: RESTful API with resource-based endpoints and standard HTTP methods

**Rationale**:
- REST is the industry standard for CRUD APIs - familiar to all developers
- HTTP methods map naturally to operations (GET=read, POST=create, PUT=update, DELETE=delete)
- Stateless design aligns with JWT authentication
- FastAPI's automatic OpenAPI documentation works best with REST

**Alternatives Considered**:
1. **GraphQL**: Rejected - overkill for simple CRUD, adds complexity, harder to cache
2. **RPC-style endpoints**: Rejected - less intuitive, doesn't leverage HTTP semantics
3. **HATEOAS (hypermedia)**: Rejected - unnecessary for this use case, frontend knows all endpoints

**Endpoint Design**:
- `GET /api/tasks` - List all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{task_id}` - Get specific task
- `PUT /api/tasks/{task_id}` - Update task (full replacement)
- `PATCH /api/tasks/{task_id}/toggle` - Toggle completion status
- `DELETE /api/tasks/{task_id}` - Delete task

---

### Decision 5: Error Handling Strategy

**Decision**: Structured error responses with consistent format and appropriate HTTP status codes

**Rationale**:
- Consistent error format makes frontend error handling predictable
- HTTP status codes provide semantic meaning (401=unauthorized, 404=not found, etc.)
- Detailed error messages aid debugging without exposing sensitive information
- FastAPI's exception handlers enable centralized error handling

**Error Response Format**:
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found or you don't have permission to access it",
    "details": {}
  }
}
```

**Status Code Mapping**:
- 200 OK: Successful GET/PUT/PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing/invalid JWT token
- 404 Not Found: Resource doesn't exist or user doesn't own it
- 500 Internal Server Error: Unexpected errors

---

### Decision 6: Testing Strategy

**Decision**: pytest with httpx async client for endpoint testing

**Rationale**:
- pytest is the standard Python testing framework with excellent FastAPI support
- httpx provides async HTTP client matching FastAPI's async nature
- Test database isolation using pytest fixtures
- Focus on integration tests for endpoints (unit tests for business logic if needed)

**Test Coverage Requirements**:
- JWT validation (valid token, expired token, invalid signature, missing token)
- User isolation (User A cannot access User B's tasks)
- CRUD operations (create, read, update, delete, toggle)
- Validation errors (empty title, title too long, etc.)
- Edge cases (concurrent updates, non-existent task IDs)

---

## Technology Stack Justification

### FastAPI 0.109+
- **Why**: Modern async framework with automatic OpenAPI docs, excellent performance, type hints
- **Trade-offs**: Newer than Flask/Django, smaller ecosystem, but better for new projects

### SQLModel 0.0.14+
- **Why**: Combines Pydantic and SQLAlchemy, type-safe queries, single model definition
- **Trade-offs**: Relatively new library, but backed by FastAPI creator (Sebastián Ramírez)

### Neon Serverless PostgreSQL
- **Why**: Managed PostgreSQL with connection pooling, auto-scaling, branching for dev/test
- **Trade-offs**: Vendor lock-in, but free tier sufficient for hackathon, easy migration to standard PostgreSQL

### python-jose 3.3+
- **Why**: Standard JWT library for Python, well-maintained, cryptography backend
- **Trade-offs**: Alternative is PyJWT, but python-jose has better FastAPI examples

### Alembic 1.13+
- **Why**: Industry standard for SQLAlchemy migrations, version-controlled schema changes
- **Trade-offs**: Learning curve, but essential for production database management

---

## Performance Considerations

### Connection Pooling
- Neon provides built-in connection pooling (PgBouncer)
- SQLModel engine configured with `pool_pre_ping=True` for connection health checks
- Expected to handle 100 concurrent users without issues

### Query Optimization
- Index on `tasks.user_id` for fast filtering (most common query pattern)
- Index on `users.email` for authentication lookups
- Avoid N+1 queries (not applicable - no nested relationships in this API)

### Response Time Targets
- Target: <500ms p95 response time
- Expected: <100ms for most queries (simple indexed lookups)
- Database is in same region as API server (minimize network latency)

---

## Security Considerations

### JWT Token Security
- Tokens signed with HS256 algorithm using shared secret
- Secret stored in environment variable, never in code
- Token expiration enforced (24 hours default)
- No token refresh endpoint (handled by Better Auth on frontend)

### SQL Injection Prevention
- SQLModel uses parameterized queries (automatic protection)
- No raw SQL queries in application code
- Input validation via Pydantic schemas

### Password Security
- Passwords hashed with bcrypt (passlib library)
- Minimum 8 characters enforced by Better Auth (frontend)
- Backend only validates JWT tokens, never handles passwords directly

### CORS Configuration
- Restrict to known frontend origin (FRONTEND_URL environment variable)
- Credentials allowed for cookie-based auth (if needed in future)
- Preflight requests handled automatically by FastAPI middleware

---

## Deployment Considerations

### Environment Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Shared secret with Better Auth (must match frontend)
- `JWT_ALGORITHM`: HS256 (default)
- `JWT_EXPIRATION_HOURS`: 24 (default)
- `FRONTEND_URL`: CORS allowed origin

### Database Migrations
- Run `alembic upgrade head` before starting server
- Migrations version-controlled in `alembic/versions/`
- Rollback capability with `alembic downgrade`

### Containerization
- Dockerfile with Python 3.11+ base image
- Multi-stage build for smaller image size
- Health check endpoint: `GET /health`

---

## Open Questions and Future Considerations

### Pagination
- **Status**: Out of scope for initial implementation (see spec.md Out of Scope section)
- **Future**: Add `?limit=20&offset=0` query parameters if task lists grow large

### Rate Limiting
- **Status**: Out of scope for initial implementation
- **Future**: Add rate limiting middleware (e.g., slowapi) to prevent abuse

### Caching
- **Status**: Out of scope for initial implementation
- **Future**: Add Redis caching for frequently accessed tasks if performance degrades

### Real-time Updates
- **Status**: Out of scope (WebSockets/SSE not included)
- **Future**: Consider WebSocket endpoint for live task updates across devices

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [python-jose Documentation](https://python-jose.readthedocs.io/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
