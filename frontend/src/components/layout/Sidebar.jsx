import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { useThemeStore } from '@/store/themeStore'
import { useOrgStore } from '@/store/orgStore'

const MEMBER_NAV = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/workouts', label: 'Workouts' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/progress', label: 'Progress' },
  { to: '/ai', label: 'AI Coach' },
  { to: '/profile', label: 'Profile' },
]

const ADMIN_NAV = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/members', label: 'Members' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/progress', label: 'Progress' },
  { to: '/ai', label: 'AI Coach' },
  { to: '/organizations', label: 'Organizations' },
  { to: '/profile', label: 'Profile' },
]

export default function Sidebar() {
  const { theme } = useThemeStore()
  const { currentOrg, isAdmin } = useOrgStore()
  const NAV = isAdmin() ? ADMIN_NAV : MEMBER_NAV

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen sticky top-0" style={{ background: 'rgba(20,20,22,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Wordmark / Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          {theme.logo ? (
            <img src={theme.logo} alt="logo" className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white tracking-tight"
              style={{ background: 'rgb(var(--brand-500))' }}>
              FT
            </div>
          )}
          <span className="font-bold text-[15px] text-white tracking-tight">{theme.app_name}</span>
        </div>
        {currentOrg && (
          <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Org</p>
            <p className="text-small font-medium text-slate-200 truncate mt-0.5">{currentOrg.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-small font-medium transition-all duration-150',
                isActive
                  ? 'text-brand-400'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              )
            }
            style={({ isActive }) => isActive ? { background: 'rgba(var(--brand-500), 0.1)', border: '1px solid rgba(var(--brand-500), 0.15)' } : {}}
          >
            {({ isActive }) => (
              <>
                <span>{label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-caption text-slate-600">v1.0.0 · FitTrack SaaS</p>
      </div>
    </aside>
  )
}
