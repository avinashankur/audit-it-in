import { FileText, LayoutDashboard, Settings, type LucideIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { SurfaceCard } from '@/components/app/surface-card'
import { Caption } from '@/components/app/typography'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useSession } from '@/state/session'

function NavItem({
  to,
  end,
  icon: Icon,
  children,
}: {
  to: string
  end?: boolean
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <SidebarMenuItem>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all',
            isActive
              ? 'shadow-landing-raised text-landing-ink'
              : 'text-landing-ink-muted hover:bg-landing-card-inner/50 hover:text-landing-ink',
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                'size-4 shrink-0 transition-colors',
                isActive ? 'text-landing-ink' : 'text-landing-ink-muted',
              )}
              aria-hidden="true"
            />
            <span>{children}</span>
          </>
        )}
      </NavLink>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { health } = useSession()

  const checks = [
    { label: 'Engine', value: health ? 'Ready' : 'Offline' },
    { label: 'Parser', value: health ? 'Running' : 'Offline' },
    { label: 'Graph', value: health ? 'Running' : 'Offline' },
  ]

  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      className="bg-sidebar text-landing-ink"
    >
      <SidebarHeader className="px-3 pt-5 pb-3 md:px-1">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-landing-ink transition-opacity hover:opacity-80"
        >
          <img
            src="/favicon.svg"
            alt="AuditItIn"
            className="size-5 rounded-md shadow-xs"
          />
          <span className="text-sm font-semibold tracking-tight">
            AuditItIn
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3 py-4 md:px-1">
        <SidebarGroup className="p-0">
          <Caption className="px-2 pb-2 text-landing-ink-muted">Workspace</Caption>
          <SidebarMenu className="gap-1">
            <NavItem to="/dashboard" end icon={LayoutDashboard}>
              Overview
            </NavItem>
            <NavItem to="/filings" icon={FileText}>
              Filings
            </NavItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2.5 px-3 py-3 md:px-1">
        <SidebarMenu className="gap-1">
          <NavItem to="/settings" icon={Settings}>
            Settings
          </NavItem>
        </SidebarMenu>

        <div className="border-t border-landing-canvas-border pt-2.5">
          <SurfaceCard className="p-3">
            <div className="mb-2.5 text-xs font-medium text-landing-ink-muted">
              Status
            </div>

            <ul className="relative space-y-2 text-xs">
              <span
                aria-hidden="true"
                className="absolute top-2 bottom-2 left-1 border-l border-dashed border-landing-canvas-border"
              />
              {checks.map(({ label, value }) => (
                <li
                  key={label}
                  className="relative flex items-center justify-between gap-2 pl-4"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-1 size-1.5 -translate-x-1/2 rounded-full bg-landing-ink-muted"
                  />
                  <span className="text-landing-ink-muted">{label}</span>
                  <span
                    className={cn(
                      'truncate font-medium tabular-nums',
                      health ? 'text-landing-ink' : 'text-landing-ink-muted',
                    )}
                  >
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
