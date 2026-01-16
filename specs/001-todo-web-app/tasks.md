---

description: "Task list for Todo Full-Stack Web Application implementation"
---

# Tasks: Todo Full-Stack Web Application

**Input**: Design documents from `/specs/001-todo-web-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are OPTIONAL - not included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure: backend/src/{models,schemas,services,api,core}, backend/tests, backend/alembic/versions
- [ ] T002 Create frontend directory structure: frontend/src/app/{signup,signin,tasks}, frontend/src/components/{auth,tasks,layout}, frontend/src/lib
- [ ] T003 [P] Initialize Python virtual environment in backend/ and create requirements.txt with FastAPI, SQLModel, python-jose, passlib, psycopg2-binary, alembic, pytest, httpx
- [ ] T004 [P] Initialize Next.js 16+ project in frontend/ with TypeScript, TailwindCSS, and App Router
- [ ] T005 [P] Install Better Auth in frontend/: npm install better-auth
- [ ] T006 Create backend/.env.example with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, FRONTEND_URL placeholders
- [ ] T007 Create frontend/.env.local.example with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_JWT_SECRET, BETTER_AUTH_SECRET placeholders
- [ ] T008 Create backend/README.md with setup instructions from quickstart.md
- [ ] T009 Create frontend/README.md with setup instructions from quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create backend/src/core/config.py to load environment variables (DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, FRONTEND_URL)
- [ ] T011 Create backend/src/core/database.py with SQLModel engine and get_session dependency for Neon PostgreSQL connection
- [ ] T012 Create backend/src/core/security.py with JWT token creation, verification, and password hashing utilities (bcrypt)
- [ ] T013 Initialize Alembic in backend/ with alembic init alembic command
- [ ] T014 Configure backend/alembic/env.py to use SQLModel metadata and DATABASE_URL from config
- [ ] T015 Create initial database migration in backend/alembic/versions/ for users and tasks tables with indexes and triggers
- [ ] T016 Create backend/src/main.py with FastAPI app initialization and CORS middleware configuration (allow FRONTEND_URL origin)
- [ ] T017 [P] Configure TailwindCSS in frontend/tailwind.config.ts with custom colors and responsive breakpoints (320px, 768px, 1024px)
- [ ] T018 [P] Create frontend/src/lib/types.ts with TypeScript interfaces for User, Task, AuthResponse, TaskResponse, ErrorResponse

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication and Account Management (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, sign in, and sign out securely with JWT authentication

**Independent Test**: Create account with email/password → sign out → sign in → verify JWT token attached to requests

### Backend Implementation for User Story 1

- [ ] T019 [P] [US1] Create User model in backend/src/models/user.py with SQLModel (id: UUID, email: str unique, hashed_password: str, created_at, updated_at)
- [ ] T020 [P] [US1] Create auth request schemas in backend/src/schemas/auth.py (SignupRequest, SigninRequest with email validation and password min length 8)
- [ ] T021 [P] [US1] Create auth response schemas in backend/src/schemas/auth.py (UserResponse, AuthResponse with user and token fields)
- [ ] T022 [US1] Create auth service in backend/src/services/auth.py with signup (hash password, create user, generate JWT), signin (verify password, generate JWT), and get_current_user functions
- [ ] T023 [US1] Create JWT dependency in backend/src/api/deps.py to extract and validate JWT token from Authorization header, return current user
- [ ] T024 [US1] Create auth endpoints in backend/src/api/auth.py: POST /auth/signup (create user, return JWT), POST /auth/signin (authenticate, return JWT)
- [ ] T025 [US1] Register auth router in backend/src/main.py with /auth prefix
- [ ] T026 [US1] Run Alembic migration to create users table: alembic upgrade head

### Frontend Implementation for User Story 1

- [ ] T027 [P] [US1] Configure Better Auth in frontend/src/lib/auth.ts with JWT secret and token expiration settings
- [ ] T028 [P] [US1] Create API client in frontend/src/lib/api.ts with fetch wrapper that attaches JWT token from Better Auth to Authorization header
- [ ] T029 [P] [US1] Create SignupForm component in frontend/src/components/auth/SignupForm.tsx with email and password fields, validation, and error handling
- [ ] T030 [P] [US1] Create SigninForm component in frontend/src/components/auth/SigninForm.tsx with email and password fields, validation, and error handling
- [ ] T031 [US1] Create signup page in frontend/src/app/signup/page.tsx that renders SignupForm and calls POST /auth/signup via API client
- [ ] T032 [US1] Create signin page in frontend/src/app/signin/page.tsx that renders SigninForm and calls POST /auth/signin via API client
- [ ] T033 [US1] Create route protection middleware in frontend/src/middleware.ts to redirect unauthenticated users to /signin when accessing /tasks
- [ ] T034 [US1] Create Header component in frontend/src/components/layout/Header.tsx with sign out button that clears JWT token and redirects to /signin
- [ ] T035 [US1] Update frontend/src/app/layout.tsx to include Header component and Better Auth provider

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Create and View Tasks (Priority: P2)

**Goal**: Enable authenticated users to create new tasks and view their task list with user isolation

**Independent Test**: Sign in → create multiple tasks → verify they appear in list → verify only own tasks visible

### Backend Implementation for User Story 2

- [ ] T036 [P] [US2] Create Task model in backend/src/models/task.py with SQLModel (id: UUID, user_id: UUID FK, title: str max 500, description: str optional max 5000, is_completed: bool default False, created_at, updated_at)
- [ ] T037 [P] [US2] Create task request schemas in backend/src/schemas/task.py (CreateTaskRequest with title required and description optional)
- [ ] T038 [P] [US2] Create task response schemas in backend/src/schemas/task.py (TaskResponse, TaskListResponse with tasks array and count)
- [ ] T039 [US2] Create task service in backend/src/services/task.py with create_task (set user_id from current_user, validate title not empty) and get_user_tasks (filter by user_id, order by created_at DESC) functions
- [ ] T040 [US2] Create task endpoints in backend/src/api/tasks.py: POST /tasks (create task for current user), GET /tasks (list tasks filtered by current user with user_id from JWT)
- [ ] T041 [US2] Register tasks router in backend/src/main.py with /tasks prefix and JWT dependency
- [ ] T042 [US2] Run Alembic migration to create tasks table with user_id foreign key and index: alembic revision --autogenerate -m "create tasks table" && alembic upgrade head

### Frontend Implementation for User Story 2

- [ ] T043 [P] [US2] Create CreateTaskForm component in frontend/src/components/tasks/CreateTaskForm.tsx with title and description fields, validation (title required), and POST /tasks API call
- [ ] T044 [P] [US2] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx to display task title, description, completion status, and action buttons
- [ ] T045 [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx that fetches tasks via GET /tasks, displays TaskItem for each task, shows "No tasks yet" message when empty
- [ ] T046 [US2] Create tasks page in frontend/src/app/tasks/page.tsx that renders CreateTaskForm and TaskList components (protected route)
- [ ] T047 [US2] Update frontend/src/app/page.tsx to redirect authenticated users to /tasks and unauthenticated users to /signin

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Toggle Task Completion Status (Priority: P3)

**Goal**: Enable users to mark tasks as complete or incomplete with visual indication

**Independent Test**: Create tasks → toggle completion → verify visual state changes → refresh page → verify state persists

### Backend Implementation for User Story 3

- [ ] T048 [US3] Add toggle_task_completion function to backend/src/services/task.py that finds task by id and user_id, toggles is_completed, updates updated_at
- [ ] T049 [US3] Create PATCH /tasks/{id}/toggle endpoint in backend/src/api/tasks.py that verifies ownership (user_id matches current user) and calls toggle_task_completion service

### Frontend Implementation for User Story 3

- [ ] T050 [US3] Add checkbox UI to TaskItem component in frontend/src/components/tasks/TaskItem.tsx with onChange handler that calls PATCH /tasks/{id}/toggle
- [ ] T051 [US3] Add visual styling to TaskItem component for completed tasks (strikethrough text, checkmark icon, muted color)
- [ ] T052 [US3] Implement optimistic UI update in TaskItem component to toggle state immediately before API call completes

**Checkpoint**: All user stories 1-3 should now be independently functional

---

## Phase 6: User Story 4 - Update Task Details (Priority: P4)

**Goal**: Enable users to edit task title and description with validation

**Independent Test**: Create task → click edit → modify title and description → save → verify changes persist

### Backend Implementation for User Story 4

- [ ] T053 [US4] Add update_task function to backend/src/services/task.py that finds task by id and user_id, validates title not empty, updates title and description, updates updated_at
- [ ] T054 [US4] Create UpdateTaskRequest schema in backend/src/schemas/task.py with title required and description optional
- [ ] T055 [US4] Create PUT /tasks/{id} endpoint in backend/src/api/tasks.py that verifies ownership (user_id matches current user) and calls update_task service

### Frontend Implementation for User Story 4

- [ ] T056 [US4] Create EditTaskModal component in frontend/src/components/tasks/EditTaskModal.tsx with form fields for title and description, validation (title required), save and cancel buttons
- [ ] T057 [US4] Add edit button to TaskItem component in frontend/src/components/tasks/TaskItem.tsx that opens EditTaskModal with current task data
- [ ] T058 [US4] Implement PUT /tasks/{id} API call in EditTaskModal component with error handling and success feedback
- [ ] T059 [US4] Update TaskList component to refresh task list after successful edit

**Checkpoint**: All user stories 1-4 should now be independently functional

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P5)

**Goal**: Enable users to permanently delete tasks with confirmation

**Independent Test**: Create tasks → click delete → confirm → verify task removed → refresh page → verify deletion persists

### Backend Implementation for User Story 5

- [ ] T060 [US5] Add delete_task function to backend/src/services/task.py that finds task by id and user_id, deletes task from database
- [ ] T061 [US5] Create DELETE /tasks/{id} endpoint in backend/src/api/tasks.py that verifies ownership (user_id matches current user), calls delete_task service, returns 204 No Content

### Frontend Implementation for User Story 5

- [ ] T062 [US5] Create DeleteConfirmModal component in frontend/src/components/tasks/DeleteConfirmModal.tsx with confirmation message, confirm and cancel buttons
- [ ] T063 [US5] Add delete button to TaskItem component in frontend/src/components/tasks/TaskItem.tsx that opens DeleteConfirmModal
- [ ] T064 [US5] Implement DELETE /tasks/{id} API call in DeleteConfirmModal component with error handling
- [ ] T065 [US5] Update TaskList component to remove deleted task from UI after successful deletion

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T066 [P] Add error boundary component in frontend/src/components/ErrorBoundary.tsx to catch and display React errors gracefully
- [ ] T067 [P] Add loading states to all API calls in frontend components (spinner or skeleton UI)
- [ ] T068 [P] Add toast notifications in frontend for success and error messages using a toast library
- [ ] T069 [P] Create backend/src/api/health.py with GET /health endpoint for deployment health checks
- [ ] T070 [P] Add API documentation endpoint in backend/src/main.py to serve OpenAPI docs at /docs
- [ ] T071 Verify responsive design on mobile (320px), tablet (768px), and desktop (1024px) viewports
- [ ] T072 Verify all API endpoints return correct HTTP status codes (200, 201, 204, 400, 401, 404, 500)
- [ ] T073 Verify JWT token validation on all protected endpoints (test with invalid, expired, and missing tokens)
- [ ] T074 Verify user isolation by creating two users and confirming User A cannot access User B's tasks
- [ ] T075 Run quickstart.md validation to ensure setup instructions are accurate and complete

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires User Story 1 for authentication context
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires User Story 2 for task data
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires User Story 2 for task data
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Requires User Story 2 for task data

### Within Each User Story

- Backend models before services
- Backend services before endpoints
- Backend endpoints before frontend components
- Frontend API client before components that make API calls
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within each user story, tasks marked [P] can run in parallel
- User Stories 3, 4, and 5 can be worked on in parallel after User Story 2 completes (different endpoints and components)

---

## Parallel Example: User Story 1

```bash
# Launch all parallel backend tasks for User Story 1 together:
Task T019: "Create User model in backend/src/models/user.py"
Task T020: "Create auth request schemas in backend/src/schemas/auth.py"
Task T021: "Create auth response schemas in backend/src/schemas/auth.py"

