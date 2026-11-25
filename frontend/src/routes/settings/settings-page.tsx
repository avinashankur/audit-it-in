import { useState } from 'react'
import { SurfaceButton } from '@/components/app/action-buttons'
import { ModeToggle } from '@/components/app/mode-toggle'
import { SurfaceCard } from '@/components/app/surface-card'
import { SurfaceSwitch } from '@/components/app/surface-switch'
import { Caption, PageHeading } from '@/components/app/typography'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useSession } from '@/state/session'
import type { UserSettings } from '@/types'

const PROVIDERS = ['Offline Grounded', 'Gemini', 'OpenAI', 'Anthropic'] as const
const HOPS = [1, 2, 3] as const

function SettingRow({
  title,
  description,
  htmlFor,
  children,
}: {
  title: string
  description?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-x-8 gap-y-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <Field className="gap-0.5 border-0 p-0">
        <FieldLabel htmlFor={htmlFor} className="text-xs font-medium text-landing-ink">
          {title}
        </FieldLabel>
        {description && (
          <FieldDescription className="text-xs text-landing-ink-muted">
            {description}
          </FieldDescription>
        )}
      </Field>
      <div className="sm:justify-self-end">{children}</div>
    </div>
  )
}

export function Settings() {
  const { settings, saveSettings, documents } = useSession()
  const [draft, setDraft] = useState<UserSettings>(settings)
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const set = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const clearStored = () => {
    const cleared: UserSettings = {
      provider: 'Offline Grounded',
      apiKey: '',
      graphBackend: 'networkx',
      showFootnotes: true,
      hops: 2,
    }
    setDraft(cleared)
    saveSettings(cleared)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-landing-ink">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading>Settings</PageHeading>

        <div className="flex items-center gap-2">
          {dirty && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-3 text-xs text-landing-ink-muted hover:bg-landing-card hover:text-landing-ink"
              onClick={() => setDraft(settings)}
            >
              Discard
            </Button>
          )}
          <SurfaceButton disabled={!dirty} onClick={() => saveSettings(draft)}>
            Save changes
          </SurfaceButton>
        </div>
      </div>

      {/* Appearance & Reasoning */}
      <div className="space-y-2">
        <Caption className="px-1 text-landing-ink-muted">Appearance &amp; Reasoning</Caption>
        <SurfaceCard className="divide-y divide-landing-canvas-border overflow-hidden mt-2">
          <SettingRow title="Theme" description="Follows your system by default.">
            <ModeToggle />
          </SettingRow>

          <SettingRow
            title="Reasoning engine"
            description="Offline mode runs locally with no external calls. Other providers require an API key."
            htmlFor="provider"
          >
            <Select
              value={draft.provider}
              onValueChange={(v) => set('provider', v as UserSettings['provider'])}
            >
              <SelectTrigger
                id="provider"
                className="shadow-landing-sunken h-9 w-48 rounded-xl border-0 bg-transparent px-3 text-xs text-landing-ink shadow-none transition-shadow focus-visible:ring-1 focus-visible:ring-landing-ink-muted"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-landing
                className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
              >
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p} className="rounded-lg text-xs">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {draft.provider !== 'Offline Grounded' && (
            <SettingRow
              title={`${draft.provider} API key`}
              description={
                settings.apiKey
                  ? 'Active in this browser session. Sent per query as a header.'
                  : 'Not saved in browser. Uses server environment key if configured.'
              }
              htmlFor="api-key"
            >
              <div className="flex flex-col items-end gap-1.5">
                <div className="shadow-landing-sunken flex h-9 w-64 items-center rounded-xl px-3 transition-shadow focus-within:ring-1 focus-within:ring-landing-ink-muted">
                  <input
                    id="api-key"
                    name="llm_api_key"
                    type="password"
                    autoComplete="off"
                    placeholder={settings.apiKey ? 'Saved in browser' : 'Enter API key...'}
                    value={draft.apiKey}
                    onChange={(e) => set('apiKey', e.target.value)}
                    className="w-full min-w-0 bg-transparent text-xs text-landing-ink outline-none placeholder:text-landing-ink-muted"
                  />
                </div>
                {dirty && (
                  <span className="text-xs font-medium text-landing-accent">
                    Unsaved changes. Save to apply.
                  </span>
                )}
              </div>
            </SettingRow>
          )}
        </SurfaceCard>
      </div>

      {/* Graph & Evidence */}
      <div className="space-y-2">
        <Caption className="px-1 text-landing-ink-muted">Graph &amp; Evidence</Caption>
        <SurfaceCard className="divide-y divide-landing-canvas-border overflow-hidden mt-2">
          <SettingRow
            title="Graph storage adapter"
            description="NetworkX is in-memory. Neo4j persists across restarts."
            htmlFor="backend"
          >
            <Select
              value={draft.graphBackend}
              onValueChange={(v) => set('graphBackend', v as UserSettings['graphBackend'])}
            >
              <SelectTrigger
                id="backend"
                className="shadow-landing-sunken h-9 w-48 rounded-xl border-0 bg-transparent px-3 text-xs text-landing-ink shadow-none transition-shadow focus-visible:ring-1 focus-visible:ring-landing-ink-muted"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-landing
                className="rounded-xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
              >
                <SelectItem value="networkx" className="rounded-lg text-xs">
                  NetworkX
                </SelectItem>
                <SelectItem value="neo4j" className="rounded-lg text-xs">
                  Neo4j
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            title="Show footnote nodes"
            description="Include narrative disclosure nodes in the causal graph."
          >
            <SurfaceSwitch
              checked={draft.showFootnotes}
              onCheckedChange={(v) => set('showFootnotes', v)}
              aria-label="Show footnote nodes"
            />
          </SettingRow>

          <SettingRow
            title="Default hop depth"
            description="How far the graph expands from a selected node."
          >
            <div
              role="radiogroup"
              aria-label="Default hop depth"
              className="shadow-landing-sunken inline-flex items-center gap-1 rounded-xl p-1"
            >
              {HOPS.map((h) => {
                const active = draft.hops === h
                return (
                  <button
                    key={h}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set('hops', h)}
                    className={cn(
                      'cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all',
                      active
                        ? 'shadow-landing-raised text-landing-ink'
                        : 'text-landing-ink-muted hover:text-landing-ink',
                    )}
                  >
                    {h} {h === 1 ? 'hop' : 'hops'}
                  </button>
                )
              })}
            </div>
          </SettingRow>
        </SurfaceCard>
      </div>

      {/* Session & Reset */}
      <div className="space-y-2">
        <Caption className="px-1 text-landing-ink-muted">Session</Caption>
        <SurfaceCard className="divide-y divide-landing-canvas-border overflow-hidden mt-2">
          <SettingRow title="Indexed filings" description="Filings are scoped to this browser session.">
            <span className="font-mono text-xs font-medium text-landing-ink-muted tabular-nums">
              {formatCount(documents.length)} open
            </span>
          </SettingRow>

          <SettingRow
            title="Clear stored settings"
            description="Resets the provider, key, and adapter saved in this browser. Ingested filings are untouched."
          >
            <Dialog>
              <DialogTrigger asChild>
                <SurfaceButton className="text-destructive hover:text-destructive">
                  Clear settings
                </SurfaceButton>
              </DialogTrigger>
              <DialogContent
                data-landing
                className="rounded-2xl border-landing-canvas-border bg-landing-card-inner text-landing-ink"
              >
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold text-landing-ink">
                    Clear stored settings?
                  </DialogTitle>
                  <DialogDescription className="text-xs text-landing-ink-muted">
                    This will reset your model provider, API key, and graph storage backend to
                    defaults. Ingested filings in this session are untouched.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2">
                  <DialogClose asChild>
                    <SurfaceButton>Cancel</SurfaceButton>
                  </DialogClose>
                  <DialogClose asChild>
                    <SurfaceButton
                      className="text-destructive hover:text-destructive"
                      onClick={clearStored}
                    >
                      Confirm reset
                    </SurfaceButton>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SettingRow>
        </SurfaceCard>
      </div>
    </div>
  )
}
