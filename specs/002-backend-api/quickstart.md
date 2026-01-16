# Quickstart Guide: Todo App Backend API

**Feature**: 002-backend-api
**Date**: 2026-01-15
**Purpose**: Step-by-step guide to set up, run, and test the backend API locally

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed (`python --version`)
- **pip** package manager
- **Neon PostgreSQL** database provisioned (get connection string from Neon dashboard)
- **Better Auth JWT secret** (shared with frontend application)
- **Git** for version control

## Quick Start (5 minutes)

### 1. Clone and Navigate to Backend

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb

# JWT Configuration (MUST match Better Auth secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

**Important**: Generate a secure JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Run Database Migrations

```bash
alembic upgrade head
```

This creates the `users` and `tasks` tables in your Neon database.

### 6. Start the API Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now running at `http://localhost:8000`

### 7. Verify API is Running

Open your browser or use curl:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

### 8. View API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Testing the API

### Get a JWT Token

Since authentication is handled by Better Auth (frontend), you need a valid JWT token to test protected endpoints.

**Option 1: Use Frontend Application**
1. Sign up/sign in via the frontend application
2. Open browser DevTools → Application → Local Storage
3. Copy the JWT token value

**Option 2: Generate Test Token (Development Only)**

Create a test script `generate_test_token.py`:

```python
from src.core.security import create_access_token
from datetime import datetime, timedelta

# Create test token for user ID
user_data = {
    "sub": "550e8400-e29b-41d4-a716-446655440000",  # Test user ID
    "email": "test@example.com",
    "exp": datetime.utcnow() + timedelta(hours=24)
}

token = create_access_token(user_data)
print(f"Test JWT Token:\n{token}")
```

Run it:
```bash
python generate_test_token.py
```

### Test Endpoints with curl

**1. Create a Task**

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs"
  }'
```

Expected response (201 Created):
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "is_completed": false,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-01-15T10:30:00Z"
  },
  "message": "Task created successfully"
}
```

**2. List All Tasks**

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (200 OK):
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Complete project documentation",
      "description": "Write comprehensive API docs",
      "is_completed": false,
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "message": "Tasks retrieved successfully"
}
```

**3. Toggle Task Completion**

```bash
curl -X PATCH http://localhost:8000/api/tasks/123e4567-e89b-12d3-a456-426614174000/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (200 OK):
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "is_completed": true,
    ...
  },
  "message": "Task completion status toggled successfully"
}
```

**4. Update Task**

```bash
curl -X PUT http://localhost:8000/api/tasks/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Update project documentation",
    "description": "Revise API docs with new endpoints"
  }'
```

**5. Delete Task**

```bash
curl -X DELETE http://localhost:8000/api/tasks/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response (204 No Content): Empty response body

---

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/test_tasks.py
```

### Run with Coverage

```bash
pytest --cov=src --cov-report=html
```

View coverage report: `open htmlcov/index.html`

### Run Tests in Watch Mode

```bash
pytest-watch
```

---

## Common Issues and Solutions

### Issue: Database Connection Error

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
1. Verify DATABASE_URL in `.env` is correct
2. Check Neon dashboard - database may be paused (auto-resumes on connection)
3. Ensure your IP is allowed in Neon's connection settings
4. Test connection: `psql "YOUR_DATABASE_URL"`

### Issue: JWT Token Validation Failed

**Error**: `401 Unauthorized: Invalid or expired token`

**Solution**:
1. Verify JWT_SECRET in backend `.env` matches Better Auth secret
2. Check token hasn't expired (default 24 hours)
3. Ensure Authorization header format: `Bearer <token>` (note the space)
4. Verify token signature using jwt.io debugger

### Issue: CORS Error in Browser

**Error**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:
1. Verify FRONTEND_URL in `.env` matches your frontend origin
2. Restart the API server after changing `.env`
3. Check CORS middleware configuration in `src/main.py`

### Issue: Migration Failed

**Error**: `alembic.util.exc.CommandError: Can't locate revision identified by 'xxx'`

