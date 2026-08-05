import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import {
  runStepSequence,
  stepsForKind,
  type AiConfidence,
  type AiExecutionContext,
  type AiExecutionKind,
  type AiExecutionState,
  type AiExecutionSummary,
  type AiNeedsInput,
} from './aiExecution'
import { phaseFromPath } from './phases'

export type PanelContextKey = 'home' | 'studio' | 'intelligence' | 'campaign'

export type ChatRole = 'user' | 'assistant' | 'system'

export type CampaignStarter =
  | 'Email'
  | 'Social post'
  | 'Banner'
  | 'Flyer'
  | 'Brochure'
  | 'Infographic'
  | 'Multi-channel campaign'

export type AssetType = 'text' | 'image' | 'combined'

export type FieldProvenance =
  | 'user'
  | 'inferred'
  | 'profile'
  | 'similar'
  | 'needs-confirmation'

export type UnderstandingFieldKey =
  | 'objective'
  | 'primaryAudience'
  | 'secondaryAudience'
  | 'region'
  | 'lifecycleStage'
  | 'audiencePainPoint'
  | 'channels'
  | 'formats'
  | 'coreMessage'
  | 'templates'
  | 'priorCampaigns'
  | 'claims'

export type CampaignUnderstanding = {
  objective: string
  /** @deprecated use primaryAudience — kept in sync for older callers */
  audience: string
  primaryAudience: string
  secondaryAudience: string
  region: string
  lifecycleStage: string
  audiencePainPoint: string
  channels: string[]
  formats: string[]
  coreMessage: string
  templates: string[]
  priorCampaigns: string[]
  claims: string
  provenance: Record<UnderstandingFieldKey, FieldProvenance>
}

export type UnderstandingPhase =
  | 'idle'
  | 'preparing'
  | 'questions'
  | 'review'
  | 'confirmed'

export type UnderstandingQuestionId = 'create' | 'outcome' | 'audience' | 'else'

const CREATE_PROMPT =
  'What would you like to create — infographics, brochures, flyers, banners, social media graphics, or something else?'

const UNDERSTANDING_QUESTIONS: {
  id: UnderstandingQuestionId
  prompt: string
}[] = [
  { id: 'create', prompt: CREATE_PROMPT },
  { id: 'outcome', prompt: 'What business outcome should it drive?' },
  {
    id: 'audience',
    prompt: 'Who is the primary audience for this campaign?',
  },
  { id: 'else', prompt: CREATE_PROMPT },
]

export type SelectionKind =
  | 'asset'
  | 'workflow-node'
  | 'copy'
  | 'image'
  | 'approval'
  | 'multi'
  | null

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

export type CampaignAsset = {
  id: string
  type: AssetType
  format: string
  title: string
  headline: string
  body: string
  cta: string
  imageHint?: string
}

export type SelectionContext = {
  kind: SelectionKind
  ids: string[]
  labels: string[]
  summary: string
}

export type PanelPrefs = {
  collapsed: boolean
  widthPct: number
}

export type WorkspaceStatus = 'new' | 'established'
/** @deprecated alias — use WorkspaceStatus for product state; experiencePreview for demo tab */
export type WorkspacePreview = WorkspaceStatus

export type CampaignWorkflowStep = 'understanding' | 'drafts'

type PersistedAiState = {
  isReturningUser: boolean
  hasActiveCampaign: boolean
  hasVerifiedBrandSource: boolean
  workspaceStatus: WorkspaceStatus
  experiencePreview: WorkspaceStatus
  workspacePreview?: WorkspaceStatus
  savedCampaignBrief: string | null
  pendingPathB: boolean
  isExploratoryDraft: boolean
  understandingPhase: UnderstandingPhase
  openQuestionIds: UnderstandingQuestionId[]
  panelByContext: Partial<Record<PanelContextKey, PanelPrefs>>
  lastCampaignId: string | null
  understanding: CampaignUnderstanding | null
  messages: ChatMessage[]
  assets: CampaignAsset[]
  starter: CampaignStarter | null
}

type AiConversationValue = {
  isReturningUser: boolean
  hasActiveCampaign: boolean
  hasVerifiedBrandSource: boolean
  workspaceStatus: WorkspaceStatus
  experiencePreview: WorkspaceStatus
  workspacePreview: WorkspaceStatus
  savedCampaignBrief: string | null
  pendingPathB: boolean
  isExploratoryDraft: boolean
  understandingPhase: UnderstandingPhase
  openQuestionIds: UnderstandingQuestionId[]
  currentUnderstandingQuestion: string | null
  messages: ChatMessage[]
  understanding: CampaignUnderstanding | null
  assets: CampaignAsset[]
  starter: CampaignStarter | null
  isGenerating: boolean
  execution: AiExecutionState | null
  selection: SelectionContext | null
  panelCollapsed: boolean
  panelWidthPct: number
  panelContext: PanelContextKey
  experienceMode: 'welcome' | 'split' | 'collapsed'
  showWelcome: boolean
  showCampaignOutput: boolean
  showUnderstandingFlow: boolean
  setExperiencePreview: (mode: WorkspaceStatus) => void
  setWorkspacePreview: (mode: WorkspaceStatus) => void
  setSavedCampaignBrief: (brief: string | null) => void
  beginConnectBrand: (brief?: string | null) => void
  createExploratoryDraft: () => void
  confirmUnderstanding: (mode: 'branded' | 'exploratory') => void
  resumeSavedCampaignBrief: () => void
  continueToFirstDraft: () => void
  goToCampaignDashboard: () => void
  approveVerifiedBrandSource: () => void
  setPanelCollapsed: (collapsed: boolean) => void
  setPanelWidthPct: (pct: number) => void
  togglePanel: () => void
  openPanel: () => void
  openCampaignWorkspace: () => void
  openCampaignWorkflowStep: (step: CampaignWorkflowStep) => void
  setSelection: (selection: SelectionContext | null) => void
  updateUnderstanding: (patch: Partial<CampaignUnderstanding>) => void
  submitIntent: (text: string, starter?: CampaignStarter | null) => void
  sendMessage: (text: string) => void
  askAboutSelection: (prompt: string) => void
  askIntelligence: (prompt: string) => void
  clearConversation: () => void
  markReturning: () => void
}

const STORAGE_KEY = 'emm-ai-conversation-v1'
const PREVIEW_STORAGE_KEY = 'emm-experience-preview-v1'

const DEFAULT_PANEL: PanelPrefs = { collapsed: true, widthPct: 32 }

