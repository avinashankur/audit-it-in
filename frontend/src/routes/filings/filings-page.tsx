import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  FileUp,
  Loader2,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import { SurfaceButton } from '@/components/app/action-buttons'
import { KpiCard } from '@/components/app/kpi-card'
import { Num } from '@/components/app/num'
import { SurfaceCard } from '@/components/app/surface-card'
import { PageHeading } from '@/components/app/typography'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCount, formatDate, formatKb, plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useSession } from '@/state/session'

export function Filings() {
  const {
    documents,
    samples,
    busy,
    job,
    ingestingName,
    error,
    loadSample,
    upload,
    remove,
    clearError,
  } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [loadingSample, setLoadingSample] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [docToDelete, setDocToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleLoadSample = async (val: string) => {
    setLoadingSample(val)
    try {
      await loadSample(val)
    } finally {
      setLoadingSample(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? documents.filter((d) => d.filename.toLowerCase().includes(q)) : documents
  }, [documents, query])

  const totals = useMemo(
    () =>
      documents.reduce(
        (a, d) => ({
          pages: a.pages + d.total_pages,
          metrics: a.metrics + d.metric_nodes_count,
          tables: a.tables + d.tables_count,
          edges: a.edges + d.causal_edges_count,
        }),
        { pages: 0, metrics: 0, tables: 0, edges: 0 },
      ),
    [documents],
  )

  const confirmDelete = async (docId: string) => {
    setDeleting(docId)
    await remove(docId)
    setDeleting(null)
  }

  const kpis = [
    {
      label: 'Filings',
      value: formatCount(documents.length),
      sub: 'in session',
      badge: documents.length > 0 ? 'Indexed' : 'Empty',
      positive: documents.length > 0,
    },
    {
      label: 'Pages Read',
      value: formatCount(totals.pages),
      sub: 'PDF pages parsed',
    },
    {
      label: 'Metrics Extracted',
      value: formatCount(totals.metrics),
      sub: `${formatCount(totals.edges)} causal edges`,
    },
    {
      label: 'Tables Found',
      value: formatCount(totals.tables),
      sub: 'structured statements',
    },
  ]

  const isUploading =
    busy && !loadingSample && Boolean(ingestingName) && !ingestingName?.endsWith('.pdf')

  return (
    <div className="space-y-4 text-landing-ink">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageHeading>Filings</PageHeading>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {samples.length > 0 && (
            <Select
              value=""
              disabled={busy || !!loadingSample}
              onValueChange={(val) => val && void handleLoadSample(val)}
            >
              <SelectTrigger
                className="shadow-landing-sunken h-9 w-56 max-w-full rounded-xl border-0 bg-transparent px-3 text-xs text-landing-ink shadow-none transition-shadow focus-visible:ring-1 focus-visible:ring-landing-ink-muted data-placeholder:text-landing-ink-muted sm:w-64"
                aria-label="Load sample filing"
              >
                {loadingSample || (busy && ingestingName) ? (
                  <div className="flex items-center gap-2 truncate font-medium text-landing-ink">
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-landing-ink-muted" />
                    <span className="truncate">
                      Loading {(loadingSample || ingestingName || 'sample').replace(/\.pdf$/i, '')}...
                    </span>
                  </div>
                ) : (
                  <SelectValue placeholder="Load sample filing" />
                )}
              </SelectTrigger>
              <SelectContent
                data-landing
                className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
              >
                {samples.map((s) => (
                  <SelectItem
                    key={s.name}
                    value={s.name}
                    title={s.name.replace(/\.pdf$/i, '')}
                    className="rounded-lg text-xs"
                  >
                    {s.name.replace(/\.pdf$/i, '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <input
            ref={fileRef}
            id="filing-upload"
            name="filing_upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void upload(f)
              if (fileRef.current) fileRef.current.value = ''
            }}
          />

          <SurfaceButton
            disabled={busy || !!loadingSample}
            onClick={() => fileRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FileUp className="size-3.5" aria-hidden="true" />
                <span>Upload filing</span>
              </>
            )}
          </SurfaceButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            sub={item.sub}
            badge={item.badge}
            positive={item.positive}
          />
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertTitle className="text-sm font-medium">Ingestion problem</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <span>{error}</span>
            <Button variant="ghost" size="sm" className="rounded-lg text-xs" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Ingestion Progress */}
      {(busy || !!loadingSample || (job && job.status === 'PROCESSING')) && (
        <SurfaceCard className="p-4">
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <Loader2 className="size-3.5 shrink-0 animate-spin text-landing-accent" aria-hidden="true" />
              <span className="truncate font-medium text-landing-ink">
                {loadingSample || ingestingName
                  ? `Loading sample filing: ${(loadingSample || ingestingName || '').replace(/\.pdf$/i, '')}`
                  : `Ingesting ${job?.filename ?? 'filing'}`}
              </span>
            </div>
            <span className="shrink-0 font-mono text-xs text-landing-ink-muted tabular-nums">
              {job?.stage ? `${job.stage} ${job.progress ?? 0}%` : 'Parsing tables and extracting metrics...'}
            </span>
          </div>
          <Progress
            value={job?.progress ?? 35}
            className="mt-3 h-1.5 rounded-full bg-landing-card-inner [&>div]:rounded-full [&>div]:bg-landing-accent [&>div]:transition-all [&>div]:duration-300"
          />
        </SurfaceCard>
      )}

      {/* Filings Library Card */}
      <SurfaceCard as="section" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-landing-canvas-border px-5 py-3.5">
          <p className="text-xs font-medium text-landing-ink-muted">
            {query
              ? `${formatCount(filtered.length)} of ${formatCount(documents.length)} match`
              : plural(documents.length, 'filing')}
          </p>

          <div className="shadow-landing-sunken flex h-9 w-full items-center gap-2 rounded-xl pr-1.5 pl-3 transition-shadow focus-within:ring-1 focus-within:ring-landing-ink-muted sm:w-64">
            <Search
              className="size-3.5 shrink-0 text-landing-ink-muted"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search filings"
              name="filing_search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filings"
              className="w-full min-w-0 bg-transparent text-xs text-landing-ink outline-none placeholder:text-landing-ink-muted"
            />
            <kbd
              aria-hidden="true"
              className="shadow-landing-kbd flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium text-landing-ink-muted"
            >
              /
            </kbd>
          </div>
        </div>

        {busy && !job ? (
          <div className="flex flex-col gap-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg bg-landing-card-inner" />
            ))}
          </div>
        ) : filtered.length ? (
          <Table>
            <TableHeader>
              <TableRow className="border-landing-canvas-border hover:bg-transparent">
                <TableHead className="pl-5 text-xs font-medium text-landing-ink-muted">
                  Filing
                </TableHead>
                <TableHead className="w-24 text-xs font-medium text-landing-ink-muted">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Pages
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Metrics
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Footnotes
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Edges
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Tables
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Size
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-landing-ink-muted">
                  Ingested
                </TableHead>
                <TableHead className="w-12 pr-5">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow
                  key={d.document_id}
                  className="border-landing-canvas-border transition-colors hover:bg-landing-card-inner/60"
                >
                  <TableCell className="max-w-64 truncate pl-5 font-medium text-landing-ink">
                    <Link
                      to={`/filings/${d.document_id}`}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <FileText
                        className="size-3.5 shrink-0 text-landing-ink-muted"
                        aria-hidden="true"
                      />
                      <span className="truncate">{d.filename}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full border-landing-canvas-border px-2.5 py-0.5 text-xs font-medium',
                        d.status === 'Ready'
                          ? 'border-transparent bg-landing-accent-soft text-landing-accent'
                          : 'bg-landing-card-inner text-landing-ink-muted',
                      )}
                    >
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num value={formatCount(d.total_pages)} />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num value={formatCount(d.metric_nodes_count)} />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num
                      value={formatCount(d.disclosure_nodes_count)}
                      muted={!d.disclosure_nodes_count}
                    />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num value={formatCount(d.causal_edges_count)} muted={!d.causal_edges_count} />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num value={formatCount(d.tables_count)} />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num value={formatKb(d.size_kb)} />
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Num value={formatDate(d.uploaded_at)} muted />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-lg text-landing-ink-muted hover:bg-landing-card-inner hover:text-landing-ink"
                          aria-label={`Actions for ${d.filename}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        data-landing
                        align="end"
                        className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild className="rounded-lg text-xs">
                            <Link to={`/filings/${d.document_id}`}>Open overview</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg text-xs">
                            <Link to={`/filings/${d.document_id}/graph`}>Open causal graph</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg text-xs">
                            <Link to={`/filings/${d.document_id}/tables`}>View tables</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg text-xs">
                            <Link to={`/filings/${d.document_id}/qa`}>Ask questions</Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-landing-canvas-border" />
                        <DropdownMenuItem
                          variant="destructive"
                          className="rounded-lg text-xs"
                          onSelect={() => setDocToDelete({ id: d.document_id, name: d.filename })}
                        >
                          Remove filing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty className="border-0 bg-transparent py-16">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="rounded-xl bg-landing-accent-soft text-landing-accent"
              >
                <FileText className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-sm font-medium text-landing-ink">
                {documents.length ? 'No filing matches that search' : 'Nothing ingested yet'}
              </EmptyTitle>
              <EmptyDescription className="text-xs text-landing-ink-muted">
                {documents.length
                  ? 'Clear the search to see every filing in this session.'
                  : 'Use the sample selector above or upload your own PDF to get started.'}
              </EmptyDescription>
              {!documents.length ? (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <SurfaceButton onClick={() => fileRef.current?.click()}>
                    <FileUp className="size-3.5" aria-hidden="true" />
                    <span>Upload filing</span>
                  </SurfaceButton>
                </div>
              ) : (
                <SurfaceButton className="mt-4" onClick={() => setQuery('')}>
                  Clear search
                </SurfaceButton>
              )}
            </EmptyHeader>
          </Empty>
        )}
      </SurfaceCard>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <DialogContent
          data-landing
          className="rounded-2xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-landing-ink">
              Remove filing?
            </DialogTitle>
            <DialogDescription className="text-xs text-landing-ink-muted">
              This will remove &ldquo;{docToDelete?.name}&rdquo; and all its extracted causal nodes,
              tables, and evidence from this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <SurfaceButton>Cancel</SurfaceButton>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              className="h-9 rounded-xl px-4 text-xs font-medium"
              disabled={deleting === docToDelete?.id}
              onClick={async () => {
                if (docToDelete) {
                  await confirmDelete(docToDelete.id)
                  setDocToDelete(null)
                }
              }}
            >
              {deleting === docToDelete?.id ? 'Removing...' : 'Confirm removal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
