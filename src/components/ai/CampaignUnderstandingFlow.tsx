import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiConversation } from '../../lib/aiConversation'
import { usePhaseHref } from '../../lib/usePhase'
import AiExecutionProgress from './AiExecutionProgress'
import CampaignUnderstandingCard from './CampaignUnderstandingCard'

export default function CampaignUnderstandingFlow() {
  const navigate = useNavigate()
  const learnBrandHref = usePhaseHref('learn-brand')
  const formId = useId()
  const {
    messages,
    understandingPhase,
    currentUnderstandingQuestion,
    hasVerifiedBrandSource,
    isGenerating,
    execution,
    sendMessage,
    confirmUnderstanding,
    beginConnectBrand,
    createExploratoryDraft,
  } = useAiConversation()

  const [reply, setReply] = useState('')
  const [hintAfterLooksRight, setHintAfterLooksRight] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const onSubmitReply = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = reply.trim()
    if (!trimmed || isGenerating) return
    sendMessage(trimmed)
    setReply('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmitReply(e as unknown as FormEvent)
    }
  }

  const goConnectBrand = () => {
    beginConnectBrand()
    navigate(learnBrandHref)
  }

  const onLooksRight = () => {
    if (hasVerifiedBrandSource) {
      confirmUnderstanding('branded')
      return
    }
    setHintAfterLooksRight(true)
  }

  const onEditDetails = () => {
    setHintAfterLooksRight(false)
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const first = cardRef.current?.querySelector('textarea, input') as
      | HTMLTextAreaElement
      | HTMLInputElement
      | null
    first?.focus()
  }

  const showPrep =
    understandingPhase === 'preparing' ||
    (understandingPhase === 'questions' &&
      !!execution &&
      execution.kind === 'understanding' &&
      execution.status === 'needs-input')

  return (
    <div className="understanding-flow">
      <header className="understanding-flow__header">
        <p className="eyebrow">Campaign Understanding</p>
        <h1 className="understanding-flow__title">
          {understandingPhase === 'preparing'
            ? 'Working through your brief'
            : understandingPhase === 'questions'
              ? 'A few essentials before we shape this campaign'
              : 'Confirm what I understood'}
        </h1>
      </header>

      <div className="understanding-flow__thread" aria-live="polite">
        {messages.slice(-8).map((message) => (
          <div
            key={message.id}
            className={[
              'understanding-flow__bubble',
              message.role === 'user'
                ? 'understanding-flow__bubble--user'
                : 'understanding-flow__bubble--assistant',
            ].join(' ')}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
      </div>

      {showPrep && execution && <AiExecutionProgress execution={execution} />}

      {understandingPhase === 'questions' && (
        <form onSubmit={onSubmitReply} className="understanding-flow__composer">
          <label htmlFor={`${formId}-answer`} className="sr-only">
            {currentUnderstandingQuestion ?? 'Answer'}
          </label>
          <textarea
            id={`${formId}-answer`}
            rows={3}
            value={reply}
            disabled={isGenerating}
            placeholder={currentUnderstandingQuestion ?? 'Your answer'}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={onKeyDown}
            className="field-input text-[13px]"
          />
          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={!reply.trim() || isGenerating}
          >
            Continue
          </button>
        </form>
      )}

      {understandingPhase === 'review' && (
        <div className="understanding-flow__review">
          {!hasVerifiedBrandSource && (
            <p className="understanding-flow__warning" role="status">
              This campaign is not yet grounded in a verified enterprise brand system.
            </p>
          )}

          <div ref={cardRef}>
            <CampaignUnderstandingCard editing />
          </div>

          <div className="understanding-flow__actions">
            <button
              type="button"
              className="btn-primary"
              disabled={isGenerating}
              onClick={onLooksRight}
            >
              Looks right
            </button>
            <button type="button" className="btn-secondary" onClick={onEditDetails}>
              Edit details
            </button>
            <button type="button" className="btn-secondary" onClick={goConnectBrand}>
              Connect brand system
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={isGenerating}
              onClick={createExploratoryDraft}
            >
              Continue as exploratory draft
            </button>
          </div>

          {!hasVerifiedBrandSource && hintAfterLooksRight && (
            <p className="understanding-flow__hint">
              Understanding confirmed. Connect your brand system or continue as an exploratory
              draft to generate assets.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
