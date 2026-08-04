import { useAiConversation } from '../../lib/aiConversation'

export default function CampaignUnderstandingCard() {
  const { understanding, updateUnderstanding } = useAiConversation()

  if (!understanding) return null

  return (
    <section
      className="ai-understanding"
      aria-label="Campaign understanding"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-label">Campaign Understanding</h2>
        <span className="meta">Editable</span>
      </div>

      <label className="mt-3 block">
        <span className="eyebrow">Objective</span>
        <textarea
          rows={2}
          value={understanding.objective}
          onChange={(e) => updateUnderstanding({ objective: e.target.value })}
          className="field-input mt-1 text-[12px]"
        />
      </label>

      <label className="mt-2.5 block">
        <span className="eyebrow">Audience</span>
        <textarea
          rows={2}
          value={understanding.audience}
          onChange={(e) => updateUnderstanding({ audience: e.target.value })}
          className="field-input mt-1 text-[12px]"
        />
      </label>

      <FieldList
        label="Channels"
        value={understanding.channels}
        onChange={(channels) => updateUnderstanding({ channels })}
      />
      <FieldList
        label="Formats"
        value={understanding.formats}
        onChange={(formats) => updateUnderstanding({ formats })}
      />
      <FieldList
        label="Templates"
        value={understanding.templates}
        onChange={(templates) => updateUnderstanding({ templates })}
      />
      <FieldList
        label="Prior campaigns"
        value={understanding.priorCampaigns}
        onChange={(priorCampaigns) => updateUnderstanding({ priorCampaigns })}
      />
    </section>
  )
}

function FieldList({
  label,
  value,
  onChange,
}: {
  label: string
  value: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <label className="mt-2.5 block">
      <span className="eyebrow">{label}</span>
      <input
        type="text"
        value={value.join(', ')}
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
