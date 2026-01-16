# Quickstart Guide: Todo App Authentication & Security

**Feature**: 003-003-auth-security | **Date**: 2026-01-15
**Purpose**: Step-by-step guide to set up, test, and validate JWT-based authentication

## Prerequisites

Before starting, ensure you have:

- **Backend**: Python 3.11+, pip, virtualenv
- **Frontend**: Node.js 18+, npm or yarn
- **Database**: Neon PostgreSQL account and connection string
- **Tools**: curl or Postman for API testing, jwt.io for token inspection
- **Existing Features**: Features 001 (todo-web-app) and 002 (backend-api) must be implemented

## Setup Instructions

### Step 1: Backend Setup

#### 1.1 Install Dependencies

```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (python-jose should already be in requirements.txt)
pip install -r requirements.txt
```

**Verify python-jose is installed**:
```bash
pip list | grep python-jose
# Should show: python-jose 3.3.0 (or similar)
```

#### 1.2 Configure Environment Variables

Create or update `backend/.env` file:

```bash
# Database (already configured from feature 002)
DATABASE_URL=postgresql://user:password@host/database

# JWT Configuration (NEW - add these)
JWT_SECRET=your-256-bit-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168  # 7 days

# Server Configuration (already configured)
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Generate Strong JWT Secret**:
```bash
# Generate a secure 256-bit secret
openssl rand -base64 32

# Example output: 8xK9mP2nQ5rT7vW0yZ3aB6cD9eF1gH4jK7lM0nP3qR6s

# Copy this output and paste it as JWT_SECRET in .env
```

**IMPORTANT**: The JWT_SECRET must be the same on both frontend and backend!

#### 1.3 Verify Database Schema

The users and tasks tables should already exist from features 001 and 002. Verify:

```bash
# Run Alembic migrations (should show "Already at head")
alembic upgrade head
```

If migrations haven't been run yet:
```bash
# Run migrations to create users and tasks tables
alembic upgrade head
```

#### 1.4 Start Backend Server

```bash
# From backend directory
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend is running**:
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

---

### Step 2: Frontend Setup

#### 2.1 Install Dependencies

```bash
cd frontend

# Install dependencies (Better Auth should be added to package.json)
npm install
# or
yarn install
```

**Verify Better Auth is installed**:
```bash
npm list better-auth
# Should show: better-auth@x.x.x
```

#### 2.2 Configure Environment Variables

Create or update `frontend/.env.local` file:

```bash
# Backend API URL (already configured)
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Configuration (NEW - add this)
NEXT_PUBLIC_JWT_SECRET=your-256-bit-secret-here  # MUST match backend JWT_SECRET
```

**CRITICAL**: The `NEXT_PUBLIC_JWT_SECRET` must be EXACTLY the same as `JWT_SECRET` in backend/.env!

#### 2.3 Start Frontend Server

```bash
# From frontend directory
npm run dev
# or
yarn dev
```

**Verify frontend is running**:
- Open browser: http://localhost:3000
- Should see the Todo app homepage

---

## Testing the Authentication Flow

### Test 1: User Registration (Signup)

#### 1.1 Test via Frontend UI

1. Navigate to http://localhost:3000/signup
2. Enter email: `test@example.com`
3. Enter password: `password123` (min 8 characters)
4. Click "Sign Up"
5. **Expected**: Redirect to signin page with success message

#### 1.2 Test via API (curl)

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "created_at": "2026-01-15T10:30:00Z"
}
```

#### 1.3 Verify in Database

```sql
SELECT id, email, created_at FROM users WHERE email = 'test@example.com';
```

**Expected**: One row with hashed_password (bcrypt hash, starts with `$2b$`)

---

### Test 2: User Login (Signin) and JWT Token Issuance

#### 2.1 Test via Frontend UI

1. Navigate to http://localhost:3000/signin
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign In"
5. **Expected**: Redirect to dashboard, JWT token stored in localStorage

**Inspect Token in Browser**:
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage → http://localhost:3000
3. Find key: `access_token`
4. Copy the token value

#### 2.2 Test via API (curl)

```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzM3ODQ5NjAwLCJpYXQiOjE3MzcyNDQ4MDB9.signature_here",
  "token_type": "bearer",
  "expires_in": 604800
}
```

**Save the token** for next tests:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2.3 Inspect JWT Token

1. Go to https://jwt.io
2. Paste the token in the "Encoded" section
3. **Verify Header**:
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```
4. **Verify Payload**:
   ```json
   {
     "user_id": "550e8400-e29b-41d4-a716-446655440000",
     "email": "test@example.com",
     "exp": 1737849600,
     "iat": 1737244800
   }
   ```
