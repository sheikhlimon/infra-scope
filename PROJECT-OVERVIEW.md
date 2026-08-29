# InfraScope — Project Overview

## What Is This?

InfraScope is a **full-stack infrastructure monitoring and management dashboard** built entirely from scratch. It's a web-based platform where system administrators can view server status, manage infrastructure records, and maintain an audit log — all from a single interface.

**Problem it solves:** Instead of SSHing into multiple servers individually, admins can track everything from one centralized dashboard.

---

## Architecture Overview

```
┌─────────────┐     HTTP/REST     ┌───────────────┐     Prisma      ┌──────────────┐
│             │ ────────────────► │               │ ──────────────► │              │
│  Next.js 15 │                   │  Express.js   │                 │  PostgreSQL  │
│  Frontend   │ ◄──────────────── │   Backend     │ ◄────────────── │   (Neon)     │
│             │    JSON Response  │               │     Queries     │              │
└─────────────┘                   └───────────────┘                 └──────────────┘
```

---

## What I Built — Layer by Layer

### Database Design
- Designed a **Prisma schema** with relational models for Users, Systems, and Activity Logs
- Set up proper foreign key relationships, enums, and constraints
- Hosted on **Neon PostgreSQL** for cloud-native deployment

### Backend API — Express.js + TypeScript
- Built a **RESTful API** with full CRUD for infrastructure records
- Implemented **JWT authentication** from scratch — registration, login, token-based route protection
- Created **role-based access control** — Admins see all systems, regular users see only their own
- Added **activity logging middleware** that automatically tracks every create, update, and delete for audit trails
- Built **search and filtering** — query systems by hostname, status, or OS
- Wrote **input validation** and centralized error handling throughout

### Frontend — Next.js 15 + Tailwind CSS + shadcn/ui
- Built the **entire UI** using Next.js 15 App Router (server components, client components, layouts)
- Implemented **authentication flow** — login and registration with form validation
- Created a **dashboard** with live stats, recent systems, and an activity timeline
- Built **system management pages** — list view with search/filter, create, edit, and delete flows
- Designed a **custom 404 page** and made everything **responsive** for mobile and desktop
- Used **shadcn/ui** component library with Tailwind for a polished, consistent design system

### Monorepo Setup — Turborepo
- Structured the project as a **monorepo** with workspaces for frontend, backend, database, and shared config
- Configured **Turborepo pipelines** so one command starts both apps, and builds are cached and optimized
- Set up **Husky + lint-staged** pre-commit hooks to enforce code quality automatically

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | JWT + bcrypt |
| Monorepo | Turborepo, npm workspaces |
| Code Quality | ESLint, Prettier, Husky, lint-staged |

---

## Key Features

- ✅ User registration and JWT-based login
- ✅ Role-based access control (Admin vs User)
- ✅ Full system CRUD — create, view, edit, delete infrastructure records
- ✅ Dashboard with stats, recent systems, and activity timeline
- ✅ Search and filter by hostname, status, OS
- ✅ Complete activity audit log tracking all user actions
- ✅ Responsive, mobile-friendly design
- ✅ Production-ready monorepo with linting, formatting, and pre-commit hooks

---

## What I Learned

- **Next.js 15 App Router** — server components, client components, routing patterns
- **Prisma in a monorepo** — managing database schema as a shared package
- **JWT from scratch** — token creation, verification, route protection
- **Role-based authorization** — scoping data access by user role
- **Monorepo tooling** — Turborepo pipelines, caching, workspace dependencies
- **Component-driven UI** — building with shadcn/ui and Tailwind design system

---

## What I'd Improve Next

- JWT refresh token rotation (current tokens expire after 7 days)
- Real SSH connections for actual system monitoring (currently simulated)
- WebSocket for live status updates
- Admin promotion UI (currently requires manual DB update)
- Alert notifications (email, webhook)
- Data export (CSV, JSON)
- Charts and analytics dashboards

---

## License

MIT — see [LICENSE](LICENSE)
