import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import { useOrgStore } from '@/store/orgStore'
import { useSwitchOrg, useCreateOrg, useInviteUser } from '@/hooks/useOrg'
import { useJoinOrg, useRegenerateCode } from '@/hooks/useOrganizations'
import { orgsApi } from '@/api/organizations'
import { Building2, Plus, UserPlus, Shield, Copy, RefreshCw } from '../../utils/icons'

export default function Organizations() {
  const navigate = useNavigate()
  const { currentOrg, organizations, setOrganizations, isAdmin } = useOrgStore()
  const { switchOrg, loading: switchLoading } = useSwitchOrg()
  const { createOrg, loading: createLoading } = useCreateOrg()
  const { invite, loading: inviteLoading } = useInviteUser()

  const joinOrg = useJoinOrg()
  const regenerateCode = useRegenerateCode()

  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [inviteForm, setInviteForm] = useState({ username: '', role: 'member' })
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoadingOrgs(true)
      try {
        const { data } = await orgsApi.list()
        setOrganizations(data.results ?? data)
      } catch {} finally {
        setLoadingOrgs(false)
      }
    }
    fetchOrgs()
  }, [setOrganizations])

  const handleSwitch = async (org) => {
    await switchOrg(org.id)
    navigate('/')
  }

  const handleCreate = async () => {
    if (!orgName.trim()) return
    const org = await createOrg(orgName)
    if (org) {
      setOrgName('')
      setShowCreateModal(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    await invite(inviteForm)
    setInviteForm({ username: '', role: 'member' })
    setShowInviteModal(false)
  }

  return (
    <Layout title="Організації">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Ваші організації</h2>
        <Button onClick={() => setShowCreateModal(true)} size="sm" icon={Plus}>Створити</Button>
      </div>

      {loadingOrgs ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Організацій не знайдено"
          description="Створіть свою першу організацію або зверніться до адміністратора залу"
          action="Створити організацію"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => {
            const isActive = currentOrg?.id === org.id
            return (
              <Card
                key={org.id}
                className={isActive ? 'border-brand-500/30 bg-brand-500/5' : ''}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-brand-500/20' : 'bg-surface-700'
                    }`}>
                      <Building2 className={`h-5 w-5 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100">{org.name}</p>
                        {isActive && <Badge color="active" dot>Активна</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">@{org.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={currentOrg?.id === org.id ? currentOrg.role : 'member'}>
                      {currentOrg?.id === org.id ? currentOrg.role : 'member'}
                    </Badge>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSwitch(org)}
                        loading={switchLoading}
                      >
                        Переключити
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Join code — for users without org */}
      {!currentOrg && (
        <div className="mt-6">
          <Card>
            <CardHeader title="Приєднатись до залу" icon={Building2} subtitle="Введіть код, отриманий від тренера" />
            <div className="flex gap-2 mt-3">
              <input
                className="input flex-1 uppercase tracking-widest font-mono"
                placeholder="напр. GYM-X8K2"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                onKeyDown={(e) => e.key === 'Enter' && joinOrg.mutate(joinCode)}
              />
              <Button onClick={() => joinOrg.mutate(joinCode)} loading={joinOrg.isPending} disabled={!joinCode.trim()}>
                Приєднатись
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Admin actions */}
      {currentOrg && isAdmin() && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              Управління: {currentOrg.name}
            </h3>
          </div>
          <div className="space-y-3">
            {/* Join code card */}
            <Card>
              <CardHeader title="Код для вступу" icon={Building2} subtitle="Поділіться цим кодом з клієнтами" />
              <div className="flex items-center gap-3 mt-3">
                <span className="font-mono text-2xl font-bold tracking-widest text-brand-400 bg-brand-500/10 px-4 py-2 rounded-xl">
                  {currentOrg.join_code ?? '--------'}
                </span>
                <button
                  onClick={() => { navigator.clipboard.writeText(currentOrg.join_code); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-surface-700 transition-colors"
                  title="Копіювати"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => regenerateCode.mutate()}
                  disabled={regenerateCode.isPending}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-surface-700 transition-colors"
                  title="Оновити код"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerateCode.isPending ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </Card>

            {/* Invite card */}
            <Card>
              <CardHeader title="Управління командою" icon={Shield} subtitle="Запросіть учасників до вашої організації" />
              <Button
                size="sm"
                icon={UserPlus}
                onClick={() => setShowInviteModal(true)}
              >
                Запросити учасника
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Нова організація">
        <div className="space-y-4">
          <Input
            label="Назва організації"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Мій зал"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} fullWidth>Скасувати</Button>
            <Button onClick={handleCreate} loading={createLoading} fullWidth>Створити</Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Запросити учасника">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Логін"
            value={inviteForm.username}
            onChange={(e) => setInviteForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="john_doe"
            required
            autoFocus
          />
          <Select
            label="Роль"
            value={inviteForm.role}
            onChange={(v) => setInviteForm((p) => ({ ...p, role: v }))}
            options={[
              { value: 'member',  label: 'Учасник' },
              { value: 'trainer', label: 'Тренер' },
              { value: 'admin',   label: 'Адмін' },
            ]}
          />
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowInviteModal(false)} fullWidth>
              Скасувати
            </Button>
            <Button type="submit" loading={inviteLoading} fullWidth>
              Запросити
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
