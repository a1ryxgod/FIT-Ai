import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import { useOrgStore } from '@/store/orgStore'
import { useMembers, useInviteMember } from '@/hooks/useMembers'
import { useAssignTrainer } from '@/hooks/useTrainer'
import { Users, UserPlus, User } from '../../utils/icons'

const ROLE_OPTIONS = [
  { value: 'member',  label: 'Учасник' },
  { value: 'trainer', label: 'Тренер' },
  { value: 'admin',   label: 'Адмін' },
]

function MemberRow({ member, trainers, isAdmin }) {
  const assignTrainer = useAssignTrainer()

  const trainerOptions = [
    { value: '', label: 'Без тренера' },
    ...trainers.map((t) => ({ value: t.user_id, label: t.username })),
  ]

  const handleTrainerChange = (trainerId) => {
    assignTrainer.mutate({
      trainer_id: trainerId || null,
      member_id: member.user_id,
    })
  }

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(var(--brand-500),0.12)' }}>
        <User className="h-4 w-4 text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 text-small truncate">{member.username}</p>
        <p className="text-caption text-slate-500 truncate">{member.email}</p>
        {member.trainer_username && (
          <p className="text-[10px] text-brand-400/70 mt-0.5">Тренер: {member.trainer_username}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isAdmin && member.role === 'member' && trainers.length > 0 && (
          <Select
            value={member.trainer_id ?? ''}
            onChange={handleTrainerChange}
            options={trainerOptions}
            placeholder="Тренер"
          />
        )}
        <Badge color={member.role}>{member.role}</Badge>
      </div>
    </div>
  )
}

export default function Members() {
  const { currentOrg, isAdmin } = useOrgStore()
  const { data: members = [], isLoading } = useMembers(currentOrg?.id)
  const { mutate: invite, isPending: inviting } = useInviteMember(currentOrg?.id)

  const [form, setForm] = useState({ username: '', role: 'member' })
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const trainers = members.filter((m) => ['trainer', 'admin', 'owner'].includes(m.role))

  const handleInvite = (e) => {
    e.preventDefault()
    if (!form.username.trim()) return
    invite(form, {
      onSuccess: () => setForm({ username: '', role: 'member' }),
    })
  }

  return (
    <Layout title="Учасники">
      <Card className="mb-4">
        <CardHeader
          title="Учасники команди"
          icon={Users}
          subtitle={isLoading ? 'Завантаження…' : `${members.length} учасник${members.length !== 1 ? 'ів' : ''}`}
        />
        {isLoading ? (
          <div className="py-8 text-center text-slate-500 text-small">Завантаження учасників…</div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-small">Учасників ще немає. Запросіть когось нижче.</div>
        ) : (
          <div>
            {members.map((m) => (
              <MemberRow key={m.id} member={m} trainers={trainers} isAdmin={isAdmin()} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Запросити учасника" subtitle="Додайте зареєстрованого користувача до залу" />
        <form onSubmit={handleInvite} className="space-y-3">
          <Input
            label="Логін"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="john_doe"
            icon={User}
            required
          />
          <Select
            label="Роль"
            value={form.role}
            onChange={(v) => setForm((p) => ({ ...p, role: v }))}
            options={ROLE_OPTIONS}
          />
          <Button type="submit" icon={UserPlus} loading={inviting} fullWidth>
            Надіслати запрошення
          </Button>
        </form>
      </Card>
    </Layout>
  )
}
