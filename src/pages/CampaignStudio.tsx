import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StudioExecution, {
  type ExecutionTab,
} from '../components/studio/StudioExecution'
import StatusBadge from '../components/ui/StatusBadge'
import { useAiConversation, type SelectionKind } from '../lib/aiConversation'
import { restPath } from '../lib/phases'
import { roleById, STUDIO_ROLES, type StudioRole } from '../lib/roles'

type StudioMode = 'canvas' | ExecutionTab
type Tool = 'select' | 'pan' | 'comment' | 'pin'

function modeFromPath(pathname: string): StudioMode {
  const rest = restPath(pathname, 'p1')
  if (
    rest === 'workflow' ||
    rest === 'approvals' ||
    rest === 'connectors' ||
    rest === 'governance'
  ) {
    return rest
  }
  return 'canvas'
}

function pathForMode(mode: StudioMode): string {
  if (mode === 'canvas') return '/p1'
  return `/p1/${mode}`
}
type NodeKind =
  | 'brief'
  | 'memory'
  | 'reference'
  | 'direction'
  | 'asset'
  | 'review'
  | 'production'
  | 'pin'
  | 'template'
  | 'insight'

type CanvasNode = {
  id: string
  kind: NodeKind
  x: number
  y: number
  w: number
  title: string
  body: string
  meta?: string
  tone?: 'emerald' | 'brand' | 'amber' | 'sky' | 'rose' | 'slate'
  pinned?: boolean
  branchOf?: string
  editable?: boolean
  issue?: string
}

type Edge = { from: string; to: string }

type Comment = {
  id: string
  nodeId: string
  author: string
  initials: string
  text: string
  x: number
  y: number
}

type Collaborator = {
  id: string
  name: string
  initials: string
  color: string
  x: number
  y: number
}

type AiAssist = {
  id: string
  kind:
    | 'knowledge'
    | 'reference'
    | 'directions'
    | 'explain'
    | 'inconsistency'
    | 'missing'
    | 'template'
  label: string
  detail: string
  action: string
}

const WORLD = { w: 4400, h: 2600 }

const initialNodes: CanvasNode[] = [
  {
    id: 'brief',
    kind: 'brief',
    x: 100,
    y: 440,
    w: 300,
    title: 'Campaign Brief',
    body: 'Drive qualified webinar signups for the Q3 product launch.\nEnterprise marketing leaders.\nConfident, plainspoken, practical.',
    meta: 'Editable',
    tone: 'brand',
    editable: true,
  },
  {
    id: 'memory',
    kind: 'memory',
    x: 520,
    y: 380,
    w: 310,
    title: 'Brand Memory',
    body: 'Problem → proof → CTA\nSingle CTA per channel\nNo hype language\nPrimary blue CTA treatment\nPlainspoken voice rules',
    meta: '94% confidence',
    tone: 'emerald',
  },
  {
    id: 'ref-1',
    kind: 'reference',
    x: 980,
    y: 200,
    w: 270,
    title: 'Q3 Launch — EMEA',
    body: 'Highest webinar CTR. Calm single-column, one CTA.',
    meta: '+38% CTR',
    tone: 'emerald',
    pinned: true,
  },
  {
    id: 'ref-2',
    kind: 'reference',
    x: 980,
    y: 460,
    w: 270,
    title: 'AI in Enterprise',
    body: 'Sharp hook + proof stack. Strong LinkedIn adaptation.',
    meta: '+22% CTR',
    tone: 'sky',
  },
  {
    id: 'ref-3',
    kind: 'reference',
    x: 980,
    y: 720,
    w: 270,
    title: 'Lifecycle Nurture — SMB',
    body: 'Trusted structure for regulated enterprise audiences.',
    meta: 'Approved',
    tone: 'slate',
  },
  {
    id: 'dir-a',
    kind: 'direction',
    x: 1440,
    y: 160,
    w: 290,
    title: 'Conservative',
    body: 'Keep every campaign on-brand.\nMemory drafts from approved patterns — familiar structure, minimal risk.',
    meta: 'Highest compliance',
    tone: 'slate',
    editable: true,
  },
  {
    id: 'dir-b',
    kind: 'direction',
    x: 1440,
    y: 460,
    w: 290,
    title: 'Balanced',
    body: 'Stop relearning your brand every quarter.\nBlends memory-backed patterns with a sharper brief angle.',
    meta: 'Best brief fit',
    tone: 'brand',
    editable: true,
  },
  {
    id: 'dir-c',
    kind: 'direction',
    x: 1440,
    y: 760,
    w: 290,
    title: 'Bold',
    body: 'Your brand already knows the answer.\nPushes contrast while staying inside voice rules.',
    meta: 'Stop-scroll test',
    tone: 'amber',
    editable: true,
    issue: 'Slightly more assertive than average approved posts',
  },
  {
    id: 'asset-social',
    kind: 'asset',
    x: 1920,
    y: 260,
    w: 270,
    title: 'LinkedIn post',
    body: 'Headline + proof · single CTA',
    meta: 'Draft',
    tone: 'brand',
    editable: true,
  },
  {
    id: 'asset-banner',
    kind: 'asset',
    x: 1920,
    y: 500,
    w: 270,
    title: '728×90 banner',
    body: 'Tight headline · primary CTA chip',
    meta: 'Draft',
    tone: 'sky',
    editable: true,
  },
  {
    id: 'asset-flyer',
    kind: 'asset',
    x: 1920,
    y: 740,
    w: 270,
    title: 'One-page flyer',
    body: 'Display headline · proof · register',
    meta: 'Draft',
    tone: 'slate',
    editable: true,
  },
  {
    id: 'review',
    kind: 'review',
    x: 2380,
    y: 460,
    w: 290,
    title: 'Review & Approval',
    body: 'Brand fit · voice · claims · CTA rules\nAwaiting Sarah Johnson',
    meta: 'In review',
    tone: 'amber',
  },
  {
    id: 'production',
    kind: 'production',
    x: 2840,
    y: 460,
    w: 290,
    title: 'Ready for Production',
    body: 'SFMC · LinkedIn Ads · Bynder handoff',
    meta: 'Queued',
    tone: 'emerald',
  },
  {
    id: 'pin-inspo',
    kind: 'pin',
    x: 520,
    y: 820,
    w: 250,
    title: 'Pinned inspiration',
    body: '“Concrete verbs. One ask. No slogans.”',
    meta: 'From voice rules',
    tone: 'rose',
    pinned: true,
  },
]

