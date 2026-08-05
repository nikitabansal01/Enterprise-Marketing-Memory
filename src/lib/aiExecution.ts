export type AiExecutionKind =
  | 'understanding'
  | 'generation'
  | 'studio'
  | 'intelligence'

export type AiExecutionStep = {
  id: string
  label: string
}

export type AiConfidence = 'High' | 'Medium' | 'Low'

export type AiExecutionContext = {
  brandSources: string[]
  campaignExamples: string[]
  confidence: AiConfidence
  missingContext: string[]
}

export type AiNeedsInput = {
  items: string[]
}

export type AiExecutionSummary = {
  headline: string
  assetsCreated: number
  channelsCovered: string[]
  brandChecksPassed: number
  itemsNeedingReview: string[]
}

export type AiExecutionStatus = 'running' | 'needs-input' | 'complete'

export type AiExecutionState = {
  id: string
  kind: AiExecutionKind
  status: AiExecutionStatus
  steps: AiExecutionStep[]
  activeIndex: number
  completedIds: string[]
  context: AiExecutionContext
  needsInput?: AiNeedsInput
  summary?: AiExecutionSummary
}

export const UNDERSTANDING_STEPS: AiExecutionStep[] = [
  { id: 'intent', label: 'Understanding campaign intent' },
  { id: 'brand-rules', label: 'Retrieving relevant brand rules' },
  { id: 'similar', label: 'Finding similar approved campaigns' },
  { id: 'recommend', label: 'Recommending audience, channels, and formats' },
  { id: 'claims', label: 'Checking required claims and disclaimers' },
  { id: 'prepare', label: 'Preparing campaign understanding' },
]

export const GENERATION_STEPS: AiExecutionStep[] = [
  { id: 'copy', label: 'Generating campaign copy' },
  { id: 'visual', label: 'Creating visual directions' },
  { id: 'design-system', label: 'Applying design-system rules' },
  { id: 'channels', label: 'Adapting assets for selected channels' },
  { id: 'compliance', label: 'Running brand and compliance checks' },
  { id: 'outputs', label: 'Preparing editable outputs' },
]

export const STUDIO_STEPS: AiExecutionStep[] = [
  { id: 'selection', label: 'Reading your selection' },
  { id: 'brief', label: 'Applying your edit request' },
  { id: 'brand', label: 'Checking brand voice rules' },
  { id: 'adapt', label: 'Updating selected assets' },
  { id: 'review', label: 'Flagging items that need review' },
]

export const INTELLIGENCE_STEPS: AiExecutionStep[] = [
  { id: 'signals', label: 'Reviewing market signals' },
  { id: 'memory', label: 'Comparing prior campaign performance' },
  { id: 'rank', label: 'Ranking recommendations' },
  { id: 'evidence', label: 'Gathering supporting evidence' },
  { id: 'prepare', label: 'Preparing a clear answer' },
]

export function stepsForKind(
  kind: AiExecutionKind,
  options?: { hasVerifiedBrandSource?: boolean },
): AiExecutionStep[] {
  switch (kind) {
    case 'understanding':
      return UNDERSTANDING_STEPS
    case 'generation':
      if (options?.hasVerifiedBrandSource === false) {
        return GENERATION_STEPS.filter(
          (step) => step.id !== 'design-system' && step.id !== 'compliance',
        )
      }
      return GENERATION_STEPS
    case 'studio':
      return STUDIO_STEPS
    case 'intelligence':
      return INTELLIGENCE_STEPS
  }
}

export function runStepSequence(
  stepCount: number,
  onTick: (activeIndex: number, completedCount: number) => void,
  onDone: () => void,
  stepMs = 520,
): () => void {
  let cancelled = false
  let index = 0

  const tick = () => {
    if (cancelled) return
    onTick(index, index)
    index += 1
    if (index >= stepCount) {
      window.setTimeout(() => {
        if (!cancelled) onDone()
      }, stepMs)
      return
    }
    window.setTimeout(tick, stepMs)
  }

  window.setTimeout(tick, 180)
  return () => {
    cancelled = true
  }
}
