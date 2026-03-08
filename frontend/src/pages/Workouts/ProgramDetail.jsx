import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import { SkeletonList } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import {
  usePrograms,
  useProgramExercises,
  useAddProgramExercise,
  useUpdateProgramExercise,
  useDeleteProgramExercise,
  useReorderProgramExercises,
  useExercises,
  useStartSession,
} from '@/hooks/useWorkouts'
import { useOrgStore } from '@/store/orgStore'
import {
  ChevronLeft, Play, Plus, Trash2, ChevronUp, ChevronDown,
  Dumbbell, Pencil, Check, X,
} from '../../utils/icons'

export default function ProgramDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ target_sets: 3, target_reps: 10, target_weight: 0 })

  const { isTrainer } = useOrgStore()
  const canEdit = isTrainer()

  const { data: programs = [] } = usePrograms()
  const program = programs.find((p) => p.id === id)
  const { data: programExercises = [], isLoading } = useProgramExercises(id)
  const addExercise = useAddProgramExercise(id)
  const updateExercise = useUpdateProgramExercise(id)
  const deleteExercise = useDeleteProgramExercise(id)
  const reorder = useReorderProgramExercises(id)
  const { startSession, loading: startLoading } = useStartSession()

  const handleStartSession = async () => {
    const session = await startSession(id)
    if (session) navigate('/workouts/session')
  }

  const handleMoveUp = (idx) => {
    if (idx === 0) return
    const ids = programExercises.map((pe) => pe.id)
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    reorder.mutate(ids)
  }

  const handleMoveDown = (idx) => {
    if (idx === programExercises.length - 1) return
    const ids = programExercises.map((pe) => pe.id)
    ;[ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]]
    reorder.mutate(ids)
  }

  const startEdit = (pe) => {
    setEditingId(pe.id)
    setEditForm({ target_sets: pe.target_sets, target_reps: pe.target_reps, target_weight: pe.target_weight })
  }

  const saveEdit = (peId) => {
    updateExercise.mutate({ id: peId, ...editForm })
    setEditingId(null)
  }

  if (!program && !isLoading) {
    return (
      <Layout title="Програма">
        <EmptyState icon={Dumbbell} title="Програму не знайдено" description="Спробуйте повернутись назад" />
      </Layout>
    )
  }

  return (
    <Layout title={program?.name ?? 'Програма'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/workouts')} className="p-2 rounded-xl hover:bg-surface-700 transition-colors">
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-h2 truncate">{program?.name}</h2>
          <p className="text-caption text-slate-500">{programExercises.length} вправ</p>
        </div>
        <Button icon={Play} onClick={handleStartSession} loading={startLoading}>
          Розпочати
        </Button>
      </div>

      {/* Exercise List */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : programExercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Вправ ще немає"
          description={canEdit ? 'Додайте вправи до програми' : 'Тренер ще не додав вправи'}
          action={canEdit ? 'Додати вправу' : undefined}
          onAction={canEdit ? () => setShowAddModal(true) : undefined}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {programExercises.map((pe, idx) => (
              <motion.div
                key={pe.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="!p-3">
                  <div className="flex items-center gap-3">
                    {/* Order number */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-brand-400 bg-brand-500/10 flex-shrink-0">
                      {idx + 1}
                    </div>

                    {/* Exercise info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-small truncate">{pe.exercise.name}</p>
                      <p className="text-caption text-slate-500">{pe.exercise.muscle_group}</p>
                    </div>

                    {/* Targets */}
                    {canEdit && editingId === pe.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" value={editForm.target_sets} min={1}
                          onChange={(e) => setEditForm((f) => ({ ...f, target_sets: +e.target.value }))}
                          className="input w-12 text-center !py-1 !px-1 text-xs"
                        />
                        <span className="text-slate-500 text-xs">×</span>
                        <input
                          type="number" value={editForm.target_reps} min={1}
                          onChange={(e) => setEditForm((f) => ({ ...f, target_reps: +e.target.value }))}
                          className="input w-12 text-center !py-1 !px-1 text-xs"
                        />
                        <span className="text-slate-500 text-xs">@</span>
                        <input
                          type="number" value={editForm.target_weight} min={0} step={2.5}
                          onChange={(e) => setEditForm((f) => ({ ...f, target_weight: +e.target.value }))}
                          className="input w-16 text-center !py-1 !px-1 text-xs"
                        />
                        <span className="text-slate-500 text-xs">кг</span>
                        <button onClick={() => saveEdit(pe.id)} className="p-1 rounded text-green-400 hover:bg-green-500/10">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 rounded text-slate-400 hover:bg-surface-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-small font-mono text-slate-300 bg-surface-700/60 px-2 py-0.5 rounded">
                          {pe.target_sets}×{pe.target_reps}
                          {pe.target_weight > 0 && <span className="text-slate-500"> @ {pe.target_weight}кг</span>}
                        </span>
                        {canEdit && (
                          <button onClick={() => startEdit(pe)} className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-surface-700">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reorder + Delete */}
                    {canEdit && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => handleMoveUp(idx)} disabled={idx === 0}
                          className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-surface-700 disabled:opacity-30">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleMoveDown(idx)} disabled={idx === programExercises.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-surface-700 disabled:opacity-30">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteExercise.mutate(pe.id)}
                          className="p-1 rounded text-red-500/60 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add button — trainers/admins only */}
      {canEdit && programExercises.length > 0 && (
        <Button variant="secondary" onClick={() => setShowAddModal(true)} icon={Plus} fullWidth className="mt-4">
          Додати вправу
        </Button>
      )}

      {/* Add Exercise Modal — trainers/admins only */}
      {canEdit && (
        <AddExerciseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          programId={id}
          existingExerciseIds={programExercises.map((pe) => pe.exercise.id)}
          onAdd={addExercise}
        />
      )}
    </Layout>
  )
}


function AddExerciseModal({ isOpen, onClose, programId, existingExerciseIds, onAdd }) {
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('Всі')
  const [selected, setSelected] = useState(null)
  const [targetSets, setTargetSets] = useState(3)
  const [targetReps, setTargetReps] = useState(10)
  const [targetWeight, setTargetWeight] = useState(0)

  const { data: exercises = [] } = useExercises()

  const muscleGroups = useMemo(() => {
    const groups = Array.from(new Set(exercises.map((e) => e.muscle_group))).sort()
    return ['Всі', ...groups]
  }, [exercises])

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      if (existingExerciseIds.includes(e.id)) return false
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscle_group.toLowerCase().includes(search.toLowerCase())
      const matchGroup = muscleFilter === 'Всі' || e.muscle_group === muscleFilter
      return matchSearch && matchGroup
    })
  }, [exercises, search, muscleFilter, existingExerciseIds])

  const handleAdd = async () => {
    if (!selected) return
    await onAdd.mutateAsync({
      exercise_id: selected.id,
      target_sets: targetSets,
      target_reps: targetReps,
      target_weight: targetWeight,
    })
    setSelected(null)
    setTargetSets(3)
    setTargetReps(10)
    setTargetWeight(0)
    onClose()
  }

  const reset = () => {
    setSearch('')
    setMuscleFilter('Всі')
    setSelected(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose() }} title="Додати вправу" size="lg">
      {!selected ? (
        <div className="space-y-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Пошук вправи..." autoFocus />

          {/* Muscle group filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setMuscleFilter(group)}
                className="shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                style={
                  muscleFilter === group
                    ? { background: 'rgb(var(--brand-500))', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(148,163,184,0.8)' }
                }
              >
                {group}
              </button>
            ))}
          </div>

          {/* Exercise list */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-4 text-small">Нічого не знайдено</p>
            ) : (
              filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelected(ex)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-700 transition-colors text-left"
                >
                  <Dumbbell className="h-4 w-4 text-brand-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-small text-slate-200 truncate">{ex.name}</p>
                    <p className="text-caption text-slate-500">{ex.muscle_group}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected exercise */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/50">
            <Dumbbell className="h-5 w-5 text-brand-400" />
            <div>
              <p className="font-semibold text-slate-100">{selected.name}</p>
              <p className="text-caption text-slate-500">{selected.muscle_group}</p>
            </div>
          </div>

          {/* Target inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-caption text-slate-400 mb-1 block">Підходи</label>
              <input type="number" value={targetSets} min={1} onChange={(e) => setTargetSets(+e.target.value)}
                className="input w-full text-center" />
            </div>
            <div>
              <label className="text-caption text-slate-400 mb-1 block">Повторення</label>
              <input type="number" value={targetReps} min={1} onChange={(e) => setTargetReps(+e.target.value)}
                className="input w-full text-center" />
            </div>
            <div>
              <label className="text-caption text-slate-400 mb-1 block">Вага (кг)</label>
              <input type="number" value={targetWeight} min={0} step={2.5} onChange={(e) => setTargetWeight(+e.target.value)}
                className="input w-full text-center" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelected(null)} fullWidth>Назад</Button>
            <Button onClick={handleAdd} loading={onAdd.isPending} fullWidth>Додати</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
