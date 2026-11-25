import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function FeatureCard({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'shadow-landing-card flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
