import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import MemoryToast, { type MemoryToastPayload } from '../components/ui/MemoryToast'
import { useAiConversation } from '../lib/aiConversation'
import { usePhaseHref } from '../lib/usePhase'

const checks = [
  {
    id: 'brand',
    label: 'Brand compliant',
    evidence: 'Voice, color, and CTA treatment match approved visual rules.',
    passed: true,
  },
  {
    id: 'a11y',
    label: 'Accessibility passed',
    evidence: 'Contrast and focus order clear the checks I run before ship.',
    passed: true,
  },
  {
    id: 'content',
    label: 'Required content present',
    evidence: 'Headline, body, and single CTA are all present.',
    passed: true,
  },
  {
    id: 'type',
    label: 'Typography verified',
    evidence: 'Heading hierarchy matches the design system scale.',
    passed: true,
  },
  {
    id: 'layout',
    label: 'Layout fidelity',
    evidence: 'Spacing and alignment stay within brand layout patterns.',
    passed: true,
  },
] as const

const formats = [
  {
    id: 'png',
    label: 'PNG',
    detail: 'Social and display assets from memory',
  },
  {
    id: 'pdf',
    label: 'PDF',
    detail: 'Print-ready flyer and deck pages',
  },
  {
    id: 'html',
    label: 'HTML',
    detail: 'Email and landing modules, on-brand',
  },
] as const

type DownloadStatus = 'idle' | 'loading' | 'done'

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 5.25v3.5M8 11.25h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.13 2.9 1.85 12.1a1 1 0 0 0 .87 1.5h10.56a1 1 0 0 0 .87-1.5L8.87 2.9a1 1 0 0 0-1.74 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Export() {
  const { hasVerifiedBrandSource, isExploratoryDraft, canScoreCompliance, beginConnectBrand } =
    useAiConversation()
  const learnBrandHref = usePhaseHref('learn-brand')
  const validateHref = usePhaseHref('validate')
  const [status, setStatus] = useState<Record<string, DownloadStatus>>({})
  const [scoreVisible, setScoreVisible] = useState(0)
  const [revealed, setRevealed] = useState(0)
  const [toast, setToast] = useState<MemoryToastPayload | null>(null)

  // Brand compliance cannot pass without a connected brand system.
  const scoredChecks = checks.map((check) =>
    check.id === 'brand'
      ? {
          ...check,
          passed: canScoreCompliance,
          evidence: canScoreCompliance
            ? check.evidence
            : 'No verified brand system connected — compliance not scored.',
        }
      : check,
  )

  const passedCount = scoredChecks.filter((c) => c.passed).length
  const score = canScoreCompliance
    ? Math.round((passedCount / scoredChecks.length) * 100)
    : 0
  const unresolved = scoredChecks.filter((c) => !c.passed)

  useEffect(() => {
    if (!canScoreCompliance) {
      setScoreVisible(0)
      setRevealed(0)
      return
    }
    const frame = window.requestAnimationFrame(() => setScoreVisible(score))
    const timers = scoredChecks.map((_, index) =>
      window.setTimeout(() => setRevealed(index + 1), 180 + index * 120),
    )
    return () => {
      window.cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [canScoreCompliance, score, scoredChecks.length])

  function download(id: string) {
    if (!canScoreCompliance) return
    setStatus((prev) => ({ ...prev, [id]: 'loading' }))
    window.setTimeout(() => {
      setStatus((prev) => ({ ...prev, [id]: 'done' }))
      setToast({
        eyebrow: 'Ready for production',
        title: 'Shipped under brand rules',
        detail: `I already verified ${passedCount} checks — this ${id.toUpperCase()} package is clear to go.`,
      })
    }, 1100)
  }

  if (!canScoreCompliance) {
    return (
      <div className="page-shell page-shell--narrow">
        <header className="page-header">
          <h1 className="page-title">Ready for Production</h1>
          <p className="page-subtitle">
            Production scoring unlocks after a verified brand system is connected.
          </p>
        </header>

        <section className="surface-card p-6" role="status">
          <p className="section-label">No compliance score yet</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {isExploratoryDraft || !hasVerifiedBrandSource
              ? 'I can’t issue a production-ready score (or 100/100) without brand memory to check against.'
              : 'Connect a verified brand system before production scoring.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to={learnBrandHref}
              className="btn-primary px-5 py-3"
              onClick={() => beginConnectBrand()}
            >
              Connect brand system
            </Link>
            <Link to={validateHref} className="btn-secondary px-5 py-3">
              Confirm brand fit
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-shell page-shell--narrow">
      <MemoryToast toast={toast} onDismiss={() => setToast(null)} />

      <header className="page-header">
        <h1 className="page-title">Ready for Production</h1>
        <p className="page-subtitle">
          I checked this campaign against brand memory. Ship when the score is clear.
        </p>
      </header>

      <section className="surface-card rise-in p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="section-label">Production score</p>
            <p className="text-[12px] text-muted">
              {passedCount} of {scoredChecks.length} brand checks passed
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-[2.75rem] font-semibold tracking-tight text-foreground tabular-nums"
              aria-label={`Production score ${score}`}
            >
              {score}
            </span>
            <span className="text-sm font-medium text-muted">/ 100</span>
          </div>
        </div>

        <div className="mt-5">
          <ConfidenceBar
            value={scoreVisible}
            tone="emerald"
            size="lg"
            caption="production"
            label="Production score"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-label">What I verified</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-[0.875rem] border border-border bg-surface shadow-soft">
          {scoredChecks.map((check, index) => {
            const visible = index < revealed

            return (
              <li
                key={check.id}
                className={[
                  'row-hover flex items-start gap-3 px-4 py-3.5 transition-all duration-200',
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                    check.passed
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-700',
                  ].join(' ')}
                >
                  {check.passed ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <AlertIcon className="size-3.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                    {check.evidence}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="section-label">Needs attention</h2>
        {unresolved.length === 0 ? (
          <p className="fade-in text-sm text-muted">
            Nothing blocking production — I wouldn’t hold this back.
          </p>
        ) : (
          <ul className="stagger space-y-2">
            {unresolved.map((issue) => (
              <li
                key={issue.id}
                className="flex items-start gap-3 rounded-[0.875rem] border border-amber-200 bg-amber-50 px-4 py-3.5"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                  <AlertIcon className="size-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-amber-950">{issue.label}</p>
                  <p className="mt-0.5 text-[12px] text-amber-800">
                    Resolve before production release.
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="section-label">Take assets to production</h2>
        <div className="stagger grid gap-3 sm:grid-cols-3">
          {formats.map((format) => {
            const state = status[format.id] ?? 'idle'

            return (
              <button
                key={format.id}
                type="button"
                disabled={state === 'loading'}
                onClick={() => download(format.id)}
                className={[
                  'surface-card surface-card-interactive p-5 text-left',
                  state === 'done' ? 'border-brand-300 ring-2 ring-brand-100' : '',
                ].join(' ')}
              >
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {format.label}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  {format.detail}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-[12px] font-medium text-brand-600">
                    {state === 'loading'
                      ? 'Preparing…'
                      : state === 'done'
                        ? 'Ready'
                        : 'Download'}
                  </p>
                  {state === 'loading' && (
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-bar" />
                    </div>
                  )}
                  {state === 'done' && (
                    <div className="fade-in progress-track" aria-hidden="true">
                      <div className="h-full w-full rounded-full bg-brand-500" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
