import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiConversation } from '../../lib/aiConversation'
import { usePhaseHref } from '../../lib/usePhase'
import AiExecutionProgress from './AiExecutionProgress'
import CampaignUnderstandingCard from './CampaignUnderstandingCard'

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

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M15.5 9.5 9.2 15.8a3.2 3.2 0 0 1-4.5-4.5l7-7a2.1 2.1 0 0 1 3 3l-7 7a1 1 0 1 1-1.4-1.4l6.3-6.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5 6 8l3.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AiConversationPanel() {
  const {
    messages,
    understanding,
    isGenerating,
    selection,
    panelWidthPct,
    setPanelWidthPct,
    setPanelCollapsed,
    sendMessage,
    beginConnectBrand,
    isExploratoryDraft,
    showUnderstandingFlow,
    understandingPhase,
    execution,
  } = useAiConversation()
  const learnBrandHref = usePhaseHref('learn-brand')
  const navigate = useNavigate()

  const [value, setValue] = useState('')
  const [listening, setListening] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const resizing = useRef(false)
  const formId = useId()

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isGenerating, understandingPhase, execution?.status, execution?.activeIndex])

  function goConnectBrand() {
    beginConnectBrand()
    navigate(learnBrandHref)
  }

  function onSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!value.trim() || isGenerating) return
    sendMessage(value.trim())
    setValue('')
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
      setValue((prev) => prev || 'Make the CTA more specific to demo requests.')
      setListening(false)
      inputRef.current?.focus()
    }, 800)
  }

  function onResizePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault()
    resizing.current = true
    const startX = e.clientX
    const startWidth = panelWidthPct
    const workspace = e.currentTarget.parentElement?.parentElement
    const workspaceWidth = workspace?.clientWidth ?? window.innerWidth

    function onMove(ev: PointerEvent) {
      if (!resizing.current) return
      const deltaPct = ((ev.clientX - startX) / workspaceWidth) * 100
      setPanelWidthPct(startWidth + deltaPct)
    }

    function onUp() {
      resizing.current = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function onResizeKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPanelWidthPct(panelWidthPct - 2)
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setPanelWidthPct(panelWidthPct + 2)
    }
  }

  return (
    <aside
      className="ai-panel"
      style={{ flex: `0 0 ${panelWidthPct}%` }}
      aria-label="AI conversation"
    >
      <header className="ai-panel__header">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Campaign AI</p>
          <h2 className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            {understanding?.objective
              ? understanding.objective.slice(0, 64)
              : 'Conversation'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setPanelCollapsed(true)}
          className="ai-panel__icon-btn"
          aria-label="Collapse AI panel"
          title="Collapse"
        >
          <CollapseIcon className="size-4" />
        </button>
      </header>

      {selection?.summary && (
        <div className="ai-panel__selection" role="status">
          <span className="eyebrow">Selection context</span>
          <p className="mt-1 text-[12px] leading-snug text-foreground">
            {selection.summary}
          </p>
        </div>
      )}

      <div ref={listRef} className="ai-panel__messages" tabIndex={0}>
        {messages.length === 0 && !understanding ? (
          <p className="px-1 text-[12px] leading-relaxed text-muted">
            Ask about this campaign, or select canvas items and use Ask AI.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={[
                'ai-panel__bubble',
                message.role === 'user' ? 'ai-panel__bubble--user' : 'ai-panel__bubble--assistant',
              ].join(' ')}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        {execution &&
          (execution.status === 'running' ||
            execution.status === 'needs-input' ||
            (execution.status === 'complete' && execution.kind !== 'understanding')) && (
            <AiExecutionProgress execution={execution} compact />
          )}
        {isExploratoryDraft && understandingPhase === 'confirmed' && (
          <button
            type="button"
            className="mt-1 text-left text-[11px] font-medium text-brand-700 hover:text-brand-800"
            onClick={goConnectBrand}
          >
            Recommended: Connect brand system →
          </button>
        )}
      </div>

      {understanding && !showUnderstandingFlow && (
        <CampaignUnderstandingCard compact />
      )}

      <form onSubmit={onSubmit} className="ai-panel__composer">
        <label htmlFor={`${formId}-reply`} className="sr-only">
          Message AI
        </label>
        <textarea
          id={`${formId}-reply`}
          ref={inputRef}
          rows={2}
          value={value}
          disabled={isGenerating}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            selection?.summary
              ? 'Ask about the selection…'
              : 'Ask for revisions…'
          }
          className="ai-panel__input"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onVoice}
              aria-pressed={listening}
              className="ai-panel__icon-btn"
              aria-label="Voice input"
              title="Voice"
            >
              <MicIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="ai-panel__icon-btn"
              aria-label="Attach file"
              title="Attach"
            >
              <PaperclipIcon className="size-4" />
            </button>
            <input ref={fileRef} type="file" className="sr-only" />
          </div>
          <button
            type="submit"
            disabled={!value.trim() || isGenerating}
            className="btn-primary !px-3 !py-1.5 text-[12px]"
          >
            Send
          </button>
        </div>
      </form>

      <div
        className="ai-panel__resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize AI panel"
        aria-valuenow={Math.round(panelWidthPct)}
        aria-valuemin={26}
        aria-valuemax={40}
        tabIndex={0}
        onPointerDown={onResizePointerDown}
        onKeyDown={onResizeKeyDown}
      />
    </aside>
  )
}