const STARTER_FORMATS: Record<CampaignStarter, string[]> = {
  Email: ['Email'],
  'Social post': ['LinkedIn post', 'Social graphic'],
  Banner: ['728×90 banner', '300×250 banner'],
  Flyer: ['One-page flyer'],
  Brochure: ['Multi-page brochure'],
  Infographic: ['Infographic'],
  'Multi-channel campaign': ['Email', 'LinkedIn post', 'Banner', 'Flyer'],
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function loadPersisted(): PersistedAiState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedAiState
  } catch {
    return null
  }
}

function loadPreviewTab(fallback: WorkspaceStatus): WorkspaceStatus {
  try {
    const raw = localStorage.getItem(PREVIEW_STORAGE_KEY)
    if (raw === 'new' || raw === 'established') return raw
  } catch {
    /* ignore */
  }
  return fallback
}

function defaultProvenance(
  overrides: Partial<CampaignUnderstanding['provenance']> = {},
): CampaignUnderstanding['provenance'] {
  return {
    objective: 'needs-confirmation',
    primaryAudience: 'needs-confirmation',
    secondaryAudience: 'needs-confirmation',
    region: 'needs-confirmation',
    lifecycleStage: 'needs-confirmation',
    audiencePainPoint: 'needs-confirmation',
    channels: 'inferred',
    formats: 'inferred',
    coreMessage: 'inferred',
    templates: 'inferred',
    priorCampaigns: 'inferred',
    claims: 'needs-confirmation',
    ...overrides,
  }
}

function hasAudienceSignal(intent: string): boolean {
  const lower = intent.toLowerCase()
  return [
    'audience',
    'buyer',
    'buyers',
    'persona',
    'segment',
    'customer',
    'patients',
    'clinician',
    'enterprise marketing',
    'revenue leader',
    'it leader',
    'smb',
    'health system',
    'enterprise buyers',
    'target',
  ].some((hint) => lower.includes(hint))
}

function detectAnsweredQuestions(
  intent: string,
  starter: CampaignStarter | null,
): Set<UnderstandingQuestionId> {
  const lower = intent.toLowerCase()
  const answered = new Set<UnderstandingQuestionId>()

  const formatHints = [
    'email',
    'social',
    'linkedin',
    'banner',
    'flyer',
    'brochure',
    'infographic',
    'post',
    'ad',
    'graphic',
  ]
  if (starter || formatHints.some((hint) => lower.includes(hint))) {
    answered.add('create')
  }

  const outcomeHints = [
    'drive',
    'demo',
    'lead',
    'awareness',
    'conversion',
    'reply',
    'registration',
    'pipeline',
    'outcome',
    'qualified',
    'click',
    'sign-up',
    'signup',
  ]
  if (outcomeHints.some((hint) => lower.includes(hint))) {
    answered.add('outcome')
  }

  if (hasAudienceSignal(intent)) {
    answered.add('audience')
  }

  return answered
}

function remainingQuestions(
  intent: string,
  starter: CampaignStarter | null,
): UnderstandingQuestionId[] {
  const answered = detectAnsweredQuestions(intent, starter)
  // Cap at 3 essential questions.
  const priority: UnderstandingQuestionId[] = ['create', 'outcome', 'audience']
  return priority.filter((id) => !answered.has(id)).slice(0, 3)
}

function inferUnderstanding(
  intent: string,
  starter: CampaignStarter | null,
): CampaignUnderstanding {
  const lower = intent.toLowerCase()
  const healthcare =
    lower.includes('health') || lower.includes('clinic') || lower.includes('patient')
  const enterprise =
    lower.includes('enterprise') || lower.includes('b2b') || lower.includes('demo')
  const formats = starter
    ? STARTER_FORMATS[starter]
    : enterprise
      ? ['Email', 'LinkedIn post', 'Banner']
      : ['Social post', 'Email']
  const answered = detectAnsweredQuestions(intent, starter)
  const objective = intent.trim() || 'Launch a new campaign'
  const audienceKnown = answered.has('audience')

  const primaryAudience = healthcare
    ? 'Healthcare IT and analytics buyers at health systems'
    : enterprise
      ? 'Enterprise marketing and revenue leaders'
      : ''

  const secondaryAudience = healthcare
    ? 'Clinical operations leaders evaluating analytics tools'
    : enterprise
      ? 'Revenue operations and demand-gen managers'
      : ''

  const region = healthcare
    ? 'US health systems'
    : enterprise
      ? 'North America enterprise'
      : ''

  const lifecycleStage = enterprise || healthcare ? 'Evaluation / consideration' : ''

  const audiencePainPoint = healthcare
    ? 'Hard to prove analytics ROI to clinical and IT stakeholders'
    : enterprise
      ? 'Campaigns rebuilt from scratch without approved brand memory'
      : ''

  const channels = formats.includes('Email')
    ? ['Email', 'LinkedIn', 'Web']
    : ['LinkedIn', 'Paid social']

  return {
    objective,
    audience: primaryAudience || 'Target buyers matching the brief',
    primaryAudience,
    secondaryAudience,
    region,
    lifecycleStage,
    audiencePainPoint,
    channels,
    formats,
    coreMessage: enterprise
      ? 'Prove value fast and invite a qualified next step.'
      : 'Clear problem, one proof point, one CTA.',
    templates: healthcare
      ? ['Clinical proof story', 'Demo request nurture']
      : ['Problem → proof → CTA', 'Webinar demand gen'],
    priorCampaigns: healthcare
      ? ['Lifecycle Nurture — SMB', 'Partner Co-Marketing Kit']
      : ['Q3 Product Launch — EMEA', 'Webinar: AI in Enterprise'],
    claims: healthcare
      ? 'Avoid absolute clinical claims; include required medical disclaimers where applicable.'
      : 'No unsubstantiated superiority claims; keep proof attribution clear.',
    provenance: defaultProvenance({
      objective:
        answered.has('create') || answered.has('outcome') ? 'user' : 'needs-confirmation',
      formats: starter || answered.has('create') ? 'user' : 'inferred',
      primaryAudience: audienceKnown
        ? healthcare || enterprise
          ? 'similar'
          : 'user'
        : 'needs-confirmation',
      secondaryAudience: audienceKnown ? 'profile' : 'needs-confirmation',
      region: audienceKnown ? 'profile' : 'needs-confirmation',
      lifecycleStage: audienceKnown ? 'similar' : 'needs-confirmation',
      audiencePainPoint: audienceKnown ? 'similar' : 'needs-confirmation',
      channels: audienceKnown ? 'similar' : 'inferred',
      coreMessage: 'inferred',
      templates: 'inferred',
      priorCampaigns: 'similar',
      claims: answered.has('else') ? 'user' : 'needs-confirmation',
    }),
  }
}

