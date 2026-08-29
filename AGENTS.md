# Infra-Scope

Infrastructure monitoring dashboard — track systems, view activity, manage scans. Express API + Next.js frontend in a Turbo monorepo.

## 1. Tech Stack & Cloud Deployment

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui → **Deployed on Vercel**
- **Backend**: Express 4, Prisma ORM, JWT auth, Zod validation → **Deployed on Render**
- **Database**: PostgreSQL on **Neon Serverless**
- **Runtime**: Node 24 (`engine-strict` via `.nvmrc`)
- **Monorepo**: Turborepo, npm workspaces, ESLint flat config, Prettier, Husky

## 2. Working Rules & Definition of Done

- **Explain First**: ALWAYS explain WHAT you plan to do and WHY before running commands or modifying files.
- **Cloud-First Requirement**: Every feature MUST work in production on **Vercel** and **Render**. Never write code that only works on the developer's local laptop.
- **Definition of Done**: `npm run check` (lint + typecheck across all packages) must pass with 0 errors. One logical commit per unit of work.

## 3. Strict Constraints (No Vibe-Coding)

- **No Hardcoded Local Paths**: NEVER hardcode `/home/limon/...` or local filesystem paths into runtime services. If local files are used for one-off CLI scripts, require an environment variable with a graceful fallback.
- **Universal Web Protocols**: Use standard HTTPS (Port 443) APIs that work universally in Vercel serverless and Render containers. Do not introduce raw TCP socket dependencies (like non-HTTP AMQP) that fail on serverless.
- **Layering**: Server strictly follows `service → controller → route`. All input validation uses Zod schemas.
- **UI Components**: Use shadcn/ui components, never raw HTML elements. Tailwind spacing scale only (no arbitrary values like `p-[13px]`).
- **Comments**: Comment WHY, not WHAT. No JSDoc unless public API.

## 4. The Anti-Pattern Graveyard

- ❌ Hardcoding developer local paths (`/home/limon/...`) in backend code.
- ❌ Proposing local-only solutions that break when pushed to Vercel/Render.
- ❌ Running commands or editing code without explaining beforehand.
- ❌ Mixing local database audit trails with noisy external message streams.
- ❌ Guessing API contracts or schemas without viewing the source files first.

## 5. Build Commands

```
npm install              # install all workspace deps
npm run dev              # start all services (turbo dev)
npm run build            # build all packages
npm run check            # lint + typecheck all packages
npm run db:push          # push prisma schema to DB
npm run db:seed          # seed admin user
```
