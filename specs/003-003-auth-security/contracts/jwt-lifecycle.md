# JWT Token Lifecycle Overview

**Feature**: 003-003-auth-security | **Date**: 2026-01-15
**Purpose**: Detailed documentation of JWT token lifecycle from generation to expiration

## JWT Token Structure

### Complete Token Example

**Encoded JWT Token** (sent in Authorization header):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzM3ODQ5NjAwLCJpYXQiOjE3MzcyNDQ4MDB9.signature_here
```

**Decoded JWT Token** (for illustration only - never decode without verification):

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims)**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "exp": 1737849600,
  "iat": 1737244800
}
```

**Signature**:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## Token Lifecycle Phases

### Phase 1: Token Generation (Backend)

**Trigger**: User successfully logs in with correct email and password

**Process**:
1. **User Authentication**:
   - Backend receives POST /api/auth/signin with email and password
   - Query database: `SELECT * FROM users WHERE email = ?`
   - Verify password: `bcrypt.verify(password, hashed_password)`
   - If verification fails, return 401 Unauthorized

2. **Token Creation**:
   - Extract user information: `user_id`, `email`
   - Calculate expiration: `exp = current_time + 7 days (604800 seconds)`
   - Calculate issued at: `iat = current_time`
   - Create payload: `{ user_id, email, exp, iat }`

3. **Token Signing**:
   - Load JWT_SECRET from environment variables
   - Sign payload with HS256 algorithm: `HMACSHA256(header + payload, JWT_SECRET)`
   - Encode token: `base64UrlEncode(header).base64UrlEncode(payload).base64UrlEncode(signature)`

4. **Token Response**:
   - Return 200 OK with token response:
     ```json
     {
       "access_token": "eyJ...",
       "token_type": "bearer",
       "expires_in": 604800
     }
     ```

**Code Example (Python with python-jose)**:
```python
from jose import jwt
from datetime import datetime, timedelta
import os

def generate_jwt_token(user_id: str, email: str) -> str:
    """Generate JWT token for authenticated user"""
    jwt_secret = os.getenv("JWT_SECRET")
    jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expiration_hours = int(os.getenv("JWT_EXPIRATION_HOURS", "168"))  # 7 days

    now = datetime.utcnow()
    exp = now + timedelta(hours=jwt_expiration_hours)

    payload = {
        "user_id": str(user_id),
        "email": email,
        "exp": exp,
        "iat": now
    }

    token = jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)
    return token
```

---

### Phase 2: Token Issuance (Backend → Frontend)

**Trigger**: Token generation completes successfully

**Process**:
1. **HTTP Response**:
   - Backend sends 200 OK response with token in response body
   - Response includes `access_token`, `token_type`, and `expires_in`

2. **Frontend Reception**:
   - Frontend receives token in response body
   - Extracts `access_token` from response

**Response Format**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

---

### Phase 3: Token Storage (Frontend)

**Trigger**: Frontend receives token from backend

**Process**:
1. **Storage Decision**:
   - **Option A**: Store in localStorage (simpler, but vulnerable to XSS)
   - **Option B**: Store in httpOnly cookie (more secure, prevents XSS access)
   - **Recommendation**: Use httpOnly cookie for production, localStorage for development

2. **localStorage Storage** (if chosen):
   ```typescript
   // Store token
   localStorage.setItem('access_token', response.access_token);

   // Retrieve token
   const token = localStorage.getItem('access_token');

   // Remove token (logout)
   localStorage.removeItem('access_token');
   ```

3. **httpOnly Cookie Storage** (if chosen):
   - Backend sets cookie in response header:
     ```
     Set-Cookie: access_token=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
     ```
   - Browser automatically includes cookie in subsequent requests
   - JavaScript cannot access httpOnly cookies (XSS protection)

**Security Considerations**:
- **localStorage**: Accessible via JavaScript, vulnerable to XSS attacks
- **httpOnly cookie**: Not accessible via JavaScript, immune to XSS, but requires CSRF protection
- **HTTPS**: Always use HTTPS in production to prevent token interception

---

### Phase 4: Token Transmission (Frontend → Backend)

**Trigger**: Frontend makes API request to protected endpoint

