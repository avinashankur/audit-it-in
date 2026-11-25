import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/api/client";
import { SurfaceButton } from "@/components/app/action-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCount, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSession } from "@/state/session";
import type { GraphResponseDto } from "@/types";

const AREA_CONFIG = {
  value: {
    label: "Balance",
    color: "var(--landing-ink)",
  },
} satisfies ChartConfig;

const BAR_CONFIG = {
  metrics: {
    label: "Metrics",
    color: "var(--landing-ink)",
  },
  edges: {
    label: "Edges",
    color: "var(--landing-ink-muted)",
  },
} satisfies ChartConfig;

export function Overview() {
  const { documents, health, settings } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lead =
    documents.find((d) => d.document_id === selectedId) ?? documents[0];
  const [graph, setGraph] = useState<GraphResponseDto | null>(null);

  useEffect(() => {
    if (!lead) return setGraph(null);
    const c = new AbortController();
    api
      .getDocumentGraph(lead.document_id, undefined, 1, c.signal)
      .then(setGraph)
      .catch(
        (err) => err?.name !== "AbortError" && console.error("balances", err),
      );
    return () => c.abort();
  }, [lead?.document_id]);

  const totals = useMemo(
    () =>
      documents.reduce(
        (a, d) => ({
          metrics: a.metrics + d.metric_nodes_count,
          footnotes: a.footnotes + d.disclosure_nodes_count,
          edges: a.edges + d.causal_edges_count,
        }),
        { metrics: 0, footnotes: 0, edges: 0 },
      ),
    [documents],
  );

  const balances = useMemo(
    () =>
      (graph?.nodes ?? [])
        .filter((n) => n.type === "metricNode" && n.data.value != null)
        .sort((a, b) => (b.data.value ?? 0) - (a.data.value ?? 0))
        .slice(0, 7)
        .map((n) => ({
          label: n.data.name.replace(/\s[\d,\s]{4,}$/, ""),
          value: n.data.value ?? 0,
          display: n.data.formatted_value?.replace(/\$/g, "") ?? "",
        })),
    [graph],
  );

  const filingBars = useMemo(
    () =>
      documents.slice(0, 6).map((d) => ({
        name: d.filename.replace(/\.pdf$/i, "").slice(0, 12),
        metrics: d.metric_nodes_count,
        edges: d.causal_edges_count,
      })),
    [documents],
  );

  const top = balances[0];

  const kpis = [
    {
      label: "Filings",
      value: formatCount(documents.length),
      sub: "indexed in session",
      badge: health ? "Ready" : "Offline",
      positive: Boolean(health),
    },
    {
      label: "Metrics",
      value: formatCount(totals.metrics),
      sub: `${formatCount(totals.footnotes)} footnotes linked`,
      badge: lead ? "Extracted" : "Idle",
      positive: totals.metrics > 0,
    },
    {
      label: "Causal Edges",
      value: formatCount(totals.edges),
      sub: totals.edges === 0 ? "Add key in Settings" : "cause-to-effect links",
      badge: totals.edges > 0 ? "Active" : "0 links",
      positive: totals.edges > 0,
    },
  ];

  return (
    <div className="space-y-4 text-landing-ink">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight text-landing-ink sm:text-xl">
          Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {documents.length > 1 && (
            <Select
              value={lead?.document_id}
              onValueChange={(id) => setSelectedId(id)}
            >
              <SelectTrigger
                className="h-8 w-56 max-w-full rounded-lg border-landing-canvas-border bg-landing-card px-3 text-xs text-landing-ink sm:w-64"
                aria-label="Select filing for overview"
              >
                <SelectValue placeholder="Select filing" />
              </SelectTrigger>
              <SelectContent
                data-landing
                className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
              >
                {documents.map((d) => (
                  <SelectItem
                    key={d.document_id}
                    value={d.document_id}
                    title={d.filename.replace(/\.pdf$/i, "")}
                    className="rounded-lg text-xs"
                  >
                    {d.filename.replace(/\.pdf$/i, "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {lead && (
            <SurfaceButton asChild>
              <Link to={`/filings/${lead.document_id}/graph`}>
                Causal graph
              </Link>
            </SurfaceButton>
          )}

          <SurfaceButton asChild>
            <Link to="/filings">Filings</Link>
          </SurfaceButton>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-landing-canvas-border bg-landing-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-landing-ink-muted">
                {item.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center text-[11px] leading-none font-medium",
                  item.positive
                    ? "text-landing-ink"
                    : "text-landing-ink-muted",
                )}
              >
                {item.badge}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-landing-ink tabular-nums">
                {item.value}
              </span>
              <span className="truncate text-xs text-landing-ink-muted">
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row: Top Balances & Filing Coverage */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-landing-canvas-border bg-landing-card p-5 lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-landing-ink-muted">
                {lead
                  ? `Top balances in ${lead.filename.replace(/\.pdf$/i, "")}`
                  : "Top balances"}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-landing-ink tabular-nums">
                {lead && top ? top.display : "0"}
              </p>
            </div>
            {lead && top && (
              <span className="inline-flex items-center text-[11px] leading-none font-medium text-landing-ink-muted">
                {top.label}
              </span>
            )}
          </div>

          {balances.length ? (
            <ChartContainer config={AREA_CONFIG} className="mt-4 aspect-auto h-52 w-full">
              <AreaChart
                data={balances}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--landing-ink)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--landing-ink)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--landing-canvas-border)"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--landing-ink)"
                  strokeWidth={1.75}
                  fill="url(#balanceFill)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <Empty className="mt-4 h-48 border-0 bg-transparent p-0">
              <EmptyHeader>
                <EmptyTitle className="text-sm text-landing-ink">
                  No balances extracted yet
                </EmptyTitle>
                <EmptyDescription className="text-xs text-landing-ink-muted">
                  Load a filing from the library to plot its extracted balance
                  sheet and income metrics.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>

        <section className="flex flex-col justify-between rounded-xl border border-landing-canvas-border bg-landing-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-landing-ink">
                Filing Coverage
              </p>
            </div>
            <Link
              to="/filings"
              className="text-xs font-medium text-landing-ink-muted transition-colors hover:text-landing-ink"
            >
              View all
            </Link>
          </div>

          {filingBars.length ? (
            <ChartContainer config={BAR_CONFIG} className="mt-4 aspect-auto h-52 w-full">
              <BarChart
                data={filingBars}
                barSize={18}
                barGap={6}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--landing-canvas-border)"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="metrics"
                  fill="var(--landing-ink)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="edges"
                  fill="var(--landing-ink-muted)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <Empty className="mt-4 h-48 border-0 bg-transparent p-0">
              <EmptyHeader>
                <EmptyTitle className="text-sm text-landing-ink">No filings indexed</EmptyTitle>
                <EmptyDescription className="text-xs text-landing-ink-muted">
                  Upload a PDF in the filings library to compare extracted
                  coverage.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>

      {/* Runtime & Configuration Strip */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-landing-canvas-border bg-landing-card px-5 py-3.5 text-xs">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-landing-ink-muted">
          {[
            ["Adapter", health?.backends_available?.join(", ") ?? "None"],
            ["Reasoning", settings.provider],
            ...(lead ? [["Updated", formatDate(lead.uploaded_at)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="inline-flex items-center gap-1.5">
              <dt>{k}:</dt>
              <dd className="font-medium text-landing-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <Link
          to="/settings"
          className="font-medium text-landing-ink-muted transition-colors hover:text-landing-ink"
        >
          Configure
        </Link>
      </section>

      {health === null && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription className="text-xs">
            The engine could not be reached. Check that the API is running
            before loading filings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
