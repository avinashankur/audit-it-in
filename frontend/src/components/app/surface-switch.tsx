import type { ComponentProps } from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

export function SurfaceSwitch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-landing-ink-muted disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-landing-ink data-[state=unchecked]:bg-landing-canvas-border',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-landing-canvas shadow-xs transition-transform duration-150 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}
