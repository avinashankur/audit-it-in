import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function SurfaceCard({
  as: Tag = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'aside'
}) {
  return (
    <Tag
      className={cn('shadow-landing-card rounded-xl', className)}
      {...props}
    />
  )
}
