import { useState } from 'react'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import MemoryToast, { type MemoryToastPayload } from '../components/ui/MemoryToast'
import StatusBadge from '../components/ui/StatusBadge'
import { useAiConversation } from '../lib/aiConversation'

type RecStatus = 'pending' | 'accepted' | 'ignored'
type EvidenceOpen = string | null

type MarketInsight = {
  id: string
  insight: string
  confidence: number
  source: string
  why: string
  action: string
}

type MarketCategory = {
  id: string
  title: string
  summary: string
  insights: MarketInsight[]
}

type EnterpriseItem = {
  id: string
  title: string
  detail: string
  signal: string
  tone: 'emerald' | 'amber' | 'slate' | 'brand'
}

type Recommendation = {
  id: string
  title: string
  external: string
  internal: string
  impact: string
  confidence: number
  memoryRule: string
  evidence: string[]
}

type MemoryEvent = {
  id: string
  kind: 'accepted' | 'pattern' | 'emerging' | 'deprecated'
  title: string
  detail: string
  time: string
  awaitingApproval?: boolean
}

const marketCategories: MarketCategory[] = [
  {
    id: 'competitors',
    title: 'Competitor Trends',
    summary: 'What category leaders are changing before you do.',
    insights: [
      {
        id: 'c1',
        insight:
          '6 of your top competitors shifted toward short-form case studies.',
        confidence: 88,
        source: 'Competitive crawl · last 45 days',
        why: 'Proof under 150 words is becoming the default attention format.',
        action: 'Pilot short-form proof stories on launch and webinar pages.',
      },
      {
        id: 'c2',
        insight: 'Product-first imagery is increasing on LinkedIn.',
        confidence: 82,
        source: 'LinkedIn creative scan · 8 competitors',
        why: 'Lifestyle cuts are losing share of voice to product frames.',
        action: 'Lead LinkedIn creatives with the product, then proof.',
      },
      {
        id: 'c3',
        insight:
          'Clinician-led headlines outperform feature-led messaging.',
        confidence: 91,
        source: 'Healthcare category copy audit',
        why: 'Peer authority beats feature lists with clinical buyers.',
        action: 'Default healthcare subjects to clinician-first framing.',
      },
    ],
  },
  {
    id: 'channels',
    title: 'Channel Trends',
    summary: 'Where engagement is moving across your mix.',
    insights: [
      {
        id: 'ch1',
        insight: 'Carousel engagement increased 14% on LinkedIn.',
        confidence: 79,
        source: 'LinkedIn channel benchmark · Q2',
        why: 'Multi-frame stories hold attention longer than single static posts.',
        action: 'Use carousels for product education and proof sequences.',
      },
      {
        id: 'ch2',
        insight: 'Email subject lines under 45 characters perform better.',
        confidence: 86,
        source: 'Industry email panel · 12k sends',
        why: 'Shorter subjects survive truncation and scan faster on mobile.',
        action: 'Cap nurture subjects at 45 characters.',
      },
      {
        id: 'ch3',
        insight:
          'Video explainers outperform static graphics for product launches.',
        confidence: 84,
        source: 'Launch creative study · SaaS cohort',
        why: 'Motion clarifies product value faster than still lifestyle art.',
        action: 'Pair every launch hero with a 30–45s explainer cut.',
      },
    ],
  },
  {
    id: 'audience',
    title: 'Audience Trends',
    summary: 'How buyers are responding before they convert.',
    insights: [
      {
        id: 'a1',
        insight:
          'Decision-makers increasingly engage with ROI-focused messaging.',
        confidence: 87,
        source: 'Buyer intent panels · enterprise',
        why: 'Economic buyers prioritize quantified outcomes over features.',
        action: 'Lead ABM and exec nurture with ROI claims first.',
      },
      {
        id: 'a2',
        insight:
          'Educational content is outperforming promotional campaigns.',
        confidence: 81,
        source: 'Content engagement index · mid-market',
        why: 'Buyers reward teaching over pitching earlier in the funnel.',
        action: 'Replace promo-only sequences with teach → proof → ask arcs.',
      },
    ],
  },
]

