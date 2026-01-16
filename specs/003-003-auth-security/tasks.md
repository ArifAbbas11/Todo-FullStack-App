# Tasks: Todo App Authentication & Security

**Input**: Design documents from `/specs/003-003-auth-security/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification. Manual testing procedures are documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend structure**: `backend/src/` (web application with separate frontend)
- **Frontend structure**: `frontend/src/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [x] T001 Verify backend and frontend directory structures exist from previous implementations (backend/src/, frontend/src/)
- [x] T002 Update backend/requirements.txt to include python-jose[cryptography]==3.3.0 for JWT token verification
- [x] T003 [P] Update backend/.env.example with JWT_SECRET, JWT_ALGORITHM=HS256, JWT_EXPIRATION_HOURS=168 (7 days)
- [x] T004 [P] Update frontend/.env.local.example with NEXT_PUBLIC_JWT_SECRET (must match backend JWT_SECRET)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update backend/src/core/config.py to load JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS from environment variables
- [x] T006 [P] Update backend/src/core/security.py with JWT token verification function: decode_access_token(token: str) -> Optional[Dict[str, Any]] using python-jose
- [x] T007 [P] Verify backend/src/models/user.py exists with User SQLModel entity (id: UUID, email: str, hashed_password: str, created_at, updated_at) from feature 001
- [x] T008 [P] Verify backend/src/models/task.py exists with Task SQLModel entity (id: UUID, user_id: UUID FK, title, description, is_completed, created_at, updated_at) from feature 002
- [x] T009 Create backend/src/schemas/auth.py with Pydantic schemas: SignupRequest, SigninRequest, TokenResponse, UserResponse, ErrorResponse
- [x] T010 Verify backend/src/main.py has CORS middleware configured with FRONTEND_URL from environment variables

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Enable users to register with email/password and log in using Better Auth on Next.js frontend

**Independent Test**: Navigate to signup page, enter email/password, verify user created in database with hashed password. Then login with same credentials and verify successful authentication.

### Implementation for User Story 1

- [x] T011 [P] [US1] Configure Better Auth in frontend/src/lib/auth.ts with JWT plugin, HS256 algorithm, and 7-day expiration
- [x] T012 [P] [US1] Create frontend/src/app/(auth)/signup/page.tsx with signup form using Better Auth
- [x] T013 [P] [US1] Create frontend/src/app/(auth)/signin/page.tsx with signin form using Better Auth
- [x] T014 [US1] Create backend/src/api/auth.py router with POST /api/auth/signup endpoint that hashes password with bcrypt and creates user in database
- [x] T015 [US1] Add POST /api/auth/signin endpoint in backend/src/api/auth.py that verifies credentials and returns success response (JWT generation in next phase)
- [x] T016 [US1] Register auth router in backend/src/main.py with prefix /api/auth
- [x] T017 [US1] Add email validation (RFC 5322) and password length validation (min 8 chars) in backend/src/api/auth.py signup endpoint
- [x] T018 [US1] Add error handling for duplicate email registration (return 400 Bad Request with "Email already registered")

**Checkpoint**: ✅ At this point, users can register and login (JWT tokens are already being generated)

---

## Phase 4: User Story 2 - JWT Token Generation and Issuance (Priority: P2)

**Goal**: Generate JWT tokens with user_id and email claims after successful login, return to frontend

**Independent Test**: Login successfully, inspect response to verify JWT token is returned. Decode token at jwt.io to verify it contains user_id, email, exp (7 days), iat, and is signed with HS256.

### Implementation for User Story 2

- [x] T019 [US2] Update backend/src/services/auth.py with generate_jwt_token(user_id: UUID, email: str) -> str function that creates JWT with HS256, includes user_id/email/exp/iat claims, and signs with JWT_SECRET
- [x] T020 [US2] Update POST /api/auth/signin endpoint in backend/src/api/auth.py to call generate_jwt_token() and return TokenResponse with access_token, token_type="bearer", expires_in=604800
- [x] T021 [US2] Update frontend/src/lib/auth.ts to store JWT token in localStorage after successful signin (key: "access_token")
- [x] T022 [US2] Create frontend/src/lib/api.ts with API client that automatically attaches Authorization: Bearer <token> header to all requests

**Checkpoint**: ✅ At this point, users receive JWT tokens after login and tokens are stored in frontend

---

## Phase 5: User Story 3 - Backend JWT Token Verification (Priority: P3)

**Goal**: Verify JWT token signature and expiration on all protected endpoints, extract user_id for authorization

**Independent Test**: Make API request with valid token (should succeed), invalid token (should return 401 "Invalid token"), expired token (should return 401 "Token expired"), missing token (should return 401 "Missing authorization header").

