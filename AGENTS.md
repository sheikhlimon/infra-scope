# Infra-Scope

Infrastructure monitoring dashboard — track systems, view activity, manage scans. Express API + Next.js frontend in a Turbo monorepo.

## 1. Tech Stack & Cloud Deployment

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui → **Deployed on Vercel**
- **Backend**: Express 4, Prisma ORM, JWT auth, Zod validation → **Deployed on Render**
- **Database**: PostgreSQL on **Neon Serverless**
- **Runtime**: Node 24 (`engine-strict` via `.nvmrc`)
- **Monorepo**: Turborepo, npm workspaces, ESLint flat config, Prettier, Husky
- **Releases**: `commit-and-tag-version` for SemVer changelogs and git tags

## 2. Working Rules & Definition of Done

- **Explain First**: ALWAYS explain WHAT you plan to do and WHY before running commands or modifying files.
- **Cloud-First Requirement**: Every feature MUST work in production on **Vercel** and **Render**. Never write code that only works on the developer's local laptop.
- **Cardless Stack Principle**: Stick to platforms with zero credit card requirements (Vercel, Render, Neon via GitHub OAuth). Do NOT suggest services requiring international cards (Fly.io, Oracle Cloud, AWS).
- **Lean Conventional Commits**: Every commit MUST follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) with short, lean, imperative messages. No verbose essay commit titles.
- **Definition of Done**: `npm run check` (lint + typecheck across all packages) must pass with 0 errors. One logical commit per unit of work.

## 3. Strict Constraints (No Vibe-Coding)

- **Do NOT Move Express to Vercel**: Keep Express on Render. Vercel serverless forcefully terminates persistent Server-Sent Events (SSE) after 15 seconds, and Prisma query engine binaries fail to resolve in monorepo serverless bundles.
- **Render Cold Starts**: Render's free container sleeps after 15m idle. The 50s warmup is expected and handled via `useServerWarmup`. Do NOT use synthetic pingers (e.g. UptimeRobot) which exhaust the 750 free monthly instance hours.
- **Logo & Navigation Standards**:
  - In dashboard pages (`/dashboard/*`), the brand logo MUST link to `/dashboard` (SaaS standard workspace reset).
  - In marketing/auth pages (`/`, `/login`, `/register`), the brand logo links to `/`.
  - `LandingNav` on `/` is auth-aware (displays `Dashboard →` button when user is logged in).
- **Session Persistence**: `auth-context.tsx` caches `user` in `localStorage` alongside `token` for instant 0ms hydration. Never delete `token` on transient network errors (only on explicit 401 Unauthorized).
- **Universal Web Protocols**: Use standard HTTPS (Port 443) APIs. Do not introduce raw TCP socket dependencies that fail on serverless.
- **Layering**: Server strictly follows `service → controller → route`. All input validation uses Zod schemas.
- **UI Components**: Use shadcn/ui components, never raw HTML elements. Tailwind spacing scale only.

## 4. The Anti-Pattern Graveyard

- ❌ Attempting to run the Express backend on Vercel Serverless (kills SSE streams & breaks Prisma binary).
- ❌ Suggesting platforms requiring international credit cards (Fly.io, Oracle, AWS).
- ❌ Pinging Render with UptimeRobot / cron bots (burns 744/750 monthly instance hours).
- ❌ Hardcoding developer local paths (`/home/limon/...`) in backend code.
- ❌ Cutting a git release tag for every minor commit (use `npm run release` only for feature milestones).
- ❌ Setting daily/24h cron jobs for static edge fleets (weekly Sunday sync `0 2 * * 0` only).
- ❌ Changing dashboard logo destination to `/` instead of `/dashboard`.
- ❌ Wiping user auth token on network or server-warmup errors.

## 5. Key Commands

```bash
npm install              # install all workspace deps
npm run dev              # start all services (turbo dev)
npm run build            # build all packages
npm run check            # lint + typecheck all packages
npm run release          # bump version, update CHANGELOG.md, and tag
npm run release:dry-run  # simulate release without git changes
npm run db:push          # push prisma schema to Neon DB
npm run db:seed          # seed admin user
npm run db:sync-ansible  # sync Fedora edge inventory (CLI)
```
