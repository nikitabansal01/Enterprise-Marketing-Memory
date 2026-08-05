import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AiWelcome from '../components/ai/AiWelcome'
import CampaignUnderstandingFlow from '../components/ai/CampaignUnderstandingFlow'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import MemoryToast, { type MemoryToastPayload } from '../components/ui/MemoryToast'
import StatusBadge from '../components/ui/StatusBadge'
import { useAiConversation } from '../lib/aiConversation'
import { usePhaseHref } from '../lib/usePhase'

const metrics = [
  { label: 'Memory quality', value: '87%', score: 87 },
  { label: 'Campaigns learned', value: '142' },
  { label: 'Rules in memory', value: '385' },
  { label: 'Needs judgment', value: '12', emphasize: true },
] as const

const recentCampaigns = [
  {
    id: 'q3-emea',
    name: 'Q3 Product Launch — EMEA',
    channel: 'Email',
    status: 'Published',
    updated: 'Mar 12, 2026',
  },
  {
    id: 'webinar-ai',
    name: 'Webinar: AI in Enterprise',
    channel: 'LinkedIn',
    status: 'In Review',
    updated: 'Mar 11, 2026',
  },
  {
    id: 'partner-kit',
    name: 'Partner Co-Marketing Kit',
    channel: 'Multi',
    status: 'Published',
    updated: 'Mar 10, 2026',
  },
  {
    id: 'lifecycle-smb',
    name: 'Lifecycle Nurture — SMB',
    channel: 'Email',
    status: 'Draft',
    updated: 'Mar 8, 2026',
  },
] as const

type Learning = {
  id: string
  title: string
  detail: string
  time: string
  needsJudgment?: boolean
}

const learningsSeed: Learning[] = [
  {
    id: 'l1',
    title: 'New campaign pattern detected',
    detail: 'Multi-touch nurture sequences now align with brand voice rules.',
    time: '1h ago',
  },
  {
    id: 'l2',
    title: 'Typography confidence increased',
    detail: 'Heading hierarchy consistency rose across recent assets.',
    time: '3h ago',
  },
  {
    id: 'l3',
    title: 'Webinar CTA conflict detected',
    detail:
      'I noticed webinar heroes still fight over two CTAs — I’ll flag that for your call.',
    time: 'Yesterday',
    needsJudgment: true,
  },
]

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

