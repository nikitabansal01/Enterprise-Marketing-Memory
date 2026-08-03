import { useLocation } from 'react-router-dom'
import { isPhase, type Phase } from '../lib/phases'

function phaseFromPath(pathname: string): Phase {
  const segment = pathname.split('/').filter(Boolean)[0]
  return isPhase(segment) ? segment : 'p1'
}

export default function PhasePlaceholder() {
  const location = useLocation()
  const current = phaseFromPath(location.pathname)

  const copy =
    current === 'p1'
      ? {
          title: 'Campaign Studio',
          body: 'Collaborative creation on top of Enterprise Marketing Memory.',
        }
      : {
          title: 'Marketing Intelligence',
          body: 'Performance patterns that write winning campaigns back into memory.',
        }

  return (
    <div className="page-shell page-shell--narrow">
      <header className="page-header">
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.body}</p>
      </header>
    </div>
  )
}
