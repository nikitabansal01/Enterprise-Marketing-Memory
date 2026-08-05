import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingState from '../components/ui/LoadingState'
import MemoryToast, { type MemoryToastPayload } from '../components/ui/MemoryToast'
import StatusBadge from '../components/ui/StatusBadge'
import { usePhaseHref } from '../lib/usePhase'

type Step = 'brief' | 'loading' | 'directions'
type PreviewTab = 'social' | 'banner' | 'flyer'
type DirectionId = 'conservative' | 'balanced' | 'bold'
type EditableField = 'headline' | 'body' | 'cta'

type Brief = {
  objective: string
  audience: string
  product: string
  tone: string
  requiredAssets: string
}

type MemoryUpdate = {
  field: EditableField
  from: string
  to: string
}

type Direction = {
  id: DirectionId
  label: string
  why: string
  strengths: string[]
  headline: string
  body: string
  cta: string
  reasoning: {
    layout: string
    brandRules: string
    reusedCampaigns: string
    inferred: string
    lowerConfidence: string
  }
}

const tabs: { id: PreviewTab; label: string }[] = [
  { id: 'social', label: 'Social' },
  { id: 'banner', label: 'Banner' },
  { id: 'flyer', label: 'Flyer' },
]

const initialBrief: Brief = {
  objective: 'Drive qualified webinar signups for the Q3 product launch.',
  audience: 'Enterprise marketing leaders at mid-market and Fortune 500 companies.',
  product: 'Enterprise Marketing Memory',
  tone: 'Confident, plainspoken, and practical — no hype.',
  requiredAssets: 'Flyer, banner, social media graphic',
}

const fieldMeta: {
  key: keyof Brief
  label: string
  rows?: number
  placeholder: string
  memoryHint?: string
}[] = [
  {
    key: 'objective',
    label: 'Objective',
    rows: 2,
    placeholder: 'What should this campaign achieve?',
    memoryHint: 'I’ll aim for webinar signup patterns from your last six approved invites.',
  },
  {
    key: 'audience',
    label: 'Audience',
    rows: 2,
    placeholder: 'Who are you speaking to?',
    memoryHint: 'Enterprise leaders respond best to problem → proof → one CTA.',
  },
  {
    key: 'product',
    label: 'Product',
    placeholder: 'What are you promoting?',
  },
  {
    key: 'tone',
    label: 'Tone',
    rows: 2,
    placeholder: 'How should it sound?',
    memoryHint: 'I’ll stay plainspoken — short sentences, concrete verbs, no hype.',
  },
  {
    key: 'requiredAssets',
    label: 'Required Assets',
    rows: 2,
    placeholder: 'Which assets do you need?',
  },
]

