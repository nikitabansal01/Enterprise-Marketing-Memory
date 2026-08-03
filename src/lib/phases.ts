export type Phase = 'p0' | 'p1' | 'p2'

export const PHASES: {
  id: Phase
  name: string
  stage: string
}[] = [
  { id: 'p0', name: 'Enterprise Marketing Memory', stage: 'MVP - P0' },
  { id: 'p1', name: 'Campaign Studio', stage: 'P1' },
  { id: 'p2', name: 'Marketing Intelligence', stage: 'P2' },
]

export function isPhase(value: string | undefined): value is Phase {
  return value === 'p0' || value === 'p1' || value === 'p2'
}

export function phasePath(phase: Phase, path = ''): string {
  const clean = path.replace(/^\//, '')
  return clean ? `/${phase}/${clean}` : `/${phase}`
}

export function phaseIndex(phase: Phase): number {
  return PHASES.findIndex((item) => item.id === phase)
}

export function phaseFromPath(pathname: string): Phase {
  const segment = pathname.split('/').filter(Boolean)[0]
  return isPhase(segment) ? segment : 'p0'
}

export function restPath(pathname: string, phase: Phase): string {
  const prefix = `/${phase}`
  if (pathname === prefix) return ''
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length + 1)
  }
  return ''
}
