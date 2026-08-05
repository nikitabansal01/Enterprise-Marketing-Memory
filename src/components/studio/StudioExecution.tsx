import { useState } from 'react'
import { roleById, type StudioRole } from '../../lib/roles'
import type { SelectionContext } from '../../lib/aiConversation'
import MemoryToast, { type MemoryToastPayload } from '../ui/MemoryToast'
import StatusBadge from '../ui/StatusBadge'

export type ExecutionTab = 'workflow' | 'approvals' | 'connectors' | 'governance'

type WorkflowStep = {
  id: string
  label: string
  detail: string
  status: 'Done' | 'Active' | 'Waiting' | 'Queued'
  tone: 'emerald' | 'brand' | 'amber' | 'slate'
}

type ApprovalStage = {
  id: 'draft' | 'brand' | 'legal' | 'production'
  label: string
  owner: string
  initials: string
  status: 'Done' | 'In Review' | 'Pending' | 'Ready' | 'Blocked'
  note: string
  time: string
  actor: 'marketer' | 'brand' | 'legal' | 'system'
}

type Connector = {
  id: string
  label: string
  detail: string
  initial: string
  publishStatus: 'Published' | 'Syncing' | 'Ready' | 'Not connected' | 'Failed'
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'draft',
    label: 'Draft',
    detail: 'Marketer creates directions and assets on the canvas.',
    status: 'Done',
    tone: 'emerald',
  },
  {
    id: 'brand',
    label: 'Brand Review',
    detail: 'Brand Lead checks voice, CTA rules, and memory fit.',
    status: 'Active',
    tone: 'brand',
  },
  {
    id: 'legal',
    label: 'Legal',
    detail: 'Claims, footer, and compliance review.',
    status: 'Waiting',
    tone: 'amber',
  },
  {
    id: 'production',
    label: 'Ready for Production',
    detail: 'Approved package queued to enterprise connectors.',
    status: 'Queued',
    tone: 'slate',
  },
]

const approvalSeed: ApprovalStage[] = [
  {
    id: 'draft',
    label: 'Draft',
    owner: 'Maya Kim · Marketer',
    initials: 'MK',
    status: 'Done',
    note: 'Balanced direction and assets submitted from Campaign Studio.',
    time: 'Today · 8:40 AM',
    actor: 'marketer',
  },
  {
    id: 'brand',
    label: 'Brand Review',
    owner: 'Sarah Johnson · Brand Lead',
    initials: 'SJ',
    status: 'In Review',
    note: 'Reviewing voice, single-CTA rule, and memory alignment.',
    time: 'Today · 9:14 AM',
    actor: 'brand',
  },
  {
    id: 'legal',
    label: 'Legal',
    owner: 'Alex Rivera · Legal',
    initials: 'AR',
    status: 'Pending',
    note: 'Opens after Brand Review approval.',
    time: 'Waiting',
    actor: 'legal',
  },
  {
    id: 'production',
    label: 'Ready for Production',
    owner: 'Campaign Studio',
    initials: 'CS',
    status: 'Blocked',
    note: 'Unlocks when Brand Review and Legal are approved.',
    time: 'Blocked',
    actor: 'system',
  },
]

const connectorCatalog: Connector[] = [
  {
    id: 'sfmc',
    label: 'SFMC',
    detail: 'Salesforce Marketing Cloud · journeys & email',
    initial: 'S',
    publishStatus: 'Ready',
  },
  {
    id: 'braze',
    label: 'Braze',
    detail: 'Lifecycle messaging',
    initial: 'B',
    publishStatus: 'Not connected',
  },
  {
    id: 'contentful',
    label: 'Contentful',
    detail: 'Headless CMS',
    initial: 'C',
    publishStatus: 'Not connected',
  },
  {
    id: 'aem',
    label: 'Adobe AEM',
    detail: 'Experience Manager',
    initial: 'A',
    publishStatus: 'Ready',
  },
  {
    id: 'marketo',
    label: 'Marketo',
    detail: 'Engagement programs',
    initial: 'M',
    publishStatus: 'Not connected',
  },
  {
    id: 'hubspot',
    label: 'HubSpot',
    detail: 'CRM + marketing hub',
    initial: 'H',
    publishStatus: 'Not connected',
  },
]

const publishTone: Record<
  Connector['publishStatus'],
  'emerald' | 'amber' | 'brand' | 'slate' | 'rose'
> = {
  Published: 'emerald',
  Syncing: 'brand',
  Ready: 'brand',
  'Not connected': 'slate',
  Failed: 'rose',
}

