# Infra-Scope

Infrastructure monitoring dashboard — track systems, view activity, manage scans. Express API + Next.js frontend in a Turbo monorepo.

## Tech Stack

- **Runtime**: Node 24 (`engine-strict` via `.nvmrc`)
- **Backend**: Express 4, Prisma ORM (Neon/Postgres), JWT auth, Zod validation
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Monorepo**: Turborepo, npm workspaces
- **Quality**: ESLint flat config, Prettier, Husky pre-commit (lint + typecheck)

## Build Commands

```
npm install              # install all workspace deps
npm run dev              # start all services (turbo dev)
npm run build            # build all packages
npm run check            # lint + typecheck all packages
npm run db:push          # push prisma schema to DB
npm run db:seed          # seed admin user
```

## Architecture

```
apps/server     → Express API (src/{controllers,services,routes,middleware,schemas,utils})
apps/web        → Next.js App Router (app/{(auth),dashboard}/)
packages/db     → Prisma schema + generated client (shared via workspace)
packages/config → Shared eslint config + tsconfig base
```

- Server runs on PORT, frontend calls `/api/*` (proxied in dev, CORS in prod)
- Auth: JWT in Authorization header, role-based access (admin/user)
- DB package must build before server (`turbo build` handles this via `^build`)

## Conventions

- One file per concept — don't mix concerns
- `apps/web/app/` uses Next.js App Router conventions (layout.tsx, page.tsx, loading.tsx)
- Server follows service → controller → route layering
- All validation uses Zod schemas
- Use shadcn/ui components, not raw HTML elements
- Tailwind spacing scale only (no arbitrary values like `p-[13px]`)
- Comment WHY, not WHAT. No JSDoc unless public API
