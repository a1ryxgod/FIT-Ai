import { useState } from 'react'
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
    <Layout title="Workouts">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2">Training</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/workouts/history')} size="sm">History</Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">+ Program</Button>
        </div>
      </div>

      {/* Quick Start — prominent CTA */}
      <div
        className="rounded-2xl p-5 mb-6 relative overflow-hidden cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand-500)))' }}
        onClick={handleQuickStart}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-caption uppercase tracking-wide">Free session</p>
            <p className="text-white font-bold text-h2 mt-0.5">Quick Start</p>
            <p className="text-white/60 text-small mt-1">Start without a program</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            ⚡
          </div>
        </div>
        {startLoading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Programs */}
      <p className="section-title">My Programs</p>
      {isLoading ? (
        <SkeletonList count={3} />
      ) : programs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No programs yet"
          description="Create a workout program to structure your training"
          action="Create Program"
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Program">
        <div className="space-y-4">
          <Input
            label="Program name"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="e.g. Push Pull Legs"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} fullWidth>Cancel</Button>
            <Button onClick={handleCreate} loading={createProgram.isPending} fullWidth>Create</Button>
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
        <div className="w-11 h-11 bg-brand-500/15 border border-brand-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          💪
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-100 text-small truncate">{program.name}</p>
          <p className="text-caption text-slate-500">Created {formatDate(program.created_at)}</p>
        </div>
      </div>
      <Button size="sm" onClick={onStart} loading={loading} className="flex-shrink-0">
        Start
      </Button>
    </Card>
  )
}