# Then sequential tasks:
Task T022: "Create auth service in backend/src/services/auth.py" (depends on T019-T021)
Task T023: "Create JWT dependency in backend/src/api/deps.py" (depends on T022)
Task T024: "Create auth endpoints in backend/src/api/auth.py" (depends on T022-T023)

# Launch all parallel frontend tasks for User Story 1 together:
Task T027: "Configure Better Auth in frontend/src/lib/auth.ts"
Task T028: "Create API client in frontend/src/lib/api.ts"
Task T029: "Create SignupForm component"
Task T030: "Create SigninForm component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Auth) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Create/View) → Test independently → Deploy/Demo
4. Add User Story 3 (Toggle) → Test independently → Deploy/Demo
5. Add User Story 4 (Edit) → Test independently → Deploy/Demo
6. Add User Story 5 (Delete) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth) - MUST complete first
   - After User Story 1 completes:
     - Developer A: User Story 2 (Create/View)
     - Developer B: User Story 3 (Toggle) - can start after US2
     - Developer C: User Story 4 (Edit) - can start after US2
     - Developer D: User Story 5 (Delete) - can start after US2
3. Stories complete and integrate independently

---

## Agent Assignment by Phase

### Phase 1-2: Setup & Foundational
- **General-purpose agent**: Project initialization
- **neon-db-manager agent**: Database setup and migrations

