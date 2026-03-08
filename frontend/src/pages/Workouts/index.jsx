import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { SkeletonList } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { usePrograms, useCreateProgram, useStartSession } from '@/hooks/useWorkouts'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/utils/helpers'
import { Play, Plus, FolderOpen, Dumbbell } from '../../utils/icons'

export default function Workouts() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [programName, setProgramName] = useState('')

  const { data: programs = [], isLoading } = usePrograms()
  const createProgram = useCreateProgram()
  const { startSession, loading: startLoading } = useStartSession()

  const handleCreate = async () => {
    if (!programName.trim()) return
    await createProgram.mutateAsync({ name: programName })
    setProgramName('')
    setShowCreateModal(false)
  }

  const handleStartSession = async (programId) => {
    const session = await startSession(programId)
    if (session) navigate('/workouts/session')
  }

  const handleQuickStart = async () => {
    const session = await startSession()
    if (session) navigate('/workouts/session')
  }

  return (
    <Layout title="Тренування">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2">Тренування</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/workouts/history')} size="sm">Історія</Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">+ Програма</Button>
        </div>
      </div>

      {/* Quick Start — prominent CTA */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.15 }}
        className="rounded-2xl p-5 mb-6 relative overflow-hidden cursor-pointer"
        style={{ background: 'linear-gradient(135deg, rgb(var(--brand-700)), rgb(var(--brand-500)))' }}
        onClick={handleQuickStart}
      >
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-caption uppercase tracking-wide">Вільна сесія</p>
            <p className="text-white font-bold text-h2 mt-0.5">Швидкий старт</p>
            <p className="text-white/50 text-small mt-1">Розпочати без програми</p>
          </div>
          <motion.div
            animate={startLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={startLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center"
          >
            <Play className="h-6 w-6 text-white ml-0.5" />
          </motion.div>
        </div>
      </motion.div>

      {/* Programs */}
      <p className="section-title">Мої програми</p>
      {isLoading ? (
        <SkeletonList count={3} />
      ) : programs.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Програм ще немає"
          description="Створіть програму для структурування тренувань"
          action="Створити програму"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onStart={() => handleStartSession(program.id)}
              loading={startLoading}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Нова програма">
        <div className="space-y-4">
          <Input
            label="Назва програми"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="напр. Пуш Пул Ноги"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} fullWidth>Скасувати</Button>
            <Button onClick={handleCreate} loading={createProgram.isPending} fullWidth>Створити</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

function ProgramCard({ program, onStart, loading }) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--brand-500),0.1)', border: '1px solid rgba(var(--brand-500),0.15)' }}>
          <FolderOpen className="h-5 w-5 text-brand-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-100 text-small truncate">{program.name}</p>
          <p className="text-caption text-slate-500">Створено {formatDate(program.created_at)}</p>
        </div>
      </div>
      <Button size="sm" icon={Play} onClick={onStart} loading={loading} className="flex-shrink-0">
        Розпочати
      </Button>
    </Card>
  )
}
