# InfraScope

> Full-stack infrastructure catalog, live reachability prober, and real-time event dashboard built with Next.js 16, Express, Prisma, and PostgreSQL in a Turborepo monorepo.

## What Is InfraScope?

**InfraScope** is a visual infrastructure catalog and management platform designed to turn complex Infrastructure-as-Code repositories into an interactive web interface.

Instead of grepping raw YAML files in a terminal, InfraScope ingests and visualizes **41 real public edge servers from the Fedora Linux Project's Ansible repository** (global reverse proxies, authoritative nameservers, distribution mirrors, and cloud nodes), runs credential-free reachability probes with live latency measurement, and streams real-time package builds and updates directly from the Fedora Messaging bus (via Datagrepper).

## Key Features

* **Fedora Public Edge Fleet**: Ingests and maps 41 real enterprise edge servers across global AWS regions and partner datacenters (Europe, North America, Asia), including reverse proxies (`proxy02`–`proxy40`), DNS nameservers (`ns02`, `ns05`), BitTorrent trackers, and mirrors.
* **100% Live Reachability & Latency**: Every monitored node is publicly routable and verifiable via ICMP echo or TCP port 443 handshakes with live round-trip latency tracking.
* **Automated Spec Extraction**: Extracts real hardware capacities and operating system distributions (Red Hat Enterprise Linux, Fedora Server, CentOS Stream) directly from Ansible `host_vars`.
* **Fedora Live Pulse (Datagrepper Stream)**: Connects to the public Fedora Messaging archive to stream live Koji RPM builds, Bodhi releases, and infrastructure tasks with sub-second timestamps and direct task links.
* **Zero-Bloat Separation of Concerns**: Separates local immutable audit logs (stored in PostgreSQL) from high-volume external message streams (queried statelessly on demand).
* **Real-Time Reactive Streaming (SSE)**: Uses Server-Sent Events to push scan results, status changes, and inventory updates to connected browser sessions instantly. Features an **auto-stream toggle** in the UI to pause or resume live incoming events seamlessly.
* **Automated Weekly Cloud Sync**: GitHub Actions workflow automatically checks Fedora Forge once a week (or on demand) to sync any new or updated edge servers directly into Neon PostgreSQL.
* **Zero-Configuration Setup**: The local inventory CLI tool will automatically fetch, clone, and parse the upstream Ansible repository for you on first run.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           Next.js 16 Frontend                           │
│              (React 19, Tailwind CSS, shadcn/ui on Vercel)              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                        HTTPS REST & SSE (/api/*)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                           Express 4 API Server                          │
│                     (TypeScript, Zod on Render)                         │
└───────────┬────────────────────────┬─────────────────────────┬──────────┘
            │                        │                         │
     SQL Queries (Prisma)     HTTPS Fetch (Port 443)     ICMP / TCP Probes
            │                        │                         │
┌───────────▼───────────┐ ┌──────────▼───────────┐ ┌───────────▼──────────┐
│   Neon PostgreSQL     │ │  Fedora Datagrepper  │ │   Fedora Fleet Hosts │
│  (Users, Fleet, Logs) │ │ (Live Koji / Bodhi)  │ │ (bastion, proxy, ns) │
└───────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19 | Fast server-side rendering and client components |
| **Styling** | Tailwind CSS, shadcn/ui, Lucide Icons | Accessible, high-contrast terminal-inspired UI |
| **Backend** | Express 4, TypeScript | Strict `service → controller → route` layered API |
| **Database** | PostgreSQL (Neon Serverless), Prisma ORM | Relational modeling with migrations and connection pooling |
| **Data Source** | Fedora Project Ansible Repository | 41 public edge hosts, group hierarchies, and hardware specs |
| **Live Stream** | Fedora Messaging (Datagrepper REST API) | Real-time Koji builds, Bodhi updates, and git events |
| **Monorepo** | Turborepo, npm workspaces | Coordinated builds, shared ESLint/TS configs |
| **Runtime** | Node.js 24 | Managed via `.nvmrc` with strict engine enforcement |

## Project Structure

```text
infra-scope/
├── apps/
│   ├── web/                    # Next.js 16 App Router frontend
│   │   ├── src/app/            # App router pages (dashboard, systems, activity)
│   │   ├── src/components/     # shadcn/ui components + layouts
│   │   └── src/contexts/       # Auth & SSE event streaming contexts
│   └── server/                 # Express REST API backend
│       └── src/
│           ├── controllers/    # Express request controllers
│           ├── services/       # Reachability probes, Datagrepper client
│           ├── routes/         # Authenticated route declarations
│           └── schemas/        # Zod request validation schemas
├── packages/
│   ├── db/                     # Prisma schema, migrations, and CLI sync scripts
│   └── config/                 # Shared base ESLint flat configs and tsconfigs
└── turbo.json                  # Turborepo task pipeline (Strict Env Configured)
```

## Getting Started

### Prerequisites
* **Node.js 24** (recommended: `nvm use` or `fnm use`)
* A **PostgreSQL** database (e.g., Neon Serverless)

### 1. Clone & Install
```bash
git clone https://github.com/sheikhlimon/infra-scope.git
cd infra-scope
npm install
```

### 2. Environment Variables

Create `.env` in `apps/server/`:
```env
DATABASE_URL="postgresql://user:password@ep-your-neon-host.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-secure-random-jwt-secret"
PORT=3001
NODE_ENV=development
```

Create `.env` in `apps/web/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Database Setup & Sync
```bash
# Push Prisma schema to Neon PostgreSQL
npm run db:push

# (Optional) Generate the Prisma Client locally if needed
npm run db:generate

# Seed admin user (admin@infrascope.dev / admin123)
npm run db:seed

# Ingest Fedora Ansible inventory
# Note: If no local ./inventory folder is found, this script will automatically 
# download and clone the Fedora Ansible repository to /tmp for you.
npm run db:sync-ansible
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser and sign in with `admin@infrascope.dev` / `admin123`.

## Quality & Releases

Every package is strictly checked with zero TypeScript or ESLint warnings:

```bash
npm run check             # runs lint + typecheck across all 4 monorepo packages
npm run build             # builds all packages in dependency order via Turborepo
npm run release           # automated version bump, changelog update, and tag
npm run release:dry-run   # simulate version bump without modifying git
```

## Cloud Deployment Constraints

This repository adheres to strict zero-credit-card serverless boundaries and architectural constraints:

* **Frontend (Vercel)**: Point Vercel to `apps/web`. Set `NEXT_PUBLIC_API_URL` to your production Render API URL.
* **Backend (Render)**: Deploy `apps/server` as a Node Web Service. Configure `DATABASE_URL` and `JWT_SECRET`.
  * *Note*: The backend **must** stay on Render. Vercel serverless forcefully terminates persistent Server-Sent Events (SSE) after 15 seconds. Render's free tier sleeps after 15m idle; the frontend gracefully handles the 50s warmup.
* **Database (Neon)**: Serverless PostgreSQL connects automatically over SSL.
* **CI Inventory Sync (GitHub Actions)**: The automated inventory sync utilizes Turborepo. In CI environments, you must provide `ANSIBLE_INVENTORY_PATH` to the `db:sync-ansible` task to override the default local auto-cloning behavior.

## License

MIT © [Sheikh Limon](https://github.com/sheikhlimon)
