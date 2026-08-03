import { useEffect, useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import BrandLearningExperience from '../components/ui/BrandLearningExperience'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import MemoryCreatedCelebration from '../components/ui/MemoryCreatedCelebration'

type UploadItem = {
  id: string
  name: string
  progress: number
  status: 'uploading' | 'done'
}

type Step = 'upload' | 'loading' | 'review' | 'created'
type UploadKey = 'guidelines' | 'figma' | 'campaigns'
type ReviewAction = 'pending' | 'approved' | 'editing' | 'rejected'

type UploadCard = {
  key: UploadKey
  title: string
  description: string
  accept: string
  hint: string
}

const uploadCards: UploadCard[] = [
  {
    key: 'guidelines',
    title: 'Brand Guidelines',
    description: 'Official voice, visual rules, and messaging standards.',
    accept: '.pdf,application/pdf',
    hint: 'Notion, PDFs',
  },
  {
    key: 'figma',
    title: 'Design System',
    description: 'Components, tokens, and layout patterns from Figma and DAM.',
    accept: '.fig,.json,image/*',
    hint: 'Figma, DAM',
  },
  {
    key: 'campaigns',
    title: 'Approved Campaigns',
    description: 'Past work that shows memory what “good” looks like.',
    accept: '.pdf,.doc,.docx,image/*,.zip',
    hint: 'PDF, Docs, or images',
  },
]

const supportedSources = [
  { label: 'PDF', detail: 'Guidelines & decks' },
  { label: 'Google Docs', detail: 'Messaging docs' },
  { label: 'Figma', detail: 'Design systems' },
  { label: 'Images', detail: 'Campaign creatives' },
] as const

const learnedInsights = [
  {
    id: 'pain-first',
    headline:
      'Your brand introduces customer pain before mentioning the solution.',
    evidence: 'Supported by 42 approved campaigns.',
    confidence: 98,
    action: 'Apply as default narrative order',
    technical:
      'pattern_id: problem_before_product_v2 · support_docs: 42 · conflict_score: 0.04',
  },
  {
    id: 'visual',
    headline:
      'Primary blue anchors CTAs; photography stays bright, uncluttered, and people-forward.',
    evidence: 'Supported by Brand Guidelines pp. 12–18 and 9 of 11 creatives.',
    confidence: 94,
    action: 'Lock visual language rules',
    technical:
      'pattern_id: visual_language_v3 · support_docs: 11 · conflict_score: 0.06',
  },
  {
    id: 'voice',
    headline:
      'Tone is confident and plainspoken — short sentences, concrete verbs, no hype.',
    evidence: 'Supported by messaging standards and 14 approved subject lines.',
    confidence: 91,
    action: 'Approve as brand voice baseline',
    technical:
      'pattern_id: brand_voice_plainspoken_v1 · support_docs: 14 · conflict_score: 0.09',
  },
  {
    id: 'channel',
    headline:
      'LinkedIn leads with insight; email leads with outcome. Webinars keep a single CTA.',
    evidence: 'Supported by channel playbooks and the last 6 webinar pages.',
    confidence: 88,
    action: 'Adopt as channel rules',
    technical:
      'pattern_id: channel_rules_v4 · support_docs: 6 · conflict_score: 0.11',
  },
] as const

const reviewItemsSeed = [
  {
    id: 'r1',
    pattern: 'Webinar dual-CTA layout',
    uncertainty:
      'Two CTAs appear in the same hero on recent webinar pages, but older kits still use this pattern.',
    confidence: 54,
  },
  {
    id: 'r2',
    pattern: 'Terracotta accent usage',
    uncertainty:
      'Accent color showed up in two partner kits, yet it never appears in the design system.',
    confidence: 48,
  },
  {
    id: 'r3',
    pattern: '“Unlock potential” phrasing',
    uncertainty:
      'This line shows up in older nurture copy while newer guidelines discourage abstract claims.',
    confidence: 61,
  },
  {
    id: 'r4',
    pattern: 'Dense product-spec footers',
    uncertainty:
      'Found in three decks — may conflict with the preferred problem → proof → CTA flow.',
    confidence: 57,
  },
] as const

export default function LearnBrand() {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<Record<UploadKey, UploadItem[]>>({
    guidelines: [],
    figma: [],
    campaigns: [],
  })
  const [dragging, setDragging] = useState<UploadKey | null>(null)
  const [reviewState, setReviewState] = useState<Record<string, ReviewAction>>(
    () =>
      Object.fromEntries(reviewItemsSeed.map((item) => [item.id, 'pending'])),
  )
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({})
  const inputRefs = useRef<Record<UploadKey, HTMLInputElement | null>>({
    guidelines: null,
    figma: null,
    campaigns: null,
  })
  const progressTimers = useRef<number[]>([])

  const hasUploads = Object.values(files).some((list) => list.length > 0)
  const isUploading = Object.values(files).some((list) =>
    list.some((file) => file.status === 'uploading'),
  )

  useEffect(() => {
    return () => {
      progressTimers.current.forEach((timer) => window.clearInterval(timer))
    }
  }, [])

  function animateUpload(key: UploadKey, id: string) {
    const timer = window.setInterval(() => {
      setFiles((prev) => {
        const list = prev[key]
        const item = list.find((file) => file.id === id)
        if (!item || item.status === 'done') {
          window.clearInterval(timer)
          return prev
        }

        const nextProgress = Math.min(item.progress + 18 + Math.random() * 22, 100)
        const done = nextProgress >= 100

        return {
          ...prev,
          [key]: list.map((file) =>
            file.id === id
              ? {
                  ...file,
                  progress: done ? 100 : nextProgress,
                  status: done ? 'done' : 'uploading',
                }
              : file,
          ),
        }
      })
    }, 160)

    progressTimers.current.push(timer)
  }

  function addFiles(key: UploadKey, next: FileList | File[]) {
    const list = Array.from(next)
    if (!list.length) return

    const items: UploadItem[] = list.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      progress: 8,
      status: 'uploading',
    }))

    setFiles((prev) => ({
      ...prev,
      [key]: [...prev[key], ...items],
    }))

    items.forEach((item) => animateUpload(key, item.id))
  }

  function onDragOver(e: DragEvent, key: UploadKey) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(key)
  }

  function onDragLeave(e: DragEvent, key: UploadKey) {
    e.preventDefault()
    e.stopPropagation()
    if (dragging === key) setDragging(null)
  }

  function onDrop(e: DragEvent, key: UploadKey) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(null)
    if (e.dataTransfer.files?.length) {
      addFiles(key, e.dataTransfer.files)
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>, key: UploadKey) {
    if (e.target.files?.length) {
      addFiles(key, e.target.files)
      e.target.value = ''
    }
  }

  function removeFile(key: UploadKey, id: string) {
    setFiles((prev) => ({
      ...prev,
      [key]: prev[key].filter((file) => file.id !== id),
    }))
  }

  function resetToUpload() {
    progressTimers.current.forEach((timer) => window.clearInterval(timer))
    progressTimers.current = []
    setStep('upload')
    setFiles({ guidelines: [], figma: [], campaigns: [] })
    setReviewState(
      Object.fromEntries(reviewItemsSeed.map((item) => [item.id, 'pending'])),
    )
    setEditDrafts({})
  }

  function analyze() {
    setStep('loading')
  }

  if (step === 'loading') {
    return (
      <BrandLearningExperience onComplete={() => setStep('review')} />
    )
  }

  if (step === 'created') {
    return <MemoryCreatedCelebration />
  }

  if (step === 'review') {
    return (
      <BrandReview
        reviewState={reviewState}
        editDrafts={editDrafts}
        onAction={(id, action) =>
          setReviewState((prev) => ({ ...prev, [id]: action }))
        }
        onEditDraft={(id, value) =>
          setEditDrafts((prev) => ({ ...prev, [id]: value }))
        }
        onLearnAnother={resetToUpload}
        onLooksGood={() => setStep('created')}
      />
    )
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title">Teach AI Your Brand</h1>
        <p className="page-subtitle">
          Upload guidelines, design systems, and approved campaigns. Memory
          learns what on-brand means for your enterprise.
        </p>
      </header>

      <section className="stagger grid gap-5 md:grid-cols-3">
        {uploadCards.map((card) => {
          const isDragging = dragging === card.key
          const uploaded = files[card.key]

          return (
            <div key={card.key} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => inputRefs.current[card.key]?.click()}
                onDragOver={(e) => onDragOver(e, card.key)}
                onDragEnter={(e) => onDragOver(e, card.key)}
                onDragLeave={(e) => onDragLeave(e, card.key)}
                onDrop={(e) => onDrop(e, card.key)}
                className="upload-zone w-full"
                data-active={isDragging ? 'true' : 'false'}
              >
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-150 group-hover:scale-[1.02]">
                  <UploadIcon />
                </span>
                <span className="text-base font-semibold tracking-tight text-foreground">
                  {card.title}
                </span>
                <span className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">
                  {card.description}
                </span>
                <span className="mt-5 text-xs font-medium text-brand-600">
                  Drag & drop or browse · {card.hint}
                </span>
                <input
                  ref={(el) => {
                    inputRefs.current[card.key] = el
                  }}
                  type="file"
                  accept={card.accept}
                  multiple
                  className="hidden"
                  onChange={(e) => onChange(e, card.key)}
                />
              </button>

              {uploaded.length > 0 && (
                <ul className="fade-in space-y-2 rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-soft)]">
                  {uploaded.map((file) => (
                    <li
                      key={file.id}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-foreground">
                          {file.name}
                        </span>
                        {file.status === 'done' ? (
                          <button
                            type="button"
                            onClick={() => removeFile(card.key, file.id)}
                            className="shrink-0 text-xs text-muted transition-colors duration-150 hover:text-foreground"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="shrink-0 text-[11px] tabular-nums text-muted">
                            {Math.round(file.progress)}%
                          </span>
                        )}
                      </div>
                      <div className="progress-track" aria-hidden="true">
                        <div
                          className="progress-fill"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </section>

      <section className="space-y-4">
        <h2 className="section-label">What memory can learn from</h2>
        <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
          {supportedSources.map((source) => (
            <div
              key={source.label}
              className="surface-card surface-card-interactive px-4 py-4"
            >
              <p className="text-sm font-medium text-foreground">{source.label}</p>
              <p className="mt-1 text-[12px] text-muted">{source.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          disabled={!hasUploads || isUploading}
          onClick={analyze}
          className="btn-primary w-full px-6 py-4 text-base sm:w-auto sm:min-w-64"
        >
          {isUploading ? 'Teaching in progress…' : 'Teach AI Your Brand'}
        </button>
        {!hasUploads && (
          <p className="mt-3 text-xs text-muted">
            Add at least one source so memory can begin learning.
          </p>
        )}
      </div>
    </div>
  )
}

function BrandReview({
  reviewState,
  editDrafts,
  onAction,
  onEditDraft,
  onLearnAnother,
  onLooksGood,
}: {
  reviewState: Record<string, ReviewAction>
  editDrafts: Record<string, string>
  onAction: (id: string, action: ReviewAction) => void
  onEditDraft: (id: string, value: string) => void
  onLearnAnother: () => void
  onLooksGood: () => void
}) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(learnedInsights.map((item) => [item.id, false])),
  )

  return (
    <div className="page-shell page-shell--narrow pb-16">
      <header className="page-header">
        <p className="text-[11px] font-medium tracking-[0.04em] text-brand-600 uppercase">
          Memory understands
        </p>
        <h1 className="page-title">
          Here&apos;s what I learned
        </h1>
        <p className="page-subtitle">
          I’m solid on voice and visuals. These still need your judgment before I treat them as law.
        </p>
      </header>

      <section className="stagger space-y-4">
        {learnedInsights.map((insight) => {
          const isAccepted = accepted[insight.id]

          return (
            <article key={insight.id} className="surface-card surface-card-interactive rise-in p-6">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {insight.headline}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted">
                {insight.evidence}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <ConfidenceBar
                  value={insight.confidence}
                  showValue
                  delayMs={learnedInsights.findIndex((i) => i.id === insight.id) * 50}
                  className="min-w-[10rem] flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAccepted((prev) => ({
                      ...prev,
                      [insight.id]: !prev[insight.id],
                    }))
                  }
                  className={[
                    'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                    isAccepted
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-brand-600 text-white hover:bg-brand-700',
                  ].join(' ')}
                >
                  {isAccepted ? 'In memory' : insight.action}
                </button>
              </div>

              <details className="group mt-5">
                <summary className="cursor-pointer list-none text-[12px] font-medium text-slate-400 transition-colors duration-150 hover:text-muted [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-1.5">
                    Technical evidence
                    <ChevronIcon className="size-3.5 transition-transform duration-150 group-open:rotate-180" />
                  </span>
                </summary>
                <div className="fade-in mt-3 rounded-xl bg-slate-50 px-4 py-3 font-mono text-[11px] leading-relaxed text-slate-500">
                  {insight.technical}
                </div>
              </details>
            </article>
          )
        })}
      </section>

      <section className="surface-card border-amber-200/80 p-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Needs your judgment
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Low-confidence learnings — decide what belongs in memory.
        </p>

        <ul className="mt-6 divide-y divide-border">
          {reviewItemsSeed.map((item) => {
            const status = reviewState[item.id] ?? 'pending'
            const draft = editDrafts[item.id] ?? item.pattern

            return (
              <li key={item.id} className="py-5 first:pt-0 last:pb-0">
                <div className="space-y-3">
                  {status === 'editing' ? (
                    <input
                      value={draft}
                      onChange={(e) => onEditDraft(item.id, e.target.value)}
                      className="field-input font-medium"
                      aria-label={`Edit learning: ${item.pattern}`}
                    />
                  ) : (
                    <p
                      className={[
                        'text-sm font-semibold tracking-tight',
                        status === 'rejected'
                          ? 'text-slate-400 line-through'
                          : 'text-foreground',
                      ].join(' ')}
                    >
                      {status === 'approved' && editDrafts[item.id]
                        ? editDrafts[item.id]
                        : item.pattern}
                    </p>
                  )}

                  <div className="rounded-xl bg-amber-50/70 px-3.5 py-3">
                    <p className="eyebrow text-amber-800">
                      Why I&apos;m uncertain
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-amber-950/80">
                      {item.uncertainty}
                    </p>
                    <ConfidenceBar
                      value={item.confidence}
                      showValue
                      delayMs={
                        reviewItemsSeed.findIndex((r) => r.id === item.id) * 50
                      }
                      className="mt-3"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {status === 'editing' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction(item.id, 'approved')}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-brand-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(item.id, 'pending')}
                          className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction(item.id, 'approved')}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-brand-700"
                        >
                          Keep in memory
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onEditDraft(item.id, item.pattern)
                            onAction(item.id, 'editing')
                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(item.id, 'rejected')}
                          className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-slate-50"
                        >
                          Leave out
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAction(item.id, 'pending')}
                        className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-slate-50"
                      >
                        Undo {status === 'approved' ? 'keep' : 'leave out'}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onLooksGood}
          className="btn-primary px-6 py-3.5"
        >
          Add to Marketing Memory
        </button>
        <button
          type="button"
          onClick={onLearnAnother}
          className="btn-secondary px-6 py-3.5"
        >
          Teach from another campaign
        </button>
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 13.5V3.5M10 3.5 6.5 7M10 3.5 13.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12.5v2a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
