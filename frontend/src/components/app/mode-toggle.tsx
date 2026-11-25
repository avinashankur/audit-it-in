import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const THEME_OPTIONS = [
  { value: 'system', label: 'System theme', icon: Monitor },
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
] as const

const THUMB_OFFSET = {
  system: 'translate-x-0',
  light: 'translate-x-7',
  dark: 'translate-x-14',
} as const

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'relative inline-grid grid-cols-3 rounded-xl border border-landing-canvas-border bg-landing-canvas p-0.5',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-0.5 left-0.5 size-7 rounded-[0.55rem] bg-landing-card-inner shadow-xs transition-transform duration-200 ease-out',
          THUMB_OFFSET[theme],
        )}
      />

      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <Button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(value)}
            className={cn(
              'relative z-10 size-7 rounded-full transition-colors duration-200 hover:bg-transparent dark:hover:bg-transparent',
              active
                ? 'text-landing-ink hover:text-landing-ink'
                : 'text-landing-ink-muted hover:text-landing-ink',
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </Button>
        )
      })}
    </div>
  )
}
