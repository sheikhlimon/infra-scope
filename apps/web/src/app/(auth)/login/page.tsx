'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      toast({
        title: 'Login failed',
        description: err instanceof Error ? err.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-2/3 flex items-center justify-center p-12">
        <Card className="w-full max-w-md p-8 border-none shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-4">InfraScope</h1>
            <p className="text-muted-foreground">Sign in to manage your infrastructure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@infrascope.dev"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-md"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-md"
              />
            </div>

            <Button type="submit" className="w-full rounded-md" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            No account?{' '}
            <a href="/register" className="text-primary hover:underline">
              Register
            </a>
          </p>
        </Card>
      </div>

      <div className="w-1/3 bg-primary hidden md:flex items-center justify-center">
        <div className="text-primary-foreground p-8">
          <h2 className="text-2xl font-semibold mb-4">Monitor everything</h2>
          <p className="text-primary-foreground/80">
            Track servers, scan systems, and keep your infrastructure healthy.
          </p>
        </div>
      </div>
    </div>
  )
}