function buildDirections(brief: Brief, variant: number): Direction[] {
  const product = brief.product || 'Enterprise Marketing Memory'
  const refresh = variant > 0 ? ` (v${variant + 1})` : ''

  return [
    {
      id: 'conservative',
      label: 'Conservative',
      why: 'Closest to your highest-performing approved campaigns — familiar structure, minimal risk.',
      strengths: [
        'Closest to approved campaign patterns',
        'Proven problem → proof → CTA flow',
        'Safe for regulated enterprise audiences',
      ],
      headline: `Keep every campaign on-brand.${refresh}`,
      body: `${product} remembers what already works for ${brief.audience || 'your audience'} — so new assets start from approved patterns, not a blank page.`,
      cta: 'Register for the webinar',
      reasoning: {
        layout:
          'Used a calm single-column social layout with one clear CTA. This matches how your strongest enterprise launches keep attention on one action.',
        brandRules:
          'Followed plainspoken voice rules, single-CTA channel guidance, and the preferred problem → proof → offer order from brand memory.',
        reusedCampaigns:
          'Drew from Q3 Product Launch — EMEA and Lifecycle Nurture — SMB, both approved and high-performing with similar audiences.',
        inferred:
          'Assumed webinar registration is the primary conversion based on the brief objective, and kept imagery and claims intentionally restrained.',
        lowerConfidence:
          'Speaker names, date, and legal footer weren’t in the brief — those still need a human pass before publish.',
      },
    },
    {
      id: 'balanced',
      label: 'Balanced',
      why: 'Blends memory-backed patterns with a sharper angle on the brief’s objective.',
      strengths: [
        'Strong relevance to the brief',
        'Clear differentiation without breaking voice',
        'Good for multi-channel rollout',
      ],
      headline: `Stop relearning your brand every quarter.${refresh}`,
      body: `${product} keeps voice, visual rules, and proven patterns ready — so teams ship faster against “${brief.objective || 'your goal'}”.`,
      cta: 'Save your seat',
      reasoning: {
        layout:
          'Chose a tighter headline-plus-proof layout so the pain point lands quickly, then resolves into one registration CTA — strong for LinkedIn and email adaptation.',
        brandRules:
          'Kept confident, practical tone; avoided hype language; preserved primary-blue CTA treatment from visual language rules.',
        reusedCampaigns:
          'Reused structure from Webinar: AI in Enterprise and Partner Co-Marketing Kit, then reframed the opening line around the current brief.',
        inferred:
          'Inferred that “relearning the brand” is a credible pain for marketing leaders, even though that exact phrase wasn’t in the brief.',
        lowerConfidence:
          'The sharper hook may feel slightly more assertive than older approved posts — worth a quick brand review before broad spend.',
      },
    },
    {
      id: 'bold',
      label: 'Bold',
      why: 'Pushes contrast and tension while still grounded in brand voice rules from memory.',
      strengths: [
        'Highest stop-scroll potential',
        'Memorable framing for webinar demand',
        'Tests a stronger POV within guardrails',
      ],
      headline: `Your brand already knows the answer.${refresh}`,
      body: `Most teams re-brief from scratch. ${product} doesn’t — it starts from what ${brief.tone || 'your tone'} already proved works.`,
      cta: 'Join the Q3 webinar',
      reasoning: {
        layout:
          'Led with a provocative statement and contrast (“most teams…”) to earn attention, then returned to a single CTA so the layout still obeys channel rules.',
        brandRules:
          'Stayed within plainspoken voice and single-CTA rules, but used stronger tension than typical approved assets.',
        reusedCampaigns:
          'Borrowed narrative contrast from top webinar performers, then pushed the opening further than Q3 Product Launch — EMEA.',
        inferred:
          'Inferred that a bolder POV will help webinar signup volume, based on engagement patterns — not from an explicit brand mandate.',
        lowerConfidence:
          'This direction is the least like your average approved campaign. Expect more review discussion before it’s safe for always-on channels.',
      },
    },
  ]
}