### Implementation for User Story 3

- [x] T023 [US3] Create backend/src/api/deps.py with get_current_user(authorization: str = Header(None)) -> dict dependency that extracts token from "Bearer <token>", verifies signature with decode_access_token(), validates expiration, and returns user_id/email
- [x] T024 [US3] Add HTTPException handlers in backend/src/api/deps.py for missing token (401 "Missing authorization header"), invalid format (401 "Invalid authorization format"), invalid signature (401 "Invalid token"), expired token (401 "Token expired")
- [x] T025 [US3] Update backend/src/main.py to include error handlers for 401, 404, 500 with consistent ErrorResponse format
- [x] T026 [US3] Update GET /api/tasks endpoint in backend/src/api/tasks.py to use Depends(get_current_user) and extract user_id from dependency result
- [x] T027 [US3] Update POST /api/tasks endpoint in backend/src/api/tasks.py to use Depends(get_current_user)
- [x] T028 [US3] Update GET /api/tasks/{task_id} endpoint in backend/src/api/tasks.py to use Depends(get_current_user)
- [x] T029 [US3] Update PUT /api/tasks/{task_id} endpoint in backend/src/api/tasks.py to use Depends(get_current_user)
- [x] T030 [US3] Update PATCH /api/tasks/{task_id}/toggle endpoint in backend/src/api/tasks.py to use Depends(get_current_user)
- [x] T031 [US3] Update DELETE /api/tasks/{task_id} endpoint in backend/src/api/tasks.py to use Depends(get_current_user)

**Checkpoint**: ✅ At this point, all protected endpoints verify JWT tokens and extract user_id

---

## Phase 6: User Story 4 - User Isolation and Task Ownership Enforcement (Priority: P4)

**Goal**: Filter all database queries by authenticated user_id, verify task ownership before update/delete operations

