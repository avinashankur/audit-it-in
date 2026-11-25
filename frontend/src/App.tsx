import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/components/app/app-sidebar'
import { AppBreadcrumbs } from '@/components/app/breadcrumbs'
import { SessionProvider } from '@/state/session'
import { ThemeProvider } from '@/components/theme-provider'
import { Overview } from '@/routes/dashboard/overview-page'
import { Landing } from '@/routes/landing/landing-page'
import { Filings } from '@/routes/filings/filings-page'
import { FilingLayout } from '@/routes/filings/detail/filing-layout'
import { FilingOverview } from '@/routes/filings/detail/filing-overview-page'
import { FilingGraph } from '@/routes/filings/detail/filing-graph-page'
import { FilingQA } from '@/routes/filings/detail/filing-qa-page'
import { FilingTables } from '@/routes/filings/detail/filing-tables-page'
import { Settings } from '@/routes/settings/settings-page'

function Shell() {
  return (
    <div data-landing className="h-dvh overflow-hidden bg-landing-card text-landing-ink">
      <SidebarProvider
        className="h-full min-h-0 bg-landing-card"
        style={{ '--sidebar-width': '14rem' } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-landing-canvas md:my-2.5 md:mr-2.5 md:rounded-xl md:border md:border-landing-canvas-border md:shadow-xs md:peer-data-[variant=inset]:rounded-xl">
          <div className="shrink-0 px-5 pt-4 lg:px-8 lg:pt-5">
            <SidebarTrigger className="size-8 rounded-lg text-landing-ink-muted hover:bg-landing-card hover:text-landing-ink" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <main className="mx-auto w-full max-w-6xl px-5 pt-3 pb-8 lg:px-10 lg:pt-4 lg:pb-10">
              <AppBreadcrumbs />
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<Shell />}>
                <Route path="/dashboard" element={<Overview />} />
                <Route path="/filings" element={<Filings />} />
                <Route path="/filings/:id" element={<FilingLayout />}>
                  <Route index element={<FilingOverview />} />
                  <Route path="graph" element={<FilingGraph />} />
                  <Route path="qa" element={<FilingQA />} />
                  <Route path="tables" element={<FilingTables />} />
                </Route>
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default App
