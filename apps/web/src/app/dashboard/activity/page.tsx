'use client'

import { useEffect, useState, createElement, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  UserPlus,
  Server,
  RefreshCw,
  Trash2,
  Edit,
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
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  'user.login': {
    label: 'USER_LOGIN',
    iconName: 'key',
    color: 'text-foreground',
    bg: 'bg-muted/50 border-border/60',
  },
  'system.created': {
    label: 'SYSTEM_CREATED',
    iconName: 'server',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  'system.updated': {
    label: 'SYSTEM_UPDATED',
    iconName: 'edit',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  'system.deleted': {
    label: 'SYSTEM_DELETED',
    iconName: 'trash-2',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
  },
  'system.scanned': {
    label: 'SYSTEM_SCANNED',
    iconName: 'refresh-cw',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
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

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.get<ActivityLog[]>('/activity')
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      toast({
        title: 'Failed to load activity',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

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
                    className={`group flex gap-3 sm:gap-4 py-3 ${
                      index !== logs.length - 1 ? 'border-b border-border/40' : ''
                    } hover:bg-muted/5 transition-colors`}
                  >
                    {/* Timestamp column - hidden on mobile */}
                    <div className="hidden sm:flex flex-shrink-0 w-32 text-right">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-mono">{dateStr}</p>
                        <p className="text-xs font-mono">{timeStr}</p>
                      </div>
                    </div>

                    {/* Timeline indicator */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded border flex items-center justify-center ${config.bg}`}
                      >
                        {createElement(iconMap[config.iconName], {
                          className: `h-4 w-4 ${config.color}`,
                        })}
                      </div>
                      {index !== logs.length - 1 && (
                        <div className="w-px flex-1 bg-border/40 min-h-[3rem]" />
                      )}
                    </div>

                    {/* Action details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
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
                          {/* Mobile timestamp - shown below action */}
                          <p className="sm:hidden text-[10px] text-muted-foreground font-mono">
                            {dateStr} {timeStr}
                          </p>
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
    </div>
  )
}