function normalizeUnderstanding(
  raw: CampaignUnderstanding | null | undefined,
): CampaignUnderstanding | null {
  if (!raw) return null
  const primaryAudience = raw.primaryAudience ?? raw.audience ?? ''
  return {
    objective: raw.objective ?? '',
    audience: primaryAudience || raw.audience || '',
    primaryAudience,
    secondaryAudience: raw.secondaryAudience ?? '',
    region: raw.region ?? '',
    lifecycleStage: raw.lifecycleStage ?? '',
    audiencePainPoint: raw.audiencePainPoint ?? '',
    channels: raw.channels ?? [],
    formats: raw.formats ?? [],
    coreMessage: raw.coreMessage ?? '',
    templates: raw.templates ?? [],
    priorCampaigns: raw.priorCampaigns ?? [],
    claims: raw.claims ?? '',
    provenance: defaultProvenance(raw.provenance as Partial<CampaignUnderstanding['provenance']>),
  }
}

function applyQuestionAnswer(
  current: CampaignUnderstanding,
  questionId: UnderstandingQuestionId,
  answer: string,
): CampaignUnderstanding {
  const trimmed = answer.trim()
  const next: CampaignUnderstanding = {
    ...current,
    provenance: { ...current.provenance },
  }

  if (questionId === 'create' || questionId === 'else') {
    const parts = trimmed
      .split(/,| and | or |\/|&|\+/i)
      .map((part) => part.trim())
      .filter(Boolean)
    next.formats = parts.length > 0 ? parts : [trimmed]
    next.provenance.formats = 'user'
    if (!current.objective || current.provenance.objective !== 'user') {
      next.objective = `Create ${trimmed}`
      next.provenance.objective = 'user'
    }
  } else if (questionId === 'outcome') {
    next.objective =
      current.provenance.objective === 'user'
        ? `${current.objective} — Outcome: ${trimmed}`
        : trimmed
    next.provenance.objective = 'user'
    next.coreMessage = trimmed
    next.provenance.coreMessage = 'user'
  } else if (questionId === 'audience') {
    next.primaryAudience = trimmed
    next.audience = trimmed
    next.provenance.primaryAudience = 'user'
    if (!next.secondaryAudience) {
      next.secondaryAudience = 'Related stakeholders in the same buying committee'
      next.provenance.secondaryAudience = 'similar'
    }
    if (!next.region) {
      next.region = 'Primary market from brief'
      next.provenance.region = 'needs-confirmation'
    }
    if (!next.lifecycleStage) {
      next.lifecycleStage = 'Consideration'
      next.provenance.lifecycleStage = 'similar'
    }
    if (!next.audiencePainPoint) {
      next.audiencePainPoint = 'Needs confirmation from brief'
      next.provenance.audiencePainPoint = 'needs-confirmation'
    }
  }

  return next
}

function buildAssets(
  understanding: CampaignUnderstanding,
  starter: CampaignStarter | null,
  exploratory = false,
): CampaignAsset[] {
  const formats =
    starter && STARTER_FORMATS[starter]
      ? STARTER_FORMATS[starter]
      : understanding.formats.slice(0, 3)

  return formats.map((format, index) => {
    const isImageHeavy =
      format.toLowerCase().includes('banner') ||
      format.toLowerCase().includes('infographic') ||
      format.toLowerCase().includes('flyer') ||
      format.toLowerCase().includes('brochure')
    const type: AssetType =
      format.toLowerCase().includes('email') || format.toLowerCase().includes('linkedin')
        ? 'combined'
        : isImageHeavy
          ? 'image'
          : 'text'

    return {
      id: uid('asset'),
      type,
      format,
      title: exploratory
        ? `${format} — exploratory draft ${index + 1}`
        : `${format} — draft ${index + 1}`,
      headline: exploratory
        ? index === 0
          ? 'A clear offer for the right buyers.'
          : index === 1
            ? 'Start the conversation with one proof point.'
            : 'One message. One next step.'
        : index === 0
          ? 'See what enterprise teams already proved works.'
          : index === 1
            ? 'Stop rebuilding campaigns from scratch.'
            : 'One brief. On-brand assets across channels.',
      body: exploratory
        ? `${understanding.objective} Temporary styling — connect your brand system to validate voice and visual rules.`
        : `${understanding.objective} Built for ${understanding.primaryAudience || understanding.audience}, using patterns from ${understanding.priorCampaigns[0]}.`,
      cta: understanding.objective.toLowerCase().includes('demo')
        ? 'Request a demo'
        : 'Learn more',
      imageHint: isImageHeavy
        ? exploratory
          ? 'Generic product frame · placeholder treatment'
          : 'Product UI on calm clinical/enterprise backdrop'
        : undefined,
    }
  })
}

function panelKeyFromPath(pathname: string): PanelContextKey {
  const phase = phaseFromPath(pathname)
  if (phase === 'p1') return 'studio'
  if (phase === 'p2') return 'intelligence'
  if (pathname.includes('create-campaign')) return 'campaign'
  return 'home'
}

function questionPrompt(id: UnderstandingQuestionId): string {
  return UNDERSTANDING_QUESTIONS.find((q) => q.id === id)?.prompt ?? ''
}

function reviewIntro(hasBrand: boolean): string {
  return hasBrand
    ? 'Here’s my Campaign Understanding. Confirm it before I generate assets.'
    : 'Here’s my Campaign Understanding. Confirm it before I generate assets.\n\nThis campaign is not yet grounded in a verified enterprise brand system.'
}

function buildExecutionContext(options: {
  hasVerifiedBrandSource: boolean
  understanding: CampaignUnderstanding | null
  intent?: string
  remaining?: UnderstandingQuestionId[]
  exploratory?: boolean
}): AiExecutionContext {
  const {
    hasVerifiedBrandSource,
    understanding,
    intent = '',
    remaining = [],
    exploratory = false,
  } = options

  const brandSources = hasVerifiedBrandSource
    ? ['Figma design system', 'Brand guidelines', 'Approved campaign assets']
    : exploratory
      ? ['Temporary exploratory styling']
      : ['No verified brand source connected']

  const campaignExamples =
    understanding?.priorCampaigns?.length
      ? understanding.priorCampaigns
      : ['Q3 Product Launch — EMEA', 'Webinar: AI in Enterprise']

  const missingContext: string[] = []
  if (!hasVerifiedBrandSource) missingContext.push('Verified brand system')
  if (remaining.includes('create')) missingContext.push('What to create')
  if (remaining.includes('outcome')) missingContext.push('Business outcome')
  if (remaining.includes('else')) missingContext.push('Constraints or disclaimers')
  if (understanding?.provenance.primaryAudience === 'needs-confirmation') {
    missingContext.push('Primary audience')
  }

  let confidence: AiConfidence = 'Medium'
  if (remaining.length === 0 && hasVerifiedBrandSource && intent.trim().length > 40) {
    confidence = 'High'
  } else if (remaining.length >= 2 || !hasVerifiedBrandSource) {
    confidence = 'Low'
  }

  return {
    brandSources,
    campaignExamples,
    confidence,
    missingContext,
  }
}

