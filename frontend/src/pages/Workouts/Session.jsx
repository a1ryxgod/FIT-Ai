import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useWorkoutStore } from '@/store/workoutStore'
import { useAddSet, useExercises } from '@/hooks/useWorkouts'
import { formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function Session() {
  const navigate = useNavigate()
  const { activeSession, sessionSets, clearSession } = useWorkoutStore()
  const { addWorkoutSet, loading } = useAddSet()
  const { data: exercises = [], isLoading: loadingExercises } = useExercises()

  const [exerciseId, setExerciseId] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [search, setSearch] = useState('')

  if (!activeSession) {
    return (
      <Layout title="Session">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">💪</p>
          <p className="text-slate-400 mb-4">No active session</p>
          <Button onClick={() => navigate('/workouts')}>Back to Workouts</Button>
        </div>
      </Layout>
    )
  }

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )
  const selected = exercises.find((e) => e.id === exerciseId)

  const handleAddSet = async () => {
    if (!exerciseId) return toast.error('Select an exercise first')
    if (!reps || !weight) return toast.error('Enter reps and weight')
    await addWorkoutSet({
      session_id: activeSession.id,
      exercise_id: exerciseId,
      reps: parseInt(reps),
      weight: parseFloat(weight),
    })
    setReps('')
    setWeight('')
  }

  const handleFinish = () => {
    clearSession()
    navigate('/workouts/history')
    toast.success('Workout complete! 🎉')
  }

  const totalVolume = sessionSets.reduce((sum, s) => sum + (s.reps * s.weight), 0)

  return (
    <Layout title="Active Session">
      {/* Header with finish button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-caption text-slate-500">Session · {formatDate(activeSession.date)}</p>
          <h2 className="text-h2">Workout</h2>
        </div>
        <Button variant="danger" onClick={handleFinish}>
          Finish
        </Button>
      </div>

      {/* Volume summary */}
      {sessionSets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="text-center py-2">
            <p className="text-h2 font-bold text-brand-400">{sessionSets.length}</p>
            <p className="text-caption text-slate-500">Sets Done</p>
          </Card>
          <Card className="text-center py-2">
            <p className="text-h2 font-bold text-emerald-400">{Math.round(totalVolume)}</p>
            <p className="text-caption text-slate-500">Total kg</p>
          </Card>
        </div>
      )}

      {/* Exercise selector */}
      <Card className="mb-4">
        <p className="section-title">Select Exercise</p>
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        {loadingExercises ? (
          <SkeletonList count={3} />
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-caption text-slate-500 text-center py-4">No exercises found</p>
            )}
            {filtered.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setExerciseId(ex.id)}
                className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all ${
                  exerciseId === ex.id
                    ? 'bg-brand-500/20 border border-brand-500/30'
                    : 'hover:bg-surface-750'
                }`}
              >
                <div>
                  <p className={`text-small font-medium ${exerciseId === ex.id ? 'text-brand-400' : 'text-slate-200'}`}>
                    {ex.name}
                  </p>
                  <p className="text-caption text-slate-500">{ex.muscle_group}</p>
                </div>
                {exerciseId === ex.id && <span className="text-brand-500 text-lg">✓</span>}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Reps & Weight — BIG inputs, gym-friendly */}
      {selected && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-brand-500/15 rounded-xl flex items-center justify-center text-base">💪</div>
            <div>
              <p className="text-small font-semibold text-slate-100">{selected.name}</p>
              <p className="text-caption text-slate-500">{selected.muscle_group}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Reps</label>
              <input
                type="number"
                className="input text-center text-2xl font-bold py-4"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                min="1"
                inputMode="numeric"
              />
              {/* Quick select */}
              <div className="flex gap-1.5 mt-2">
                {[5, 8, 10, 12, 15].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReps(String(n))}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      reps === String(n) ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-750 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Weight (kg)</label>
              <input
                type="number"
                className="input text-center text-2xl font-bold py-4"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                step="2.5"
                min="0"
                inputMode="decimal"
              />
              {/* Quick adjust */}
              <div className="flex gap-1.5 mt-2">
                {[-5, -2.5, +2.5, +5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setWeight((w) => String(Math.max(0, parseFloat(w || 0) + delta)))}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium bg-surface-750 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Big ADD button — gym-friendly */}
          <button
            type="button"
            onClick={handleAddSet}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
            style={{
              background: loading ? '#3f3f48' : 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand-500)))',
            }}
          >
            {loading ? '...' : '+ Add Set'}
          </button>
        </Card>
      )}

      {/* Sets log */}
      {sessionSets.length > 0 && (
        <Card>
          <p className="section-title">Sets Logged</p>
          <div className="space-y-2">
            {[...sessionSets].reverse().map((set, i) => (
              <div key={set.id ?? i} className="flex items-center justify-between py-2.5 border-b border-surface-700/60 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-brand-400">
                    {sessionSets.length - i}
                  </div>
                  <div>
                    <p className="text-small font-medium text-slate-200">{set.exercise?.name ?? 'Exercise'}</p>
                    <p className="text-caption text-slate-500">{set.exercise?.muscle_group}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-small font-bold text-slate-100">{set.reps} × {set.weight}kg</p>
                  <p className="text-caption text-slate-500">{Math.round(set.reps * set.weight)} kg vol</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Layout>
  )
}