**Process**:
1. **Token Retrieval**:
   - Frontend retrieves token from storage (localStorage or cookie)
   - If token doesn't exist, redirect to login page

2. **Authorization Header**:
   - Frontend attaches token to request in Authorization header
   - Format: `Authorization: Bearer <token>`
   - Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **HTTP Request**:
   ```http
   GET /api/tasks HTTP/1.1
   Host: api.example.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```

**Code Example (TypeScript with fetch)**:
```typescript
async function fetchUserTasks() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Redirect to login if no token
    window.location.href = '/signin';
    return;
  }

  const response = await fetch('/api/tasks', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    // Token invalid or expired, redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/signin';
    return;
  }

  const data = await response.json();
  return data;
}
```

---

### Phase 5: Token Verification (Backend)

**Trigger**: Backend receives API request with Authorization header

**Process**:
1. **Token Extraction**:
   - Extract Authorization header from request
   - Verify format: `Bearer <token>`
   - Extract token: split by space, take second part
   - If header missing or malformed, return 401 Unauthorized

2. **Signature Verification**:
   - Load JWT_SECRET from environment variables
   - Decode token header and payload (without verification)
   - Verify algorithm is HS256 (prevent algorithm confusion attacks)
   - Compute expected signature: `HMACSHA256(header + payload, JWT_SECRET)`
   - Compare expected signature with token signature
   - If signatures don't match, return 401 Unauthorized with error "Invalid token"

3. **Expiration Validation**:
   - Extract `exp` claim from payload
   - Get current server time (UTC)
   - Compare: `if (current_time > exp)` → token is expired
   - If expired, return 401 Unauthorized with error "Token expired"

4. **Claims Extraction**:
   - Extract `user_id` from payload
   - Extract `email` from payload
   - Validate `user_id` is valid UUID format
   - Validate `email` is valid email format

5. **User Context**:
   - Store `user_id` in request context for use in route handlers
   - Use `user_id` in database queries for user isolation

**Code Example (Python with python-jose)**:
```python
from jose import jwt, JWTError
from fastapi import HTTPException, Header
from datetime import datetime
import os

def verify_jwt_token(authorization: str = Header(None)) -> dict:
    """Verify JWT token and extract claims"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={"code": "MISSING_TOKEN", "message": "Missing authorization header"}
        )

    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail={"code": "INVALID_FORMAT", "message": "Invalid authorization format"}
        )

    token = parts[1]
    jwt_secret = os.getenv("JWT_SECRET")
    jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    try:
        # Verify signature and decode payload
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])

        # Expiration is automatically checked by jwt.decode()
        # If expired, JWTError is raised

        # Extract claims
        user_id = payload.get("user_id")
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_TOKEN", "message": "Invalid token claims"}
            )

        return {"user_id": user_id, "email": email}

    except JWTError as e:
        if "expired" in str(e).lower():
            raise HTTPException(
                status_code=401,
                detail={"code": "TOKEN_EXPIRED", "message": "Token expired"}
            )
        else:
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_TOKEN", "message": "Invalid token"}
            )
```

---

### Phase 6: Token Usage (Authorization)

**Trigger**: Token verification succeeds

**Process**:
1. **User Identity**:
   - `user_id` is now available in request context
   - Use `user_id` for all database queries

2. **Database Query with User Isolation**:
   - All queries include `WHERE user_id = {authenticated_user_id}`
   - Example: `SELECT * FROM tasks WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'`

3. **Ownership Verification**:
   - Before update/delete operations, verify task ownership
   - Query: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
   - If no rows returned, return 404 Not Found (not 403)

4. **Response**:
   - Return requested data filtered by user_id
   - User can only see their own data

---

### Phase 7: Token Expiration

**Trigger**: Current time exceeds token's `exp` claim

**Process**:
1. **Expiration Check**:
   - Backend checks expiration on every request
   - If `current_time > exp`, token is expired

2. **Error Response**:
   - Backend returns 401 Unauthorized
   - Error code: "TOKEN_EXPIRED"
   - Error message: "Token expired"

3. **Frontend Handling**:
   - Frontend receives 401 response
   - Deletes token from storage
   - Redirects user to login page

