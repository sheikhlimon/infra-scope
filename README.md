# InfraScope

Full-stack infrastructure monitoring and management dashboard built from scratch.

## What Is This?

InfraScope is a web-based platform where system administrators can view server status, manage infrastructure records, and maintain an audit log — all from a single interface. Instead of SSHing into multiple servers individually, admins can track everything from one centralized dashboard.

**Note:** Scanning is simulated. No real SSH connections are made.


## Architecture

```
┌─────────────┐     HTTP/REST     ┌───────────────┐     Prisma      ┌──────────────┐
│             │ ────────────────► │               │ ──────────────► │              │
│  Next.js 16 │                   │  Express.js   │                 │  PostgreSQL  │
│  Frontend   │ ◄──────────────── │   Backend     │ ◄────────────── │   (Neon)     │
│             │    JSON Response  │               │     Queries     │              │
└─────────────┘                   └───────────────┘                 └──────────────┘
                                         │
                                    SSE Push ──► Real-time updates to all connected clients
```


## Key Features

- **Authentication** — User registration and JWT-based login
- **Role-Based Access** — Admin sees all systems, User sees only their own
- **System CRUD** — Create, view, edit, delete infrastructure records
- **Real-Time Updates** — Server-Sent Events push scan results and status changes to the dashboard instantly
- **Dashboard** — Live stats, recent systems, status distribution, activity timeline
- **Activity Logging** — Complete audit trail tracking all user actions
- **Search & Filter** — Find systems by hostname, status, OS
- **Responsive Design** — Mobile-friendly with card/table views


## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | JWT + bcrypt |
| Real-Time | Server-Sent Events (SSE) |
| Monorepo | Turborepo, npm workspaces |
| Quality | ESLint, Prettier, Husky, lint-staged |


## Project Structure

```
infra-scope/
├── apps/
│   ├── web/              # Next.js 16 frontend
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components + shadcn/ui
│   │   ├── contexts/     # Auth + SSE contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # API client, utilities
│   └── server/           # Express.js backend
│       ├── src/
│       │   ├── controllers/   # Request handlers
│       │   ├── services/      # Business logic + event emitter
│       │   ├── routes/        # API + SSE routes
│       │   ├── middleware/    # Auth, role, SSE auth
│       │   └── schemas/      # Zod validation
│       └── .env
├── packages/
│   ├── config/           # Shared ESLint + tsconfig
│   └── db/               # Prisma schema + generated client
└── turbo.json            # Turborepo pipeline config
```


## Getting Started

### Prerequisites
- Node.js 24 (`engine-strict` via `.nvmrc`)
- PostgreSQL database (Neon recommended)

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth (generate with: openssl rand -base64 32)
JWT_SECRET="your-random-secret-key"

# Server
PORT=3001
NODE_ENV=development
```

### Setup

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development
npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:3001


## Deployment

| Service | Purpose |
|---------|---------|
| **Neon** | PostgreSQL database |
| **Render** | Backend API |
| **Vercel** | Frontend app |


## What I Learned

- **Next.js 16 App Router** — server components, client components, routing patterns
- **Prisma in a monorepo** — managing database schema as a shared package
- **JWT from scratch** — token creation, verification, route protection
- **Role-based authorization** — scoping data access by user role
- **Server-Sent Events** — real-time server push without WebSockets
- **Monorepo tooling** — Turborepo pipelines, caching, workspace dependencies
- **Component-driven UI** — building with shadcn/ui and Tailwind design system


## What I'd Improve Next

- Real SSH connections for actual system monitoring
- JWT refresh token rotation
- Admin promotion UI
- Alert notifications (email, webhook)
- Data export (CSV, JSON)
- Charts and analytics dashboards


## License

MIT — see [LICENSE](LICENSE)
