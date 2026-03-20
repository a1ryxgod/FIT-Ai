import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/store/themeStore'
import { useOrgStore } from '@/store/orgStore'
import {
  LayoutDashboard, Dumbbell, UtensilsCrossed, TrendingUp,
  Bot, User, Users, Building2, ClipboardList,
} from '../../utils/icons'

const MEMBER_NAV = [
  { to: '/',           label: 'Головна',     exact: true, icon: LayoutDashboard },
  { to: '/workouts',   label: 'Тренування',  icon: Dumbbell },
  { to: '/nutrition',  label: 'Харчування',  icon: UtensilsCrossed },
  { to: '/progress',   label: 'Прогрес',     icon: TrendingUp },
  { to: '/ai',         label: 'AI Тренер',   icon: Bot },
  { to: '/profile',    label: 'Профіль',     icon: User },
]

const TRAINER_NAV = [
  { to: '/',           label: 'Головна',     exact: true, icon: LayoutDashboard },
  { to: '/trainer',    label: 'Клієнти',     icon: ClipboardList },
  { to: '/workouts',   label: 'Тренування',  icon: Dumbbell },
  { to: '/nutrition',  label: 'Харчування',  icon: UtensilsCrossed },
  { to: '/progress',   label: 'Прогрес',     icon: TrendingUp },
  { to: '/ai',         label: 'AI Тренер',   icon: Bot },
  { to: '/profile',    label: 'Профіль',     icon: User },
]

const ADMIN_NAV = [
  { to: '/',           label: 'Головна',     exact: true, icon: LayoutDashboard },
  { to: '/members',    label: 'Учасники',    icon: Users },
  { to: '/trainer',    label: 'Клієнти',     icon: ClipboardList },
  { to: '/workouts',   label: 'Тренування',  icon: Dumbbell },
  { to: '/nutrition',  label: 'Харчування',  icon: UtensilsCrossed },
  { to: '/progress',   label: 'Прогрес',     icon: TrendingUp },
  { to: '/ai',         label: 'AI Тренер',   icon: Bot },
  { to: '/organizations', label: 'Організації', icon: Building2 },
  { to: '/profile',    label: 'Профіль',     icon: User },
]

export default function Sidebar() {
  const { theme } = useThemeStore()
  const { currentOrg, isAdmin, isTrainer } = useOrgStore()
  const NAV = isAdmin() ? ADMIN_NAV : isTrainer() ? TRAINER_NAV : MEMBER_NAV

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen sticky top-0 bg-surface-900/40 backdrop-blur-2xl border-r border-white/[0.04] z-40">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          {theme.logo ? (
            <img src={theme.logo} alt="logo" className="w-8 h-8 rounded-xl object-cover shadow-brand" />
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-heading font-bold text-white tracking-tighter bg-brand-500 shadow-brand">
              FT
            </div>
          )}
          <span className="font-heading font-semibold text-[18px] text-white tracking-tight">{theme.app_name}</span>
        </div>
        {currentOrg && (
          <div className="mt-5 px-4 py-3 rounded-xl bg-surface-800/50 border border-white/[0.04] backdrop-blur-sm">
            <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-widest mb-1">Організація</p>
            <p className="text-small font-medium text-slate-200 truncate">{currentOrg.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, exact, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-small font-medium transition-all duration-300 group',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/20 to-brand-500/5 border border-brand-500/20"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={clsx('h-4 w-4 flex-shrink-0 relative z-10 transition-colors duration-300', isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <span className="relative z-10 tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-white/[0.04] bg-surface-900/30">
        <p className="text-[11px] font-medium text-slate-500 tracking-wider">v1.1.0 · Elite AI</p>
      </div>
    </aside>
  )
}