5. **Verify Signature**: Paste JWT_SECRET in "your-256-bit-secret" field, should show "Signature Verified"

---

### Test 3: Authorized API Request (Create Task)

#### 3.1 Test via Frontend UI

1. Navigate to http://localhost:3000/dashboard (should be logged in)
2. Enter task title: "Buy groceries"
3. Enter task description: "Milk, eggs, bread"
4. Click "Add Task"
5. **Expected**: Task appears in task list

#### 3.2 Test via API (curl)

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "created_at": "2026-01-15T11:00:00Z",
  "updated_at": "2026-01-15T11:00:00Z"
}
```

**Verify user_id matches** the user_id from JWT token payload!

---

### Test 4: Unauthorized Access (Missing Token)

#### 4.1 Test via API (curl)

```bash
curl -X GET http://localhost:8000/api/tasks
# Note: No Authorization header
```

**Expected Response** (401 Unauthorized):
```json
{
  "code": "MISSING_TOKEN",
  "message": "Missing authorization header",
  "details": {}
}
```

---

### Test 5: Invalid Token

#### 5.1 Test via API (curl)

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response** (401 Unauthorized):
```json
{
  "code": "INVALID_TOKEN",
  "message": "Invalid token",
  "details": {}
}
```

---

### Test 6: User Isolation (Cross-User Access)

#### 6.1 Create Second User

```bash
# Register second user
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "password456"
  }'

# Login as second user
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "password456"
  }'

# Save User 2's token
export TOKEN2="eyJ..."
```

#### 6.2 Create Task as User 2

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{
    "title": "User 2 task",
    "description": "This belongs to User 2"
  }'

# Save the task ID from response
export TASK2_ID="123e4567-..."
```

#### 6.3 Try to Access User 2's Task as User 1

```bash
curl -X GET http://localhost:8000/api/tasks/$TASK2_ID \
  -H "Authorization: Bearer $TOKEN"
# Note: Using User 1's token to access User 2's task
```

**Expected Response** (404 Not Found):
```json
{
  "code": "TASK_NOT_FOUND",
  "message": "Task not found",
  "details": {}
}
```

**IMPORTANT**: Response is 404 (not 403) to avoid revealing task existence!

#### 6.4 Verify User 1 Can Only See Their Own Tasks

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: Only User 1's tasks are returned, User 2's tasks are NOT visible

---

### Test 7: Token Expiration

#### 7.1 Test with Expired Token (Manual)

To test token expiration without waiting 7 days:

1. **Option A**: Modify JWT_EXPIRATION_HOURS to 1 minute for testing:
   ```bash
   # In backend/.env
   JWT_EXPIRATION_HOURS=0.0167  # 1 minute
   ```
2. Restart backend server
3. Login to get new token with 1-minute expiration
4. Wait 1 minute
5. Try to access protected endpoint

**Expected Response** (401 Unauthorized):
```json
{
  "code": "TOKEN_EXPIRED",
  "message": "Token expired",
  "details": {}
}
```

#### 7.2 Frontend Handling

When frontend receives 401 with "TOKEN_EXPIRED":
1. Delete token from localStorage
2. Redirect user to signin page
3. Display message: "Your session has expired. Please log in again."

---

## Validation Checklist

Use this checklist to verify the authentication system is working correctly:

### User Registration
- [ ] User can register with valid email and password (min 8 chars)
- [ ] System rejects invalid email format
- [ ] System rejects password shorter than 8 characters
- [ ] System rejects duplicate email registration
- [ ] Password is hashed with bcrypt before storage (verify in database)

### User Login
- [ ] User can login with correct credentials
- [ ] System returns JWT token with correct structure (header, payload, signature)
- [ ] Token contains user_id, email, exp, iat claims
- [ ] Token is signed with HS256 algorithm
- [ ] Token expiration is set to 7 days from issuance
- [ ] System rejects login with incorrect password
- [ ] System rejects login with non-existent email

### JWT Token Verification
- [ ] Protected endpoints accept requests with valid token
- [ ] Protected endpoints reject requests without Authorization header (401)
- [ ] Protected endpoints reject requests with invalid token (401)
- [ ] Protected endpoints reject requests with expired token (401)
- [ ] Protected endpoints reject requests with malformed Authorization header (401)

