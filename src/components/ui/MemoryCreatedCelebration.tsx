import { Link } from 'react-router-dom'
import { useAiConversation } from '../../lib/aiConversation'
import { usePhaseHref } from '../../lib/usePhase'

const memoryCards = [
  {
    title: 'Brand Voice',
    detail: 'Confident, plainspoken, and concrete — ready to guide every line.',
  },
  {
    title: 'Visual Language',
    detail: 'Color, photography, and hierarchy now live as shared memory.',
  },
  {
    title: 'Campaign Patterns',
    detail: 'What works is remembered — problem, proof, then one clear CTA.',
  },
  {
    title: 'Channel Rules',
    detail: 'LinkedIn, email, and webinars each know how your brand shows up.',
  },
  {
    title: 'Brand Compliance',
    detail: 'Guardrails are in place so every new asset starts on-brand.',
  },
] as const

export default function MemoryCreatedCelebration() {
  const homeHref = usePhaseHref()
  const createCampaignHref = usePhaseHref('create-campaign')
  const { approveVerifiedBrandSource } = useAiConversation()

  return (
    <div className="fade-in page-shell page-shell--narrow items-center py-8 text-center">
      <header className="flex flex-col items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-[var(--shadow-soft)]">
          <CheckBurstIcon className="size-6" />
        </div>
        <p className="text-[11px] font-medium tracking-[0.04em] text-brand-600 uppercase">
          Memory is ready
        </p>
        <h1 className="page-title">Brand memory created</h1>
        <p className="page-subtitle mx-auto">
          I’m ready when you are — I remember voice, visuals, and what good campaigns look like.
        </p>
      </header>

      <div className="stagger grid w-full gap-3 sm:grid-cols-2">
        {memoryCards.map((card, index) => (
          <article
            key={card.title}
            className={[
              'surface-card surface-card-interactive rise-in p-5 text-left',
              index === memoryCards.length - 1 ? 'sm:col-span-2 sm:max-w-md sm:justify-self-center' : '',
            ].join(' ')}
            style={{ animationDelay: `${40 + index * 45}ms` }}
          >
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {card.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {card.detail}
            </p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        <Link
          to={homeHref}
          className="btn-primary px-6 py-3.5 text-[15px]"
          onClick={() => approveVerifiedBrandSource()}
        >
          Go to campaign dashboard
        </Link>
        <Link
          to={createCampaignHref}
          className="btn-secondary px-6 py-3.5 text-[15px]"
          onClick={() => approveVerifiedBrandSource()}
        >
          Create First Draft
        </Link>
      </div>
    </div>
  )
}

function CheckBurstIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 14.2 12.2 17.8 19.5 10.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
