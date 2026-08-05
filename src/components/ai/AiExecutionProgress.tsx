import { useId, useState } from 'react'
import type { AiExecutionState } from '../../lib/aiExecution'

type AiExecutionProgressProps = {
  execution: AiExecutionState
  compact?: boolean
}

export default function AiExecutionProgress({
  execution,
  compact = false,
}: AiExecutionProgressProps) {
  const panelId = useId()
  const [expanded, setExpanded] = useState(false)
  const { status, steps, activeIndex, completedIds, context, needsInput, summary } =
    execution

  if (status === 'complete' && summary) {
    const showBrandChecks = summary.brandChecksPassed > 0
    return (
      <section
        className={['ai-exec', 'ai-exec--complete', compact ? 'ai-exec--compact' : '']
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
      >
        <p className="ai-exec__complete-title">{summary.headline}</p>
        <ul className="ai-exec__summary">
          <li>
            <span className="ai-exec__summary-label">Assets created</span>
            <span>{summary.assetsCreated}</span>
          </li>
          <li>
            <span className="ai-exec__summary-label">Channels covered</span>
            <span>{summary.channelsCovered.join(', ') || '—'}</span>
          </li>
          {showBrandChecks && (
            <li>
              <span className="ai-exec__summary-label">Brand checks passed</span>
              <span>{summary.brandChecksPassed}</span>
            </li>
          )}
          <li>
            <span className="ai-exec__summary-label">Items needing review</span>
            <span>
              {summary.itemsNeedingReview.length > 0
                ? summary.itemsNeedingReview.join(' · ')
                : 'None'}
            </span>
          </li>
        </ul>
      </section>
    )
  }

  if (status === 'complete') return null

  return (
    <section
      className={['ai-exec', compact ? 'ai-exec--compact' : '', status === 'needs-input' ? 'ai-exec--needs-input' : '']
        .filter(Boolean)
        .join(' ')}
      aria-busy={status === 'running'}
      aria-live="polite"
    >
      {(status === 'running' || status === 'needs-input') && (
        <ol className="ai-exec__steps">
          {steps.map((step, index) => {
            const done =
              completedIds.includes(step.id) ||
              (status === 'needs-input' && completedIds.length >= steps.length)
            const active = status === 'running' && index === activeIndex && !done
            // Only show active + completed + next pending for compactness,
            // but keep full list visible as a quiet checklist.
            return (
              <li
                key={step.id}
                className={[
                  'ai-exec__step',
                  done ? 'is-done' : '',
                  active ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="ai-exec__marker" aria-hidden="true">
                  {done ? (
                    <CheckIcon />
                  ) : active ? (
                    <span className="ai-exec__pulse" />
                  ) : (
                    <span className="ai-exec__dot" />
                  )}
                </span>
                <span className="ai-exec__label">{step.label}</span>
              </li>
            )
          })}
        </ol>
      )}

      {status === 'needs-input' && needsInput && (
        <div className="ai-exec__needs">
          <p className="ai-exec__needs-title">Needs your input</p>
          <ul className="ai-exec__needs-list">
            {needsInput.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="ai-exec__using">
        <button
          type="button"
          className="ai-exec__using-toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((prev) => !prev)}
        >
          What I’m using
          <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
        {expanded && (
          <div id={panelId} className="ai-exec__using-panel">
            <UsingRow label="Connected brand sources" value={context.brandSources} />
            <UsingRow label="Relevant campaign examples" value={context.campaignExamples} />
            <UsingRow label="Confidence" value={[context.confidence]} />
            <UsingRow
              label="Missing context"
              value={
                context.missingContext.length > 0
                  ? context.missingContext
                  : ['Nothing critical yet']
              }
            />
          </div>
        )}
      </div>
    </section>
  )
}

function UsingRow({ label, value }: { label: string; value: string[] }) {
  return (
    <div className="ai-exec__using-row">
      <p className="ai-exec__using-label">{label}</p>
      <p className="ai-exec__using-value">{value.join(' · ')}</p>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="ai-exec__check" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
