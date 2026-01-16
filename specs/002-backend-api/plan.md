# Implementation Plan: Todo App Backend API & Database

**Branch**: `002-backend-api` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-backend-api/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a secure, user-isolated REST API for task management using FastAPI, SQLModel, and Neon PostgreSQL. The API validates JWT tokens from Better Auth on all protected endpoints and enforces user data isolation at the database query level. Implements full CRUD operations for tasks (create, read, update, delete, toggle completion) with proper error handling and RESTful design principles.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109+, SQLModel 0.0.14+, psycopg2-binary 2.9+, python-jose 3.3+ (JWT), passlib 1.7+ (bcrypt), Alembic 1.13+ (migrations)
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling enabled)
**Testing**: pytest 7.4+, httpx 0.26+ (async client), pytest-asyncio 0.23+
**Target Platform**: Linux server (containerized deployment, HTTPS via reverse proxy)
**Project Type**: Web (backend API only - frontend exists separately)
**Performance Goals**: <500ms p95 response time, handle 100 concurrent authenticated users
**Constraints**: Stateless API (no server-side sessions), JWT validation on every protected request, user isolation at query level
**Scale/Scope**: Multi-user task management, 5 core endpoints (list, create, get, update, delete, toggle), RESTful design

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### API Contract Clarity ✅
- **Requirement**: All API endpoints MUST adhere to REST principles with clear, predictable contracts
- **Status**: PASS - Specification defines 6 RESTful endpoints with standard HTTP methods and status codes
- **Evidence**: FR-039 to FR-042 specify proper HTTP status codes (200, 201, 204, 400, 401, 404, 500) and structured error responses

### Security-First Development ✅
- **Requirement**: JWT-based authentication with proper token verification on every protected endpoint
- **Status**: PASS - All requirements enforce JWT validation and user isolation
- **Evidence**:
  - FR-001 to FR-005: JWT token validation on all protected endpoints
  - FR-015, FR-022, FR-026, FR-033: User ownership verification before operations
  - C-013 to C-016: Security constraints prohibit hardcoded secrets and require query-level isolation

### Multi-User Data Isolation ✅
- **Requirement**: Every database query MUST filter by authenticated user's ID
- **Status**: PASS - User isolation is enforced at database query level
- **Evidence**:
  - FR-015: API MUST return only tasks belonging to authenticated user
  - FR-022, FR-026, FR-033: Verify task ownership before modifications
  - SC-003: User isolation is 100% effective (success criterion)

### Technology Stack Constraints ✅
- **Requirement**: Must use FastAPI, SQLModel, Neon PostgreSQL, Better Auth JWT
- **Status**: PASS - All required technologies specified
- **Evidence**:
  - C-001: Must use FastAPI framework
  - C-002: Must use SQLModel ORM
  - C-003: Must use Neon Serverless PostgreSQL
  - C-004: JWT tokens compatible with Better Auth

### Spec-Driven Reproducibility ✅
- **Requirement**: Follow Spec-Kit Plus workflow with specialized agents
- **Status**: PASS - Workflow constraints documented
- **Evidence**:
  - C-009: Implementation must follow SDD workflow
  - C-010: All implementation via Claude Code with specialized agents
  - C-011: Must use fastapi-backend-dev agent for API endpoints
  - C-012: Must use auth-security agent for authentication reviews

**Overall Gate Status**: ✅ PASS - All constitution principles satisfied, ready for Phase 0 research

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts (research.md, data-model.md, contracts/, quickstart.md)*

### API Contract Clarity ✅
- **Status**: PASS - OpenAPI specification defines all 6 endpoints with complete request/response schemas
- **Evidence**: contracts/openapi.yaml includes detailed schemas, error responses, and examples
- **Design Quality**: RESTful design with proper HTTP methods, status codes, and consistent error format

### Security-First Development ✅
- **Status**: PASS - JWT validation and user isolation patterns documented in research.md and data-model.md
- **Evidence**:
  - research.md Decision 1: JWT validation strategy with python-jose
  - research.md Decision 2: User isolation at database query level
  - data-model.md: All queries include `WHERE user_id = {authenticated_user_id}`
- **Design Quality**: Security patterns are concrete and implementable

### Multi-User Data Isolation ✅
- **Status**: PASS - Database schema enforces foreign key constraints, query patterns enforce user filtering
- **Evidence**:
  - data-model.md: Foreign key constraint with CASCADE delete
  - data-model.md: Index on user_id for fast filtering
  - Query examples show explicit user_id filtering in all operations
- **Design Quality**: Isolation enforced at multiple levels (database, ORM, application)

### Technology Stack Constraints ✅
- **Status**: PASS - All required technologies specified in Technical Context and research.md
- **Evidence**:
  - FastAPI 0.109+, SQLModel 0.0.14+, Neon PostgreSQL confirmed
  - Dependencies listed in Technical Context
  - research.md justifies each technology choice
- **Design Quality**: Technology choices are well-reasoned with alternatives considered

### Spec-Driven Reproducibility ✅
- **Status**: PASS - Complete design artifacts ready for task generation
- **Evidence**:
  - research.md: 6 key decisions with rationale and alternatives
  - data-model.md: Complete entity definitions with SQLModel code
  - contracts/openapi.yaml: Full API specification
  - quickstart.md: Step-by-step setup and testing guide
- **Design Quality**: All artifacts are detailed, actionable, and ready for implementation

**Overall Post-Design Gate Status**: ✅ PASS - Design is complete, constitution-compliant, and ready for task generation via `/sp.tasks`

## Project Structure

### Documentation (this feature)

```text
specs/002-backend-api/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── openapi.yaml     # OpenAPI 3.0 specification for all endpoints
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Requirements checklist (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── core/
│   │   ├── config.py         # Environment configuration (DATABASE_URL, JWT_SECRET)
│   │   ├── database.py       # SQLModel engine and session management
│   │   └── security.py       # JWT validation and password hashing utilities
│   ├── models/
│   │   ├── user.py           # User entity (id, email, hashed_password)
│   │   └── task.py           # Task entity (id, user_id, title, description, is_completed)
│   ├── schemas/
│   │   ├── auth.py           # JWT token response schemas
│   │   └── task.py           # Task request/response schemas (CreateTaskRequest, UpdateTaskRequest, TaskResponse)
│   ├── services/
│   │   ├── auth.py           # JWT token validation service
│   │   └── task.py           # Task CRUD business logic with user isolation
│   ├── api/
│   │   ├── deps.py           # FastAPI dependencies (get_current_user from JWT)
│   │   └── tasks.py          # Task endpoints router (GET, POST, PUT, PATCH, DELETE)
│   └── main.py               # FastAPI application with CORS middleware
├── alembic/
│   ├── env.py                # Alembic configuration
│   └── versions/             # Database migration scripts
│       ├── 001_create_users.py
│       └── 002_create_tasks.py
├── tests/
│   ├── conftest.py           # Pytest fixtures (test database, test client)
│   ├── test_auth.py          # JWT validation tests
│   └── test_tasks.py         # Task CRUD endpoint tests with user isolation
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable template
└── README.md                 # Backend setup and deployment instructions
```

**Structure Decision**: Web application structure with backend-only focus. The backend directory already exists from the previous implementation (001-todo-web-app). This feature extends the existing backend with proper JWT validation and user-isolated task endpoints. The frontend directory exists separately and is out of scope for this feature.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied by the specification and technical approach.
