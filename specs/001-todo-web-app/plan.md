# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `001-todo-web-app` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-web-app/spec.md`

## Summary

Build a multi-user Todo web application with JWT-based authentication, RESTful API backend, and responsive frontend. Users can create accounts, sign in, and manage their personal task lists (create, read, update, delete, toggle completion). All task data is isolated per user and persisted in Neon Serverless PostgreSQL. The application follows spec-driven development using Claude Code agents for all implementation.

**Technical Approach**: Separate frontend (Next.js 16+ App Router) and backend (Python FastAPI) projects. Better Auth handles JWT token issuance on frontend, FastAPI validates tokens and enforces user isolation on backend. SQLModel ORM manages database operations with Neon PostgreSQL.

## Technical Context

**Language/Version**:
- Frontend: TypeScript with Next.js 16+ (App Router)
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+, Better Auth, React 19+, TailwindCSS
- Backend: FastAPI, SQLModel, Pydantic, python-jose (JWT), passlib (password hashing), psycopg2 (PostgreSQL driver)

**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling enabled)

**Testing**:
- Frontend: Jest, React Testing Library
- Backend: pytest, httpx (async client testing)

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions), deployed to cloud platforms (Vercel for frontend, Railway/Render for backend)

**Project Type**: Web application (separate frontend and backend projects)

**Performance Goals**:
- API response time: <500ms p95 for task operations
- Frontend page load: <2s initial load, <200ms for subsequent navigation
- Support 100+ concurrent users without degradation

**Constraints**:
- JWT token expiration: 24 hours (configurable via environment variable)
- Task title max length: 500 characters
- Task description max length: 5000 characters
- Database connection pool: 10 connections max
- CORS: Frontend origin must be whitelisted in backend

**Scale/Scope**:
- Expected users: 100-1000 users (hackathon demo scale)
- Expected tasks per user: 10-100 tasks
- 5 basic features only (no advanced features like tags, categories, notifications)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Feature Accuracy ✅
- **Status**: PASS
- **Verification**: All 5 basic features (auth, create, view, toggle, edit, delete) are explicitly defined in spec with 37 functional requirements
- **Implementation**: Each feature maps to specific API endpoints and frontend components

### II. API Contract Clarity ✅
- **Status**: PASS
- **Verification**: REST principles will be followed with standard HTTP methods and status codes
- **Implementation**: OpenAPI contracts will be generated in Phase 1 with explicit request/response schemas

### III. Security-First Development ✅
- **Status**: PASS
- **Verification**: JWT authentication required on all protected endpoints, user isolation enforced at database level
- **Implementation**:
  - Better Auth issues JWT tokens with user ID claim
  - FastAPI middleware validates JWT on every protected route
  - SQLModel queries include `WHERE user_id = {authenticated_user_id}` filter
  - Environment variables for JWT_SECRET, DATABASE_URL

### IV. Spec-Driven Reproducibility ✅
- **Status**: PASS
- **Verification**: Following Spec-Kit Plus workflow (spec → plan → tasks → implement)
- **Implementation**: All work documented in PHRs, specialized agents used for each domain

### V. Multi-User Data Isolation ✅
- **Status**: PASS
- **Verification**: User ownership validation required in all task operations (FR-008, FR-018, FR-027, FR-031)
- **Implementation**:
  - Task model includes `user_id` foreign key
  - All queries filter by authenticated user ID
  - Ownership verified before update/delete operations

### VI. Responsive Design ✅
- **Status**: PASS
- **Verification**: Mobile-first approach required (FR-035), breakpoints defined in constitution
- **Implementation**: TailwindCSS with responsive utilities, tested on 320px-1920px viewports

**Overall Gate Status**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-web-app/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-api.yaml    # Authentication endpoints
│   └── tasks-api.yaml   # Task management endpoints
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLModel
│   │   └── task.py          # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py          # Auth request/response schemas
│   │   └── task.py          # Task request/response schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication logic
│   │   └── task.py          # Task CRUD operations
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies (JWT validation, DB session)
│   │   ├── auth.py          # Auth endpoints
│   │   └── tasks.py         # Task endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings (env vars)
│   │   ├── security.py      # JWT utilities
│   │   └── database.py      # Database connection
│   └── main.py              # FastAPI app entry point
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── test_auth.py         # Auth endpoint tests
│   └── test_tasks.py        # Task endpoint tests
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
└── README.md

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing/redirect page
│   │   ├── signup/
│   │   │   └── page.tsx     # Signup page
│   │   ├── signin/
│   │   │   └── page.tsx     # Signin page
│   │   └── tasks/
│   │       └── page.tsx     # Task list page (protected)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx
│   │   │   └── SigninForm.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── CreateTaskForm.tsx
│   │   │   ├── EditTaskModal.tsx
│   │   │   └── DeleteConfirmModal.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Navigation.tsx
│   ├── lib/
│   │   ├── auth.ts          # Better Auth configuration
│   │   ├── api.ts           # API client with JWT interceptor
│   │   └── types.ts         # TypeScript types
│   └── middleware.ts        # Route protection middleware
├── public/
├── .env.local.example       # Environment variable template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

