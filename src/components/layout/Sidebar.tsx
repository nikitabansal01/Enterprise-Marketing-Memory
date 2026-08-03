import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { phaseFromPath, phasePath, restPath } from '../../lib/phases'

type ChildLink = {
  path: string
  label: string
  icon: (props: { className?: string }) => ReactNode
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5 8 2.5l5.5 5V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V7.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M6 14v-4.5h4V14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function MemoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.5v11M4.5 5.5 8 2.5l3.5 3M4.5 10.5 8 13.5l3.5-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TeachIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 5.5 8 2.5l5.5 3-5.5 3-5.5-3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M4 7.2v3.3c0 .8 1.8 2 4 2s4-1.2 4-2V7.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 8.2 7.2 9.9 10.5 6.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DraftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 2.5h5.5L12.5 5.5V13.5H4V2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9.5 2.5V5.5H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 8.5h4M6 11h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.5v7.5M5.5 5.5 8 2.5l2.5 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 10.5v2a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StudioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function InsightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 12.5v-3M6.5 12.5v-6M9.5 12.5v-4M12.5 12.5v-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.5 13c.6-2.2 2.2-3.5 4.5-3.5s3.9 1.3 4.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 2.5v1.25M8 12.25V13.5M13.5 8h-1.25M3.75 8H2.5M11.9 4.1l-.88.88M4.98 11.02l-.88.88M11.9 11.9l-.88-.88M4.98 4.98l-.88-.88"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4 10 8 6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const memoryChildren: ChildLink[] = [
  { path: 'learn-brand', label: 'Teach AI Your Brand', icon: TeachIcon },
  { path: 'learn-brand', label: 'Review AI Understanding', icon: ReviewIcon },
  { path: 'create-campaign', label: 'Create First Draft', icon: DraftIcon },
  { path: 'export', label: 'Export & Publish', icon: ExportIcon },
]

const workspaceChildren: ChildLink[] = [
  { path: 'validate', label: 'Administration', icon: AdminIcon },
  { path: 'settings', label: 'Settings', icon: SettingsIcon },
]

function childActive(pathname: string, childPath: string) {
  const phase = phaseFromPath(pathname)
  const rest = restPath(pathname, phase)
  return rest === childPath || rest.startsWith(`${childPath}/`)
}

function rowClass(active: boolean) {
  return [
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
    active
      ? 'bg-brand-50 text-brand-700 shadow-[inset_3px_0_0_0_var(--color-brand-600)]'
      : 'text-muted hover:bg-slate-50 hover:text-foreground',
  ].join(' ')
}

