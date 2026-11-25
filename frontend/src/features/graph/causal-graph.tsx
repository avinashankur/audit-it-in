import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Lock, Maximize2, Minimize2, Minus, Move, Plus, RotateCcw, Scan, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import dagre from '@dagrejs/dagre'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useReactFlow,
  useViewport,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { MetricNode, DisclosureNode, cleanName, type AuditNodeData } from './nodes'
import { Num } from '@/components/app/num'
import { SurfaceCard } from '@/components/app/surface-card'
import { Caption, Heading } from '@/components/app/typography'
import { EMPTY } from '@/lib/format'
import type { GraphResponseDto, SubgraphResponseDto } from '@/types'

const nodeTypes = { metricNode: MetricNode, disclosureNode: DisclosureNode }

const NODE_W = 224
const NODE_H = 40

type Direction = 'causes' | 'both' | 'effects'

function reachable(selected: string, edges: { source: string; target: string }[], hops: number, dir: Direction) {
  const seen = new Set([selected])
  let frontier = [selected]
  for (let h = 0; h < hops; h++) {
    const next: string[] = []
    for (const e of edges) {
      if (dir !== 'causes' && frontier.includes(e.source) && !seen.has(e.target)) {
        seen.add(e.target)
        next.push(e.target)
      }
      if (dir !== 'effects' && frontier.includes(e.target) && !seen.has(e.source)) {
        seen.add(e.source)
        next.push(e.source)
      }
    }
    frontier = next
    if (!frontier.length) break
  }
  return seen
}

function layout(nodes: Node[], edges: Edge[]): Node[] {
  if (!edges.length) {
    const cols = 3
    return nodes.map((n, i) => ({
      ...n,
      position: { x: (i % cols) * (NODE_W + 40), y: Math.floor(i / cols) * (NODE_H + 26) },
    }))
  }
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 26, ranksep: 96 })
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  edges.forEach((e) => g.setEdge(e.source, e.target))
  dagre.layout(g)
  return nodes.map((n) => {
    const p = g.node(n.id)
    return { ...n, position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 } }
  })
}

function OnScreenControls({
  isDraggable,
  onToggleDraggable,
}: {
  isDraggable: boolean
  onToggleDraggable: () => void
}) {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow()
  const { zoom } = useViewport()

  return (
    <div
      role="toolbar"
      aria-label="Canvas zoom and view controls"
      className="shadow-landing-card absolute bottom-4 left-4 z-20 flex flex-col overflow-hidden rounded-xl text-landing-ink select-none"
    >
      <div className="flex h-7 items-center justify-center border-b border-landing-canvas-border px-1.5 font-mono text-xs text-landing-ink-muted tabular-nums">
        {Math.round(zoom * 100)}%
      </div>
      <button
        type="button"
        onClick={() => zoomIn({ duration: 150 })}
        title="Zoom in (+)"
        aria-label="Zoom in"
        className="flex size-8 cursor-pointer items-center justify-center border-b border-landing-canvas-border transition-colors hover:bg-landing-card-inner"
      >
        <Plus className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut({ duration: 150 })}
        title="Zoom out (-)"
        aria-label="Zoom out"
        className="flex size-8 cursor-pointer items-center justify-center border-b border-landing-canvas-border transition-colors hover:bg-landing-card-inner"
      >
        <Minus className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => fitView({ padding: 0.18, duration: 250 })}
        title="Fit all nodes into view"
        aria-label="Fit all nodes"
        className="flex size-8 cursor-pointer items-center justify-center border-b border-landing-canvas-border transition-colors hover:bg-landing-card-inner"
      >
        <Scan className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => zoomTo(1, { duration: 200 })}
        title="Reset zoom to 100%"
        aria-label="Reset zoom"
        className="flex size-8 cursor-pointer items-center justify-center border-b border-landing-canvas-border transition-colors hover:bg-landing-card-inner"
      >
        <RotateCcw className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onToggleDraggable}
        title={isDraggable ? 'Lock node positions' : 'Enable node dragging'}
        aria-label={isDraggable ? 'Lock node positions' : 'Enable node dragging'}
        aria-pressed={isDraggable}
        className={cn(
          'flex size-8 cursor-pointer items-center justify-center transition-colors hover:bg-landing-card-inner',
          isDraggable && 'bg-landing-card-inner text-landing-accent',
        )}
      >
        {isDraggable ? <Move className="size-3.5" /> : <Lock className="size-3.5" />}
      </button>
    </div>
  )
}

