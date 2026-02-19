'use client'

import { ProtectedRoute } from '@/components/protected-route'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Activity, Server, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

function DashboardContent() {
  const stats = [
    { label: 'Total Systems', value: '16', change: '+3 this week', icon: Server, color: 'text-blue-500' },
    { label: 'Active Scans', value: '3', change: 'Processing', icon: Activity, color: 'text-amber-500' },
    { label: 'Healthy', value: '12', change: '75% of total', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Issues', value: '1', change: 'Needs attention', icon: AlertTriangle, color: 'text-rose-500' },
  ]

  const recentActivity = [
    { system: 'prod-web-01', action: 'Scan completed', status: 'success', time: '2m ago' },
    { system: 'staging-db-02', action: 'Scan started', status: 'scanning', time: '5m ago' },
    { system: 'prod-api-03', action: 'Connection failed', status: 'error', time: '12m ago' },
    { system: 'dev-cache-01', action: 'System added', status: 'info', time: '1h ago' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground">
            System Overview
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Real-time infrastructure monitoring
          </p>
        </div>
        <Button className="font-mono text-sm rounded-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add System
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-6 border-border/60 relative overflow-hidden">
              {/* Technical corner accents */}
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Systems List */}
        <Card className="col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
              Recent Systems
            </h2>
            <Badge variant="outline" className="font-mono text-xs">View All</Badge>
          </div>

          <div className="space-y-3">
            {[
              { name: 'prod-web-01', ip: '192.168.1.100', status: 'active', os: 'Ubuntu 22.04' },
              { name: 'staging-db-02', ip: '192.168.1.105', status: 'scanning', os: 'PostgreSQL 15' },
              { name: 'prod-api-03', ip: '192.168.1.110', status: 'error', os: 'Ubuntu 20.04' },
            ].map((system, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-sm border border-border/40 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {system.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0 rounded-sm",
                        system.status === 'active' && "border-emerald-500/50 text-emerald-500",
                        system.status === 'scanning' && "border-amber-500/50 text-amber-500",
                        system.status === 'error' && "border-rose-500/50 text-rose-500"
                      )}
                    >
                      {system.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {system.ip} • {system.os}
                  </p>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="p-6 border-border/60">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-6">
            Activity Log
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex gap-3">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                  activity.status === 'success' && "bg-emerald-500",
                  activity.status === 'scanning' && "bg-amber-500",
                  activity.status === 'error' && "bg-rose-500",
                  activity.status === 'info' && "bg-blue-500"
                )} />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {activity.system}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {activity.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
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
