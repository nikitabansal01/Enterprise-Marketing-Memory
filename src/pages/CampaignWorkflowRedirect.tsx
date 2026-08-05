import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import {
  useAiConversation,
  type CampaignWorkflowStep,
} from '../lib/aiConversation'

/** Routes legacy step URLs into the connected Home campaign flow. */
export default function CampaignWorkflowRedirect({
  step,
}: {
  step: CampaignWorkflowStep
}) {
  const { openCampaignWorkflowStep } = useAiConversation()

  useEffect(() => {
    openCampaignWorkflowStep(step)
  }, [openCampaignWorkflowStep, step])

  return <Navigate to="/p0" replace />
}
