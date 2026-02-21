'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Shield, UserPlus, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: 'VALIDATION_ERROR',
        description: 'PASSWORDS_DO_NOT_MATCH',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/register', { name, email, password })
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      toast({
        title: 'REGISTRATION_FAILED',
        description: err instanceof Error ? err.message : 'Something went wrong',
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
            <Shield className="h-8 w-8" />
            <h1 className="text-2xl font-mono font-bold tracking-wider">
              INFRA<span className="text-primary-foreground/70">SCOPE</span>
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
            Create your account and start monitoring your infrastructure.
          </p>
          <div className="space-y-2 font-mono text-xs text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-foreground/60" />
              <span>Unlimited systems</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-foreground/60" />
              <span>Activity tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-foreground/60" />
              <span>Real-time alerts</span>
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
              <div className="h-10 w-10 bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-mono font-bold tracking-wider text-foreground">
                  INFRA<span className="text-primary">SCOPE</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                  Request_Access
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider">
                  User_Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="font-mono text-sm bg-muted/20 border-border/60 rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">
                  Email_Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-mono text-xs uppercase tracking-wider">
                  Confirm_Key
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="font-mono text-sm bg-muted/20 border-border/60 rounded-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-wider rounded-sm mt-4"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    PROCESSING
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    REGISTER
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                ALREADY_HAVE_ACCESS?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  SIGN_IN
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
