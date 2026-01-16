# Implementation Plan: Todo App Authentication & Security

**Branch**: `003-003-auth-security` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-003-auth-security/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure multi-user authentication using Better Auth (Next.js frontend) with JWT tokens and enforce authorization in FastAPI backend. The system enables user registration/login, generates JWT tokens with 7-day expiration signed with HS256 algorithm, verifies tokens on all protected endpoints, and enforces user isolation at the database query level. This feature targets hackathon judges evaluating authentication flow, security, and user data isolation.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript (frontend Next.js 16+)
**Primary Dependencies**: Better Auth (JWT), FastAPI 0.109+, python-jose 3.3+ (JWT verification), passlib 1.7+ (bcrypt), SQLModel 0.0.14+, psycopg2-binary 2.9+
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling enabled) - already configured from features 001 and 002
**Testing**: Manual testing for authentication flow (login, token issuance, protected routes, user isolation), pytest for unit tests (optional)
**Target Platform**: Web application - Linux server (containerized deployment) for backend, modern browsers for frontend
**Project Type**: Web (separate frontend and backend with independent deployment capability)
**Performance Goals**: <500ms p95 response time for authentication endpoints, handle 100 concurrent authenticated users, JWT verification <50ms
**Constraints**: Stateless JWT authentication (no server-side sessions), 7-day token expiration, HS256 algorithm only, shared JWT_SECRET between frontend and backend, Authorization: Bearer <token> header format
**Scale/Scope**: Multi-user authentication system, 5 user stories (P1-P5), 42 functional requirements, 6 API endpoints (signup, signin, protected task endpoints), JWT token lifecycle management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Feature Accuracy ✅

- **Requirement**: All 5 user stories (P1-P5) MUST be implemented exactly as specified with full functionality
- **Status**: PASS - Specification defines 5 complete user stories with acceptance scenarios
- **Evidence**:
  - P1: User Registration and Login (5 acceptance scenarios)
  - P2: JWT Token Generation and Issuance (5 acceptance scenarios)
  - P3: Backend JWT Token Verification (7 acceptance scenarios)
  - P4: User Isolation and Task Ownership Enforcement (6 acceptance scenarios)
  - P5: Token Expiration and Session Management (5 acceptance scenarios)
  - All 42 functional requirements are specific and testable

### II. API Contract Clarity ✅

- **Requirement**: All API endpoints MUST adhere to REST principles with clear, predictable contracts
- **Status**: PASS - Specification defines standard HTTP status codes and consistent error responses
- **Evidence**:
  - FR-027 to FR-030: Authorization: Bearer <token> header format specified
  - FR-037: Structured error responses with consistent format: { "code": "ERROR_CODE", "message": "Human-readable message", "details": {} }
  - FR-029: Standard HTTP status codes (200, 201, 204, 400, 401, 404, 500)
  - C-027 to C-030: API constraints enforce REST principles

### III. Security-First Development ✅

- **Requirement**: JWT-based authentication with proper token verification on every protected endpoint, user data isolation at database query level
- **Status**: PASS - All security requirements are explicitly defined
- **Evidence**:
  - FR-015 to FR-023: JWT token verification on all protected endpoints
  - FR-016: Signature verification using shared JWT_SECRET and HS256 algorithm
  - FR-017: Token expiration validation against server time
  - FR-018 to FR-021: 401 Unauthorized responses for invalid/expired/missing tokens
  - FR-024 to FR-030: User isolation at database query level (WHERE user_id filtering)
  - C-009 to C-016: Security constraints prohibit hardcoded secrets, require database-level isolation
  - FR-004: Password hashing with bcrypt (cost factor 10)
  - FR-039: HTTPS in production

### IV. Spec-Driven Reproducibility ✅

- **Requirement**: Development MUST follow Spec-Kit Plus workflow with specialized agents
- **Status**: PASS - Workflow constraints are documented
- **Evidence**:
  - C-017: MUST follow SDD workflow (specify → plan → tasks → implement)
  - C-018: All implementation via Claude Code with specialized agents
  - C-019: MUST use auth-security agent for authentication implementation
  - C-020: MUST use fastapi-backend-dev agent for backend API modifications
  - C-021: MUST use nextjs-ui-builder agent for frontend authentication UI
  - C-022: MUST create PHRs for all implementation work
  - C-023: MUST create ADRs for significant decisions

### V. Multi-User Data Isolation ✅

