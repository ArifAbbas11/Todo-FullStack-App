# Tasks: Todo App Backend API & Database

**Input**: Design documents from `/specs/002-backend-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend structure**: `backend/src/` (web application with separate frontend)
- **Tests**: `backend/tests/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify backend directory structure exists from previous implementation (backend/src/, backend/tests/, backend/alembic/)
- [x] T002 Update backend/requirements.txt with FastAPI 0.109+, SQLModel 0.0.14+, psycopg2-binary 2.9+, python-jose 3.3+, passlib 1.7+, Alembic 1.13+, pytest 7.4+, httpx 0.26+, pytest-asyncio 0.23+
- [x] T003 [P] Create backend/.env.example with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, FRONTEND_URL, HOST, PORT
- [x] T004 [P] Update backend/README.md with setup instructions, environment variables, and quickstart guide

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update backend/src/core/config.py to load JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS from environment variables
- [x] T006 [P] Verify backend/src/core/database.py has SQLModel engine configured with Neon PostgreSQL connection string and pool_pre_ping=True
- [x] T007 [P] Update backend/src/core/security.py with JWT token validation functions: decode_access_token(token) -> Optional[Dict[str, Any]]
- [x] T008 Create backend/src/models/user.py with User SQLModel entity (id: UUID, email: str, hashed_password: str, created_at: datetime, updated_at: datetime)
- [x] T009 Create backend/src/models/task.py with Task SQLModel entity (id: UUID, user_id: UUID FK, title: str, description: Optional[str], is_completed: bool, created_at: datetime, updated_at: datetime)
- [x] T010 Create backend/alembic/versions/001_create_users.py migration to create users table with indexes on id and email
- [x] T011 Create backend/alembic/versions/002_create_tasks.py migration to create tasks table with foreign key to users, indexes on user_id and (user_id, created_at DESC)
- [x] T012 Create backend/src/schemas/task.py with Pydantic schemas: CreateTaskRequest, UpdateTaskRequest, TaskResponse, TaskListResponse
- [x] T013 Update backend/src/main.py to configure CORS middleware with FRONTEND_URL from environment, add health check endpoint GET /health

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - API Authentication and Authorization (Priority: P1) 🎯 MVP

**Goal**: Validate JWT tokens from Better Auth on all protected endpoints and extract authenticated user ID for request authorization

**Independent Test**: Send requests with valid JWT token (should be authorized), invalid token (should return 401), expired token (should return 401), and no token (should return 401)

### Implementation for User Story 1

- [x] T014 [US1] Create backend/src/services/auth.py with verify_jwt_token(token: str) -> Dict[str, Any] function that validates JWT signature and expiration using python-jose
- [x] T015 [US1] Create backend/src/api/deps.py with get_current_user(token: str = Depends(oauth2_scheme)) FastAPI dependency that extracts user_id from JWT token and returns it
- [x] T016 [US1] Add HTTPException handlers in backend/src/api/deps.py for invalid/expired tokens (401 Unauthorized with structured error response)
- [x] T017 [US1] Update backend/src/main.py to include error handlers for 401, 404, 500 with consistent ErrorResponse format

**Checkpoint**: At this point, JWT validation is functional and all protected endpoints can use get_current_user dependency

---

## Phase 4: User Story 2 - Task Creation and Retrieval (Priority: P2)

**Goal**: Allow authenticated users to create new tasks and retrieve their task list with user isolation enforced at database query level

