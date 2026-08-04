import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAiConversation } from '../../lib/aiConversation'
import { phaseFromPath } from '../../lib/phases'
import AiConversationPanel from './AiConversationPanel'
import AskAiButton from './AskAiButton'
import CampaignOutputWorkspace from './CampaignOutputWorkspace'

type AiWorkspaceShellProps = {
  children: ReactNode
}

export default function AiWorkspaceShell({ children }: AiWorkspaceShellProps) {
  const location = useLocation()
  const phase = phaseFromPath(location.pathname)
  const isHome = location.pathname === '/p0' || location.pathname === '/p0/'
  const {
    experienceMode,
    showWelcome,
    showCampaignOutput,
    hasActiveCampaign,
    panelCollapsed,
    openPanel,
    openCampaignWorkspace,
  } = useAiConversation()

  const showSplitPanel = experienceMode === 'split' && !panelCollapsed

  const replaceMainWithOutput = showCampaignOutput && isHome

  const showCollapsedControl =
    panelCollapsed &&
    !showWelcome &&
    (phase === 'p1' || phase === 'p2' || isHome || hasActiveCampaign)

  return (
    <div
      className={[
        'ai-workspace',
        showSplitPanel ? 'ai-workspace--split' : '',
        showWelcome ? 'ai-workspace--welcome' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showSplitPanel && <AiConversationPanel />}

      <div className="ai-workspace__main">
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