const initialEdges: Edge[] = [
  { from: 'brief', to: 'memory' },
  { from: 'memory', to: 'ref-1' },
  { from: 'memory', to: 'ref-2' },
  { from: 'memory', to: 'ref-3' },
  { from: 'ref-1', to: 'dir-a' },
  { from: 'ref-2', to: 'dir-b' },
  { from: 'ref-3', to: 'dir-c' },
  { from: 'dir-b', to: 'asset-social' },
  { from: 'dir-b', to: 'asset-banner' },
  { from: 'dir-b', to: 'asset-flyer' },
  { from: 'asset-social', to: 'review' },
  { from: 'asset-banner', to: 'review' },
  { from: 'asset-flyer', to: 'review' },
  { from: 'review', to: 'production' },
]

const stageLabels = [
  { label: 'Brief', x: 100 },
  { label: 'Memory', x: 520 },
  { label: 'References', x: 980 },
  { label: 'Directions', x: 1440 },
  { label: 'Assets', x: 1920 },
  { label: 'Review', x: 2380 },
  { label: 'Production', x: 2840 },
]

const collaboratorsSeed: Collaborator[] = [
  { id: 'sj', name: 'Sarah Johnson', initials: 'SJ', color: '#2563eb', x: 1520, y: 400 },
  { id: 'mk', name: 'Maya Kim', initials: 'MK', color: '#059669', x: 1980, y: 220 },
  { id: 'ar', name: 'Alex Rivera', initials: 'AR', color: '#d97706', x: 2440, y: 400 },
]

const aiQueue: AiAssist[] = [
  {
    id: 'a1',
    kind: 'knowledge',
    label: 'Brand knowledge',
    detail:
      'Memory pulled webinar signup patterns from your last six approved invites — problem → proof → one CTA.',
    action: 'Show in memory',
  },
  {
    id: 'a2',
    kind: 'reference',
    label: 'Successful campaign',
    detail:
      'Partner Co-Marketing Kit matches this audience. Pin it beside your references?',
    action: 'Pin reference',
  },
  {
    id: 'a3',
    kind: 'directions',
    label: 'Creative directions',
    detail:
      'I can draft a fourth direction that keeps Balanced’s brief fit with Bold’s stop-scroll opening.',
    action: 'Generate direction',
  },
  {
    id: 'a4',
    kind: 'explain',
    label: 'Why this recommendation',
    detail:
      'Balanced won selection because it mirrors AI in Enterprise structure while staying inside plainspoken voice.',
    action: 'Explain on canvas',
  },
  {
    id: 'a5',
    kind: 'inconsistency',
    label: 'Brand inconsistency',
    detail:
      'Bold’s CTA “Join the Q3 webinar” competes with “Save your seat” on the LinkedIn draft — single-CTA rule.',
    action: 'Highlight issue',
  },
  {
    id: 'a6',
    kind: 'missing',
    label: 'Missing asset',
    detail:
      'Brief asks for a one-page PDF flyer — legal footer and speaker line are still empty.',
    action: 'Flag gaps',
  },
  {
    id: 'a7',
    kind: 'template',
    label: 'Reusable template',
    detail:
      'Webinar invite template v3 is available from memory — layout, CTA placement, and proof stack.',
    action: 'Place template',
  },
]

const kindLabel: Record<NodeKind, string> = {
  brief: 'Brief',
  memory: 'Memory',
  reference: 'Reference',
  direction: 'Direction',
  asset: 'Asset',
  review: 'Review',
  production: 'Production',
  pin: 'Pinned',
  template: 'Template',
  insight: 'AI',
}

const toneRing: Record<NonNullable<CanvasNode['tone']>, string> = {
  emerald: 'ring-emerald-200',
  brand: 'ring-brand-200',
  amber: 'ring-amber-200',
  sky: 'ring-sky-200',
  rose: 'ring-rose-200',
  slate: 'ring-slate-200',
}