function DashboardBody() {
  const navigate = useNavigate()
  const learnBrandHref = usePhaseHref('learn-brand')
  const homeHref = usePhaseHref()
  const { openCampaignWorkflowStep } = useAiConversation()
  const [resolutions, setResolutions] = useState<Record<string, 'kept' | 'left'>>(
    {},
  )
  const [toast, setToast] = useState<MemoryToastPayload | null>(null)

  function openDrafts() {
    openCampaignWorkflowStep('drafts')
    navigate(homeHref)
  }

  function keepLearning(item: Learning) {
    setResolutions((prev) => ({ ...prev, [item.id]: 'kept' }))
    setToast({
      eyebrow: 'Judgment received',
      title: 'Written into memory',
      detail: 'I’ll treat single-CTA webinar heroes as the default from here.',
    })
  }

  function leaveLearning(item: Learning) {
    setResolutions((prev) => ({ ...prev, [item.id]: 'left' }))
    setToast({
      eyebrow: 'Judgment received',
      title: 'Left out of memory',
      detail: 'Understood — I won’t enforce this until you bring it back.',
    })
  }

  return (
    <div className="page-shell h-full">
      <MemoryToast toast={toast} onDismiss={() => setToast(null)} />

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Home</h1>
          <p className="page-subtitle">
            I’m solid on voice and visuals. A few learnings still need your judgment
            before I treat them as law.
          </p>
        </div>

        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Search marketing memory</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10.5 10.5 13.5 13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder="Search memory, campaigns, rules…"
            className="field-input py-2.5 pr-4 pl-9"
          />
        </label>
      </header>

      <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="surface-card p-6">
          <div className="mb-7">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Campaign dashboard
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Shared brand knowledge across campaigns, channels, and rules.
            </p>
          </div>

          <div className="stagger grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
            {metrics.map((metric, index) => (
              <div key={metric.label} className="rise-in space-y-2">
                <p className="eyebrow">{metric.label}</p>
                <p
                  className={[
                    'text-[1.5rem] font-semibold tracking-tight tabular-nums',
                    'emphasize' in metric && metric.emphasize
                      ? 'text-amber-700'
                      : 'text-foreground',
                  ].join(' ')}
                >
                  {metric.value}
                </p>
                {'score' in metric && metric.score != null && (
                  <ConfidenceBar
                    value={metric.score}
                    delayMs={index * 40}
                    caption="quality"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-9">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="section-label">Recent from memory</h3>
              <span className="meta">Last 7 days</span>
            </div>

            <div className="overflow-x-auto">
              <div className="eyebrow mb-2 hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.8fr_1.5rem] gap-3 px-2 sm:grid">
                <span>Campaign</span>
                <span>Channel</span>
                <span>Status</span>
                <span>Updated</span>
                <span className="sr-only">Open</span>
              </div>

              <ul className="-mx-2 divide-y divide-border">
                {recentCampaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <button
                      type="button"
                      onClick={openDrafts}
                      className="row-hover grid w-full grid-cols-1 items-center gap-2 rounded-lg px-2 py-3 text-left sm:grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.8fr_1.5rem] sm:gap-3"
                    >
                      <span className="truncate text-sm font-medium text-foreground">
                        {campaign.name}
                      </span>
                      <span className="text-[12px] text-muted">
                        <span className="sm:hidden">Channel · </span>
                        {campaign.channel}
                      </span>
                      <span>
                        <StatusBadge>{campaign.status}</StatusBadge>
                      </span>
                      <span className="text-[12px] text-muted">
                        <span className="sm:hidden">Updated · </span>
                        {campaign.updated}
                      </span>
                      <ChevronIcon className="hidden size-3.5 justify-self-end text-slate-300 sm:block" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={openDrafts}
                className="text-[12px] font-medium text-brand-600 transition-colors duration-150 hover:text-brand-700"
              >
                View all campaigns →
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link to={learnBrandHref} className="btn-primary">
              Teach AI Your Brand
            </Link>
            <button type="button" className="btn-secondary" onClick={openDrafts}>
              Create first draft
            </button>
          </div>
        </section>

        <aside className="surface-card fade-in p-6" style={{ animationDelay: '80ms' }}>
          <h2 className="section-label">Memory updates</h2>
          <p className="meta mt-1">What I’m learning — and where I need you</p>

          <ul className="stagger mt-5 space-y-0.5">
            {learningsSeed.map((item) => {
              const resolution = resolutions[item.id]

              return (
                <li
                  key={item.id}
                  className={[
                    'rise-in relative rounded-lg py-3 pl-4',
                    item.needsJudgment && !resolution
                      ? 'bg-amber-50/60'
                      : 'row-hover',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-4 left-0 size-1.5 rounded-full',
                      item.needsJudgment && !resolution
                        ? 'bg-amber-500'
                        : 'bg-brand-500',
                    ].join(' ')}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                  <p className="meta mt-2">{item.time}</p>

                  {item.needsJudgment && !resolution && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => keepLearning(item)}
                        className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
                      >
                        Keep in memory
                      </button>
                      <button
                        type="button"
                        onClick={() => leaveLearning(item)}
                        className="rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-muted hover:text-foreground"
                      >
                        Leave out
                      </button>
                    </div>
                  )}

                  {resolution && (
                    <p className="fade-in mt-2 text-[11px] font-medium text-brand-700">
                      {resolution === 'kept'
                        ? 'In memory — I’ll enforce this.'
                        : 'Left out — noted.'}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { experiencePreview, showUnderstandingFlow } = useAiConversation()

  // Preview tab selects which state to show; never mix both on one screen.
  if (experiencePreview === 'new') {
    if (showUnderstandingFlow) {
      return (
        <div className="ai-welcome-page mx-auto flex w-full max-w-3xl flex-col px-1 pb-10">
          <CampaignUnderstandingFlow />
        </div>
      )
    }
    return (
      <div className="ai-welcome-page mx-auto flex w-full max-w-[58rem] flex-col px-2">
        <AiWelcome />
      </div>
    )
  }

  return <DashboardBody />
}
