import { Link } from 'react-router-dom'
import { ModeToggle } from '@/components/app/mode-toggle'
import { Heading, Lead } from '@/components/app/typography'

const WORKSPACE_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Filings', to: '/filings' },
  { label: 'Settings', to: '/settings' },
] as const

export function LandingFooter() {
  return (
    <footer className="bg-landing-canvas px-2 pt-12 pb-4 text-landing-ink sm:px-2.5 sm:pt-14 sm:pb-6">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <div className="flex flex-col justify-between gap-10 px-2 md:flex-row md:items-start">
          <div className="flex flex-col justify-between gap-8">
            <Lead className="max-w-xs text-landing-ink-muted">
              Turn financial PDFs into an interactive causal knowledge graph with page-level citations.
            </Lead>

            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2.5 text-landing-ink transition-opacity hover:opacity-80"
            >
              <img
                src="/favicon.svg"
                alt="AuditItIn"
                className="size-8 rounded-lg shadow-xs"
              />
              <span className="text-lg font-semibold tracking-tight">
                AuditItIn
              </span>
            </Link>
          </div>

          <div className="space-y-4 md:text-right">
            <Heading className="text-landing-ink">Workspace</Heading>
            <ul className="space-y-2.5">
              {WORKSPACE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-landing-ink-muted transition-colors hover:text-landing-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <div className="inline-flex items-center gap-2 text-xs text-landing-ink-muted">
              <span className="font-medium text-landing-ink">12,480</span>
              <span>visits</span>
            </div>

            <ModeToggle />
          </div>

          <div className="shadow-landing-card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4 text-xs text-landing-ink-muted">
            <span>AuditItIn</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
