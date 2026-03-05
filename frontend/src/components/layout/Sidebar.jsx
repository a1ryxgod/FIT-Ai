import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { useThemeStore } from '@/store/themeStore'
import { useOrgStore } from '@/store/orgStore'

const NAV = [
  { to: '/', icon: '🏠', label: 'Dashboard', exact: true },
  { to: '/workouts', icon: '💪', label: 'Workouts' },
  { to: '/nutrition', icon: '🍎', label: 'Nutrition' },
  { to: '/progress', icon: '📈', label: 'Progress' },
  { to: '/organizations', icon: '🏢', label: 'Organizations' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

export default function Sidebar() {
  const { theme } = useThemeStore()
  const { currentOrg } = useOrgStore()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-900 border-r border-surface-700/60 min-h-screen sticky top-0">
      {/* Logo / App name */}
      <div className="px-5 py-6 border-b border-surface-700/60">
        <div className="flex items-center gap-3">
          {theme.logo ? (
            <img src={theme.logo} alt="logo" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏋️</span>
            </div>
          )}
          <div>
            <span className="font-bold text-base text-white">{theme.app_name}</span>
          </div>
        </div>
        {currentOrg && (
          <div className="mt-3 px-3 py-2 bg-surface-800 rounded-xl">
            <p className="text-caption text-slate-500 uppercase tracking-wide">Current Org</p>
            <p className="text-small font-medium text-slate-200 truncate mt-0.5">{currentOrg.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-small font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-surface-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx('text-base', isActive && 'scale-110 inline-block')}>{icon}</span>
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <div className="px-5 py-4 border-t border-surface-700/60">
        <p className="text-caption text-slate-600">v1.0.0 · FitTrack SaaS</p>
      </div>
    </aside>
  )
}
