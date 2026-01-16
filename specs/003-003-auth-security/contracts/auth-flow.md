# Authentication Flow Diagram

**Feature**: 003-003-auth-security | **Date**: 2026-01-15
**Purpose**: Visual representation of the complete authentication flow from signup to authorized API access

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

[User Browser]                [Next.js Frontend]              [FastAPI Backend]              [PostgreSQL DB]
      │                              │                              │                              │
      │  1. Navigate to /signup      │                              │                              │
      ├─────────────────────────────>│                              │                              │
      │                              │                              │                              │
      │  2. Enter email + password   │                              │                              │
      ├─────────────────────────────>│                              │                              │
      │                              │                              │                              │
      │                              │  3. POST /api/auth/signup    │                              │
      │                              │  { email, password }         │                              │
      │                              ├─────────────────────────────>│                              │
      │                              │                              │                              │
      │                              │                              │  4. Hash password (bcrypt)   │
      │                              │                              │     cost factor = 10         │
      │                              │                              │                              │
      │                              │                              │  5. INSERT INTO users        │
      │                              │                              │  (id, email, hashed_password)│
      │                              │                              ├─────────────────────────────>│
      │                              │                              │                              │
      │                              │                              │  6. User created             │
      │                              │                              │<─────────────────────────────┤
      │                              │                              │                              │
      │                              │  7. 201 Created              │                              │
      │                              │  { id, email, created_at }   │                              │
      │                              │<─────────────────────────────┤                              │
      │                              │                              │                              │
      │  8. Redirect to /signin      │                              │                              │
      │<─────────────────────────────┤                              │                              │
      │                              │                              │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER LOGIN FLOW (JWT ISSUANCE)                       │
└─────────────────────────────────────────────────────────────────────────────┘

[User Browser]                [Next.js Frontend]              [FastAPI Backend]              [PostgreSQL DB]
      │                              │                              │                              │
      │  1. Navigate to /signin      │                              │                              │
      ├─────────────────────────────>│                              │                              │
      │                              │                              │                              │
      │  2. Enter email + password   │                              │                              │
      ├─────────────────────────────>│                              │                              │
      │                              │                              │                              │
      │                              │  3. POST /api/auth/signin    │                              │
      │                              │  { email, password }         │                              │
      │                              ├─────────────────────────────>│                              │
      │                              │                              │                              │
      │                              │                              │  4. SELECT * FROM users      │
      │                              │                              │  WHERE email = ?             │
      │                              │                              ├─────────────────────────────>│
      │                              │                              │                              │
      │                              │                              │  5. User record              │
      │                              │                              │<─────────────────────────────┤
      │                              │                              │                              │
      │                              │                              │  6. Verify password          │
      │                              │                              │     bcrypt.verify(password,  │
      │                              │                              │     hashed_password)         │
      │                              │                              │                              │
      │                              │                              │  7. Generate JWT token       │
      │                              │                              │     Claims: {                │
      │                              │                              │       user_id: UUID,         │
      │                              │                              │       email: string,         │
      │                              │                              │       exp: now + 7 days,     │
      │                              │                              │       iat: now               │
      │                              │                              │     }                        │
      │                              │                              │     Sign with HS256 +        │
      │                              │                              │     JWT_SECRET               │
      │                              │                              │                              │
      │                              │  8. 200 OK                   │                              │
      │                              │  {                           │                              │
      │                              │    access_token: "eyJ...",   │                              │
      │                              │    token_type: "bearer",     │                              │
      │                              │    expires_in: 604800        │                              │
      │                              │  }                           │                              │
      │                              │<─────────────────────────────┤                              │
      │                              │                              │                              │
      │                              │  9. Store token in           │                              │
      │                              │     localStorage or          │                              │
      │                              │     httpOnly cookie          │                              │
      │                              │                              │                              │
      │  10. Redirect to /dashboard  │                              │                              │
      │<─────────────────────────────┤                              │                              │
      │                              │                              │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHORIZED API REQUEST FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

[User Browser]                [Next.js Frontend]              [FastAPI Backend]              [PostgreSQL DB]
      │                              │                              │                              │
      │  1. Click "Get My Tasks"     │                              │                              │
      ├─────────────────────────────>│                              │                              │
      │                              │                              │                              │
      │                              │  2. GET /api/tasks           │                              │
      │                              │  Authorization: Bearer eyJ...│                              │
      │                              ├─────────────────────────────>│                              │
      │                              │                              │                              │
      │                              │                              │  3. Extract token from       │
      │                              │                              │     Authorization header     │
      │                              │                              │                              │
      │                              │                              │  4. Verify JWT signature     │
      │                              │                              │     using JWT_SECRET +       │
      │                              │                              │     HS256 algorithm          │
      │                              │                              │                              │
      │                              │                              │  5. Validate expiration      │
      │                              │                              │     if (now > exp):          │
      │                              │                              │       return 401             │
      │                              │                              │                              │
      │                              │                              │  6. Extract user_id from     │
      │                              │                              │     JWT claims               │
      │                              │                              │                              │
      │                              │                              │  7. SELECT * FROM tasks      │
      │                              │                              │  WHERE user_id = ?           │
      │                              │                              │  ORDER BY created_at DESC    │
      │                              │                              ├─────────────────────────────>│
      │                              │                              │                              │
      │                              │                              │  8. User's tasks only        │
      │                              │                              │<─────────────────────────────┤
      │                              │                              │                              │
      │                              │  9. 200 OK                   │                              │
      │                              │  {                           │                              │
      │                              │    tasks: [...],             │                              │
      │                              │    count: 5                  │                              │
      │                              │  }                           │                              │
      │                              │<─────────────────────────────┤                              │
      │                              │                              │                              │
      │  10. Display tasks           │                              │                              │
      │<─────────────────────────────┤                              │                              │
      │                              │                              │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNAUTHORIZED ACCESS ATTEMPT                               │
