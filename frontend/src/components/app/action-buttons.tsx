import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ButtonProps = ComponentProps<typeof Button>

export function PrimaryButton({ className, size = 'lg', ...props }: ButtonProps) {
  return (
    <Button
      size={size}
      className={cn(
        'rounded-full bg-landing-cta px-6 text-xs font-semibold tracking-wider text-landing-cta-foreground uppercase shadow-sm hover:bg-landing-cta/90',
        className,
      )}
      {...props}
    />
  )
}

export function SecondaryButton({ className, size = 'lg', ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        'rounded-full px-4 text-xs font-medium text-landing-muted transition-colors hover:bg-landing-surface-hover hover:text-landing-foreground dark:hover:bg-landing-surface-hover',
        className,
      )}
      {...props}
    />
  )
}

export function SurfaceButton({ className, size = 'sm', ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        'shadow-landing-raised inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs leading-none font-medium text-landing-ink transition-all hover:bg-transparent hover:brightness-105 active:translate-y-px dark:hover:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}
