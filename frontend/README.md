# Todo App Frontend (Next.js)

Modern, responsive frontend for the Todo Full-Stack Web Application built with Next.js 16+, TypeScript, TailwindCSS, and Better Auth.

## Features

- User authentication (signup/signin) with JWT tokens
- Create, read, update, delete tasks
- Toggle task completion status
- Responsive design (mobile, tablet, desktop)
- Real-time UI updates with optimistic rendering
- Protected routes with authentication middleware
- Modern UI with TailwindCSS

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Better Auth (JWT)
- **HTTP Client**: Fetch API

## Prerequisites

- Node.js 18.x or higher
- npm
- Backend API running (see ../backend/README.md)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update the variables in `.env.local` (use the SAME JWT_SECRET as backend).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── signup/            # Signup page
│   ├── signin/            # Signin page
│   ├── tasks/             # Tasks page (protected)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── tasks/            # Task components
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── auth.ts          # Better Auth config
│   ├── api.ts           # API client
│   └── types.ts         # TypeScript types
└── middleware.ts         # Route protection
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

## Support

For issues, refer to:
- [Specification](../specs/001-todo-web-app/spec.md)
- [Backend README](../backend/README.md)
