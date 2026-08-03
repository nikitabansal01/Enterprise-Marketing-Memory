import { useEffect, useId, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { phaseFromPath, phasePath, restPath, type Phase } from '../../lib/phases'

type IconProps = { className?: string }
type ChildLink = {
  path: string
  label: string
  icon: (props: IconProps) => ReactNode
  /** Treat empty rest as active (e.g. Canvas at /p1) */
  matchEmpty?: boolean
}

function IconShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function HomeIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M2.5 7.5 8 2.5l5.5 5V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V7.5Z" />
      <path d="M6 14v-4.5h4V14" />
    </IconShell>
  )
}

function MemoryIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M8 2.5v11M4.5 5.5 8 2.5l3.5 3M4.5 10.5 8 13.5l3.5-3" />
    </IconShell>
  )
}

function TeachIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M2.5 5.5 8 2.5l5.5 3-5.5 3-5.5-3Z" />
      <path d="M4 7.2v3.3c0 .8 1.8 2 4 2s4-1.2 4-2V7.2" />
    </IconShell>
  )
}

function ReviewIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="8" cy="8" r="5.25" />
      <path d="M5.5 8.2 7.2 9.9 10.5 6.3" />
    </IconShell>
  )
}

function DraftIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M4 2.5h5.5L12.5 5.5V13.5H4V2.5Z" />
      <path d="M9.5 2.5V5.5H12.5" />
      <path d="M6 8.5h4M6 11h2.5" />
    </IconShell>
  )
}

function ExportIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M8 2.5v7.5M5.5 5.5 8 2.5l2.5 3" />
      <path d="M3.5 10.5v2a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2" />
    </IconShell>
  )
}

function StudioIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="1.2" />
      <rect x="2.5" y="8.5" width="5" height="5" rx="1.2" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="1.2" />
    </IconShell>
  )
}

function CanvasNavIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <path d="M2.5 6.5h11" />
    </IconShell>
  )
}

function WorkflowNavIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="4" cy="4" r="1.5" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <path d="M5.5 4.5 10.5 7.5M5.5 11.5 10.5 8.5" />
    </IconShell>
  )
}

function ApprovalsNavIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M3.5 4.5h9v8.5H6L3.5 15V4.5Z" />
      <path d="M6 8.2 7.4 9.6 10.2 6.6" />
    </IconShell>
  )
}

function ConnectorsNavIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M6.5 3.5v3M9.5 3.5v3" />
      <path d="M5 6.5h6v2.2a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V6.5Z" />
      <path d="M8 11.7V13.5" />
    </IconShell>
  )
}

function InsightIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M3.5 12.5v-3M6.5 12.5v-6M9.5 12.5v-4M12.5 12.5v-8" />
    </IconShell>
  )
}

function WorkspaceIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M2.5 5.5h11v7.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V5.5Z" />
      <path d="M2.5 5.5 4 3h3l1.5 2.5h5" />
    </IconShell>
  )
}

function AdminIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="8" cy="5.5" r="2.25" />
      <path d="M3.5 13c.6-2.2 2.2-3.5 4.5-3.5s3.9 1.3 4.5 3.5" />
    </IconShell>
  )
}

function SettingsIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="8" cy="8" r="2.25" />
      <path d="M8 2.5v1.25M8 12.25V13.5M13.5 8h-1.25M3.75 8H2.5M11.9 4.1l-.88.88M4.98 11.02l-.88.88M11.9 11.9l-.88-.88M4.98 4.98l-.88-.88" />
    </IconShell>
  )
}

function ChevronIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M6 4 10 8 6 12" strokeWidth="1.5" />
    </IconShell>
  )
}

const memoryChildren: ChildLink[] = [
  { path: 'learn-brand', label: 'Teach AI Your Brand', icon: TeachIcon },
  { path: 'learn-brand', label: 'Review AI Understanding', icon: ReviewIcon },
  { path: 'create-campaign', label: 'Create First Draft', icon: DraftIcon },
  { path: 'export', label: 'Export & Publish', icon: ExportIcon },
]

const studioChildren: ChildLink[] = [
  { path: 'canvas', label: 'Canvas', icon: CanvasNavIcon, matchEmpty: true },
  { path: 'workflow', label: 'Workflow', icon: WorkflowNavIcon },
  { path: 'approvals', label: 'Approvals', icon: ApprovalsNavIcon },
  { path: 'connectors', label: 'Connectors', icon: ConnectorsNavIcon },
]

const workspaceChildren: ChildLink[] = [
  { path: 'validate', label: 'Administration', icon: AdminIcon },
  { path: 'settings', label: 'Settings', icon: SettingsIcon },
]

function childActive(pathname: string, child: ChildLink, phase: Phase = 'p0') {
  const current = phaseFromPath(pathname)
  if (current !== phase) return false
  const rest = restPath(pathname, phase)
  if (child.matchEmpty && (rest === '' || rest === child.path)) return true
  return rest === child.path || rest.startsWith(`${child.path}/`)
}

function PhaseBadge({ label }: { label: string }) {
  return <span className="app-sidebar__badge">{label}</span>
}

