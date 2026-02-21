'use client'

import { ProtectedRoute } from '@/components/protected-route'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Activity, Server, AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface StatusStats {
  status: string
  _count: { status: number }
}

interface OSStats {
  os: string
  _count: { os: number }
}

interface ActivityItem {
  id: number
  action: string
  createdAt: string
  user: { email: string }
  system?: { hostname: string }
}

interface System {
  id: number
  hostname: string
  ipAddress: string
  os: string
  status: string
  lastScannedAt: string | null
}

interface PaginatedSystems {
  systems: System[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface StatsData {
  total: number
  byStatus: StatusStats[]
  byOS: OSStats[]
  recent: ActivityItem[]
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Healthy', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' },
  INACTIVE: { label: 'Inactive', color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted-foreground/50' },
  SCANNING: { label: 'Scanning', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/50' },
  ERROR: { label: 'Error', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/50' },
} as const

function getStatusCount(stats: StatusStats[], status: string) {
  return stats.find(s => s.status === status)?._count.status ?? 0
}

function DashboardContent() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, systemsData] = await Promise.all([
          api.get<StatsData>('/systems/stats'),
          api.get<PaginatedSystems>('/systems'),
        ])
        setStats(statsData)
        setSystems(systemsData.systems.slice(0, 5))
      } catch {
        toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) return null

  const activeCount = getStatusCount(stats.byStatus, 'ACTIVE')
  const scanningCount = getStatusCount(stats.byStatus, 'SCANNING')
  const errorCount = getStatusCount(stats.byStatus, 'ERROR')

  const healthyPercentage = stats.total > 0 ? Math.round((activeCount / stats.total) * 100) : 0

  const statCards = [
    { label: 'Total Systems', value: stats.total, icon: Server, color: 'text-foreground' },
    { label: 'Healthy', value: activeCount, change: `${healthyPercentage}%`, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Scanning', value: scanningCount, change: scanningCount > 0 ? 'Active' : 'Idle', icon: Activity, color: 'text-amber-500' },
    { label: 'Errors', value: errorCount, change: errorCount > 0 ? 'Fix now' : 'Clear', icon: AlertTriangle, color: 'text-rose-500' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground">
            System Overview
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Real-time infrastructure monitoring
          </p>
        </div>
        <Link href="/dashboard/systems/new">
          <Button className="font-mono text-sm rounded-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add System
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-6 border-border/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40" />

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-mono font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
              Recent Systems
            </h2>
            <Link href="/dashboard/systems">
              <Badge variant="outline" className="font-mono text-xs cursor-pointer hover:bg-muted/50">
                View All
              </Badge>
            </Link>
          </div>

          <div className="space-y-3">
            {systems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground font-mono">No systems yet</p>
                <Link href="/dashboard/systems/new">
                  <Button className="mt-4 font-mono text-sm rounded-sm">Add First System</Button>
                </Link>
              </div>
            ) : (
              systems.map((system) => {
                const config = STATUS_CONFIG[system.status as keyof typeof STATUS_CONFIG]
                return (
                  <Link key={system.id} href={`/dashboard/systems/${system.id}`}>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-sm border border-border/40 hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-foreground">
                            {system.hostname}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-mono px-1.5 py-0 rounded-sm", config.border, config.color)}
                          >
                            {system.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {system.ipAddress} • {system.os}
                        </p>
                      </div>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-6">
            Status Distribution
          </h2>

          <div className="space-y-4">
            {stats.byStatus.map(({ status, _count }) => {
              const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
              const percentage = stats.total > 0 ? (_count.status / stats.total) * 100 : 0

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2", config.bg, config.border, "border")} />
                      <span className="text-xs font-mono text-foreground">{config.label}</span>
                      <span className="text-xs text-muted-foreground">{_count.status}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-sm overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500", config.bg)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
            Recent Activity
          </h2>
          <Link href="/dashboard/activity">
            <Badge variant="outline" className="font-mono text-xs cursor-pointer hover:bg-muted/50">
              View All
            </Badge>
          </Link>
        </div>

        <div className="space-y-4">
          {stats.recent.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-primary/60" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {item.system?.hostname || 'System'}: {item.action}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-muted-foreground">
                    {item.user.email}
                  </p>
                  <span className="text-muted-foreground/30">•</span>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
