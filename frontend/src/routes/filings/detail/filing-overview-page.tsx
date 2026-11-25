import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Send, Sparkles } from 'lucide-react'
import { api } from '@/api/client'
import { SurfaceButton } from '@/components/app/action-buttons'
import { Num } from '@/components/app/num'
import { SurfaceCard } from '@/components/app/surface-card'
import { Heading } from '@/components/app/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCount } from '@/lib/format'
import { useSession } from '@/state/session'
import type { GraphResponseDto, TableData } from '@/types'

const QUICK_QUESTIONS = [
  'What drove the change in operating income?',
  'Trace the factors behind gross margin.',
  'Summarize liquidity and footnote disclosures.',
]

export function FilingOverview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { documents } = useSession()
  const filing = documents.find((d) => d.document_id === id)

  const [tables, setTables] = useState<TableData[]>([])
  const [graph, setGraph] = useState<GraphResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [inquiry, setInquiry] = useState('')

  useEffect(() => {
    if (!id) return
    const c = new AbortController()
    setLoading(true)
    Promise.allSettled([
      api.getDocumentTables(id),
      api.getDocumentGraph(id, undefined, 1, c.signal),
    ])
      .then(([tablesRes, graphRes]) => {
        if (c.signal.aborted) return
        if (tablesRes.status === 'fulfilled') setTables(tablesRes.value ?? [])
        if (graphRes.status === 'fulfilled') setGraph(graphRes.value ?? null)
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false)
      })
    return () => c.abort()
  }, [id])

  const topMetrics = useMemo(
    () =>
      (graph?.nodes ?? [])
        .filter((n) => n.type === 'metricNode')
        .sort((a, b) => Math.abs(b.data.value ?? 0) - Math.abs(a.data.value ?? 0))
        .slice(0, 6),
    [graph],
  )

  if (!filing) return null

  const handleAsk = (text: string) => {
    const q = text.trim()
    if (!q || !id) return
    navigate(`/filings/${id}/qa?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="space-y-5">
      {/* Prompt Bar */}
      <div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(inquiry)
          }}
        >
          <div className="shadow-landing-sunken flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3.5 transition-shadow focus-within:ring-1 focus-within:ring-landing-ink-muted">
            <Sparkles className="size-3.5 shrink-0 text-landing-accent" aria-hidden="true" />
            <input
              id="filing-quick-inquiry"
              name="filing_quick_inquiry"
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              placeholder="Ask about a balance, driver, or footnote citation..."
              className="w-full min-w-0 bg-transparent text-xs text-landing-ink outline-none placeholder:text-landing-ink-muted"
            />
          </div>
          <SurfaceButton type="submit" className="h-11 px-4" disabled={!inquiry.trim()}>
            <Send className="size-3.5" aria-hidden="true" />
            <span>Ask</span>
          </SurfaceButton>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs">
          <span className="text-landing-ink-muted">Try:</span>
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="cursor-pointer text-landing-ink-muted underline-offset-4 transition-colors hover:text-landing-ink hover:underline"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetric 2-Card Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left: Key Extracted Metrics */}
        <SurfaceCard as="section" className="overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between gap-3 border-b border-landing-canvas-border px-5 py-3.5">
            <Heading className="text-landing-ink">Key Metrics</Heading>
            <Link
              to="graph"
              className="inline-flex items-center gap-1 text-xs font-medium text-landing-ink-muted transition-colors hover:text-landing-ink"
            >
              <span>Causal graph</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg bg-landing-card-inner" />
              ))}
            </div>
          ) : topMetrics.length > 0 ? (
            <div className="divide-y divide-landing-canvas-border">
              {topMetrics.map((m) => (
                <Link
                  key={m.id}
                  to="graph"
                  className="flex items-center justify-between gap-4 px-5 py-3 text-xs transition-colors hover:bg-landing-card-inner/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-landing-ink">
                      {m.data.name.replace(/\s[\d,\s]{4,}$/, '')}
                    </p>
                    {m.data.period && (
                      <p className="mt-0.5 text-landing-ink-muted">{m.data.period}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-sm font-medium text-landing-ink tabular-nums">
                    {m.data.formatted_value ?? (m.data.value != null ? formatCount(m.data.value) : '')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-xs text-landing-ink-muted">
              No metric nodes extracted for this filing yet.
            </p>
          )}
        </SurfaceCard>

        {/* Right: Extracted Tables */}
        <SurfaceCard as="section" className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-landing-canvas-border px-5 py-3.5">
            <Heading className="text-landing-ink">Statements &amp; Tables</Heading>
            <Link
              to="tables"
              className="inline-flex items-center gap-1 text-xs font-medium text-landing-ink-muted transition-colors hover:text-landing-ink"
            >
              <span>View all</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg bg-landing-card-inner" />
              ))}
            </div>
          ) : tables.length > 0 ? (
            <div className="divide-y divide-landing-canvas-border">
              {tables.slice(0, 6).map((t, idx) => (
                <Link
                  key={`${t.page_number}-${idx}`}
                  to={`tables?q=${encodeURIComponent(t.title || `page ${t.page_number}`)}`}
                  className="group flex items-center justify-between gap-3 px-5 py-3 text-xs transition-colors hover:bg-landing-card-inner/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-landing-ink">
                      {t.title || `Table on Page ${t.page_number}`}
                    </p>
                    <p className="mt-0.5 flex items-center gap-x-3 text-landing-ink-muted">
                      <span>Page <Num value={t.page_number} /></span>
                      <span><Num value={t.rows?.length ?? 0} /> rows</span>
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-3.5 shrink-0 text-landing-ink-muted opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-xs text-landing-ink-muted">
              No financial tables were identified in this document.
            </p>
          )}
        </SurfaceCard>
      </div>
    </div>
  )
}