└─────────────────────────────────────────────────────────────────────────────┘

[User Browser]                [Next.js Frontend]              [FastAPI Backend]
      │                              │                              │
      │  1. Try to access /dashboard │                              │
      │     without token            │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │  2. GET /api/tasks           │
      │                              │  (No Authorization header)   │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │  3. 401 Unauthorized         │
      │                              │  {                           │
      │                              │    code: "MISSING_TOKEN",    │
      │                              │    message: "Missing         │
      │                              │      authorization header"   │
      │                              │  }                           │
      │                              │<─────────────────────────────┤
      │                              │                              │
      │  4. Redirect to /signin      │                              │
      │<─────────────────────────────┤                              │
      │                              │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXPIRED TOKEN HANDLING                                    │
└─────────────────────────────────────────────────────────────────────────────┘

[User Browser]                [Next.js Frontend]              [FastAPI Backend]
      │                              │                              │
      │  1. Make API request with    │                              │
      │     expired token (> 7 days) │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │  2. GET /api/tasks           │
      │                              │  Authorization: Bearer eyJ...│
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │                              │  3. Extract token            │
      │                              │                              │                              │
      │                              │                              │  4. Verify signature (OK)    │
      │                              │                              │                              │
      │                              │                              │  5. Check expiration         │
      │                              │                              │     if (now > exp):          │
      │                              │                              │       EXPIRED!               │
      │                              │                              │                              │
      │                              │  6. 401 Unauthorized         │                              │
      │                              │  {                           │                              │
      │                              │    code: "TOKEN_EXPIRED",    │                              │
      │                              │    message: "Token expired"  │                              │
      │                              │  }                           │                              │
      │                              │<─────────────────────────────┤                              │
      │                              │                              │                              │
      │                              │  7. Delete token from        │                              │
      │                              │     storage                  │                              │
      │                              │                              │                              │
      │  8. Redirect to /signin      │                              │                              │
      │<─────────────────────────────┤                              │                              │
      │                              │                              │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                    USER ISOLATION ENFORCEMENT                                │
└─────────────────────────────────────────────────────────────────────────────┘

[User A Browser]              [Next.js Frontend]              [FastAPI Backend]              [PostgreSQL DB]
      │                              │                              │                              │
      │  1. User A tries to access   │                              │                              │
      │     User B's task            │                              │                              │
      ├─────────────────────────────>│                              │                              │
      │                              │                              │                              │
      │                              │  2. GET /api/tasks/{task_b_id}                              │
      │                              │  Authorization: Bearer       │                              │
      │                              │  (User A's token)            │                              │
      │                              ├─────────────────────────────>│                              │
      │                              │                              │                              │
      │                              │                              │  3. Verify token (OK)        │
      │                              │                              │     Extract user_id = A      │
      │                              │                              │                              │
      │                              │                              │  4. SELECT * FROM tasks      │
      │                              │                              │  WHERE id = task_b_id        │
      │                              │                              │    AND user_id = A           │
      │                              │                              ├─────────────────────────────>│
      │                              │                              │                              │
      │                              │                              │  5. No rows returned         │
      │                              │                              │  (task belongs to User B)    │
      │                              │                              │<─────────────────────────────┤
      │                              │                              │                              │
      │                              │  6. 404 Not Found            │                              │
      │                              │  {                           │                              │
      │                              │    code: "TASK_NOT_FOUND",   │                              │
      │                              │    message: "Task not found" │                              │
      │                              │  }                           │                              │
      │                              │  (NOT 403 - don't reveal     │                              │
      │                              │   task existence)            │                              │
      │                              │<─────────────────────────────┤                              │
      │                              │                              │                              │
      │  7. Display "Task not found" │                              │                              │
      │<─────────────────────────────┤                              │                              │
      │                              │                              │                              │
```

## Key Security Points

1. **Password Security**:
   - Passwords are hashed with bcrypt (cost factor 10) before storage
   - Plain text passwords are never stored in database
   - Password verification uses bcrypt.verify() for timing-attack resistance

2. **JWT Token Security**:
   - Tokens are signed with HS256 algorithm using shared JWT_SECRET
   - Signature verification prevents token tampering
   - Expiration validation prevents use of expired tokens
   - Tokens are transmitted over HTTPS to prevent interception

3. **User Isolation**:
   - All database queries include `WHERE user_id = {authenticated_user_id}`
   - User ID is extracted from JWT token, not from request parameters
   - Ownership verification happens before all update/delete operations
   - 404 (not 403) returned for ownership violations to avoid revealing task existence

4. **Error Handling**:
   - Structured error responses with consistent format
   - Generic error messages to avoid information leakage
   - 401 Unauthorized for authentication failures
   - 404 Not Found for ownership violations

5. **Token Lifecycle**:
   - Tokens expire after 7 days
   - Frontend stores tokens in localStorage or httpOnly cookie
   - Frontend attaches tokens to all API requests in Authorization header
   - Backend verifies tokens on every protected request
   - Logout deletes token from frontend (token remains valid until expiration)
