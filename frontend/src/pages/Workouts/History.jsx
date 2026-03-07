import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { useWorkoutHistory } from '@/hooks/useWorkouts'
import { formatDate } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useOrgStore } from '@/store/orgStore'

export default function WorkoutHistory() {
  const navigate = useNavigate()
  const { isAdmin } = useOrgStore()
  const admin = isAdmin()
  const [page, setPage] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const params = { page, page_size: 10, ...(admin && showAll ? { all: 1 } : {}) }
  const { data, isLoading } = useWorkoutHistory(params)

  const sessions = data?.results ?? []
  const totalPages = Math.ceil((data?.count ?? 0) / 10)

  return (
    <Layout title="Історія тренувань">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Історія</h2>
        <div className="flex items-center gap-2">
          {admin && (
            <button
              onClick={() => { setShowAll((v) => !v); setPage(1) }}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                showAll
                  ? 'text-brand-400 border border-brand-500/30'
                  : 'text-slate-500 border border-transparent hover:text-slate-300'
              }`}
              style={showAll ? { background: 'rgba(var(--brand-500),0.1)' } : {}}
            >
              {showAll ? 'Всі учасники' : 'Моя історія'}
            </button>
          )}
          <Button onClick={() => navigate('/workouts')} variant="secondary" size="sm">
            Назад
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Історія тренувань порожня"
          description="Завершіть перше тренування, щоб побачити його тут"
          action="Розпочати тренування"
          onAction={() => navigate('/workouts')}
        />
      ) : (
        <>
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader
                  title={formatDate(session.date)}
                  subtitle={
                    showAll && session.user_username
                      ? `${session.user_username} · ${session.program ? `Програма: ${session.program}` : 'Вільна сесія'}`
                      : session.program ? `Програма: ${session.program}` : 'Вільна сесія'
                  }
                  action={
                    <span className={`badge ${session.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-surface-700 text-slate-400'}`}>
                      {session.is_active ? 'Активна' : 'Завершена'}
                    </span>
                  }
                />
                {session.sets && session.sets.length > 0 ? (
                  <div className="space-y-1.5 mt-2">
                    {session.sets.map((set, i) => (
                      <div key={set.id ?? i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{set.exercise?.name ?? 'Вправа'}</span>
                        <span className="text-slate-400">{set.reps} × {set.weight}кг</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Підходів не внесено</p>
                )}
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Попередня
              </Button>
              <span className="flex items-center text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Наступна
              </Button>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
