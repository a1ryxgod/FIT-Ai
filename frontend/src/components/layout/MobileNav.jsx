import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { useOrgStore } from '@/store/orgStore'
import {
  LayoutDashboard, Dumbbell, UtensilsCrossed,
  TrendingUp, Bot, User, Users, ClipboardList,
} from '../../utils/icons'

const MEMBER_NAV = [
  { to: '/',          label: 'Головна',  exact: true, icon: LayoutDashboard },
  { to: '/workouts',  label: 'Трен.',    icon: Dumbbell },
  { to: '/nutrition', label: 'Їжа',      icon: UtensilsCrossed },
  { to: '/ai',        label: 'AI',       icon: Bot },
  { to: '/progress',  label: 'Прогрес',  icon: TrendingUp },
  { to: '/profile',   label: 'Профіль',  icon: User },
]

const TRAINER_NAV = [
  { to: '/',          label: 'Головна',  exact: true, icon: LayoutDashboard },
  { to: '/trainer',   label: 'Клієнти',  icon: ClipboardList },
  { to: '/workouts',  label: 'Трен.',    icon: Dumbbell },
  { to: '/ai',        label: 'AI',       icon: Bot },
  { to: '/progress',  label: 'Прогрес',  icon: TrendingUp },
  { to: '/profile',   label: 'Профіль',  icon: User },
]

const ADMIN_NAV = [
  { to: '/',          label: 'Головна',  exact: true, icon: LayoutDashboard },
  { to: '/workouts',  label: 'Трен.',    icon: Dumbbell },
  { to: '/members',   label: 'Учасники', icon: Users },
  { to: '/trainer',   label: 'Клієнти',  icon: ClipboardList },
  { to: '/ai',        label: 'AI',       icon: Bot },
  { to: '/profile',   label: 'Профіль',  icon: User },
]

export default function MobileNav() {
  const { isAdmin, isTrainer } = useOrgStore()
  const NAV = isAdmin() ? ADMIN_NAV : isTrainer() ? TRAINER_NAV : MEMBER_NAV

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: 'rgba(20,20,22,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV.map(({ to, label, exact, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className="flex flex-col items-center justify-center flex-1 py-2.5 relative min-h-[56px] gap-1"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full bg-brand-500"
                  style={{ width: 28 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className={clsx(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-brand-400' : 'text-slate-600'
                )} />
              </motion.div>
              <span className={clsx(
                'text-[10px] font-semibold tracking-wide transition-colors',
                isActive ? 'text-brand-400' : 'text-slate-600'
              )}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
