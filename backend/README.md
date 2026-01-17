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

## 🚀 Live API

- **API Base URL**: https://ayeshamasood110-todo-backend-api.hf.space
- **Swagger UI**: https://ayeshamasood110-todo-backend-api.hf.space/docs
- **ReDoc**: https://ayeshamasood110-todo-backend-api.hf.space/redoc
- **Health Check**: https://ayeshamasood110-todo-backend-api.hf.space/health

## ✨ Features

- RESTful API endpoints for task management
- User authentication with JWT tokens
- PostgreSQL database with SQLModel ORM
- Secure password hashing with bcrypt
- CORS configuration for frontend integration
- Automatic database migrations with Alembic

## 🔐 Environment Variables Required

Configure these in Space Settings → Repository secrets:

- `DATABASE_URL` - PostgreSQL connection string (Neon Serverless)
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_ALGORITHM` - JWT algorithm (HS256)
- `JWT_EXPIRATION_HOURS` - Token expiration time (168 hours = 7 days)
- `FRONTEND_URL` - Your Vercel frontend URL for CORS

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and get JWT token

### Tasks (Protected - Requires JWT)
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{task_id}` - Get a specific task
- `PUT /api/tasks/{task_id}` - Update a task
- `DELETE /api/tasks/{task_id}` - Delete a task
- `POST /api/tasks/{task_id}/toggle` - Toggle task completion status

### Health
- `GET /health` - Check API health status
- `GET /` - API information

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.109+
- **ORM**: SQLModel 0.0.14+
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **Migrations**: Alembic 1.13+
- **Deployment**: Docker on Hugging Face Spaces

## 🔗 Related Links

- **Frontend**: https://your-vercel-app.vercel.app
- **GitHub Repository**: https://github.com/ArifAbbas11/Todo-FullStack-App
- **Documentation**: See `/docs` endpoint for interactive API documentation

## 📝 License

MIT License - See LICENSE file for details

---

Built with ❤️ using FastAPI and deployed on Hugging Face Spaces
