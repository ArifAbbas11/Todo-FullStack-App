---
name: auth-skill
description: Implement secure user authentication flows including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication Skill

## Instructions

1. **User Signup**
   - Validate user input (email, password, username)
   - Hash passwords before storing
   - Prevent duplicate accounts
   - Store user securely in the database

2. **User Signin**
   - Verify credentials
   - Compare hashed passwords
   - Return authentication tokens
   - Handle invalid login attempts safely

3. **Password Security**
   - Use strong hashing (bcrypt / argon2)
   - Never store plain-text passwords
   - Enforce password complexity
   - Support password reset flow

4. **JWT Tokens**
   - Generate access & refresh tokens
   - Set secure expiration times
   - Protect routes using middleware
   - Verify tokens on each request

5. **Better Auth Integration**
   - Configure providers
   - Handle OAuth flows
   - Sync user profiles
   - Secure session handling

## Best Practices
- Always hash passwords
- Use HTTPS for auth routes
- Store secrets in environment variables
- Implement rate limiting
- Use refresh tokens for sessions
- Validate all user input

## Example Structure
```ts
// Signup
const hashedPassword = await bcrypt.hash(password, 10);

// Signin
const isValid = await bcrypt.compare(password, user.password);

// JWT
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
  expiresIn: "15m",
});
