import { Link } from 'react-router-dom'
import { useAiConversation } from '../../lib/aiConversation'
import { usePhaseHref } from '../../lib/usePhase'
import AiExecutionProgress from './AiExecutionProgress'

export default function CampaignOutputWorkspace() {
  const {
    assets,
    understanding,
    isGenerating,
    execution,
    openPanel,
    isExploratoryDraft,
    beginConnectBrand,
  } = useAiConversation()
  const learnBrandHref = usePhaseHref('learn-brand')

  const showGenerationProgress =
    execution &&
    execution.kind === 'generation' &&
    (execution.status === 'running' ||
      execution.status === 'needs-input' ||
      (execution.status === 'complete' && assets.length === 0))

  if (showGenerationProgress && execution) {
    return (
      <div className="ai-output ai-output--empty" aria-busy={execution.status === 'running'}>
        <p className="eyebrow text-brand-600">Campaign output</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {execution.status === 'complete'
            ? 'Your campaign package is ready.'
            : 'Building your campaign package'}
        </h2>
        <div className="mt-5 w-full max-w-md">
          <AiExecutionProgress execution={execution} />
        </div>
      </div>
    )
  }

  if (isGenerating && assets.length === 0) {
    return (
      <div className="ai-output ai-output--empty" aria-busy="true">
        <p className="eyebrow text-brand-600">Campaign output</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Building your campaign package
        </h2>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="ai-output ai-output--empty">
        <p className="eyebrow">Campaign output</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Assets will appear here
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Capture campaign intent in the conversation to generate drafts.
        </p>
        <button type="button" onClick={openPanel} className="btn-primary mt-5">
          Open AI
        </button>
      </div>
    )
  }

  return (
    <div className="ai-output">
      {execution?.kind === 'generation' && execution.status === 'complete' && (
        <div className="mb-4">
          <AiExecutionProgress execution={execution} />
        </div>
      )}

      {isExploratoryDraft && (
        <div className="exploratory-banner" role="status">
          <div>
            <p className="exploratory-banner__label">
              Exploratory draft — not validated against your enterprise brand system
            </p>
            <p className="meta mt-1">Temporary styling until a brand source is approved.</p>
          </div>
          <Link
            to={learnBrandHref}
            className="btn-primary shrink-0 !px-3 !py-1.5 text-[12px]"
            onClick={() => beginConnectBrand()}
          >
            Connect brand system
          </Link>
        </div>
      )}

      <header className="ai-output__header">
        <div>
          <p className="eyebrow text-brand-600">Campaign output</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
            {understanding?.objective ?? 'Generated assets'}
          </h2>
        </div>
        <p className="meta">{assets.length} assets</p>
      </header>

      <div className="ai-output__grid">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className={['ai-asset', isExploratoryDraft ? 'ai-asset--exploratory' : ''].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="eyebrow">{asset.format}</p>
                <h3 className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                  {asset.title}
                </h3>
              </div>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                {asset.type}
              </span>
            </div>

            {(asset.type === 'image' || asset.type === 'combined') && (
              <div className="ai-asset__visual" aria-hidden="true">
                <span>{asset.imageHint ?? 'Visual treatment from brand memory'}</span>
              </div>
            )}

            {(asset.type === 'text' || asset.type === 'combined') && (
              <div className="mt-3 space-y-2">
                <p className="text-[15px] font-semibold tracking-tight text-foreground">
                  {asset.headline}
                </p>
                <p className="text-[13px] leading-relaxed text-muted">{asset.body}</p>
                <p className="text-[12px] font-medium text-brand-700">{asset.cta} →</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
