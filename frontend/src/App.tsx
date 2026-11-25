import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/components/app/app-sidebar'
import { AppBreadcrumbs } from '@/components/app/breadcrumbs'
import { StatusBar } from '@/components/app/page-header'
import { SessionProvider, useSession } from '@/state/session'
import { ThemeProvider } from '@/components/theme-provider'
import { formatTime, plural } from '@/lib/format'
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
  const { documents, health } = useSession()

  const right = health ? (
    <span className="inline-flex items-center gap-2"><span className="size-1.5 shrink-0 bg-brand" aria-hidden="true" /><span>Engine ready · synced {formatTime()}</span></span>
  ) : (
    <span className="inline-flex items-center gap-2 text-destructive"><span className="size-1.5 shrink-0 bg-destructive" aria-hidden="true" /><span>Engine unreachable</span></span>
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <StatusBar
          left={
            <span className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 size-7" />
              {plural(documents.length, 'filing')} indexed
            </span>
          }
          right={right}
        />
        <main className="mx-auto w-full max-w-6xl p-5 lg:p-10">
          <AppBreadcrumbs />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
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
