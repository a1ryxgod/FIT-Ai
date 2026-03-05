import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'

// 5 tabs matching industry standard (Nike TC, MyFitnessPal)
const NAV = [
  { to: '/', icon: '🏠', label: 'Home', exact: true },
  { to: '/workouts', icon: '💪', label: 'Train' },
  { to: '/nutrition', icon: '🍎', label: 'Eat' },
  { to: '/progress', icon: '📈', label: 'Progress' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-900/95 backdrop-blur-md border-t border-surface-700/60 flex">
      {NAV.map(({ to, icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all',
              isActive ? 'text-brand-500' : 'text-slate-600 active:text-slate-400'
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className={clsx('text-xl transition-transform', isActive && 'scale-110')}>{icon}</span>
              <span className={clsx('text-[10px] font-medium', isActive ? 'text-brand-500' : 'text-slate-600')}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-brand-500 rounded-t-full" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
