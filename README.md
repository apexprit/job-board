# 🎯 JobBoard — Full-Stack Job Board Platform

A modern, full-featured job board platform built with React, Node.js, TypeScript, and PostgreSQL. Supports three user roles (Job Seekers, Employers, Admins) with complete CRUD operations, search, applications, and moderation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 80)                       │
│              Static Files + Reverse Proxy                │
├──────────────────────┬──────────────────────────────────┤
│   React Client       │   /api/* → Express Server        │
│   (Vite + Tailwind)  │   (Port 3001)                    │
│                      │                                  │
│   • Auth Context     │   • JWT Authentication           │
│   • React Router     │   • RBAC Authorization           │
│   • API Client       │   • Prisma ORM                   │
│   • Form Validation  │   • Redis Caching                │
│                      │   • File Uploads                  │
├──────────────────────┴──────┬───────────────────────────┤
│        PostgreSQL 16        │      Redis 7              │
│     (Primary Database)      │   (Cache + Sessions)      │
└─────────────────────────────┴───────────────────────────┘
```

## 📁 Project Structure

```
job/
├── client/                 # React frontend (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── api/           # API client modules (axios + interceptors)
│   │   ├── components/    # Reusable UI, layout, form, auth, upload components
│   │   ├── context/       # React contexts (AuthContext)
│   │   ├── hooks/         # Custom hooks (useAuth, useForm)
│   │   ├── pages/         # Page components (auth, jobs, employer, seeker, admin)
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── e2e/               # Playwright E2E tests
│   ├── Dockerfile         # Multi-stage build → Nginx
│   └── nginx.conf         # Nginx SPA + proxy config
├── server/                 # Express backend (TypeScript + Prisma)
│   ├── src/
│   │   ├── config/        # Database, Redis, Environment config
│   │   ├── middleware/    # Auth, RBAC, validation, rate limiting, upload, error handler
│   │   ├── repositories/  # Data access layer (repository pattern)
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic layer
│   │   ├── validators/    # Zod request validation schemas
│   │   └── utils/         # Password hashing, caching utilities
│   ├── prisma/            # Prisma schema, migrations, seed
│   ├── __tests__/         # Jest unit + integration tests
│   └── Dockerfile         # Multi-stage build → Node.js
├── shared/                 # Shared TypeScript types between client and server
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Production Docker Compose
├── docker-compose.dev.yml  # Development Docker Compose (PG + Redis + Adminer)
└── Makefile               # Development command shortcuts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Option 1: Local Development

```bash
# Clone the repository
git clone <repo-url>
cd job

# Install dependencies
npm ci

# Start PostgreSQL and Redis using Docker
make docker-dev

# Setup database
cd shared && npm run build && cd ..
cd server && npx prisma generate && npx prisma db push && npm run db:seed && cd ..

# Start development servers
make dev

# Or start individually:
cd server && npm run dev    # http://localhost:3001
cd client && npm run dev    # http://localhost:5173
```

### Option 2: Docker Compose (Production)

```bash
# Build and start all services
make docker-build
make docker-up

# Access the application at http://localhost
```

### Option 3: Make Setup (One Command)

```bash
make setup    # Installs deps, builds shared, sets up DB, seeds data
```

## 🔑 Default Accounts

After seeding, these accounts are available:

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@jobboard.com    | password123 |
| Employer | employer@jobboard.com | password123 |
| Seeker   | seeker@jobboard.com   | password123 |

## 🛠️ Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS      |
| Backend     | Node.js, Express, TypeScript                   |
| Database    | PostgreSQL 16 (prod), SQLite (dev)            |
| ORM         | Prisma                                        |
| Cache       | Redis 7 (with in-memory fallback)             |
| Auth        | JWT (access + refresh tokens), bcryptjs        |
| Validation  | Zod (both client and server)                  |
| File Upload | Multer (PDF, DOC, DOCX, images)               |
| Testing     | Jest, Vitest, React Testing Library, Playwright|
| Container   | Docker, Docker Compose, Nginx                 |
| CI/CD       | GitHub Actions                                |
| API Docs    | OpenAPI 3.0 / Swagger UI                      |

## 📡 API Endpoints

### Authentication

| Method | Endpoint              | Auth  | Description          |
|--------|-----------------------|-------|----------------------|
| POST   | /api/auth/register    | No    | Register new user    |
| POST   | /api/auth/login       | No    | Login                |
| POST   | /api/auth/refresh     | No    | Refresh access token |
| POST   | /api/auth/logout      | Yes   | Logout               |
| GET    | /api/auth/me          | Yes   | Get current user     |

### Jobs

| Method | Endpoint              | Auth         | Description          |
|--------|-----------------------|--------------|----------------------|
| GET    | /api/jobs             | No           | List approved jobs   |
| GET    | /api/jobs/search      | No           | Search/filter jobs   |
| GET    | /api/jobs/:id         | No           | Get job details      |
| POST   | /api/jobs             | Employer     | Create job           |
| PUT    | /api/jobs/:id         | Owner/Admin  | Update job           |
| DELETE | /api/jobs/:id         | Owner/Admin  | Delete job           |

### Applications

| Method | Endpoint                     | Auth     | Description           |
|--------|------------------------------|----------|-----------------------|
| POST   | /api/applications            | Seeker   | Apply for job         |
| GET    | /api/applications/seeker     | Seeker   | List own applications |
| GET    | /api/applications/job/:jobId | Employer | List job applicants   |
| PATCH  | /api/applications/:id/status | Employer | Update status         |
| DELETE | /api/applications/:id        | Seeker   | Withdraw application  |

### Companies

| Method | Endpoint               | Auth          | Description      |
|--------|------------------------|---------------|------------------|
| GET    | /api/companies         | No            | List companies   |
| GET    | /api/companies/:id     | No            | Company details  |
| POST   | /api/companies         | Employer/Admin| Create company   |
| PUT    | /api/companies/:id     | Admin         | Update company   |
| DELETE | /api/companies/:id     | Admin         | Delete company   |

### Users

| Method | Endpoint               | Auth | Description      |
|--------|------------------------|------|------------------|
| GET    | /api/users/me          | Yes  | Get own profile  |
| PUT    | /api/users/me          | Yes  | Update profile   |
| PUT    | /api/users/me/password | Yes  | Change password  |
| DELETE | /api/users/me          | Yes  | Delete account   |

### Admin

| Method | Endpoint                     | Auth  | Description        |
|--------|------------------------------|-------|--------------------|
| GET    | /api/admin/stats             | Admin | Dashboard stats    |
| GET    | /api/admin/jobs/pending      | Admin | List pending jobs  |
| PATCH  | /api/admin/jobs/:id/moderate | Admin | Approve/reject job |
| GET    | /api/admin/users             | Admin | List all users     |
| PATCH  | /api/admin/users/:id/role    | Admin | Change user role   |

### Upload

| Method | Endpoint           | Auth    | Description     |
|--------|--------------------|---------|-----------------|
| POST   | /api/upload/resume | Seeker  | Upload resume   |
| POST   | /api/upload/avatar | Any     | Upload avatar   |

> 📖 **Interactive API Docs**: Visit `/api/docs/` when the server is running for full Swagger UI documentation.

## 🧪 Testing

```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test

# E2E tests (requires both servers running)
cd client && npm run test:e2e

# Run all tests
make test
```

## 🐳 Docker Commands

```bash
make docker-dev      # Start PG + Redis + Adminer for local dev
make docker-build    # Build production images
make docker-up       # Start production stack
make docker-down     # Stop all containers
```

## 📝 Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable             | Description                    | Default                    |
|----------------------|--------------------------------|----------------------------|
| PORT                 | Server port                    | 3001                       |
| DATABASE_URL         | PostgreSQL connection string   | postgresql://...           |
| JWT_SECRET           | Access token secret            | -                          |
| JWT_REFRESH_SECRET   | Refresh token secret           | -                          |
| JWT_EXPIRES_IN       | Access token expiry            | 15m                        |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry         | 7d                         |
| REDIS_URL            | Redis connection string        | redis://localhost:6379     |
| NODE_ENV             | Environment                    | development                |
| CORS_ORIGIN          | Allowed CORS origin            | http://localhost:5173      |

## 📄 License

MIT
