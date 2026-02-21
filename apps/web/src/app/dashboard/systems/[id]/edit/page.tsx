'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Server, Loader2 } from 'lucide-react'

interface System {
  id: number
  hostname: string
  ipAddress: string
  os: string
  cpuCores: number | null
  memoryGB: number | null
}

const commonOS = [
  'Ubuntu 22.04 LTS',
  'Ubuntu 20.04 LTS',
  'Debian 12',
  'Debian 11',
  'CentOS 9 Stream',
  'Rocky Linux 9',
  'AlmaLinux 9',
  'RHEL 9',
  'Fedora 39',
  'Arch Linux',
  'Amazon Linux 2023',
]

export default function EditSystemPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [system, setSystem] = useState<System | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [hostname, setHostname] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [os, setOs] = useState('')
  const [cpuCores, setCpuCores] = useState('')
  const [memoryGB, setMemoryGB] = useState('')

  useEffect(() => {
    async function fetchSystem() {
      try {
        const data = await api.get<System>(`/systems/${params.id}`)
        setSystem(data)
        setHostname(data.hostname)
        setIpAddress(data.ipAddress)
        setOs(data.os)
        setCpuCores(data.cpuCores?.toString() ?? '')
        setMemoryGB(data.memoryGB?.toString() ?? '')
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load system',
          variant: 'destructive',
        })
        router.push('/dashboard/systems')
      } finally {
        setLoading(false)
      }
    }
    fetchSystem()
  }, [params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hostname || !ipAddress || !os) {
      toast({
        title: 'Validation failed',
        description: 'Hostname, IP address, and OS are required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      await api.put(`/systems/${params.id}`, {
        hostname,
        ipAddress,
        os,
        cpuCores: cpuCores ? parseInt(cpuCores) : null,
        memoryGB: memoryGB ? parseInt(memoryGB) : null,
      })
      toast({
        title: 'System updated',
        description: `${hostname} has been updated`,
      })
      router.push(`/dashboard/systems/${params.id}`)
    } catch {
      toast({
        title: 'Failed to update',
        description: 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-mono">LOADING_SYSTEM_DATA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/systems/${params.id}`)}
        className="font-mono text-xs hover:bg-primary/10 mb-4"
      >
        <ArrowLeft className="mr-2 h-3 w-3" />
        BACK_TO_SYSTEM
      </Button>

      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded border border-border/60 flex items-center justify-center bg-muted/20">
          <Server className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1 flex-1">
          <h1 className="text-xl font-mono font-bold tracking-tight">EDIT_SYSTEM</h1>
          <p className="text-xs text-muted-foreground font-mono">
            Modify system configuration parameters
          </p>
        </div>
      </div>

      <Card className="border-border/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30" />

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Required_Configuration
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hostname" className="font-mono text-xs uppercase tracking-wider">
                  Hostname <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="hostname"
                  type="text"
                  placeholder="web-server-01"
                  value={hostname}
                  onChange={e => setHostname(e.target.value)}
                  required
                  disabled={saving}
                  className="font-mono text-sm bg-muted/20 border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipAddress" className="font-mono text-xs uppercase tracking-wider">
                  IP Address <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="ipAddress"
                  type="text"
                  placeholder="192.168.1.100"
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                  required
                  disabled={saving}
                  className="font-mono text-sm bg-muted/20 border-border/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="os" className="font-mono text-xs uppercase tracking-wider">
                Operating System <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="os"
                type="text"
                list="os-suggestions"
                placeholder="Ubuntu 22.04 LTS"
                value={os}
                onChange={e => setOs(e.target.value)}
                required
                disabled={saving}
                className="font-mono text-sm bg-muted/20 border-border/60"
              />
              <datalist id="os-suggestions">
                {commonOS.map(osOption => (
                  <option key={osOption} value={osOption}>
                    {osOption}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Optional_Specifications
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cpuCores" className="font-mono text-xs uppercase tracking-wider">
                  CPU Cores
                </Label>
                <Input
                  id="cpuCores"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={cpuCores}
                  onChange={e => setCpuCores(e.target.value)}
                  disabled={saving}
                  className="font-mono text-sm bg-muted/20 border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memoryGB" className="font-mono text-xs uppercase tracking-wider">
                  Memory (GB)
                </Label>
                <Input
                  id="memoryGB"
                  type="number"
                  min="1"
                  placeholder="16"
                  value={memoryGB}
                  onChange={e => setMemoryGB(e.target.value)}
                  disabled={saving}
                  className="font-mono text-sm bg-muted/20 border-border/60"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <p className="text-[10px] text-muted-foreground font-mono">
              <span className="text-rose-400">*</span> Required fields
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/systems/${params.id}`)}
                disabled={saving}
                className="font-mono text-xs"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs min-w-[140px]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    SAVING
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-3 w-3" />
                    SAVE_CHANGES
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
