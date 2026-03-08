import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler,
} from 'chart.js'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Tabs from '@/components/ui/Tabs'
import { useWeightHistory, useLogWeight } from '@/hooks/useProgress'
import { usePersonalRecords } from '@/hooks/useWorkouts'
import { formatDate, round1 } from '@/utils/helpers'
import {
  Scale, TrendingUp, TrendingDown, ArrowDown, ArrowUp,
  Trophy, ChevronLeft, ChevronRight, Plus,
} from '../../utils/icons'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const MUSCLE_COLORS = {
  chest: 'text-red-400',
  back: 'text-blue-400',
  legs: 'text-emerald-400',
  shoulders: 'text-purple-400',
  arms: 'text-amber-400',
  core: 'text-cyan-400',
}

export default function Progress() {
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useWeightHistory({ page, page_size: 20 })
  const { data: prs = [], isLoading: prsLoading } = usePersonalRecords()

  const logs = data?.results ?? []
  const totalPages = Math.ceil((data?.count ?? 0) / 20)

  const sortedDesc = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  const sortedAsc = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date))

  const latest = sortedDesc[0]?.weight
  const oldest = sortedAsc[0]?.weight
  const diff = latest != null && oldest != null ? round1(latest - oldest) : null
  const min = logs.length ? round1(Math.min(...logs.map((l) => l.weight))) : null
  const max = logs.length ? round1(Math.max(...logs.map((l) => l.weight))) : null

  const chartData = {
    labels: sortedAsc.map((l) => formatDate(l.date)),
    datasets: [{
      label: 'Вага (кг)',
      data: sortedAsc.map((l) => l.weight),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
      pointHoverRadius: 6,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        callbacks: {
          label: (ctx) => `Вага: ${ctx.parsed.y} кг`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 11 } }, grid: { color: '#334155' } },
      y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#334155' } },
    },
  }

  const [activeTab, setActiveTab] = useState('weight')
  const progressTabs = [
    { id: 'weight', label: 'Вага', icon: Scale },
    { id: 'prs',    label: 'Рекорди', icon: Trophy },
  ]

  return (
    <Layout title="Прогрес">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Прогрес</h2>
        <Button onClick={() => setShowModal(true)} size="sm" icon={Plus}>Внести вагу</Button>
      </div>

      <Tabs tabs={progressTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'weight' && (
      <>
      {/* Stats Row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Поточна" value={latest ?? '—'} unit="кг" color="brand" icon={Scale} />
          <StatCard
            label="Зміна"
            value={diff != null ? (diff > 0 ? `+${diff}` : diff) : '—'}
            unit={diff != null ? 'кг' : ''}
            color={diff == null ? 'brand' : diff <= 0 ? 'green' : 'red'}
            icon={diff == null || diff <= 0 ? TrendingDown : TrendingUp}
          />
          <StatCard label="Мін" value={min ?? '—'} unit={min != null ? 'кг' : ''} color="green" icon={ArrowDown} />
          <StatCard label="Макс" value={max ?? '—'} unit={max != null ? 'кг' : ''} color="red"   icon={ArrowUp}   />
        </div>
      )}

      {/* Chart */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Записів ваги ще немає"
          description="Починайте відстежувати вагу, щоб бачити прогрес"
          action="Внести вагу"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader title="Динаміка ваги" subtitle={`${logs.length} записів`} icon={TrendingUp} />
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader title="Історія" />
            <div className="space-y-2">
              {sortedDesc.map((log, i) => {
                const prev = sortedDesc[i + 1]
                const delta = prev ? round1(log.weight - prev.weight) : null
                const up = delta > 0
                const down = delta < 0
                return (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0">
                    <span className="text-sm text-slate-400">{formatDate(log.date)}</span>
                    <div className="flex items-center gap-3">
                      {delta !== null && (
                        <span className={`flex items-center gap-0.5 text-xs ${down ? 'text-emerald-400' : up ? 'text-red-400' : 'text-slate-500'}`}>
                          {down ? <TrendingDown className="h-3 w-3" /> : up ? <TrendingUp className="h-3 w-3" /> : null}
                          {Math.abs(delta)}
                        </span>
                      )}
                      <span className="font-medium text-slate-200">{log.weight} кг</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Попередня</Button>
                <span className="flex items-center text-sm text-slate-400">{page} / {totalPages}</span>
                <Button variant="secondary" size="sm" iconRight={ChevronRight} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Наступна</Button>
              </div>
            )}
          </Card>
        </>
      )}
      </>
      )}

      {/* Personal Records Tab */}
      {activeTab === 'prs' && (
        <div>
          {prsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : prs.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Рекордів ще немає"
              description="Завершіть тренування, щоб побачити особисті рекорди"
            />
          ) : (
            <Card>
              <div className="space-y-0">
                {prs.map((pr, i) => (
                  <div key={pr.exercise_id} className="flex items-center gap-3 py-3 border-b border-surface-700 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === 0 ? 'bg-amber-500/15' : 'bg-surface-700'}`}>
                      {i === 0
                        ? <Trophy className="h-4 w-4 text-amber-400" />
                        : <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-sm truncate">{pr.exercise_name}</p>
                      <p className={`text-xs capitalize ${MUSCLE_COLORS[pr.muscle_group] ?? 'text-slate-500'}`}>
                        {pr.muscle_group ?? 'Інше'} · {formatDate(pr.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-100 text-sm">{pr.best_weight} кг × {pr.best_reps}</p>
                      <p className="text-xs text-slate-500">1RM ≈ <span className="text-brand-400 font-semibold">{pr.estimated_1rm} кг</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <LogWeightModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </Layout>
  )
}

function LogWeightModal({ isOpen, onClose }) {
  const [weight, setWeight] = useState('')
  const logWeight = useLogWeight()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weight) return
    await logWeight.mutateAsync({ weight: parseFloat(weight) })
    setWeight('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Внести вагу">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Вага (кг)"
          type="number"
          step="0.1"
          min="1"
          max="500"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="75.5"
          required
          autoFocus
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} type="button" fullWidth>Скасувати</Button>
          <Button type="submit" loading={logWeight.isPending} fullWidth>Внести вагу</Button>
        </div>
      </form>
    </Modal>
  )
}
