import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useWorkoutStore } from '@/store/workoutStore'
import { useAddSet, useExercises, useProgramExercises, useLastPerformance } from '@/hooks/useWorkouts'
import { formatDate } from '@/utils/helpers'
import { Check, Plus, Minus, Flag, ChevronDown, ChevronUp, Dumbbell } from '../../utils/icons'
import toast from 'react-hot-toast'

export default function Session() {
  const navigate = useNavigate()
  const { activeSession, sessionSets, clearSession } = useWorkoutStore()
  const { addWorkoutSet, loading } = useAddSet()
  const { data: exercises = [], isLoading: loadingExercises } = useExercises()

  // Program-guided mode
  const programId = activeSession?.program
  const { data: programExercises = [] } = useProgramExercises(programId)
  const exerciseIdsForPerf = useMemo(
    () => programExercises.map((pe) => pe.exercise.id),
    [programExercises],
  )
  const { data: lastPerformance = {} } = useLastPerformance(exerciseIdsForPerf)
  const isGuided = programExercises.length > 0

  const [exerciseId, setExerciseId] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('Всі')
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [showFreePicker, setShowFreePicker] = useState(false)

  if (!activeSession) {
    return (
      <Layout title="Сесія">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-slate-400 mb-4">Немає активної сесії</p>
          <Button onClick={() => navigate('/workouts')}>До тренувань</Button>
        </div>
      </Layout>
    )
  }

  // Count completed sets per exercise in this session
  const setsPerExercise = useMemo(() => {
    const counts = {}
    sessionSets.forEach((s) => {
      const eid = s.exercise?.id || s.exercise_id
      counts[eid] = (counts[eid] || 0) + 1
    })
    return counts
  }, [sessionSets])

  // For guided mode: find current exercise (first incomplete one)
  const currentProgramExerciseIdx = useMemo(() => {
    if (!isGuided) return -1
    for (let i = 0; i < programExercises.length; i++) {
      const pe = programExercises[i]
      const done = setsPerExercise[pe.exercise.id] || 0
      if (done < pe.target_sets) return i
    }
    return programExercises.length // all done
  }, [isGuided, programExercises, setsPerExercise])

  // Auto-select exercise from program if user hasn't manually selected
  const effectiveExerciseId = exerciseId || (isGuided && currentProgramExerciseIdx < programExercises.length
    ? programExercises[currentProgramExerciseIdx]?.exercise.id
    : '')

  const selected = exercises.find((e) => e.id === effectiveExerciseId)

  // Auto-fill weight from last performance or program target
  const handleSelectProgramExercise = (pe) => {
    setExerciseId(pe.exercise.id)
    const last = lastPerformance[pe.exercise.id]
    if (last) {
      setWeight(String(last.weight))
      setReps(String(last.reps))
    } else {
      setWeight(pe.target_weight > 0 ? String(pe.target_weight) : '')
      setReps(String(pe.target_reps))
    }
  }

  // Muscle groups for free picker
  const muscleGroups = ['Всі', ...Array.from(new Set(exercises.map(e => e.muscle_group))).sort()]

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle_group.toLowerCase().includes(search.toLowerCase())
    const matchGroup = muscleFilter === 'Всі' || e.muscle_group === muscleFilter
    return matchSearch && matchGroup
  })

  const handleAddSet = async () => {
    if (!effectiveExerciseId) return toast.error('Спочатку оберіть вправу')
    if (!reps || !weight) return toast.error('Введіть повтори та вагу')
    await addWorkoutSet({
      session_id: activeSession.id,
      exercise_id: effectiveExerciseId,
      reps: parseInt(reps),
      weight: parseFloat(weight),
    })
    setReps('')
    setWeight('')
  }

  const handleFinish = () => {
    clearSession()
    navigate('/workouts/history')
    toast.success('Тренування завершено!')
  }

  const totalVolume = sessionSets.reduce((sum, s) => sum + (s.reps * s.weight), 0)

  return (
    <Layout title="Активна сесія">
      {/* Header with finish button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-caption text-slate-500">Сесія · {formatDate(activeSession.date)}</p>
          <h2 className="text-h2">Тренування</h2>
        </div>
        <Button variant="danger" icon={Flag} onClick={() => setShowFinishConfirm(true)}>
          Завершити
        </Button>
      </div>

      {/* Volume summary */}
      {sessionSets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="text-center py-2">
            <p className="text-h2 font-bold text-brand-400">{sessionSets.length}</p>
            <p className="text-caption text-slate-500">Підходів зроблено</p>
          </Card>
          <Card className="text-center py-2">
            <p className="text-h2 font-bold text-emerald-400">{Math.round(totalVolume)}</p>
            <p className="text-caption text-slate-500">Загальний кг</p>
          </Card>
        </div>
      )}

      {/* Program-guided exercise list */}
      {isGuided && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title !mb-0">Програма</p>
            <span className="text-caption text-slate-500">
              {Math.min(currentProgramExerciseIdx, programExercises.length)}/{programExercises.length} вправ
            </span>
          </div>
          <div className="space-y-1.5">
            {programExercises.map((pe, idx) => {
              const done = setsPerExercise[pe.exercise.id] || 0
              const isComplete = done >= pe.target_sets
              const isCurrent = idx === currentProgramExerciseIdx
              const isActive = effectiveExerciseId === pe.exercise.id
              const last = lastPerformance[pe.exercise.id]

              return (
                <button
                  key={pe.id}
                  type="button"
                  onClick={() => handleSelectProgramExercise(pe)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-brand-500/20 border border-brand-500/30'
                      : isCurrent
                        ? 'bg-surface-700/80 border border-surface-600/50'
                        : 'hover:bg-surface-750'
                  } ${isComplete ? 'opacity-60' : ''}`}
                >
                  {/* Status indicator */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'bg-surface-700 text-slate-500'
                  }`}>
                    {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-small font-medium truncate ${isActive ? 'text-brand-400' : 'text-slate-200'}`}>
                      {pe.exercise.name}
                    </p>
                    <div className="flex items-center gap-2 text-caption text-slate-500">
                      <span>{pe.exercise.muscle_group}</span>
                      <span>·</span>
                      <span className="font-mono">
                        {done}/{pe.target_sets}×{pe.target_reps}
                        {pe.target_weight > 0 && ` @ ${pe.target_weight}кг`}
                      </span>
                    </div>
                    {last && (
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        Минулого разу: {last.weight}кг × {last.reps}
                      </p>
                    )}
                  </div>

                  {isActive && <Check className="h-4 w-4 text-brand-500 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Toggle free picker */}
          <button
            type="button"
            onClick={() => setShowFreePicker(!showFreePicker)}
            className="w-full mt-3 py-2 text-center text-caption text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors"
          >
            {showFreePicker ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showFreePicker ? 'Сховати вільний вибір' : 'Додати іншу вправу'}
          </button>
        </Card>
      )}

      {/* Free exercise selector (always shown if no program, collapsible if program) */}
      {(!isGuided || showFreePicker) && (
        <Card className="mb-4">
          <p className="section-title">{isGuided ? 'Додаткова вправа' : 'Обрати вправу'}</p>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Пошук вправ..."
            className="mb-2"
          />
          {/* Muscle group filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
            {muscleGroups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setMuscleFilter(group)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  muscleFilter === group
                    ? 'text-white'
                    : 'bg-surface-750 text-slate-500 hover:text-slate-300'
                }`}
                style={muscleFilter === group ? { background: 'rgb(var(--brand-500))' } : {}}
              >
                {group}
              </button>
            ))}
          </div>
          {loadingExercises ? (
            <SkeletonList count={3} />
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-caption text-slate-500 text-center py-4">Вправ не знайдено</p>
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
                  {exerciseId === ex.id && <Check className="h-4 w-4 text-brand-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Reps & Weight */}
      {selected && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--brand-500),0.12)' }}>
              <Dumbbell className="h-4 w-4 text-brand-400" />
            </div>
            <div>
              <p className="text-small font-semibold text-slate-100">{selected.name}</p>
              <p className="text-caption text-slate-500">{selected.muscle_group}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Повтори</label>
              <input
                type="number"
                className="input text-center text-2xl font-bold py-4"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                min="1"
                inputMode="numeric"
              />
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
              <label className="label">Вага (кг)</label>
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
              <div className="flex gap-1.5 mt-2">
                {[-5, -2.5, +2.5, +5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setWeight((w) => String(Math.max(0, parseFloat(w || 0) + delta)))}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium bg-surface-750 text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-0.5"
                  >
                    {delta > 0 ? <Plus className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                    {Math.abs(delta)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSet}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: loading ? '#3f3f48' : 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand-500)))',
            }}
          >
            <Plus className="h-5 w-5" />
            {loading ? 'Збереження...' : 'Додати підхід'}
          </button>
        </Card>
      )}

      {/* Sets log */}
      {sessionSets.length > 0 && (
        <Card>
          <p className="section-title">Внесені підходи</p>
          <div className="space-y-2">
            {[...sessionSets].reverse().map((set, i) => (
              <div key={set.id ?? i} className="flex items-center justify-between py-2.5 border-b border-surface-700/60 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-brand-400">
                    {sessionSets.length - i}
                  </div>
                  <div>
                    <p className="text-small font-medium text-slate-200">{set.exercise?.name ?? 'Вправа'}</p>
                    <p className="text-caption text-slate-500">{set.exercise?.muscle_group}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-small font-bold text-slate-100">{set.reps} × {set.weight}кг</p>
                  <p className="text-caption text-slate-500">{Math.round(set.reps * set.weight)} кг об.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <ConfirmDialog
        isOpen={showFinishConfirm}
        onClose={() => setShowFinishConfirm(false)}
        onConfirm={handleFinish}
        title="Завершити тренування?"
        description={`Збережено ${sessionSets.length} підхід${sessionSets.length !== 1 ? 'ів' : ''}. Продовжити?`}
        confirmLabel="Завершити"
        variant="danger"
      />
    </Layout>
  )
}