function NavChildren({
  id,
  open,
  items,
  phase,
}: {
  id: string
  open: boolean
  items: ChildLink[]
  phase: Phase
}) {
  const location = useLocation()

  return (
    <div
      id={id}
      className="app-sidebar__panel"
      data-open={open ? 'true' : 'false'}
      {...(!open ? { inert: true } : {})}
    >
      <div className="app-sidebar__panel-inner">
        <ul className="app-sidebar__children" role="list">
          {items.map((child) => {
            const active = childActive(location.pathname, child, phase)
            const Icon = child.icon
            const href =
              child.matchEmpty && child.path === 'canvas'
                ? phasePath(phase)
                : phasePath(phase, child.path)
            return (
              <li key={child.label}>
                <NavLink
                  to={href}
                  end={child.matchEmpty}
                  className={[
                    'app-sidebar__item app-sidebar__item--child',
                    active ? 'is-active' : '',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                  tabIndex={open ? undefined : -1}
                >
                  <Icon className="app-sidebar__icon" />
                  <span className="app-sidebar__label">{child.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const phase = phaseFromPath(location.pathname)
  const rest = restPath(location.pathname, phase)
  const uid = useId()
  const memoryPanelId = `${uid}-memory`
  const studioPanelId = `${uid}-studio`
  const workspacePanelId = `${uid}-workspace`

  const homeActive = phase === 'p0' && rest === ''
  const memoryChildActive = memoryChildren.some((child) =>
    childActive(location.pathname, child, 'p0'),
  )
  const studioChildActive = studioChildren.some((child) =>
    childActive(location.pathname, child, 'p1'),
  )
  const workspaceChildActive = workspaceChildren.some((child) =>
    childActive(location.pathname, child, 'p0'),
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
    if (studioActive) setStudioOpen(true)
    setIntelligenceOpen(intelligenceActive)
    if (workspaceChildActive) setWorkspaceOpen(true)
  }, [memoryPhaseActive, studioActive, intelligenceActive, workspaceChildActive])

  return (
    <aside className="app-sidebar" aria-label="Product navigation">
      <div className="app-sidebar__brand">
        <p className="app-sidebar__brand-title">Marketing OS</p>
      </div>

      <nav className="app-sidebar__nav">
        <NavLink
          to={phasePath('p0')}
          end
          className={['app-sidebar__item app-sidebar__item--top', homeActive ? 'is-active' : ''].join(
            ' ',
          )}
          aria-current={homeActive ? 'page' : undefined}
        >
          <span className="app-sidebar__chevron-slot" aria-hidden="true" />
          <HomeIcon className="app-sidebar__icon" />
          <span className="app-sidebar__label">Home</span>
        </NavLink>

        <div className="app-sidebar__divider" role="separator" />

        <div className="app-sidebar__group">
          <button
            type="button"
            className={[
              'app-sidebar__item app-sidebar__item--phase',
              memoryPhaseActive ? 'is-current' : '',
            ].join(' ')}
            aria-expanded={memoryOpen}
            aria-controls={memoryPanelId}
            onClick={() => setMemoryOpen((open) => !open)}
          >
            <ChevronIcon
              className={[
                'app-sidebar__chevron',
                memoryOpen ? 'is-open' : '',
              ].join(' ')}
            />
            <MemoryIcon className="app-sidebar__icon" />
            <span className="app-sidebar__label">Enterprise Marketing Memory</span>
            <PhaseBadge label="P0" />
          </button>
          <NavChildren
            id={memoryPanelId}
            open={memoryOpen}
            items={memoryChildren}
            phase="p0"
          />
        </div>

        <div className="app-sidebar__group">
          <button
            type="button"
            className={[
              'app-sidebar__item app-sidebar__item--phase',
              studioActive || studioChildActive ? 'is-current' : '',
            ].join(' ')}
            aria-expanded={studioOpen}
            aria-controls={studioPanelId}
            onClick={() => setStudioOpen((open) => !open)}
          >
            <ChevronIcon
              className={[
                'app-sidebar__chevron',
                studioOpen ? 'is-open' : '',
              ].join(' ')}
            />
            <StudioIcon className="app-sidebar__icon" />
            <span className="app-sidebar__label">Campaign Studio</span>
            <PhaseBadge label="P1" />
          </button>
          <NavChildren
            id={studioPanelId}
            open={studioOpen}
            items={studioChildren}
            phase="p1"
          />
        </div>

        <div className="app-sidebar__group">
          <NavLink
            to="/p2"
            end
            className={[
              'app-sidebar__item app-sidebar__item--phase',
              intelligenceActive ? 'is-active' : '',
            ].join(' ')}
            aria-current={intelligenceActive ? 'page' : undefined}
            aria-expanded={intelligenceOpen}
          >
            <ChevronIcon
              className={[
                'app-sidebar__chevron',
                intelligenceOpen ? 'is-open' : '',
              ].join(' ')}
            />
            <InsightIcon className="app-sidebar__icon" />
            <span className="app-sidebar__label">Marketing Intelligence</span>
            <PhaseBadge label="P2" />
          </NavLink>
        </div>

        <div className="app-sidebar__divider" role="separator" />

        <div className="app-sidebar__group">
          <button
            type="button"
            className={[
              'app-sidebar__item app-sidebar__item--phase',
              workspaceChildActive ? 'is-current' : '',
            ].join(' ')}
            aria-expanded={workspaceOpen}
            aria-controls={workspacePanelId}
            onClick={() => setWorkspaceOpen((open) => !open)}
          >
            <ChevronIcon
              className={[
                'app-sidebar__chevron',
                workspaceOpen ? 'is-open' : '',
              ].join(' ')}
            />
            <WorkspaceIcon className="app-sidebar__icon" />
            <span className="app-sidebar__label">Workspace</span>
          </button>
          <NavChildren
            id={workspacePanelId}
            open={workspaceOpen}
            items={workspaceChildren}
            phase="p0"
          />
        </div>
      </nav>
    </aside>
  )
}
