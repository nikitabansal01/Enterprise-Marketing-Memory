import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  useAiConversation,
  type WorkspaceStatus,
} from '../../lib/aiConversation'
import AiConversationPanel from './AiConversationPanel'
import CampaignOutputWorkspace from './CampaignOutputWorkspace'

type AiWorkspaceShellProps = {
  children: ReactNode
}

function ExperiencePreviewSwitcher({
  value,
  onChange,
}: {
  value: WorkspaceStatus
  onChange: (mode: WorkspaceStatus) => void
}) {
  return (
    <div className="experience-preview" role="group" aria-label="Experience preview">
      <p className="experience-preview__label">Experience preview</p>
      <div className="experience-preview__toggle">
        {(
          [
            { id: 'new', label: 'New workspace' },
            { id: 'established', label: 'Established workspace' },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={[
              'experience-preview__option',
              value === option.id ? 'is-active' : '',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.5 3.5 10 8l-3.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AiPanelRail({ onExpand }: { onExpand: () => void }) {
  return (
    <aside className="ai-panel-rail" aria-label="Campaign AI">
      <button
        type="button"
        className="ai-panel-rail__toggle"
        aria-expanded={false}
        aria-label="Expand Campaign AI"
        title="Expand Campaign AI"
        onClick={onExpand}
      >
        <ExpandIcon className="ai-panel-rail__icon" />
        <span className="ai-panel-rail__label">Campaign AI</span>
      </button>
    </aside>
  )
}

export default function AiWorkspaceShell({ children }: AiWorkspaceShellProps) {
  const location = useLocation()
  const isHome = location.pathname === '/p0' || location.pathname === '/p0/'
  const {
    experienceMode,
    showWelcome,
    showCampaignOutput,
    showUnderstandingFlow,
    hasActiveCampaign,
    panelCollapsed,
    experiencePreview,
    setExperiencePreview,
    openPanel,
    openCampaignWorkspace,
  } = useAiConversation()

  const showSplitPanel = experienceMode === 'split' && !panelCollapsed

  const replaceMainWithOutput = showCampaignOutput && isHome

  // Narrow rail when side chat can exist but is collapsed (not on centered welcome flows).
  const showCollapsedRail =
    panelCollapsed && !showWelcome && !showUnderstandingFlow

  function expandChat() {
    if (isHome && hasActiveCampaign && !replaceMainWithOutput) {
      openCampaignWorkspace()
    }
    openPanel()
  }

  return (
    <div
      className={[
        'ai-workspace',
        showSplitPanel ? 'ai-workspace--split' : '',
        showCollapsedRail ? 'ai-workspace--rail' : '',
        showWelcome || showUnderstandingFlow ? 'ai-workspace--welcome' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showSplitPanel && <AiConversationPanel />}
      {showCollapsedRail && <AiPanelRail onExpand={expandChat} />}

      <div className="ai-workspace__main">
        {isHome && (
          <div className="experience-preview-bar">
            <ExperiencePreviewSwitcher
              value={experiencePreview}
              onChange={setExperiencePreview}
            />
          </div>
        )}

        {replaceMainWithOutput ? <CampaignOutputWorkspace /> : children}
      </div>
    </div>
  )
}
