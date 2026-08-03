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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 7.2v3.3M8 5.3h.01"
        stroke="currentColor"
        strokeWidth="1.3"
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
    <header className="shrink-0 border-b border-border bg-surface px-5 py-3.5 sm:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
        <div className="min-w-0 shrink-0">
          <h1 className="text-[13px] font-semibold tracking-tight text-foreground">
            Enterprise Marketing Memory
          </h1>
          <p className="meta mt-0.5 flex items-center gap-1">
            Product roadmap
            <span title="Each phase includes everything from the previous phases plus new capabilities.">
              <InfoIcon className="size-3.5 text-slate-400" />
            </span>
          </p>
        </div>

        <nav
          className="flex min-w-0 flex-1 items-center justify-start gap-1.5 overflow-x-auto xl:justify-center"
          aria-label="Product roadmap phases"
        >
          {PHASES.map((item, index) => {
            const active = item.id === phase
            const Icon = phaseIcons[item.id]
            const isLast = index === PHASES.length - 1

            return (
              <div key={item.id} className="flex shrink-0 items-center gap-1.5">
                <NavLink
                  to={phasePath(item.id, currentRest)}
                  aria-current={active ? 'step' : undefined}
                  className={[
                    'flex min-w-[10.5rem] items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-150 ease-out',
                    active
                      ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-[var(--shadow-soft)]'
                      : 'border-border bg-white text-muted hover:border-brand-200 hover:bg-slate-50 hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'size-4 shrink-0',
                      active ? 'text-brand-600' : 'text-slate-400',
                    ].join(' ')}
                  />
                  <span className="min-w-0 text-left">
                    <span
                      className={[
                        'block text-[13px] font-semibold tracking-tight',
                        active ? 'text-brand-700' : 'text-foreground',
                      ].join(' ')}
                    >
                      {item.name}
                    </span>
                    <span
                      className={[
                        'block text-[11px]',
                        active ? 'text-brand-600' : 'text-slate-400',
                      ].join(' ')}
                    >
                      {item.stage}
                    </span>
                  </span>
                </NavLink>

                {!isLast && (
                  <ChevronIcon className="size-3.5 shrink-0 text-slate-300" />
                )}
              </div>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 self-end xl:self-auto">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
            MVP Roadmap
          </span>
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