- **Requirement**: Every database query MUST filter by authenticated user's ID
- **Status**: PASS - User isolation is enforced at database query level
- **Evidence**:
  - FR-024: Backend MUST filter all task queries by authenticated user_id
  - FR-025: Backend MUST set user_id when creating new tasks
  - FR-026: Return 404 (not 403) for ownership violations
  - FR-027 to FR-028: Verify ownership before update/delete operations
  - FR-030: Enforce isolation at database query level, not application logic level
  - C-012: User isolation at database query level (WHERE user_id = {authenticated_user_id})
  - SC-005: User isolation is 100% effective - User A can never access User B's tasks

### VI. Responsive Design ⚠️ NOT APPLICABLE

- **Requirement**: Frontend interfaces MUST be responsive across devices
- **Status**: NOT APPLICABLE - This feature focuses on authentication backend logic and JWT token flow
- **Rationale**: Authentication endpoints are backend-focused. Frontend authentication UI (signup/login forms) will inherit responsive design from existing frontend implementation (feature 001). This feature does not introduce new UI components requiring responsive design validation.

**Overall Gate Status**: ✅ PASS - All applicable constitution principles satisfied, ready for Phase 0 research

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts (research.md, data-model.md, contracts/, quickstart.md)*

### I. Feature Accuracy ✅

- **Status**: PASS - All 5 user stories have complete design artifacts
- **Evidence**:
  - research.md: 6 key technical decisions documented with rationale and alternatives
  - data-model.md: Complete entity definitions with SQLModel code and query patterns
  - contracts/auth-flow.md: Detailed authentication flow diagrams for all 5 user stories
  - contracts/jwt-lifecycle.md: Complete JWT token lifecycle documentation (8 phases)
  - contracts/openapi.yaml: Full OpenAPI 3.0 specification with all endpoints and schemas
  - quickstart.md: Step-by-step testing procedures for all user stories
- **Design Quality**: All user stories are implementable with clear technical specifications

### II. API Contract Clarity ✅

- **Status**: PASS - Complete OpenAPI 3.0 specification with all endpoints, schemas, and error responses
- **Evidence**:
  - contracts/openapi.yaml: 6 endpoints fully specified (signup, signin, list tasks, create task, get task, update task, delete task, toggle task)
  - All endpoints include request/response schemas, authentication requirements, and error responses
  - Consistent error response format: { "code": "ERROR_CODE", "message": "Human-readable message", "details": {} }
  - Authorization: Bearer <token> header format documented
- **Design Quality**: API contracts are complete, consistent, and ready for implementation

### III. Security-First Development ✅

- **Status**: PASS - Comprehensive security architecture documented with mitigations for all identified risks
- **Evidence**:
  - research.md Decision 6: 8 security risks identified with specific mitigations
  - contracts/jwt-lifecycle.md: Complete token verification process with signature and expiration validation
  - data-model.md: All query patterns include user_id filtering for user isolation
  - contracts/auth-flow.md: User isolation enforcement diagram shows 404 (not 403) for ownership violations
  - quickstart.md: Security validation checklist with 30+ security checks
- **Design Quality**: Security is designed into every layer (JWT verification, database queries, error responses)

### IV. Spec-Driven Reproducibility ✅

- **Status**: PASS - Complete design artifacts ready for task generation via `/sp.tasks`
- **Evidence**:
  - research.md: 6 decisions with rationale, alternatives, and trade-offs
  - data-model.md: Complete entity definitions with SQLModel code examples
  - contracts/: 3 contract documents (auth-flow.md, jwt-lifecycle.md, openapi.yaml)
  - quickstart.md: Step-by-step setup, testing, and validation procedures
  - All artifacts reference specific file paths and code examples
- **Design Quality**: All artifacts are detailed, actionable, and ready for specialized agents

### V. Multi-User Data Isolation ✅

- **Status**: PASS - Database-level isolation patterns documented with code examples
- **Evidence**:
  - data-model.md: All query patterns include `WHERE user_id = {authenticated_user_id}`
  - data-model.md: Ownership verification patterns for update/delete operations
  - contracts/auth-flow.md: User isolation enforcement diagram with database queries
  - quickstart.md: User isolation testing procedures (Test 6)
  - All queries extract user_id from JWT token, not from request parameters
- **Design Quality**: Isolation is enforced at database query level with concrete code examples

### VI. Responsive Design ⚠️ NOT APPLICABLE

- **Status**: NOT APPLICABLE - This feature focuses on authentication backend logic and JWT token flow
- **Rationale**: Authentication endpoints are backend-focused. Frontend authentication UI (signup/login forms) will inherit responsive design from existing frontend implementation (feature 001). This feature does not introduce new UI components requiring responsive design validation.

