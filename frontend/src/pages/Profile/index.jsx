import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { useThemeStore } from '@/store/themeStore'
import { useSwitchOrg } from '@/hooks/useOrg'
import { useProfile } from '@/hooks/useAuth'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
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
  })
  const [showOrgModal, setShowOrgModal] = useState(false)

  useEffect(() => {
    authApi.getProfile().then(({ data }) => {
      setProfileForm({
        height: data.height ?? '',
        weight: data.weight ?? '',
        age: data.age ?? '',
        activity_level: data.activity_level ?? 'moderately_active',
      })
    }).catch(() => {})
  }, [])

  const onChange = (e) => setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    saveProfile(profileForm)
  }

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken) } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out')
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
    ? bmi < 18.5 ? { text: 'Underweight', color: 'text-blue-400' }
    : bmi < 25   ? { text: 'Normal', color: 'text-success' }
    : bmi < 30   ? { text: 'Overweight', color: 'text-warning' }
    : { text: 'Obese', color: 'text-danger' }
    : null

  return (
    <Layout title="Profile">
      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-brand-500/20 border-2 border-brand-500/40 rounded-full flex items-center justify-center text-2xl font-bold text-brand-400">
          {user?.username?.[0]?.toUpperCase() ?? '?'}
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
            <p className="text-caption text-slate-500">BMI Index</p>
            <p className={`text-h2 font-bold ${bmiLabel.color}`}>{bmi}</p>
          </div>
          <span className={`text-small font-semibold ${bmiLabel.color}`}>{bmiLabel.text}</span>
        </Card>
      )}

      {/* Body stats form */}
      <Card className="mb-4">
        <CardHeader title="Body Stats" subtitle="Used for nutrition calculations" />
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Height"
              name="height"
              type="number"
              value={profileForm.height}
              onChange={onChange}
              placeholder="175"
              hint="cm"
            />
            <Input
              label="Weight"
              name="weight"
              type="number"
              step="0.1"
              value={profileForm.weight}
              onChange={onChange}
              placeholder="75"
              hint="kg"
            />
            <Input
              label="Age"
              name="age"
              type="number"
              value={profileForm.age}
              onChange={onChange}
              placeholder="25"
              hint="years"
            />
          </div>
          <div>
            <label className="label">Activity Level</label>
            <select
              name="activity_level"
              className="input"
              value={profileForm.activity_level}
              onChange={onChange}
            >
              {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <Button type="submit" loading={savingProfile} fullWidth>
            Save Profile
          </Button>
        </form>
      </Card>

      {/* Organization section */}
      <Card className="mb-4">
        <CardHeader
          title="Organization"
          action={
            <Button size="sm" variant="secondary" onClick={() => setShowOrgModal(true)}>
              Switch
            </Button>
          }
        />
        {currentOrg ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-lg">🏢</div>
            <div>
              <p className="font-semibold text-slate-100">{currentOrg.name}</p>
              <p className="text-caption text-slate-500">@{currentOrg.slug} · <span className="capitalize">{currentOrg.role}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-small text-slate-500">No organization selected</p>
        )}
      </Card>

      {/* App info */}
      <Card className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🏋️</span>
          <div>
            <p className="font-semibold text-slate-100">{theme.app_name}</p>
            <p className="text-caption text-slate-500">v1.0.0</p>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="btn-danger w-full flex items-center justify-center gap-2"
      >
        <span>🚪</span>
        Sign Out
      </button>

      {/* Org switch modal */}
      <Modal isOpen={showOrgModal} onClose={() => setShowOrgModal(false)} title="Switch Organization">
        <div className="space-y-2">
          {organizations.length === 0 ? (
            <p className="text-small text-slate-500 text-center py-4">No organizations</p>
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
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                    isActive ? 'bg-brand-500/30' : 'bg-surface-700'
                  }`}>
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 text-small">{org.name}</p>
                    <p className="text-caption text-slate-500">@{org.slug}</p>
                  </div>
                  {isActive && <span className="text-caption text-brand-400 font-semibold">Active</span>}
                </button>
              )
            })
          )}
        </div>
      </Modal>
    </Layout>
  )
}
