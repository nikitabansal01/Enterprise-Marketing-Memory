import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import StatusBadge from '../components/ui/StatusBadge'
import { useAiConversation } from '../lib/aiConversation'
import { usePhaseHref } from '../lib/usePhase'

type CheckStatus = 'pass' | 'review' | 'fail'

type BrandCheck = {
  id: string
  label: string
  detail: string
  status: CheckStatus
  evidence: string
}

type FitAsset = {
  id: string
  format: string
  title: string
  headline: string
  status: CheckStatus
}

const DEFAULT_ASSETS: FitAsset[] = [
  {
    id: 'social',
    format: 'LinkedIn post',
    title: 'Social — draft 1',
    headline: 'Keep every campaign on-brand.',
    status: 'pass',
  },
  {
    id: 'banner',
    format: '728×90 banner',
    title: 'Banner — draft 1',
    headline: 'One brief. On-brand assets across channels.',
    status: 'pass',
  },
  {
    id: 'flyer',
    format: 'One-page flyer',
    title: 'Flyer — draft 1',
    headline: 'See what enterprise teams already proved works.',
    status: 'review',
  },
]

const DEFAULT_CHECKS: BrandCheck[] = [
  {
    id: 'voice',
    label: 'Brand voice',
    detail: 'Plainspoken, concrete verbs, no hype.',
    status: 'pass',
    evidence: 'Matched approved voice rules from brand memory.',
  },
  {
    id: 'cta',
    label: 'CTA treatment',
    detail: 'One primary action per asset.',
    status: 'pass',
    evidence: 'Single-CTA channel guidance applied.',
  },
  {
    id: 'visual',
    label: 'Visual system',
    detail: 'Color, type, and spacing from the design system.',
    status: 'pass',
    evidence: 'Typography scale and brand palette verified.',
  },
  {
    id: 'claims',
    label: 'Claims & disclaimers',
    detail: 'No unsubstantiated superiority language.',
    status: 'review',
    evidence: 'Flyer headline needs a quick claim check before publish.',
  },
  {
    id: 'audience',
    label: 'Audience fit',
    detail: 'Messaging matches the confirmed primary audience.',
    status: 'pass',
    evidence: 'Aligned to enterprise marketing leaders from the brief.',
  },
]

function statusTone(status: CheckStatus): 'emerald' | 'amber' | 'rose' {
  if (status === 'pass') return 'emerald'
  if (status === 'review') return 'amber'
  return 'rose'
}

function statusLabel(status: CheckStatus): string {
  if (status === 'pass') return 'Passed'
  if (status === 'review') return 'Needs review'
  return 'Blocked'
}