**Structure Decision**: Web application structure selected (Option 2) because the feature requires separate frontend and backend with independent deployment. Frontend handles UI/UX and Better Auth integration, backend handles business logic and database operations. This separation enables:
- Independent scaling of frontend and backend
- Clear API contract boundary
- Specialized agent usage (nextjs-ui-builder for frontend, fastapi-backend-dev for backend)
- Parallel development of frontend and backend after API contracts are defined

## Complexity Tracking

No constitution violations - complexity tracking not required.

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed research findings.

## Phase 1: Data Models & API Contracts

See [data-model.md](./data-model.md) for entity definitions and relationships.
See [contracts/](./contracts/) for OpenAPI specifications.
See [quickstart.md](./quickstart.md) for setup and development instructions.

## Development Workflow

### Phase Sequence

1. **Setup & Infrastructure** (Foundation)
   - Initialize backend project with FastAPI
   - Initialize frontend project with Next.js 16+
   - Configure environment variables
   - Setup database connection to Neon PostgreSQL
   - Configure CORS for frontend-backend communication

2. **Authentication & Security** (P1 - Foundational)
   - Backend: Implement User model and auth endpoints
   - Backend: JWT token validation middleware
   - Frontend: Better Auth configuration for JWT issuance
   - Frontend: Signup and Signin pages
   - Frontend: API client with JWT token attachment

3. **Task Management - Create & View** (P2 - Core MVP)
   - Backend: Implement Task model with user_id foreign key
   - Backend: POST /tasks and GET /tasks endpoints with user filtering
   - Frontend: Task list page with create form
   - Frontend: Display tasks with user isolation

4. **Task Management - Toggle Completion** (P3 - High Value)
   - Backend: PATCH /tasks/{id}/toggle endpoint
   - Frontend: Checkbox/toggle UI component
   - Frontend: Optimistic UI updates

5. **Task Management - Edit** (P4 - Flexibility)
   - Backend: PUT /tasks/{id} endpoint with ownership validation
   - Frontend: Edit modal with form validation
   - Frontend: Cancel and save functionality

6. **Task Management - Delete** (P5 - Cleanup)
   - Backend: DELETE /tasks/{id} endpoint with ownership validation
   - Frontend: Delete confirmation modal
   - Frontend: Remove from UI after successful deletion

### Agent Assignment

- **auth-security agent**: User authentication, JWT implementation, password hashing, security middleware
- **neon-db-manager agent**: Database schema design, migrations, connection pooling, query optimization
- **fastapi-backend-dev agent**: API endpoints, request/response validation, error handling, CORS configuration
- **nextjs-ui-builder agent**: Frontend pages, components, responsive layouts, Better Auth integration

### Validation Strategy

**Per-Feature Validation**:
- Unit tests for each service function
- Integration tests for each API endpoint
- Frontend component tests for user interactions
- End-to-end tests for complete user flows

**Security Validation**:
- Verify JWT token required on all protected endpoints
- Test user isolation: User A cannot access User B's tasks
- Test invalid token handling (expired, malformed, missing)
- Test password hashing (never store plaintext)

**API Contract Validation**:
- Verify all endpoints return documented status codes
- Verify request/response schemas match OpenAPI spec
- Test error responses (400, 401, 404, 500)
- Verify CORS headers present

**Frontend Validation**:
- Test responsive design on 320px, 768px, 1024px, 1920px viewports
- Verify JWT token attached to all API requests
- Test error message display for all error scenarios
- Verify loading states during async operations

**Data Persistence Validation**:
- Create task → refresh page → verify task persists
- Sign out → sign in → verify tasks still present
- Test concurrent operations (multiple tabs)
- Verify database constraints (unique email, required fields)

## Risk Analysis

### High Priority Risks

1. **JWT Secret Mismatch Between Frontend and Backend**
   - **Impact**: Authentication will fail completely
   - **Mitigation**: Use shared environment variable, document in quickstart.md, validate during setup
   - **Detection**: Integration tests will fail immediately

2. **User Isolation Bypass**
   - **Impact**: Critical security vulnerability, data leakage between users
   - **Mitigation**: Enforce `WHERE user_id = {authenticated_user_id}` in all queries, security review by auth-security agent
   - **Detection**: Integration tests with multiple users, security audit

3. **CORS Configuration Issues**
   - **Impact**: Frontend cannot communicate with backend
   - **Mitigation**: Configure CORS middleware early, test with actual frontend origin
   - **Detection**: Browser console errors, network tab shows CORS errors

### Medium Priority Risks

4. **Database Connection Pool Exhaustion**
   - **Impact**: Application becomes unresponsive under load
   - **Mitigation**: Configure connection pool limits, implement connection timeout
   - **Detection**: Load testing, monitoring connection pool metrics

5. **JWT Token Expiration Handling**
   - **Impact**: Users unexpectedly signed out, poor UX
   - **Mitigation**: Implement token refresh mechanism or clear expiration messaging
   - **Detection**: User testing, session timeout scenarios

### Low Priority Risks

6. **Task List Performance with Large Datasets**
   - **Impact**: Slow page load for users with many tasks
   - **Mitigation**: Implement pagination or lazy loading if needed
   - **Detection**: Performance testing with 100+ tasks per user

## Next Steps

After `/sp.plan` completion:
1. Review research.md, data-model.md, contracts/, and quickstart.md
2. Run `/sp.tasks` to generate dependency-ordered task list
3. Begin implementation using specialized agents in priority order (P1 → P2 → P3 → P4 → P5)
