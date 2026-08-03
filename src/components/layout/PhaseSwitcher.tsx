import { NavLink, useLocation } from 'react-router-dom'
import {
  PHASES,
  phaseFromPath,
  phasePath,
  restPath,
} from '../../lib/phases'

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 4.5A1.5 1.5 0 0 1 5 3h4.5v14H5A1.5 1.5 0 0 1 3.5 15.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M16.5 4.5A1.5 1.5 0 0 0 15 3h-4.5v14H15a1.5 1.5 0 0 0 1.5-1.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5 11.2 7.3 16 8.5 11.2 9.7 10 14.5 8.8 9.7 4 8.5l4.8-1.2L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m15 12.5.6 2.1L17.5 15l-1.9.4L15 17.5l-.6-2.1L12.5 15l1.9-.4.6-2.1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 16.5h13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M5.5 16.5v-5M10 16.5v-9M14.5 16.5v-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5a5 5 0 0 1 5 5v2.2l1.2 2.3H3.8L5 9.7V7.5a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 15.2a1.8 1.8 0 0 0 3.6 0"
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
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const phaseIcons = {
  p0: BookIcon,
  p1: SparkleIcon,
  p2: ChartIcon,
} as const

export default function PhaseSwitcher() {
  const location = useLocation()
  const phase = phaseFromPath(location.pathname)
  const currentRest = restPath(location.pathname, phase)

  return (
    <header className="shrink-0 border-b border-border bg-surface px-5 py-3 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <nav
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          aria-label="Product phases"
          title="Each phase includes everything from the previous phases plus new capabilities."
        >
          {PHASES.map((item, index) => {
            const active = item.id === phase
            const Icon = phaseIcons[item.id]
            const isLast = index === PHASES.length - 1

            return (
              <div key={item.id} className="flex shrink-0 items-center gap-1">
                <NavLink
                  to={phasePath(item.id, currentRest)}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${item.code} ${item.name}`}
                  title={`${item.code} ${item.name}`}
                  className={[
                    'flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-all duration-150 ease-out',
                    active
                      ? 'min-w-0 border-brand-400 bg-brand-50 text-brand-700 shadow-[var(--shadow-soft)]'
                      : 'border-transparent bg-transparent text-muted hover:border-border hover:bg-slate-50 hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'size-3.5 shrink-0',
                      active ? 'text-brand-600' : 'text-slate-400',
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'text-[12px] font-semibold tracking-tight',
                      active ? 'text-brand-700' : 'text-slate-500',
                    ].join(' ')}
                  >
                    <span className={active ? 'opacity-70' : ''}>{item.code}</span>
                    {active && (
                      <span className="ml-1.5 hidden sm:inline">{item.name}</span>
                    )}
                  </span>
                </NavLink>

                {!isLast && (
                  <ChevronIcon className="size-3 shrink-0 text-slate-300" />
                )}
              </div>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-foreground"
            aria-label="Notifications"
          >
            <BellIcon className="size-4" />
          </button>
          <div
            className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700"
            aria-label="Sarah Johnson"
          >
            SJ
          </div>
        </div>
      </div>
    </header>
  )
}
