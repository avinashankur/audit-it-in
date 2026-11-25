import { CheckCircle2, FileText, GitBranch, Search, ShieldCheck } from 'lucide-react'
import { FeatureCard } from '@/components/app/feature-card'
import { Caption, Heading, Lead, Title } from '@/components/app/typography'

const METRIC_TILES = [
  { label: 'Nodes', value: '48' },
  { label: 'Edges', value: '112' },
  { label: 'Tables', value: '14' },
] as const

export function LandingFeatures() {
  return (
    <section
      aria-label="Features"
      className="flex min-h-dvh flex-col justify-center bg-landing-canvas px-4 py-16 text-landing-ink sm:px-6 sm:py-24"
    >
      <div className="mx-auto w-full max-w-5xl space-y-12 sm:space-y-14">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Title className="text-landing-ink">
            Features designed
            <br />
            for your audit.
          </Title>
          <Lead className="mt-4 max-w-md text-landing-ink-muted">
            Explore the tools built to trace financial numbers, inspect statements, and verify every disclosure.
          </Lead>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Card 1: Stacked 3-layer card deck */}
          <FeatureCard className="items-center text-center">
            <div className="relative flex w-full max-w-xs flex-col items-center py-6">
              <div className="w-11/12 translate-y-2 scale-95 rounded-2xl border border-landing-canvas-border bg-landing-card-inner/80 px-4 py-2.5 opacity-70 shadow-xs">
                <div className="flex items-center justify-between text-xs text-landing-ink-muted">
                  <span>Balance Sheet</span>
                  <span>FY25</span>
                </div>
              </div>

              <div className="relative z-10 w-full rounded-2xl border border-landing-canvas-border bg-landing-card-inner px-4 py-3.5 text-left shadow-md">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-landing-ink">
                    <CheckCircle2 className="size-4 text-landing-accent" aria-hidden="true" />
                    Operating Cash Flow
                  </span>
                  <span className="rounded-md bg-landing-card px-2 py-0.5 text-xs text-landing-ink-muted">
                    Page 42
                  </span>
                </div>
                <p className="mt-1 pl-6 text-xs text-landing-ink-muted">Causal Node</p>
                <div className="mt-2.5 pl-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-accent-soft px-2.5 py-0.5 text-xs font-medium text-landing-accent">
                    High Impact
                  </span>
                </div>
              </div>

              <div className="w-11/12 -translate-y-2 scale-95 rounded-2xl border border-landing-canvas-border bg-landing-card-inner/80 px-4 py-2.5 opacity-60 shadow-xs">
                <div className="flex items-center justify-between text-xs text-landing-ink-muted">
                  <span>Footnote 14</span>
                  <span>Verified</span>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Heading className="text-landing-ink">Causal Knowledge Graph</Heading>
              <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                Trace upstream and downstream drivers across every filing.
              </p>
            </div>
          </FeatureCard>

          {/* Card 2: Mini inspector frame + floating callout pill */}
          <FeatureCard className="items-center text-center">
            <div className="relative flex w-full max-w-xs items-center justify-center py-6">
              <div className="w-56 rounded-2xl border border-landing-canvas-border bg-landing-card-inner p-3.5 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-landing-canvas-border pb-2">
                  <span className="text-xs font-medium text-landing-ink">10-K Overview</span>
                  <span className="text-xs text-landing-ink-muted">FY25</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-xl bg-landing-card py-2">
                    <p className="text-xs font-semibold text-landing-ink">48</p>
                    <p className="text-xs text-landing-ink-muted">Nodes</p>
                  </div>
                  <div className="rounded-xl bg-landing-card py-2">
                    <p className="text-xs font-semibold text-landing-ink">14</p>
                    <p className="text-xs text-landing-ink-muted">Tables</p>
                  </div>
                  <div className="rounded-xl bg-landing-card py-2">
                    <p className="text-xs font-semibold text-landing-ink">3</p>
                    <p className="text-xs text-landing-ink-muted">Hops</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-10 -right-2 flex items-center gap-2.5 rounded-2xl border border-landing-canvas-border bg-landing-card-inner px-3.5 py-2.5 text-left shadow-md sm:right-0">
                <span className="flex size-7 items-center justify-center rounded-full bg-landing-accent-soft text-landing-accent">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-landing-ink-muted">Graph Depth</p>
                  <p className="font-mono text-sm font-semibold text-landing-ink">3 Hops</p>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Heading className="text-landing-ink">Dependency Tracing</Heading>
              <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                Follow cause-to-effect links across statements and footnotes.
              </p>
            </div>
          </FeatureCard>

          {/* Card 3: Mini Q&A frame + floating citation pill */}
          <FeatureCard className="items-center text-center">
            <div className="relative flex w-full max-w-xs items-center justify-center py-6">
              <div className="w-56 rounded-2xl border border-landing-canvas-border bg-landing-card-inner p-3.5 text-left shadow-sm">
                <div className="flex items-center gap-2 border-b border-landing-canvas-border pb-2">
                  <Search className="size-3.5 text-landing-accent" aria-hidden="true" />
                  <span className="text-xs font-medium text-landing-ink">Disclosure Q&amp;A</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  <div className="rounded-xl bg-landing-card px-2.5 py-2">
                    <p className="text-xs font-medium text-landing-ink">Net Debt Drivers</p>
                    <p className="text-xs text-landing-ink-muted">Grounded answer</p>
                  </div>
                  <div className="rounded-xl bg-landing-card px-2.5 py-2">
                    <p className="text-xs font-medium text-landing-ink">Margin Expansion</p>
                    <p className="text-xs text-landing-ink-muted">Verified source</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-10 -right-2 flex items-center gap-2 rounded-full border border-landing-canvas-border bg-landing-card-inner px-3 py-1.5 shadow-md sm:right-0">
                <FileText className="size-3.5 text-landing-accent" aria-hidden="true" />
                <span className="font-mono text-xs font-medium text-landing-ink">Page 42</span>
              </div>
            </div>

            <div className="mt-2">
              <Heading className="text-landing-ink">Cited Q&amp;A</Heading>
              <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                Ask questions and verify every answer with page-level sources.
              </p>
            </div>
          </FeatureCard>

          {/* Card 4: Floating summary card with 3 equal-width tiles */}
          <FeatureCard className="items-center text-center">
            <div className="flex w-full max-w-xs items-center justify-center py-6">
              <div className="w-full rounded-2xl border border-landing-canvas-border bg-landing-card-inner p-4 text-left shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-landing-accent-soft text-landing-accent">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <Caption className="text-landing-ink-muted">Engine</Caption>
                    <p className="text-sm font-medium text-landing-ink">Offline Grounded</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {METRIC_TILES.map((tile) => (
                    <div key={tile.label} className="rounded-xl bg-landing-card px-2 py-2.5">
                      <p className="text-xs text-landing-ink-muted">{tile.label}</p>
                      <p className="mt-0.5 font-mono text-base font-semibold text-landing-ink">
                        {tile.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Heading className="text-landing-ink">Local &amp; Private</Heading>
              <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                Run fully offline with zero API keys, or bring your own model.
              </p>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}
