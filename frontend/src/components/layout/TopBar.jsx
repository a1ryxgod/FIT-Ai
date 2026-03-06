import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ title }) {
  const user = useAuthStore((s) => s.user)
  const { currentOrg } = useOrgStore()
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3.5 sticky top-0 z-30" style={{ background: 'rgba(20,20,22,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <h1 className="text-small font-semibold text-slate-100 md:text-base">{title}</h1>
        {currentOrg && (
          <p className="text-caption text-slate-600 hidden md:block">{currentOrg.name}</p>
        )}
      </div>
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2.5 hover:bg-surface-800 rounded-xl px-2.5 py-1.5 transition-colors"
      >
        <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center text-brand-400 text-small font-bold">
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-small font-semibold text-slate-200">{user?.username}</p>
          {currentOrg && (
            <p className="text-caption text-slate-500 capitalize">{currentOrg.role}</p>
          )}
        </div>
      </button>
    </header>
  )
}
