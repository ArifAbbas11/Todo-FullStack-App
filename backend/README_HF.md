---
title: Todo Backend API
emoji: 📝
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
---

# Todo Backend API

FastAPI backend for the Todo Full-Stack Web Application with JWT authentication and PostgreSQL database.

## Features

- RESTful API endpoints for task management
- User authentication with JWT tokens
- PostgreSQL database with SQLModel ORM
- Secure password hashing with bcrypt
- CORS configuration for frontend integration

## API Documentation

Once deployed, visit:
- Swagger UI: `https://your-space-name.hf.space/docs`
- ReDoc: `https://your-space-name.hf.space/redoc`

## Environment Variables

This Space requires the following environment variables (configure in Space Settings):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_ALGORITHM` - JWT algorithm (default: HS256)
- `JWT_EXPIRATION_HOURS` - Token expiration time (default: 168)
- `FRONTEND_URL` - Your Vercel frontend URL for CORS

## Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and get JWT token

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{task_id}` - Get a specific task
- `PUT /api/tasks/{task_id}` - Update a task
- `DELETE /api/tasks/{task_id}` - Delete a task
- `POST /api/tasks/{task_id}/toggle` - Toggle task completion status

## Health Check

- `GET /health` - Check API health status

## Technology Stack

- FastAPI 0.109+
- SQLModel 0.0.14+
- PostgreSQL (Neon Serverless)
- JWT Authentication
- Bcrypt Password Hashing
