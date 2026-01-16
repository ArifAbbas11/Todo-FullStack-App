# Quickstart Guide: Todo Full-Stack Web Application

**Feature**: 001-todo-web-app
**Date**: 2026-01-14
**Purpose**: Setup instructions and development workflow for implementing the Todo application

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher (for Next.js 16+)
- **Python**: 3.11 or higher
- **PostgreSQL Client**: psql (for database verification)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Required Accounts

- **Neon Account**: Sign up at https://neon.tech for PostgreSQL database
- **Vercel Account** (optional): For frontend deployment
- **Railway/Render Account** (optional): For backend deployment

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Phase-ll
git checkout 001-todo-web-app
```

### 2. Backend Setup

#### 2.1 Create Backend Directory

```bash
mkdir -p backend/src/{models,schemas,services,api,core}
mkdir -p backend/tests
mkdir -p backend/alembic/versions
cd backend
```

#### 2.2 Create Python Virtual Environment

```bash
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

#### 2.3 Install Dependencies

Create `requirements.txt`:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic[email]==2.5.3
alembic==1.13.1
pytest==7.4.4
httpx==0.26.0
pytest-asyncio==0.23.3
```

Install:
```bash
pip install -r requirements.txt
```

#### 2.4 Configure Environment Variables

Create `.env` file in `backend/` directory:
```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
FRONTEND_URL=http://localhost:3000

# Server
HOST=0.0.0.0
PORT=8000
```

**CRITICAL**: Generate a secure JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2.5 Get Neon Database Connection String

1. Go to https://neon.tech
2. Create new project: "todo-app"
3. Copy connection string from dashboard
4. Update `DATABASE_URL` in `.env`

Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb`

#### 2.6 Initialize Database

Create `backend/src/core/database.py`:
```python
from sqlmodel import create_engine, Session
from src.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
```

Run migrations (after models are created):
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

#### 2.7 Run Backend Server

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: Open http://localhost:8000/docs (FastAPI auto-generated docs)

---

### 3. Frontend Setup

#### 3.1 Create Frontend Project

```bash
cd ..  # Back to project root
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install better-auth
npm install -D @types/node
```

#### 3.3 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BETTER_AUTH_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**CRITICAL**: Use the SAME JWT secret as backend!

#### 3.4 Configure TailwindCSS

Update `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
    },
  },
  plugins: [],
}
export default config
```

#### 3.5 Run Frontend Server

```bash
cd frontend
npm run dev
```

Verify: Open http://localhost:3000

---

## Development Workflow

### Phase 1: Authentication (P1 - Foundational)

**Backend Tasks**:
1. Create User model (`backend/src/models/user.py`)
2. Create auth schemas (`backend/src/schemas/auth.py`)
3. Implement auth service (`backend/src/services/auth.py`)
4. Create auth endpoints (`backend/src/api/auth.py`)
5. Implement JWT middleware (`backend/src/api/deps.py`)

**Frontend Tasks**:
1. Configure Better Auth (`frontend/lib/auth.ts`)
2. Create signup page (`frontend/app/signup/page.tsx`)
3. Create signin page (`frontend/app/signin/page.tsx`)
4. Create API client with JWT interceptor (`frontend/lib/api.ts`)
5. Implement route protection middleware (`frontend/middleware.ts`)

**Testing**:
```bash
# Backend
cd backend
pytest tests/test_auth.py -v

# Frontend
cd frontend
npm test
```

**Verification**:
- [ ] User can create account with email/password
- [ ] User receives JWT token on signup
- [ ] User can sign in with credentials
- [ ] Invalid credentials return 401 error
- [ ] JWT token is attached to subsequent requests

---

### Phase 2: Task Management - Create & View (P2 - Core MVP)

**Backend Tasks**:
1. Create Task model (`backend/src/models/task.py`)
2. Create task schemas (`backend/src/schemas/task.py`)
3. Implement task service (`backend/src/services/task.py`)
4. Create task endpoints (`backend/src/api/tasks.py`)
5. Add user_id filtering to all queries

**Frontend Tasks**:
1. Create task list page (`frontend/app/tasks/page.tsx`)
2. Create task list component (`frontend/components/tasks/TaskList.tsx`)
3. Create task item component (`frontend/components/tasks/TaskItem.tsx`)
4. Create task form component (`frontend/components/tasks/CreateTaskForm.tsx`)

**Testing**:
```bash
# Backend
cd backend
pytest tests/test_tasks.py::test_create_task -v
pytest tests/test_tasks.py::test_list_tasks -v

# Frontend
cd frontend
npm test -- TaskList
```

