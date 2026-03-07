import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { useOrgStore } from '@/store/orgStore'

const MEMBER_NAV = [
  { to: '/', label: 'Головна', exact: true },
  { to: '/workouts', label: 'Трен.' },
  { to: '/nutrition', label: 'Їжа' },
  { to: '/ai', label: 'AI' },
  { to: '/progress', label: 'Прогрес' },
  { to: '/profile', label: 'Профіль' },
]

const ADMIN_NAV = [
  { to: '/', label: 'Головна', exact: true },
  { to: '/workouts', label: 'Трен.' },
  { to: '/members', label: 'Учасники' },
  { to: '/ai', label: 'AI' },
  { to: '/progress', label: 'Прогрес' },
  { to: '/profile', label: 'Профіль' },
]

export default function MobileNav() {
  const { isAdmin } = useOrgStore()
  const NAV = isAdmin() ? ADMIN_NAV : MEMBER_NAV

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex" style={{ background: 'rgba(20,20,22,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {NAV.map(({ to, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className="flex flex-col items-center justify-center flex-1 py-3 relative"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-b-full" />
              )}
              <span className={clsx(
                'text-[11px] font-semibold tracking-wide transition-colors',
                isActive ? 'text-brand-400' : 'text-slate-600'
              )}>
                {label.toUpperCase()}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