const toneChip: Record<NonNullable<CanvasNode['tone']>, string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
}

export default function CampaignStudio() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    setSelection,
    askAboutSelection,
    openPanel,
    panelCollapsed,
  } = useAiConversation()
  const [role, setRole] = useState<StudioRole>('marketer')
  const mode = modeFromPath(location.pathname)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)

  function setMode(next: StudioMode) {
    const href = pathForMode(next)
    if (href !== location.pathname) navigate(href)
  }

  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      nodeId: 'dir-b',
      author: 'Maya Kim',
      initials: 'MK',
      text: 'Closest to our webinar winners — develop this one.',
      x: 1740,
      y: 430,
    },
  ])
  const [tool, setTool] = useState<Tool>('select')
  const [zoom, setZoom] = useState(0.7)
  const [pan, setPan] = useState({ x: 36, y: -20 })
  const [selectedIds, setSelectedIds] = useState<string[]>(['dir-b'])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const [aiIndex, setAiIndex] = useState(0)
  const [aiPulse, setAiPulse] = useState(true)
  const [improving, setImproving] = useState(false)
  const [collaborators, setCollaborators] = useState(collaboratorsSeed)
  const [draftComment, setDraftComment] = useState<{
    nodeId: string
    x: number
    y: number
  } | null>(null)
  const [commentText, setCommentText] = useState('')
  const [spaceDown, setSpaceDown] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: 'node' | 'pan'
    id?: string
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const uid = useId()

  const activeAi = aiQueue[aiIndex % aiQueue.length]
  const perms = roleById(role)

  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelection(null)
      setContextMenuOpen(false)
      return
    }

    const selectedNodes = selectedIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean) as CanvasNode[]

    if (selectedNodes.length === 0) {
      setSelection(null)
      return
    }

    const kinds = new Set(selectedNodes.map((n) => n.kind))
    let kind: SelectionKind = 'multi'
    if (selectedNodes.length === 1) {
      const k = selectedNodes[0].kind
      if (k === 'asset') kind = 'asset'
      else if (k === 'review' || k === 'production') kind = 'approval'
      else if (k === 'direction' || k === 'brief') kind = 'copy'
      else if (k === 'reference' || k === 'template') kind = 'image'
      else kind = 'workflow-node'
    } else if (kinds.size === 1 && kinds.has('asset')) {
      kind = 'asset'
    }

    const labels = selectedNodes.map((n) => n.title)
    setSelection({
      kind,
      ids: selectedIds,
      labels,
      summary:
        selectedNodes.length === 1
          ? `${selectedNodes[0].kind}: ${selectedNodes[0].title}`
          : `${selectedNodes.length} selected — ${labels.slice(0, 3).join(', ')}${
              labels.length > 3 ? '…' : ''
            }`,
    })
  }, [selectedIds, nodes, setSelection])

  useEffect(() => {
    if (mode === 'governance' && !perms.canManageWorkspace && !perms.canManageMemory) {
      setMode('canvas')
    }
    if (mode === 'connectors' && !perms.canManageConnectors && role === 'brand') {
      // Brand Lead can view connectors; keep allowed
    }
  }, [mode, perms, role])

  useEffect(() => {
    if (!perms.canComment && tool === 'comment') setTool('select')
    if (!perms.canCreate && tool === 'pin') setTool('select')
  }, [perms.canComment, perms.canCreate, tool])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setSpaceDown(true)
      }
      if ((e.key === 'c' || e.key === 'C') && selectedIds.length >= 2) {
        const dirs = selectedIds.filter((id) =>
          nodes.some((n) => n.id === id && n.kind === 'direction'),
        )
        if (dirs.length >= 2) {
          setCompareIds(dirs.slice(0, 2))
          setShowCompare(true)
        }
      }
      if (e.key === 'Escape') {
        setShowCompare(false)
        setDraftComment(null)
        setEditingId(null)
        setSelectedIds([])
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [selectedIds, nodes])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCollaborators((prev) =>
        prev.map((person, i) => ({
          ...person,
          x: person.x + Math.sin(Date.now() / 1800 + i) * 0.4,
          y: person.y + Math.cos(Date.now() / 2100 + i) * 0.3,
        })),
      )
    }, 80)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAiPulse(true)
      setAiIndex((i) => i + 1)
      window.setTimeout(() => setAiPulse(false), 1400)
    }, 10000)
    return () => window.clearInterval(timer)
  }, [])

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = viewportRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      }
    },
    [pan.x, pan.y, zoom],
  )

  function selectNode(id: string, additive: boolean) {
    setSelectedIds((prev) => {
      if (additive) {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3)
      }
      return [id]
    })
  }

  function onNodePointerDown(e: ReactPointerEvent, id: string) {
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    if (tool === 'comment') {
      if (!perms.canComment) return
      const world = screenToWorld(e.clientX, e.clientY)
      setDraftComment({ nodeId: id, x: world.x, y: world.y })
      setCommentText('')
      return
    }

    if (tool === 'pin') {
      if (!perms.canCreate) return
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
      )
      return
    }

    selectNode(id, e.shiftKey || e.metaKey)

    if (tool === 'select' && !spaceDown) {
      const node = nodes.find((n) => n.id === id)
      if (!node) return
      dragRef.current = {
        mode: 'node',
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: node.x,
        originY: node.y,
      }
    }
  }

  function onViewportPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0 && e.button !== 1) return
    const shouldPan = tool === 'pan' || spaceDown || e.button === 1
    if (shouldPan) {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = {
        mode: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        originX: pan.x,
        originY: pan.y,
      }
      return
    }
    setSelectedIds([])
    setDraftComment(null)
    setEditingId(null)
  }

  function onPointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY

    if (drag.mode === 'pan') {
      setPan({ x: drag.originX + dx, y: drag.originY + dy })
      return
    }

    if (drag.mode === 'node' && drag.id) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === drag.id
            ? { ...n, x: drag.originX + dx / zoom, y: drag.originY + dy / zoom }
            : n,
        ),
      )
    }
  }

  function onPointerUp() {
    dragRef.current = null
  }

  function onWheel(e: React.WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom((z) => Math.min(1.5, Math.max(0.35, z - e.deltaY * 0.0015)))
      return
    }
    setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
  }

  function branchSelected() {
    if (!perms.canCreate) return
    const sourceId = selectedIds[0]
    const source = nodes.find((n) => n.id === sourceId && n.kind === 'direction')
    if (!source) return

    const id = `dir-branch-${Date.now()}`
    setNodes((prev) => [
      ...prev,
      {
        ...source,
        id,
        x: source.x + 48,
        y: source.y + 170,
        title: `${source.title} · branch`,
        meta: 'Branched idea',
        tone: 'rose',
        branchOf: source.id,
        issue: undefined,
      },
    ])
    setEdges((prev) => [...prev, { from: source.id, to: id }])
    setSelectedIds([id])
  }

  function toggleCompare() {
    const dirs = selectedIds.filter((id) =>
      nodes.some((n) => n.id === id && n.kind === 'direction'),
    )
    if (dirs.length >= 2) {
      setCompareIds(dirs.slice(0, 2))
      setShowCompare(true)
    }
  }

  function requestImprove() {
    if (!perms.canCreate) return
    const id = selectedIds[0]
    const node = nodes.find((n) => n.id === id)
    if (!node || (node.kind !== 'direction' && node.kind !== 'asset' && node.kind !== 'brief')) {
      return
    }
    setImproving(true)
    askAboutSelection(
      `Improve “${node.title}” using brand memory — keep a single CTA and plainspoken proof.`,
    )
    window.setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                body:
                  n.kind === 'direction'
                    ? `${n.body.split('\n')[0]}\nSharper proof line from memory — concrete verbs, one ask.`
                    : n.kind === 'brief'
                      ? 'Drive qualified webinar signups for the Q3 product launch.\nEnterprise marketing leaders at mid-market + Fortune 500.\nConfident, plainspoken, practical — no hype.'
                      : 'Revised from memory · single CTA · plainspoken proof',
                meta: 'AI improved',
                issue: undefined,
              }
            : n,
        ),
      )
      setImproving(false)
    }, 900)
  }

  const selectionPrompts = [
    'Rewrite these for a more technical audience.',
    'Apply this design treatment across all selected assets.',
    'Add legal approval before publishing.',
    'Create LinkedIn and email variations from this campaign.',
  ] as const

  function runSelectionPrompt(prompt: string) {
    askAboutSelection(prompt)
    setContextMenuOpen(false)
  }

  function applyAi() {
    if (!perms.canCreate && activeAi.kind !== 'explain' && activeAi.kind !== 'inconsistency') {
      return
    }
    const assist = activeAi
    if (assist.kind === 'knowledge') {
      setSelectedIds(['memory'])
      setPan({ x: 80, y: 20 })
      setZoom(0.85)
    } else if (assist.kind === 'reference') {
      const id = `ref-ai-${Date.now()}`
      setNodes((prev) => [
        ...prev,
        {
          id,
          kind: 'reference',
          x: 980,
          y: 980,
          w: 270,
          title: 'Partner Co-Marketing Kit',
          body: 'Audience overlap with enterprise webinar buyers. Approved multi-channel kit.',
          meta: 'AI suggested',
          tone: 'brand',
          pinned: true,
        },
      ])
      setEdges((prev) => [...prev, { from: 'memory', to: id }])
      setSelectedIds([id])
    } else if (assist.kind === 'directions') {
      const id = `dir-hybrid-${Date.now()}`
      setNodes((prev) => [
        ...prev,
        {
          id,
          kind: 'direction',
          x: 1760,
          y: 460,
          w: 290,
          title: 'Hybrid',
          body: 'Stop relearning your brand — your brand already knows the answer.\nBalanced fit with Bold’s opening tension.',
          meta: 'AI generated',
          tone: 'brand',
          editable: true,
        },
      ])
      setEdges((prev) => [
        ...prev,
        { from: 'dir-b', to: id },
        { from: 'dir-c', to: id },
      ])
      setSelectedIds([id])
    } else if (assist.kind === 'explain') {
      const id = `insight-${Date.now()}`
      setNodes((prev) => [
        ...prev,
        {
          id,
          kind: 'insight',
          x: 1440,
          y: 40,
          w: 280,
          title: 'Why Balanced',
          body: 'Mirrors AI in Enterprise structure, stays inside plainspoken voice, strongest brief fit.',
          meta: 'Explanation',
          tone: 'brand',
        },
      ])
      setEdges((prev) => [...prev, { from: id, to: 'dir-b' }])
      setSelectedIds([id])
    } else if (assist.kind === 'inconsistency') {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'dir-c' || n.id === 'asset-social'
            ? {
                ...n,
                issue:
                  n.id === 'dir-c'
                    ? 'CTA may conflict with LinkedIn draft'
                    : 'Competing CTA vs Bold direction',
                tone: n.id === 'dir-c' ? 'rose' : n.tone,
              }
            : n,
        ),
      )
      setSelectedIds(['dir-c', 'asset-social'])
    } else if (assist.kind === 'missing') {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'asset-flyer'
            ? {
                ...n,
                meta: 'Gaps',
                issue: 'Missing legal footer + speaker line',
                tone: 'amber',
              }
            : n,
        ),
      )
      setSelectedIds(['asset-flyer'])
    } else if (assist.kind === 'template') {
      const id = `tpl-${Date.now()}`
      setNodes((prev) => [
        ...prev,
        {
          id,
          kind: 'template',
          x: 1920,
          y: 40,
          w: 270,
          title: 'Webinar invite · v3',
          body: 'Reusable layout · CTA placement · proof stack from memory',
          meta: 'Template',
          tone: 'emerald',
          pinned: true,
        },
      ])
      setEdges((prev) => [...prev, { from: 'memory', to: id }, { from: id, to: 'asset-social' }])
      setSelectedIds([id])
    }
    setAiIndex((i) => i + 1)
  }

  function submitComment() {
    if (!draftComment || !commentText.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        nodeId: draftComment.nodeId,
        author: 'You',
        initials: 'YO',
        text: commentText.trim(),
        x: draftComment.x,
        y: draftComment.y,
      },
    ])
    setDraftComment(null)
    setCommentText('')
    setTool('select')
  }

  function updateNodeBody(id: string, body: string) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, body } : n)))
  }

  function nodeCenter(node: CanvasNode) {
    return { x: node.x + node.w / 2, y: node.y + 72 }
  }

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const compareNodes = compareIds
    .map((id) => nodeMap[id])
    .filter(Boolean) as CanvasNode[]

  const canImprove = selectedIds.some((id) => {
    const n = nodeMap[id]
    return n && (n.kind === 'direction' || n.kind === 'asset' || n.kind === 'brief')
  })

  const cursor =
    tool === 'pan' || spaceDown
      ? 'cursor-grab active:cursor-grabbing'
      : tool === 'comment'
        ? 'cursor-crosshair'
        : tool === 'pin'
          ? 'cursor-cell'
          : 'cursor-default'

  return (
    <div className="campaign-canvas relative flex h-full min-h-0 flex-col overflow-hidden bg-[#f3f5f8]">
      <header className="z-20 flex shrink-0 flex-col gap-3 border-b border-border bg-white/90 px-4 py-2.5 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              Q3 Webinar Launch
            </h1>
          </div>

          <div
            className="flex rounded-xl border border-border bg-slate-50 p-1"
            role="tablist"
            aria-label="Studio mode"
          >
            {(
              [
                { id: 'canvas' as const, label: 'Canvas', show: true },
                { id: 'workflow' as const, label: 'Workflow', show: true },
                { id: 'approvals' as const, label: 'Approvals', show: true },
                { id: 'connectors' as const, label: 'Connectors', show: true },
                {
                  id: 'governance' as const,
                  label: 'Governance',
                  show: perms.canManageWorkspace,
                },
              ] as const
            )
              .filter((item) => item.show)
              .map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={mode === item.id}
                onClick={() => setMode(item.id)}
                className={[
                  'rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150',
                  mode === item.id
                    ? 'bg-white text-foreground shadow-[var(--shadow-soft)]'
                    : 'text-muted hover:text-foreground',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-2 py-1 shadow-[var(--shadow-soft)]">
            <span className="hidden text-[11px] font-medium text-muted sm:inline">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StudioRole)}
              aria-label="Enterprise role"
              className="rounded-lg border-0 bg-transparent py-1 pr-1 text-[12px] font-semibold text-foreground outline-none"
            >
              {STUDIO_ROLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1.5">
            {collaborators.map((person) => (
              <span
                key={person.id}
                title={person.name}
                className="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white"
                style={{ background: person.color }}
              >
                {person.initials}
              </span>
            ))}
            <span className="ml-1 hidden text-[12px] text-muted sm:inline">3 live</span>
          </div>

          {mode === 'canvas' && (
            <div className="flex flex-wrap items-center gap-2">
              {perms.canCreate && (
                <>
                  <button
                    type="button"
                    onClick={branchSelected}
                    disabled={
                      !selectedIds.some((id) => nodeMap[id]?.kind === 'direction')
                    }
                    className="btn-secondary !px-3 !py-1.5 text-[12px]"
                  >
                    Branch idea
                  </button>
                  <button
                    type="button"
                    onClick={requestImprove}
                    disabled={!canImprove || improving}
                    className="btn-secondary !px-3 !py-1.5 text-[12px]"
                  >
                    {improving ? 'Improving…' : 'Ask AI to improve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openPanel()
                      setContextMenuOpen(true)
                    }}
                    disabled={selectedIds.length === 0}
                    className="btn-primary !px-3 !py-1.5 text-[12px]"
                  >
                    Ask AI
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={toggleCompare}
                disabled={
                  selectedIds.filter((id) => nodeMap[id]?.kind === 'direction').length <
                  2
                }
                className="btn-secondary !px-3 !py-1.5 text-[12px]"
              >
                Compare
              </button>
              {perms.canApprove && (
                <button
                  type="button"
                  onClick={() => setMode('approvals')}
                  className="btn-primary !px-3 !py-1.5 text-[12px]"
                >
                  Review approvals
                </button>
              )}
              {perms.canCreate && !perms.canApprove && (
                <button
                  type="button"
                  onClick={() => setMode('approvals')}
                  className="btn-primary !px-3 !py-1.5 text-[12px]"
                >
                  Submit for review
                </button>
              )}
              {perms.canManageWorkspace && (
                <button
                  type="button"
                  onClick={() => setMode('governance')}
                  className="btn-secondary !px-3 !py-1.5 text-[12px]"
                >
                  Governance
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-brand-50/60 px-4 py-1.5 text-[11px] text-brand-800">
        <span>
          <span className="font-semibold">{perms.label}</span>
          {' · '}
          {perms.focus}
        </span>
        <span className="text-brand-700/80">
          {perms.canCreate ? 'Create' : 'View'}
          {perms.canApprove ? ' · Approve' : ''}
          {perms.canManageWorkspace ? ' · Govern' : ''}
          {perms.canManageMemory ? ' · Memory' : ''}
        </span>
      </div>

      {mode !== 'canvas' ? (
        <div className="min-h-0 flex-1">
          <StudioExecution
            tab={mode}
            onTabChange={(tab) => setMode(tab)}
            role={role}
            onSelectContext={(ctx) => {
              setSelection(ctx)
              setContextMenuOpen(true)
            }}
            onAskAi={(prompt) => askAboutSelection(prompt)}
          />
        </div>
      ) : (
      <>
      <div className="relative min-h-0 flex-1">
        {selectedIds.length > 0 && (
          <div
            className="absolute bottom-3 left-3 z-30 w-[min(100%-1.5rem,20rem)] rounded-xl border border-border bg-white p-3 shadow-[var(--shadow-lift-md)]"
            role="region"
            aria-label="Ask AI about selection"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="eyebrow text-brand-600">Ask AI</p>
                <p className="mt-1 text-[12px] leading-snug text-muted">
                  {selectedIds.length} selected — context passed automatically
                </p>
              </div>
              <button
                type="button"
                aria-expanded={contextMenuOpen}
                aria-label={contextMenuOpen ? 'Hide prompts' : 'Show prompts'}
                onClick={() => setContextMenuOpen((open) => !open)}
                className="rounded-md px-1.5 text-[11px] font-medium text-brand-700 hover:bg-brand-50"
              >
                {contextMenuOpen ? 'Hide' : 'Prompts'}
              </button>
            </div>
            {contextMenuOpen && (
              <ul className="mt-2.5 space-y-1">
                {selectionPrompts.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      onClick={() => runSelectionPrompt(prompt)}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-[12px] leading-snug text-foreground hover:bg-brand-50"
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {panelCollapsed && (
              <button
                type="button"
                onClick={() => openPanel()}
                className="mt-2 text-[11px] font-medium text-brand-700"
              >
                Open conversation →
              </button>
            )}
          </div>
        )}
        <div
          className="absolute top-3 left-3 z-20 flex flex-col gap-0.5 rounded-xl border border-border bg-white p-1.5 shadow-[var(--shadow-lift)]"
          role="toolbar"
          aria-label="Studio tools"
        >
          {(
            [
              { id: 'select', label: 'Select', icon: SelectIcon, show: true },
              { id: 'pan', label: 'Pan', icon: HandIcon, show: true },
              {
                id: 'comment',
                label: 'Comment',
                icon: CommentIcon,
                show: perms.canComment,
              },
              { id: 'pin', label: 'Pin', icon: PinIcon, show: perms.canCreate },
            ] as const
          )
            .filter((item) => item.show)
            .map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-pressed={tool === item.id}
              onClick={() => setTool(item.id)}
              className={[
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                tool === item.id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-muted hover:bg-slate-50 hover:text-foreground',
              ].join(' ')}
            >
              <item.icon className="size-3.5" />
            </button>
          ))}
        </div>

        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-xl border border-border bg-white p-1 shadow-[var(--shadow-soft)]">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.1).toFixed(2)))}
            className="rounded-lg px-2 py-1 text-[13px] text-muted hover:bg-slate-50 hover:text-foreground"
          >
            −
          </button>
          <span className="min-w-12 text-center text-[11px] font-medium text-muted">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}
            className="rounded-lg px-2 py-1 text-[13px] text-muted hover:bg-slate-50 hover:text-foreground"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(0.7)
              setPan({ x: 36, y: -20 })
            }}
            className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted hover:bg-slate-50 hover:text-foreground"
          >
            Fit
          </button>
        </div>

        <div
          ref={viewportRef}
          className={`absolute inset-0 overflow-hidden ${cursor}`}
          onPointerDown={onViewportPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <div
            className="campaign-canvas__world absolute origin-top-left will-change-transform"
            style={{
              width: WORLD.w,
              height: WORLD.h,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #d9dde5 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />

            {stageLabels.map((stage) => (
              <div
                key={stage.label}
                className="pointer-events-none absolute top-16"
                style={{ left: stage.x }}
              >
                <p className="eyebrow tracking-[0.08em] text-slate-400">{stage.label}</p>
              </div>
            ))}

            <svg
              className="pointer-events-none absolute inset-0 overflow-visible"
              width={WORLD.w}
              height={WORLD.h}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id={`${uid}-arrow`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="#c4cad4" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const a = nodeMap[edge.from]
                const b = nodeMap[edge.to]
                if (!a || !b) return null
                const start = nodeCenter(a)
                const end = nodeCenter(b)
                const midX = (start.x + end.x) / 2
                const path = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={path}
                    fill="none"
                    stroke="#c4cad4"
                    strokeWidth="1.75"
                    markerEnd={`url(#${uid}-arrow)`}
                    className="campaign-canvas__edge"
                  />
                )
              })}
            </svg>

            {nodes.map((node) => {
              const selected = selectedIds.includes(node.id)
              const comparing = compareIds.includes(node.id) && showCompare
              return (
                <article
                  key={node.id}
                  onPointerDown={(e) => onNodePointerDown(e, node.id)}
                  onDoubleClick={() => {
                    if (node.editable && perms.canCreate) setEditingId(node.id)
                  }}
                  className={[
                    'campaign-canvas__node absolute select-none rounded-2xl border bg-white p-3.5 shadow-[var(--shadow-soft)] transition-[box-shadow,border-color] duration-150',
                    selected || comparing
                      ? `border-brand-400 ring-2 ${toneRing[node.tone ?? 'brand']} shadow-[var(--shadow-lift)]`
                      : 'border-border hover:border-[#d7dbe3] hover:shadow-[var(--shadow-lift)]',
                    node.pinned ? 'campaign-canvas__node--pinned' : '',
                    node.issue ? 'border-amber-300' : '',
                  ].join(' ')}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.w,
                    zIndex: selected ? 5 : 2,
                  }}
                >
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={[
                            'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                            toneChip[node.tone ?? 'slate'],
                          ].join(' ')}
                        >
                          {kindLabel[node.kind]}
                        </span>
                        {node.pinned && <PinIcon className="size-3 text-rose-500" />}
                        {node.branchOf && (
                          <span className="text-[10px] font-medium text-rose-600">
                            branch
                          </span>
                        )}
                      </div>
                      <h2 className="mt-1.5 truncate text-[13px] font-semibold tracking-tight text-foreground">
                        {node.title}
                      </h2>
                    </div>
                    {node.meta && (
                      <StatusBadge
                        tone={
                          node.tone === 'emerald'
                            ? 'emerald'
                            : node.tone === 'amber' || node.tone === 'rose'
                              ? 'amber'
                              : node.tone === 'brand'
                                ? 'brand'
                                : 'slate'
                        }
                        dot={false}
                        className="!px-1.5 !py-0.5 text-[10px]"
                      >
                        {node.meta}
                      </StatusBadge>
                    )}
                  </div>

                  {editingId === node.id ? (
                    <textarea
                      autoFocus
                      value={node.body}
                      onChange={(e) => updateNodeBody(node.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onPointerDown={(e) => e.stopPropagation()}
                      rows={4}
                      className="field-input resize-none !p-2 text-[12px] leading-relaxed"
                    />
                  ) : (
                    <NodeBody node={node} />
                  )}

                  {node.issue && (
                    <p className="mt-2.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] leading-snug text-amber-800">
                      {node.issue}
                    </p>
                  )}
                </article>
              )
            })}

            {comments.map((comment) => (
              <div
                key={comment.id}
                className="campaign-canvas__comment absolute z-10 w-52 rounded-xl border border-border bg-white p-2.5 shadow-[var(--shadow-lift)]"
                style={{ left: comment.x, top: comment.y }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-semibold text-emerald-700">
                    {comment.initials}
                  </span>
                  <p className="text-[11px] font-medium text-foreground">
                    {comment.author}
                  </p>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                  {comment.text}
                </p>
              </div>
            ))}

            {draftComment && (
              <div
                className="absolute z-20 w-56 rounded-xl border border-brand-300 bg-white p-2.5 shadow-[var(--shadow-lift-md)]"
                style={{ left: draftComment.x, top: draftComment.y }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <textarea
                  autoFocus
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Add a comment…"
                  className="field-input resize-none !p-2 text-[12px]"
                />
                <div className="mt-2 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDraftComment(null)}
                    className="btn-secondary !px-2.5 !py-1 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitComment}
                    className="btn-primary !px-2.5 !py-1 text-[11px]"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {collaborators.map((person) => (
              <div
                key={person.id}
                className="pointer-events-none absolute z-30 flex items-center gap-1.5"
                style={{ left: person.x, top: person.y }}
              >
                <span
                  className="flex size-6 items-center justify-center rounded-full text-[9px] font-semibold text-white shadow-sm"
                  style={{ background: person.color }}
                >
                  {person.initials}
                </span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ background: person.color }}
                >
                  {person.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {aiOpen && panelCollapsed && (
          <aside
            className={[
              'absolute right-3 bottom-16 z-20 w-[min(100%-1.5rem,22rem)] rounded-2xl border border-border bg-white/95 p-3.5 shadow-[var(--shadow-lift-md)] backdrop-blur-md',
              aiPulse ? 'campaign-canvas__ai-pulse' : '',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="eyebrow text-brand-600">Memory · AI</p>
                <h2 className="mt-1 text-[13px] font-semibold tracking-tight text-foreground">
                  {activeAi.label}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setAiOpen(false)}
                className="rounded-md px-1.5 text-slate-400 hover:bg-slate-50 hover:text-foreground"
              >
                ×
              </button>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              {activeAi.detail}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={applyAi}
                disabled={
                  !perms.canCreate &&
                  activeAi.kind !== 'explain' &&
                  activeAi.kind !== 'inconsistency'
                }
                className="btn-primary !px-3 !py-1.5 text-[12px]"
              >
                {activeAi.action}
              </button>
              <button
                type="button"
                onClick={() => setAiIndex((i) => i + 1)}
                className="btn-secondary !px-3 !py-1.5 text-[12px]"
              >
                Next
              </button>
            </div>
          </aside>
        )}

        {!aiOpen && panelCollapsed && (
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="absolute right-3 bottom-16 z-20 rounded-full border border-border bg-white px-3 py-2 text-[12px] font-medium text-brand-700 shadow-[var(--shadow-soft)]"
          >
            Memory suggestions
          </button>
        )}
      </div>

      <footer className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-white/90 px-4 py-2 text-[11px] text-muted backdrop-blur-md">
        <span>
          Drag · Space pan · Double-click edit · Shift multi-select · C compare
        </span>
        <span>
          {nodes.length} artifacts · {comments.length} comments · {selectedIds.length}{' '}
          selected
        </span>
      </footer>

      {showCompare && compareNodes.length === 2 && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-6 backdrop-blur-[2px]"
          onClick={() => setShowCompare(false)}
        >
          <div
            className="grid w-full max-w-3xl gap-4 rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-lift-md)] sm:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="col-span-full flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Compare directions
              </h2>
              <button
                type="button"
                onClick={() => setShowCompare(false)}
                className="btn-secondary !px-2.5 !py-1 text-[11px]"
              >
                Close
              </button>
            </div>
            {compareNodes.map((node) => (
              <div key={node.id} className="rounded-xl border border-border bg-slate-50 p-4">
                <p className="eyebrow">{node.title}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {node.body}
                </p>
                <p className="mt-3 text-[12px] text-muted">{node.meta}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}

function NodeBody({ node }: { node: CanvasNode }) {
  if (node.kind === 'brief') {
    const parts = node.body.split('\n')
    return (
      <div className="space-y-2">
        {['Objective', 'Audience', 'Tone'].map((label, i) => (
          <div
            key={label}
            className="rounded-lg border border-dashed border-border bg-slate-50/80 px-2.5 py-2"
          >
            <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
              {label}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-foreground">
              {parts[i] ?? '—'}
            </p>
          </div>
        ))}
      </div>
    )
  }

  if (node.kind === 'memory') {
    return (
      <ul className="space-y-1.5">
        {node.body.split('\n').map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[12px] leading-relaxed text-muted"
          >
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    )
  }

  if (node.kind === 'asset' || node.kind === 'template') {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-50 to-brand-50/60 p-3">
        <p className="text-[12px] font-semibold text-foreground">
          {node.body.split(' · ')[0]}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {node.body.split(' · ').slice(1).join(' · ') || node.body}
        </p>
        <div className="mt-3 h-14 rounded-lg bg-white/80 shadow-[inset_0_0_0_1px_rgb(232_234_238)]" />
      </div>
    )
  }

  return (
    <p className="whitespace-pre-line text-[12px] leading-relaxed text-muted">
      {node.body}
    </p>
  )
}

function SelectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 2.5 6.2 12.5 8 8.8l3.7-1.8L3.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 7.5V4.25a1 1 0 0 1 2 0V7M8 7V3.5a1 1 0 0 1 2 0V7M10 7.25V4.75a1 1 0 0 1 2 0V9.5a4 4 0 0 1-4 4H7.5A3.5 3.5 0 0 1 4 10V7.25a1 1 0 0 1 2 0V8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h10v7H6.5L3 14V4.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5V9.5M5.5 3.5h5l-.8 3.2a2.4 2.4 0 0 1 1.6 2.3H4.7a2.4 2.4 0 0 1 1.6-2.3L5.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
