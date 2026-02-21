'use client'

import { useEffect, useState, createElement } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  UserPlus,
  UserMinus,
  Server,
  RefreshCw,
  Trash2,
  Edit,
  Shield,
  Key,
} from 'lucide-react'

interface ActivityLog {
  id: number
  action: string
  userId: number
  systemId: number | null
  createdAt: string
  user: {
    id: number
    email: string
  }
  system?: {
    id: number
    hostname: string
  }
}

const actionConfig: Record<
  string,
  { label: string; iconName: 'user-plus' | 'key' | 'server' | 'edit' | 'trash-2' | 'refresh-cw' | 'file-text'; color: string; bg: string }
> = {
  'user.registered': {
    label: 'USER_REGISTERED',
    iconName: 'user-plus',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/30 border-emerald-500/30',
  },
  'user.login': {
    label: 'USER_LOGIN',
    iconName: 'key',
    color: 'text-muted-foreground',
    bg: 'bg-muted/30 border-border/50',
  },
  'system.created': {
    label: 'SYSTEM_CREATED',
    iconName: 'server',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/30 border-emerald-500/30',
  },
  'system.updated': {
    label: 'SYSTEM_UPDATED',
    iconName: 'edit',
    color: 'text-blue-400',
    bg: 'bg-blue-950/30 border-blue-500/30',
  },
  'system.deleted': {
    label: 'SYSTEM_DELETED',
    iconName: 'trash-2',
    color: 'text-rose-400',
    bg: 'bg-rose-950/30 border-rose-500/30',
  },
  'system.scanned': {
    label: 'SYSTEM_SCANNED',
    iconName: 'refresh-cw',
    color: 'text-amber-400',
    bg: 'bg-amber-950/30 border-amber-500/30',
  },
}

const iconMap: Record<string, React.ElementType> = {
  'user-plus': UserPlus,
  'key': Key,
  'server': Server,
  'edit': Edit,
  'trash-2': Trash2,
  'refresh-cw': RefreshCw,
  'file-text': FileText,
}

const getActionConfig = (action: string) => {
  return (
    actionConfig[action] || {
      label: action.toUpperCase().replace('.', '_'),
      iconName: 'file-text',
      color: 'text-muted-foreground',
      bg: 'bg-muted/30 border-border/50',
    }
  )
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const data = await api.get<{ logs: ActivityLog[] }>('/activity')
      setLogs(data.logs)
    } catch (err) {
      toast({
        title: 'Failed to load activity',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-mono font-bold tracking-tight">ACTIVITY_LOG</h1>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {user.role === 'ADMIN' ? 'System-wide audit trail' : 'Your activity history'}
        </p>
      </div>

      {/* Logs */}
      <Card className="border-border/60 relative overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30" />

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-mono">LOADING_LOGS...</p>
              </div>
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground font-mono">NO_ACTIVITY_LOGS_FOUND</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => {
                const config = getActionConfig(log.action)
                const timestamp = new Date(log.createdAt)
                const dateStr = timestamp.toLocaleDateString()
                const timeStr = timestamp.toLocaleTimeString()

                return (
                  <div
                    key={log.id}
                    className={`group flex gap-4 py-3 ${
                      index !== logs.length - 1 ? 'border-b border-border/40' : ''
                    } hover:bg-muted/5 transition-colors`}
                  >
                    {/* Timestamp column */}
                    <div className="flex-shrink-0 w-32 text-right">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-mono">{dateStr}</p>
                        <p className="text-xs font-mono">{timeStr}</p>
                      </div>
                    </div>

                    {/* Timeline indicator */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div
                        className={`h-7 w-7 rounded border flex items-center justify-center ${config.bg}`}
                      >
                        {createElement(iconMap[config.iconName], {
                          className: `h-3.5 w-3.5 ${config.color}`,
                        })}
                      </div>
                      {index !== logs.length - 1 && (
                        <div className="w-px flex-1 bg-border/40 min-h-[3rem]" />
                      )}
                    </div>

                    {/* Action details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 ${config.bg} ${config.color}`}
                            >
                              {config.label}
                            </Badge>
                            {user.role === 'ADMIN' && (
                              <span className="text-xs text-muted-foreground font-mono">
                                by {log.user.email}
                              </span>
                            )}
                          </div>
                          {log.system && (
                            <p className="text-xs text-muted-foreground font-mono">
                              System: <span className="text-foreground">{log.system.hostname}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #{log.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4 border-border/60 bg-muted/10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-xs font-mono font-medium">ACTION_TYPES</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(actionConfig).map(([key, { label, iconName, color, bg }]) => {
            const Icon = iconMap[iconName]
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded border flex items-center justify-center ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
