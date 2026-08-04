import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  CAMPAIGN_STARTERS,
  useAiConversation,
  type CampaignStarter,
} from '../../lib/aiConversation'

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

export default function AiWelcome() {
  const { submitIntent, isGenerating } = useAiConversation()
  const [value, setValue] = useState('')
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function onSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!value.trim() || isGenerating) return
    submitIntent(value.trim())
  }

  function onStarter(starter: CampaignStarter) {
    if (isGenerating) return
    submitIntent(value.trim(), starter)
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
      setValue(
        (prev) =>
          prev ||
          'We’re launching a healthcare analytics product and want to drive enterprise demo requests.',
      )
      setListening(false)
      inputRef.current?.focus()
    }, 900)
  }

  function onUploadBrief() {
    fileRef.current?.click()
  }

  function onFileChange(file: File | undefined) {
    if (!file) return
    setValue(
      (prev) =>
        prev ||
        `Use the uploaded brief “${file.name}” to launch a multi-channel campaign for enterprise buyers.`,
    )
  }

  return (
    <section
      className="ai-welcome"
      aria-labelledby={`${formId}-title`}
    >
      <div className="ai-welcome__hero">
        <p className="eyebrow text-brand-600">Marketing Memory · AI</p>
        <h1 id={`${formId}-title`} className="ai-welcome__title">
          What are you trying to launch?
        </h1>
        <p className="ai-welcome__lede">
          Describe the campaign. I’ll infer audience, channels, and formats — then draft
          assets you can edit.
        </p>

        <form onSubmit={onSubmit} className="ai-welcome__composer">
          <label htmlFor={`${formId}-input`} className="sr-only">
            Campaign intent
          </label>
          <textarea
            id={`${formId}-input`}
            ref={inputRef}
            rows={3}
            value={value}
            disabled={isGenerating}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="We’re launching a healthcare analytics product and want to drive enterprise demo requests."
            className="ai-welcome__input"
          />

          <div className="ai-welcome__actions">
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
                onClick={onUploadBrief}
                className="btn-secondary inline-flex items-center gap-2 !px-3 !py-2 text-[13px]"
              >
                <UploadIcon className="size-4" />
                Upload brief
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                className="sr-only"
                onChange={(e) => onFileChange(e.target.files?.[0])}
              />
            </div>
            <button
              type="submit"
              disabled={!value.trim() || isGenerating}
              className="btn-primary !px-4 !py-2.5"
            >
              {isGenerating ? 'Starting…' : 'Start campaign'}
            </button>
          </div>
        </form>

        <div className="ai-welcome__starters">
          <p className="section-label">Suggested starters</p>
          <div className="mt-3 flex flex-wrap gap-2" role="list">
            {CAMPAIGN_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                role="listitem"
                disabled={isGenerating}
                onClick={() => onStarter(starter)}
                className="ai-chip"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
