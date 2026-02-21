'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Eye, RefreshCw, Trash2, Server, Activity, Search, X } from 'lucide-react'

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
}

const statusConfig = {
  ACTIVE: {
    label: 'ACTIVE',
    className: 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.15)]',
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
  },
  INACTIVE: {
    label: 'INACTIVE',
    className: 'bg-muted/30 text-muted-foreground border-border/50',
    dot: 'bg-muted-foreground/40',
  },
  SCANNING: {
    label: 'SCANNING',
    className: 'bg-amber-950/30 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(251,191,36,0.15)]',
    dot: 'bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]',
  },
  ERROR: {
    label: 'ERROR',
    className: 'bg-rose-950/30 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(251,113,133,0.15)]',
    dot: 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]',
  },
}

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SCANNING' | 'ERROR'>('ALL')
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchSystems()
  }, [])

  const fetchSystems = async () => {
    try {
      const data = await api.get<{ systems: System[] }>('/systems')
      setSystems(data.systems)
    } catch (err) {
      toast({
        title: 'Failed to load systems',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (id: number) => {
    setScanning(id)
    try {
      await api.post(`/systems/${id}/scan`, {})
      toast({
        title: 'Scan initiated',
        description: 'System scan is running in the background',
      })
      setTimeout(fetchSystems, 2000)
    } catch (err) {
      toast({
        title: 'Scan failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setScanning(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/systems/${deleteId}`)
      toast({
        title: 'System deleted',
        description: 'The system has been removed',
      })
      setDeleteId(null)
      fetchSystems()
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    }
  }

  const activeCount = (systems || []).filter(s => s.status === 'ACTIVE').length
  const scanningCount = (systems || []).filter(s => s.status === 'SCANNING').length
  const errorCount = (systems || []).filter(s => s.status === 'ERROR').length

  const filteredSystems = (systems || []).filter(system => {
    const matchesSearch =
      searchTerm === '' ||
      system.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      system.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || system.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
  }

  if (!user) return null

  const safeSystems = systems || []

  return (
    <div className="space-y-6">
      {/* Header with stats bar */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-mono font-bold tracking-tight">SYSTEMS</h1>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Infrastructure monitoring endpoints
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/systems/new')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs"
          >
            <Plus className="mr-2 h-3 w-3" />
            ADD_SYSTEM
          </Button>
        </div>

        {/* Status bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 border-border/60 relative overflow-hidden bg-muted/20">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Total</p>
                <p className="text-lg font-mono font-bold">{safeSystems.length}</p>
              </div>
              <Server className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
          <Card className="p-3 border-border/60 relative overflow-hidden bg-emerald-950/10">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-emerald-500/40" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Active</p>
                <p className="text-lg font-mono font-bold text-emerald-400">{activeCount}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
          </Card>
          <Card className="p-3 border-border/60 relative overflow-hidden bg-amber-950/10">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-500/40" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Scanning</p>
                <p className="text-lg font-mono font-bold text-amber-400">{scanningCount}</p>
              </div>
              <Activity className="h-4 w-4 text-amber-400/60 animate-pulse" />
            </div>
          </Card>
          <Card className="p-3 border-border/60 relative overflow-hidden bg-rose-950/10">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-rose-500/40" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Error</p>
                <p className="text-lg font-mono font-bold text-rose-400">{errorCount}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border/60">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by hostname or IP..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 font-mono text-sm bg-muted/20 border-border/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {(['ALL', 'ACTIVE', 'INACTIVE', 'SCANNING', 'ERROR'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase border rounded transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/20 text-muted-foreground border-border/60 hover:bg-muted/30'
                }`}
              >
                {status === 'ALL' ? 'All' : status.toLowerCase()}
              </button>
            ))}
          </div>
          {(searchTerm || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="font-mono text-xs h-8"
            >
              <X className="mr-2 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        {filteredSystems.length !== safeSystems.length && (
          <p className="text-[10px] text-muted-foreground font-mono mt-3">
            Showing {filteredSystems.length} of {safeSystems.length} systems
          </p>
        )}
      </Card>

      {/* Systems table - desktop only */}
      <Card className="border-border/60 relative overflow-hidden hidden md:block">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30" />

        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent bg-muted/20">
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3">Hostname</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3">Address</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3">OS</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3">Specs</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3">Last Scan</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground font-mono">LOADING_SYSTEMS...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : safeSystems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
                      <Server className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-mono">NO_SYSTEMS_CONFIGURED</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/systems/new')}
                        className="font-mono text-xs"
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        ADD_FIRST_SYSTEM
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSystems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
                      <Search className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-mono">NO_MATCHING_SYSTEMS</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="font-mono text-xs"
                      >
                        <X className="mr-2 h-3 w-3" />
                        CLEAR_FILTERS
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSystems.map((system) => (
                <TableRow
                  key={system.id}
                  className="border-border/40 hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="font-mono text-sm py-3">{system.hostname}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground/80 py-3">
                    {system.ipAddress}
                  </TableCell>
                  <TableCell className="text-sm py-3">{system.os}</TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3">
                    {system.cpuCores || system.memoryGB ? (
                      <span className="font-mono">
                        {system.cpuCores && `${system.cpuCores}C`}
                        {system.cpuCores && system.memoryGB && ' / '}
                        {system.memoryGB && `${system.memoryGB}GB`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 ${statusConfig[system.status].className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusConfig[system.status].dot}`} />
                      {statusConfig[system.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono py-3">
                    {system.lastScannedAt
                      ? new Date(system.lastScannedAt).toLocaleString()
                      : <span className="text-muted-foreground/50">NEVER</span>}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/systems/${system.id}`)}
                        className="h-7 w-7 p-0 hover:bg-primary/10"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleScan(system.id)}
                        disabled={scanning === system.id}
                        className="h-7 w-7 p-0 hover:bg-amber-500/10"
                        title="Trigger scan"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${scanning === system.id ? 'animate-spin text-amber-400' : ''}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(system.id)}
                        className="h-7 w-7 p-0 hover:bg-rose-500/10 text-rose-400/70 hover:text-rose-400"
                        title="Delete system"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground font-mono">LOADING_SYSTEMS...</p>
            </div>
          </Card>
        ) : safeSystems.length === 0 ? (
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
                <Server className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">NO_SYSTEMS_CONFIGURED</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/systems/new')}
                  className="font-mono text-xs"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  ADD_FIRST_SYSTEM
                </Button>
              </div>
            </div>
          </Card>
        ) : filteredSystems.length === 0 ? (
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center">
                <Search className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">NO_MATCHING_SYSTEMS</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="font-mono text-xs"
                >
                  <X className="mr-2 h-3 w-3" />
                  CLEAR_FILTERS
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          filteredSystems.map((system) => (
            <Card key={system.id} className="p-4 border-border/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/30" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/30" />
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-mono font-bold">{system.hostname}</p>
                    <p className="text-xs text-muted-foreground font-mono">{system.ipAddress}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 ${statusConfig[system.status].className}`}
                >
                  <span className={`h-1 w-1 rounded-full mr-1 ${statusConfig[system.status].dot}`} />
                  {system.status}
                </Badge>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground mb-3">
                <div className="flex justify-between">
                  <span className="font-mono uppercase">OS:</span>
                  <span className="text-foreground">{system.os}</span>
                </div>
                {system.cpuCores || system.memoryGB ? (
                  <div className="flex justify-between">
                    <span className="font-mono uppercase">Specs:</span>
                    <span className="font-mono text-foreground">
                      {system.cpuCores && `${system.cpuCores}C`}
                      {system.cpuCores && system.memoryGB && ' / '}
                      {system.memoryGB && `${system.memoryGB}GB`}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="font-mono uppercase">Last Scan:</span>
                  <span className="text-foreground">
                    {system.lastScannedAt
                      ? new Date(system.lastScannedAt).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/systems/${system.id}`)}
                  className="flex-1 font-mono text-xs"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScan(system.id)}
                  disabled={scanning === system.id}
                  className="flex-1 font-mono text-xs"
                >
                  <RefreshCw className={`mr-2 h-3 w-3 ${scanning === system.id ? 'animate-spin' : ''}`} />
                  Scan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(system.id)}
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
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
              This will permanently delete this system from your infrastructure monitor.
              <span className="text-rose-400 font-mono text-xs block mt-2">THIS_ACTION_CANNOT_BE_UNDONE</span>
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
