import { SurfaceCard } from '@/components/app/surface-card'
import { cn } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  sub,
  badge,
  positive = true,
  className,
}: {
  label: string
  value: string | number
  sub?: string
  badge?: string
  positive?: boolean
  className?: string
}) {
  return (
    <SurfaceCard className={cn('p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-landing-ink-muted">{label}</span>
        {badge && (
          <span
            className={cn(
              'inline-flex items-center text-xs leading-none font-medium',
              positive ? 'text-landing-ink' : 'text-landing-ink-muted',
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-landing-ink tabular-nums">
          {value}
        </span>
        {sub && (
          <span className="truncate text-xs text-landing-ink-muted">{sub}</span>
        )}
      </div>
    </SurfaceCard>
  )
}
