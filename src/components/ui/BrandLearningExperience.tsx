import { useEffect, useRef, useState } from 'react'

type Milestone = {
  id: string
  label: string
  detail?: string
  delay: number
}

type Insight = {
  id: string
  text: string
  afterMilestone: string
  delay: number
}

const milestones: Milestone[] = [
  {
    id: 'guidelines',
    label: 'Reading Brand Guidelines',
    detail: 'Notion, PDFs',
    delay: 400,
  },
  {
    id: 'design',
    label: 'Importing Design System',
    detail: 'Figma, DAM',
    delay: 1400,
  },
  {
    id: 'campaigns',
    label: 'Understanding Approved Campaigns',
    delay: 2400,
  },
  {
    id: 'channels',
    label: 'Connecting Brand Rules across channels',
    delay: 3600,
  },
  {
    id: 'patterns',
    label: 'Identifying reusable campaign patterns',
    delay: 4800,
  },
  {
    id: 'memory',
    label: 'Building Enterprise Marketing Memory',
    delay: 6000,
  },
]

const insights: Insight[] = [
  {
    id: 'i1',
    text: 'Healthcare campaigns lead with the customer problem — I’ll treat that as default narrative order.',
    afterMilestone: 'campaigns',
    delay: 2900,
  },
  {
    id: 'i2',
    text: 'Channel rules are connecting — LinkedIn leads with insight; email leads with outcome.',
    afterMilestone: 'channels',
    delay: 4100,
  },
  {
    id: 'i3',
    text: 'I noticed webinar heroes still fight over two CTAs — I’ll flag that for your call.',
    afterMilestone: 'patterns',
    delay: 5300,
  },
]

const MEMORY_COMPLETENESS = 94

type BrandLearningExperienceProps = {
  onComplete: () => void
}

export default function BrandLearningExperience({
  onComplete,
}: BrandLearningExperienceProps) {
  const [completed, setCompleted] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [visibleInsights, setVisibleInsights] = useState<string[]>([])
  const [completeness, setCompleteness] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const timers: number[] = []

    milestones.forEach((milestone, index) => {
      timers.push(
        window.setTimeout(() => {
          setActiveId(milestone.id)
        }, milestone.delay),
      )

      const completeAt = milestone.delay + 700
      timers.push(
        window.setTimeout(() => {
          setCompleted((prev) =>
            prev.includes(milestone.id) ? prev : [...prev, milestone.id],
          )
          setActiveId((current) =>
            current === milestone.id ? null : current,
          )
        }, completeAt),
      )

      if (index === milestones.length - 1) {
        timers.push(
          window.setTimeout(() => {
            setCompleteness(MEMORY_COMPLETENESS)
          }, completeAt + 200),
        )
        timers.push(
          window.setTimeout(() => {
            onCompleteRef.current()
          }, completeAt + 1100),
        )
      }
    })

    insights.forEach((insight) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleInsights((prev) =>
            prev.includes(insight.id) ? prev : [...prev, insight.id],
          )
        }, insight.delay),
      )
    })

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const liveProgress =
    (completed.length / milestones.length) * MEMORY_COMPLETENESS +
    (activeId ? MEMORY_COMPLETENESS / milestones.length / 2 : 0)

  const barValue = completeness || Math.min(liveProgress, MEMORY_COMPLETENESS - 1)
  const shownValue = Math.round(barValue)

  return (
    <div className="fade-in page-shell page-shell--narrow max-w-xl py-6">
      <header className="page-header">
        <p className="text-[11px] font-medium tracking-[0.04em] text-brand-600 uppercase">
          Memory is learning
        </p>
        <h1 className="page-title">Learning your enterprise…</h1>
        <p className="page-subtitle">
          Guidelines, design system, and approved campaigns — the three sources
          that teach me what on-brand means.
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[12px] font-medium text-foreground">
            Memory completeness
          </p>
          <p className="text-[12px] font-semibold tabular-nums text-brand-700">
            {shownValue}%
          </p>
        </div>
        <div
          className="confidence-track confidence-track--lg"
          role="progressbar"
          aria-valuenow={shownValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Memory completeness"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
            style={{
              width: `${barValue}%`,
              transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      <ol className="space-y-0">
        {milestones.map((milestone, index) => {
          const isDone = completed.includes(milestone.id)
          const isActive = activeId === milestone.id
          const isLast = index === milestones.length - 1
          const insightForStep = insights.filter(
            (insight) =>
              insight.afterMilestone === milestone.id &&
              visibleInsights.includes(insight.id),
          )

          return (
            <li key={milestone.id} className="relative pl-8">
              {!isLast && (
                <span
                  className="absolute top-3 bottom-0 left-[0.55rem] w-px bg-border"
                  aria-hidden="true"
                />
              )}
              <span
                className={[
                  'absolute top-2.5 left-0 flex size-5 items-center justify-center rounded-full border transition-all duration-[180ms]',
                  isDone
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : isActive
                      ? 'border-brand-400 bg-brand-50 text-brand-600 shadow-[0_0_0_4px_rgb(239_246_255)]'
                      : 'border-border bg-white text-transparent',
                ].join(' ')}
                aria-hidden="true"
              >
                {isDone ? (
                  <CheckIcon className="size-3" />
                ) : isActive ? (
                  <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
                ) : null}
              </span>

              <div
                className={[
                  'pb-6 transition-all duration-[180ms]',
                  isDone || isActive
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-0.5 opacity-40',
                ].join(' ')}
              >
                <p
                  className={[
                    'text-sm font-medium tracking-tight',
                    isDone || isActive ? 'text-foreground' : 'text-muted',
                  ].join(' ')}
                >
                  {isDone ? '✓ ' : ''}
                  {milestone.label}
                  {milestone.detail ? (
                    <span className="font-normal text-muted">
                      {' '}
                      ({milestone.detail})
                    </span>
                  ) : null}
                </p>

                {insightForStep.map((insight) => (
                  <div
                    key={insight.id}
                    className="rise-in mt-3 rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-3"
                  >
                    <p className="text-[11px] font-medium tracking-wide text-brand-600 uppercase">
                      I’m noticing
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-foreground">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2 4.8 8.5 9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