const winningCampaigns: EnterpriseItem[] = [
  {
    id: 'w1',
    title: 'Q3 Product Launch — EMEA',
    detail:
      'Launch campaigns using product-first imagery consistently outperform lifestyle imagery.',
    signal: 'Winning',
    tone: 'emerald',
  },
  {
    id: 'w2',
    title: 'Healthcare Webinar Series',
    detail:
      'Healthcare webinars convert better with clinician-first headlines.',
    signal: 'Winning',
    tone: 'emerald',
  },
]

const reusablePatterns: EnterpriseItem[] = [
  {
    id: 'p1',
    title: 'Single CTA heroes',
    detail:
      'Single CTA campaigns outperform dual CTA campaigns by 18%.',
    signal: 'Reuse',
    tone: 'brand',
  },
  {
    id: 'p2',
    title: 'Product-first imagery',
    detail:
      'Opening on the product frame before proof lifts launch CTR across EMEA.',
    signal: 'Reuse',
    tone: 'brand',
  },
  {
    id: 'p3',
    title: 'Clinician-first headlines',
    detail:
      'Peer-led subjects beat feature-led subjects in clinical webinar invites.',
    signal: 'Reuse',
    tone: 'brand',
  },
]

const needsAttention: EnterpriseItem[] = [
  {
    id: 'n1',
    title: 'Partner Co-Marketing Kit',
    detail:
      'Voice drifts when partners invent accents outside the design system.',
    signal: 'Watch',
    tone: 'amber',
  },
  {
    id: 'n2',
    title: 'Lifecycle Nurture — SMB',
    detail:
      'Dual offers in the same email dilute response versus one clear ask.',
    signal: 'Watch',
    tone: 'amber',
  },
]

const recommendationsSeed: Recommendation[] = [
  {
    id: 'r1',
    title: 'Adopt clinician-first headlines as the default webinar template.',
    external:
      'Clinician-led messaging is increasing across healthcare competitors.',
    internal:
      'Your highest-performing webinar campaigns already follow this pattern.',
    impact: '+11–18% webinar invite engagement in healthcare segments',
    confidence: 92,
    memoryRule: 'Healthcare webinars · clinician-first headline',
    evidence: [
      'Category copy audit: clinician-led subjects beat feature-led by 19%.',
      'Internal: Healthcare Webinar Series conversion led peer-first subjects.',
      'Competitor sample: 5 of 8 peers now open with clinician outcomes.',
    ],
  },
  {
    id: 'r2',
    title: 'Make product-first imagery the default for launch heroes.',
    external: 'Product-first imagery is increasing on LinkedIn across the category.',
    internal:
      'Your EMEA launch creatives already win when the product leads the frame.',
    impact: '+18% CTR vs lifestyle-led launch creatives',
    confidence: 89,
    memoryRule: 'Launch creatives · product-first imagery',
    evidence: [
      'LinkedIn creative scan: product frames gaining share of voice.',
      'Internal: Q3 EMEA launch outperformed lifestyle variants.',
      'Video explainers plus product frames compound launch lift.',
    ],
  },
  {
    id: 'r3',
    title: 'Standardize short-form case studies under 150 words.',
    external:
      '6 of your top competitors shifted toward short-form case studies.',
    internal:
      'Your strongest proof assets already compress to one quantified outcome.',
    impact: 'Higher proof completion and faster reuse across channels',
    confidence: 85,
    memoryRule: 'Proof format · short-form case study',
    evidence: [
      'Competitive crawl: short-form proof rising for 45 days.',
      'Internal: single-metric stories outperform multi-page PDFs in nurture.',
      'Channel fit: carousels and email both favor compressed proof.',
    ],
  },
]

const memoryTimelineSeed: MemoryEvent[] = [
  {
    id: 'm1',
    kind: 'accepted',
    title: 'Single-CTA webinar heroes',
    detail: 'Approved and written into brand memory.',
    time: '2h ago',
  },
  {
    id: 'm2',
    kind: 'pattern',
    title: 'Problem → proof → CTA arc',
    detail: 'New reusable pattern from top-quartile launch campaigns.',
    time: 'Yesterday',
  },
  {
    id: 'm3',
    kind: 'emerging',
    title: 'ROI-first ABM openers',
    detail: 'Observed across audience trends — awaiting your approval.',
    time: '2d ago',
    awaitingApproval: true,
  },
  {
    id: 'm4',
    kind: 'deprecated',
    title: 'Dual-CTA webinar heroes',
    detail: 'Retired after single-CTA campaigns outperformed by 18%.',
    time: 'Last week',
  },
]

