# Research: Todo Full-Stack Web Application

**Feature**: 001-todo-web-app
**Date**: 2026-01-14
**Purpose**: Document technology decisions, best practices, and architectural patterns for implementation

## Technology Stack Research

### Frontend: Next.js 16+ with App Router

**Decision**: Use Next.js 16+ with App Router for frontend

**Rationale**:
- App Router provides modern React Server Components architecture
- Built-in routing with file-system based structure
- Excellent TypeScript support
- Server-side rendering improves initial page load performance
- Middleware support for route protection (authentication guards)
- Native support for environment variables

**Best Practices**:
- Use Server Components by default, Client Components only when needed (interactivity, hooks)
- Implement route protection via middleware.ts for authenticated routes
- Use `use client` directive only for interactive components
- Leverage Next.js Image component for optimized images
- Use TailwindCSS for responsive design with utility classes

**Alternatives Considered**:
- **React SPA (Vite)**: Rejected - no SSR, more complex routing setup
- **Remix**: Rejected - less ecosystem maturity than Next.js
- **Vue/Nuxt**: Rejected - team familiarity with React ecosystem

### Backend: Python FastAPI

**Decision**: Use FastAPI for REST API backend

**Rationale**:
- High performance async framework (comparable to Node.js)
- Automatic OpenAPI documentation generation
- Built-in request/response validation via Pydantic
- Excellent type hints support
- Native async/await support for database operations
- Easy CORS middleware configuration

**Best Practices**:
- Use dependency injection for database sessions and auth
- Implement middleware for JWT validation on protected routes
- Use Pydantic models for request/response validation
- Separate concerns: models, schemas, services, API routes
- Use async database operations with SQLModel
- Configure CORS to whitelist frontend origin only

**Alternatives Considered**:
- **Django REST Framework**: Rejected - heavier framework, slower for simple APIs
- **Flask**: Rejected - lacks async support, manual validation
- **Node.js/Express**: Rejected - Python specified in requirements

### Database: Neon Serverless PostgreSQL

**Decision**: Use Neon Serverless PostgreSQL

**Rationale**:
- Serverless architecture with automatic scaling
- Built-in connection pooling
- PostgreSQL compatibility (full SQL support)
- Generous free tier for hackathon projects
- Low latency for cloud deployments
- Automatic backups and point-in-time recovery

**Best Practices**:
- Use connection pooling (max 10 connections)
- Implement database migrations with Alembic
- Use SQLModel for ORM (combines SQLAlchemy + Pydantic)
- Create indexes on foreign keys (user_id) for query performance
- Use transactions for multi-step operations
- Store connection string in environment variable

**Schema Design Decisions**:
- Use UUID for primary keys (better for distributed systems)
- Add created_at and updated_at timestamps to all tables
- Use CASCADE delete for user → tasks relationship
- Add database-level constraints (NOT NULL, UNIQUE, CHECK)

### Authentication: Better Auth + JWT

**Decision**: Use Better Auth for frontend JWT issuance, custom JWT validation on backend

**Rationale**:
- Better Auth provides modern authentication patterns for Next.js
- JWT tokens are stateless and scalable
- Tokens can be validated independently by backend
- No session storage required on backend
- Works well with separate frontend/backend architecture

**JWT Implementation Details**:
- **Token Structure**: Header.Payload.Signature
- **Payload Claims**:
  - `sub` (subject): user ID
  - `email`: user email
  - `exp` (expiration): 24 hours from issuance
  - `iat` (issued at): timestamp
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: Shared between frontend and backend via environment variable

**Best Practices**:
- Store JWT secret in environment variable (never commit)
- Use same secret on frontend (Better Auth) and backend (FastAPI)
- Validate token signature on every protected request
- Check token expiration before processing request
- Extract user ID from token for database queries
- Return 401 Unauthorized for invalid/expired tokens
- Use HTTPS in production to prevent token interception

**Security Considerations**:
- Password hashing: Use bcrypt with salt (via passlib)
- Minimum password length: 8 characters
- Email validation: Use Pydantic EmailStr
- Rate limiting: Consider implementing for auth endpoints
- Token storage: Store in httpOnly cookies or secure localStorage

**Alternatives Considered**:
- **Session-based auth**: Rejected - requires backend session storage, less scalable
- **OAuth2**: Rejected - overkill for simple email/password auth
- **Auth0/Clerk**: Rejected - external dependency, cost considerations

## API Design Patterns

### RESTful Endpoint Structure

**Pattern**: Resource-based URLs with standard HTTP methods

**Authentication Endpoints**:
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Authenticate user and return JWT token
- `POST /auth/signout` - Invalidate token (optional, client-side deletion sufficient)

