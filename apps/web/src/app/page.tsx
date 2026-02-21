import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/logo'
import { ArrowRight, Shield, Terminal, Activity, Database, Zap, Lock } from 'lucide-react'

const FEATURES = [
  {
    icon: Terminal,
    title: 'Linux Infrastructure',
    description: 'Monitor and manage your Linux servers from a unified dashboard.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Admin and user roles with granular permissions.',
  },
  {
    icon: Activity,
    title: 'Real-Time Status',
    description: 'Track system health with automated scanning and status monitoring.',
  },
  {
    icon: Database,
    title: 'Activity Logging',
    description: 'Complete audit trail of all system operations.',
  },
  {
    icon: Zap,
    title: 'Fast & Lightweight',
    description: 'Built with modern stack for optimal performance.',
  },
  {
    icon: Lock,
    title: 'Secure by Default',
    description: 'JWT authentication with bcrypt password hashing.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="font-mono text-lg font-bold tracking-tight">INFRA-SCOPE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-mono text-sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="font-mono text-sm rounded-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-sm mb-8">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-mono text-primary">v1.0 — Infrastructure Discovery Management</span>
          </div>

          <h1 className="text-5xl font-mono font-bold tracking-tight mb-6">
            Know Your<br />
            <span className="text-primary">Infrastructure</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 font-mono">
            Centralized monitoring and management for Linux infrastructure.
            Track systems, automate scans, and maintain complete visibility.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="font-mono text-sm rounded-sm">
                Start Monitoring
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="font-mono text-sm rounded-sm">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card key={i} className="p-6 border-border/60 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-primary/30 group-hover:border-primary/60 transition-colors" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-primary/30 group-hover:border-primary/60 transition-colors" />

                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>

        <div className="mt-24 p-8 border border-border/40 rounded-sm">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-mono font-bold text-foreground mb-1">Zero</p>
              <p className="text-xs text-muted-foreground font-mono">Config Required</p>
            </div>
            <div>
              <p className="text-3xl font-mono font-bold text-foreground mb-1">100%</p>
              <p className="text-xs text-muted-foreground font-mono">Self-Hosted</p>
            </div>
            <div>
              <p className="text-3xl font-mono font-bold text-foreground mb-1">JWT</p>
              <p className="text-xs text-muted-foreground font-mono">Auth Security</p>
            </div>
            <div>
              <p className="text-3xl font-mono font-bold text-foreground mb-1">PostgreSQL</p>
              <p className="text-xs text-muted-foreground font-mono">Database</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size="sm" className="border-primary/60" />
              <span className="text-xs font-mono text-muted-foreground">INFRA-SCOPE</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Built with Next.js 15 + Express + Prisma
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
