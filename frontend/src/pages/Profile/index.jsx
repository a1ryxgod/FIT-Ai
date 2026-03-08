import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { useThemeStore } from '@/store/themeStore'
import { useSwitchOrg } from '@/hooks/useOrg'
import { useProfile } from '@/hooks/useAuth'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'
import { Ruler, Flame, Calculator, Building2, LogOut, Activity } from '../../utils/icons'

const ACTIVITY_LABELS = {
  sedentary: 'Малорухливий',
  lightly_active: 'Невисока активність',
  moderately_active: 'Помірна активність',
  very_active: 'Висока активність',
  extra_active: 'Дуже висока активність',
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, refreshToken, logout } = useAuthStore()
  const { currentOrg, organizations } = useOrgStore()
  const { theme } = useThemeStore()
  const { switchOrg, loading: switchLoading } = useSwitchOrg()
  const { saveProfile, loading: savingProfile } = useProfile()

  const [profileForm, setProfileForm] = useState({
    height: '',
    weight: '',
    age: '',
    activity_level: 'moderately_active',
    calorie_goal: 2000,
    protein_goal: 150,
    carbs_goal: 250,
    fat_goal: 70,
  })
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    authApi.getProfile().then(({ data }) => {
      setProfileForm({
        height: data.height ?? '',
        weight: data.weight ?? '',
        age: data.age ?? '',
        activity_level: data.activity_level ?? 'moderately_active',
        calorie_goal: data.calorie_goal ?? 2000,
        protein_goal: data.protein_goal ?? 150,
        carbs_goal: data.carbs_goal ?? 250,
        fat_goal: data.fat_goal ?? 70,
      })
    }).catch(() => {})
  }, [])

  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  }

  const calcTDEE = () => {
    const w = parseFloat(profileForm.weight)
    const h = parseFloat(profileForm.height)
    const a = parseFloat(profileForm.age)
    if (!w || !h || !a) { toast.error('Спочатку введіть вагу, зріст та вік'); return }
    const bmr = 10 * w + 6.25 * h - 5 * a + 5
    const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[profileForm.activity_level] ?? 1.55))
    const protein = Math.round(w * 2)
    const fat = Math.round((tdee * 0.25) / 9)
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4)
    setProfileForm((p) => ({ ...p, calorie_goal: tdee, protein_goal: protein, fat_goal: fat, carbs_goal: carbs }))
    toast.success('TDEE розраховано')
  }

  const onChange = (e) => setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    saveProfile(profileForm)
  }

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken) } catch {}
    logout()
    navigate('/login')
    toast.success('Вихід виконано')
  }

  const handleSwitchOrg = async (org) => {
    await switchOrg(org.id)
    setShowOrgModal(false)
  }

  // BMI calculation
  const bmi = profileForm.height && profileForm.weight
    ? (parseFloat(profileForm.weight) / Math.pow(parseFloat(profileForm.height) / 100, 2)).toFixed(1)
    : null

  const bmiLabel = bmi
    ? bmi < 18.5 ? { text: 'Недовага', color: 'text-blue-400' }
    : bmi < 25   ? { text: 'Норма', color: 'text-success' }
    : bmi < 30   ? { text: 'Надвага', color: 'text-warning' }
    : { text: 'Ожиріння', color: 'text-danger' }
    : null

  return (
    <Layout title="Профіль">
      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, rgb(var(--brand-500)), rgb(var(--brand-400)))' }}>
          <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center text-2xl font-bold text-brand-400">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        </div>
        <div>
          <h2 className="text-h2">{user?.username}</h2>
          <p className="text-small text-slate-400">{user?.email}</p>
          {currentOrg && (
            <div className="flex items-center gap-2 mt-1">
              <Badge color={currentOrg.role}>{currentOrg.role}</Badge>
              <span className="text-caption text-slate-500">{currentOrg.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* BMI card */}
      {bmi && (
        <Card className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-caption text-slate-500">ІМТ</p>
            <p className={`text-h2 font-bold ${bmiLabel.color}`}>{bmi}</p>
          </div>
          <span className={`text-small font-semibold ${bmiLabel.color}`}>{bmiLabel.text}</span>
        </Card>
      )}

      {/* Body stats form */}
      <Card className="mb-4">
        <CardHeader title="Параметри тіла" icon={Ruler} subtitle="Використовується для розрахунку харчування" />
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Зріст"
              name="height"
              type="number"
              value={profileForm.height}
              onChange={onChange}
              placeholder="175"
              hint="см"
            />
            <Input
              label="Вага"
              name="weight"
              type="number"
              step="0.1"
              value={profileForm.weight}
              onChange={onChange}
              placeholder="75"
              hint="кг"
            />
            <Input
              label="Вік"
              name="age"
              type="number"
              value={profileForm.age}
              onChange={onChange}
              placeholder="25"
              hint="р."
            />
          </div>
          <Select
            label="Рівень активності"
            value={profileForm.activity_level}
            onChange={(v) => setProfileForm((p) => ({ ...p, activity_level: v }))}
            options={Object.entries(ACTIVITY_LABELS).map(([value, label]) => ({ value, label }))}
            icon={Activity}
          />
          <Button type="submit" loading={savingProfile} fullWidth>
            Зберегти профіль
          </Button>
        </form>
      </Card>

      {/* Nutrition Goals */}
      <Card className="mb-4">
        <CardHeader
          title="Цілі харчування"
          icon={Flame}
          subtitle="Денні цілі для відстеження"
          action={
            <button
              type="button"
              onClick={calcTDEE}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-brand-500/30 text-brand-400 transition-colors hover:bg-brand-500/10"
            >
              <Calculator className="h-3 w-3" />
              Авторозрахунок
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input
            label="Калорії"
            name="calorie_goal"
            type="number"
            value={profileForm.calorie_goal}
            onChange={onChange}
            hint="ккал"
          />
          <Input
            label="Білки"
            name="protein_goal"
            type="number"
            value={profileForm.protein_goal}
            onChange={onChange}
            hint="г"
          />
          <Input
            label="Вуглеводи"
            name="carbs_goal"
            type="number"
            value={profileForm.carbs_goal}
            onChange={onChange}
            hint="г"
          />
          <Input
            label="Жири"
            name="fat_goal"
            type="number"
            value={profileForm.fat_goal}
            onChange={onChange}
            hint="г"
          />
        </div>
        <Button type="button" onClick={handleSave} loading={savingProfile} fullWidth className="mt-4">
          Зберегти цілі
        </Button>
      </Card>

      {/* Organization section */}
      <Card className="mb-4">
        <CardHeader
          title="Організація"
          icon={Building2}
          action={
            <Button size="sm" variant="secondary" onClick={() => setShowOrgModal(true)}>
              Змінити
            </Button>
          }
        />
        {currentOrg ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-small font-black text-brand-400" style={{ background: 'rgba(var(--brand-500),0.12)' }}>
              {currentOrg.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{currentOrg.name}</p>
              <p className="text-caption text-slate-500">@{currentOrg.slug} · <span className="capitalize">{currentOrg.role}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-small text-slate-500">Організацію не обрано</p>
        )}
      </Card>

      {/* App info */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white" style={{ background: 'rgb(var(--brand-500))' }}>
            FT
          </div>
          <div>
            <p className="font-semibold text-slate-100">{theme.app_name}</p>
            <p className="text-caption text-slate-500">v1.0.0</p>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="btn-danger w-full flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Вийти
      </button>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Вийти з акаунту?"
        description="Ви будете перенаправлені на сторінку входу."
        confirmLabel="Вийти"
        variant="danger"
      />

      {/* Org switch modal */}
      <Modal isOpen={showOrgModal} onClose={() => setShowOrgModal(false)} title="Змінити організацію">
        <div className="space-y-2">
          {organizations.length === 0 ? (
            <p className="text-small text-slate-500 text-center py-4">Немає організацій</p>
          ) : (
            organizations.map((org) => {
              const isActive = currentOrg?.id === org.id
              return (
                <button
                  key={org.id}
                  onClick={() => !isActive && handleSwitchOrg(org)}
                  disabled={isActive || switchLoading}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    isActive
                      ? 'bg-brand-500/20 border border-brand-500/30 cursor-default'
                      : 'hover:bg-surface-700 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-small font-black ${
                    isActive ? 'text-brand-400' : 'text-slate-400'
                  }`} style={{ background: isActive ? 'rgba(var(--brand-500),0.2)' : 'rgba(255,255,255,0.05)' }}>
                    {org.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 text-small">{org.name}</p>
                    <p className="text-caption text-slate-500">@{org.slug}</p>
                  </div>
                  {isActive && <span className="text-caption text-brand-400 font-semibold">Активна</span>}
                </button>
              )
            })
          )}
        </div>
      </Modal>
    </Layout>
  )
}
