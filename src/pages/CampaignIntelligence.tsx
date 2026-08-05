import { useState } from 'react'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import MemoryToast, { type MemoryToastPayload } from '../components/ui/MemoryToast'
import StatusBadge from '../components/ui/StatusBadge'
import { useAiConversation } from '../lib/aiConversation'

type RecStatus = 'pending' | 'accepted' | 'ignored'

type Trend = {
  id: string
  label: string
  insight: string
  confidence: number
}

type Learning = {
  id: string
  title: string
  detail: string
  tone: 'emerald' | 'amber' | 'brand'
  signal: string
}

type Recommendation = {
  id: string
  title: string
  impact: string
  confidence: number
  memoryRule: string
}

const roiMetrics = [
  { label: 'Campaigns / month', value: '24', delta: '+38% vs last year' },
  { label: 'High-yield this quarter', value: '11', delta: '+4 vs Q1' },
  { label: 'Avg. time to launch', value: '4.2d', delta: '−41% cycle time' },
  { label: 'Reuse from memory', value: '67%', delta: 'of new drafts' },
  { label: 'Lift on accepted rules', value: '+19%', delta: 'median engagement' },
] as const

const marketTrends: Trend[] = [
  {
    id: 't1',
    label: 'Competitors',
    insight: '6 peers moved to short-form case studies (<150 words).',
    confidence: 88,
  },
  {
    id: 't2',
    label: 'Channels',
    insight: 'LinkedIn carousels up 14%; video explainers beat static on launches.',
    confidence: 84,
  },
  {
    id: 't3',
    label: 'Audience',
    insight: 'ROI-first messaging is winning with economic buyers.',
    confidence: 87,
  },
  {
    id: 't4',
    label: 'Creative',
    insight: 'Product-first imagery gaining share of voice over lifestyle cuts.',
    confidence: 82,
  },
]

const campaignLearnings: Learning[] = [
  {
    id: 'l1',
    title: 'Product-first launch heroes',
    detail: 'Q3 EMEA launch CTR +18% vs lifestyle variants.',
    signal: 'Winning',
    tone: 'emerald',
  },
  {
    id: 'l2',
    title: 'Clinician-first headlines',
    detail: 'Healthcare webinars convert best with peer-led subjects.',
    signal: 'Winning',
    tone: 'emerald',
  },
  {
    id: 'l3',
    title: 'Single CTA heroes',
    detail: 'Beat dual-CTA campaigns by 18% — reuse as default.',
    signal: 'Reuse',
    tone: 'brand',
  },
  {
    id: 'l4',
    title: 'Dual offers in SMB nurture',
    detail: 'Two asks in one email dilute response.',
    signal: 'Watch',
    tone: 'amber',
  },
]

const recommendationsSeed: Recommendation[] = [
  {
    id: 'r1',
    title: 'Default healthcare webinars to clinician-first headlines',
    impact: '+11–18% invite engagement',
    confidence: 92,
    memoryRule: 'Healthcare webinars · clinician-first headline',
  },
  {
    id: 'r2',
    title: 'Make product-first imagery the launch hero default',
    impact: '+18% CTR vs lifestyle',
    confidence: 89,
    memoryRule: 'Launch creatives · product-first imagery',
  },
  {
    id: 'r3',
    title: 'Standardize short-form case studies under 150 words',
    impact: 'Faster proof reuse across channels',
    confidence: 85,
    memoryRule: 'Proof format · short-form case study',
  },
]