export default function CreateCampaign() {
  const [step, setStep] = useState<Step>('brief')
  const [brief, setBrief] = useState<Brief>(initialBrief)
  const [tab, setTab] = useState<PreviewTab>('social')
  const [headline, setHeadline] = useState(
    'Stop relearning your brand every campaign.',
  )
  const [body, setBody] = useState(
    'Enterprise Marketing Memory keeps voice, visual rules, and proven patterns ready — so every asset starts on-brand.',
  )
  const [cta, setCta] = useState('Register for the webinar')
  const [variant, setVariant] = useState(0)
  const [directions, setDirections] = useState<Direction[]>(() =>
    buildDirections(initialBrief, 0),
  )
  const [selected, setSelected] = useState<DirectionId | null>(null)

  function updateBrief<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief((prev) => ({ ...prev, [key]: value }))
  }

  function generate() {
    setStep('loading')
    window.setTimeout(() => {
      setDirections(buildDirections(brief, variant))
      setSelected(null)
      setStep('directions')
    }, 2800)
  }

  function regenerate() {
    const nextVariant = variant + 1
    setVariant(nextVariant)
    setDirections(buildDirections(brief, nextVariant))
    setSelected(null)
  }

  if (step === 'loading') {
    return <LoadingState label="Drafting from marketing memory…" variant="campaign" />
  }

  if (step === 'directions') {
    return (
      <DirectionExplore
        directions={directions}
        selected={selected}
        onSelect={setSelected}
        onEdit={() => setStep('brief')}
        onRegenerate={regenerate}
        onUpdateDirection={(id, field, value) => {
          setDirections((prev) =>
            prev.map((direction) =>
              direction.id === id ? { ...direction, [field]: value } : direction,
            ),
          )
        }}
      />
    )
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title">Create First Draft</h1>
        <p className="page-subtitle">
          Shape the brief. Memory drafts from what your brand already knows.
        </p>
      </header>

      <div className="stagger grid gap-5 lg:grid-cols-2">
        <section className="surface-card rise-in p-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Campaign brief
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Memory uses this to stay on-brand.
          </p>

          <div className="mt-6 space-y-5">
            {fieldMeta.map((field) => (
              <label key={field.key} className="block space-y-1.5">
                <span className="eyebrow">{field.label}</span>
                {field.rows ? (
                  <textarea
                    value={brief[field.key]}
                    onChange={(e) => updateBrief(field.key, e.target.value)}
                    rows={field.rows}
                    placeholder={field.placeholder}
                    className="field-input resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={brief[field.key]}
                    onChange={(e) => updateBrief(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="field-input"
                  />
                )}
                {field.memoryHint && (
                  <p className="rise-in rounded-lg bg-brand-50/80 px-3 py-2 text-[12px] leading-relaxed text-brand-700/90">
                    <span className="font-medium text-brand-700">Memory · </span>
                    {field.memoryHint}
                  </p>
                )}
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card rise-in flex flex-col p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Live preview
              </h2>
              <p className="mt-1.5 text-sm text-muted">Edit copy in place — memory remembers.</p>
            </div>

            <div
              className="flex rounded-xl border border-border bg-slate-50 p-1"
              role="tablist"
              aria-label="Preview format"
            >
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-150',
                    tab === item.id
                      ? 'bg-white text-foreground shadow-[var(--shadow-soft)]'
                      : 'text-muted hover:text-foreground',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex-1">
            <PreviewCanvas
              tab={tab}
              brief={brief}
              headline={headline}
              body={body}
              cta={cta}
              onHeadline={setHeadline}
              onBody={setBody}
              onCta={setCta}
            />
          </div>
        </section>
      </div>

      <div>
        <button
          type="button"
          onClick={generate}
          className="btn-primary w-full px-6 py-3.5 sm:w-auto sm:min-w-56"
        >
          Create First Draft
        </button>
      </div>
    </div>
  )
}

function DirectionExplore({
  directions,
  selected,
  onSelect,
  onEdit,
  onRegenerate,
  onUpdateDirection,
}: {
  directions: Direction[]
  selected: DirectionId | null
  onSelect: (id: DirectionId) => void
  onEdit: () => void
  onRegenerate: () => void
  onUpdateDirection: (
    id: DirectionId,
    field: EditableField,
    value: string,
  ) => void
}) {
  const validateHref = usePhaseHref('validate')
  const [toast, setToast] = useState<MemoryToastPayload | null>(null)
  const editBaseline = useRef<{
    id: DirectionId
    field: EditableField
    value: string
  } | null>(null)

  function showMemoryUpdate(update: MemoryUpdate) {
    const eyebrow =
      update.field === 'cta'
        ? 'CTA learned'
        : update.field === 'headline'
          ? 'Headline learned'
          : 'Copy learned'

    const detail =
      update.field === 'cta'
        ? 'Got it — I’ll reuse this CTA preference on the next webinar draft.'
        : update.field === 'headline'
          ? 'Got it — I’ll prefer this framing on the next webinar draft.'
          : 'Got it — I’ll lean toward this messaging next time.'

    setToast({
      eyebrow,
      title: 'Marketing memory updated',
      detail,
      from: update.from,
      to: update.to,
    })
  }

  function beginEdit(
    directionId: DirectionId,
    field: EditableField,
    value: string,
  ) {
    editBaseline.current = { id: directionId, field, value }
  }

  function commitEdit(
    directionId: DirectionId,
    field: EditableField,
    nextValue: string,
  ) {
    const baseline = editBaseline.current
    const previous =
      baseline && baseline.id === directionId && baseline.field === field
        ? baseline.value
        : null
    const trimmed = nextValue.trim()

    if (!previous || !trimmed || trimmed === previous) {
      if (trimmed !== nextValue) {
        onUpdateDirection(directionId, field, previous ?? nextValue)
      }
      editBaseline.current = null
      return
    }

    onUpdateDirection(directionId, field, trimmed)
    showMemoryUpdate({ field, from: previous, to: trimmed })
    editBaseline.current = null
  }

  return (
    <div className="relative page-shell pb-10">
      <MemoryToast toast={toast} onDismiss={() => setToast(null)} />

      <header className="page-header">
        <h1 className="page-title">Directions from memory</h1>
        <p className="page-subtitle">
          Three on-brand paths from what your brand already knows. Choose one to develop —
          edits teach memory for next time.
        </p>
      </header>

      <div className="stagger grid gap-4 lg:grid-cols-3">
        {directions.map((direction) => {
          const isSelected = selected === direction.id

          return (
            <article
              key={direction.id}
              className={[
                'surface-card surface-card-interactive rise-in flex flex-col p-5',
                isSelected
                  ? 'border-brand-400 ring-2 ring-brand-100'
                  : '',
              ].join(' ')}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {direction.label}
                </h2>
                {isSelected && (
                  <StatusBadge tone="brand" dot={false}>
                    Selected
                  </StatusBadge>
                )}
              </div>

              <div className="rounded-xl border border-border bg-slate-50 p-4">
                <p className="eyebrow">Preview · editable</p>
                <textarea
                  value={direction.headline}
                  onFocus={() =>
                    beginEdit(direction.id, 'headline', direction.headline)
                  }
                  onChange={(e) =>
                    onUpdateDirection(direction.id, 'headline', e.target.value)
                  }
                  onBlur={(e) =>
                    commitEdit(direction.id, 'headline', e.target.value)
                  }
                  rows={2}
                  className="mt-2 w-full resize-none bg-transparent text-sm font-semibold tracking-tight text-foreground outline-none"
                />
                <textarea
                  value={direction.body}
                  onFocus={() =>
                    beginEdit(direction.id, 'body', direction.body)
                  }
                  onChange={(e) =>
                    onUpdateDirection(direction.id, 'body', e.target.value)
                  }
                  onBlur={(e) =>
                    commitEdit(direction.id, 'body', e.target.value)
                  }
                  rows={4}
                  className="mt-2 w-full resize-none bg-transparent text-[12px] leading-relaxed text-muted outline-none"
                />
                <input
                  value={direction.cta}
                  onFocus={() => beginEdit(direction.id, 'cta', direction.cta)}
                  onChange={(e) =>
                    onUpdateDirection(direction.id, 'cta', e.target.value)
                  }
                  onBlur={(e) =>
                    commitEdit(direction.id, 'cta', e.target.value)
                  }
                  className="mt-3 w-full bg-transparent text-[12px] font-semibold text-brand-700 outline-none"
                />
              </div>

              <div className="mt-4 space-y-1.5">
                <p className="eyebrow">
                  Why memory chose this
                </p>
                <p className="text-[13px] leading-relaxed text-foreground">
                  {direction.why}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="eyebrow">
                  Expected strengths
                </p>
                <ul className="space-y-1.5">
                  {direction.strengths.map((strength) => (
                    <li
                      key={strength}
                      className="flex items-start gap-2 text-[12px] leading-relaxed text-muted"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-500" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <AiReasoningPanel reasoning={direction.reasoning} />

              <button
                type="button"
                onClick={() => onSelect(direction.id)}
                className={[
                  'mt-auto pt-5 text-[13px] font-medium transition-colors duration-150',
                  isSelected
                    ? 'text-brand-700'
                    : 'text-muted hover:text-brand-700',
                ].join(' ')}
              >
                {isSelected ? 'Selected for development' : 'Develop this direction'}
              </button>
            </article>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Link
          to={validateHref}
          className={[
            'btn-primary px-6 py-3.5',
            selected ? '' : 'pointer-events-none opacity-40',
          ].join(' ')}
          aria-disabled={!selected}
        >
          Continue to Confirm Brand Fit
        </Link>
        <button type="button" onClick={onEdit} className="btn-secondary px-6 py-3.5">
          Edit brief
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="btn-secondary px-6 py-3.5"
        >
          Draft again
        </button>
      </div>
    </div>
  )
}

function AiReasoningPanel({
  reasoning,
}: {
  reasoning: Direction['reasoning']
}) {
  const sections = [
    { label: 'Why this layout', body: reasoning.layout },
    { label: 'Brand rules that shaped it', body: reasoning.brandRules },
    { label: 'Campaigns reused', body: reasoning.reusedCampaigns },
    { label: 'What was inferred', body: reasoning.inferred },
    { label: 'Lower confidence', body: reasoning.lowerConfidence },
  ] as const

  return (
    <details className="group mt-4 rounded-xl border border-border bg-white">
      <summary className="cursor-pointer list-none px-3.5 py-3 text-[12px] font-medium text-muted transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex w-full items-center justify-between gap-2">
          Why memory chose this
          <ChevronIcon className="size-3.5 shrink-0 transition-transform duration-150 group-open:rotate-180" />
        </span>
      </summary>
      <div className="space-y-3 border-t border-border px-3.5 py-3">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
              {section.label}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-foreground">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6 8 10 12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PreviewCanvas({
  tab,
  brief,
  headline,
  body,
  cta,
  onHeadline,
  onBody,
  onCta,
}: {
  tab: PreviewTab
  brief: Brief
  headline: string
  body: string
  cta: string
  onHeadline: (value: string) => void
  onBody: (value: string) => void
  onCta: (value: string) => void
}) {
  const editable =
    'w-full bg-transparent text-inherit outline-none placeholder:text-slate-400 focus:ring-0'

  if (tab === 'social') {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            EM
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {brief.product || 'Product'}
            </p>
            <p className="truncate text-xs text-muted">Sponsored · LinkedIn</p>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          <textarea
            value={headline}
            onChange={(e) => onHeadline(e.target.value)}
            rows={2}
            className={`${editable} resize-none text-sm font-semibold leading-snug text-foreground`}
          />
          <textarea
            value={body}
            onChange={(e) => onBody(e.target.value)}
            rows={4}
            className={`${editable} resize-none text-sm leading-relaxed text-muted`}
          />
        </div>

        <div className="border-t border-border bg-slate-50 px-4 py-3">
          <input
            value={cta}
            onChange={(e) => onCta(e.target.value)}
            className={`${editable} text-sm font-semibold text-brand-700`}
          />
        </div>
      </div>
    )
  }

  if (tab === 'banner') {
    return (
      <div className="flex h-full min-h-48 flex-col justify-center">
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <input
                value={headline}
                onChange={(e) => onHeadline(e.target.value)}
                className={`${editable} text-base font-semibold tracking-tight text-foreground`}
              />
              <input
                value={body}
                onChange={(e) => onBody(e.target.value)}
                className={`${editable} text-xs text-muted`}
              />
            </div>
            <input
              value={cta}
              onChange={(e) => onCta(e.target.value)}
              className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-center text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xs rounded-2xl border border-border bg-white p-6 shadow-sm">
      <textarea
        value={headline}
        onChange={(e) => onHeadline(e.target.value)}
        rows={3}
        className={`${editable} resize-none text-xl font-semibold tracking-tight text-foreground`}
      />
      <textarea
        value={body}
        onChange={(e) => onBody(e.target.value)}
        rows={5}
        className={`${editable} mt-3 resize-none text-sm leading-relaxed text-muted`}
      />
      <div className="mt-6 border-t border-border pt-5">
        <input
          value={cta}
          onChange={(e) => onCta(e.target.value)}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
    </div>
  )
}
