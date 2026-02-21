import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  inverted?: boolean
}

export function Logo({ size = 'md', className, inverted }: LogoProps) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-2'
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  return (
    <div className={cn('border-primary flex items-center justify-center', sizes[size], className)}>
      <div className={cn(inverted ? 'bg-primary-foreground' : 'bg-primary', dotSizes[size])} />
    </div>
  )
}
