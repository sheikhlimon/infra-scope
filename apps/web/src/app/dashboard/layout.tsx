'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Server, Activity, LogOut, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Cpu },
  { href: '/dashboard/systems', label: 'Systems', icon: Server },
  { href: '/dashboard/activity', label: 'Activity', icon: Activity },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border/40 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-wider text-foreground">
                INFRA<span className="text-primary">SCOPE</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="p-4 border-b border-border/40 bg-muted/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">
            System Status
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-background rounded border border-border/60 p-2 text-center">
              <div className="text-xs font-mono font-bold text-amber-500">3</div>
              <div className="text-[9px] text-muted-foreground uppercase">Scanning</div>
            </div>
            <div className="bg-background rounded border border-border/60 p-2 text-center">
              <div className="text-xs font-mono font-bold text-emerald-500">12</div>
              <div className="text-[9px] text-muted-foreground uppercase">Active</div>
            </div>
            <div className="bg-background rounded border border-border/60 p-2 text-center">
              <div className="text-xs font-mono font-bold text-rose-500">1</div>
              <div className="text-[9px] text-muted-foreground uppercase">Error</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors",
                  "font-mono tracking-wide",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="text-xs">
              <div className="font-mono text-foreground">{user?.email}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors font-mono"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