function detectNeedsInputItems(options: {
  intent: string
  understanding: CampaignUnderstanding
  hasVerifiedBrandSource: boolean
  exploratory?: boolean
}): string[] {
  const { intent, understanding, hasVerifiedBrandSource, exploratory = false } = options
  const lower = intent.toLowerCase()
  const items: string[] = []

  if (!hasVerifiedBrandSource) {
    items.push('Brand system not yet verified')
  }

  const audienceVague =
    understanding.provenance.primaryAudience === 'needs-confirmation' ||
    !understanding.primaryAudience.trim()
  if (audienceVague) {
    items.push('Target audience unclear')
  }

  const ctaHints = ['demo', 'register', 'buy', 'subscribe', 'download', 'sign up', 'signup']
  const ctaHits = ctaHints.filter((hint) => lower.includes(hint))
  if (ctaHits.length >= 2) {
    items.push('Conflicting CTA rules found')
  }

  const format = understanding.formats[0]?.toLowerCase() ?? ''
  if (
    exploratory ||
    understanding.templates.includes('Generic exploratory layout') ||
    (format.includes('brochure') && !hasVerifiedBrandSource)
  ) {
    if (!hasVerifiedBrandSource) {
      items.push('No approved template for this format')
    }
  }

  return [...new Set(items)]
}

function buildGenerationSummary(
  understanding: CampaignUnderstanding,
  assetCount: number,
  exploratory: boolean,
  hasVerifiedBrandSource: boolean,
): AiExecutionSummary {
  const needingReview: string[] = []
  if (exploratory || !hasVerifiedBrandSource) {
    needingReview.push('Brand validation')
  }
  if (understanding.provenance.claims === 'needs-confirmation') {
    needingReview.push('Claims and disclaimers')
  }
  if (understanding.provenance.primaryAudience === 'needs-confirmation') {
    needingReview.push('Audience fit')
  }

  return {
    headline: 'Your campaign package is ready.',
    assetsCreated: assetCount,
    channelsCovered: understanding.channels,
    brandChecksPassed: exploratory || !hasVerifiedBrandSource ? 0 : 4,
    itemsNeedingReview: needingReview,
  }
}

const AiConversationContext = createContext<AiConversationValue | null>(null)

