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
import { useWeightHistory, useLogWeight } from '@/hooks/useProgress'
import { usePersonalRecords } from '@/hooks/useWorkouts'
import { formatDate, round1 } from '@/utils/helpers'

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
      label: 'Weight (kg)',
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
          label: (ctx) => `Weight: ${ctx.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 11 } }, grid: { color: '#334155' } },
      y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#334155' } },
    },
  }

  return (
    <Layout title="Progress">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Weight Tracking</h2>
        <Button onClick={() => setShowModal(true)} size="sm">+ Log Weight</Button>
      </div>

      {/* Stats Row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Current" value={latest ?? '—'} unit="kg" color="brand" />
          <StatCard
            label="Change"
            value={diff != null ? (diff > 0 ? `+${diff}` : diff) : '—'}
            unit={diff != null ? 'kg' : ''}
            color={diff == null ? 'brand' : diff <= 0 ? 'green' : 'red'}
          />
          <StatCard label="Min" value={min ?? '—'} unit={min != null ? 'kg' : ''} color="green" />
          <StatCard label="Max" value={max ?? '—'} unit={max != null ? 'kg' : ''} color="red" />
        </div>
      )}

      {/* Chart */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No weight logs yet"
          description="Start tracking your weight to see progress over time"
          action="Log Weight"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader title="Weight Over Time" subtitle={`${logs.length} entries`} />
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader title="History" />
            <div className="space-y-2">
              {sortedDesc.map((log, i) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0">
                  <span className="text-sm text-slate-400">{formatDate(log.date)}</span>
                  <div className="flex items-center gap-3">
                    {i < sortedDesc.length - 1 && (
                      <span className={`text-xs ${log.weight < sortedDesc[i + 1].weight ? 'text-emerald-400' : log.weight > sortedDesc[i + 1].weight ? 'text-red-400' : 'text-slate-500'}`}>
                        {log.weight < sortedDesc[i + 1].weight ? '▼' : log.weight > sortedDesc[i + 1].weight ? '▲' : '—'}
                        {' '}
                        {Math.abs(round1(log.weight - sortedDesc[i + 1].weight))}
                      </span>
                    )}
                    <span className="font-medium text-slate-200">{log.weight} kg</span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="flex items-center text-sm text-slate-400">{page} / {totalPages}</span>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Personal Records */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Personal Records</h2>
        {prsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : prs.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 text-center py-4">No workout data yet. Complete a workout to see your records.</p>
          </Card>
        ) : (
          <Card>
            <div className="space-y-0">
              {prs.map((pr, i) => (
                <div key={pr.exercise_id} className="flex items-center gap-3 py-3 border-b border-surface-700 last:border-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-slate-400 shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {i === 0 ? '🏆' : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 text-sm truncate">{pr.exercise_name}</p>
                    <p className={`text-xs capitalize ${MUSCLE_COLORS[pr.muscle_group] ?? 'text-slate-500'}`}>
                      {pr.muscle_group ?? 'Other'} · {formatDate(pr.date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-100 text-sm">{pr.best_weight} kg × {pr.best_reps}</p>
                    <p className="text-xs text-slate-500">1RM ≈ <span className="text-brand-400 font-semibold">{pr.estimated_1rm} kg</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

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
    <Modal isOpen={isOpen} onClose={onClose} title="Log Weight">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Weight (kg)"
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
          <Button variant="secondary" onClick={onClose} type="button" fullWidth>Cancel</Button>
          <Button type="submit" loading={logWeight.isPending} fullWidth>Log Weight</Button>
        </div>
      </form>
    </Modal>
  )
}