const kindLabel: Record<MemoryEvent['kind'], string> = {
  accepted: 'Accepted',
  pattern: 'Reusable pattern',
  emerging: 'Emerging',
  deprecated: 'Deprecated',
}

const kindTone: Record<
  MemoryEvent['kind'],
  'emerald' | 'brand' | 'amber' | 'slate'
> = {
  accepted: 'emerald',
  pattern: 'brand',
  emerging: 'amber',
  deprecated: 'slate',
}

export default function CampaignIntelligence() {
  const { askIntelligence, setSelection } = useAiConversation()
  const [statuses, setStatuses] = useState<Record<string, RecStatus>>(() =>
    Object.fromEntries(recommendationsSeed.map((r) => [r.id, 'pending'])),
  )
  const [evidenceOpen, setEvidenceOpen] = useState<EvidenceOpen>(null)
  const [timeline, setTimeline] = useState<MemoryEvent[]>(memoryTimelineSeed)
  const [toast, setToast] = useState<MemoryToastPayload | null>(null)

  const intelPrompts = [
    'Why are you recommending this?',
    'Compare this trend with our previous campaigns.',
    'Which recommendation has the highest expected impact?',
  ] as const

  function askAboutRec(rec: Recommendation, prompt?: string) {
    setSelection({
      kind: 'asset',
      ids: [rec.id],
      labels: [rec.title],
      summary: `Recommendation: ${rec.title} · impact ${rec.impact} · confidence ${rec.confidence}%`,
    })
    askIntelligence(prompt ?? `Why are you recommending “${rec.title}”?`)
  }

  function accept(id: string) {
    const rec = recommendationsSeed.find((r) => r.id === id)
    if (!rec) return

    setStatuses((prev) => ({ ...prev, [id]: 'accepted' }))
    setEvidenceOpen(null)
    setTimeline((prev) => [
      {
        id: `accepted-${id}-${Date.now()}`,
        kind: 'accepted',
        title: rec.memoryRule,
        detail:
          'You approved this — now permanent in brand memory.',
        time: 'Just now',
      },
      ...prev,
    ])
    setToast({
      eyebrow: 'Brand memory',
      title: 'Accepted into marketing memory',
      detail: `I’ll apply “${rec.memoryRule}” on the next draft.`,
    })
  }

  function ignore(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: 'ignored' }))
    setEvidenceOpen(null)
    setToast({
      eyebrow: 'Ignored',
      title: 'Left out of memory',
      detail: 'I won’t write this into permanent memory unless you bring it back.',
    })
  }

  function undo(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: 'pending' }))
    setTimeline((prev) =>
      prev.filter((item) => !item.id.startsWith(`accepted-${id}`)),
    )
  }

  const pendingCount = recommendationsSeed.filter(
    (r) => (statuses[r.id] ?? 'pending') === 'pending',
  ).length

  return (
    <div className="page-shell page-shell--wide pb-12">
      <MemoryToast toast={toast} onDismiss={() => setToast(null)} />

      <header className="page-header max-w-3xl">
        <p className="eyebrow text-brand-600">AI Marketing Strategist</p>
        <h1 className="page-title">Before your next campaign</h1>
        <p className="page-subtitle max-w-2xl">
          What the market is doing, what your company is learning, what to change,
          and what should become permanent in brand memory.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {intelPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => askIntelligence(prompt)}
              className="ai-chip"
            >
              {prompt}
            </button>
          ))}
        </div>
      </header>

      {/* Section 1 — External Market Intelligence */}
      <section className="space-y-5">
        <div className="page-header">
          <p className="eyebrow">External Market Intelligence</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What&apos;s changing in your market
          </h2>
          <p className="page-subtitle">
            Recent trends detected across your industry, competitors and
            marketing channels.
          </p>
        </div>

        <div className="stagger grid gap-5 xl:grid-cols-3">
          {marketCategories.map((category, categoryIndex) => (
            <article
              key={category.id}
              className="surface-card rise-in flex flex-col overflow-hidden"
              style={{ animationDelay: `${categoryIndex * 70}ms` }}
            >
              <div className="border-b border-border bg-gradient-to-br from-slate-50 via-white to-brand-50/40 px-5 py-5">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {category.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {category.summary}
                </p>
              </div>

              <ul className="flex flex-1 flex-col divide-y divide-border">
                {category.insights.map((item) => (
                  <li key={item.id} className="px-5 py-5">
                    <p className="text-sm font-semibold leading-snug tracking-tight text-foreground">
                      {item.insight}
                    </p>

                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <p className="eyebrow">Trend confidence</p>
                          <span className="text-[11px] font-medium tabular-nums text-muted">
                            {item.confidence}%
                          </span>
                        </div>
                        <ConfidenceBar
                          value={item.confidence}
                          caption=""
                          size="sm"
                        />
                      </div>

                      <InsightMeta label="Evidence source" value={item.source} />
                      <InsightMeta label="Why it matters" value={item.why} />
                      <InsightMeta
                        label="Recommended action"
                        value={item.action}
                        emphasize
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2 — Enterprise Intelligence */}
      <section className="space-y-5">
        <div className="page-header">
          <p className="eyebrow">Enterprise Intelligence</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What your company is learning
          </h2>
          <p className="page-subtitle">
            Insights discovered from your own campaigns.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <EnterpriseColumn
            title="Winning Campaigns"
            items={winningCampaigns}
          />
          <EnterpriseColumn
            title="Patterns worth reusing"
            items={reusablePatterns}
          />
          <EnterpriseColumn
            title="Campaigns needing attention"
            items={needsAttention}
          />
        </div>
      </section>

      {/* Section 3 — AI Recommendations */}
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="page-header">
            <p className="eyebrow">AI Recommendations</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              What you should do differently
            </h2>
            <p className="page-subtitle">
              Each recommendation combines external market signal with your
              internal campaign evidence — and needs your approval before it
              becomes permanent memory.
            </p>
          </div>
          {pendingCount > 0 && (
            <p className="meta shrink-0">{pendingCount} awaiting approval</p>
          )}
        </div>

        <ul className="space-y-4">
          {recommendationsSeed.map((rec, index) => {
            const status = statuses[rec.id] ?? 'pending'
            const showEvidence = evidenceOpen === rec.id

            return (
              <li
                key={rec.id}
                className="surface-card rise-in overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_14rem]">
                  <div className="p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone="brand" dot={false}>
                        Combined intelligence
                      </StatusBadge>
                      <StatusBadge
                        tone={
                          status === 'accepted'
                            ? 'emerald'
                            : status === 'ignored'
                              ? 'slate'
                              : 'amber'
                        }
                        dot={false}
                      >
                        {status === 'accepted'
                          ? 'In memory'
                          : status === 'ignored'
                            ? 'Ignored'
                            : 'Needs approval'}
                      </StatusBadge>
                    </div>

                    <h3
                      className={[
                        'mt-3 text-[1.05rem] font-semibold leading-snug tracking-tight',
                        status === 'ignored'
                          ? 'text-slate-400 line-through'
                          : 'text-foreground',
                      ].join(' ')}
                    >
                      {rec.title}
                    </h3>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <EvidenceBlock
                        label="External evidence"
                        value={rec.external}
                        muted={status === 'ignored'}
                      />
                      <EvidenceBlock
                        label="Internal evidence"
                        value={rec.internal}
                        muted={status === 'ignored'}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 space-y-1.5">
                        <p className="eyebrow">Expected impact</p>
                        <p
                          className={[
                            'text-sm font-medium',
                            status === 'ignored'
                              ? 'text-slate-400'
                              : 'text-foreground',
                          ].join(' ')}
                        >
                          {rec.impact}
                        </p>
                      </div>
                      <div className="w-full max-w-[11rem]">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <p className="eyebrow">Confidence</p>
                          <span className="text-[11px] font-medium tabular-nums text-muted">
                            {rec.confidence}%
                          </span>
                        </div>
                        <ConfidenceBar
                          value={rec.confidence}
                          caption=""
                          size="sm"
                        />
                      </div>
                    </div>

                    {showEvidence && (
                      <div className="fade-in mt-5 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-4">
                        <p className="eyebrow text-brand-700">Evidence detail</p>
                        <ul className="mt-2 space-y-2">
                          {rec.evidence.map((line) => (
                            <li
                              key={line}
                              className="flex gap-2 text-[13px] leading-relaxed text-brand-900/80"
                            >
                              <span
                                className="mt-2 size-1 shrink-0 rounded-full bg-brand-500"
                                aria-hidden="true"
                              />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {status === 'accepted' && (
                      <p className="fade-in mt-4 text-[12px] font-medium text-brand-700">
                        Approved — “{rec.memoryRule}” is now in Enterprise
                        Marketing Memory.
                      </p>
                    )}
                  </div>

                  <aside className="flex flex-col justify-center gap-2 border-t border-border bg-slate-50/70 p-5 lg:border-t-0 lg:border-l">
                    {status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => accept(rec.id)}
                          className="btn-primary w-full px-3 py-2.5 text-[12px]"
                        >
                          Accept into brand memory
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEvidenceOpen(showEvidence ? null : rec.id)
                          }
                          className="btn-secondary w-full px-3 py-2.5 text-[12px]"
                        >
                          {showEvidence ? 'Hide evidence' : 'Review Evidence'}
                        </button>
                        <button
                          type="button"
                          onClick={() => askAboutRec(rec)}
                          className="btn-secondary w-full px-3 py-2.5 text-[12px]"
                        >
                          Ask AI why
                        </button>
                        <button
                          type="button"
                          onClick={() => ignore(rec.id)}
                          className="btn-secondary w-full px-3 py-2.5 text-[12px] text-muted"
                        >
                          Ignore
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => undo(rec.id)}
                        className="btn-secondary w-full px-3 py-2.5 text-[12px] text-muted"
                      >
                        Undo
                      </button>
                    )}
                  </aside>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Section 4 — Memory Evolution */}
      <section className="space-y-5">
        <div className="page-header">
          <p className="eyebrow">Memory Evolution</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            How brand memory evolves
          </h2>
          <p className="page-subtitle">
            Accepted recommendations, reusable patterns, emerging observations,
            and deprecated patterns — nothing becomes permanent without human
            approval.
          </p>
        </div>

        <div className="surface-card p-6 sm:p-7">
          <ul className="relative space-y-0">
            <span
              className="absolute top-3 bottom-3 left-[0.3rem] w-px bg-border"
              aria-hidden="true"
            />
            {timeline.map((item, index) => (
              <li
                key={item.id}
                className="relative rise-in flex gap-4 py-4 pl-6 first:pt-1 last:pb-1"
                style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
              >
                <span
                  className={[
                    'absolute top-5 left-0 size-2.5 rounded-full ring-4 ring-white',
                    item.kind === 'accepted'
                      ? 'bg-brand-600'
                      : item.kind === 'pattern'
                        ? 'bg-brand-400'
                        : item.kind === 'emerging'
                          ? 'bg-amber-500'
                          : 'bg-slate-300',
                  ].join(' ')}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <StatusBadge tone={kindTone[item.kind]} dot={false}>
                      {kindLabel[item.kind]}
                    </StatusBadge>
                    {item.awaitingApproval && (
                      <StatusBadge tone="amber" dot={false}>
                        Awaiting approval
                      </StatusBadge>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                  <p className="meta mt-2">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function InsightMeta({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p
        className={[
          'mt-1 text-[13px] leading-relaxed',
          emphasize ? 'font-medium text-brand-700' : 'text-muted',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

function EvidenceBlock({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/80 px-4 py-3.5">
      <p className="eyebrow">{label}</p>
      <p
        className={[
          'mt-1.5 text-[13px] leading-relaxed',
          muted ? 'text-slate-400' : 'text-foreground',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

function EnterpriseColumn({
  title,
  items,
}: {
  title: string
  items: EnterpriseItem[]
}) {
  return (
    <section className="surface-card flex flex-col p-5 sm:p-6">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <ul className="mt-5 flex flex-1 flex-col divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <StatusBadge tone={item.tone} dot={false}>
                {item.signal}
              </StatusBadge>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