export function AiConversationProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const panelContext = panelKeyFromPath(location.pathname)
  const phase = phaseFromPath(location.pathname)
  const isHome =
    location.pathname === '/p0' || location.pathname === '/p0/'

  const persisted = useMemo(() => loadPersisted(), [])

  const initialStatus: WorkspaceStatus =
    persisted?.workspaceStatus ??
    (persisted?.hasVerifiedBrandSource ? 'established' : 'new')

  const [isReturningUser, setIsReturningUser] = useState(
    () => persisted?.isReturningUser ?? false,
  )
  const [hasVerifiedBrandSource, setHasVerifiedBrandSource] = useState(
    () => persisted?.hasVerifiedBrandSource ?? false,
  )
  const [workspaceStatus, setWorkspaceStatus] = useState<WorkspaceStatus>(
    () => initialStatus,
  )
  const [experiencePreview, setExperiencePreviewState] = useState<WorkspaceStatus>(
    () =>
      loadPreviewTab(
        persisted?.experiencePreview ??
          persisted?.workspacePreview ??
          initialStatus,
      ),
  )
  const [hasActiveCampaign, setHasActiveCampaign] = useState(
    () => persisted?.hasActiveCampaign ?? false,
  )
  const [savedCampaignBrief, setSavedCampaignBriefState] = useState<string | null>(
    () => persisted?.savedCampaignBrief ?? null,
  )
  const [pendingPathB, setPendingPathB] = useState(
    () => persisted?.pendingPathB ?? false,
  )
  const [isExploratoryDraft, setIsExploratoryDraft] = useState(
    () => persisted?.isExploratoryDraft ?? false,
  )
  const [understandingPhase, setUnderstandingPhase] = useState<UnderstandingPhase>(() => {
    if (persisted?.understandingPhase) return persisted.understandingPhase
    // Migrate older Path B sessions into the review flow.
    if (persisted?.pendingPathB) return 'review'
    return 'idle'
  })
  const [openQuestionIds, setOpenQuestionIds] = useState<UnderstandingQuestionId[]>(
    () => persisted?.openQuestionIds ?? [],
  )
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => persisted?.messages ?? [],
  )
  const [understanding, setUnderstanding] = useState<CampaignUnderstanding | null>(() => {
    const normalized = normalizeUnderstanding(persisted?.understanding)
    if (normalized) return normalized
    if (persisted?.pendingPathB && persisted.savedCampaignBrief) {
      return inferUnderstanding(persisted.savedCampaignBrief, persisted.starter ?? null)
    }
    return null
  })
  const [assets, setAssets] = useState<CampaignAsset[]>(() => persisted?.assets ?? [])
  const [starter, setStarter] = useState<CampaignStarter | null>(
    () => persisted?.starter ?? null,
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [execution, setExecution] = useState<AiExecutionState | null>(null)
  const cancelExecutionRef = useRef<(() => void) | null>(null)
  const [selection, setSelection] = useState<SelectionContext | null>(null)
  const [panelByContext, setPanelByContext] = useState<
    Partial<Record<PanelContextKey, PanelPrefs>>
  >(() => persisted?.panelByContext ?? {})
  const [lastCampaignId, setLastCampaignId] = useState<string | null>(
    () => persisted?.lastCampaignId ?? null,
  )
  const [campaignWorkspaceOpen, setCampaignWorkspaceOpen] = useState(false)

  const panelPrefs = panelByContext[panelContext] ?? {
    ...DEFAULT_PANEL,
    // Studio keeps the conversation visible by default; collapse is still one click.
    collapsed: panelContext === 'studio' ? false : true,
    widthPct: panelContext === 'campaign' || hasActiveCampaign ? 32 : DEFAULT_PANEL.widthPct,
  }

  const panelCollapsed = panelPrefs.collapsed
  const panelWidthPct = Math.min(40, Math.max(26, panelPrefs.widthPct))

  // Demo tab decides which screen to show; product status stays independent.
  const viewMode = experiencePreview

  const showCampaignOutput =
    (isHome &&
      viewMode === 'new' &&
      hasActiveCampaign &&
      campaignWorkspaceOpen &&
      understandingPhase === 'confirmed') ||
    (isHome &&
      viewMode === 'established' &&
      hasActiveCampaign &&
      (campaignWorkspaceOpen || !panelCollapsed)) ||
    (panelContext === 'campaign' && hasActiveCampaign && !panelCollapsed)

  const showUnderstandingFlow =
    isHome &&
    viewMode === 'new' &&
    (understandingPhase === 'preparing' ||
      understandingPhase === 'questions' ||
      understandingPhase === 'review')

  const showWelcome =
    isHome && viewMode === 'new' && !showCampaignOutput && !showUnderstandingFlow

  const currentUnderstandingQuestion =
    understandingPhase === 'questions' && openQuestionIds[0]
      ? questionPrompt(openQuestionIds[0])
      : null

  const experienceMode: 'welcome' | 'split' | 'collapsed' = (() => {
    if (showWelcome || showUnderstandingFlow) return 'welcome'
    if (!panelCollapsed) {
      if (phase === 'p1' || phase === 'p2') return 'split'
      if (showCampaignOutput || messages.length > 0 || hasActiveCampaign) return 'split'
      return 'split'
    }
    if (isHome && viewMode === 'established') return 'collapsed'
    return 'collapsed'
  })()

  useEffect(() => {
    const payload: PersistedAiState = {
      isReturningUser,
      hasActiveCampaign,
      hasVerifiedBrandSource,
      workspaceStatus,
      experiencePreview,
      savedCampaignBrief,
      pendingPathB,
      isExploratoryDraft,
      understandingPhase,
      openQuestionIds,
      panelByContext,
      lastCampaignId,
      understanding,
      messages,
      assets,
      starter,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      localStorage.setItem(PREVIEW_STORAGE_KEY, experiencePreview)
    } catch {
      /* ignore quota */
    }
  }, [
    isReturningUser,
    hasActiveCampaign,
    hasVerifiedBrandSource,
    workspaceStatus,
    experiencePreview,
    savedCampaignBrief,
    pendingPathB,
    isExploratoryDraft,
    understandingPhase,
    openQuestionIds,
    panelByContext,
    lastCampaignId,
    understanding,
    messages,
    assets,
    starter,
  ])

  const updatePanelPrefs = useCallback(
    (patch: Partial<PanelPrefs>) => {
      setPanelByContext((prev) => ({
        ...prev,
        [panelContext]: {
          ...(prev[panelContext] ?? panelPrefs),
          ...patch,
        },
      }))
    },
    [panelContext, panelPrefs],
  )

  const setPanelCollapsed = useCallback(
    (collapsed: boolean) => updatePanelPrefs({ collapsed }),
    [updatePanelPrefs],
  )

  const setPanelWidthPct = useCallback(
    (pct: number) => updatePanelPrefs({ widthPct: Math.min(40, Math.max(26, pct)) }),
    [updatePanelPrefs],
  )

  const togglePanel = useCallback(() => {
    setPanelCollapsed(!panelCollapsed)
  }, [panelCollapsed, setPanelCollapsed])

  const openPanel = useCallback(() => setPanelCollapsed(false), [setPanelCollapsed])

  const openCampaignWorkspace = useCallback(() => {
    setCampaignWorkspaceOpen(true)
    setPanelByContext((prev) => ({
      ...prev,
      home: { collapsed: false, widthPct: prev.home?.widthPct ?? 32 },
      campaign: { collapsed: false, widthPct: prev.campaign?.widthPct ?? 32 },
    }))
  }, [])

  const updateUnderstanding = useCallback((patch: Partial<CampaignUnderstanding>) => {
    setUnderstanding((prev) => {
      if (!prev) return null
      const provenance = { ...prev.provenance }
      ;(
        Object.keys(patch) as Array<keyof CampaignUnderstanding>
      ).forEach((key) => {
        if (key === 'provenance') return
        if (key in provenance) {
          provenance[key as keyof CampaignUnderstanding['provenance']] = 'user'
        }
      })
      const next = {
        ...prev,
        ...patch,
        provenance: patch.provenance ?? provenance,
      }
      if (patch.primaryAudience !== undefined) {
        next.audience = patch.primaryAudience
      } else if (patch.audience !== undefined && patch.primaryAudience === undefined) {
        next.primaryAudience = patch.audience
      }
      return next
    })
  }, [])

  const setSavedCampaignBrief = useCallback((brief: string | null) => {
    setSavedCampaignBriefState(brief)
  }, [])

  const enterReview = useCallback(
    (_inferred: CampaignUnderstanding, hasBrand: boolean) => {
      setUnderstandingPhase('review')
      setOpenQuestionIds([])
      setMessages((prev) => [
        ...prev,
        {
          id: uid('msg'),
          role: 'assistant',
          content: reviewIntro(hasBrand),
          timestamp: Date.now(),
        },
      ])
    },
    [],
  )

  const askNextQuestion = useCallback((ids: UnderstandingQuestionId[]) => {
    const nextId = ids[0]
    if (!nextId) return
    setUnderstandingPhase('questions')
    setOpenQuestionIds(ids)
    setMessages((prev) => [
      ...prev,
      {
        id: uid('msg'),
        role: 'assistant',
        content: questionPrompt(nextId),
        timestamp: Date.now(),
      },
    ])
  }, [])

  const stopExecution = useCallback(() => {
    cancelExecutionRef.current?.()
    cancelExecutionRef.current = null
  }, [])

  const startExecution = useCallback(
    (
      kind: AiExecutionKind,
      context: AiExecutionContext,
      onComplete: () => void,
      options?: { needsInput?: AiNeedsInput; summary?: AiExecutionSummary },
    ) => {
      stopExecution()
      const steps = stepsForKind(kind)
      const id = uid('exec')
      setIsGenerating(true)
      setExecution({
        id,
        kind,
        status: 'running',
        steps,
        activeIndex: 0,
        completedIds: [],
        context,
        needsInput: options?.needsInput,
        summary: options?.summary,
      })

      cancelExecutionRef.current = runStepSequence(
        steps.length,
        (activeIndex, completedCount) => {
          setExecution((prev) => {
            if (!prev || prev.id !== id) return prev
            return {
              ...prev,
              activeIndex,
              completedIds: steps.slice(0, completedCount).map((step) => step.id),
            }
          })
        },
        () => {
          setExecution((prev) => {
            if (!prev || prev.id !== id) return prev
            const completedIds = steps.map((step) => step.id)
            if (options?.needsInput?.items.length) {
              return {
                ...prev,
                status: 'needs-input',
                activeIndex: steps.length - 1,
                completedIds,
                needsInput: options.needsInput,
              }
            }
            if (options?.summary) {
              return {
                ...prev,
                status: 'complete',
                activeIndex: -1,
                completedIds,
                summary: options.summary,
              }
            }
            return {
              ...prev,
              status: 'complete',
              activeIndex: -1,
              completedIds,
            }
          })

          const finish = () => {
            setIsGenerating(false)
            onComplete()
          }

          if (options?.needsInput?.items.length) {
            window.setTimeout(finish, 900)
          } else {
            finish()
          }
        },
      )
    },
    [stopExecution],
  )

  const generateCampaignDraft = useCallback(
    (
      intentText: string,
      nextStarter: CampaignStarter | null,
      exploratory: boolean,
      existing?: CampaignUnderstanding | null,
    ) => {
      setHasActiveCampaign(true)
      setPendingPathB(false)
      setUnderstandingPhase('confirmed')
      setOpenQuestionIds([])
      setIsExploratoryDraft(exploratory)
      setCampaignWorkspaceOpen(true)
      setLastCampaignId(uid('camp'))
      setPanelByContext((prev) => ({
        ...prev,
        home: { collapsed: false, widthPct: prev.home?.widthPct ?? 32 },
        campaign: { collapsed: false, widthPct: prev.campaign?.widthPct ?? 32 },
      }))

      const inferred =
        normalizeUnderstanding(existing) ?? inferUnderstanding(intentText, nextStarter)
      if (exploratory) {
        inferred.templates = ['Generic exploratory layout']
        inferred.priorCampaigns = ['Temporary styling library']
        inferred.provenance = {
          ...inferred.provenance,
          templates: 'inferred',
          priorCampaigns: 'inferred',
        }
      }
      setUnderstanding(inferred)

      const nextAssets = buildAssets(inferred, nextStarter, exploratory)
      const context = buildExecutionContext({
        hasVerifiedBrandSource,
        understanding: inferred,
        intent: intentText,
        exploratory,
      })
      const summary = buildGenerationSummary(
        inferred,
        nextAssets.length,
        exploratory,
        hasVerifiedBrandSource,
      )

      startExecution('generation', context, () => {
        setAssets(nextAssets)
        setMessages((prev) => [
          ...prev,
          {
            id: uid('msg'),
            role: 'assistant',
            content: exploratory
              ? 'Drafts are on the right. Connect your brand system when you’re ready to validate them.'
              : 'Drafts are on the right. Ask here for revisions, or confirm brand fit when ready.',
            timestamp: Date.now(),
          },
        ])
      }, { summary })
    },
    [hasVerifiedBrandSource, startExecution],
  )

  const submitIntent = useCallback(
    (text: string, nextStarter: CampaignStarter | null = null) => {
      const trimmed = text.trim()
      if (!trimmed && !nextStarter) return

      const intentText =
        trimmed ||
        (nextStarter
          ? `Help me create a ${nextStarter.toLowerCase()} campaign.`
          : '')

      setSavedCampaignBriefState(intentText)
      setStarter(nextStarter)
      setPendingPathB(false)
      setHasActiveCampaign(false)
      setCampaignWorkspaceOpen(false)
      setAssets([])
      setIsExploratoryDraft(false)
      setIsReturningUser(true)
      setUnderstandingPhase('preparing')
      setOpenQuestionIds([])

      const inferred = inferUnderstanding(intentText, nextStarter)
      setUnderstanding(inferred)

      const remaining = remainingQuestions(intentText, nextStarter)
      const needsItems = detectNeedsInputItems({
        intent: intentText,
        understanding: inferred,
        hasVerifiedBrandSource,
      })
      const context = buildExecutionContext({
        hasVerifiedBrandSource,
        understanding: inferred,
        intent: intentText,
        remaining,
      })

      const userMsg: ChatMessage = {
        id: uid('msg'),
        role: 'user',
        content: intentText,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])

      startExecution(
        'understanding',
        context,
        () => {
          if (remaining.length > 0) {
            askNextQuestion(remaining)
            return
          }
          enterReview(inferred, hasVerifiedBrandSource)
        },
        needsItems.length > 0 ? { needsInput: { items: needsItems } } : undefined,
      )
    },
    [askNextQuestion, enterReview, hasVerifiedBrandSource, startExecution],
  )

  const confirmUnderstanding = useCallback(
    (mode: 'branded' | 'exploratory') => {
      const intentText =
        savedCampaignBrief ||
        understanding?.objective ||
        (starter ? `Help me create a ${starter.toLowerCase()} campaign.` : '')
      if (!intentText || !understanding) return

      setMessages((prev) => [
        ...prev,
        {
          id: uid('msg'),
          role: 'user',
          content:
            mode === 'exploratory'
              ? 'Create an exploratory draft'
              : 'Looks right — generate assets',
          timestamp: Date.now(),
        },
      ])
      generateCampaignDraft(intentText, starter, mode === 'exploratory', understanding)
    },
    [generateCampaignDraft, savedCampaignBrief, starter, understanding],
  )

  const createExploratoryDraft = useCallback(() => {
    confirmUnderstanding('exploratory')
  }, [confirmUnderstanding])

  const openCampaignWorkflowStep = useCallback(
    (step: CampaignWorkflowStep) => {
      if (step === 'understanding') {
        setExperiencePreviewState('new')
        setCampaignWorkspaceOpen(false)
        if (
          understanding &&
          (understandingPhase === 'confirmed' || understandingPhase === 'idle')
        ) {
          setUnderstandingPhase('review')
        }
        return
      }

      // Finished package — open the campaign output on Home.
      if (
        understandingPhase === 'confirmed' &&
        (assets.length > 0 || hasActiveCampaign)
      ) {
        setHasActiveCampaign(true)
        openCampaignWorkspace()
        return
      }

      // Mid understanding — stay in the question / review flow (don't skip to drafts).
      if (
        understandingPhase === 'review' ||
        understandingPhase === 'questions' ||
        understandingPhase === 'preparing'
      ) {
        setExperiencePreviewState('new')
        setCampaignWorkspaceOpen(false)
        setHasActiveCampaign(false)
        return
      }

      // First draft with no understanding yet — same path as describing a campaign.
      setExperiencePreviewState('new')
      setCampaignWorkspaceOpen(false)
      setHasActiveCampaign(false)

      const intentText = savedCampaignBrief?.trim()
      if (intentText) {
        submitIntent(intentText, starter)
        return
      }

      setUnderstandingPhase('idle')
      setOpenQuestionIds([])
    },
    [
      assets.length,
      hasActiveCampaign,
      openCampaignWorkspace,
      savedCampaignBrief,
      starter,
      submitIntent,
      understanding,
      understandingPhase,
    ],
  )

  const beginConnectBrand = useCallback(
    (brief?: string | null) => {
      const nextBrief = (brief ?? savedCampaignBrief)?.trim() || null
      if (nextBrief) setSavedCampaignBriefState(nextBrief)
      setPendingPathB(false)
      setCampaignWorkspaceOpen(false)
      // Keep understanding in review so returning users can confirm after brand connect.
      if (understandingPhase === 'idle' && understanding) {
        setUnderstandingPhase('review')
      }
    },
    [savedCampaignBrief, understanding, understandingPhase],
  )

  const resumeSavedCampaignBrief = useCallback(() => {
    const intentText = savedCampaignBrief?.trim()
    if (!intentText) {
      setCampaignWorkspaceOpen(false)
      return
    }
    setExperiencePreviewState('established')
    setMessages((prev) => [
      ...prev,
      {
        id: uid('msg'),
        role: 'assistant',
        content: 'Brand system connected. Resuming your saved campaign brief.',
        timestamp: Date.now(),
      },
    ])
    if (understanding && understandingPhase === 'confirmed') {
      generateCampaignDraft(intentText, starter, false, understanding)
      return
    }
    const inferred = understanding ?? inferUnderstanding(intentText, starter)
    setUnderstanding(inferred)
    enterReview(inferred, true)
  }, [
    enterReview,
    generateCampaignDraft,
    savedCampaignBrief,
    starter,
    understanding,
    understandingPhase,
  ])

  const continueToFirstDraft = useCallback(() => {
    setHasVerifiedBrandSource(true)
    setIsReturningUser(true)
    setWorkspaceStatus('established')
    setIsExploratoryDraft(false)
    setExperiencePreviewState('new')
    setCampaignWorkspaceOpen(false)
    setHasActiveCampaign(false)
    setPanelByContext((prev) => ({
      ...prev,
      home: { collapsed: true, widthPct: prev.home?.widthPct ?? 32 },
    }))

    // Resume in-progress understanding instead of jumping to drafts.
    if (
      understandingPhase === 'questions' ||
      understandingPhase === 'preparing' ||
      understandingPhase === 'review'
    ) {
      return
    }

    const intentText = savedCampaignBrief?.trim()
    if (intentText) {
      // Same question flow as “describe the campaign”.
      submitIntent(intentText, starter)
      return
    }

    // No brief yet — open the campaign composer; questions follow on submit.
    setUnderstandingPhase('idle')
    setOpenQuestionIds([])
  }, [savedCampaignBrief, starter, submitIntent, understandingPhase])

  const goToCampaignDashboard = useCallback(() => {
    setHasVerifiedBrandSource(true)
    setIsReturningUser(true)
    setWorkspaceStatus('established')
    setExperiencePreviewState('established')
    setCampaignWorkspaceOpen(false)
    setPanelByContext((prev) => ({
      ...prev,
      home: { collapsed: true, widthPct: prev.home?.widthPct ?? 32 },
    }))
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      if (understandingPhase === 'questions' && openQuestionIds.length > 0 && understanding) {
        const currentId = openQuestionIds[0]
        const userMsg: ChatMessage = {
          id: uid('msg'),
          role: 'user',
          content: trimmed,
          timestamp: Date.now(),
        }
        const updated = applyQuestionAnswer(understanding, currentId, trimmed)
        const remaining = openQuestionIds.slice(1)
        setMessages((prev) => [...prev, userMsg])
        setUnderstanding(updated)
        setOpenQuestionIds(remaining)

        if (remaining.length > 0) {
          window.setTimeout(() => askNextQuestion(remaining), 280)
          return
        }

        window.setTimeout(() => enterReview(updated, hasVerifiedBrandSource), 280)
        return
      }

      if (
        understandingPhase === 'idle' &&
        (pendingPathB || (!hasActiveCampaign && messages.length === 0))
      ) {
        submitIntent(trimmed, starter)
        return
      }

      if (understandingPhase === 'review') {
        const userMsg: ChatMessage = {
          id: uid('msg'),
          role: 'user',
          content: trimmed,
          timestamp: Date.now(),
        }
        updateUnderstanding({
          claims:
            understanding?.claims && understanding.claims.trim()
              ? `${understanding.claims}\n${trimmed}`
              : trimmed,
        })
        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: uid('msg'),
            role: 'assistant',
            content:
              'Noted — I updated the Campaign Understanding card. Confirm when it looks right.',
            timestamp: Date.now(),
          },
        ])
        return
      }

      const userMsg: ChatMessage = {
        id: uid('msg'),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setPanelCollapsed(false)

      const context = buildExecutionContext({
        hasVerifiedBrandSource,
        understanding,
        intent: trimmed,
        exploratory: isExploratoryDraft,
      })

      startExecution('studio', context, () => {
        const lower = trimmed.toLowerCase()
        let reply =
          'Updated. I adjusted the drafts from your note — review the output and keep editing the Campaign Understanding card if needed.'

        if (selection?.summary) {
          reply = `Applied to selection (${selection.summary}): ${trimmed}\n\nI kept brand voice rules and only changed the selected items.`
        } else if (lower.includes('technical')) {
          reply =
            'Rewrote selected copy for a more technical audience — denser proof, fewer metaphors, sharper product language.'
        } else if (lower.includes('legal')) {
          reply =
            'Added a Legal approval step before publishing in the workflow, and flagged claims that need counsel review.'
        } else if (lower.includes('linkedin') || lower.includes('email')) {
          reply =
            'Created LinkedIn and email variations from the current campaign direction. They’re in the output panel.'
        } else if (understanding) {
          setAssets(buildAssets(understanding, starter, isExploratoryDraft))
        }

        setMessages((prev) => [
          ...prev,
          {
            id: uid('msg'),
            role: 'assistant',
            content: reply,
            timestamp: Date.now(),
          },
        ])
      })
    },
    [
      askNextQuestion,
      enterReview,
      hasActiveCampaign,
      hasVerifiedBrandSource,
      isExploratoryDraft,
      messages.length,
      openQuestionIds,
      pendingPathB,
      selection,
      setPanelCollapsed,
      startExecution,
      starter,
      submitIntent,
      understanding,
      understandingPhase,
      updateUnderstanding,
    ],
  )

  const askAboutSelection = useCallback(
    (prompt: string) => {
      openPanel()
      sendMessage(prompt)
    },
    [openPanel, sendMessage],
  )

  const askIntelligence = useCallback(
    (prompt: string) => {
      openPanel()
      const userMsg: ChatMessage = {
        id: uid('msg'),
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])

      const context = buildExecutionContext({
        hasVerifiedBrandSource,
        understanding,
        intent: prompt,
      })

      startExecution('intelligence', context, () => {
        const lower = prompt.toLowerCase()
        let reply =
          'Based on market signals and your enterprise memory, the short-form proof recommendation has the strongest expected impact (confidence 91%).'

        if (lower.includes('why')) {
          reply =
            'I’m recommending this because external competitor crawls and your own webinar winners both favor clinician-led, short-form proof. Expected impact is high; confidence 91%.'
        } else if (lower.includes('compare') || lower.includes('previous')) {
          reply =
            'Compared with Q3 Product Launch — EMEA and Webinar: AI in Enterprise, this trend matches your highest-performing proof framing and improves on feature-led LinkedIn posts that underperformed.'
        } else if (lower.includes('impact') || lower.includes('highest')) {
          reply =
            'Highest expected impact: clinician-led headlines for healthcare (confidence 91%), then carousel education sequences (79%), then product-first imagery (82%).'
        } else if (lower.includes('confidence') || lower.includes('evidence')) {
          reply =
            'Confidence is grounded in competitive crawl (45 days), LinkedIn creative scans, and accepted brand-memory patterns. Open any recommendation’s evidence list for sources.'
        }

        setMessages((prev) => [
          ...prev,
          {
            id: uid('msg'),
            role: 'assistant',
            content: reply,
            timestamp: Date.now(),
          },
        ])
      })
    },
    [hasVerifiedBrandSource, openPanel, startExecution, understanding],
  )

  const clearConversation = useCallback(() => {
    stopExecution()
    setMessages([])
    setUnderstanding(null)
    setAssets([])
    setStarter(null)
    setHasActiveCampaign(false)
    setCampaignWorkspaceOpen(false)
    setSelection(null)
    setLastCampaignId(null)
    setPendingPathB(false)
    setIsExploratoryDraft(false)
    setUnderstandingPhase('idle')
    setOpenQuestionIds([])
    setExecution(null)
    setIsGenerating(false)
  }, [stopExecution])

  const markReturning = useCallback(() => setIsReturningUser(true), [])

  const setExperiencePreview = useCallback((mode: WorkspaceStatus) => {
    // Preview tab only — do not mutate product workspaceStatus or wipe drafts.
    setExperiencePreviewState(mode)
    setCampaignWorkspaceOpen(false)
    setPanelByContext((prev) => ({
      ...prev,
      home: { collapsed: true, widthPct: prev.home?.widthPct ?? 32 },
    }))
  }, [])

  const setWorkspacePreview = setExperiencePreview

  const approveVerifiedBrandSource = useCallback(() => {
    setHasVerifiedBrandSource(true)
    setIsReturningUser(true)
    setWorkspaceStatus('established')
    setPendingPathB(false)
    setIsExploratoryDraft(false)
    setExperiencePreviewState('established')

    const brief = savedCampaignBrief?.trim()
    if (!brief) {
      setCampaignWorkspaceOpen(false)
      setPanelByContext((prev) => ({
        ...prev,
        home: { collapsed: true, widthPct: prev.home?.widthPct ?? 32 },
      }))
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: uid('msg'),
        role: 'assistant',
        content: 'Brand source approved. Returning you to your saved campaign brief.',
        timestamp: Date.now(),
      },
    ])

    if (understandingPhase === 'confirmed' && understanding) {
      generateCampaignDraft(brief, starter, false, understanding)
      return
    }

    const inferred = understanding ?? inferUnderstanding(brief, starter)
    setUnderstanding(inferred)
    enterReview(inferred, true)
  }, [
    enterReview,
    generateCampaignDraft,
    savedCampaignBrief,
    starter,
    understanding,
    understandingPhase,
  ])

  // When viewing Established preview on Home, keep dashboard primary.
  useEffect(() => {
    if (!isHome) return
    if (experiencePreview === 'established' && !campaignWorkspaceOpen) {
      setPanelByContext((prev) => ({
        ...prev,
        home: {
          collapsed: true,
          widthPct: prev.home?.widthPct ?? 32,
        },
      }))
    }
  }, [isHome]) // eslint-disable-line react-hooks/exhaustive-deps -- land-once behavior

  const value: AiConversationValue = {
    isReturningUser,
    hasActiveCampaign,
    hasVerifiedBrandSource,
    workspaceStatus,
    experiencePreview,
    workspacePreview: experiencePreview,
    savedCampaignBrief,
    pendingPathB,
    isExploratoryDraft,
    understandingPhase,
    openQuestionIds,
    currentUnderstandingQuestion,
    messages,
    understanding,
    assets,
    starter,
    isGenerating,
    execution,
    selection,
    panelCollapsed,
    panelWidthPct,
    panelContext,
    experienceMode,
    showWelcome,
    showCampaignOutput,
    showUnderstandingFlow,
    setExperiencePreview,
    setWorkspacePreview,
    setSavedCampaignBrief,
    beginConnectBrand,
    createExploratoryDraft,
    confirmUnderstanding,
    resumeSavedCampaignBrief,
    continueToFirstDraft,
    goToCampaignDashboard,
    approveVerifiedBrandSource,
    setPanelCollapsed,
    setPanelWidthPct,
    togglePanel,
    openPanel,
    openCampaignWorkspace,
    openCampaignWorkflowStep,
    setSelection,
    updateUnderstanding,
    submitIntent,
    sendMessage,
    askAboutSelection,
    askIntelligence,
    clearConversation,
    markReturning,
  }

  return (
    <AiConversationContext.Provider value={value}>
      {children}
    </AiConversationContext.Provider>
  )
}

export function useAiConversation() {
  const ctx = useContext(AiConversationContext)
  if (!ctx) {
    throw new Error('useAiConversation must be used within AiConversationProvider')
  }
  return ctx
}

export const CAMPAIGN_STARTERS: CampaignStarter[] = [
  'Email',
  'Social post',
  'Banner',
  'Flyer',
  'Brochure',
  'Infographic',
  'Multi-channel campaign',
]
