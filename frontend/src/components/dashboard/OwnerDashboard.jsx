import { useQuery } from '@tanstack/react-query'
import Card, { CardHeader } from '@/components/ui/Card'
import { SkeletonStatRow, SkeletonCard } from '@/components/ui/Skeleton'
import api from '@/api/axios'

function useOrgStats() {
  return useQuery({
    queryKey: ['org-stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/orgs/current/stats/')
        return data
      } catch {
        // Graceful fallback if endpoint not yet implemented
        return { members_count: 0, active_sessions_today: 0, workouts_this_week: 0 }
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export default function OwnerDashboard() {
  const { data: stats, isLoading } = useOrgStats()

  const items = [
    { label: 'Members', value: stats?.members_count ?? 0, icon: '👥', color: 'text-brand-400' },
    { label: 'Active Today', value: stats?.active_sessions_today ?? 0, icon: '🔥', color: 'text-orange-400' },
    { label: 'Workouts / Week', value: stats?.workouts_this_week ?? 0, icon: '💪', color: 'text-emerald-400' },
    { label: 'Food Logs Today', value: stats?.food_logs_today ?? 0, icon: '🍽️', color: 'text-blue-400' },
  ]

  return (
    <div className="mb-6">
      <p className="section-title">Gym Overview</p>
      {isLoading ? (
        <SkeletonStatRow />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map(({ label, value, icon, color }) => (
            <Card key={label} className="text-center py-3">
              <div className="text-2xl mb-1">{icon}</div>
              <p className={`text-h2 font-bold ${color}`}>{value}</p>
              <p className="text-caption text-slate-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Member activity table */}
      {stats?.recent_activity?.length > 0 && (
        <Card className="mt-3">
          <CardHeader title="Recent Activity" />
          <div className="space-y-2">
            {stats.recent_activity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-surface-700 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-surface-700 rounded-full flex items-center justify-center text-caption font-bold text-slate-400">
                    {item.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-small text-slate-300">{item.username}</span>
                </div>
                <span className="text-caption text-slate-500">{item.action}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
