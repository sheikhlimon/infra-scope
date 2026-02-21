import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg">
        <Card className="border-border/60 relative overflow-hidden p-12">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary/40" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary/40" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary/40" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary/40" />

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          <div className="relative z-10 text-center space-y-8">
            {/* Error code */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-border flex-1" />
                <h1 className="text-8xl font-mono font-bold tracking-tighter text-primary">
                  404
                </h1>
                <div className="h-px bg-border flex-1" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 bg-primary/60" />
                <div className="h-1 w-1 bg-primary/40" />
                <div className="h-1 w-1 bg-primary/20" />
              </div>
            </div>

            {/* Error icon */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded border-2 border-border/60 flex items-center justify-center bg-muted/20">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h2 className="text-xl font-mono font-bold tracking-tight text-foreground">
                SYSTEM_NOT_FOUND
              </h2>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                The requested resource does not exist or has been moved to another location.
              </p>
            </div>

            {/* Technical details */}
            <div className="p-4 bg-muted/20 border border-border/40 rounded-sm">
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ERROR_CODE</span>
                  <span className="text-primary">HTTP_404</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">STATUS</span>
                  <span className="text-rose-400">NOT_FOUND</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="font-mono text-xs rounded-sm"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                GO_BACK
              </Button>
              <Link href="/dashboard">
                <Button className="font-mono text-xs rounded-sm">
                  <Home className="mr-2 h-3 w-3" />
                  DASHBOARD
                </Button>
              </Link>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground font-mono">
                INFRA-SCOPE_v1.0 // INFRASTRUCTURE_MONITORING_SYSTEM
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom accent */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-px bg-border w-16" />
          <div className="h-1 w-1 bg-primary/40" />
          <div className="h-px bg-border w-16" />
        </div>
      </div>
    </div>
  )
}
