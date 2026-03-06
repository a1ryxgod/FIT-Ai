import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Link } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SkeletonStatRow, SkeletonCard } from '@/components/ui/Skeleton'
import OwnerDashboard from '@/components/dashboard/OwnerDashboard'
import { useTodaySummary } from '@/hooks/useNutrition'
import { useWeightHistory } from '@/hooks/useProgress'
import { useWorkoutHistory, usePersonalRecords } from '@/hooks/useWorkouts'
import { useProfileData } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { round1, macroPercent, formatDate } from '@/utils/helpers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const CHART_GRID  = { color: 'rgba(63,63,72,0.8)' }
const CHART_TICKS = { color: '#52525e', font: { size: 11, family: 'Inter' } }
const TOOLTIP_STYLE = { backgroundColor: '#1c1c22', borderColor: '#3f3f48', borderWidth: 1, titleColor: '#94a3b8', bodyColor: '#f1f5f9' }

export default function Dashboard() {
  const user     = useAuthStore((s) => s.user)
  const { currentOrg, isOwner, isAdmin } = useOrgStore()
  const { data: profile } = useProfileData()
  const { data: todayData,   isLoading: loadingToday    } = useTodaySummary()
  const { data: weightData,  isLoading: loadingWeight   } = useWeightHistory({ page_size: 14 })
  const { data: workoutData, isLoading: loadingWorkouts } = useWorkoutHistory({ page_size: 20 })
  const { data: prs = [] } = usePersonalRecords()

  const totals     = todayData?.totals ?? {}
  const weightLogs = weightData?.results ?? []
  const sessions   = workoutData?.results ?? []

  // Weekly workout count
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weeklyCount = sessions.filter((s) => new Date(s.date) >= weekStart).length
  const WEEKLY_GOAL = 5

  // Latest PR
  const latestPR = prs.length > 0
    ? [...prs].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null

  const weightChartData = {
    labels: [...weightLogs].reverse().map((w) => formatDate(w.date)),
    datasets: [{
      data: [...weightLogs].reverse().map((w) => w.weight),
      borderColor: 'rgb(var(--brand-500))',
      backgroundColor: 'rgba(var(--brand-500), 0.08)',
      fill: true, tension: 0.4,
      pointRadius: 3, pointBackgroundColor: 'rgb(var(--brand-500))',
      pointHoverRadius: 5,
    }],
  }

  const macros = macroPercent(totals)
  const macroChart = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{
      data: [macros.protein, macros.carbs, macros.fats],
      backgroundColor: ['rgb(var(--brand-500))', '#10b981', '#f59e0b'],
      borderWidth: 0, spacing: 2,
    }],
  }

  const calorieGoal = profile?.calorie_goal ?? 2000
  const caloriePct  = Math.min(100, Math.round(((totals.calories ?? 0) / calorieGoal) * 100))

  return (
    <Layout title="Dashboard">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-caption text-slate-500 uppercase tracking-wide">{getGreeting()}</p>
        <h2 className="text-h2 mt-0.5">{user?.username ?? 'Athlete'}</h2>
        {currentOrg && <p className="text-caption text-slate-500 mt-1">{currentOrg.name}</p>}
      </div>

      {/* Owner / Admin gym overview */}
      {(isOwner() || isAdmin()) && <OwnerDashboard />}

      {/* Today's nutrition */}
      <div className="mb-6">
        <p className="section-title">Today's Nutrition</p>
        {loadingToday ? <SkeletonStatRow /> : (
          <Card className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-caption text-slate-500">Calories</p>
                <p className="text-h2 font-bold text-white">
                  {round1(totals.calories ?? 0)}
                  <span className="text-small text-slate-500 font-normal ml-1">/ {calorieGoal} kcal</span>
                </p>
              </div>
              <Link to="/nutrition">
                <Button size="sm" variant="secondary">Log Food</Button>
              </Link>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${caloriePct}%`, background: 'rgb(var(--brand-500))' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Protein', value: round1(totals.protein ?? 0), unit: 'g', color: 'text-emerald-400' },
                { label: 'Carbs',   value: round1(totals.carbs   ?? 0), unit: 'g', color: 'text-amber-400'   },
                { label: 'Fats',    value: round1(totals.fats    ?? 0), unit: 'g', color: 'text-blue-400'    },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="text-center bg-surface-750 rounded-xl py-2">
                  <p className={`font-bold text-base ${color}`}>
                    {value}<span className="text-caption font-normal text-slate-500 ml-0.5">{unit}</span>
                  </p>
                  <p className="text-caption text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader
            title="Weight Trend"
            subtitle="Last 14 entries"
            action={<Link to="/progress"><Button size="sm" variant="ghost">All</Button></Link>}
          />
          {loadingWeight ? (
            <div className="h-40 skeleton rounded-xl" />
          ) : weightLogs.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-600">
              <p className="text-caption">No weight entries</p>
            </div>
          ) : (
            <div className="h-40">
              <Line data={weightChartData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
                scales: { x: { ticks: { ...CHART_TICKS, maxTicksLimit: 5 }, grid: CHART_GRID }, y: { ticks: CHART_TICKS, grid: CHART_GRID } },
              }} />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Macro Split" subtitle="Today" />
          {loadingToday ? (
            <div className="h-40 skeleton rounded-xl" />
          ) : (totals.calories ?? 0) === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-600">
              <p className="text-caption">No food logged yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-36 w-36 flex-shrink-0">
                <Doughnut data={macroChart} options={{
                  responsive: true, maintainAspectRatio: false, cutout: '72%',
                  plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
                }} />
              </div>
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'Protein', pct: macros.protein, color: 'bg-brand-500' },
                  { label: 'Carbs',   pct: macros.carbs,   color: 'bg-emerald-500' },
                  { label: 'Fats',    pct: macros.fats,    color: 'bg-amber-500' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-caption mb-1">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-300 font-medium">{pct}%</span>
                    </div>
                    <div className="progress-track h-1.5">
                      <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Today's workout CTA */}
      <div className="mb-6">
        <Card className="border-brand-500/20 bg-brand-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-base text-white">Today's Workout</p>
              <p className="text-small text-slate-400 mt-0.5">
                {sessions.length > 0 ? `${sessions[0]?.sets?.length ?? 0} sets logged` : 'No session started yet'}
              </p>
            </div>
            <Link to="/workouts"><Button>Start</Button></Link>
          </div>
        </Card>
      </div>

      {/* Weekly Activity + Latest PR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-caption text-slate-500 mb-1">This Week</p>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-h2 font-bold text-white">{weeklyCount}</span>
            <span className="text-small text-slate-500 mb-0.5">/ {WEEKLY_GOAL} workouts</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full"
                style={{ background: i < weeklyCount ? 'rgb(var(--brand-500))' : 'rgba(255,255,255,0.07)' }}
              />
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-caption text-slate-500 mb-1">Latest PR</p>
          {latestPR ? (
            <>
              <p className="font-bold text-white text-sm truncate">{latestPR.exercise_name}</p>
              <p className="text-small text-slate-400">{latestPR.best_weight} kg × {latestPR.best_reps} reps</p>
              <p className="text-caption text-brand-400 mt-0.5">1RM ≈ {latestPR.estimated_1rm} kg</p>
            </>
          ) : (
            <p className="text-small text-slate-500 mt-1">No records yet</p>
          )}
        </Card>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Recent Workouts</p>
          <Link to="/workouts/history" className="text-caption text-brand-400 hover:text-brand-300 font-medium">View all</Link>
        </div>
        {loadingWorkouts ? (
          <div className="space-y-2"><SkeletonCard /><SkeletonCard /></div>
        ) : sessions.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-small text-slate-500">No workouts yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-surface-800 rounded-xl border border-surface-700/60">
                <div>
                  <p className="text-small font-medium text-slate-200">{formatDate(s.date)}</p>
                  <p className="text-caption text-slate-500">{s.sets?.length ?? 0} sets</p>
                </div>
                <span className={`badge ${s.is_active ? 'bg-success/15 text-success' : 'bg-surface-700 text-slate-500'}`}>
                  {s.is_active ? 'Active' : 'Done'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
