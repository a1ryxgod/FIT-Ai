import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SkeletonStatRow, SkeletonCard } from '@/components/ui/Skeleton'
import OwnerDashboard from '@/components/dashboard/OwnerDashboard'
import RingProgress, { MiniRing } from '@/components/ui/RingProgress'
import { useTodaySummary } from '@/hooks/useNutrition'
import { useWeightHistory } from '@/hooks/useProgress'
import { useWorkoutHistory, usePersonalRecords } from '@/hooks/useWorkouts'
import { useProfileData } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { round1, macroPercent, formatDate } from '@/utils/helpers'
import { Flame, Trophy, Dumbbell, TrendingUp, Play, Calendar } from '../../utils/icons'
import { staggerContainer, staggerItem } from '../../utils/animations'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const CHART_GRID    = { color: 'rgba(63,63,72,0.8)' }
const CHART_TICKS   = { color: '#52525e', font: { size: 11, family: 'Inter' } }
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

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weeklyCount = sessions.filter((s) => new Date(s.date) >= weekStart).length
  const WEEKLY_GOAL = 5

  const latestPR = prs.length > 0
    ? [...prs].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null

  const weightChartData = {
    labels: [...weightLogs].reverse().map((w) => formatDate(w.date)),
    datasets: [{
      data: [...weightLogs].reverse().map((w) => w.weight),
      borderColor: 'rgb(var(--brand-500))',
      backgroundColor: 'rgba(var(--brand-500), 0.12)',
      fill: true, tension: 0.4,
      pointRadius: 3, pointBackgroundColor: 'rgb(var(--brand-500))',
      pointHoverRadius: 5,
    }],
  }

  const macros = macroPercent(totals)
  const macroChart = {
    labels: ['Білки', 'Вуглеводи', 'Жири'],
    datasets: [{
      data: [macros.protein, macros.carbs, macros.fats],
      backgroundColor: ['rgb(var(--brand-500))', '#10b981', '#f59e0b'],
      borderWidth: 0, spacing: 2,
    }],
  }

  const calorieGoal = profile?.calorie_goal ?? 2000
  const proteinGoal = profile?.protein_goal ?? 150
  const carbsGoal   = profile?.carbs_goal   ?? 200
  const fatsGoal    = profile?.fats_goal    ?? 65

  return (
    <Layout title="Головна">
      {/* Greeting */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-caption text-slate-500 uppercase tracking-wide">{getGreeting()}</p>
        <h2 className="text-h2 mt-0.5">{user?.username ?? 'Атлет'}</h2>
        {currentOrg && <p className="text-caption text-slate-500 mt-1">{currentOrg.name}</p>}
      </motion.div>

      {/* Owner / Admin overview */}
      {(isOwner() || isAdmin()) && <OwnerDashboard />}

      {/* Today's nutrition — RingProgress */}
      <div className="mb-6">
        <p className="section-title">Харчування сьогодні</p>
        {loadingToday ? <SkeletonStatRow /> : (
          <Card className="mb-3">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Calorie Ring */}
              <div className="flex-shrink-0">
                <RingProgress
                  value={totals.calories ?? 0}
                  max={calorieGoal}
                  size={130}
                  strokeWidth={11}
                  color="brand"
                  label={round1(totals.calories ?? 0)}
                  sublabel="ккал"
                />
              </div>

              {/* Macro mini rings + button */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-caption text-slate-500">Ціль</p>
                    <p className="text-small font-semibold text-slate-300">{calorieGoal} ккал</p>
                  </div>
                  <Link to="/nutrition">
                    <Button size="sm" variant="secondary" icon={Flame}>Додати їжу</Button>
                  </Link>
                </div>
                <div className="flex justify-around">
                  <MiniRing value={round1(totals.protein ?? 0)} max={proteinGoal} color="brand"  label="Білки"     unit="г" />
                  <MiniRing value={round1(totals.carbs   ?? 0)} max={carbsGoal}   color="amber"  label="Вуглеводи" unit="г" />
                  <MiniRing value={round1(totals.fats    ?? 0)} max={fatsGoal}    color="blue"   label="Жири"      unit="г" />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader
            title="Динаміка ваги"
            subtitle="Останні 14 записів"
            icon={TrendingUp}
            action={<Link to="/progress"><Button size="sm" variant="ghost">Всі</Button></Link>}
          />
          {loadingWeight ? (
            <div className="h-40 skeleton rounded-xl" />
          ) : weightLogs.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-600">
              <p className="text-caption">Записів ваги немає</p>
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
          <CardHeader title="Розподіл макросів" subtitle="Сьогодні" />
          {loadingToday ? (
            <div className="h-40 skeleton rounded-xl" />
          ) : (totals.calories ?? 0) === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-600">
              <p className="text-caption">Їжу ще не внесено</p>
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
                  { label: 'Білки',     pct: macros.protein, color: 'bg-brand-500' },
                  { label: 'Вуглеводи', pct: macros.carbs,   color: 'bg-emerald-500' },
                  { label: 'Жири',      pct: macros.fats,    color: 'bg-amber-500' },
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
            <div className="flex items-center gap-3">
              <div className="icon-container-md">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base text-white">Тренування сьогодні</p>
                <p className="text-small text-slate-400 mt-0.5">
                  {sessions.length > 0 ? `${sessions[0]?.sets?.length ?? 0} підходів внесено` : 'Сесію ще не розпочато'}
                </p>
              </div>
            </div>
            <Link to="/workouts"><Button icon={Play} variant="gradient">Розпочати</Button></Link>
          </div>
        </Card>
      </div>

      {/* Weekly Activity + Latest PR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-orange-400" />
            <p className="text-caption text-slate-500">Цього тижня</p>
          </div>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-h2 font-bold text-white">{weeklyCount}</span>
            <span className="text-small text-slate-500 mb-0.5">/ {WEEKLY_GOAL} тренувань</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 h-2 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{
                  background: i < weeklyCount ? 'rgb(var(--brand-500))' : 'rgba(255,255,255,0.07)',
                  transformOrigin: 'left',
                }}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <p className="text-caption text-slate-500">Останній рекорд</p>
          </div>
          {latestPR ? (
            <>
              <p className="font-bold text-white text-sm truncate">{latestPR.exercise_name}</p>
              <p className="text-small text-slate-400 mt-0.5">{latestPR.best_weight} кг × {latestPR.best_reps} повт.</p>
              <p className="text-caption text-brand-400 mt-0.5">1RM ≈ {latestPR.estimated_1rm} кг</p>
            </>
          ) : (
            <p className="text-small text-slate-500 mt-1">Рекордів ще немає</p>
          )}
        </Card>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Останні тренування</p>
          <Link to="/workouts/history" className="text-caption text-brand-400 hover:text-brand-300 font-medium">Всі</Link>
        </div>
        {loadingWorkouts ? (
          <div className="space-y-2"><SkeletonCard /><SkeletonCard /></div>
        ) : sessions.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-small text-slate-500">Тренувань ще немає</p>
          </Card>
        ) : (
          <motion.div
            className="space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sessions.slice(0, 3).map((s) => (
              <motion.div
                key={s.id}
                variants={staggerItem}
                className="flex items-center justify-between p-3 bg-surface-800 rounded-xl border border-surface-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-700 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-slate-200">{formatDate(s.date)}</p>
                    <p className="text-caption text-slate-500">{s.sets?.length ?? 0} підходів</p>
                  </div>
                </div>
                <span className={`badge ${s.is_active ? 'bg-success/15 text-success' : 'bg-surface-700 text-slate-500'}`}>
                  {s.is_active ? 'Активна' : 'Завершена'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Доброго ранку'
  if (h < 17) return 'Добрий день'
  return 'Добрий вечір'
}