**Independent Test**: Authenticate as User A, create multiple tasks, retrieve task list (should only see User A's tasks). Authenticate as User B, retrieve task list (should only see User B's tasks, not User A's)

### Implementation for User Story 2

- [x] T018 [P] [US2] Create backend/src/services/task.py with create_task(title: str, description: Optional[str], user_id: UUID, session: Session) -> Task function that creates task with user_id and validates title length
- [x] T019 [P] [US2] Add get_tasks_by_user(user_id: UUID, session: Session) -> List[Task] function in backend/src/services/task.py that queries tasks filtered by user_id, ordered by created_at DESC
- [x] T020 [P] [US2] Add get_task_by_id(task_id: UUID, user_id: UUID, session: Session) -> Optional[Task] function in backend/src/services/task.py that queries task with user_id filter for ownership verification
- [x] T021 [US2] Create backend/src/api/tasks.py router with POST /api/tasks endpoint that calls create_task service with current_user_id from get_current_user dependency
- [x] T022 [US2] Add GET /api/tasks endpoint in backend/src/api/tasks.py that calls get_tasks_by_user service and returns TaskListResponse with count
- [x] T023 [US2] Add GET /api/tasks/{task_id} endpoint in backend/src/api/tasks.py that calls get_task_by_id service and returns 404 if task not found or not owned by user
- [x] T024 [US2] Add request validation in backend/src/api/tasks.py POST endpoint for empty title, title length > 500 chars, description length > 5000 chars (return 400 Bad Request)
- [x] T025 [US2] Register tasks router in backend/src/main.py with prefix /api

**Checkpoint**: At this point, users can create and retrieve tasks with full user isolation

---

## Phase 5: User Story 3 - Task Completion Toggle (Priority: P3)

**Goal**: Allow authenticated users to toggle task completion status (false → true or true → false)

**Independent Test**: Create a task (is_completed=false), toggle it (should become true), toggle again (should become false). Verify persistence across requests.

### Implementation for User Story 3

- [x] T026 [US3] Add toggle_task_completion(task_id: UUID, user_id: UUID, session: Session) -> Optional[Task] function in backend/src/services/task.py that verifies ownership, toggles is_completed, updates updated_at, and commits
- [x] T027 [US3] Add PATCH /api/tasks/{task_id}/toggle endpoint in backend/src/api/tasks.py that calls toggle_task_completion service and returns 404 if task not found or not owned by user
- [x] T028 [US3] Add error handling in backend/src/api/tasks.py PATCH endpoint for non-existent task IDs and ownership violations (return 404 Not Found)

**Checkpoint**: At this point, users can toggle task completion status with ownership verification

---

## Phase 6: User Story 4 - Task Modification (Priority: P4)

**Goal**: Allow authenticated users to update task title and description with validation

**Independent Test**: Create a task, update its title and description via PUT request, verify changes persist. Test validation errors for empty title.

### Implementation for User Story 4

- [x] T029 [US4] Add update_task(task_id: UUID, title: str, description: Optional[str], user_id: UUID, session: Session) -> Optional[Task] function in backend/src/services/task.py that verifies ownership, validates title, updates fields, updates updated_at, and commits
- [x] T030 [US4] Add PUT /api/tasks/{task_id} endpoint in backend/src/api/tasks.py that accepts UpdateTaskRequest, calls update_task service, and returns 404 if task not found or not owned by user
- [x] T031 [US4] Add request validation in backend/src/api/tasks.py PUT endpoint for empty title, title length > 500 chars, description length > 5000 chars (return 400 Bad Request)
- [x] T032 [US4] Add error handling in backend/src/api/tasks.py PUT endpoint for ownership violations (return 404 Not Found, not 403 to avoid revealing task existence)

**Checkpoint**: At this point, users can update task title and description with full validation

---

## Phase 7: User Story 5 - Task Deletion (Priority: P5)

**Goal**: Allow authenticated users to permanently delete tasks with ownership verification

**Independent Test**: Create a task, delete it via DELETE request, verify it no longer appears in task list. Test deletion of non-existent task (should return 404).

### Implementation for User Story 5

- [x] T033 [US5] Add delete_task(task_id: UUID, user_id: UUID, session: Session) -> bool function in backend/src/services/task.py that verifies ownership, deletes task, and returns True if deleted or False if not found
- [x] T034 [US5] Add DELETE /api/tasks/{task_id} endpoint in backend/src/api/tasks.py that calls delete_task service and returns 204 No Content on success or 404 if task not found or not owned by user
- [x] T035 [US5] Add error handling in backend/src/api/tasks.py DELETE endpoint for non-existent task IDs and ownership violations (return 404 Not Found)

**Checkpoint**: At this point, all 5 user stories are complete and independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T036 [P] Add structured logging in backend/src/services/task.py for all CRUD operations (task created, updated, deleted, etc.)
- [x] T037 [P] Add database connection error handling in backend/src/core/database.py with graceful degradation (return 500 Internal Server Error)
- [x] T038 [P] Verify all error responses in backend/src/api/tasks.py follow consistent ErrorResponse format with code, message, and details fields
- [x] T039 [P] Add input sanitization in backend/src/services/task.py for title and description fields (strip whitespace, prevent SQL injection via parameterized queries)
- [x] T040 Run database migrations: alembic upgrade head to create users and tasks tables in Neon PostgreSQL
- [x] T041 Verify quickstart.md instructions work end-to-end: setup environment, run migrations, start server, test endpoints with curl
- [x] T042 [P] Update backend/README.md with API documentation links (Swagger UI at /docs, ReDoc at /redoc)

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 for task existence but is independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires US2 for task existence but is independently testable
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Requires US2 for task existence but is independently testable

### Within Each User Story

- Models before services (T008-T009 before T014+)
- Services before endpoints (T018-T020 before T021-T023)
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T003 and T004 can run in parallel
- **Foundational Phase**: T006, T007 can run in parallel after T005; T010, T011 can run in parallel after T008-T009
- **User Story 2**: T018, T019, T020 can run in parallel (different service functions)
- **Polish Phase**: T036, T037, T038, T039, T042 can run in parallel
- **Once Foundational completes**: All user stories (US1-US5) can start in parallel if team capacity allows

---

## Parallel Example: User Story 2

```bash
# Launch all service functions for User Story 2 together:
Task: "Create create_task function in backend/src/services/task.py"
Task: "Add get_tasks_by_user function in backend/src/services/task.py"
Task: "Add get_task_by_id function in backend/src/services/task.py"

# Then implement endpoints sequentially (depend on services):
Task: "Create POST /api/tasks endpoint in backend/src/api/tasks.py"
Task: "Add GET /api/tasks endpoint in backend/src/api/tasks.py"
Task: "Add GET /api/tasks/{task_id} endpoint in backend/src/api/tasks.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T014-T017)
4. **STOP and VALIDATE**: Test JWT validation independently with curl/Postman
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T013)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T014-T017)
3. Add User Story 2 → Test independently → Deploy/Demo (T018-T025)
4. Add User Story 3 → Test independently → Deploy/Demo (T026-T028)
5. Add User Story 4 → Test independently → Deploy/Demo (T029-T032)
6. Add User Story 5 → Test independently → Deploy/Demo (T033-T035)
7. Polish → Final deployment (T036-T042)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T017)
   - Developer B: User Story 2 (T018-T025) - can start in parallel with US1
   - Developer C: User Story 3 (T026-T028) - can start after US2 models exist
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 42 tasks across 8 phases

**Task Count by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 9 tasks (BLOCKING)
- Phase 3 (US1 - Authentication): 4 tasks
- Phase 4 (US2 - Task Creation/Retrieval): 8 tasks
- Phase 5 (US3 - Task Completion Toggle): 3 tasks
- Phase 6 (US4 - Task Modification): 4 tasks
- Phase 7 (US5 - Task Deletion): 3 tasks
- Phase 8 (Polish): 7 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: JWT validation works (valid token authorized, invalid/expired/missing tokens return 401)
- US2: Task creation and retrieval with user isolation (User A cannot see User B's tasks)
- US3: Task completion toggle persists across requests
- US4: Task updates persist with validation enforced
- US5: Task deletion removes task from database and task list

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 17 tasks

**Format Validation**: ✅ All 42 tasks follow the checklist format with checkbox, task ID, optional [P] marker, optional [Story] label, and file paths

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend structure uses backend/src/ prefix (web application with separate frontend)
- User isolation is enforced at database query level (WHERE user_id = {authenticated_user_id})
- All endpoints return structured error responses with consistent format
- JWT secret MUST match Better Auth secret from frontend
- Database migrations MUST be run before starting the server