export default function CampaignIntelligence() {
  const { askIntelligence, setSelection } = useAiConversation()
  const [statuses, setStatuses] = useState<Record<string, RecStatus>>(() =>
    Object.fromEntries(recommendationsSeed.map((r) => [r.id, 'pending'])),
  )
  const [toast, setToast] = useState<MemoryToastPayload | null>(null)

  function accept(id: string) {
    const rec = recommendationsSeed.find((r) => r.id === id)
    if (!rec) return
    setStatuses((prev) => ({ ...prev, [id]: 'accepted' }))
    setToast({
      eyebrow: 'Brand memory',
      title: 'Accepted into marketing memory',
      detail: `I’ll apply “${rec.memoryRule}” on the next draft.`,
    })
  }

  function ignore(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: 'ignored' }))
    setToast({
      eyebrow: 'Ignored',
      title: 'Left out of memory',
      detail: 'I won’t write this into permanent memory unless you bring it back.',
    })
  }

  function undo(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: 'pending' }))
  }

  function askAboutRec(rec: Recommendation) {
    setSelection({
      kind: 'asset',
      ids: [rec.id],
      labels: [rec.title],
      summary: `Recommendation: ${rec.title} · impact ${rec.impact} · confidence ${rec.confidence}%`,
    })
    askIntelligence(`Why are you recommending “${rec.title}”?`)
  }

  const pendingCount = recommendationsSeed.filter(
    (r) => (statuses[r.id] ?? 'pending') === 'pending',
  ).length

  return (
    <div className="page-shell page-shell--wide pb-12">
      <MemoryToast toast={toast} onDismiss={() => setToast(null)} />

      <header className="page-header">
        <h1 className="page-title">Marketing Intelligence</h1>
        <p className="page-subtitle">
          Market signals and your campaign learnings — before the next brief.
        </p>
      </header>

      {/* ROI metrics */}
      <section
        aria-label="Platform impact"
        className="stagger grid grid-cols-2 gap-x-5 gap-y-5 border-y border-border py-5 sm:grid-cols-3 lg:grid-cols-5"
      >
        {roiMetrics.map((metric, index) => (
          <div
            key={metric.label}
            className="rise-in space-y-1"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <p className="eyebrow">{metric.label}</p>
            <p className="text-[1.5rem] font-semibold tracking-tight tabular-nums text-foreground">
              {metric.value}
            </p>
            <p className="meta">{metric.delta}</p>
          </div>
        ))}
      </section>

      {/* Two pillars */}
      <section
        aria-label="Intelligence sources"
        className="grid gap-5 lg:grid-cols-2"
      >
        <article className="rise-in flex flex-col border-t-2 border-t-brand-500 pt-4">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <p className="eyebrow text-brand-600">01 · External</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Market & competitor trends
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                askIntelligence('Summarize the strongest market trends right now.')
              }
              className="ai-chip shrink-0"
            >
              Ask AI
            </button>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {marketTrends.map((trend) => (
              <li key={trend.id} className="flex items-start gap-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">{trend.label}</p>
                  <p className="mt-1 text-sm font-medium leading-snug text-foreground">
                    {trend.insight}
                  </p>
                </div>
                <div className="w-16 shrink-0 pt-0.5">
                  <p className="mb-1 text-right text-[11px] font-medium tabular-nums text-muted">
                    {trend.confidence}%
                  </p>
                  <ConfidenceBar
                    value={trend.confidence}
                    caption=""
                    size="sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article
          className="rise-in flex flex-col border-t-2 border-t-emerald-500 pt-4"
          style={{ animationDelay: '60ms' }}
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <p className="eyebrow text-emerald-700">02 · Internal</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Learnings from past campaigns
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                askIntelligence(
                  'Compare these market trends with our previous campaigns.',
                )
              }
              className="ai-chip shrink-0"
            >
              Ask AI
            </button>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {campaignLearnings.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-snug text-muted">
                    {item.detail}
                  </p>
                </div>
                <StatusBadge tone={item.tone} dot={false}>
                  {item.signal}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Actions from both */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">From both</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Recommended changes
            </h2>
          </div>
          {pendingCount > 0 && (
            <p className="meta">{pendingCount} awaiting approval</p>
          )}
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {recommendationsSeed.map((rec) => {
            const status = statuses[rec.id] ?? 'pending'
            const muted = status === 'ignored'

            return (
              <li
                key={rec.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={[
                        'text-sm font-semibold tracking-tight',
                        muted
                          ? 'text-slate-400 line-through'
                          : 'text-foreground',
                      ].join(' ')}
                    >
                      {rec.title}
                    </p>
                    {status !== 'pending' && (
                      <StatusBadge
                        tone={status === 'accepted' ? 'emerald' : 'slate'}
                        dot={false}
                      >
                        {status === 'accepted' ? 'In memory' : 'Ignored'}
                      </StatusBadge>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className={muted ? 'meta line-through' : 'meta'}>
                      {rec.impact}
                    </p>
                    <span className="meta tabular-nums">{rec.confidence}% conf.</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => accept(rec.id)}
                        className="btn-primary px-3 py-2 text-[12px]"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => askAboutRec(rec)}
                        className="btn-secondary px-3 py-2 text-[12px]"
                      >
                        Why?
                      </button>
                      <button
                        type="button"
                        onClick={() => ignore(rec.id)}
                        className="btn-secondary px-3 py-2 text-[12px] text-muted"
                      >
                        Ignore
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => undo(rec.id)}
                      className="btn-secondary px-3 py-2 text-[12px] text-muted"
                    >
                      Undo
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
