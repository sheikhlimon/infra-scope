# Infra-Scope: Discovery Management API

## Project Overview
A backend API for managing Linux infrastructure records. No SSH/real servers - just clean CRUD + simulated scan + activity logging.

---

## Tech Stack

### Backend
- **Express.js** - API server
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Database (Neon free tier)
- **JWT + bcrypt** - Authentication
- **Zod** - Runtime validation

### Frontend
- **Next.js 15** - App Router (latest)
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components
- **Modern, non-AI-like design**

### Dev
- **Turborepo** - Monorepo
- **Husky** - Git hooks
- **ESLint + Prettier** - Code quality

---

## Prisma Schema

```prisma
model User {
  id        Int          @id @default(autoincrement())
  email     String       @unique
  password  String
  role      Role         @default(USER)
  systems   System[]
  logs      ActivityLog[]
  createdAt DateTime     @default(now())
}

model System {
  id                   Int          @id @default(autoincrement())
  hostname             String
  ipAddress            String
  os                   String
  cpuCores             Int?
  memoryGB             Int?
  status               SystemStatus @default(INACTIVE)
  connectionType       String       @default("manual")
  credentialsConfigured Boolean     @default(false)
  ownerId              Int
  owner                User         @relation(fields: [ownerId], references: [id])
  lastScannedAt        DateTime?
  logs                 ActivityLog[]
  createdAt            DateTime     @default(now())
}

model ActivityLog {
  id        Int      @id @default(autoincrement())
  action    String
  userId    Int
  systemId  Int?
  user      User     @relation(fields: [userId], references: [id])
  system    System?  @relation(fields: [systemId], references: [id])
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  USER
}

enum SystemStatus {
  ACTIVE
  INACTIVE
  SCANNING
  ERROR
}
```

---

## API Endpoints (TEST THESE!)

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Systems
```
GET    /api/systems          - List (filtered by owner, admin sees all)
POST   /api/systems          - Create
GET    /api/systems/:id      - Get one
PUT    /api/systems/:id      - Update
DELETE /api/systems/:id      - Delete
POST   /api/systems/:id/scan - Trigger scan simulation
```

### Activity
```
GET /api/activity - List logs (admin sees all, user sees own)
```

---

## Folder Structure

```
infra-scope/
├── apps/
│   ├── server/          # Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── schemas/      # Zod validation
│   │   │   ├── utils/        # jwt, password
│   │   │   └── app.ts
│   │   └── package.json
│   └── web/             # Next.js frontend
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   └── register/
│       │   └── dashboard/
│       │       ├── page.tsx
│       │       ├── systems/
│       │       └── activity/
│       ├── components/
│       │   ├── ui/           # shadcn
│       │   └── custom/       # your components
│       └── lib/
│           └── utils.ts      # cn() helper
├── packages/
│   ├── db/              # Prisma client
│   └── config/          # ESLint, TSConfig
├── docs/
│   └── plan.md
├── .claude/
│   ├── rules.md
│   └── progress.md
├── turbo.json
├── package.json
└── .gitignore
```

---

## Frontend Design Rules

### Colors (CSS Variables)
```css
--primary: 222 47% 11%;       /* Dark slate */
--primary-foreground: 210 40% 98%;
--muted: 210 40% 96%;
--muted-foreground: 215 16% 47%;
--destructive: 0 84% 60%;     /* Red */
--success: 142 76% 36%;       /* Green */
--warning: 38 92% 50%;        /* Yellow */
```

### Spacing Scale (Use these only)
```
4, 6, 8, 12, 16, 24, 32
```

### Typography
```
text-xs (12px), text-sm (14px), text-base (16px),
text-lg (18px), text-xl (20px), text-2xl (24px), text-3xl (30px)
```

### Design Principles
- **Modern, not generic/AI-like** - Avoid bootstrappy, template-y looks
- **Unique personality** - Custom details, micro-interactions
- **Subtle animations** - Transitions, hover states, loading skeletons
- **Good whitespace** - Don't crowd elements
- **Clear visual hierarchy** - Size, color, position guide the eye
- **No arbitrary values** - use the scale
- **No inline styles** - Tailwind classes only

### Anti-Patterns (AVOID THESE - They Look AI-Generated):
❌ Generic blue/indigo primary colors with no personality
❌ Perfectly centered hero sections with "Get Started" buttons
❌ Same border radius on everything (mix it up: none, sm, md, lg, full)
❌ Default shadows everywhere - use sparingly
❌ Card layouts with identical padding and borders
❌ Template navigation bars (logo left, links right, CTA button)
❌ Bland "Welcome to..." headings
❌ Gradient backgrounds on everything
❌ Rounded corners on every element

### DO Instead:
✅ Asymmetric layouts - break the grid intentionally
✅ Mix border radii - sharp edges on some, rounded on others
✅ Dark mode default or unique color scheme
✅ Micro-interactions - subtle hover states, transitions
✅ Empty states with personality
✅ Skeleton loading states (not spinners)
✅ Data density - show information efficiently
✅ Sidebars, tabs, bento grids - not just stacked cards

---

## Implementation Order

### Phase 1: Setup
- [x] Root package.json + turbo.json
- [x] .gitignore
- [x] .prettierrc
- [x] packages/config (eslint, tsconfig)
- [ ] packages/db (Prisma schema, client)
- [ ] apps/server structure + package.json
- [ ] apps/web structure + package.json
- [ ] Git init + initial commit

### Phase 2: Backend - Auth
- [ ] packages/db/src/prisma.ts - Prisma client
- [ ] apps/server/src/utils/password.ts - bcrypt
- [ ] apps/server/src/utils/jwt.ts - JWT sign/verify
- [ ] apps/server/src/schemas/auth.schema.ts - Zod
- [ ] apps/server/src/services/auth.service.ts
- [ ] apps/server/src/middleware/auth.middleware.ts
- [ ] apps/server/src/controllers/auth.controller.ts
- [ ] apps/server/src/routes/auth.routes.ts
- [ ] apps/server/src/app.ts - Express setup

### Phase 3: Backend - Systems
- [ ] apps/server/src/schemas/system.schema.ts
- [ ] apps/server/src/services/system.service.ts
- [ ] apps/server/src/middleware/role.middleware.ts
- [ ] apps/server/src/controllers/system.controller.ts
- [ ] apps/server/src/routes/system.routes.ts

### Phase 4: Backend - Activity
- [ ] apps/server/src/services/activity.service.ts
- [ ] Integrate logging into auth/system services

### Phase 5: Frontend - Setup
- [ ] apps/web Tailwind + shadcn/ui setup
- [ ] lib/utils.ts (cn helper)
- [ ] API fetch wrapper
- [ ] Auth context
- [ ] Protected route wrapper

### Phase 6: Frontend - Auth Pages
- [ ] app/(auth)/login/page.tsx
- [ ] app/(auth)/register/page.tsx

### Phase 7: Frontend - Dashboard
- [ ] app/dashboard/layout.tsx (with nav)
- [ ] app/dashboard/page.tsx
- [ ] app/dashboard/systems/page.tsx
- [ ] app/dashboard/systems/new/page.tsx
- [ ] app/dashboard/systems/[id]/page.tsx
- [ ] app/dashboard/activity/page.tsx

### Phase 8: Polish
- [ ] Loading states
- [ ] Error handling + toasts
- [ ] Responsive design

---

## Git Workflow

1. After folder structure complete → `git init` + initial commit
2. After each feature → commit (one liner, no grammar worry)
3. Before commit → lint + typecheck must pass

### Commit format
```
feat: add auth service
feat: add system crud
fix: correct jwt middleware
```
