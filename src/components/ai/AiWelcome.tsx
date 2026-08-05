import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiConversation } from '../../lib/aiConversation'
import { usePhaseHref } from '../../lib/usePhase'

type HomeStep = 'choose' | 'brand' | 'campaign'

const SETUP_SOURCES = [
  {
    id: 'brand',
    title: 'Brand identity and rules',
    description: 'Voice, messaging, terminology, visual standards, and compliance rules.',
  },
  {
    id: 'design',
    title: 'Design system and templates',
    description: 'Figma components, tokens, layouts, responsive rules, and channel specifications.',
  },
  {
    id: 'assets',
    title: 'Assets and approved examples',
    description: 'Logos, product imagery, approved creatives, documents, and historical campaigns.',
  },
  {
    id: 'audiences',
    title: 'Audiences and markets',
    description:
      'Personas, customer segments, regions, languages, lifecycle stages, and channel preferences.',
  },
] as const

const STARTER_PROMPTS = [
  {
    id: 'product',
    label: 'Launch a product',
    draft:
      'We’re launching a new analytics product and want to drive enterprise demo requests.',
  },
  {
    id: 'event',
    label: 'Promote an event',
    draft:
      'We’re promoting an upcoming webinar and want registrations from enterprise marketing leaders.',
  },
  {
    id: 'multi',
    label: 'Multi-channel campaign',
    draft:
      'Create a multi-channel campaign with infographics, brochures, flyers, banners, and social media graphics to introduce our platform and drive qualified demo requests.',
  },
] as const

const JOURNEY = [
  {
    title: 'Enterprise Marketing Memory',
    subtitle: 'Your brand knowledge, assets, audiences, and rules in one place.',
    tone: 'blue' as const,
  },
  {
    title: 'Campaign draft',
    subtitle: 'AI generates on-brand concepts, messaging, and channel plans.',
    tone: 'purple' as const,
  },
  {
    title: 'Review & refine',
    subtitle: 'Collaborate, approve, and publish with confidence.',
    tone: 'green' as const,
  },
] as const

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7" y="2.5" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 12.5V3.5M7 6l3-3 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12.5v3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FigmaMark() {
  return (
    <svg viewBox="0 0 16 16" className="nw-illus__icon" aria-hidden="true">
      <path d="M5.5 1.5h2.5a2.5 2.5 0 0 1 0 5H5.5v-5Z" fill="#F24E1E" />
      <path d="M8 1.5h2.5a2.5 2.5 0 1 1 0 5H8v-5Z" fill="#FF7262" />
      <path d="M8 6.5h2.5a2.5 2.5 0 1 1 0 5H8v-5Z" fill="#A259FF" />
      <path d="M5.5 6.5H8v5H5.5a2.5 2.5 0 0 1 0-5Z" fill="#1ABCFE" />
      <path d="M5.5 11.5H8V14a2.5 2.5 0 1 1-2.5-2.5Z" fill="#0ACF83" />
    </svg>
  )
}