**Independent Test**: Create tasks as User A, authenticate as User B, attempt to list tasks (should only see User B's tasks), retrieve User A's task by ID (should return 404), update User A's task (should return 404), delete User A's task (should return 404).

### Implementation for User Story 4

- [x] T032 [US4] Update get_user_tasks() function in backend/src/services/task.py to add WHERE user_id = {authenticated_user_id} filter to query
- [x] T033 [US4] Update GET /api/tasks endpoint in backend/src/api/tasks.py to pass user_id from get_current_user to get_user_tasks() service
- [x] T034 [US4] Update create_task() function in backend/src/services/task.py to set user_id from authenticated user (not from request body)
- [x] T035 [US4] Update POST /api/tasks endpoint in backend/src/api/tasks.py to pass user_id from get_current_user to create_task() service
- [x] T036 [US4] Update get_task_by_id() function in backend/src/services/task.py to add WHERE user_id = {authenticated_user_id} filter for ownership verification
- [x] T037 [US4] Update GET /api/tasks/{task_id} endpoint in backend/src/api/tasks.py to return 404 (not 403) if get_task_by_id() returns None
- [x] T038 [US4] Update update_task() function in backend/src/services/task.py to verify ownership with WHERE user_id filter before updating
- [x] T039 [US4] Update PUT /api/tasks/{task_id} endpoint in backend/src/api/tasks.py to return 404 (not 403) if update_task() returns None
- [x] T040 [US4] Update toggle_task_completion() function in backend/src/services/task.py to verify ownership before toggling
- [x] T041 [US4] Update PATCH /api/tasks/{task_id}/toggle endpoint in backend/src/api/tasks.py to return 404 if toggle_task_completion() returns None
- [x] T042 [US4] Update delete_task() function in backend/src/services/task.py to verify ownership before deleting
- [x] T043 [US4] Update DELETE /api/tasks/{task_id} endpoint in backend/src/api/tasks.py to return 404 if delete_task() returns False

**Checkpoint**: ✅ At this point, user isolation is fully enforced at database query level

---

## Phase 7: User Story 5 - Token Expiration and Session Management (Priority: P5)

**Goal**: Handle expired tokens gracefully by returning 401 and redirecting frontend to login page

**Independent Test**: Generate JWT token with short expiration (1 minute for testing), wait for expiration, make API request with expired token, verify 401 "Token expired" response, verify frontend redirects to login page.

### Implementation for User Story 5

- [x] T044 [US5] Verify backend/src/core/security.py decode_access_token() function checks exp claim against current server time and raises JWTError if expired
- [x] T045 [US5] Verify backend/src/api/deps.py get_current_user() catches JWTError and returns 401 with "Token expired" error code
- [x] T046 [US5] Create frontend/src/components/auth/AuthProvider.tsx that wraps app and handles 401 responses by deleting token and redirecting to /signin
- [x] T047 [US5] Update frontend/src/lib/api.ts to add response interceptor that catches 401 responses and triggers AuthProvider redirect
- [x] T048 [US5] Add token expiration warning in frontend/src/components/auth/AuthProvider.tsx that checks token exp claim and displays warning if < 1 hour remaining

**Checkpoint**: ✅ At this point, all 5 user stories are complete and independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T049 [P] Add structured logging in backend/src/services/auth.py for all authentication events (signup, signin, token generation, verification failures)
- [x] T050 [P] Add structured logging in backend/src/api/deps.py for all JWT verification failures (invalid token, expired token, missing token)
- [x] T051 [P] Verify all error responses in backend/src/api/auth.py and backend/src/api/tasks.py follow consistent ErrorResponse format with code, message, details fields
- [x] T052 [P] Add input sanitization in backend/src/api/auth.py for email and password fields (strip whitespace, validate format)
- [x] T053 Verify quickstart.md instructions work end-to-end: setup environment, configure JWT_SECRET, test signup/signin, test protected endpoints, test user isolation
- [x] T054 [P] Update backend/README.md with JWT configuration instructions and authentication flow documentation

**✅ Phase 8 Complete**: All polish and cross-cutting concerns have been addressed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for login flow but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 for token existence but is independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires US3 for token verification but is independently testable
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Requires US3 for token verification but is independently testable

### Within Each User Story

- Frontend and backend tasks can often run in parallel (different files)
- Configuration before implementation
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T003 and T004 can run in parallel (different files)
- **Foundational Phase**: T006, T007, T008, T009 can run in parallel (different files)
- **User Story 1**: T011, T012, T013 can run in parallel (different frontend files)
- **User Story 3**: T026-T031 can run in parallel (updating different endpoints)
- **User Story 4**: T032-T043 can run in parallel with careful coordination (different service functions and endpoints)
- **Polish Phase**: T049, T050, T051, T052, T054 can run in parallel (different files)
- **Once Foundational completes**: All user stories (US1-US5) can start in parallel if team capacity allows

---

## Parallel Example: User Story 4

```bash
# Launch all service function updates for User Story 4 together:
Task: "Update get_user_tasks with user_id filter in backend/src/services/task.py"
Task: "Update create_task with user_id from auth in backend/src/services/task.py"
Task: "Update get_task_by_id with ownership verification in backend/src/services/task.py"

# Then update endpoints sequentially (depend on services):
Task: "Update GET /api/tasks endpoint with user_id filtering"
Task: "Update POST /api/tasks endpoint with user_id from auth"
Task: "Update GET /api/tasks/{id} endpoint with ownership verification"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T011-T018)
4. **STOP and VALIDATE**: Test signup and login independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T010)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T011-T018)
3. Add User Story 2 → Test independently → Deploy/Demo (T019-T022)
4. Add User Story 3 → Test independently → Deploy/Demo (T023-T031)
5. Add User Story 4 → Test independently → Deploy/Demo (T032-T043)
6. Add User Story 5 → Test independently → Deploy/Demo (T044-T048)
7. Polish → Final deployment (T049-T054)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T010)
2. Once Foundational is done:
   - Developer A: User Story 1 (T011-T018)
   - Developer B: User Story 2 (T019-T022) - can start in parallel with US1
   - Developer C: User Story 3 (T023-T031) - can start after US2 tokens exist
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 54 tasks across 8 phases

**Task Count by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 6 tasks (BLOCKING)
- Phase 3 (US1 - Registration/Login): 8 tasks
- Phase 4 (US2 - JWT Token Generation): 4 tasks
- Phase 5 (US3 - Backend JWT Verification): 9 tasks
- Phase 6 (US4 - User Isolation): 12 tasks
- Phase 7 (US5 - Token Expiration): 5 tasks
- Phase 8 (Polish): 6 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Signup and login work, user created in database with hashed password
- US2: JWT token returned after login, contains correct claims, signed with HS256
- US3: Valid tokens accepted, invalid/expired/missing tokens return 401
- US4: User A cannot see/access/modify User B's tasks (404 responses)
- US5: Expired tokens return 401, frontend redirects to login page

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 18 tasks

**Format Validation**: ✅ All 54 tasks follow the checklist format with checkbox, task ID, optional [P] marker, optional [Story] label, and file paths

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend structure uses backend/src/ prefix (web application with separate frontend)
- Frontend structure uses frontend/src/ prefix
- User isolation is enforced at database query level (WHERE user_id = {authenticated_user_id})
- All endpoints return structured error responses with consistent format
- JWT_SECRET MUST match on both frontend and backend
- No database migrations needed (User and Task tables already exist from features 001 and 002)
