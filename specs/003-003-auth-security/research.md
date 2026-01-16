# Research: Todo App Authentication & Security

**Feature**: 003-003-auth-security | **Date**: 2026-01-15
**Purpose**: Document key technical decisions for JWT-based authentication and authorization

## Decision 1: JWT vs Session-Based Authentication

**Decision**: Use stateless JWT tokens instead of server-side session storage

**Rationale**:
- **Stateless Architecture**: JWT tokens are self-contained and don't require server-side session storage, reducing database load and enabling horizontal scaling
- **Frontend-Backend Separation**: JWT tokens work seamlessly with separate frontend (Next.js) and backend (FastAPI) deployments, as no shared session store is needed
- **Mobile/API Compatibility**: JWT tokens are standard for API authentication and work well with mobile apps or third-party integrations
- **Better Auth Integration**: Better Auth library has native JWT support with minimal configuration
- **Hackathon Simplicity**: No need to set up Redis or other session stores, reducing infrastructure complexity

**Alternatives Considered**:
1. **Session-Based Authentication (Cookies)**:
   - Pros: Simpler to implement, easier to invalidate sessions, smaller payload size
   - Cons: Requires shared session store (Redis/database), harder to scale horizontally, CSRF protection needed
   - Rejected because: Adds infrastructure complexity (Redis setup) and doesn't align with Better Auth's JWT-first approach

2. **OAuth 2.0 with Authorization Code Flow**:
   - Pros: Industry standard, supports third-party providers (Google, GitHub)
   - Cons: More complex implementation, requires OAuth server setup, overkill for simple email/password auth
   - Rejected because: Out of scope (no OAuth providers), adds unnecessary complexity for hackathon timeline

3. **API Keys**:
   - Pros: Very simple, no expiration needed
   - Cons: No user identity in token, hard to rotate, security risk if leaked
   - Rejected because: Doesn't support user identity extraction, poor security for multi-user applications

