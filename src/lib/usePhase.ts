import { phaseFromPath, phasePath } from './phases'
import { useLocation } from 'react-router-dom'

export function usePhase() {
  const location = useLocation()
  return phaseFromPath(location.pathname)
}

export function usePhaseHref(path = '') {
  return phasePath(usePhase(), path)
}