4. **User Re-authentication**:
   - User must log in again to obtain new token
   - New token has fresh 7-day expiration

**Timeline**:
- **Day 0**: Token issued at login (exp = Day 7)
- **Day 1-6**: Token valid, all requests succeed
- **Day 7**: Token expires at exact time (exp timestamp)
- **Day 7+**: All requests with expired token return 401

---

### Phase 8: Token Logout (Optional)

**Trigger**: User clicks logout button

**Process**:
1. **Frontend Action**:
   - Delete token from storage (localStorage or cookie)
   - Clear any user state in frontend

2. **Backend Action**:
   - **None** - JWT tokens are stateless
   - Token remains valid until expiration
   - No server-side session to invalidate

3. **Security Implication**:
   - If token is stolen before logout, it remains valid until expiration
   - Mitigation: Use short expiration (7 days) to limit exposure window

**Code Example (TypeScript)**:
```typescript
function logout() {
  // Delete token from storage
  localStorage.removeItem('access_token');

  // Clear user state
  setUser(null);

  // Redirect to login page
  window.location.href = '/signin';
}
```

---

## Token Lifecycle Timeline

```
Time: T+0 (Login)
├─ User logs in with email + password
├─ Backend verifies credentials
├─ Backend generates JWT token (exp = T+7 days)
├─ Backend returns token to frontend
└─ Frontend stores token in localStorage/cookie

Time: T+1 second to T+7 days (Active Use)
├─ Frontend attaches token to all API requests
├─ Backend verifies token signature
├─ Backend validates token expiration
├─ Backend extracts user_id from token
├─ Backend filters database queries by user_id
└─ Backend returns user's data only

Time: T+7 days (Expiration)
├─ Token expires (current_time > exp)
├─ Backend rejects token with 401 Unauthorized
├─ Frontend receives 401 response
├─ Frontend deletes token from storage
├─ Frontend redirects user to login page
└─ User must log in again to obtain new token

Time: Any time (Logout - Optional)
├─ User clicks logout button
├─ Frontend deletes token from storage
├─ Frontend redirects to login page
└─ Token remains valid until expiration (stateless)
```

---

## Token Security Best Practices

1. **Never Store Tokens in Plain Text**:
   - Use httpOnly cookies to prevent XSS access
   - If using localStorage, implement Content Security Policy (CSP)

2. **Always Use HTTPS**:
   - Encrypt tokens in transit to prevent interception
   - Never send tokens over HTTP in production

3. **Validate Expiration on Every Request**:
   - Check `exp` claim against server time
   - Reject expired tokens immediately

4. **Use Strong Secrets**:
   - Generate JWT_SECRET with `openssl rand -base64 32`
   - Never hardcode secrets in source code
   - Store secrets in environment variables

5. **Implement Rate Limiting**:
   - Limit login attempts to prevent brute force attacks
   - Limit API requests to prevent token abuse

6. **Monitor for Suspicious Activity**:
   - Log all authentication failures
   - Alert on unusual token usage patterns
   - Implement token revocation if needed (requires database storage)

7. **Keep Token Payload Minimal**:
   - Only include necessary claims (user_id, email)
   - Avoid sensitive data in token (no passwords, SSNs, etc.)
   - Smaller tokens = faster transmission and verification

8. **Plan for Secret Rotation**:
   - Have a process to rotate JWT_SECRET if compromised
   - Rotating secret invalidates all existing tokens
   - Users must re-authenticate after rotation

---

## Summary

The JWT token lifecycle consists of 8 phases:
1. **Generation**: Backend creates token after successful login
2. **Issuance**: Backend sends token to frontend in response body
3. **Storage**: Frontend stores token in localStorage or httpOnly cookie
4. **Transmission**: Frontend attaches token to API requests in Authorization header
5. **Verification**: Backend verifies signature and expiration
6. **Usage**: Backend uses user_id from token for database queries
7. **Expiration**: Token expires after 7 days, user must re-authenticate
8. **Logout**: Frontend deletes token (optional, token remains valid until expiration)

This stateless authentication approach enables scalability, simplifies infrastructure, and provides secure user isolation for the multi-user Todo application.