**Verification**:
- [ ] User can create tasks with title and description
- [ ] Tasks appear in list immediately after creation
- [ ] User only sees their own tasks (not other users')
- [ ] Empty state shows "No tasks yet" message
- [ ] Tasks ordered by creation date (newest first)

---

### Phase 3: Task Management - Toggle Completion (P3)

**Backend Tasks**:
1. Implement toggle endpoint (`PATCH /tasks/{id}/toggle`)
2. Add ownership verification

**Frontend Tasks**:
1. Add checkbox/toggle UI to TaskItem
2. Implement optimistic UI updates
3. Handle toggle API call

**Verification**:
- [ ] Clicking checkbox toggles completion status
- [ ] Visual indication of completed tasks (strikethrough)
- [ ] Status persists after page refresh
- [ ] Only task owner can toggle their tasks

---

### Phase 4: Task Management - Edit (P4)

**Backend Tasks**:
1. Implement update endpoint (`PUT /tasks/{id}`)
2. Add ownership verification

**Frontend Tasks**:
1. Create edit modal component (`frontend/components/tasks/EditTaskModal.tsx`)
2. Add edit button to TaskItem
3. Implement form validation

**Verification**:
- [ ] User can edit task title and description
- [ ] Changes persist after save
- [ ] Cancel button discards changes
- [ ] Empty title shows validation error

---

### Phase 5: Task Management - Delete (P5)

**Backend Tasks**:
1. Implement delete endpoint (`DELETE /tasks/{id}`)
2. Add ownership verification

**Frontend Tasks**:
1. Create delete confirmation modal (`frontend/components/tasks/DeleteConfirmModal.tsx`)
2. Add delete button to TaskItem
3. Remove task from UI after successful deletion

**Verification**:
- [ ] User sees confirmation before deletion
- [ ] Task is permanently removed
- [ ] Deletion persists after page refresh
- [ ] Only task owner can delete their tasks

---

## Testing Strategy

### Backend Testing

**Run All Tests**:
```bash
cd backend
pytest -v
```

**Run Specific Test File**:
```bash
pytest tests/test_auth.py -v
pytest tests/test_tasks.py -v
```

**Run with Coverage**:
```bash
pytest --cov=src --cov-report=html
```

**Test User Isolation**:
```bash
pytest tests/test_tasks.py::test_user_isolation -v
```

### Frontend Testing

**Run All Tests**:
```bash
cd frontend
npm test
```

**Run Specific Test**:
```bash
npm test -- TaskList
```

**Run with Coverage**:
```bash
npm test -- --coverage
```

### Manual Testing Checklist

**Authentication**:
- [ ] Signup with valid email/password
- [ ] Signup with duplicate email (should fail)
- [ ] Signup with weak password (should fail)
- [ ] Signin with correct credentials
- [ ] Signin with wrong credentials (should fail)
- [ ] Access protected route without token (should redirect)

**Task Management**:
- [ ] Create task with title only
- [ ] Create task with title and description
- [ ] Create task with empty title (should fail)
- [ ] View task list (should show only own tasks)
- [ ] Toggle task completion
- [ ] Edit task title and description
- [ ] Delete task with confirmation
- [ ] Refresh page (tasks should persist)

**User Isolation**:
- [ ] Create two user accounts
- [ ] Create tasks for User A
- [ ] Sign in as User B
- [ ] Verify User B cannot see User A's tasks
- [ ] Verify User B cannot edit/delete User A's tasks

**Responsive Design**:
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify touch targets are at least 44px

---

## Troubleshooting

### Backend Issues

**Database Connection Error**:
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution**: Verify DATABASE_URL in `.env`, check Neon dashboard for correct connection string

**JWT Token Invalid**:
```
401 Unauthorized: Invalid token
```
**Solution**: Ensure JWT_SECRET is identical in frontend and backend `.env` files

**CORS Error**:
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Verify FRONTEND_URL in backend `.env` matches frontend origin

### Frontend Issues

**API Request Fails**:
```
Failed to fetch
```
**Solution**: Verify backend is running on http://localhost:8000, check NEXT_PUBLIC_API_URL in `.env.local`

**Token Not Attached**:
```
401 Unauthorized on protected routes
```
**Solution**: Verify API client is attaching Authorization header with Bearer token

**Better Auth Configuration Error**:
```
Better Auth: Missing secret
```
**Solution**: Verify BETTER_AUTH_SECRET in `.env.local`

---

## Deployment

### Backend Deployment (Railway)

1. Create Railway account
2. Create new project
3. Connect GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy from `backend/` directory

**Environment Variables**:
- DATABASE_URL (from Neon)
- JWT_SECRET
- JWT_ALGORITHM=HS256
- JWT_EXPIRATION_HOURS=24
- FRONTEND_URL (production frontend URL)

### Frontend Deployment (Vercel)

1. Create Vercel account
2. Import GitHub repository
3. Set root directory to `frontend/`
4. Set environment variables in Vercel dashboard
5. Deploy

**Environment Variables**:
- NEXT_PUBLIC_API_URL (production backend URL)
- NEXT_PUBLIC_JWT_SECRET (same as backend)
- BETTER_AUTH_SECRET (same as backend)

---

## Useful Commands

### Backend

```bash
# Start development server
uvicorn src.main:app --reload

# Run tests
pytest -v

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check database connection
psql $DATABASE_URL -c "SELECT version();"
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## Next Steps

After completing setup:
1. Review [spec.md](./spec.md) for feature requirements
2. Review [plan.md](./plan.md) for implementation strategy
3. Review [data-model.md](./data-model.md) for database schema
4. Review [contracts/](./contracts/) for API specifications
5. Run `/sp.tasks` to generate task list
6. Begin implementation using specialized agents

---

## Support

For issues or questions:
- Check [research.md](./research.md) for technology decisions
- Review API contracts in [contracts/](./contracts/)
- Consult constitution at `.specify/memory/constitution.md`
- Create PHR for significant decisions or blockers
