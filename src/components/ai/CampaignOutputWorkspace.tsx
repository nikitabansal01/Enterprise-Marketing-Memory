import { useAiConversation } from '../../lib/aiConversation'

export default function CampaignOutputWorkspace() {
  const { assets, understanding, isGenerating, openPanel } = useAiConversation()

  if (isGenerating && assets.length === 0) {
    return (
      <div className="ai-output ai-output--empty" aria-busy="true">
        <p className="eyebrow text-brand-600">Generating</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Drafting campaign assets…
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Inferring audience, channels, and formats from your brief.
        </p>
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
          <article key={asset.id} className="ai-asset">
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