function DocMark() {
  return (
    <svg viewBox="0 0 16 16" className="nw-illus__icon" aria-hidden="true">
      <path d="M4.5 2.5h5l2 2v9h-7v-11Z" stroke="#5B7CBA" strokeWidth="1.2" fill="#EEF3FB" />
      <path d="M6 7.5h4M6 9.5h3" stroke="#5B7CBA" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function AssetMark() {
  return (
    <svg viewBox="0 0 16 16" className="nw-illus__icon" aria-hidden="true">
      <rect
        x="2.5"
        y="3.5"
        width="11"
        height="9"
        rx="1.5"
        fill="#F3EEFF"
        stroke="#8B7CC8"
        strokeWidth="1.2"
      />
      <circle cx="6" cy="7" r="1.2" fill="#8B7CC8" />
      <path
        d="M3.5 11.5 6.5 8.5l2 2 1.5-1.5 2.5 2.5"
        stroke="#8B7CC8"
        strokeWidth="1.1"
        fill="none"
      />
    </svg>
  )
}

function AudienceMark() {
  return (
    <svg viewBox="0 0 16 16" className="nw-illus__icon" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2" fill="#DCEEE6" stroke="#3E8F72" strokeWidth="1.2" />
      <path
        d="M3.5 13c.6-2.2 2.2-3.3 4.5-3.3S11.9 10.8 12.5 13"
        stroke="#3E8F72"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BrainMark() {
  return (
    <svg viewBox="0 0 28 28" className="nw-illus__brain-icon" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#EFF4FF" />
      <path
        d="M10.2 9.2c-.9.4-1.5 1.3-1.5 2.4 0 .4.1.8.3 1.1-.7.4-1.1 1.1-1.1 1.9 0 1 .7 1.9 1.7 2.1v1.8c0 .7.6 1.3 1.3 1.3h1.1v-7.2c0-1.4-.7-2.5-1.8-3.4Zm7.6 0c-1.1.9-1.8 2-1.8 3.4v7.2h1.1c.7 0 1.3-.6 1.3-1.3v-1.8c1-.2 1.7-1.1 1.7-2.1 0-.8-.4-1.5-1.1-1.9.2-.3.3-.7.3-1.1 0-1.1-.6-2-1.5-2.4Z"
        fill="#4F7FE0"
      />
      <path
        d="M14 8.5v11M11.2 12.2h5.6M11.2 15.2h5.6"
        stroke="#EFF4FF"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SparkMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.5 9.1 5.4 13 6.5 9.1 7.6 8 11.5 6.9 7.6 3 6.5 6.9 5.4Z"
        fill="white"
      />
    </svg>
  )
}

function BrandSourcesIllustration() {
  return (
    <div className="nw-illus nw-illus--brand" aria-hidden="true">
      <div className="nw-illus__glow nw-illus__glow--blue" />
      <div className="nw-illus__orbit">
        <span className="nw-illus__sat nw-illus__sat--1">
          <FigmaMark />
        </span>
        <span className="nw-illus__sat nw-illus__sat--2">
          <DocMark />
        </span>
        <span className="nw-illus__sat nw-illus__sat--3">
          <AssetMark />
        </span>
        <span className="nw-illus__sat nw-illus__sat--4">
          <AudienceMark />
        </span>
        <svg className="nw-illus__arcs" viewBox="0 0 260 140" fill="none">
          <path
            d="M48 34 C70 78, 110 98, 130 108"
            stroke="#9DB4E8"
            strokeWidth="1.25"
            strokeDasharray="3 4"
          />
          <path
            d="M98 22 C108 62, 120 90, 130 108"
            stroke="#9DB4E8"
            strokeWidth="1.25"
            strokeDasharray="3 4"
          />
          <path
            d="M162 22 C152 62, 140 90, 130 108"
            stroke="#9DB4E8"
            strokeWidth="1.25"
            strokeDasharray="3 4"
          />
          <path
            d="M212 34 C190 78, 150 98, 130 108"
            stroke="#9DB4E8"
            strokeWidth="1.25"
            strokeDasharray="3 4"
          />
        </svg>
        <div className="nw-illus__brain">
          <BrainMark />
        </div>
      </div>
    </div>
  )
}

function CampaignPromptIllustration() {
  return (
    <div className="nw-illus nw-illus--campaign" aria-hidden="true">
      <div className="nw-illus__glow nw-illus__glow--purple" />
      <div className="nw-illus__prompt">
        <p>We’re launching a new healthcare analytics product for enterprise customers.</p>
        <div className="nw-illus__prompt-bar">
          <span />
          <span className="is-mid" />
          <span className="is-accent" />
        </div>
        <span className="nw-illus__spark-badge">
          <SparkMark />
        </span>
      </div>
    </div>
  )
}

function JourneyIcon({ tone }: { tone: 'blue' | 'purple' | 'green' }) {
  if (tone === 'blue') {
    return (
      <span className="nw-journey__icon nw-journey__icon--blue">
        <BrainMark />
      </span>
    )
  }
  if (tone === 'purple') {
    return (
      <span className="nw-journey__icon nw-journey__icon--purple">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M5 14.5 14.5 5.5l.8 4.2-2.1.7 2.3 3.4-1.5 1-2.3-3.4-.9 2.1Z"
            fill="currentColor"
          />
        </svg>
      </span>
    )
  }
  return (
    <span className="nw-journey__icon nw-journey__icon--green">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M5 10.4 8.2 13.5 15 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function ChipIcon({ id }: { id: string }) {
  if (id === 'product') {
    return (
      <svg viewBox="0 0 14 14" aria-hidden="true">
        <rect
          x="2"
          y="3"
          width="10"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        <path d="M5 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'event') {
    return (
      <svg viewBox="0 0 14 14" aria-hidden="true">
        <rect
          x="2"
          y="3.5"
          width="10"
          height="8"
          rx="1.4"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M2 6.5h10M5 2.5v2M9 2.5v2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M3 9.5 7 3.5l4 6H3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function JourneyPreview({ tone }: { tone: 'blue' | 'purple' | 'green' }) {
  return (
    <div className={`nw-journey__preview nw-journey__preview--${tone}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="nw-home__back" onClick={onClick}>
      ← Back
    </button>
  )
}

export default function AiWelcome() {
  const navigate = useNavigate()
  const learnBrandHref = usePhaseHref('learn-brand')
  const {
    submitIntent,
    isGenerating,
    savedCampaignBrief,
    setSavedCampaignBrief,
    beginConnectBrand,
    hasVerifiedBrandSource,
  } = useAiConversation()

  const [step, setStep] = useState<HomeStep>(() =>
    hasVerifiedBrandSource ? 'campaign' : 'choose',
  )
  const [value, setValue] = useState(savedCampaignBrief ?? '')
  const [listening, setListening] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>(['brand', 'design'])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  useEffect(() => {
    if (savedCampaignBrief && !value) setValue(savedCampaignBrief)
  }, [savedCampaignBrief, value])

  useEffect(() => {
    if (step === 'campaign') {
      window.setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [step])

  function persistBrief(next: string) {
    setValue(next)
    setSavedCampaignBrief(next.trim() || null)
  }

  function goBack() {
    setStep('choose')
  }

  function openCampaign(draft?: string) {
    if (draft) persistBrief(draft)
    setStep('campaign')
  }

  function openBrand() {
    setStep('brand')
  }

  function connectSources() {
    beginConnectBrand(value.trim() || savedCampaignBrief)
    navigate(learnBrandHref)
  }

  function onSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!value.trim() || isGenerating) return
    submitIntent(value.trim())
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  function onVoice() {
    setListening(true)
    window.setTimeout(() => {
      persistBrief(
        value ||
          'We’re launching a new analytics product and want to drive enterprise demo requests.',
      )
      setListening(false)
      inputRef.current?.focus()
    }, 900)
  }

  function onFileChange(file: File | undefined) {
    if (!file) return
    persistBrief(
      value ||
        `Use the uploaded brief “${file.name}” to launch a campaign for enterprise buyers.`,
    )
  }

  function toggleSource(id: string) {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <section className="nw-home" aria-labelledby={`${formId}-title`}>
      {step === 'choose' && (
        <div className="nw-home__stage nw-home__stage--choose">
          <header className="nw-home__header">
            <h1 id={`${formId}-title`} className="nw-home__title">
              How would you like to get started?
            </h1>
            <p className="nw-home__lede">
              Bring in your brand context, or start with a campaign idea and add it later.
            </p>
          </header>

          <div className="nw-home__choices">
            <article className="nw-card">
              <p className="nw-card__pill">
                <span aria-hidden="true">✨</span> Recommended for enterprise teams
              </p>
              <BrandSourcesIllustration />
              <div className="nw-card__body">
                <h2 className="nw-card__title">Bring in your existing brand</h2>
                <p className="nw-card__desc">
                  Connect Figma, guidelines, assets, or audience data so AI can learn how your
                  organization creates marketing.
                </p>
              </div>
              <button type="button" className="nw-card__cta" onClick={openBrand}>
                Set up my brand →
              </button>
              <div className="nw-card__footer">
                <div className="nw-card__meta-row">
                  <span className="nw-card__meta-item">
                    <FigmaMark /> Figma
                  </span>
                  <span className="nw-card__meta-sep">+</span>
                  <span className="nw-card__meta-item">
                    <DocMark /> Guidelines
                  </span>
                  <span className="nw-card__meta-sep">+</span>
                  <span className="nw-card__meta-item">
                    <AssetMark /> Assets
                  </span>
                  <span className="nw-card__meta-sep">+</span>
                  <span className="nw-card__meta-item">
                    <AudienceMark /> Audiences
                  </span>
                </div>
              </div>
            </article>

            <article className="nw-card">
              <div className="nw-card__pill-spacer" aria-hidden="true" />
              <CampaignPromptIllustration />
              <div className="nw-card__body">
                <h2 className="nw-card__title">Start with a campaign idea</h2>
                <p className="nw-card__desc">
                  Tell AI what you’re launching and get an exploratory draft before connecting your
                  brand.
                </p>
              </div>
              <button type="button" className="nw-card__cta" onClick={() => openCampaign()}>
                Describe my campaign →
              </button>
              <div className="nw-card__footer">
                <div className="nw-card__chips" role="list">
                  {STARTER_PROMPTS.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      role="listitem"
                      className="nw-card__chip"
                      onClick={() => openCampaign(starter.draft)}
                    >
                      <ChipIcon id={starter.id} />
                      {starter.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <section className="nw-journey" aria-label="What this becomes later">
            <div className="nw-journey__rule">
              <span className="nw-journey__label">What this becomes later</span>
            </div>
            <div className="nw-journey__track">
              {JOURNEY.map((item, index) => (
                <div key={item.title} className="nw-journey__step">
                  {index > 0 && (
                    <span className="nw-journey__arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                  <article className="nw-journey__card">
                    <div className="nw-journey__copy">
                      <JourneyIcon tone={item.tone} />
                      <div>
                        <p className="nw-journey__title">{item.title}</p>
                        <p className="nw-journey__sub">{item.subtitle}</p>
                      </div>
                    </div>
                    <JourneyPreview tone={item.tone} />
                  </article>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {step === 'brand' && (
        <div className="nw-home__stage">
          <BackButton onClick={goBack} />
          <header className="nw-home__header nw-home__header--left">
            <h1 id={`${formId}-title`} className="nw-home__title nw-home__title--sm">
              What should AI learn first?
            </h1>
            <p className="nw-home__lede nw-home__lede--left">
              Choose one or more sources. You can add more later.
            </p>
          </header>

          <ul className="nw-home__sources" aria-label="Brand sources">
            {SETUP_SOURCES.map((source) => {
              const selected = selectedSources.includes(source.id)
              return (
                <li key={source.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    className={['nw-home__source', selected ? 'is-selected' : ''].join(' ')}
                    onClick={() => toggleSource(source.id)}
                  >
                    <span className="nw-home__source-title">{source.title}</span>
                    <span className="nw-home__source-desc">{source.description}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="btn-primary mt-5"
            disabled={selectedSources.length === 0}
            onClick={connectSources}
          >
            Continue setup
          </button>
        </div>
      )}

      {step === 'campaign' && (
        <div className="nw-home__stage nw-home__stage--campaign">
          <BackButton onClick={goBack} />
          <header className="nw-home__header nw-home__header--left">
            <h1 id={`${formId}-title`} className="nw-home__title nw-home__title--sm">
              What are you trying to launch?
            </h1>
          </header>

          <form onSubmit={onSubmit} className="nw-home__composer">
            <label htmlFor={`${formId}-input`} className="sr-only">
              Campaign idea
            </label>
            <textarea
              id={`${formId}-input`}
              ref={inputRef}
              rows={4}
              value={value}
              disabled={isGenerating}
              onChange={(e) => persistBrief(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="We’re launching a new analytics product and want to drive enterprise demo requests."
              className="nw-home__input"
            />

            <div className="nw-home__composer-actions">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onVoice}
                  aria-pressed={listening}
                  className="btn-secondary inline-flex items-center gap-2 !px-3 !py-2 text-[13px]"
                >
                  <MicIcon className="size-4" />
                  {listening ? 'Listening…' : 'Voice'}
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary inline-flex items-center gap-2 !px-3 !py-2 text-[13px]"
                >
                  <UploadIcon className="size-4" />
                  Upload brief
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.fig"
                  className="sr-only"
                  onChange={(e) => onFileChange(e.target.files?.[0])}
                />
              </div>
              <button
                type="submit"
                disabled={!value.trim() || isGenerating}
                className="btn-primary !px-4 !py-2.5"
              >
                {isGenerating ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>

          <div className="nw-home__starters" role="list">
            {STARTER_PROMPTS.map((starter) => (
              <button
                key={starter.id}
                type="button"
                role="listitem"
                disabled={isGenerating}
                onClick={() => persistBrief(starter.draft)}
                className="nw-home__starter"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