**Task Endpoints** (all require JWT authentication):
- `GET /tasks` - List all tasks for authenticated user
- `POST /tasks` - Create new task for authenticated user
- `GET /tasks/{id}` - Get single task (verify ownership)
- `PUT /tasks/{id}` - Update task (verify ownership)
- `PATCH /tasks/{id}/toggle` - Toggle completion status (verify ownership)
- `DELETE /tasks/{id}` - Delete task (verify ownership)

**HTTP Status Codes**:
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Resource not found or not owned by user
- `500 Internal Server Error` - Server error

**Response Format**:
```json
{
  "data": { /* resource data */ },
  "message": "Success message",
  "error": null
}
```

**Error Response Format**:
```json
{
  "data": null,
  "message": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional additional context */ }
  }
}
```

### CORS Configuration

**Decision**: Configure CORS to allow frontend origin only

**Configuration**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # e.g., "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Best Practices**:
- Never use `allow_origins=["*"]` in production
- Use environment variable for frontend URL
- Enable credentials for JWT token transmission
- Specify exact methods and headers needed

## Frontend Architecture Patterns

### Component Structure

**Pattern**: Atomic design with feature-based organization

**Component Hierarchy**:
- **Pages** (app/ directory): Route-level components
- **Features** (components/ directory): Feature-specific components
- **Shared** (components/layout/): Reusable UI components

**State Management**:
- Use React hooks (useState, useEffect) for local state
- Use Context API for auth state (user, token)
- No Redux needed for this simple application

**API Client Pattern**:
```typescript
// lib/api.ts
const apiClient = {
  get: (url, token) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
  post: (url, data, token) => fetch(url, { method: 'POST', body: JSON.stringify(data), headers: { ... } }),
  // ... other methods
}
```

### Responsive Design Strategy

**Approach**: Mobile-first with TailwindCSS

**Breakpoints**:
- Mobile: 320px - 767px (default, no prefix)
- Tablet: 768px - 1023px (`md:` prefix)
- Desktop: 1024px+ (`lg:` prefix)

**Example**:
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

**Touch Targets**:
- Minimum 44px × 44px for buttons and interactive elements
- Use `p-3` or `p-4` for adequate padding

## Database Schema Patterns

### User Isolation Pattern

**Implementation**: Foreign key with CASCADE delete

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Query Pattern**:
```python
# Always filter by authenticated user ID
tasks = session.exec(
    select(Task).where(Task.user_id == current_user.id)
).all()
```

## Development Workflow

### Environment Setup

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_JWT_SECRET=your-secret-key-here
```

**Critical**: JWT_SECRET must be identical in both environments

### Testing Strategy

**Backend Testing**:
- Use pytest with httpx for async testing
- Create test database fixtures
- Test each endpoint with valid and invalid inputs
- Test JWT validation with expired/invalid tokens
- Test user isolation (User A cannot access User B's data)

**Frontend Testing**:
- Use Jest + React Testing Library
- Test component rendering
- Test user interactions (form submission, button clicks)
- Mock API calls with MSW (Mock Service Worker)
- Test responsive behavior with viewport testing

## Performance Considerations

### Database Optimization

**Indexes**:
- Primary keys (automatic)
- Foreign keys: `idx_tasks_user_id`
- Unique constraints: `users.email`

**Query Optimization**:
- Use `select()` with specific columns instead of `SELECT *`
- Implement pagination if task count > 100 per user
- Use connection pooling (configured in SQLModel)

### Frontend Optimization

**Code Splitting**:
- Next.js automatically splits by route
- Use dynamic imports for heavy components

**Caching**:
- Use Next.js built-in caching for static assets
- Implement optimistic UI updates for better UX

## Security Checklist

- [x] JWT secret stored in environment variable
- [x] Passwords hashed with bcrypt (never plaintext)
- [x] Email validation on signup
- [x] JWT token validated on every protected endpoint
- [x] User ID extracted from token (not from request body)
- [x] Database queries filter by authenticated user ID
- [x] CORS configured to whitelist frontend origin only
- [x] HTTPS required in production
- [x] SQL injection prevented (SQLModel parameterized queries)
- [x] XSS prevented (React escapes by default)

## Deployment Considerations

**Frontend**: Vercel
- Automatic deployments from Git
- Environment variables configured in dashboard
- Edge network for low latency

**Backend**: Railway or Render
- Automatic deployments from Git
- Environment variables configured in dashboard
- Health check endpoint: `GET /health`

**Database**: Neon
- Connection string from Neon dashboard
- Automatic backups enabled
- Monitor connection pool usage

## Open Questions Resolved

All technical unknowns from plan.md have been resolved through this research phase. No remaining NEEDS CLARIFICATION items.
