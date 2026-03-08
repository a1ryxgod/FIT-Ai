import { useQuery } from '@tanstack/react-query'
import Card, { CardHeader, StatCard } from '@/components/ui/Card'
import { SkeletonStatRow } from '@/components/ui/Skeleton'
import api from '@/api/axios'
import { Users, Activity, Dumbbell, UtensilsCrossed } from '../../utils/icons'

function useOrgStats() {
  return useQuery({
    queryKey: ['org-stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/orgs/current/stats/')
        return data
      } catch {
        return { members_count: 0, active_sessions_today: 0, workouts_this_week: 0, food_logs_today: 0 }
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export default function OwnerDashboard() {
  const { data: stats, isLoading } = useOrgStats()

  const items = [
    { label: 'Учасники',          value: stats?.members_count ?? 0,          icon: Users,          color: 'brand'  },
    { label: 'Активні сьогодні',  value: stats?.active_sessions_today ?? 0,  icon: Activity,       color: 'orange' },
    { label: 'Тренувань / тиждень',value: stats?.workouts_this_week ?? 0,    icon: Dumbbell,       color: 'green'  },
    { label: 'Записів їжі',       value: stats?.food_logs_today ?? 0,        icon: UtensilsCrossed,color: 'blue'   },
  ]

  return (
    <div className="mb-6">
      <p className="section-title">Огляд залу</p>
      {isLoading ? (
        <SkeletonStatRow />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map(({ label, value, icon, color }) => (
            <StatCard key={label} label={label} value={value} color={color} icon={icon} />
          ))}
        </div>
      )}

      {stats?.recent_activity?.length > 0 && (
        <Card className="mt-3">
          <CardHeader title="Остання активність" />
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
