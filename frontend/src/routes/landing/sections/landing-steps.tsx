import { CheckCircle2, FileUp, GitBranch, Search } from 'lucide-react'
import { FeatureCard } from '@/components/app/feature-card'
import { Caption, Heading, Lead, Title } from '@/components/app/typography'

export function LandingSteps() {
  return (
    <section
      aria-label="How it works"
      className="bg-landing-canvas px-4 py-16 text-landing-ink sm:px-6 sm:py-24"
    >
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* Sticky Left Column */}
        <div className="lg:sticky lg:top-1/2 lg:col-span-5">
          <Title className="text-landing-ink">
            Get started in 3
            <br />
            simple steps.
          </Title>
          <Lead className="mt-4 max-w-sm text-landing-ink-muted">
            Upload a financial filing, explore the causal graph, and verify every answer with page-level citations.
          </Lead>
        </div>

        {/* Scrolling Right Column with Timeline */}
        <div className="relative pl-10 sm:pl-12 lg:col-span-7">
          <div
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-4 border-l border-dashed border-landing-canvas-border"
          />

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="relative">
              <span className="shadow-landing-raised absolute top-6 -left-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold text-landing-ink sm:-left-12">
                1
              </span>
              <FeatureCard className="items-center text-center">
                <div className="w-full max-w-xs py-4">
                  <div className="rounded-2xl border border-landing-canvas-border bg-landing-card-inner p-4 text-left shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-landing-accent-soft text-landing-accent">
                        <FileUp className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-landing-ink">annual-report-fy25.pdf</p>
                        <Caption className="text-landing-ink-muted">248 pages</Caption>
                      </div>
                    </div>
                    <div className="shadow-landing-sunken mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs">
                      <span className="text-landing-ink-muted">PDF Extraction</span>
                      <span className="font-medium text-landing-accent">Ready</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <Heading className="text-landing-ink">Upload your filing</Heading>
                  <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                    Drop any annual or quarterly PDF report into the workspace.
                  </p>
                </div>
              </FeatureCard>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="shadow-landing-raised absolute top-6 -left-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold text-landing-ink sm:-left-12">
                2
              </span>
              <FeatureCard className="items-center text-center">
                <div className="w-full max-w-xs py-4">
                  <div className="rounded-2xl border border-landing-canvas-border bg-landing-card-inner p-4 text-left shadow-sm">
                    <div className="flex items-center gap-3 border-b border-landing-canvas-border pb-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-landing-accent-soft text-landing-accent">
                        <GitBranch className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-landing-ink">Causal Graph Built</p>
                        <Caption className="text-landing-ink-muted">NetworkX Engine</Caption>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="shadow-landing-sunken flex items-center justify-between rounded-xl px-3 py-2">
                        <span className="text-landing-ink-muted">Metric Nodes</span>
                        <span className="font-mono font-medium text-landing-ink">48</span>
                      </div>
                      <div className="shadow-landing-sunken flex items-center justify-between rounded-xl px-3 py-2">
                        <span className="text-landing-ink-muted">Causal Edges</span>
                        <span className="font-mono font-medium text-landing-ink">112</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <Heading className="text-landing-ink">Build the causal graph</Heading>
                  <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                    Extract metrics, financial tables, and footnote disclosures automatically.
                  </p>
                </div>
              </FeatureCard>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="shadow-landing-raised absolute top-6 -left-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold text-landing-ink sm:-left-12">
                3
              </span>
              <FeatureCard className="items-center text-center">
                <div className="w-full max-w-xs py-4">
                  <div className="rounded-2xl border border-landing-canvas-border bg-landing-card-inner p-4 text-left shadow-sm">
                    <div className="flex items-center gap-2 border-b border-landing-canvas-border pb-2.5">
                      <Search className="size-3.5 text-landing-accent" aria-hidden="true" />
                      <span className="text-xs font-medium text-landing-ink">Cited Answer</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="shadow-landing-sunken flex items-center justify-between rounded-xl px-3 py-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-medium text-landing-ink">
                          <CheckCircle2 className="size-3.5 text-landing-accent" aria-hidden="true" />
                          Operating Cash Flow
                        </span>
                        <span className="font-mono text-landing-ink-muted">Page 42</span>
                      </div>
                      <div className="shadow-landing-sunken flex items-center justify-between rounded-xl px-3 py-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-medium text-landing-ink">
                          <CheckCircle2 className="size-3.5 text-landing-accent" aria-hidden="true" />
                          Debt Covenants
                        </span>
                        <span className="font-mono text-landing-ink-muted">Page 68</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <Heading className="text-landing-ink">Verify with citations</Heading>
                  <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                    Trace dependencies or ask questions grounded in exact source pages.
                  </p>
                </div>
              </FeatureCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