**Solution**:
1. Check database connection
2. Reset migrations: `alembic downgrade base` then `alembic upgrade head`
3. If database is corrupted, drop tables and re-run migrations

### Issue: Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solution**:
1. Find process using port 8000: `lsof -i :8000`
2. Kill the process: `kill -9 <PID>`
3. Or use a different port: `uvicorn src.main:app --port 8001`

---

## Development Workflow

### 1. Create a New Migration

After modifying models in `src/models/`:

```bash
alembic revision --autogenerate -m "Add new field to tasks"
```

Review the generated migration in `alembic/versions/`, then apply:

```bash
alembic upgrade head
```

### 2. Rollback a Migration

```bash
alembic downgrade -1  # Rollback one migration
alembic downgrade base  # Rollback all migrations
```

### 3. Hot Reload During Development

The `--reload` flag automatically restarts the server when code changes:

```bash
uvicorn src.main:app --reload
```

### 4. Check Code Quality

```bash
# Format code
black src/ tests/

# Check types
mypy src/

# Lint code
flake8 src/ tests/
```

---

## Production Deployment

### Environment Variables for Production

```env
DATABASE_URL=postgresql://user:password@production-host/db?sslmode=require
JWT_SECRET=<generate-secure-secret-64-chars>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
FRONTEND_URL=https://yourdomain.com
HOST=0.0.0.0
PORT=8000
```

### Run with Gunicorn (Production Server)

```bash
pip install gunicorn
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "src.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

Build and run:

```bash
docker build -t todo-api .
docker run -p 8000:8000 --env-file .env todo-api
```

### Health Check Endpoint

Configure your load balancer or orchestrator to use:

```
GET /health
```

Expected 200 OK response indicates API is healthy.

---

## API Usage Examples

### Python Client Example

```python
import requests

BASE_URL = "http://localhost:8000"
JWT_TOKEN = "your-jwt-token"

headers = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json"
}

# Create task
response = requests.post(
    f"{BASE_URL}/api/tasks",
    headers=headers,
    json={"title": "New task", "description": "Task description"}
)
task = response.json()["data"]
print(f"Created task: {task['id']}")

# List tasks
response = requests.get(f"{BASE_URL}/api/tasks", headers=headers)
tasks = response.json()["data"]
print(f"Total tasks: {len(tasks)}")

# Toggle completion
task_id = task["id"]
response = requests.patch(
    f"{BASE_URL}/api/tasks/{task_id}/toggle",
    headers=headers
)
updated_task = response.json()["data"]
print(f"Task completed: {updated_task['is_completed']}")
```

### JavaScript/TypeScript Client Example

```typescript
const BASE_URL = "http://localhost:8000";
const JWT_TOKEN = "your-jwt-token";

const headers = {
  "Authorization": `Bearer ${JWT_TOKEN}`,
  "Content-Type": "application/json"
};

// Create task
const response = await fetch(`${BASE_URL}/api/tasks`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    title: "New task",
    description: "Task description"
  })
});
const { data: task } = await response.json();
console.log(`Created task: ${task.id}`);

// List tasks
const listResponse = await fetch(`${BASE_URL}/api/tasks`, { headers });
const { data: tasks } = await listResponse.json();
console.log(`Total tasks: ${tasks.length}`);
```

---

## Next Steps

1. **Implement the API**: Run `/sp.tasks` to generate implementation tasks
2. **Write Tests**: Add comprehensive test coverage for all endpoints
3. **Deploy**: Set up CI/CD pipeline for automated deployment
4. **Monitor**: Add logging and monitoring for production

---

## Resources

- **API Documentation**: http://localhost:8000/docs
- **Feature Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/openapi.yaml](./contracts/openapi.yaml)

---

## Support

For issues or questions:
1. Check the [Common Issues](#common-issues-and-solutions) section
2. Review the API documentation at `/docs`
3. Consult the feature specification and implementation plan
4. Check application logs for detailed error messages
