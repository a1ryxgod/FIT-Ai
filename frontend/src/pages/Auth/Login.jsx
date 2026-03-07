import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useLogin } from '@/hooks/useAuth'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const { handleLogin, loading } = useLogin()

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    handleLogin(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0F0F11' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgb(var(--brand-500)) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-lg font-black text-white tracking-tight"
            style={{ background: 'rgb(var(--brand-500))' }}>
            FT
          </div>
          <h1 className="text-h1 text-white">FitTrack</h1>
          <p className="text-slate-500 mt-1 text-small">Увійдіть до свого акаунту</p>
        </div>

        <div className="card p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Логін"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="your_username"
              required
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Пароль"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Увійти
            </Button>
          </form>

          <p className="text-center text-small text-slate-500 mt-5">
            Немає акаунту?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Створити
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
