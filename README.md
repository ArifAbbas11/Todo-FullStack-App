# Todo Full-Stack Web Application

A modern, secure todo application with user authentication, built with Next.js and FastAPI.

## Features

- ✅ User authentication (signup/signin) with JWT tokens
- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ User-specific task isolation
- ✅ Responsive design with dark mode support
- ✅ Real-time toast notifications
- ✅ Secure password hashing with bcrypt
- ✅ PostgreSQL database with Neon Serverless

## Technology Stack

### Frontend
- **Next.js 16.1.2** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Better Auth** - Authentication library

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

## Project Structure

```
.
├── frontend/           # Next.js frontend application
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and API client
│   └── public/        # Static assets
├── backend/           # FastAPI backend application
│   ├── app/           # Application code
│   │   ├── api/       # API routes
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   └── core/      # Core utilities
│   └── alembic/       # Database migrations
└── specs/             # Feature specifications
```

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database (Neon account)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your configuration:
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8001
```

The backend will be available at `http://localhost:8001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Deployment

### Vercel Deployment (Frontend)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy

### Backend Deployment Options

- **Railway**: Easy Python deployment with PostgreSQL
- **Render**: Free tier available for FastAPI apps
- **Fly.io**: Global deployment with PostgreSQL
- **AWS/GCP/Azure**: Traditional cloud platforms

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## API Endpoints

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

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- User-specific data isolation
- CORS protection
- SQL injection prevention with SQLModel
- Environment variable protection

## Development Workflow

This project follows the Spec-Driven Development (SDD) workflow:
1. Write feature specifications
2. Generate architectural plans
3. Break down into testable tasks
4. Implement via Claude Code with specialized agents

## License

MIT License

## Author

Built with Claude Code and the Agentic Dev Stack