**Trade-offs**:
- **Pro**: Stateless, scalable, no session store needed, works with Better Auth
- **Con**: Cannot invalidate tokens before expiration (logout doesn't revoke token), larger payload size than session cookies
- **Mitigation**: Use short expiration (7 days) to limit token lifetime, implement token refresh in future if needed

---

## Decision 2: Token Expiration Duration (7 Days)

**Decision**: Set JWT token expiration to 7 days (604800 seconds)

**Rationale**:
- **Security Balance**: 7 days provides reasonable security (limits exposure window if token is compromised) while maintaining good user experience (users don't need to log in frequently)
- **Hackathon Context**: Judges will test the application over several days, so tokens should remain valid during evaluation period
- **No Token Refresh**: Without token refresh mechanism, 7 days is long enough to avoid frequent re-authentication but short enough to limit security risk
- **Industry Standard**: 7-day expiration is common for web applications (e.g., GitHub, GitLab use similar durations)

**Alternatives Considered**:
1. **Short Expiration (1 hour) with Refresh Tokens**:
   - Pros: Better security (short-lived access tokens), can revoke refresh tokens
   - Cons: Requires refresh token implementation, more complex flow, additional API endpoint
   - Rejected because: Out of scope (no token refresh), adds complexity for hackathon timeline

2. **Long Expiration (30 days)**:
   - Pros: Better user experience (less frequent logins)
   - Cons: Higher security risk if token is compromised, longer exposure window
   - Rejected because: Security risk outweighs UX benefit, not suitable for hackathon evaluation

3. **No Expiration (Permanent Tokens)**:
   - Pros: Simplest implementation, best user experience
   - Cons: Major security risk, tokens never expire even if compromised
   - Rejected because: Unacceptable security risk, violates security-first principle

**Trade-offs**:
- **Pro**: Good balance between security and UX, suitable for hackathon evaluation period
- **Con**: Users must log in again after 7 days, no way to extend session without re-authentication
- **Mitigation**: Display warning message 1 hour before expiration (FR-035), allow seamless re-login

---

## Decision 3: JWT Algorithm Choice (HS256)

**Decision**: Use HS256 (HMAC with SHA-256) algorithm for JWT token signing

**Rationale**:
- **Symmetric Key Simplicity**: HS256 uses a single shared secret (JWT_SECRET) for both signing and verification, simplifying key management
- **Better Auth Compatibility**: Better Auth uses HS256 by default for JWT tokens
- **Performance**: HS256 is faster than asymmetric algorithms (RS256) because it uses HMAC instead of RSA
- **Sufficient Security**: HS256 with a strong secret (256-bit) provides adequate security for this use case
- **Shared Secret Management**: Frontend and backend can share the same JWT_SECRET via environment variables

**Alternatives Considered**:
1. **RS256 (RSA with SHA-256)**:
   - Pros: Asymmetric keys (public key for verification, private key for signing), better for distributed systems
   - Cons: More complex key management, slower performance, requires public/private key pair generation
   - Rejected because: Overkill for single backend architecture, adds complexity without significant security benefit

2. **ES256 (ECDSA with SHA-256)**:
   - Pros: Smaller key size than RSA, faster than RSA, asymmetric keys
   - Cons: Less widely supported, more complex key management
   - Rejected because: Limited library support, unnecessary complexity for this use case

3. **HS512 (HMAC with SHA-512)**:
   - Pros: Stronger hash function than SHA-256
   - Cons: Larger token size, minimal security benefit over HS256
   - Rejected because: HS256 is sufficient, HS512 increases token size without meaningful security improvement

**Trade-offs**:
- **Pro**: Simple key management, fast performance, Better Auth compatibility, sufficient security
- **Con**: Shared secret must be kept secure on both frontend and backend, symmetric key limits distributed verification
- **Mitigation**: Store JWT_SECRET in environment variables (never hardcode), use HTTPS to protect secret in transit

---

## Decision 4: Shared Secret Management Strategy

**Decision**: Store JWT_SECRET in environment variables (.env files) on both frontend and backend, never hardcode in source code

**Rationale**:
- **Security Best Practice**: Environment variables prevent secrets from being committed to version control
- **Flexibility**: Different secrets can be used for development, staging, and production environments
- **Constitution Compliance**: C-009 requires no hardcoded secrets, all sensitive configuration must use environment variables
- **Better Auth Integration**: Better Auth reads JWT_SECRET from environment variables by default
- **Deployment Compatibility**: All deployment platforms (Vercel, Railway, Docker) support environment variables

**Alternatives Considered**:
1. **Hardcoded Secret in Source Code**:
   - Pros: Simplest implementation, no configuration needed
   - Cons: Major security risk, secret exposed in version control, violates constitution
   - Rejected because: Unacceptable security risk, violates C-009 constraint

2. **Secret Management Service (AWS Secrets Manager, HashiCorp Vault)**:
   - Pros: Centralized secret management, automatic rotation, audit logging
   - Cons: Adds infrastructure complexity, requires additional service setup, overkill for hackathon
   - Rejected because: Too complex for hackathon timeline, environment variables are sufficient

3. **Database Storage**:
   - Pros: Centralized storage, can be updated without redeployment
   - Cons: Requires database query on every token verification, performance overhead, secret exposed in database
   - Rejected because: Performance overhead, doesn't solve secret distribution problem

**Implementation Details**:
- **Backend (.env)**:
  ```
  JWT_SECRET=your-256-bit-secret-here
  JWT_ALGORITHM=HS256
  JWT_EXPIRATION_HOURS=168  # 7 days
  ```
- **Frontend (.env.local)**:
  ```
  NEXT_PUBLIC_JWT_SECRET=your-256-bit-secret-here
  ```
- **Secret Generation**: Use `openssl rand -base64 32` to generate a strong 256-bit secret
- **Secret Synchronization**: Ensure the same JWT_SECRET is used on both frontend and backend

**Trade-offs**:
- **Pro**: Secure, flexible, follows best practices, constitution-compliant
- **Con**: Requires manual secret synchronization between frontend and backend, secret must be configured in deployment environment
- **Mitigation**: Document secret setup in quickstart.md, provide .env.example files with clear instructions

---

## Decision 5: User Identity Extraction from JWT

**Decision**: Extract user_id and email from JWT token claims after signature verification, use user_id for all database queries

**Rationale**:
- **Stateless Authorization**: User identity is embedded in the token, no database lookup needed for every request
- **Database-Level Isolation**: user_id from token is used in WHERE clauses to filter all queries, enforcing user isolation at the database level
- **Performance**: No additional database query needed to get user identity after token verification
- **Security**: Signature verification ensures user_id hasn't been tampered with
- **Constitution Compliance**: Enforces multi-user data isolation (Principle V)

**JWT Token Structure**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "exp": 1737849600,
  "iat": 1737244800
}
```

**Implementation Flow**:
1. **Frontend**: Better Auth generates JWT token with user_id and email claims after successful login
2. **Frontend**: Attaches token to API requests in Authorization header: `Bearer <token>`
3. **Backend**: Extracts token from Authorization header
4. **Backend**: Verifies token signature using JWT_SECRET and HS256 algorithm
5. **Backend**: Validates token expiration (exp claim vs server time)
6. **Backend**: Extracts user_id and email from token claims
7. **Backend**: Uses user_id in database queries: `WHERE user_id = {authenticated_user_id}`

**Alternatives Considered**:
1. **Database Lookup After Token Verification**:
   - Pros: Can check if user still exists, can get latest user data
   - Cons: Additional database query on every request, performance overhead
   - Rejected because: Performance overhead, user existence check can be done separately if needed

2. **Store User ID in Session**:
   - Pros: No need to decode token on every request
   - Cons: Requires session storage, defeats purpose of stateless JWT
   - Rejected because: Contradicts stateless JWT decision, adds session storage complexity

3. **Use Email as User Identifier**:
   - Pros: Human-readable, no UUID needed
   - Cons: Email can change, not suitable as primary key, larger payload
   - Rejected because: UUIDs are better primary keys, email changes would break references

**Trade-offs**:
- **Pro**: Stateless, performant, secure, enforces database-level isolation
- **Con**: User data in token can become stale (e.g., email change requires new token), token size increases with more claims
- **Mitigation**: Keep token claims minimal (only user_id and email), use short expiration to limit stale data window

---

## Decision 6: Security Risks and Mitigations

**Decision**: Implement comprehensive security measures to mitigate JWT authentication risks

### Risk 1: Token Theft (XSS, Man-in-the-Middle)

**Risk**: JWT tokens can be stolen via XSS attacks or intercepted in transit

**Mitigations**:
- **HTTPS Only**: Use HTTPS in production to encrypt tokens in transit (FR-039)
- **HttpOnly Cookies**: Store tokens in httpOnly cookies (not localStorage) to prevent XSS access (FR-013)
- **Content Security Policy**: Implement CSP headers to prevent XSS attacks
- **Short Expiration**: 7-day expiration limits exposure window if token is stolen
- **Input Sanitization**: Sanitize all user inputs to prevent XSS injection

### Risk 2: Token Replay Attacks

**Risk**: Stolen tokens can be reused until expiration

**Mitigations**:
- **Short Expiration**: 7-day expiration limits replay window
- **HTTPS Only**: Prevents token interception in transit
- **Token Binding**: Consider adding IP address or user agent to token claims (future enhancement)
- **Logout Handling**: Frontend deletes token on logout, though token remains valid until expiration

### Risk 3: Brute Force Attacks on Login

**Risk**: Attackers can attempt to guess passwords via repeated login attempts

**Mitigations**:
- **Rate Limiting**: Limit login attempts to 5 per minute per IP (FR-041)
- **Strong Password Policy**: Enforce minimum 8 characters (FR-003)
- **Password Hashing**: Use bcrypt with cost factor 10 (FR-004)
- **Account Lockout**: Consider temporary account lockout after failed attempts (future enhancement)

### Risk 4: JWT Secret Exposure

**Risk**: If JWT_SECRET is exposed, attackers can forge valid tokens

**Mitigations**:
- **Environment Variables**: Never hardcode JWT_SECRET in source code (C-009)
- **Strong Secret**: Use 256-bit random secret generated with `openssl rand -base64 32`
- **Secret Rotation**: Plan for secret rotation process (requires re-authentication of all users)
- **Access Control**: Limit access to environment variables in production

### Risk 5: User Enumeration

**Risk**: Attackers can determine which email addresses are registered

**Mitigations**:
- **Generic Error Messages**: Return "Invalid email or password" instead of "Email not found" (FR-040)
- **Consistent Response Times**: Ensure login failures take similar time regardless of whether email exists
- **Rate Limiting**: Prevent automated enumeration attempts

### Risk 6: SQL Injection

**Risk**: Malicious input could manipulate database queries

**Mitigations**:
- **Parameterized Queries**: Use SQLModel ORM with parameterized queries (FR-029, C-013)
- **Input Validation**: Validate all user inputs (email format, password length)
- **Database-Level Isolation**: Use WHERE user_id filtering to prevent cross-user data access

### Risk 7: Token Expiration Not Enforced

**Risk**: Expired tokens could be accepted if expiration check is missing

**Mitigations**:
- **Expiration Validation**: Check exp claim against server time on every request (FR-017, FR-031)
- **Server Time Only**: Use server time for expiration checks, not client time
- **Automated Tests**: Test expired token rejection in test suite

### Risk 8: Cross-User Data Access

**Risk**: Users could access or modify other users' tasks

**Mitigations**:
- **Database-Level Filtering**: All queries include WHERE user_id = {authenticated_user_id} (FR-024, FR-030)
- **Ownership Verification**: Verify task ownership before update/delete operations (FR-027, FR-028)
- **404 Instead of 403**: Return 404 (not 403) for ownership violations to avoid revealing task existence (FR-026, C-016)
- **Automated Tests**: Test user isolation with multiple users in test suite

**Overall Security Posture**:
- **Defense in Depth**: Multiple layers of security (HTTPS, token expiration, rate limiting, input validation, database-level isolation)
- **Security-First Development**: All security requirements are explicit in specification (Principle III)
- **Constitution Compliance**: All security constraints are enforced (C-009 to C-016)
- **Hackathon Evaluation**: Zero security vulnerabilities is a success criterion (SC-009)

---

## Summary

All 6 key technical decisions have been documented with rationale, alternatives, and trade-offs. The authentication architecture uses:

1. **Stateless JWT tokens** for scalability and Better Auth compatibility
2. **7-day expiration** for security-UX balance
3. **HS256 algorithm** for simplicity and performance
4. **Environment variables** for secure secret management
5. **User ID extraction** from JWT claims for database-level isolation
6. **Comprehensive security mitigations** for all identified risks

These decisions align with the constitution principles (security-first, spec-driven, multi-user isolation) and are suitable for hackathon evaluation within the Phase II timeline.
