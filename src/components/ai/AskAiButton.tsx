import { useAiConversation } from '../../lib/aiConversation'

type AskAiButtonProps = {
  label?: string
  className?: string
  onBeforeOpen?: () => void
}

export default function AskAiButton({
  label = 'Ask AI',
  className,
  onBeforeOpen,
}: AskAiButtonProps) {
  const { openPanel, hasActiveCampaign } = useAiConversation()

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.()
        openPanel()
      }}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[13px] font-medium text-brand-800 shadow-[var(--shadow-soft)] transition-colors hover:bg-brand-100'
      }
    >
      <span
        className="size-1.5 rounded-full bg-brand-500"
        aria-hidden="true"
      />
      {hasActiveCampaign && label === 'Ask AI' ? 'Ask AI' : label}
    </button>
  )
}
