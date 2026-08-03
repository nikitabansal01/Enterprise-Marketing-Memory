type ConfidenceTone = 'brand' | 'emerald' | 'amber'

type ConfidenceBarProps = {
  value: number
  tone?: ConfidenceTone | 'auto'
  delayMs?: number
  className?: string
  label?: string
  caption?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function toneFromValue(value: number): ConfidenceTone {
  if (value >= 80) return 'emerald'
  if (value >= 60) return 'brand'
  return 'amber'
}

function toneClass(tone: ConfidenceTone) {
  if (tone === 'emerald') return 'confidence-fill--emerald'
  if (tone === 'amber') return 'confidence-fill--amber'
  return 'confidence-fill--brand'
}

export default function ConfidenceBar({
  value,
  tone = 'auto',
  delayMs = 0,
  className = '',
  label,
  caption = 'confidence',
  showValue = false,
  size = 'md',
}: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const resolved = tone === 'auto' ? toneFromValue(clamped) : tone

  return (
    <div className={['confidence', className].filter(Boolean).join(' ')}>
      {showValue && (
        <div className="confidence-meta">
          <span className="confidence-value tabular-nums">
            {clamped}%
            {caption ? (
              <span className="confidence-caption"> {caption}</span>
            ) : null}
          </span>
        </div>
      )}
      <div
        className={[
          'confidence-track',
          size === 'lg' ? 'confidence-track--lg' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}% ${caption}`}
      >
        <div
          className={['confidence-fill', toneClass(resolved)].join(' ')}
          style={{
            width: `${clamped}%`,
            animationDelay: delayMs ? `${delayMs}ms` : undefined,
          }}
        />
      </div>
    </div>
  )
}
