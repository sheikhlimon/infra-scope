'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Server,
  RefreshCw,
  Trash2,
  Edit,
  Activity,
  Cpu,
  HardDrive,
  Calendar,
  Network,
} from 'lucide-react'

interface System {
  id: number
  hostname: string
  ipAddress: string
  os: string
  status: 'ACTIVE' | 'INACTIVE' | 'SCANNING' | 'ERROR'
  lastScannedAt: string | null
  createdAt: string
  cpuCores?: number | null
  memoryGB?: number | null
  connectionType: string
  credentialsConfigured: boolean
}

const statusConfig = {
  ACTIVE: {
    label: 'ACTIVE',
    className: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.2)]',
    icon: 'bg-emerald-400',
  },
  INACTIVE: {
    label: 'INACTIVE',
    className: 'bg-muted/30 text-muted-foreground border-border/50',
    glow: '',
    icon: 'bg-muted-foreground/40',
  },
  SCANNING: {
    label: 'SCANNING',
    className: 'bg-amber-950/70 text-amber-400 border-amber-500/40',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.2)]',
    icon: 'bg-amber-400 animate-pulse',
  },
  ERROR: {
    label: 'ERROR',
    className: 'bg-rose-950/70 text-rose-400 border-rose-500/40',
    glow: 'shadow-[0_0_24px_rgba(251,113,133,0.2)]',
    icon: 'bg-rose-400',
  },
}

export default function SystemDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [system, setSystem] = useState<System | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  useEffect(() => {
    fetchSystem()
  }, [id])

  const fetchSystem = async () => {
    try {
      const data = await api.get<System>(`/systems/${id}`)
      setSystem(data)
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setNotFound(true)
      } else {
        toast({
          title: 'Failed to load system',
          description: err instanceof Error ? err.message : 'Please try again',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    setScanning(true)
    try {
      await api.post(`/systems/${id}/scan`, {})
      toast({
        title: 'Scan initiated',
        description: 'System scan is running in the background',
      })
      setTimeout(fetchSystem, 2000)
    } catch (err) {
      toast({
        title: 'Scan failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setScanning(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/systems/${id}`)
      toast({
        title: 'System deleted',
        description: 'The system has been removed',
      })
      router.push('/dashboard/systems')
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">LOADING_SYSTEM_DATA...</p>
        </div>
      </div>
    )
  }

  if (notFound || !system) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 border-border/60 max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <Server className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-mono">SYSTEM_NOT_FOUND</p>
              <p className="text-xs text-muted-foreground">
                The requested system does not exist or has been deleted
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/systems')}
              className="font-mono text-xs"
            >
              RETURN_TO_SYSTEMS
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const config = statusConfig[system.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/systems')}
          className="font-mono text-xs hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          BACK_TO_SYSTEMS
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/systems/${system.id}/edit`)}
            className="font-mono text-xs"
          >
            <Edit className="mr-2 h-3 w-3" />
            EDIT
          </Button>
          <Button
            variant="outline"
            onClick={handleScan}
            disabled={scanning}
            className="font-mono text-xs"
          >
            <RefreshCw className={`mr-2 h-3 w-3 ${scanning ? 'animate-spin' : ''}`} />
            SCAN
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialog(true)}
            className="font-mono text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="mr-2 h-3 w-3" />
            DELETE
          </Button>
        </div>
      </div>

      {/* Main status card */}
      <Card className={`p-8 border-border/60 relative overflow-hidden ${config.glow}`}>
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40" />

        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-lg border border-border/60 flex items-center justify-center bg-muted/20 ${config.glow}`}>
                <Server className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-mono font-bold tracking-tight">{system.hostname}</h1>
                <p className="text-sm text-muted-foreground font-mono">{system.ipAddress}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-mono uppercase px-3 py-1 ${config.className}`}
            >
              <span className={`h-2 w-2 rounded-full mr-2 ${config.icon}`} />
              {config.label}
            </Badge>
          </div>

          <div className="text-right space-y-2">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              System ID
            </p>
            <p className="text-lg font-mono font-bold">#{system.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* System Info */}
        <Card className="p-6 border-border/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Server className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                System_Info
              </span>
            </div>
            <div className="space-y-3">
              <DetailRow label="Hostname" value={system.hostname} />
              <DetailRow label="IP Address" value={system.ipAddress} />
              <DetailRow label="OS" value={system.os} />
              <DetailRow
                label="Connection"
                value={system.connectionType}
                mono={false}
              />
            </div>
          </div>
        </Card>

        {/* Specifications */}
        <Card className="p-6 border-border/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Specifications
              </span>
            </div>
            <div className="space-y-3">
              <DetailRow
                label="CPU Cores"
                value={system.cpuCores ? `${system.cpuCores} cores` : 'Not configured'}
              />
              <DetailRow
                label="Memory"
                value={system.memoryGB ? `${system.memoryGB} GB` : 'Not configured'}
              />
              <DetailRow
                label="Credentials"
                value={system.credentialsConfigured ? 'Configured' : 'Not configured'}
                mono={false}
                status={system.credentialsConfigured ? 'success' : 'warning'}
              />
            </div>
          </div>
        </Card>

        {/* Status & Timing */}
        <Card className="p-6 border-border/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Status_&_Timing
              </span>
            </div>
            <div className="space-y-3">
              <DetailRow
                label="Current Status"
                value={system.status}
                mono={false}
                status={system.status === 'ACTIVE' ? 'success' : system.status === 'ERROR' ? 'error' : 'default'}
              />
              <DetailRow
                label="Last Scan"
                value={system.lastScannedAt ? new Date(system.lastScannedAt).toLocaleString() : 'Never'}
              />
              <DetailRow
                label="Added On"
                value={new Date(system.createdAt).toLocaleString()}
              />
            </div>
          </div>
        </Card>

        {/* Network Info */}
        <Card className="p-6 border-border/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Network
              </span>
            </div>
            <div className="space-y-3">
              <DetailRow label="IP Address" value={system.ipAddress} />
              <DetailRow label="Connection" value={system.connectionType} mono={false} />
              <DetailRow
                label="Monitoring"
                value={system.status === 'ACTIVE' ? 'Enabled' : 'Disabled'}
                mono={false}
                status={system.status === 'ACTIVE' ? 'success' : 'default'}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="border-border/60">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-rose-500/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-rose-500/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-rose-500/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-rose-500/40" />
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-wider">
              CONFIRM_DELETION
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Permanently delete <span className="font-mono text-primary">{system.hostname}</span> from
              your infrastructure monitor?
              <span className="text-rose-400 font-mono text-xs block mt-2">
                THIS_ACTION_CANNOT_BE_UNDONE
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 text-white hover:bg-rose-600 font-mono text-xs"
            >
              DELETE_SYSTEM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = true,
  status,
}: {
  label: string
  value: string
  mono?: boolean
  status?: 'success' | 'warning' | 'error' | 'default'
}) {
  const statusColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    default: '',
  }

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-xs ${mono ? 'font-mono' : ''} ${status ? statusColors[status] : 'text-foreground'}`}
      >
        {value}
      </span>
    </div>
  )
}