export default function Validate() {
  const navigate = useNavigate()
  const exportHref = usePhaseHref('export')
  const {
    assets,
    understanding,
    isExploratoryDraft,
    openCampaignWorkflowStep,
  } = useAiConversation()

  const fitAssets = useMemo<FitAsset[]>(() => {
    if (assets.length === 0) return DEFAULT_ASSETS
    return assets.map((asset, index) => ({
      id: asset.id,
      format: asset.format,
      title: asset.title,
      headline: asset.headline,
      status: index === assets.length - 1 ? 'review' : 'pass',
    }))
  }, [assets])

  const [checks, setChecks] = useState<BrandCheck[]>(DEFAULT_CHECKS)
  const [assetStates, setAssetStates] = useState<FitAsset[]>(fitAssets)

  useEffect(() => {
    setAssetStates(fitAssets)
  }, [fitAssets])

  const passed = checks.filter((check) => check.status === 'pass').length
  const needsReview = [
    ...checks.filter((check) => check.status === 'review'),
    ...assetStates.filter((asset) => asset.status === 'review'),
  ]
  const score = Math.round((passed / checks.length) * 100)
  const canContinue = needsReview.length === 0 || checks.every((c) => c.status !== 'fail')

  function approveCheck(id: string) {
    setChecks((prev) =>
      prev.map((check) =>
        check.id === id ? { ...check, status: 'pass' as const } : check,
      ),
    )
  }

  function approveAsset(id: string) {
    setAssetStates((prev) =>
      prev.map((asset) =>
        asset.id === id ? { ...asset, status: 'pass' as const } : asset,
      ),
    )
  }

  function approveAllReviews() {
    setChecks((prev) =>
      prev.map((check) =>
        check.status === 'review' ? { ...check, status: 'pass' as const } : check,
      ),
    )
    setAssetStates((prev) =>
      prev.map((asset) =>
        asset.status === 'review' ? { ...asset, status: 'pass' as const } : asset,
      ),
    )
  }

  return (
    <div className="page-shell page-shell--narrow pb-10">
      <header className="page-header">
        <h1 className="page-title">Confirm Brand Fit</h1>
        <p className="page-subtitle">
          Check every asset against marketing memory before it ships.
        </p>
      </header>

      {isExploratoryDraft && (
        <div className="exploratory-banner mb-5" role="status">
          <div>
            <p className="exploratory-banner__label">
              Exploratory draft — brand checks use temporary styling
            </p>
            <p className="meta mt-1">
              Connect a verified brand system to raise confidence on voice and visuals.
            </p>
          </div>
        </div>
      )}

      <section className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Brand-fit score</p>
            <p className="mt-1 text-[13px] text-muted">
              {understanding?.objective
                ? understanding.objective
                : 'Selected campaign direction checked against enterprise memory.'}
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[2.5rem] font-semibold tracking-tight tabular-nums text-foreground">
              {score}
            </span>
            <span className="text-sm font-medium text-muted">/ 100</span>
          </div>
        </div>
        <div className="mt-4">
          <ConfidenceBar
            value={score}
            tone={score >= 85 ? 'emerald' : 'amber'}
            size="lg"
            caption="brand fit"
            label="Brand-fit score"
          />
        </div>
        <p className="mt-3 text-[12px] text-muted">
          {passed} of {checks.length} memory checks passed
          {needsReview.length > 0 ? ` · ${needsReview.length} need your call` : ''}
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-label">Assets in this package</h2>
          <p className="meta">{assetStates.length} assets</p>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-[0.875rem] border border-border bg-surface shadow-soft">
          {assetStates.map((asset) => (
            <li
              key={asset.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="eyebrow">{asset.format}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{asset.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-muted">{asset.headline}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={statusTone(asset.status)} dot>
                  {statusLabel(asset.status)}
                </StatusBadge>
                {asset.status === 'review' && (
                  <button
                    type="button"
                    className="btn-secondary !px-2.5 !py-1 text-[11px]"
                    onClick={() => approveAsset(asset.id)}
                  >
                    Approve
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="section-label">Checks from marketing memory</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-[0.875rem] border border-border bg-surface shadow-soft">
          {checks.map((check) => (
            <li
              key={check.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <StatusBadge tone={statusTone(check.status)} dot>
                    {statusLabel(check.status)}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{check.detail}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {check.evidence}
                </p>
              </div>
              {check.status === 'review' && (
                <button
                  type="button"
                  className="btn-secondary shrink-0 !px-2.5 !py-1 text-[11px]"
                  onClick={() => approveCheck(check.id)}
                >
                  Looks right
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {needsReview.length > 0 && (
        <section className="mt-5 rounded-[0.875rem] border border-amber-200 bg-amber-50 px-4 py-3.5">
          <p className="text-[13px] font-medium text-amber-900">Needs your input</p>
          <ul className="mt-2 space-y-1 text-[12px] text-amber-800">
            {checks
              .filter((check) => check.status === 'review')
              .map((check) => (
                <li key={check.id}>· {check.label}</li>
              ))}
            {assetStates
              .filter((asset) => asset.status === 'review')
              .map((asset) => (
                <li key={asset.id}>· {asset.format} still needs review</li>
              ))}
          </ul>
          <button
            type="button"
            className="btn-secondary mt-3 !px-3 !py-1.5 text-[12px]"
            onClick={approveAllReviews}
          >
            Approve remaining items
          </button>
        </section>
      )}

      <div className="mt-7 flex flex-wrap gap-2.5">
        <Link
          to={exportHref}
          className={[
            'btn-primary px-6 py-3.5',
            canContinue ? '' : 'pointer-events-none opacity-40',
          ].join(' ')}
          aria-disabled={!canContinue}
        >
          Continue to export
        </Link>
        <button
          type="button"
          className="btn-secondary px-6 py-3.5"
          onClick={() => {
            openCampaignWorkflowStep('drafts')
            navigate('/p0')
          }}
        >
          Back to drafts
        </button>
      </div>
    </div>
  )
}
