# Todo App Backend (FastAPI)

RESTful API backend for the Todo Full-Stack Web Application built with FastAPI, SQLModel, and Neon PostgreSQL.

## Features

- JWT-based authentication
- User registration and login
- CRUD operations for tasks
- User isolation (users can only access their own tasks)
- Automatic API documentation (OpenAPI/Swagger)
- Database migrations with Alembic

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **ORM**: SQLModel 0.0.14
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT tokens (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Migrations**: Alembic 1.13.1
- **Testing**: pytest, httpx

## Prerequisites

- Python 3.11 or higher
- Neon PostgreSQL account (https://neon.tech)
- pip and virtualenv

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: Generate using `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `FRONTEND_URL`: Frontend URL (default: http://localhost:3000)

### 4. Initialize Database

Run Alembic migrations:

```bash
alembic upgrade head
```

### 5. Run Development Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Project Structure

```
backend/
├── src/
│   ├── models/          # SQLModel database models
│   │   ├── user.py      # User model
│   │   └── task.py      # Task model
│   ├── schemas/         # Pydantic request/response schemas
│   │   ├── auth.py      # Auth schemas
│   │   └── task.py      # Task schemas
│   ├── services/        # Business logic
│   │   ├── auth.py      # Authentication service
│   │   └── task.py      # Task service
│   ├── api/             # API endpoints
│   │   ├── auth.py      # Auth endpoints
│   │   ├── tasks.py     # Task endpoints
│   │   └── deps.py      # Dependencies (JWT validation)
│   ├── core/            # Core configuration
│   │   ├── config.py    # Environment configuration
│   │   ├── database.py  # Database connection
│   │   └── security.py  # JWT and password utilities
│   └── main.py          # FastAPI application entry point
├── tests/               # Test files
├── alembic/             # Database migrations
│   └── versions/        # Migration files
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Authenticate and get JWT token

### Tasks (Protected - Requires JWT)

- `GET /tasks` - List all tasks for authenticated user
- `POST /tasks` - Create new task
- `GET /tasks/{id}` - Get single task
- `PUT /tasks/{id}` - Update task
- `PATCH /tasks/{id}/toggle` - Toggle task completion
- `DELETE /tasks/{id}` - Delete task

### Health

- `GET /health` - Health check endpoint

## Authentication Flow

1. User signs up: `POST /auth/signup` with email and password
2. Backend hashes password and creates user
3. Backend generates JWT token with user ID
4. User signs in: `POST /auth/signin` with credentials
5. Backend validates credentials and returns JWT token
6. Client includes token in `Authorization: Bearer <token>` header
7. Backend validates token on protected endpoints

## Database Schema

### Users Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### Tasks Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FOREIGN KEY → users.id |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | NULL |
| is_completed | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

## Testing

Run all tests:

```bash
pytest -v
```

Run specific test file:

```bash
pytest tests/test_auth.py -v
```

Run with coverage:

```bash
pytest --cov=src --cov-report=html
```

## Database Migrations

Create new migration:

```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback migration:

```bash
alembic downgrade -1
```

## Security Considerations

- JWT secrets are stored in environment variables (never committed)
- Passwords are hashed with bcrypt before storage
- User isolation enforced at database query level
- CORS configured to whitelist frontend origin only
- SQL injection prevented by SQLModel parameterized queries

## Troubleshooting

### Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**: Verify `DATABASE_URL` in `.env` matches your Neon connection string

### JWT Token Invalid

```
401 Unauthorized: Invalid token
```

**Solution**: Ensure `JWT_SECRET` is identical in frontend and backend `.env` files

### CORS Error

```
Access blocked by CORS policy
```

**Solution**: Verify `FRONTEND_URL` in `.env` matches your frontend origin

## Development Workflow

1. Create/modify models in `src/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Apply migration: `alembic upgrade head`
4. Create schemas in `src/schemas/`
5. Implement business logic in `src/services/`
6. Create API endpoints in `src/api/`
7. Write tests in `tests/`
8. Run tests: `pytest -v`

## Deployment

### Environment Variables (Production)

- `DATABASE_URL`: Production Neon PostgreSQL connection string
- `JWT_SECRET`: Secure random string (32+ characters)
- `JWT_ALGORITHM`: HS256
- `JWT_EXPIRATION_HOURS`: 24
- `FRONTEND_URL`: Production frontend URL (e.g., https://yourdomain.com)

### Deployment Platforms

- **Railway**: Connect GitHub repo, set environment variables, deploy
- **Render**: Connect GitHub repo, set environment variables, deploy
- **Fly.io**: Use `fly.toml` configuration, deploy with `fly deploy`

## License

MIT

## Support

For issues or questions, refer to:
- [Specification](../specs/001-todo-web-app/spec.md)
- [Implementation Plan](../specs/001-todo-web-app/plan.md)
- [API Contracts](../specs/001-todo-web-app/contracts/)
