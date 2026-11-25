import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function GlassStatCard({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-landing-border-subtle bg-landing-surface px-2.5 py-2.5 text-center shadow-xs sm:py-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
