# Infra-Scope

Infrastructure monitoring and management dashboard for Linux systems.

## Project Idea

A web-based platform to track and manage Linux infrastructure records. Instead of SSHing into servers individually, administrators can view system status, trigger simulated scans, and maintain an audit log—all from one dashboard.

**Note:** This is a learning project with simulated scanning. No real SSH connections are made.

## Implemented Features

- **Authentication**: User registration, JWT-based login
- **Role-Based Access**: Admin (sees all systems) vs User (sees own systems)
- **System CRUD**: Create, read, update, delete infrastructure records
- **Dashboard**: Real-time stats, recent systems, activity timeline
- **Status Management**: Active, Inactive, Scanning, Error states
- **Activity Logging**: Complete audit trail of all actions
- **Search & Filter**: Find systems by hostname, status, OS
- **Responsive Design**: Mobile-friendly with card/table views

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, Tailwind CSS, shadcn/ui |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Auth** | JWT + bcrypt |
| **Monorepo** | Turborepo |
| **Quality** | ESLint, Prettier, Husky |

## Getting Started

### Prerequisites
- Node.js 18+
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
npx prisma db push

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

## Challenges & Future Improvements

**Challenges:**
- Learning Next.js 15 App Router (new patterns)
- Prisma in monorepo setup
- JWT refresh tokens not implemented (tokens expire after 7 days)
- Admin promotion requires manual DB update

**Future Improvements:**
- Real SSH connections for actual system monitoring
- WebSocket for live status updates
- JWT refresh token rotation
- Admin promotion UI
- System groups/labels
- Alert notifications (email, webhook)
- Dark mode toggle
- Export data (CSV, JSON)
- More detailed charts/analytics
- Rate limiting on API