const approvalTone: Record<
  ApprovalStage['status'],
  'emerald' | 'amber' | 'brand' | 'slate' | 'rose'
> = {
  Done: 'emerald',
  'In Review': 'amber',
  Pending: 'slate',
  Ready: 'emerald',
  Blocked: 'rose',
}

const stepTone: Record<WorkflowStep['tone'], string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
}

type StudioExecutionProps = {
  tab: ExecutionTab
  role: StudioRole
  onSelectContext?: (ctx: SelectionContext) => void
  onAskAi?: (prompt: string) => void
}

export default function StudioExecution({
  tab,
  role,
  onSelectContext,
  onAskAi,
}: StudioExecutionProps) {
  const perms = roleById(role)
  const [approvals, setApprovals] = useState(approvalSeed)
  const [connected, setConnected] = useState<string[]>(['sfmc', 'aem'])
  const [publishMap, setPublishMap] = useState<Record<string, Connector['publishStatus']>>({
    sfmc: 'Ready',
    aem: 'Ready',
  })
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [toast, setToast] = useState<MemoryToastPayload | null>(null)
  const [memoryLock, setMemoryLock] = useState(true)
  const [requireLegal, setRequireLegal] = useState(true)

  const connectors = connectorCatalog.map((c) => ({
    ...c,
    publishStatus: connected.includes(c.id)
      ? (publishMap[c.id] ?? 'Ready')
      : ('Not connected' as const),
  }))

  function connect(id: string) {
    if (!perms.canManageConnectors || connected.includes(id) || connectingId) return
    const connector = connectorCatalog.find((c) => c.id === id)
    setConnectingId(id)
    window.setTimeout(() => {
      setConnected((prev) => [...prev, id])
      setPublishMap((prev) => ({ ...prev, [id]: 'Ready' }))
      setConnectingId(null)
      setToast({
        eyebrow: 'Connector ready',
        title: `${connector?.label ?? 'Destination'} connected`,
        detail: 'Drafts will publish using channel rules already in marketing memory.',
      })
    }, 800)
  }

  function publish(id: string) {
    if (!perms.canManageConnectors || !connected.includes(id) || publishingId) return
    const productionReady = approvals.find((a) => a.id === 'production')?.status === 'Ready'
    if (!productionReady) {
      setToast({
        eyebrow: 'Approval required',
        title: 'Not ready for production',
        detail: 'Complete Brand Review and Legal before publishing.',
      })
      return
    }
    setPublishingId(id)
    setPublishMap((prev) => ({ ...prev, [id]: 'Syncing' }))
    window.setTimeout(() => {
      setPublishMap((prev) => ({ ...prev, [id]: 'Published' }))
      setPublishingId(null)
      const connector = connectorCatalog.find((c) => c.id === id)
      setToast({
        eyebrow: 'Publish status',
        title: `Published to ${connector?.label ?? 'destination'}`,
        detail: 'Asset package handed off with brand-fit checks from memory.',
      })
    }, 1100)
  }

  function canActOnStage(stage: ApprovalStage) {
    if (stage.id === 'draft') return perms.canCreate && stage.status !== 'Done'
    if (stage.id === 'brand') {
      return perms.canApprove && (stage.status === 'In Review' || stage.status === 'Pending')
    }
    if (stage.id === 'legal') {
      return (
        (perms.canApprove || perms.canManageWorkspace) &&
        (stage.status === 'In Review' || stage.status === 'Pending')
      )
    }
    return false
  }

  function advanceApproval(id: ApprovalStage['id']) {
    setApprovals((prev) => {
      const current = prev.find((step) => step.id === id)
      if (!current || !canActOnStage(current)) return prev

      const next = prev.map((step) => {
        if (step.id !== id) return step

        if (id === 'draft' && perms.canCreate) {
          return {
            ...step,
            status: 'Done' as const,
            note: 'Draft submitted for Brand Review.',
            time: 'Just now',
          }
        }

        if (id === 'brand' && perms.canApprove) {
          return {
            ...step,
            status: 'Done' as const,
            note: 'Brand Lead approved — voice and CTA rules cleared.',
            time: 'Just now',
          }
        }

        if (id === 'legal' && (perms.canApprove || perms.canManageWorkspace)) {
          return {
            ...step,
            status: 'Done' as const,
            note: 'Legal approved — claims and footer cleared.',
            time: 'Just now',
          }
        }

        return step
      })

      const brandDone = next.find((s) => s.id === 'brand')?.status === 'Done'
      const legalDone = next.find((s) => s.id === 'legal')?.status === 'Done'
      const draftDone = next.find((s) => s.id === 'draft')?.status === 'Done'

      return next.map((step) => {
        if (step.id === 'brand' && draftDone && step.status === 'Pending') {
          return {
            ...step,
            status: 'In Review' as const,
            note: 'Awaiting Brand Lead review.',
            time: 'Just now',
          }
        }
        if (step.id === 'legal' && brandDone && step.status === 'Pending') {
          return {
            ...step,
            status: 'In Review' as const,
            note: 'Checking webinar claims and footer copy.',
            time: 'Just now',
          }
        }
        if (step.id === 'production') {
          if (brandDone && (!requireLegal || legalDone)) {
            return {
              ...step,
              status: 'Ready' as const,
              note: 'Approved package ready for connector publish.',
              time: 'Just now',
            }
          }
          return {
            ...step,
            status: 'Blocked' as const,
            note: requireLegal
              ? 'Unlocks when Brand Review and Legal are approved.'
              : 'Unlocks when Brand Review is approved.',
            time: 'Blocked',
          }
        }
        return step
      })
    })
  }

  const approvedCount = approvals.filter(
    (a) => a.status === 'Done' || a.status === 'Ready',
  ).length
  const publishedCount = connectors.filter((c) => c.publishStatus === 'Published').length
  const connectedCount = connected.length

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f3f5f8]">
      <MemoryToast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-5 py-2.5">
        <p className="text-[12px] text-muted">
          {perms.short}: {perms.focus}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {approvedCount}/{approvals.length} stages
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand-500" />
            {connectedCount} connectors
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-sky-500" />
            {publishedCount} published
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-6">
        {tab === 'workflow' && (
          <WorkflowPanel
            approvals={approvals}
            onSelectContext={onSelectContext}
            onAskAi={onAskAi}
          />
        )}
        {tab === 'approvals' && (
          <ApprovalsPanel
            approvals={approvals}
            role={role}
            canActOnStage={canActOnStage}
            onAdvance={advanceApproval}
            onSelectContext={onSelectContext}
            onAskAi={onAskAi}
          />
        )}
        {tab === 'connectors' && (
          <ConnectorsPanel
            connectors={connectors}
            connectingId={connectingId}
            publishingId={publishingId}
            canManage={perms.canManageConnectors}
            onConnect={connect}
            onPublish={publish}
          />
        )}
        {tab === 'governance' && (
          <GovernancePanel
            memoryLock={memoryLock}
            requireLegal={requireLegal}
            onMemoryLock={setMemoryLock}
            onRequireLegal={setRequireLegal}
          />
        )}
      </div>
    </div>
  )
}

