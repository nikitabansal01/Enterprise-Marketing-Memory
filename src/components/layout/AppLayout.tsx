import { Outlet, useLocation } from 'react-router-dom'
import { phaseFromPath } from '../../lib/phases'
import PhaseSwitcher from './PhaseSwitcher'
import Sidebar from './Sidebar'

function isStudioRoute(pathname: string) {
  return phaseFromPath(pathname) === 'p1'
}

export default function AppLayout() {
  const location = useLocation()
  const phase = phaseFromPath(location.pathname)
  const studio = isStudioRoute(location.pathname)

  return (
    <div className="flex h-full min-h-0">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <PhaseSwitcher />
        <main
          className={[
            'min-w-0 flex-1 bg-canvas',
            studio ? 'overflow-hidden p-0' : 'overflow-auto px-6 py-7 sm:px-8 lg:px-10',
          ].join(' ')}
        >
          <div
            key={studio ? 'p1-studio' : `${phase}:${location.pathname}`}
            className={studio ? 'page-enter h-full min-h-0' : 'page-enter min-h-full'}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
