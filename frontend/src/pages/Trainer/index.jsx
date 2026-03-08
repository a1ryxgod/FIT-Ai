import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { SkeletonList } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Select from '@/components/ui/Select'
import { useTrainerClients, useCreateClientProgram } from '@/hooks/useTrainer'
import { Users, User, Dumbbell, Plus, Calendar, Activity } from '../../utils/icons'

export default function Trainer() {
  const navigate = useNavigate()
  const { data: clients = [], isLoading } = useTrainerClients()
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <Layout title="Мої клієнти">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-h2">Мої клієнти</h2>
          <p className="text-caption text-slate-500">{clients.length} клієнтів</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={Plus} size="sm">
          Програма
        </Button>
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Клієнтів ще немає"
          description="Адміністратор може призначити вам клієнтів на сторінці учасників"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ClientCard client={client} onClick={() => navigate(`/trainer/client/${client.id}`)} />
            </motion.div>
          ))}
        </div>
      )}

      <CreateProgramModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        clients={clients}
      />
    </Layout>
  )
}


function ClientCard({ client, onClick }) {
  const formatLastDate = (dateStr) => {
    if (!dateStr) return 'Ще не тренувався'
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Сьогодні'
    if (diff === 1) return 'Вчора'
    if (diff < 7) return `${diff} днів тому`
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
  }

  return (
    <Card className="cursor-pointer hover:border-surface-600/80 transition-all" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(var(--brand-500),0.1)', border: '1px solid rgba(var(--brand-500),0.15)' }}>
          <User className="h-5 w-5 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 text-small truncate">{client.username}</p>
          <p className="text-caption text-slate-500 truncate">{client.email}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-caption text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatLastDate(client.last_workout_date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span>{client.workouts_this_week} цього тижня</span>
        </div>
        <div className="flex items-center gap-1">
          <Dumbbell className="h-3 w-3" />
          <span>{client.total_sessions} всього</span>
        </div>
      </div>
    </Card>
  )
}


function CreateProgramModal({ isOpen, onClose, clients }) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const createProgram = useCreateClientProgram()

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.username }))

  const handleCreate = async () => {
    if (!name.trim() || !clientId) return
    await createProgram.mutateAsync({ name, assigned_to: clientId })
    setName('')
    setClientId('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Нова програма для клієнта">
      <div className="space-y-4">
        <Select
          label="Клієнт"
          value={clientId}
          onChange={setClientId}
          options={clientOptions}
          placeholder="Оберіть клієнта"
          icon={User}
        />
        <Input
          label="Назва програми"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="напр. Набір маси — 4 дні"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>Скасувати</Button>
          <Button onClick={handleCreate} loading={createProgram.isPending} fullWidth>Створити</Button>
        </div>
      </div>
    </Modal>
  )
}
