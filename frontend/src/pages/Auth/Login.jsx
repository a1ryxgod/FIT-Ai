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
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-white">FitTrack</h1>
          <p className="text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card border border-surface-600">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="your_username"
              required
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
