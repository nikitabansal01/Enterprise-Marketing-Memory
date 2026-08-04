import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
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

export type CampaignUnderstanding = {
  objective: string
  audience: string
  channels: string[]
  formats: string[]
  templates: string[]
  priorCampaigns: string[]
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

type PersistedAiState = {
  isReturningUser: boolean
  hasActiveCampaign: boolean
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
  messages: ChatMessage[]
  understanding: CampaignUnderstanding | null
  assets: CampaignAsset[]
  starter: CampaignStarter | null
  isGenerating: boolean
  selection: SelectionContext | null
  panelCollapsed: boolean
  panelWidthPct: number
  panelContext: PanelContextKey
  experienceMode: 'welcome' | 'split' | 'collapsed'
  showWelcome: boolean
  showCampaignOutput: boolean
  setPanelCollapsed: (collapsed: boolean) => void
  setPanelWidthPct: (pct: number) => void
  togglePanel: () => void
  openPanel: () => void
  openCampaignWorkspace: () => void
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

  return {
    objective: intent.trim() || 'Launch a new campaign',
    audience: healthcare
      ? 'Healthcare IT and analytics buyers at health systems'
      : enterprise
        ? 'Enterprise marketing and revenue leaders'
        : 'Target buyers matching the brief',
    channels: formats.includes('Email')
      ? ['Email', 'LinkedIn', 'Web']
      : ['LinkedIn', 'Paid social'],
    formats,
    templates: healthcare
      ? ['Clinical proof story', 'Demo request nurture']
      : ['Problem → proof → CTA', 'Webinar demand gen'],
    priorCampaigns: healthcare
      ? ['Lifecycle Nurture — SMB', 'Partner Co-Marketing Kit']
      : ['Q3 Product Launch — EMEA', 'Webinar: AI in Enterprise'],
  }
}

function buildAssets(
  understanding: CampaignUnderstanding,
  starter: CampaignStarter | null,
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
      title: `${format} — draft ${index + 1}`,
      headline:
        index === 0
          ? 'See what enterprise teams already proved works.'
          : index === 1
            ? 'Stop rebuilding campaigns from scratch.'
            : 'One brief. On-brand assets across channels.',
      body: `${understanding.objective} Built for ${understanding.audience}, using patterns from ${understanding.priorCampaigns[0]}.`,
      cta: understanding.objective.toLowerCase().includes('demo')
        ? 'Request a demo'
        : 'Learn more',
      imageHint: isImageHeavy
        ? 'Product UI on calm clinical/enterprise backdrop'
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

function essentialFollowUp(understanding: CampaignUnderstanding): string {
  return `Here’s what I inferred. Edit anything that looks off, then I’ll refine the drafts.\n\n• Audience: ${understanding.audience}\n• Channels: ${understanding.channels.join(', ')}\n• Formats: ${understanding.formats.join(', ')}\n• Templates: ${understanding.templates.join(', ')}\n• Prior campaigns: ${understanding.priorCampaigns.join(', ')}\n\nAnything critical I’m missing — deadline, offer, or compliance constraint?`
}

const AiConversationContext = createContext<AiConversationValue | null>(null)

export function AiConversationProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const panelContext = panelKeyFromPath(location.pathname)
  const phase = phaseFromPath(location.pathname)
  const isHome =
    location.pathname === '/p0' || location.pathname === '/p0/'

  const persisted = useMemo(() => loadPersisted(), [])

  const [isReturningUser, setIsReturningUser] = useState(
    () => persisted?.isReturningUser ?? false,
  )
  const [hasActiveCampaign, setHasActiveCampaign] = useState(
    () => persisted?.hasActiveCampaign ?? false,
  )
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => persisted?.messages ?? [],
  )
  const [understanding, setUnderstanding] = useState<CampaignUnderstanding | null>(
    () => persisted?.understanding ?? null,
  )
  const [assets, setAssets] = useState<CampaignAsset[]>(() => persisted?.assets ?? [])
  const [starter, setStarter] = useState<CampaignStarter | null>(
    () => persisted?.starter ?? null,
  )
  const [isGenerating, setIsGenerating] = useState(false)
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
    collapsed: true,
    widthPct: panelContext === 'campaign' || hasActiveCampaign ? 32 : DEFAULT_PANEL.widthPct,
  }

  const panelCollapsed = panelPrefs.collapsed
  const panelWidthPct = Math.min(40, Math.max(26, panelPrefs.widthPct))

  const showWelcome =
    isHome && !hasActiveCampaign && messages.length === 0 && !isReturningUser

  // Fresh capture keeps output visible; returning home stays on dashboard until reopened.
  const showCampaignOutput =
    (isHome && hasActiveCampaign && (campaignWorkspaceOpen || !panelCollapsed)) ||
    (panelContext === 'campaign' && hasActiveCampaign && !panelCollapsed)

  const experienceMode: 'welcome' | 'split' | 'collapsed' = (() => {
    if (showWelcome) return 'welcome'
    if (!panelCollapsed) {
      if (phase === 'p1' || phase === 'p2') return 'split'
      if (showCampaignOutput || messages.length > 0 || hasActiveCampaign) return 'split'
      // Returning user opened Start campaign / Ask AI with no active thread yet
      return 'split'
    }
    if (isHome && isReturningUser) return 'collapsed'
    return 'collapsed'
  })()

  useEffect(() => {
    const payload: PersistedAiState = {
      isReturningUser,
      hasActiveCampaign,
      panelByContext,
      lastCampaignId,
      understanding,
      messages,
      assets,
      starter,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore quota */
    }
  }, [
    isReturningUser,
    hasActiveCampaign,
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
    setUnderstanding((prev) => (prev ? { ...prev, ...patch } : null))
  }, [])

  const submitIntent = useCallback(
    (text: string, nextStarter: CampaignStarter | null = null) => {
      const trimmed = text.trim()
      if (!trimmed && !nextStarter) return

      const intentText =
        trimmed ||
        (nextStarter
          ? `Help me create a ${nextStarter.toLowerCase()} campaign.`
          : '')

      const userMsg: ChatMessage = {
        id: uid('msg'),
        role: 'user',
        content: intentText,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setStarter(nextStarter)
      setIsGenerating(true)
      setHasActiveCampaign(true)
      setCampaignWorkspaceOpen(true)
      setLastCampaignId(uid('camp'))
      setPanelByContext((prev) => ({
        ...prev,
        home: { collapsed: false, widthPct: prev.home?.widthPct ?? 32 },
        campaign: { collapsed: false, widthPct: prev.campaign?.widthPct ?? 32 },
      }))

      const inferred = inferUnderstanding(intentText, nextStarter)
      setUnderstanding(inferred)

      window.setTimeout(() => {
        const nextAssets = buildAssets(inferred, nextStarter)
        setAssets(nextAssets)
        setMessages((prev) => [
          ...prev,
          {
            id: uid('msg'),
            role: 'assistant',
            content: essentialFollowUp(inferred),
            timestamp: Date.now(),
          },
        ])
        setIsGenerating(false)
        setIsReturningUser(true)
      }, 900)
    },
    [],
  )

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      if (!hasActiveCampaign && messages.length === 0) {
        submitIntent(trimmed, starter)
        return
      }

      const userMsg: ChatMessage = {
        id: uid('msg'),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsGenerating(true)
      setPanelCollapsed(false)

      window.setTimeout(() => {
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
          const refreshed = {
            ...understanding,
            objective: understanding.objective,
          }
          setAssets(buildAssets(refreshed, starter))
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
        setIsGenerating(false)
      }, 700)
    },
    [
      hasActiveCampaign,
      messages.length,
      selection,
      setPanelCollapsed,
      starter,
      submitIntent,
      understanding,
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
      setIsGenerating(true)

      window.setTimeout(() => {
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
        setIsGenerating(false)
      }, 650)
    },
    [openPanel],
  )

  const clearConversation = useCallback(() => {
    setMessages([])
    setUnderstanding(null)
    setAssets([])
    setStarter(null)
    setHasActiveCampaign(false)
    setCampaignWorkspaceOpen(false)
    setSelection(null)
    setLastCampaignId(null)
  }, [])

  const markReturning = useCallback(() => setIsReturningUser(true), [])

  // Returning users land on Home with AI collapsed (dashboard), not campaign output.
  useEffect(() => {
    if (!isHome) return
    if (isReturningUser && hasActiveCampaign) {
      setCampaignWorkspaceOpen(false)
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
    messages,
    understanding,
    assets,
    starter,
    isGenerating,
    selection,
    panelCollapsed,
    panelWidthPct,
    panelContext,
    experienceMode,
    showWelcome,
    showCampaignOutput,
    setPanelCollapsed,
    setPanelWidthPct,
    togglePanel,
    openPanel,
    openCampaignWorkspace,
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
