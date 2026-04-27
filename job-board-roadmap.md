# Full-Stack Job Board Platform - Autonomous Execution Roadmap

## Phase 1: Project Scaffolding

### Task 1: Monorepo Setup
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: None  
**Files to create/modify**: package.json, lerna.json  
**Packages**: lerna  
**Description**: Initialize monorepo with npm workspaces. Create client/, server/, shared/ directories. Configure lerna for package management.  
**Completion criteria**: `lerna ls` shows client, server, shared packages.  
**If blocked**: Use yarn workspaces if lerna fails.

### Task 2: TypeScript Configs
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 1  
**Files to create/modify**: tsconfig.base.json, client/tsconfig.json, server/tsconfig.json, shared/tsconfig.json  
**Packages**: typescript  
**Description**: Create base TS config with strict settings. Extend for each package with appropriate module/target settings.  
**Completion criteria**: `tsc --build` runs without errors in each package.  
**If blocked**: Start with minimal config and gradually add strictness.

### Task 3: ESLint + Prettier
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 1  
**Files to create/modify**: .eslintrc.json, .prettierrc  
**Packages**: eslint, prettier, eslint-config-prettier  
**Description**: Configure linting and formatting rules. Set up scripts for linting and formatting.  
**Completion criteria**: `npm run lint` runs without errors.  
**If blocked**: Use standard configs initially.

### Task 4: Express Server Scaffold
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 2  
**Files to create/modify**: server/src/index.ts, server/src/routes/health.ts  
**Packages**: express, @types/express  
**Description**: Create basic Express server with health check endpoint at /health.  
**Completion criteria**: GET /health returns 200 OK.  
**If blocked**: Use http module directly.

### Task 5: React + Vite Scaffold
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 1  
**Files to create/modify**: client/vite.config.ts, client/src/main.tsx, client/src/App.tsx  
**Packages**: react, react-dom, vite, @vitejs/plugin-react  
**Description**: Set up Vite with React 18 and TypeScript. Create basic App component with routing stub.  
**Completion criteria**: `npm run dev` starts dev server.  
**If blocked**: Use create-vite boilerplate.

### Task 6: Shared Types Package
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 2  
**Files to create/modify**: shared/src/types.ts  
**Packages**: None  
**Description**: Define core interfaces: User, Job, Application, Company. Export from shared package.  
**Completion criteria**: Types importable from '@jobboard/shared'.  
**If blocked**: Define minimal interfaces initially.

### Task 7: Environment Config
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 4,5  
**Files to create/modify**: .env.example, server/src/config.ts, client/src/config.ts  
**Packages**: dotenv, zod  
**Description**: Create env validation with Zod. Define schemas for server/client env vars.  
**Completion criteria**: Config objects validated on app start.  
**If blocked**: Use process.env directly with fallbacks.

### Task 8: Git Setup
**Phase**: Project Scaffolding  
**Mode**: code  
**Depends on**: 1-7  
**Files to create/modify**: .gitignore, .gitattributes  
**Packages**: None  
**Description**: Initialize git repo. Add .gitignore for node_modules, .env, etc. Make initial commit.  
**Completion criteria**: `git status` shows clean working tree.  
**If blocked**: Commit without .gitignore initially.

## Phase 2: Database & Models

### Task 9: Prisma Schema
**Phase**: Database & Models  
**Mode**: code  
**Depends on**: 6  
**Files to create/modify**: server/prisma/schema.prisma  
**Packages**: @prisma/client  
**Description**: Define User, Job, Application, Company models with relations. Add indexes.  
**Completion criteria**: Prisma validates schema without errors.  
**If blocked**: Start with minimal models.

### Task 10: Seed Script
**Phase**: Database & Models  
**Mode**: code  
**Depends on**: 9  
**Files to create/modify**: server/prisma/seed.ts  
**Packages**: @faker-js/faker  
**Description**: Create seed data for all models using faker. Implement seed script.  
**Completion criteria**: `npx prisma db seed` populates DB.  
**If blocked**: Use static seed data.

### Task 11: Migration Scripts
**Phase**: Database & Models  
**Mode**: code  
**Depends on**: 9  
**Files to create/modify**: migrations/  
**Packages**: None  
**Description**: Generate initial migration. Create migration scripts for future updates.  
**Completion criteria**: `npx prisma migrate dev` runs successfully.  
**If blocked**: Use db push instead of migrations.

