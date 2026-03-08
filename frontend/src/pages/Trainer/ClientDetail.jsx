import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { SkeletonList } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import {
  useTrainerClients,
  useTrainerClientSessions,
  useTrainerClientPRs,
  useCreateClientProgram,
} from '@/hooks/useTrainer'
import { formatDate } from '@/utils/helpers'
import {
  ChevronLeft, User, Calendar, Activity, Dumbbell, Trophy,
  Plus, ChevronRight, ChevronDown, BarChart3,
} from '../../utils/icons'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [showCreateProgram, setShowCreateProgram] = useState(false)
  const [expandedSession, setExpandedSession] = useState(null)

  const { data: clients = [] } = useTrainerClients()
  const client = clients.find((c) => c.id === id)

  const { data: sessionsData, isLoading: loadingSessions } = useTrainerClientSessions(id, { page })
  const sessions = sessionsData?.results ?? sessionsData ?? []
  const totalPages = sessionsData?.total_pages ?? 1

  const { data: prs = [], isLoading: loadingPRs } = useTrainerClientPRs(id)

  const createProgram = useCreateClientProgram()

  const handleCreateProgram = async (name) => {
    await createProgram.mutateAsync({ name, assigned_to: id })
    setShowCreateProgram(false)
  }

  return (
    <Layout title={client?.username ?? 'Клієнт'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/trainer')} className="p-2 rounded-xl hover:bg-surface-700 transition-colors">
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(var(--brand-500),0.1)', border: '1px solid rgba(var(--brand-500),0.15)' }}>
          <User className="h-5 w-5 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-h2 truncate">{client?.username ?? 'Клієнт'}</h2>
          <p className="text-caption text-slate-500">{client?.email}</p>
        </div>
      </div>

      {/* Stats */}
      {client && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={Dumbbell} value={client.total_sessions} label="Всього" />
          <StatCard icon={Activity} value={client.workouts_this_week} label="Цей тиждень" />
          <StatCard
            icon={Calendar}
            value={client.last_workout_date
              ? new Date(client.last_workout_date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
              : '—'
            }
            label="Останнє"
          />
        </div>
      )}

      {/* Personal Records */}
      <div className="flex items-center justify-between mb-3">
        <p className="section-title !mb-0">Персональні рекорди</p>
      </div>
      {loadingPRs ? (
        <SkeletonList count={3} />
      ) : prs.length === 0 ? (
        <Card className="mb-6">
          <p className="text-center text-slate-500 text-small py-2">Ще немає рекордів</p>
        </Card>
      ) : (
        <div className="space-y-1.5 mb-6">
          {prs.slice(0, 5).map((pr, idx) => (
            <Card key={pr.exercise_id} className="!p-3">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-surface-700 text-slate-500'
                }`}>
                  {idx === 0 ? <Trophy className="h-4 w-4" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-medium text-slate-200 truncate">{pr.exercise_name}</p>
                  <p className="text-caption text-slate-500">{pr.muscle_group}</p>
                </div>
                <div className="text-right">
                  <p className="text-small font-bold text-slate-100">{pr.best_weight}кг × {pr.best_reps}</p>
                  <p className="text-caption text-slate-500">1RM ≈ {pr.estimated_1rm}кг</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Program button */}
      <Button
        variant="secondary"
        icon={Plus}
        onClick={() => setShowCreateProgram(true)}
        fullWidth
        className="mb-6"
      >
        Створити програму для клієнта
      </Button>

      {/* Recent Sessions */}
      <p className="section-title">Останні тренування</p>
      {loadingSessions ? (
        <SkeletonList count={4} />
      ) : sessions.length === 0 ? (
        <EmptyState icon={BarChart3} title="Тренувань ще немає" description="Клієнт ще не почав тренуватись" />
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {sessions.map((session) => (
              <Card key={session.id} className="!p-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between"
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <div className="text-left">
                      <p className="text-small font-medium text-slate-200">
                        {formatDate(session.date)}
                      </p>
                      <p className="text-caption text-slate-500">
                        {session.sets?.length ?? 0} підходів
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${
                    expandedSession === session.id ? 'rotate-180' : ''
                  }`} />
                </button>

                {expandedSession === session.id && session.sets?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-surface-700/60 space-y-1.5"
                  >
                    {session.sets.map((set, i) => (
                      <div key={set.id ?? i} className="flex items-center justify-between text-caption">
                        <span className="text-slate-400">{set.exercise?.name}</span>
                        <span className="font-mono text-slate-300">{set.reps} × {set.weight}кг</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl hover:bg-surface-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </button>
              <span className="text-small text-slate-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl hover:bg-surface-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Program Modal */}
      <CreateProgramInline
        isOpen={showCreateProgram}
        onClose={() => setShowCreateProgram(false)}
        onCreate={handleCreateProgram}
        loading={createProgram.isPending}
      />
    </Layout>
  )
}


function StatCard({ icon: Icon, value, label }) {
  return (
    <Card className="text-center !py-3">
      <Icon className="h-4 w-4 text-brand-400 mx-auto mb-1" />
      <p className="text-lg font-bold text-slate-100">{value}</p>
      <p className="text-caption text-slate-500">{label}</p>
    </Card>
  )
}


function CreateProgramInline({ isOpen, onClose, onCreate, loading }) {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    onCreate(name)
    setName('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Нова програма">
      <div className="space-y-4">
        <Input
          label="Назва програми"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="напр. Сила — 3 дні"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>Скасувати</Button>
          <Button onClick={handleSubmit} loading={loading} fullWidth>Створити</Button>
        </div>
      </div>
    </Modal>
  )
}
