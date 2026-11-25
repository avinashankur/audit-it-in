import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PrimaryButton, SecondaryButton } from '@/components/app/action-buttons'
import { Title } from '@/components/app/typography'

export function LandingCta() {
  return (
    <section
      aria-label="Get started"
      className="bg-landing-canvas px-2 pt-8 sm:px-2.5 sm:pt-12"
    >
      <div className="bg-landing-hero relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl px-6 py-14 text-center text-landing-foreground sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-12 size-48 rotate-12 rounded-3xl border border-landing-border-subtle bg-landing-surface opacity-60 sm:size-64"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -bottom-16 size-48 -rotate-12 rounded-3xl border border-landing-border-subtle bg-landing-surface opacity-60 sm:size-64"
        />

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
          <Title className="text-landing-foreground">
            Start auditing filings
            <br />
            with causal clarity
          </Title>

          <div className="mt-7 inline-flex items-center gap-1.5 rounded-full border border-landing-border bg-landing-surface p-1.5 backdrop-blur-md">
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
      </div>
    </section>
  )
}
