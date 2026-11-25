import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ChevronDown, Plus, Send, Sparkles } from 'lucide-react'
import { api } from '@/api/client'
import { SurfaceButton } from '@/components/app/action-buttons'
import { FlowChain } from '@/components/app/inverse-panel'
import { Num } from '@/components/app/num'
import { SurfaceCard } from '@/components/app/surface-card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { cleanName } from '@/features/graph/nodes'
import { formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useSession } from '@/state/session'
import type { AuditCitation, CausalGraphPath } from '@/types'

interface Turn {
  id: string
  question: string
  answer: string
  chain: string[]
  citations: AuditCitation[]
  at: string
  pending?: boolean
  error?: string
  provider?: string
  latencyMs?: number
}

const STARTERS = [
  'What drove the change in operating income?',
  'Trace the factors behind gross margin.',
  'Summarize the liquidity footnotes.',
]

function formatInline(text: string): ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  const parts = text.split(regex)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-landing-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-landing-ink-muted">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded-md bg-landing-card-inner px-1.5 py-0.5 font-mono text-xs text-landing-ink"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function MarkdownAnswer({ content }: { content: string }) {
  if (!content) return null
  const rawBlocks = content.split(/\n\s*\n/)

  return (
    <div className="space-y-3 text-sm leading-relaxed text-landing-ink">
      {rawBlocks.map((block, idx) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        const lines = trimmed.split('\n')
        const isBulletList = lines.every((l) => /^\s*[-*•]\s+/.test(l))
        const isNumberedList = lines.every((l) => /^\s*\d+\.\s+/.test(l))

        if (isBulletList) {
          return (
            <ul key={idx} className="my-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {lines.map((l, liIdx) => (
                <li key={liIdx}>{formatInline(l.replace(/^\s*[-*•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }

        if (isNumberedList) {
          return (
            <ol key={idx} className="my-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
              {lines.map((l, liIdx) => (
                <li key={liIdx}>{formatInline(l.replace(/^\s*\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          )
        }

        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#+\s*/, '')
          return (
            <h4
              key={idx}
              className="pt-2 text-xs font-semibold tracking-wider text-landing-ink-muted uppercase"
            >
              {formatInline(headingText)}
            </h4>
          )
        }

        if (trimmed.startsWith('> ') || trimmed.startsWith('*(Note:')) {
          return (
            <div
              key={idx}
              className="my-2 rounded-lg border-l-2 border-landing-accent bg-landing-card-inner px-3 py-2 text-xs text-landing-ink-muted"
            >
              {lines.map((l, lIdx) => (
                <p key={lIdx} className={lIdx > 0 ? 'mt-1' : ''}>
                  {formatInline(l.replace(/^>\s*/, ''))}
                </p>
              ))}
            </div>
          )
        }

        return (
          <p key={idx} className="leading-relaxed">
            {lines.map((l, lIdx) => (
              <span key={lIdx}>
                {lIdx > 0 && <br />}
                {formatInline(l)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'Failed to fetch') {
      return 'Could not reach the reasoning engine. Check that the backend API is running.'
    }
    return err.message
  }
  return 'The reasoning engine could not be reached.'
}

export function FilingQA() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { settings } = useSession()
  const [turns, setTurns] = useState<Turn[]>([])
  const [query, setQuery] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const queryParamProcessed = useRef(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [turns])

  useEffect(() => () => abort.current?.abort(), [id])

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || !id || streaming) return
    abort.current?.abort()
    const c = new AbortController()
    abort.current = c
    setQuery('')

    const turnId = `t${Date.now()}`
    setTurns((prev) => [
      ...prev,
      { id: turnId, question: q, answer: '', chain: [], citations: [], at: formatTime(), pending: true },
    ])
    setStreaming(true)

    const patch = (fn: (t: Turn) => Turn) =>
      setTurns((prev) => prev.map((t) => (t.id === turnId ? fn(t) : t)))

    const pathsToChain = (paths: CausalGraphPath[]) => paths[0]?.node_sequence ?? []

    try {
      await api.streamQuery(
        id,
        { query_text: q },
        (token) => !c.signal.aborted && patch((t) => ({ ...t, answer: t.answer + token })),
        (citations) => !c.signal.aborted && patch((t) => ({ ...t, citations })),
        (paths) => !c.signal.aborted && patch((t) => ({ ...t, chain: pathsToChain(paths) })),
        (info) => {
          if (c.signal.aborted) return
          const rawLat = info?.latency_ms
          const latency =
            typeof rawLat === 'number'
              ? rawLat
              : typeof rawLat === 'object' && rawLat !== null && 'total' in rawLat
              ? (rawLat as Record<string, number>).total
              : undefined
          patch((t) => ({
            ...t,
            pending: false,
            provider: info?.model_provider ?? settings.provider,
            latencyMs: latency,
          }))
        },
        c.signal,
      )
    } catch (err) {
      if (err instanceof Error && (err.name === 'AbortError' || c.signal.aborted)) return
      patch((t) => ({ ...t, pending: false, error: friendlyError(err) }))
    } finally {
      if (!c.signal.aborted) {
        patch((t) => (t.pending ? { ...t, pending: false } : t))
        setStreaming(false)
      }
    }
  }

  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam && !queryParamProcessed.current && !streaming) {
      queryParamProcessed.current = true
      void ask(qParam)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams])

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {turns.length === 0 && (
        <SurfaceCard className="overflow-hidden">
          <div className="px-5 py-4">
            <p className="text-xs leading-relaxed text-landing-ink-muted">
              Ask a question about this filing. Every answer is grounded in the document with
              exact page citations.
              {settings.provider === 'Offline Grounded' &&
                ' Running in Offline Grounded mode with no API key required.'}
            </p>
          </div>

          <div className="divide-y divide-landing-canvas-border border-t border-landing-canvas-border">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left text-xs font-medium text-landing-ink transition-colors hover:bg-landing-card-inner/60"
              >
                <span>{s}</span>
                <Plus className="size-3.5 shrink-0 text-landing-ink-muted" aria-hidden="true" />
              </button>
            ))}
          </div>
        </SurfaceCard>
      )}

      {turns.map((t) => (
        <article key={t.id} className="space-y-4">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="shadow-landing-sunken max-w-xl rounded-2xl px-4 py-2.5 text-sm font-medium text-landing-ink">
              {t.question}
            </div>
          </div>

          {/* Assistant Response */}
          <div className="space-y-3 pl-1">
            {t.error ? (
              <p className="text-xs text-destructive">{t.error}</p>
            ) : t.answer ? (
              <MarkdownAnswer content={t.answer} />
            ) : t.pending ? (
              <div className="space-y-2 py-1">
                <p className="text-xs text-landing-ink-muted">
                  Searching filing and synthesizing answer...
                </p>
                <Skeleton className="h-3.5 w-full rounded-lg bg-landing-card" />
                <Skeleton className="h-3.5 w-5/6 rounded-lg bg-landing-card" />
                <Skeleton className="h-3.5 w-2/3 rounded-lg bg-landing-card" />
              </div>
            ) : (
              <p className="text-xs text-landing-ink-muted">
                No matching evidence was found for this query.
              </p>
            )}

            {t.chain.length > 0 && (
              <div className="pt-1">
                <p className="mb-2 text-xs font-medium text-landing-ink-muted">Causal chain</p>
                <FlowChain steps={t.chain.map(cleanName)} />
              </div>
            )}

            {t.citations.length > 0 && (
              <Collapsible className="pt-1">
                <CollapsibleTrigger className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-landing-ink-muted transition-colors hover:text-landing-ink [&[data-state=open]>svg]:rotate-180">
                  <span>Source evidence ({t.citations.length})</span>
                  <ChevronDown className="size-3.5 transition-transform" aria-hidden="true" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 divide-y divide-landing-canvas-border rounded-xl border border-landing-canvas-border bg-landing-card px-3.5">
                    {t.citations.map((c) => (
                      <li
                        key={c.citation_id ?? `${c.page_number}-${c.snippet.slice(0, 8)}`}
                        className="flex items-center justify-between gap-4 py-2.5 text-xs"
                      >
                        <span
                          className="min-w-0 flex-1 truncate text-landing-ink"
                          title={c.snippet}
                        >
                          {c.snippet.slice(0, 160)}
                        </span>
                        <Badge
                          variant="outline"
                          className="shrink-0 rounded-full border-landing-canvas-border px-2 py-0.5 font-mono text-xs text-landing-ink-muted"
                        >
                          p. {c.page_number}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-landing-ink-muted">
              <Num value={t.at} />
              <span className={cn(t.provider === 'Gemini' && 'font-medium text-landing-accent')}>
                {t.provider ?? settings.provider}
              </span>
              {t.latencyMs != null && <Num value={`${Math.round(t.latencyMs)}ms`} />}
            </div>
          </div>
        </article>
      ))}

      <div ref={endRef} />

      {/* Sticky Composer */}
      <div className="sticky bottom-2 z-10 pt-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void ask(query)
          }}
        >
          <label htmlFor="audit-query" className="sr-only">
            Ask about a balance, a change, or a cause
          </label>
          <div className="shadow-landing-sunken flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3.5 transition-shadow focus-within:ring-1 focus-within:ring-landing-ink-muted">
            <Sparkles className="size-3.5 shrink-0 text-landing-accent" aria-hidden="true" />
            <input
              id="audit-query"
              name="audit_query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about a balance, a change, or a cause"
              disabled={streaming}
              className="w-full min-w-0 bg-transparent text-xs text-landing-ink outline-none placeholder:text-landing-ink-muted disabled:opacity-50"
            />
          </div>
          <SurfaceButton
            type="submit"
            className="h-11 px-4"
            disabled={!query.trim() || streaming}
          >
            <Send className="size-3.5" aria-hidden="true" />
            <span>{streaming ? 'Answering...' : 'Ask'}</span>
          </SurfaceButton>
        </form>
      </div>
    </div>
  )
}