export function CausalGraph({
  graph,
  subgraph,
  onSelect,
  showFootnotes,
  hops,
  onHops,
}: {
  graph: GraphResponseDto | null
  subgraph: SubgraphResponseDto | null
  onSelect: (id: string | null) => void
  showFootnotes: boolean
  hops: number
  onHops: (h: number) => void
}) {
  const [query, setQuery] = useState('')
  const [direction, setDirection] = useState<Direction>('both')
  const [selected, setSelected] = useState<string | null>(null)
  const [isDraggable, setIsDraggable] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFullscreen, setIsFullscreen] = useState(() => searchParams.get('fullscreen') === '1')

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev
      setSearchParams(
        (sp) => {
          const n = new URLSearchParams(sp)
          if (next) n.set('fullscreen', '1')
          else n.delete('fullscreen')
          return n
        },
        { replace: true }
      )
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 50)
      return next
    })
  }

  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        setSearchParams(
          (sp) => {
            const n = new URLSearchParams(sp)
            n.delete('fullscreen')
            return n
          },
          { replace: true }
        )
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'))
        }, 50)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, setSearchParams])

  useEffect(() => {
    if (!isFullscreen) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origOverflow
    }
  }, [isFullscreen])

  const apiEdges = graph?.edges ?? []
  const apiNodes = graph?.nodes ?? []
  const hasRelations = apiEdges.length > 0

  const visible = useMemo(() => {
    let nodes = graph?.nodes ?? []
    if (!showFootnotes) nodes = nodes.filter((n) => n.type !== 'disclosureNode')
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      nodes = nodes.filter((n) => n.label.toLowerCase().includes(q))
    }
    return nodes
  }, [graph, showFootnotes, query])

  const focus = selected ?? subgraph?.root_node_id ?? null
  const lit = useMemo(
    () => (focus && hasRelations ? reachable(focus, apiEdges, hops, direction) : null),
    [focus, hasRelations, apiEdges, hops, direction],
  )

  const baseLayoutNodes = useMemo(() => {
    return layout(
      visible.map((n) => ({
        id: n.id,
        type: n.type,
        data: { ...n.data } as AuditNodeData,
        position: { x: 0, y: 0 },
      })),
      apiEdges,
    )
  }, [visible, apiEdges])

  const initialNodes: Node[] = useMemo(() => {
    return baseLayoutNodes.map((base) => {
      const isLit = lit ? lit.has(base.id) : true
      return {
        ...base,
        selected: base.id === focus,
        data: {
          ...base.data,
          dimmed: !isLit,
        },
      }
    })
  }, [baseLayoutNodes, lit, focus])

  const initialEdges: Edge[] = useMemo(
    () =>
      apiEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'default',
        label: undefined,
        style: {
          stroke: lit && lit.has(e.source) && lit.has(e.target) ? 'var(--landing-accent)' : 'var(--landing-ink-muted)',
          strokeWidth: lit && lit.has(e.source) && lit.has(e.target) ? 1.75 : 1.1,
          opacity: lit && !(lit.has(e.source) && lit.has(e.target)) ? 0.14 : 0.75,
        },
      })),
    [apiEdges, lit],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  useEffect(() => {
    setNodes((currentNodes) => {
      const currentPosMap = new Map(currentNodes.map((n) => [n.id, n.position]))
      return baseLayoutNodes.map((base) => {
        const pos = currentPosMap.get(base.id) ?? base.position
        const isLit = lit ? lit.has(base.id) : true
        return {
          ...base,
          position: pos,
          selected: base.id === focus,
          data: {
            ...base.data,
            dimmed: !isLit,
          },
        }
      })
    })
  }, [baseLayoutNodes, lit, focus, setNodes])

  const pick: NodeMouseHandler = (_, n) => {
    setSelected(n.id)
    onSelect(n.id)
  }

  const node = apiNodes.find((n) => n.id === focus)

  return (
    <SurfaceCard
      className={cn(
        'flex flex-col overflow-hidden lg:flex-row',
        isFullscreen && 'fixed inset-0 z-50 h-screen w-screen rounded-none bg-landing-canvas',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-landing-canvas-border px-4 py-3">
          <div className="shadow-landing-sunken flex h-8 w-52 items-center gap-2 rounded-xl px-3 transition-shadow focus-within:ring-1 focus-within:ring-landing-ink-muted">
            <Search className="size-3.5 shrink-0 text-landing-ink-muted" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search nodes"
              name="node_search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes"
              className="w-full min-w-0 bg-transparent text-xs text-landing-ink outline-none placeholder:text-landing-ink-muted"
            />
          </div>
          <Select value={direction} onValueChange={(v) => v && setDirection(v as Direction)}>
            <SelectTrigger
              className="shadow-landing-sunken h-8 w-32 rounded-xl border-0 bg-transparent px-3 text-xs text-landing-ink shadow-none transition-shadow focus-visible:ring-1 focus-visible:ring-landing-ink-muted"
              aria-label="Traversal direction"
            >
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent
              data-landing
              className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
            >
              <SelectItem value="causes" className="rounded-lg text-xs">Causes</SelectItem>
              <SelectItem value="both" className="rounded-lg text-xs">Both</SelectItem>
              <SelectItem value="effects" className="rounded-lg text-xs">Effects</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(hops)} onValueChange={(v) => v && onHops(Number(v))}>
            <SelectTrigger
              className="shadow-landing-sunken h-8 w-28 rounded-xl border-0 bg-transparent px-3 text-xs text-landing-ink shadow-none transition-shadow focus-visible:ring-1 focus-visible:ring-landing-ink-muted"
              aria-label="Hop depth"
            >
              <SelectValue placeholder="Hops" />
            </SelectTrigger>
            <SelectContent
              data-landing
              className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
            >
              {[1, 2, 3].map((h) => (
                <SelectItem key={h} value={String(h)} className="rounded-lg text-xs">
                  {h} hop{h > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-2">
            {focus && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl px-2.5 text-xs text-landing-ink-muted hover:bg-landing-card-inner hover:text-landing-ink"
                onClick={() => {
                  setSelected(null)
                  onSelect(null)
                }}
              >
                Clear focus
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit full screen (Esc)' : 'Full screen'}
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
              className={cn(
                'h-8 gap-1.5 rounded-xl px-2.5 text-xs transition-all',
                isFullscreen
                  ? 'shadow-landing-raised text-landing-ink'
                  : 'text-landing-ink-muted hover:bg-landing-card-inner hover:text-landing-ink',
              )}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="size-3.5" />
                  <span className="hidden sm:inline">Exit (Esc)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="size-3.5" />
                  <span className="hidden sm:inline">Full screen</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {!hasRelations && visible.length > 0 && (
          <p className="border-b border-landing-canvas-border px-4 py-2 text-xs text-landing-ink-muted">
            No causal edges built for this filing yet, so the {visible.length} nodes sit unconnected
            and traversal has nothing to follow.
          </p>
        )}

        <div className={cn('relative min-w-0', isFullscreen ? 'flex-1' : 'h-96')}>
          <ReactFlow
            key={graph?.document_id ?? 'causal-graph'}
            nodes={nodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            onNodesChange={isDraggable ? onNodesChange : undefined}
            onNodeClick={pick}
            nodesDraggable={isDraggable}
            nodesConnectable={false}
            elementsSelectable={false}
            onPaneClick={() => {
              setSelected(null)
              onSelect(null)
            }}
            fitView
            fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
            minZoom={0.05}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'var(--landing-canvas)' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--landing-canvas-border)" />
            <OnScreenControls
              isDraggable={isDraggable}
              onToggleDraggable={() => setIsDraggable((d) => !d)}
            />
          </ReactFlow>
          {visible.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs text-landing-ink-muted">
              No nodes match. Clear the search or turn footnote nodes back on.
            </p>
          )}
        </div>
      </div>

      <aside
        className={cn(
          'w-full min-w-0 shrink-0 border-t border-landing-canvas-border p-5 lg:w-80 lg:border-t-0 lg:border-l',
          isFullscreen && 'overflow-y-auto lg:h-full lg:w-96',
        )}
      >
        {node ? (
          <>
            <Caption className="text-landing-ink-muted">Evidence</Caption>
            <Heading className="mt-2 text-base font-semibold text-landing-ink">
              {node.type === 'metricNode' ? cleanName(node.data.name) : node.data.name}
            </Heading>
            {node.data.formatted_value && (
              <p className="mt-2 font-mono text-lg font-semibold text-landing-ink tabular-nums">
                {node.data.formatted_value.replace(/\$/g, '')}
              </p>
            )}
            <blockquote className="mt-3 rounded-xl bg-landing-card-inner p-3.5 text-xs leading-relaxed text-landing-ink-muted">
              {node.data.snippet || node.data.raw_text || node.data.summary || 'No excerpt recorded.'}
            </blockquote>

            <Separator className="my-4 bg-landing-canvas-border" />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {[
                ['Source', node.data.source_page != null ? `p ${node.data.source_page}` : EMPTY],
                ['Statement', node.data.statement_type?.replace('_', ' ') ?? EMPTY],
                ['Period', node.data.period ?? EMPTY],
                ['Confidence', `${Math.round((node.data.confidence ?? 1) * 100)}%`],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-landing-ink-muted">{k}</dt>
                  <dd className="text-right font-medium text-landing-ink tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            {subgraph && (
              <>
                <Separator className="my-4 bg-landing-canvas-border" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-landing-ink">Linked nodes</span>
                  <Badge
                    variant="outline"
                    className="rounded-full border-landing-canvas-border bg-landing-card-inner px-2 py-0.5 text-xs text-landing-ink-muted"
                  >
                    {(subgraph.upstream_node_ids?.length ?? 0) + (subgraph.downstream_node_ids?.length ?? 0)}
                  </Badge>
                </div>
                <ScrollArea className="mt-2 max-h-60">
                  <div className="flex flex-col divide-y divide-landing-canvas-border">
                    {[...(subgraph.upstream_node_ids ?? []), ...(subgraph.downstream_node_ids ?? [])].map((peerId) => {
                      const peer = (subgraph.nodes ?? []).find((n) => n.id === peerId)
                      return (
                        <button
                          key={peerId}
                          type="button"
                          onClick={() => {
                            setSelected(peerId)
                            onSelect(peerId)
                          }}
                          className="flex w-full cursor-pointer items-baseline justify-between gap-2 px-2 py-2 text-left text-xs transition-colors hover:bg-landing-card-inner/60"
                        >
                          <span className="min-w-0 flex-1 truncate text-landing-ink">
                            {peer ? cleanName(peer.data.name) : peerId}
                          </span>
                          <Num
                            className="shrink-0 text-landing-ink-muted"
                            value={peer?.data.formatted_value?.replace(/\$/g, '') ?? EMPTY}
                          />
                        </button>
                      )
                    })}
                    {(subgraph.upstream_node_ids?.length ?? 0) + (subgraph.downstream_node_ids?.length ?? 0) === 0 && (
                      <p className="py-2 text-xs text-landing-ink-muted">
                        Nothing links to this node yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col justify-center">
            <Caption className="text-landing-ink-muted">Evidence</Caption>
            <Heading className="mt-2 text-base font-semibold text-landing-ink">
              Select a node
            </Heading>
            <p className="mt-1.5 text-xs leading-relaxed text-landing-ink-muted">
              Pick any node on the canvas to read the page it came from, its confidence, and the
              nodes linked to it.
            </p>
          </div>
        )}
      </aside>
    </SurfaceCard>
  )
}
