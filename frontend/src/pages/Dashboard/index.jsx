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
import { Flame, Trophy, Dumbbell, TrendingUp, Play, Calendar, Zap, UtensilsCrossed } from '../../utils/icons'
import { staggerContainer, staggerItem } from '../../utils/animations'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const CHART_GRID    = { color: 'rgba(255,255,255,0.03)' }
const CHART_TICKS   = { color: '#64748b', font: { size: 11, family: 'Inter' } }
const TOOLTIP_STYLE = { backgroundColor: 'rgba(10,10,11,0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#94a3b8', bodyColor: '#f8fafc', padding: 12, cornerRadius: 8 }

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
      borderColor: 'rgb(var(--brand-400))',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(var(--brand-500), 0.2)');
        gradient.addColorStop(1, 'rgba(var(--brand-500), 0)');
        return gradient;
      },
      fill: true, tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgb(var(--brand-500))',
      pointBorderWidth: 2,
    }],
  }

  const macros = macroPercent(totals)
  const macroChart = {
    labels: ['Білки', 'Вуглеводи', 'Жири'],
    datasets: [{
      data: [macros.protein, macros.carbs, macros.fats],
      backgroundColor: ['rgb(var(--brand-500))', '#00E5FF', '#F59E0B'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }

  const calorieGoal = profile?.calorie_goal ?? 2000
  const proteinGoal = profile?.protein_goal ?? 150
  const carbsGoal   = profile?.carbs_goal   ?? 200
  const fatsGoal    = profile?.fats_goal    ?? 65

  return (
    <Layout title="Головна">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Greeting Section */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div>
            <p className="text-caption text-brand-400 tracking-[0.2em] font-bold mb-1">{getGreeting()}</p>
            <h1 className="text-h1 mt-1 text-white flex items-center gap-3">
              {user?.username ?? 'Атлет'}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 text-sm">
                <Zap className="w-4 h-4" />
              </span>
            </h1>
            {currentOrg && <p className="text-small text-slate-400 mt-2 font-medium">{currentOrg.name}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/workouts">
              <Button icon={Play} className="btn-primary shadow-accent hover:shadow-brand">Почати тренування</Button>
            </Link>
          </div>
        </motion.div>

        {/* Owner / Admin overview */}
        {(isOwner() || isAdmin()) && <OwnerDashboard />}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Nutrition Card (Spans 2 cols on lg) */}
          <div className="lg:col-span-2">
            {loadingToday ? <SkeletonStatRow /> : (
              <div className="card-glass h-full">
                <div className="flex items-center justify-between mb-6">
                  <p className="section-title mb-0 text-white">Харчування сьогодні</p>
                  <Link to="/nutrition">
                    <Button size="sm" variant="ghost" className="hover:bg-white/10">Деталі</Button>
                  </Link>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
                  {/* Calorie Ring */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-500/10 blur-[40px] rounded-full" />
                    <RingProgress
                      value={totals.calories ?? 0}
                      max={calorieGoal}
                      size={160}
                      strokeWidth={14}
                      color="brand"
                      label={round1(totals.calories ?? 0)}
                      sublabel="ккал"
                    />
                  </div>

                  {/* Macro mini rings */}
                  <div className="flex-1 w-full max-w-sm flex justify-between px-4">
                    <MiniRing value={round1(totals.protein ?? 0)} max={proteinGoal} color="brand"  label="Білки"     unit="г" />
                    <MiniRing value={round1(totals.carbs   ?? 0)} max={carbsGoal}   color="cyan"   label="Вуглеводи" unit="г" />
                    <MiniRing value={round1(totals.fats    ?? 0)} max={fatsGoal}    color="amber"  label="Жири"      unit="г" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Activity (Spans 1 col) */}
          <div className="lg:col-span-1">
            <div className="card h-full flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-sm bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Flame className="h-4 w-4" />
                  </div>
                  <p className="text-caption text-slate-400 font-semibold tracking-wider">АКТИВНІСТЬ ТИЖНЯ</p>
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-heading font-bold text-white tracking-tight">{weeklyCount}</span>
                  <span className="text-small text-slate-500 font-medium">/ {WEEKLY_GOAL} тренувань</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 h-3 rounded-full relative overflow-hidden"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      transformOrigin: 'left',
                    }}
                  >
                    {i < weeklyCount && (
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Weight Chart (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <div className="card h-full">
              <CardHeader
                title="Динаміка ваги"
                subtitle="Останні 14 записів"
                icon={TrendingUp}
                action={<Link to="/progress"><Button size="sm" variant="ghost">Історія</Button></Link>}
              />
              {loadingWeight ? (
                <div className="h-48 skeleton rounded-xl mt-4" />
              ) : weightLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 bg-surface-800/20 rounded-xl border border-white/[0.02] mt-4">
                  <TrendingUp className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-small text-slate-500">Записів ваги немає</p>
                </div>
              ) : (
                <div className="h-56 mt-4">
                  <Line data={weightChartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
                    scales: { 
                      x: { ticks: { ...CHART_TICKS, maxTicksLimit: 6 }, grid: { display: false } }, 
                      y: { ticks: CHART_TICKS, grid: CHART_GRID, border: { dash: [4, 4] } } 
                    },
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Macro Doughnut / Latest PR stack */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="card flex-1">
              <CardHeader title="Макроси" subtitle="Сьогодні" />
              {loadingToday ? (
                <div className="h-32 skeleton rounded-xl mt-4" />
              ) : (totals.calories ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-white/[0.02] mt-4">
                  <UtensilsCrossed className="h-6 w-6 text-slate-600 mb-2" />
                  <p className="text-caption text-slate-500">Їжу ще не внесено</p>
                </div>
              ) : (
                <div className="flex items-center gap-6 mt-4">
                  <div className="h-28 w-28 relative">
                    <div className="absolute inset-0 bg-brand-500/5 blur-xl rounded-full" />
                    <Doughnut data={macroChart} options={{
                      responsive: true, maintainAspectRatio: false, cutout: '75%',
                      plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
                    }} />
                  </div>
                  <div className="flex-1 space-y-3">
                    {[
                      { label: 'Білки', pct: macros.protein, color: 'bg-brand-500' },
                      { label: 'Вуглеводи', pct: macros.carbs, color: 'bg-[#00E5FF]' },
                      { label: 'Жири', pct: macros.fats, color: 'bg-amber-500' },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] font-medium tracking-wide mb-1.5">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-slate-300">{pct}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card interactive flex-1 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full group-hover:bg-amber-500/20 transition-colors duration-500" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="icon-container-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Trophy className="h-4 w-4" />
                </div>
                <p className="text-caption text-slate-400 font-semibold tracking-wider">ОСТАННІЙ РЕКОРД</p>
              </div>
              <div className="relative z-10">
                {latestPR ? (
                  <>
                    <p className="font-heading font-bold text-white text-lg truncate">{latestPR.exercise_name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-amber-400 border-b border-amber-400/30 pb-0.5">{latestPR.best_weight} кг</span>
                      <span className="text-small text-slate-400">× {latestPR.best_reps} повт.</span>
                    </div>
                  </>
                ) : (
                  <p className="text-small text-slate-500 mt-2">Рекордів ще немає</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-h3 font-heading text-white tracking-tight">Останні тренування</h3>
            <Link to="/workouts/history" className="text-small text-brand-400 hover:text-brand-300 font-medium tracking-wide flex items-center gap-1 transition-colors">
              Переглянути всі <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          {loadingWorkouts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : sessions.length === 0 ? (
            <div className="card-glass text-center py-12">
              <Dumbbell className="h-10 w-10 text-slate-600 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400 font-medium">Тренувань ще немає. Час розпочати!</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {sessions.slice(0, 3).map((s) => (
                <motion.div
                  key={s.id}
                  variants={staggerItem}
                  className="card-interactive bg-surface-900/40 backdrop-blur-md flex flex-col justify-between p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="icon-container-md bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className={`badge ${s.is_active ? 'bg-success/15 text-success border-success/20' : 'bg-surface-700 text-slate-400 border-white/5'}`}>
                      {s.is_active ? 'В процесі' : 'Завершено'}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white mb-1">{formatDate(s.date)}</p>
                    <p className="text-small text-slate-500">{s.sets?.length ?? 0} робочих підходів</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'ДОБРОГО РАНКУ'
  if (h < 17) return 'ДОБРИЙ ДЕНЬ'
  return 'ДОБРИЙ ВЕЧІР'
}
