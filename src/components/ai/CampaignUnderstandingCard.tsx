import { useEffect, useId, useState } from 'react'
import {
  useAiConversation,
  type CampaignUnderstanding,
  type FieldProvenance,
  type UnderstandingFieldKey,
} from '../../lib/aiConversation'

const PROVENANCE_LABEL: Record<FieldProvenance, string> = {
  user: 'Provided by user',
  inferred: 'Inferred from enterprise memory',
  profile: 'Retrieved from audience profiles',
  similar: 'Inferred from similar campaigns',
  'needs-confirmation': 'Needs confirmation',
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={['ai-understanding__chevron', open ? 'is-open' : ''].join(' ')}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function CampaignUnderstandingCard({
  compact = false,
  editing = true,
}: {
  compact?: boolean
  editing?: boolean
}) {
  const { understanding, updateUnderstanding, isGenerating, execution } =
    useAiConversation()
  const panelId = useId()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!compact) return
    // Stay collapsed while generating or when a run finishes — chat stays for talk.
    if (isGenerating || execution?.status === 'running' || execution?.status === 'complete') {
      setExpanded(false)
    }
  }, [compact, isGenerating, execution?.status])

  if (!understanding) return null

  if (compact) {
    const summary = [
      understanding.objective,
      understanding.primaryAudience || understanding.audience,
      understanding.channels.slice(0, 2).join(', '),
    ]
      .filter(Boolean)
      .join(' · ')

    return (
      <section
        className={[
          'ai-understanding',
          'ai-understanding--compact',
          expanded ? 'is-expanded' : 'is-collapsed',
        ].join(' ')}
        aria-label="Campaign understanding"
      >
        <div className="ai-understanding__bar">
          <div className="ai-understanding__toggle-copy">
            <p className="section-label">Campaign Understanding</p>
            <p className="ai-understanding__summary" title={summary}>
              {summary || 'No details yet'}
            </p>
          </div>
          <button
            type="button"
            className="ai-understanding__edit"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'Done' : 'Edit'}
            <ChevronIcon open={expanded} />
          </button>
        </div>

        {expanded && (
          <div id={panelId} className="ai-understanding__body">
            <UnderstandingFields
              understanding={understanding}
              editing={editing}
              compact
              updateUnderstanding={updateUnderstanding}
            />
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="ai-understanding" aria-label="Campaign understanding">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-label">Campaign Understanding</h2>
        <span className="meta">{editing ? 'Editable' : 'Review'}</span>
      </div>
      <UnderstandingFields
        understanding={understanding}
        editing={editing}
        compact={false}
        updateUnderstanding={updateUnderstanding}
      />
    </section>
  )
}

function UnderstandingFields({
  understanding,
  editing,
  compact,
  updateUnderstanding,
}: {
  understanding: CampaignUnderstanding
  editing: boolean
  compact: boolean
  updateUnderstanding: (patch: Partial<CampaignUnderstanding>) => void
}) {
  return (
    <>
      <FieldText
        label="Campaign objective"
        field="objective"
        provenance={understanding.provenance.objective}
        value={understanding.objective}
        rows={2}
        editing={editing}
        onChange={(objective) => updateUnderstanding({ objective })}
      />

      <p className="ai-understanding__group">Audience</p>
      <FieldText
        label="Primary audience"
        field="primaryAudience"
        provenance={understanding.provenance.primaryAudience}
        value={understanding.primaryAudience}
        rows={2}
        editing={editing}
        onChange={(primaryAudience) => updateUnderstanding({ primaryAudience })}
      />
      <FieldText
        label="Secondary audience"
        field="secondaryAudience"
        provenance={understanding.provenance.secondaryAudience}
        value={understanding.secondaryAudience}
        rows={2}
        editing={editing}
        onChange={(secondaryAudience) => updateUnderstanding({ secondaryAudience })}
      />
      <FieldText
        label="Region or market"
        field="region"
        provenance={understanding.provenance.region}
        value={understanding.region}
        rows={1}
        editing={editing}
        onChange={(region) => updateUnderstanding({ region })}
      />
      <FieldText
        label="Lifecycle stage"
        field="lifecycleStage"
        provenance={understanding.provenance.lifecycleStage}
        value={understanding.lifecycleStage}
        rows={1}
        editing={editing}
        onChange={(lifecycleStage) => updateUnderstanding({ lifecycleStage })}
      />
      <FieldText
        label="Audience pain point"
        field="audiencePainPoint"
        provenance={understanding.provenance.audiencePainPoint}
        value={understanding.audiencePainPoint}
        rows={2}
        editing={editing}
        onChange={(audiencePainPoint) => updateUnderstanding({ audiencePainPoint })}
      />
      <FieldList
        label="Recommended channels"
        field="channels"
        provenance={understanding.provenance.channels}
        value={understanding.channels}
        editing={editing}
        onChange={(channels) => updateUnderstanding({ channels })}
      />

      <p className="ai-understanding__group">Campaign shape</p>
      <FieldList
        label="Asset formats"
        field="formats"
        provenance={understanding.provenance.formats}
        value={understanding.formats}
        editing={editing}
        onChange={(formats) => updateUnderstanding({ formats })}
      />
      <FieldText
        label="Core message"
        field="coreMessage"
        provenance={understanding.provenance.coreMessage}
        value={understanding.coreMessage}
        rows={2}
        editing={editing}
        onChange={(coreMessage) => updateUnderstanding({ coreMessage })}
      />

      {!compact && (
        <>
          <FieldList
            label="Relevant templates"
            field="templates"
            provenance={understanding.provenance.templates}
            value={understanding.templates}
            editing={editing}
            onChange={(templates) => updateUnderstanding({ templates })}
          />
          <FieldList
            label="Similar approved campaigns"
            field="priorCampaigns"
            provenance={understanding.provenance.priorCampaigns}
            value={understanding.priorCampaigns}
            editing={editing}
            onChange={(priorCampaigns) => updateUnderstanding({ priorCampaigns })}
          />
          <FieldText
            label="Required claims or disclaimers"
            field="claims"
            provenance={understanding.provenance.claims}
            value={understanding.claims}
            rows={2}
            editing={editing}
            onChange={(claims) => updateUnderstanding({ claims })}
          />
        </>
      )}
    </>
  )
}

function ProvenanceTag({ source }: { source: FieldProvenance }) {
  return (
    <span className={`ai-understanding__source ai-understanding__source--${source}`}>
      {PROVENANCE_LABEL[source]}
    </span>
  )
}

function FieldText({
  label,
  field,
  provenance,
  value,
  rows,
  editing,
  onChange,
}: {
  label: string
  field: UnderstandingFieldKey
  provenance: FieldProvenance
  value: string
  rows: number
  editing: boolean
  onChange: (next: string) => void
}) {
  return (
    <label className="ai-understanding__field" htmlFor={`understanding-${field}`}>
      <span className="ai-understanding__field-head">
        <span className="eyebrow">{label}</span>
        <ProvenanceTag source={provenance} />
      </span>
      <textarea
        id={`understanding-${field}`}
        rows={rows}
        value={value}
        readOnly={!editing}
        onChange={(e) => onChange(e.target.value)}
        className="field-input mt-1 text-[12px]"
      />
    </label>
  )
}

function FieldList({
  label,
  field,
  provenance,
  value,
  editing,
  onChange,
}: {
  label: string
  field: UnderstandingFieldKey
  provenance: FieldProvenance
  value: string[]
  editing: boolean
  onChange: (next: string[]) => void
}) {
  return (
    <label className="ai-understanding__field" htmlFor={`understanding-${field}`}>
      <span className="ai-understanding__field-head">
        <span className="eyebrow">{label}</span>
        <ProvenanceTag source={provenance} />
      </span>
      <input
        id={`understanding-${field}`}
        type="text"
        value={value.join(', ')}
        readOnly={!editing}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((part) => part.trim())
              .filter(Boolean),
          )
        }
        className="field-input mt-1 text-[12px]"
      />
    </label>
  )
}
