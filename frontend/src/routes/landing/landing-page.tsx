import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PrimaryButton, SecondaryButton } from '@/components/app/action-buttons'
import { GlassStatCard } from '@/components/app/glass-stat-card'
import { Caption, Display, Eyebrow, Heading, Lead } from '@/components/app/typography'
import { LandingCta } from '@/routes/landing/sections/landing-cta'
import { LandingFeatures } from '@/routes/landing/sections/landing-features'
import { LandingFooter } from '@/routes/landing/sections/landing-footer'
import { LandingSteps } from '@/routes/landing/sections/landing-steps'

const HIGHLIGHTS = [
  { value: 'PDF to DAG', label: 'Causal Engine' },
  { value: '100%', label: 'Cited Answers' },
  { value: 'Tables + Q&A', label: 'Unified Audit' },
  { value: '0 Keys', label: 'Offline Grounded' },
] as const

export function Landing() {
  return (
    <div data-landing className="flex min-h-dvh flex-col bg-landing-canvas">
      <div className="flex min-h-dvh flex-col p-2 sm:p-2.5">
        <section
          aria-label="Hero"
          className="bg-landing-hero relative flex w-full flex-1 flex-col justify-between overflow-hidden rounded-3xl px-5 py-5 text-landing-foreground sm:px-8 sm:py-6 md:px-10 md:py-7"
        >
          <header className="relative z-10 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-landing-foreground transition-opacity hover:opacity-90"
            >
              <img
                src="/favicon.svg"
                alt="AuditItIn"
                className="size-7 rounded-lg shadow-xs"
              />
              <span className="text-base font-semibold tracking-tight">
                AuditItIn
              </span>
            </Link>

            <PrimaryButton asChild size="default">
              <Link to="/dashboard">Dashboard</Link>
            </PrimaryButton>
          </header>

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
            <Eyebrow className="mb-5 text-landing-foreground sm:mb-6">
              Causal Financial Intelligence
            </Eyebrow>

            <Display className="text-landing-foreground">
              Audit filings
              <br />
              with causal clarity
            </Display>

            <Lead className="mt-4 max-w-md text-landing-muted sm:mt-5">
              Turn financial PDFs into an interactive causal graph, inspect extracted statements, and ask questions with page-level citations.
            </Lead>

            <div className="mt-7 inline-flex items-center gap-1.5 rounded-full border border-landing-border bg-landing-surface p-1.5 backdrop-blur-md sm:mt-8">
              <PrimaryButton asChild>
                <Link to="/dashboard">
                  Get Started
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </PrimaryButton>
              <SecondaryButton asChild>
                <Link to="/filings">Browse Filings</Link>
              </SecondaryButton>
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-2xl">
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-landing-border bg-landing-surface p-2 backdrop-blur-xl sm:grid-cols-4 sm:gap-2">
              {HIGHLIGHTS.map((item) => (
                <GlassStatCard key={item.label}>
                  <Heading className="text-landing-foreground">{item.value}</Heading>
                  <Caption className="mt-0.5 text-landing-muted">{item.label}</Caption>
                </GlassStatCard>
              ))}
            </div>
          </div>
        </section>
      </div>

      <LandingFeatures />

      <LandingSteps />

      <LandingCta />

      <LandingFooter />
    </div>
  )
}
