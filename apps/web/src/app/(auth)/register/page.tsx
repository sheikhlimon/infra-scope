'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/register', { name, email, password })
      toast({
        title: 'Account created',
        description: 'You can now sign in with your credentials.',
      })
      router.push('/login')
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
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
            <h1 className="text-3xl font-semibold text-foreground mb-4">Create account</h1>
            <p className="text-muted-foreground">Start monitoring your infrastructure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={loading}
                className="rounded-md"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
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

            <div className="space-y-4">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-md"
              />
            </div>

            <Button type="submit" className="w-full rounded-md" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </Card>
      </div>

      <div className="w-1/3 bg-primary hidden md:flex items-center justify-center">
        <div className="text-primary-foreground p-8">
          <h2 className="text-2xl font-semibold mb-4">Get started</h2>
          <p className="text-primary-foreground/80">
            Create your account and start tracking your infrastructure in seconds.
          </p>
        </div>
      </div>
    </div>
  )
}
