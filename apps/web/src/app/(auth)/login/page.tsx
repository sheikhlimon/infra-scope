'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useServerWarmup } from '@/hooks/use-server-warmup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Lock, Eye, EyeOff, UserRound, Clock, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

// Demo credentials for development
const DEMO_CREDENTIALS = {
  email: 'admin@infrascope.dev',
  password: 'admin123',
}

const LOGIN_MAX_RETRIES = 2
const LOGIN_RETRY_DELAY = 3000

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { status: serverStatus, attempt: retryAttempt, totalAttempts, retry: retryWarmup } = useServerWarmup()
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
  }

  // Login with retry
  const handleLogin = async (attempt: number = 1): Promise<boolean> => {
    try {
      await login(email, password)
      return true
    } catch (err) {
      if (attempt < LOGIN_MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, LOGIN_RETRY_DELAY))
        return handleLogin(attempt + 1)
      }
      throw err
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await handleLogin(1)
      if (success) {
        router.push('/dashboard')
      }
    } catch (err) {
      toast({
        title: 'AUTHENTICATION_FAILED',
        description: err instanceof Error ? err.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:flex md:w-1/3 bg-primary items-center justify-center relative overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="text-primary-foreground p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Logo size="lg" className="border-primary-foreground/60" inverted />
            <h1 className="text-2xl font-mono font-bold tracking-wider">
              INFRA<span className="text-primary-foreground/70">SCOPE</span>
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
            Infrastructure monitoring and systems scanning platform.
          </p>
          <div className="space-y-2 font-mono text-xs text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-foreground/60" />
              <span>Real-time monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-foreground/60" />
              <span>System status tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-foreground/60" />
              <span>Activity audit logs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/60 relative overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/30" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/30" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/30" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/30" />

          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/40">
              <Logo size="lg" />
              <div>
                <h1 className="text-xl font-mono font-bold tracking-wider text-foreground">
                  INFRA<span className="text-primary">SCOPE</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                  System_Access
                </p>
              </div>
            </div>

            {/* Server status indicator */}
            <div className="mb-6 p-3 bg-muted/30 border border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(serverStatus === 'checking' || serverStatus === 'warming') && (
                  <>
                    <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                    <span className="font-mono text-xs text-yellow-500">
                      WARMING_SERVER {retryAttempt > 0 && `(${retryAttempt}/${totalAttempts})`}
                    </span>
                  </>
                )}
                {serverStatus === 'ready' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-xs text-green-500">SERVER_READY</span>
                  </>
                )}
                {serverStatus === 'error' && (
                  <>
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-mono text-xs text-red-500">SERVER_TIMEOUT</span>
                  </>
                )}
              </div>
              {(serverStatus === 'checking' || serverStatus === 'warming') && (
                <span className="font-mono text-[10px] text-muted-foreground">~50s max</span>
              )}
              {serverStatus === 'error' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={retryWarmup}
                  className="font-mono text-[10px] text-red-500 h-auto p-0 hover:text-red-400"
                >
                  RETRY
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">
                  Email_Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@infrascope.dev"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="font-mono text-sm bg-muted/20 border-border/60 rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">
                  Access_Key
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="font-mono text-sm bg-muted/20 border-border/60 rounded-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-wider rounded-sm"
                disabled={loading || serverStatus === 'warming' || serverStatus === 'checking'}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    AUTHENTICATING
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    LOGIN
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                NO_ACCESS?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  REQUEST_ACCESS
                </Link>
              </p>
            </div>

            {/* Demo credentials card */}
            <div className="mt-4 p-4 bg-muted/30 border border-border/40 relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/40" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/40" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/40" />

              <div className="flex items-center gap-2 mb-3">
                <UserRound className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-wider text-primary">Demo_Credentials</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <code className="text-foreground bg-muted/50 px-2 py-0.5 rounded-sm">{DEMO_CREDENTIALS.email}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="text-foreground bg-muted/50 px-2 py-0.5 rounded-sm">{DEMO_CREDENTIALS.password}</code>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemoCredentials}
                disabled={loading || serverStatus === 'warming' || serverStatus === 'checking'}
                className="w-full mt-3 font-mono text-xs uppercase tracking-wider border-border/60 hover:bg-muted/50"
              >
                Auto_Fill
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
