import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FileSpreadsheet, Search } from 'lucide-react'
import { api } from '@/api/client'
import { Num } from '@/components/app/num'
import { SurfaceCard } from '@/components/app/surface-card'
import { Heading } from '@/components/app/typography'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { EMPTY, formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TableData } from '@/types'

const FIGURE = /^[+\-−(]?[$€£]?\s?\d[\d,.\s%)]*$/
const DASH = /^[-–—]$/

const isFigureColumn = (cells: string[]) => {
  const values = cells.map((c) => (c ?? '').trim()).filter((c) => c !== '' && !DASH.test(c))
  return values.length > 0 && values.every((c) => FIGURE.test(c))
}

export function FilingTables() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    if (!id) return
    let mounted = true
    setLoading(true)
    setFailed(false)
    api
      .getDocumentTables(id)
      .then((res) => mounted && setTables(res ?? []))
      .catch((err) => {
        console.error('tables', err)
        if (mounted) setFailed(true)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [id])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tables
    return tables.filter(
      (t) =>
        (t.title ?? '').toLowerCase().includes(q) ||
        (t.headers ?? []).some((h) => h.toLowerCase().includes(q)) ||
        `page ${t.page_number}`.includes(q),
    )
  }, [tables, query])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <SurfaceCard key={i} className="p-5">
            <Skeleton className="h-5 w-1/2 rounded-lg bg-landing-card-inner" />
            <Skeleton className="mt-2 h-4 w-1/4 rounded-lg bg-landing-card-inner" />
            <div className="mt-4 flex flex-col gap-2">
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-8 w-full rounded-lg bg-landing-card-inner" />
              ))}
            </div>
          </SurfaceCard>
        ))}
      </div>
    )
  }

  if (failed) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertTitle className="text-sm font-medium">Tables unavailable</AlertTitle>
        <AlertDescription className="text-xs">
          The extracted tables could not be read. Re-open this filing from the library.
        </AlertDescription>
      </Alert>
    )
  }

  if (!tables.length) {
    return (
      <SurfaceCard className="p-6">
        <Empty className="border-0 bg-transparent py-12">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="rounded-xl bg-landing-accent-soft text-landing-accent"
            >
              <FileSpreadsheet className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-sm font-medium text-landing-ink">
              No structured tables found
            </EmptyTitle>
            <EmptyDescription className="text-xs text-landing-ink-muted">
              This filing had no tabular regions the extractor could read. The causal graph and
              grounded questions still work on its narrative text.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SurfaceCard>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-landing-ink-muted">
          {query
            ? `${formatCount(filtered.length)} of ${formatCount(tables.length)} tables`
            : `${formatCount(tables.length)} ${tables.length === 1 ? 'table' : 'tables'}`}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {tables.length > 1 && (
            <Select onValueChange={(val) => setQuery(val === 'all' ? '' : val)}>
              <SelectTrigger
                className="shadow-landing-sunken h-9 w-56 rounded-xl border-0 bg-transparent px-3 text-xs text-landing-ink shadow-none transition-shadow focus-visible:ring-1 focus-visible:ring-landing-ink-muted data-placeholder:text-landing-ink-muted"
                aria-label="Jump to table"
              >
                <SelectValue placeholder="Jump to table..." />
              </SelectTrigger>
              <SelectContent
                data-landing
                className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
              >
                <SelectItem value="all" className="rounded-lg text-xs">
                  All tables
                </SelectItem>
                {tables.map((t, idx) => (
                  <SelectItem
                    key={t.table_id ?? idx}
                    value={t.title?.trim() || `Table ${idx + 1}`}
                    className="rounded-lg text-xs"
                  >
                    {t.title?.trim() || `Table ${idx + 1}`} (p. {t.page_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="shadow-landing-sunken flex h-9 w-56 items-center gap-2 rounded-xl px-3 transition-shadow focus-within:ring-1 focus-within:ring-landing-ink-muted">
            <Search className="size-3.5 shrink-0 text-landing-ink-muted" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search tables"
              name="table_search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tables"
              className="w-full min-w-0 bg-transparent text-xs text-landing-ink outline-none placeholder:text-landing-ink-muted"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((t, i) => (
          <ExtractedTable key={t.table_id ?? i} table={t} index={i} />
        ))}
        {!filtered.length && (
          <SurfaceCard className="p-6 text-center text-xs text-landing-ink-muted">
            No table matches &ldquo;{query}&rdquo;.
          </SurfaceCard>
        )}
      </div>
    </div>
  )
}

function ExtractedTable({ table, index }: { table: TableData; index: number }) {
  const headers = table.headers ?? []
  const rows = table.rows ?? []
  const numeric = headers.map((_, c) => isFigureColumn(rows.map((r) => (r ?? [])[c] ?? '')))
  const title = table.title?.trim() || `Table ${index + 1}`

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-landing-canvas-border px-5 py-4">
        <Heading className="text-landing-ink">{title}</Heading>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-landing-canvas-border bg-landing-card-inner px-2.5 py-0.5 text-xs font-medium text-landing-ink-muted"
          >
            Page {table.page_number}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-landing-canvas-border bg-landing-card-inner px-2.5 py-0.5 text-xs font-medium text-landing-ink-muted"
          >
            {formatCount(headers.length)} columns
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-landing-canvas-border bg-landing-card-inner px-2.5 py-0.5 text-xs font-medium text-landing-ink-muted"
          >
            {formatCount(rows.length)} rows
          </Badge>
        </div>
      </div>

      {rows.length ? (
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-landing-canvas-border hover:bg-transparent">
                {headers.map((h, c) => (
                  <TableHead
                    key={c}
                    className={cn(
                      'max-w-64 truncate text-xs font-medium text-landing-ink-muted first:pl-5 last:pr-5',
                      numeric[c] && 'text-right',
                    )}
                    title={h}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, r) => (
                <TableRow
                  key={r}
                  className="border-landing-canvas-border transition-colors hover:bg-landing-card-inner/60"
                >
                  {(row ?? []).map((cell, c) => (
                    <TableCell
                      key={c}
                      className={cn(
                        'max-w-80 truncate text-xs text-landing-ink first:pl-5 last:pr-5',
                        c === 0 && 'font-medium',
                        numeric[c] && 'text-right',
                      )}
                      title={cell}
                    >
                      {numeric[c] ? (
                        <Num value={cell?.trim() ? cell : EMPTY} />
                      ) : cell?.trim() ? (
                        cell
                      ) : (
                        <span className="text-landing-ink-muted">{EMPTY}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <p className="px-5 py-4 text-xs text-landing-ink-muted">
          The header was recognised but no rows came back.
        </p>
      )}
    </SurfaceCard>
  )
}
