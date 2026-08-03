import { useEffect, useState } from 'react'

type LoadingStateProps = {
  label?: string
  variant?: 'review' | 'campaign'
}

const campaignThoughts = [
  'Matching your brief to Q3 Product Launch — EMEA…',
  'Checking the single-CTA rule from channel memory…',
  'I noticed webinar heroes still fight over two CTAs — I’ll keep one.',
  'Drafting three directions from what already works…',
]

export default function LoadingState({
  label = 'Working…',
  variant = 'review',
}: LoadingStateProps) {
  const [thoughtIndex, setThoughtIndex] = useState(0)

  useEffect(() => {
    if (variant !== 'campaign') return
    const timers = campaignThoughts.map((_, index) =>
      window.setTimeout(() => setThoughtIndex(index), index * 700),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [variant])

  if (variant === 'campaign') {
    return (
      <div className="fade-in page-shell" aria-busy="true">
        <div className="space-y-2">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-4 w-80 max-w-full" />
        </div>

        <div className="stagger grid gap-5 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
          <div className="surface-card space-y-5 p-6">
            <div className="flex gap-2">
              <div className="skeleton h-7 w-16" />
              <div className="skeleton h-7 w-16" />
              <div className="skeleton h-7 w-16" />
            </div>
            <div className="skeleton h-4 w-24" />
            <div className="skeleton mx-auto h-48 w-full max-w-sm rounded-2xl" />
            <div className="flex gap-2">
              <div className="skeleton h-6 w-20" />
              <div className="skeleton h-6 w-20" />
              <div className="skeleton h-6 w-28" />
            </div>
          </div>

          <div className="surface-card space-y-4 p-5">
            <p className="text-[11px] font-medium tracking-[0.04em] text-brand-600 uppercase">
              Memory is drafting
            </p>
            <ul className="space-y-2.5">
              {campaignThoughts.map((thought, index) => {
                const visible = index <= thoughtIndex
                const active = index === thoughtIndex

                return (
                  <li
                    key={thought}
                    className={[
                      'rounded-xl border px-3.5 py-3 transition-all duration-200',
                      visible
                        ? 'translate-y-0 border-brand-100 bg-brand-50/70 opacity-100'
                        : 'translate-y-1 border-transparent bg-transparent opacity-0',
                      active ? 'shadow-[var(--shadow-soft)]' : '',
                    ].join(' ')}
                  >
                    <p className="text-[13px] leading-relaxed text-foreground">
                      {thought}
                    </p>
                  </li>
                )
              })}
            </ul>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" />
            </div>
          </div>
        </div>

        <p className="fade-in text-sm text-muted">{label}</p>
      </div>
    )
  }

  return (
    <div className="fade-in page-shell page-shell--narrow" aria-busy="true">
      <div className="space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-72 max-w-full" />
        <div className="skeleton h-4 w-96 max-w-full" />
      </div>

      <div className="stagger space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-card space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-6 w-12" />
            </div>
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-1 w-2/3 rounded-full" />
          </div>
        ))}
      </div>

      <p className="fade-in text-sm text-muted" style={{ animationDelay: '120ms' }}>
        {label}
      </p>
    </div>
  )
}
