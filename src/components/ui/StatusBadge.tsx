type StatusTone = 'emerald' | 'amber' | 'brand' | 'slate' | 'rose'

type StatusBadgeProps = {
  children: string
  tone?: StatusTone
  dot?: boolean
  className?: string
}

const statusMap: Record<string, StatusTone> = {
  Published: 'emerald',
  Winning: 'emerald',
  Strong: 'emerald',
  Selected: 'brand',
  Steady: 'slate',
  Draft: 'slate',
  Emerging: 'brand',
  'In Review': 'amber',
  Watch: 'amber',
  Active: 'emerald',
  Added: 'brand',
  'In memory': 'emerald',
  Approved: 'emerald',
  Connected: 'emerald',
  Syncing: 'brand',
  Ready: 'emerald',
  Queued: 'slate',
  Waiting: 'amber',
  Pending: 'slate',
  Blocked: 'rose',
  Failed: 'rose',
  Done: 'emerald',
  'Not connected': 'slate',
}

export function toneForStatus(label: string): StatusTone {
  return statusMap[label] ?? 'slate'
}

export default function StatusBadge({
  children,
  tone,
  dot = true,
  className = '',
}: StatusBadgeProps) {
  const resolved = tone ?? toneForStatus(children)

  return (
    <span
      className={[
        'status-badge',
        `status-badge--${resolved}`,
        dot ? 'status-badge--dot' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
