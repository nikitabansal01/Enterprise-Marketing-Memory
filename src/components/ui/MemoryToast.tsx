import { useEffect, useState } from 'react'

export type MemoryToastPayload = {
  eyebrow: string
  title: string
  detail: string
  from?: string
  to?: string
}

type MemoryToastProps = {
  toast: MemoryToastPayload | null
  durationMs?: number
  onDismiss?: () => void
}

export default function MemoryToast({
  toast,
  durationMs = 3400,
  onDismiss,
}: MemoryToastProps) {
  const [exiting, setExiting] = useState(false)
  const [visible, setVisible] = useState<MemoryToastPayload | null>(null)

  useEffect(() => {
    if (!toast) return

    setExiting(false)
    setVisible(toast)

    const exitAt = window.setTimeout(() => setExiting(true), durationMs)
    const clearAt = window.setTimeout(() => {
      setVisible(null)
      onDismiss?.()
    }, durationMs + 220)

    return () => {
      window.clearTimeout(exitAt)
      window.clearTimeout(clearAt)
    }
  }, [toast, durationMs, onDismiss])

  if (!visible) return null

  const hasSwap = Boolean(visible.from && visible.to)

  return (
    <div
      className={[
        'fixed right-6 bottom-6 z-50 w-[min(100%-2rem,22rem)] rounded-2xl border border-brand-200 bg-white p-5 shadow-[var(--shadow-lift)]',
        exiting ? 'memory-toast-exit' : 'memory-toast',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="memory-pulse-ring mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <MemoryIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide text-brand-600 uppercase">
            {visible.eyebrow}
          </p>
          {hasSwap ? (
            <div className="memory-swap-line mt-2 space-y-1">
              <p className="text-[13px] text-slate-400 line-through">{visible.from}</p>
              <p className="text-[12px] text-slate-300">↓</p>
              <p className="text-[13px] font-semibold text-foreground">{visible.to}</p>
            </div>
          ) : (
            <p className="mt-2 text-[13px] font-semibold tracking-tight text-foreground">
              {visible.title}
            </p>
          )}
          <div className="mt-4 rounded-xl bg-brand-50 px-3 py-2.5">
            {hasSwap && (
              <p className="text-[13px] font-semibold text-brand-700">{visible.title}</p>
            )}
            <p
              className={[
                'text-[12px] leading-relaxed text-brand-700/80',
                hasSwap ? 'mt-1' : '',
              ].join(' ')}
            >
              {visible.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
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
