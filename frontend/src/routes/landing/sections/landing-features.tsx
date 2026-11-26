import {
  CheckCircle2,
  FileText,
  GitBranch,
  Search,
  ShieldCheck,
} from "lucide-react";
import { FeatureCard } from "@/components/app/feature-card";
import { Caption, Heading, Lead, Title } from "@/components/app/typography";

const METRIC_TILES = [
  { label: "Nodes", value: "48" },
  { label: "Edges", value: "112" },
  { label: "Tables", value: "14" },
] as const;

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
            Explore the tools built to trace financial numbers, inspect
            statements, and verify every disclosure.
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
                    <CheckCircle2
                      className="size-4 text-landing-accent"
                      aria-hidden="true"
                    />
                    Operating Cash Flow
                  </span>
                  <span className="shadow-landing-sunken rounded-md px-2 py-0.5 text-xs text-landing-ink-muted">
                    Page 42
                  </span>
                </div>
                <p className="mt-1 pl-6 text-xs text-landing-ink-muted">
                  Causal Node
                </p>
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
              <Heading className="text-landing-ink">
                Causal Knowledge Graph
              </Heading>
              <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                Trace upstream and downstream drivers across every filing.
              </p>
            </div>
          </FeatureCard>

          {/* Card 2: Mini inspector frame + floating callout pill */}
          <FeatureCard className="items-center justify-end text-center bg-[url('/graph.png')]! bg-cover! bg-center! bg-no-repeat!">
            <div className="">
              <Heading className="text-landing-ink">Dependency Tracing</Heading>
            </div>
          </FeatureCard>

          {/* Card 3: Mini Q&A frame + floating citation pill */}
          <FeatureCard className="relative items-center justify-end text-center bg-[url('/image.png')]! bg-cover! bg-center! bg-no-repeat!">
            <div className="mt-2 dark:bg-neutral-800/30 bg-white rounded-2xl px-8 py-2 backdrop-blur-md">
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
                    <p className="text-sm font-medium text-landing-ink">
                      Offline Grounded
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {METRIC_TILES.map((tile) => (
                    <div
                      key={tile.label}
                      className="shadow-landing-sunken rounded-xl px-2 py-2.5"
                    >
                      <p className="text-xs text-landing-ink-muted">
                        {tile.label}
                      </p>
                      <p className="mt-0.5 font-mono text-base font-semibold text-landing-ink">
                        {tile.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Heading className="text-landing-ink">
                Local &amp; Private
              </Heading>
              <p className="mt-1 text-xs leading-relaxed text-landing-ink-muted sm:text-sm">
                Run fully offline with zero API keys, or bring your own model.
              </p>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