function WorkflowPanel({
  approvals,
  onSelectContext,
  onAskAi,
}: {
  approvals: ApprovalStage[]
  onSelectContext?: (ctx: SelectionContext) => void
  onAskAi?: (prompt: string) => void
}) {
  const statusFor = (id: WorkflowStep['id']) =>
    approvals.find((a) => a.id === id)?.status ?? 'Pending'

  function selectStep(step: WorkflowStep) {
    onSelectContext?.({
      kind: 'workflow-node',
      ids: [step.id],
      labels: [step.label],
      summary: `Workflow node: ${step.label}`,
    })
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="surface-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Approval workflow
          </h2>
          <p className="mt-1 text-[12px] text-muted">
            Draft → Brand Review → Legal → Ready for Production
          </p>
        </div>

        <div className="relative bg-[radial-gradient(#e8eaee_1px,transparent_1px)] [background-size:16px_16px] p-6">
          <ol className="mx-auto flex max-w-md flex-col items-center">
            {workflowSteps.map((step, index) => {
              const live = statusFor(step.id)
              const badge =
                live === 'Done' || live === 'Ready'
                  ? ('Done' as const)
                  : live === 'In Review'
                    ? ('Active' as const)
                    : live === 'Blocked'
                      ? ('Waiting' as const)
                      : step.status

              return (
                <li key={step.id} className="flex w-full flex-col items-center">
                  <article
                    className="surface-card-interactive w-full rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-soft)]"
                    tabIndex={0}
                    onClick={() => selectStep(step)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectStep(step)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={[
                          'flex size-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-semibold',
                          stepTone[step.tone],
                        ].join(' ')}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              {step.label}
                            </h3>
                            <p className="mt-1 text-[12px] leading-relaxed text-muted">
                              {step.detail}
                            </p>
                          </div>
                          <StatusBadge
                            tone={
                              badge === 'Done'
                                ? 'emerald'
                                : badge === 'Active'
                                  ? 'brand'
                                  : badge === 'Waiting'
                                    ? 'amber'
                                    : 'slate'
                            }
                            dot={false}
                          >
                            {badge}
                          </StatusBadge>
                        </div>
                        {onAskAi && (
                          <button
                            type="button"
                            className="mt-2 text-[11px] font-medium text-brand-700 hover:text-brand-800"
                            onClick={(e) => {
                              e.stopPropagation()
                              selectStep(step)
                              onAskAi(
                                step.id === 'legal'
                                  ? 'Add legal approval before publishing.'
                                  : `Explain what should happen at the “${step.label}” step.`,
                              )
                            }}
                          >
                            Ask AI
                          </button>
                        )}
                      </div>
                    </div>
                  </article>

                  {index < workflowSteps.length - 1 && (
                    <div className="flex flex-col items-center py-1.5" aria-hidden="true">
                      <span className="h-3 w-px bg-border" />
                      <span className="text-[11px] leading-none text-slate-300">↓</span>
                      <span className="h-3 w-px bg-border" />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <aside className="surface-card h-fit p-5">
        <p className="eyebrow">Role handoff</p>
        <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-foreground">
          Who acts where
        </h2>
        <ul className="mt-4 space-y-3 text-[12px]">
          <li className="flex justify-between gap-2 border-b border-border pb-3">
            <span className="text-muted">Draft</span>
            <span className="font-medium text-foreground">Marketer</span>
          </li>
          <li className="flex justify-between gap-2 border-b border-border pb-3">
            <span className="text-muted">Brand Review</span>
            <span className="font-medium text-foreground">Brand Lead</span>
          </li>
          <li className="flex justify-between gap-2 border-b border-border pb-3">
            <span className="text-muted">Legal</span>
            <span className="font-medium text-foreground">Brand Lead / Admin</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted">Production</span>
            <span className="font-medium text-foreground">Company Admin</span>
          </li>
        </ul>
      </aside>
    </div>
  )
}

function ApprovalsPanel({
  approvals,
  role,
  canActOnStage,
  onAdvance,
  onSelectContext,
  onAskAi,
}: {
  approvals: ApprovalStage[]
  role: StudioRole
  canActOnStage: (stage: ApprovalStage) => boolean
  onAdvance: (id: ApprovalStage['id']) => void
  onSelectContext?: (ctx: SelectionContext) => void
  onAskAi?: (prompt: string) => void
}) {
  const perms = roleById(role)

  function selectApproval(step: ApprovalStage) {
    onSelectContext?.({
      kind: 'approval',
      ids: [step.id],
      labels: [step.label],
      summary: `Approval step: ${step.label} (${step.status})`,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="page-header !gap-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Approval flow
        </h2>
        <p className="text-sm text-muted">
          Draft → Brand Review → Legal → Ready for Production
        </p>
      </header>

      <p className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-[12px] text-muted shadow-[var(--shadow-soft)]">
        Viewing as <span className="font-medium text-foreground">{perms.label}</span>
        {' · '}
        {perms.canCreate && 'can create · '}
        {perms.canApprove && 'can approve · '}
        {!perms.canCreate && !perms.canApprove && 'view only · '}
        {perms.focus}
      </p>

      <ol className="space-y-3">
        {approvals.map((step, index) => {
          const actionable = canActOnStage(step)
          return (
            <li key={step.id}>
              <article
                className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                tabIndex={0}
                onClick={() => selectApproval(step)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectApproval(step)
                  }
                }}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                    {step.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {index + 1}. {step.label}
                      </h3>
                      <StatusBadge tone={approvalTone[step.status]} dot={false}>
                        {step.status}
                      </StatusBadge>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted">{step.owner}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground">
                      {step.note}
                    </p>
                    <p className="meta mt-1.5">{step.time}</p>
                    {onAskAi && (
                      <button
                        type="button"
                        className="mt-2 text-[11px] font-medium text-brand-700 hover:text-brand-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          selectApproval(step)
                          onAskAi(
                            step.id === 'legal'
                              ? 'Add legal approval before publishing.'
                              : `What does Brand Memory expect at “${step.label}”?`,
                          )
                        }}
                      >
                        Ask AI
                      </button>
                    )}
                  </div>
                </div>

                {actionable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAdvance(step.id)
                    }}
                    className="btn-primary shrink-0 !px-3 !py-1.5 text-[12px]"
                  >
                    {step.id === 'draft'
                      ? 'Submit draft'
                      : step.id === 'brand'
                        ? 'Approve brand'
                        : 'Approve legal'}
                  </button>
                )}

                {!actionable &&
                  step.status !== 'Done' &&
                  step.status !== 'Ready' &&
                  (step.id === 'brand' || step.id === 'legal') &&
                  !perms.canApprove && (
                    <p className="shrink-0 text-[11px] text-muted">
                      Brand Lead approves
                    </p>
                  )}
              </article>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ConnectorsPanel({
  connectors,
  connectingId,
  publishingId,
  canManage,
  onConnect,
  onPublish,
}: {
  connectors: Connector[]
  connectingId: string | null
  publishingId: string | null
  canManage: boolean
  onConnect: (id: string) => void
  onPublish: (id: string) => void
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="page-header !gap-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Enterprise connectors
        </h2>
        <p className="text-sm text-muted">
          {canManage
            ? 'Connect destinations and publish approved packages.'
            : 'View-only publish status. Company Admin manages connectors.'}
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {connectors.map((connector) => {
          const connected = connector.publishStatus !== 'Not connected'
          return (
            <li key={connector.id} className="surface-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[12px] font-semibold text-brand-700">
                  {connector.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {connector.label}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-muted">{connector.detail}</p>
                    </div>
                    <StatusBadge
                      tone={publishTone[connector.publishStatus]}
                      dot={false}
                    >
                      {connector.publishStatus}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {canManage && !connected && (
                      <button
                        type="button"
                        onClick={() => onConnect(connector.id)}
                        disabled={connectingId === connector.id}
                        className="btn-secondary !px-3 !py-1.5 text-[12px]"
                      >
                        {connectingId === connector.id ? 'Connecting…' : 'Connect'}
                      </button>
                    )}
                    {canManage && connected && (
                      <button
                        type="button"
                        onClick={() => onPublish(connector.id)}
                        disabled={
                          publishingId === connector.id ||
                          connector.publishStatus === 'Published' ||
                          connector.publishStatus === 'Syncing'
                        }
                        className="btn-primary !px-3 !py-1.5 text-[12px]"
                      >
                        {connector.publishStatus === 'Syncing'
                          ? 'Publishing…'
                          : connector.publishStatus === 'Published'
                            ? 'Published'
                            : 'Publish'}
                      </button>
                    )}
                    {connected && (
                      <StatusBadge tone="emerald" dot={false}>
                        Connected
                      </StatusBadge>
                    )}
                  </div>

                  {connectingId === connector.id && (
                    <div className="progress-track mt-3" aria-hidden="true">
                      <div className="progress-bar" />
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function GovernancePanel({
  memoryLock,
  requireLegal,
  onMemoryLock,
  onRequireLegal,
}: {
  memoryLock: boolean
  requireLegal: boolean
  onMemoryLock: (value: boolean) => void
  onRequireLegal: (value: boolean) => void
}) {
  return (
    <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-2">
      <section className="surface-card p-5">
        <p className="eyebrow">Workspace</p>
        <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-foreground">
          Governance controls
        </h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-[13px] font-medium text-foreground">Require Legal gate</p>
              <p className="text-[11px] text-muted">Brand Review → Legal → Production</p>
            </div>
            <button
              type="button"
              onClick={() => onRequireLegal(!requireLegal)}
              className={[
                'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                requireLegal
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {requireLegal ? 'On' : 'Off'}
            </button>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-[13px] font-medium text-foreground">Lock enterprise memory</p>
              <p className="text-[11px] text-muted">Only admins edit core brand rules</p>
            </div>
            <button
              type="button"
              onClick={() => onMemoryLock(!memoryLock)}
              className={[
                'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                memoryLock
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {memoryLock ? 'Locked' : 'Open'}
            </button>
          </li>
        </ul>
      </section>

      <section className="surface-card p-5">
        <p className="eyebrow">Brand memory</p>
        <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-foreground">
          Memory governance
        </h2>
        <ul className="mt-4 space-y-2.5 text-[12px] text-muted">
          <li className="rounded-xl bg-slate-50 px-3 py-2.5">
            Voice rules · single CTA · no hype — admin-managed
          </li>
          <li className="rounded-xl bg-slate-50 px-3 py-2.5">
            Approved campaign patterns available to Marketers on canvas
          </li>
          <li className="rounded-xl bg-slate-50 px-3 py-2.5">
            Brand Leads can flag inconsistencies; Admins merge into memory
          </li>
        </ul>
        <button type="button" className="btn-secondary mt-4 w-full text-[12px]">
          Open memory settings
        </button>
      </section>
    </div>
  )
}
