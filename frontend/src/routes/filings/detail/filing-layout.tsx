import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { SurfaceButton } from '@/components/app/action-buttons'
import { SurfaceCard } from '@/components/app/surface-card'
import { PageHeading } from '@/components/app/typography'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { formatCount, formatDate, formatKb, plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useSession } from '@/state/session'

const TABS = [
  { label: 'Overview', to: '', end: true },
  { label: 'Causal graph', to: '/graph', end: false },
  { label: 'Q&A', to: '/qa', end: false },
  { label: 'Tables', to: '/tables', end: false },
] as const

export function FilingLayout() {
  const { id } = useParams()
  const { documents } = useSession()
  const filing = documents.find((d) => d.document_id === id)

  if (!filing) {
    return (
      <SurfaceCard className="p-6">
        <Empty className="border-0 bg-transparent py-12">
          <EmptyHeader>
            <EmptyTitle className="text-sm font-medium text-landing-ink">
              Filing not in this session
            </EmptyTitle>
            <EmptyDescription className="text-xs text-landing-ink-muted">
              Ingestion is scoped to the session that performed it. Open the library to load a
              filing, then its graph, tables, and questions become available.
            </EmptyDescription>
            <SurfaceButton asChild className="mt-4">
              <Link to="/filings">Go to filings</Link>
            </SurfaceButton>
          </EmptyHeader>
        </Empty>
      </SurfaceCard>
    )
  }

  const stats = [
    { label: 'Metrics', value: formatCount(filing.metric_nodes_count) },
    { label: 'Footnotes', value: formatCount(filing.disclosure_nodes_count) },
    { label: 'Causal edges', value: formatCount(filing.causal_edges_count) },
    { label: 'Tables', value: formatCount(filing.tables_count) },
  ]

  return (
    <div className="space-y-5 text-landing-ink">
      {/* Header + Inline Metadata */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <PageHeading className="truncate">
              {filing.filename.replace(/\.pdf$/i, '')}
            </PageHeading>
            <Badge
              variant="outline"
              className={cn(
                'rounded-full border-landing-canvas-border px-2.5 py-0.5 text-xs font-medium',
                filing.status === 'Ready'
                  ? 'border-transparent bg-landing-accent-soft text-landing-accent'
                  : 'bg-landing-card-inner text-landing-ink-muted',
              )}
            >
              {filing.status}
            </Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-landing-ink-muted">
            <span>{plural(filing.total_pages, 'page')}</span>
            <span>{formatKb(filing.size_kb)}</span>
            <span>Ingested {formatDate(filing.uploaded_at)}</span>
          </p>
        </div>

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <dt className="text-landing-ink-muted">{s.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-landing-ink tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Section Navigation */}
      <nav
        aria-label="Filing sections"
        className="shadow-landing-sunken inline-flex flex-wrap items-center gap-1 rounded-xl p-1"
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.label}
            to={`/filings/${filing.document_id}${tab.to}`}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'shadow-landing-raised text-landing-ink'
                  : 'text-landing-ink-muted hover:text-landing-ink',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div>
        <Outlet />
      </div>
    </div>
  )
}