**Overall Post-Design Gate Status**: ✅ PASS - Design is complete, constitution-compliant, and ready for task generation via `/sp.tasks`

**Design Artifacts Summary**:
- ✅ research.md: 6 technical decisions with comprehensive analysis
- ✅ data-model.md: Complete entity definitions with SQLModel code and query patterns
- ✅ contracts/auth-flow.md: Authentication flow diagrams for all user stories
- ✅ contracts/jwt-lifecycle.md: JWT token lifecycle documentation (8 phases)
- ✅ contracts/openapi.yaml: OpenAPI 3.0 specification with 6 endpoints
- ✅ quickstart.md: Setup, testing, and validation guide
- ✅ CLAUDE.md: Agent context updated with new technologies

**Readiness**: All design artifacts are complete and ready for implementation task generation.

## Project Structure

### Documentation (this feature)

```text
specs/003-003-auth-security/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-flow.md     # Authentication flow diagram
│   ├── jwt-lifecycle.md # JWT token lifecycle overview
│   └── openapi.yaml     # API specification for auth endpoints
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Requirements checklist (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── core/
│   │   ├── config.py         # Environment configuration (JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS)
│   │   ├── database.py       # SQLModel engine and session management (already exists)
│   │   └── security.py       # JWT validation and password hashing utilities (UPDATE: add JWT verification)
│   ├── models/
│   │   ├── user.py           # User entity (already exists from feature 001)
│   │   └── task.py           # Task entity (already exists from feature 002)
│   ├── schemas/
│   │   ├── auth.py           # JWT token response schemas (UPDATE: add token schemas)
│   │   └── task.py           # Task request/response schemas (already exists)
│   ├── services/
│   │   ├── auth.py           # JWT token validation service (UPDATE: add JWT verification logic)
│   │   └── task.py           # Task CRUD business logic (UPDATE: add user_id filtering)
│   ├── api/
│   │   ├── deps.py           # FastAPI dependencies (UPDATE: add get_current_user from JWT)
│   │   ├── auth.py           # Authentication endpoints (UPDATE: add signup/signin endpoints)
│   │   └── tasks.py          # Task endpoints router (UPDATE: add JWT authentication dependency)
│   └── main.py               # FastAPI application (UPDATE: register auth router)
├── alembic/
│   ├── env.py                # Alembic configuration (already exists)
│   └── versions/             # Database migration scripts (already exists)
├── tests/
│   ├── conftest.py           # Pytest fixtures (already exists)
│   ├── test_auth.py          # JWT validation tests (NEW: add authentication tests)
│   └── test_tasks.py         # Task CRUD endpoint tests (UPDATE: add user isolation tests)
├── requirements.txt          # Python dependencies (UPDATE: add python-jose)
├── .env.example              # Environment variable template (UPDATE: add JWT_SECRET)
└── README.md                 # Backend setup and deployment instructions (already exists)

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signup/
│   │   │   │   └── page.tsx  # Signup page (UPDATE: integrate Better Auth)
│   │   │   └── signin/
│   │   │       └── page.tsx  # Signin page (UPDATE: integrate Better Auth)
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Dashboard page (UPDATE: add JWT token attachment)
│   │   └── layout.tsx        # Root layout (UPDATE: add auth context provider)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx    # Signup form component (UPDATE: Better Auth integration)
│   │   │   ├── SigninForm.tsx    # Signin form component (UPDATE: Better Auth integration)
│   │   │   └── AuthProvider.tsx  # Auth context provider (NEW: JWT token management)
│   │   └── tasks/
│   │       └── TaskList.tsx      # Task list component (UPDATE: add JWT token to API calls)
│   ├── lib/
│   │   ├── auth.ts           # Better Auth configuration (UPDATE: JWT plugin setup)
│   │   └── api.ts            # API client (UPDATE: add Authorization header interceptor)
│   └── types/
│       └── auth.ts           # Authentication types (NEW: JWT token types)
├── .env.local.example        # Environment variable template (UPDATE: add JWT_SECRET)
└── package.json              # Frontend dependencies (UPDATE: add Better Auth)
```

**Structure Decision**: Web application structure with separate backend and frontend. This feature extends the existing implementation from features 001 (todo-web-app) and 002 (backend-api) by adding JWT-based authentication. The backend directory contains FastAPI code for JWT verification and user isolation. The frontend directory contains Next.js code for Better Auth integration and JWT token management. Most files already exist and will be updated to add authentication functionality.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied by the specification and technical approach.

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