function PhaseBadge({ label }: { label: string }) {
  return (
    <span className="status-badge status-badge--brand !px-1.5 !py-0.5 text-[10px] font-semibold">
      {label}
    </span>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const phase = phaseFromPath(location.pathname)
  const rest = restPath(location.pathname, phase)

  const homeActive = phase === 'p0' && rest === ''
  const memoryChildActive = memoryChildren.some((child) =>
    childActive(location.pathname, child.path),
  )
  const workspaceChildActive = workspaceChildren.some((child) =>
    childActive(location.pathname, child.path),
  )
  const studioActive = phase === 'p1'
  const intelligenceActive = phase === 'p2'
  const memoryPhaseActive = homeActive || memoryChildActive

  const [memoryOpen, setMemoryOpen] = useState(() => memoryPhaseActive)
  const [studioOpen, setStudioOpen] = useState(() => studioActive)
  const [intelligenceOpen, setIntelligenceOpen] = useState(() => intelligenceActive)
  const [workspaceOpen, setWorkspaceOpen] = useState(() => workspaceChildActive)

  useEffect(() => {
    if (memoryPhaseActive) setMemoryOpen(true)
    setStudioOpen(studioActive)
    setIntelligenceOpen(intelligenceActive)
    if (workspaceChildActive) setWorkspaceOpen(true)
  }, [memoryPhaseActive, studioActive, intelligenceActive, workspaceChildActive])

  return (
    <aside className="flex h-full w-[15.5rem] shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-4 py-4">
        <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
          Enterprise Marketing Memory
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-5 px-2.5 pb-6">
        <NavLink to={phasePath('p0')} end className={() => rowClass(homeActive)}>
          <HomeIcon className="size-3.5 shrink-0 opacity-80" />
          <span>Home</span>
        </NavLink>

        <div>
          <button
            type="button"
            onClick={() => setMemoryOpen((open) => !open)}
            className={[
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-all duration-150',
              memoryPhaseActive
                ? 'text-foreground'
                : 'text-muted hover:bg-slate-50 hover:text-foreground',
            ].join(' ')}
            aria-expanded={memoryOpen}
          >
            <ChevronIcon
              className={[
                'size-3.5 shrink-0 text-slate-400 transition-transform duration-150',
                memoryOpen ? 'rotate-90' : '',
              ].join(' ')}
            />
            <MemoryIcon className="size-3.5 shrink-0 opacity-80" />
            <span className="min-w-0 flex-1 truncate">Enterprise Marketing Memory</span>
            <PhaseBadge label="P0" />
          </button>

          {memoryOpen && (
            <div className="mt-1.5 ml-3 space-y-0.5 border-l border-border pl-2.5">
              {memoryChildren.map((child) => {
                const active = childActive(location.pathname, child.path)
                const Icon = child.icon
                return (
                  <NavLink
                    key={child.label}
                    to={phasePath('p0', child.path)}
                    className={rowClass(active)}
                  >
                    <Icon className="size-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{child.label}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              if (studioActive) setStudioOpen((open) => !open)
            }}
            className={[
              'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              studioActive
                ? 'text-brand-700 hover:bg-brand-100/60'
                : 'text-slate-400 hover:bg-slate-50 hover:text-foreground',
            ].join(' ')}
            aria-expanded={studioOpen}
            aria-label="Toggle Campaign Studio"
          >
            <ChevronIcon
              className={[
                'size-3.5 transition-transform duration-150',
                studioOpen ? 'rotate-90' : '',
              ].join(' ')}
            />
          </button>
          <NavLink
            to="/p1"
            end
            className={() =>
              [
                'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-all duration-150',
                studioActive
                  ? 'bg-brand-50 text-brand-700 shadow-[inset_3px_0_0_0_var(--color-brand-600)]'
                  : 'text-muted hover:bg-slate-50 hover:text-foreground',
              ].join(' ')
            }
          >
            <StudioIcon className="size-3.5 shrink-0 opacity-80" />
            <span className="min-w-0 flex-1 truncate">Campaign Studio</span>
            <PhaseBadge label="P1" />
          </NavLink>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              if (intelligenceActive) setIntelligenceOpen((open) => !open)
            }}
            className={[
              'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              intelligenceActive
                ? 'text-brand-700 hover:bg-brand-100/60'
                : 'text-slate-400 hover:bg-slate-50 hover:text-foreground',
            ].join(' ')}
            aria-expanded={intelligenceOpen}
            aria-label="Toggle Marketing Intelligence"
          >
            <ChevronIcon
              className={[
                'size-3.5 transition-transform duration-150',
                intelligenceOpen ? 'rotate-90' : '',
              ].join(' ')}
            />
          </button>
          <NavLink
            to="/p2"
            end
            className={() =>
              [
                'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-all duration-150',
                intelligenceActive
                  ? 'bg-brand-50 text-brand-700 shadow-[inset_3px_0_0_0_var(--color-brand-600)]'
                  : 'text-muted hover:bg-slate-50 hover:text-foreground',
              ].join(' ')
            }
          >
            <InsightIcon className="size-3.5 shrink-0 opacity-80" />
            <span className="min-w-0 flex-1 truncate">Marketing Intelligence</span>
            <PhaseBadge label="P2" />
          </NavLink>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setWorkspaceOpen((open) => !open)}
            className={[
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-all duration-150',
              workspaceChildActive
                ? 'text-foreground'
                : 'text-muted hover:bg-slate-50 hover:text-foreground',
            ].join(' ')}
            aria-expanded={workspaceOpen}
          >
            <ChevronIcon
              className={[
                'size-3.5 shrink-0 text-slate-400 transition-transform duration-150',
                workspaceOpen ? 'rotate-90' : '',
              ].join(' ')}
            />
            <span className="min-w-0 flex-1 truncate">Workspace</span>
          </button>

          {workspaceOpen && (
            <div className="mt-1.5 ml-3 space-y-0.5 border-l border-border pl-2.5">
              {workspaceChildren.map((child) => {
                const active = childActive(location.pathname, child.path)
                const Icon = child.icon
                return (
                  <NavLink
                    key={child.path}
                    to={phasePath('p0', child.path)}
                    className={rowClass(active)}
                  >
                    <Icon className="size-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{child.label}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