### Task 12: Repository Pattern
**Phase**: Database & Models  
**Mode**: code  
**Depends on**: 9  
**Files to create/modify**: server/src/repositories/*.ts  
**Packages**: None  
**Description**: Implement base repository with CRUD operations for each model.  
**Completion criteria**: Repositories provide create, read, update, delete methods.  
**If blocked**: Implement only essential methods.

### Task 13: Redis Setup
**Phase**: Database & Models  
**Mode**: code  
**Depends on**: 7  
**Files to create/modify**: server/src/cache/redis.ts  
**Packages**: ioredis  
**Description**: Create Redis connection utility. Implement cache get/set methods.  
**Completion criteria**: Can set/get data from Redis.  
**If blocked**: Use in-memory cache initially.

### Task 14: Database Indexing
**Phase**: Database & Models  
**Mode**: code  
**Depends on**: 9  
**Files to create/modify**: server/prisma/schema.prisma  
**Packages**: None  
**Description**: Add indexes for common query patterns (job titles, locations, etc.).  
**Completion criteria**: Indexes visible in DB schema.  
**If blocked**: Add indexes later during optimization.

## Phase 3: Authentication & Authorization

### Task 15: JWT Middleware
**Phase**: Authentication & Authorization  
**Mode**: code  
**Depends on**: 7,12  
**Files to create/modify**: server/src/middleware/auth.ts  
**Packages**: jsonwebtoken, bcrypt  
**Description**: Implement middleware to verify access tokens. Handle token refresh logic.  
**Completion criteria**: Protected routes reject requests without valid token.  
**If blocked**: Use session cookies instead.

### Task 16: Auth Routes
**Phase**: Authentication & Authorization  
**Mode**: code  
**Depends on**: 15  
**Files to create/modify**: server/src/routes/auth.ts  
**Packages**: None  
**Description**: Create endpoints: POST /register, POST /login, POST /refresh, POST /logout.  
**Completion criteria**: Can register, login, and get tokens.  
**If blocked**: Skip refresh token initially.

### Task 17: RBAC Middleware
**Phase**: Authentication & Authorization  
**Mode**: code  
**Depends on**: 15  
**Files to create/modify**: server/src/middleware/rbac.ts  
**Packages**: None  
**Description**: Implement role-based access control (admin, employer, seeker).  
**Completion criteria**: Routes reject unauthorized roles.  
**If blocked**: Use simple role checks in routes.

### Task 18: Password Utilities
**Phase**: Authentication & Authorization  
**Mode**: code  
**Depends on**: 12  
**Files to create/modify**: server/src/utils/password.ts  
**Packages**: bcrypt  
**Description**: Create hashPassword and comparePassword functions.  
**Completion criteria**: Passwords stored hashed and verifiable.  
**If blocked**: Use simpler hashing algorithm.

### Task 19: Auth Tests
**Phase**: Authentication & Authorization  
**Mode**: code  
**Depends on**: 16  
**Files to create/modify**: server/tests/auth.test.ts  
**Packages**: jest, supertest  
**Description**: Write integration tests for auth endpoints.  
**Completion criteria**: Tests cover all auth scenarios.  
**If blocked**: Test only critical paths.

## Phase 4: Core API Endpoints

### Task 20: Job CRUD
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 12,15,17  
**Files to create/modify**: server/src/routes/jobs.ts  
**Packages**: None  
**Description**: Implement POST, GET, PUT, DELETE /api/jobs endpoints.  
**Completion criteria**: Full CRUD operations for jobs.  
**If blocked**: Implement only create and read initially.

### Task 21: Job Search
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 20  
**Files to create/modify**: server/src/routes/jobs.ts  
**Packages**: None  
**Description**: Add GET /api/jobs/search with filtering, sorting, pagination.  
**Completion criteria**: Can search jobs by title, location, etc.  
**If blocked**: Implement simple search without pagination.

### Task 22: Application CRUD
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 12,15,17  
**Files to create/modify**: server/src/routes/applications.ts  
**Packages**: None  
**Description**: Implement endpoints for job applications.  
**Completion criteria**: Can create/read applications.  
**If blocked**: Skip update/delete initially.

### Task 23: Company CRUD
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 12,15,17  
**Files to create/modify**: server/src/routes/companies.ts  
**Packages**: None  
**Description**: Implement endpoints for company management.  
**Completion criteria**: Employers can manage their companies.  
**If blocked**: Implement only create and read.

### Task 24: File Upload
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 15,17  
**Files to create/modify**: server/src/middleware/upload.ts  
**Packages**: multer  
**Description**: Create middleware for resume PDF uploads. Store in local storage.  
**Completion criteria**: Can upload PDFs to /api/upload.  
**If blocked**: Use base64 encoding initially.

### Task 25: User Profile
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 12,15  
**Files to create/modify**: server/src/routes/users.ts  
**Packages**: None  
**Description**: Implement GET/PUT /api/users/me for profile management.  
**Completion criteria**: Users can view/update their profiles.  
**If blocked**: Implement only GET initially.

### Task 26: Admin Endpoints
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 17,20  
**Files to create/modify**: server/src/routes/admin.ts  
**Packages**: None  
**Description**: Create endpoints for job moderation (approve/reject).  
**Completion criteria**: Admins can moderate jobs.  
**If blocked**: Implement moderation in DB directly.

### Task 27: Request Validation
**Phase**: Core API Endpoints  
**Mode**: code  
**Depends on**: 20-26  
**Files to create/modify**: server/src/middleware/validation.ts  
**Packages**: zod  
**Description**: Add Zod validation to all endpoints. Implement rate limiting.  
**Completion criteria**: All inputs validated, rate limits applied.  
**If blocked**: Validate only critical endpoints.

## Phase 5: Frontend Foundation

### Task 28: Tailwind Setup
**Phase**: Frontend Foundation  
**Mode**: code  
**Depends on**: 5  
**Files to create/modify**: client/tailwind.config.js, client/src/index.css  
**Packages**: tailwindcss, postcss, autoprefixer  
**Description**: Configure Tailwind with design tokens.  
**Completion criteria**: Tailwind classes work in components.  
**If blocked**: Use plain CSS initially.

### Task 29: Layout Components
**Phase**: Frontend Foundation  
**Mode**: code  
**Depends on**: 28  
**Files to create/modify**: client/src/components/layout/*  
**Packages**: None  
**Description**: Create Navbar, Sidebar, Footer, PageContainer.  
**Completion criteria**: Layout components render correctly.  
**If blocked**: Implement only Navbar and Footer.

### Task 30: Auth Context
**Phase**: Frontend Foundation  
**Mode**: code  
**Depends on**: 16  
**Files to create/modify**: client/src/context/AuthContext.tsx  
**Packages**: None  
**Description**: Create authentication context with useAuth hook.  
**Completion criteria**: Auth state available in components.  
**If blocked**: Use prop drilling initially.

### Task 31: API Client
**Phase**: Frontend Foundation  
**Mode**: code  
**Depends on**: 7  
**Files to create/modify**: client/src/api/client.ts  
**Packages**: axios  
**Description**: Configure axios with interceptors for auth headers and error handling.  
**Completion criteria**: API calls include tokens and handle errors.  
**If blocked**: Use fetch directly.

### Task 32: Form Utilities
**Phase**: Frontend Foundation  
**Mode**: code  
**Depends on**: 28  
**Files to create/modify**: client/src/utils/forms.ts  
**Packages**: react-hook-form, @hookform/resolvers, zod  
**Description**: Create form helpers with validation using react-hook-form and Zod.  
**Completion criteria**: Forms have validation and error handling.  
**If blocked**: Use basic form validation.

### Task 33: UI Components
**Phase**: Frontend Foundation  
**Mode**: code  
**Depends on**: 28  
**Files to create/modify**: client/src/components/ui/*  
**Packages**: None  
**Description**: Build reusable Button, Input, Select, Modal, Table, Card components.  
**Completion criteria**: Components are reusable and styled.  
**If blocked**: Implement only essential components.

## Phase 6: Frontend Features

### Task 34: Auth Pages
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 29-33  
**Files to create/modify**: client/src/pages/Login.tsx, Register.tsx  
**Packages**: None  
**Description**: Create login and register pages with forms.  
**Completion criteria**: Can log in and register users.  
**If blocked**: Implement only login initially.

### Task 35: Job Listing
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 21,33  
**Files to create/modify**: client/src/pages/Jobs.tsx  
**Packages**: None  
**Description**: Build job listing page with search/filter/pagination.  
**Completion criteria**: Jobs display with filters and pagination.  
**If blocked**: Implement without pagination initially.

### Task 36: Job Detail
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 20,33  
**Files to create/modify**: client/src/pages/JobDetail.tsx  
**Packages**: None  
**Description**: Create job detail page with apply button.  
**Completion criteria**: Job details display with apply functionality.  
**If blocked**: Skip application functionality initially.

### Task 37: Employer Dashboard
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 20,23,33  
**Files to create/modify**: client/src/pages/dashboard/employer/*  
**Packages**: None  
**Description**: Build dashboard for job posting and applicant management.  
**Completion criteria**: Employers can manage jobs and view applicants.  
**If blocked**: Implement only job posting.

### Task 38: Seeker Dashboard
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 22,33  
**Files to create/modify**: client/src/pages/dashboard/seeker/*  
**Packages**: None  
**Description**: Create dashboard for saved jobs, applications, and profile.  
**Completion criteria**: Seekers can manage applications and profile.  
**If blocked**: Implement only applications view.

### Task 39: Admin Panel
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 26,33  
**Files to create/modify**: client/src/pages/admin/*  
**Packages**: None  
**Description**: Build admin panel for job moderation and user management.  
**Completion criteria**: Admins can moderate jobs and manage users.  
**If blocked**: Implement only job moderation.

### Task 40: Resume Upload
**Phase**: Frontend Features  
**Mode**: code  
**Depends on**: 24,33  
**Files to create/modify**: client/src/components/ResumeUpload.tsx  
**Packages**: None  
**Description**: Create resume upload component with preview.  
**Completion criteria**: Can upload and preview PDF resumes.  
**If blocked**: Implement without preview.

## Phase 7: Testing

### Task 41: Unit Tests
**Phase**: Testing  
**Mode**: code  
**Depends on**: 12  
**Files to create/modify**: server/tests/unit/*.test.ts  
**Packages**: jest, ts-jest  
**Description**: Write unit tests for services and utilities.  
**Completion criteria**: Core logic has test coverage.  
**If blocked**: Test only critical services.

### Task 42: Integration Tests
**Phase**: Testing  
**Mode**: code  
**Depends on**: 20-27  
**Files to create/modify**: server/tests/integration/*.test.ts  
**Packages**: supertest  
**Description**: Write API integration tests for all endpoints.  
**Completion criteria**: All endpoints have test coverage.  
**If blocked**: Test only critical endpoints.

### Task 43: Component Tests
**Phase**: Testing  
**Mode**: code  
**Depends on**: 33-40  
**Files to create/modify**: client/tests/*.test.tsx  
**Packages**: @testing-library/react  
**Description**: Write tests for React components.  
**Completion criteria**: Core components have tests.  
**If blocked**: Test only complex components.

### Task 44: E2E Tests
**Phase**: Testing  
**Mode**: code  
**Depends on**: 34-40  
**Files to create/modify**: e2e/*.spec.ts  
**Packages**: playwright  
**Description**: Create end-to-end tests for critical user flows.  
**Completion criteria**: Key flows (apply, post job) tested.  
**If blocked**: Test only most critical flow.

## Phase 8: DevOps & Deployment

### Task 45: Dockerfiles
**Phase**: DevOps & Deployment  
**Mode**: code  
**Depends on**: 4,5  
**Files to create/modify**: Dockerfile.client, Dockerfile.server  
**Packages**: None  
**Description**: Create optimized Dockerfiles for client and server.  
**Completion criteria**: Images build without errors.  
**If blocked**: Use simple Dockerfiles initially.

### Task 46: Docker Compose
**Phase**: DevOps & Deployment  
**Mode**: code  
**Depends on**: 45  
**Files to create/modify**: docker-compose.yml  
**Packages**: None  
**Description**: Configure compose file for app, postgres, redis.  
**Completion criteria**: `docker-compose up` runs all services.  
**If blocked**: Skip Redis initially.

### Task 47: CI Pipeline
**Phase**: DevOps & Deployment  
**Mode**: code  
**Depends on**: 41-44  
**Files to create/modify**: .github/workflows/ci.yml  
**Packages**: None  
**Description**: Set up GitHub Actions for linting, testing, building.  
**Completion criteria**: CI runs on push.  
**If blocked**: Run only linting and tests initially.

### Task 48: CD Pipeline
**Phase**: DevOps & Deployment  
**Mode**: code  
**Depends on**: 47  
**Files to create/modify**: .github/workflows/cd.yml  
**Packages**: None  
**Description**: Create CD pipeline stub for image building and deployment.  
**Completion criteria**: CD workflow file exists.  
**If blocked**: Manual deployment initially.

## Phase 9: Documentation & Polish

### Task 49: README
**Phase**: Documentation & Polish  
**Mode**: architect  
**Depends on**: 1-48  
**Files to create/modify**: README.md  
**Packages**: None  
**Description**: Write comprehensive README with setup instructions and architecture diagram.  
**Completion criteria**: README covers all essential information.  
**If blocked**: Write minimal setup instructions.

### Task 50: API Docs
**Phase**: Documentation & Polish  
**Mode**: architect  
**Depends on**: 20-27  
**Files to create/modify**: server/src/docs/openapi.yaml  
**Packages**: None  
**Description**: Generate OpenAPI documentation for all endpoints.  
**Completion criteria**: API docs accessible at /api-docs.  
**If blocked**: Document only core endpoints.