### Phase 3: User Story 1 (Authentication)
- **auth-security agent**: Backend authentication, JWT, password hashing
- **nextjs-ui-builder agent**: Frontend signup/signin pages, Better Auth integration

### Phase 4: User Story 2 (Create/View Tasks)
- **fastapi-backend-dev agent**: Task endpoints, SQLModel integration
- **neon-db-manager agent**: Task table migration
- **nextjs-ui-builder agent**: Task list UI, create form

### Phase 5-7: User Stories 3-5 (Toggle, Edit, Delete)
- **fastapi-backend-dev agent**: Additional task endpoints
- **nextjs-ui-builder agent**: Task interaction components (toggle, edit modal, delete modal)

### Phase 8: Polish
- **General-purpose agent**: Cross-cutting improvements, validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Total Tasks**: 75
- **Setup (Phase 1)**: 9 tasks
- **Foundational (Phase 2)**: 9 tasks (BLOCKING)
- **User Story 1 (P1)**: 17 tasks (Authentication)
- **User Story 2 (P2)**: 12 tasks (Create/View)
- **User Story 3 (P3)**: 5 tasks (Toggle)
- **User Story 4 (P4)**: 7 tasks (Edit)
- **User Story 5 (P5)**: 6 tasks (Delete)
- **Polish (Phase 8)**: 10 tasks

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (35 tasks) deliver authentication and basic task viewing

**Full Feature Set**: All 75 tasks deliver complete CRUD functionality with authentication
