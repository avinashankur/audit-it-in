import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Display({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'text-5xl leading-none font-normal tracking-tight sm:text-6xl lg:text-7xl',
        className,
      )}
      style={{ fontFamily: 'var(--font-hero)' }}
      {...props}
    />
  )
}

export function Title({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'text-3xl leading-tight font-normal tracking-tight sm:text-4xl lg:text-5xl',
        className,
      )}
      style={{ fontFamily: 'var(--font-hero)' }}
      {...props}
    />
  )
}

export function Heading({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm font-medium tracking-tight sm:text-base', className)}
      {...props}
    />
  )
}

export function Lead({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm leading-relaxed font-normal sm:text-base', className)}
      {...props}
    />
  )
}

export function Eyebrow({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-landing-border bg-landing-surface px-4 py-1 text-xs font-medium tracking-widest uppercase backdrop-blur-md',
        className,
      )}
      {...props}
    />
  )
}

export function Caption({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-xs font-medium tracking-wider uppercase', className)}
      {...props}
    />
  )
}
