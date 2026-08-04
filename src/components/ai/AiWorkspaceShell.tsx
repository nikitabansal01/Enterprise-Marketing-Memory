import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  useAiConversation,
  type WorkspaceStatus,
} from '../../lib/aiConversation'
import { phaseFromPath } from '../../lib/phases'
import AiConversationPanel from './AiConversationPanel'
import AskAiButton from './AskAiButton'
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

export default function AiWorkspaceShell({ children }: AiWorkspaceShellProps) {
  const location = useLocation()
  const phase = phaseFromPath(location.pathname)
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

  const showCollapsedControl =
    panelCollapsed &&
    !(isHome && (showWelcome || showUnderstandingFlow || experiencePreview === 'new')) &&
    (phase === 'p1' || phase === 'p2' || isHome || hasActiveCampaign)

  return (
    <div
      className={[
        'ai-workspace',
        showSplitPanel ? 'ai-workspace--split' : '',
        showWelcome || showUnderstandingFlow ? 'ai-workspace--welcome' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showSplitPanel && <AiConversationPanel />}

      <div className="ai-workspace__main">
        {isHome && (
          <div className="experience-preview-bar">
            <ExperiencePreviewSwitcher
              value={experiencePreview}
              onChange={setExperiencePreview}
            />
          </div>
        )}

        {showCollapsedControl && (
          <div className="ai-workspace__ask">
            <AskAiButton
              label={
                isHome && hasActiveCampaign
                  ? 'Open campaign'
                  : isHome
                    ? 'Start campaign'
                    : 'Ask AI'
              }
              onBeforeOpen={() => {
                if (isHome && hasActiveCampaign) openCampaignWorkspace()
                else openPanel()
              }}
            />
          </div>
        )}

        {replaceMainWithOutput ? <CampaignOutputWorkspace /> : children}
      </div>
    </div>
  )
}