### User Isolation
- [ ] User A can only see their own tasks (not User B's tasks)
- [ ] User A cannot access User B's task by ID (returns 404, not 403)
- [ ] User A cannot update User B's task (returns 404, not 403)
- [ ] User A cannot delete User B's task (returns 404, not 403)
- [ ] All database queries include WHERE user_id = {authenticated_user_id}

### Token Lifecycle
- [ ] Token is stored in localStorage or httpOnly cookie after login
- [ ] Token is attached to all API requests in Authorization header
- [ ] Token expires after 7 days
- [ ] Frontend redirects to login page when receiving 401 response
- [ ] User can obtain new token by logging in again after expiration

### Security
- [ ] JWT_SECRET is stored in environment variables (not hardcoded)
- [ ] JWT_SECRET is the same on frontend and backend
- [ ] Passwords are hashed with bcrypt (cost factor 10)
- [ ] HTTPS is used in production (not tested locally)
- [ ] Error messages don't expose sensitive information

---

## Troubleshooting

### Issue: "Invalid token" error on all requests

**Possible Causes**:
1. JWT_SECRET mismatch between frontend and backend
2. Token is malformed or corrupted
3. Token was generated with different secret

**Solution**:
```bash
# Verify JWT_SECRET is the same in both .env files
cat backend/.env | grep JWT_SECRET
cat frontend/.env.local | grep NEXT_PUBLIC_JWT_SECRET

# If different, update to match and restart both servers
```

---

### Issue: "Token expired" immediately after login

**Possible Causes**:
1. Server time is incorrect
2. JWT_EXPIRATION_HOURS is set too low
3. Token expiration calculation is wrong

**Solution**:
```bash
# Check JWT_EXPIRATION_HOURS in backend/.env
cat backend/.env | grep JWT_EXPIRATION_HOURS
# Should be: JWT_EXPIRATION_HOURS=168 (7 days)

# Verify server time is correct
date
```

---

### Issue: User can access other users' tasks

**Possible Causes**:
1. Database queries don't include user_id filtering
2. Ownership verification is missing
3. user_id is not extracted from JWT token

**Solution**:
1. Check all database queries include: `WHERE user_id = {authenticated_user_id}`
2. Verify get_current_user dependency is used on all protected endpoints
3. Check user_id is extracted from JWT token claims

---

### Issue: "Missing authorization header" on all requests

**Possible Causes**:
1. Frontend is not attaching token to requests
2. Token is not stored in localStorage
3. Authorization header format is incorrect

**Solution**:
```bash
# Check if token is stored in localStorage
# Open browser DevTools → Application → Local Storage
# Look for 'access_token' key

# Verify Authorization header format in network tab
# Should be: Authorization: Bearer <token>
```

---

## Performance Testing

### Test Concurrent Users

```bash
# Install Apache Bench (if not already installed)
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install httpd  # macOS

# Test 100 concurrent requests with valid token
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/tasks
```

**Expected**:
- All requests should succeed (200 OK)
- p95 latency should be < 500ms
- No authentication failures

---

## Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong, production-specific secret
- [ ] Set JWT_EXPIRATION_HOURS to 168 (7 days)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set FRONTEND_URL to production domain
- [ ] Configure CORS to allow only production frontend domain
- [ ] Enable rate limiting on login endpoint (5 attempts per minute per IP)
- [ ] Set up monitoring for authentication failures
- [ ] Test all authentication flows in production environment
- [ ] Verify user isolation works correctly in production
- [ ] Document JWT_SECRET rotation process

---

## Next Steps

After completing this quickstart:

1. **Run `/sp.tasks`** to generate implementation tasks
2. **Use specialized agents**:
   - `auth-security` agent for authentication implementation
   - `fastapi-backend-dev` agent for backend API modifications
   - `nextjs-ui-builder` agent for frontend authentication UI
3. **Implement tasks** in priority order (P1 → P2 → P3 → P4 → P5)
4. **Test each user story** independently before moving to next
5. **Create PHRs** for all implementation work
6. **Demo to judges** within 5 minutes using this quickstart guide

---

## Summary

This quickstart guide provides:
- Complete setup instructions for backend and frontend
- Step-by-step testing procedures for all authentication flows
- Validation checklist to verify system correctness
- Troubleshooting guide for common issues
- Performance testing instructions
- Deployment checklist for production readiness

The authentication system is now ready for implementation following the Spec-Driven Development workflow.
