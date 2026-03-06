import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useRegister } from '@/hooks/useAuth'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    organization_name: '',
  })
  const [errors, setErrors] = useState({})
  const { handleRegister, loading } = useRegister()

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    if (form.password.length < 8) errs.password = 'Min 8 characters'
    if (form.password !== form.password2) errs.password2 = 'Passwords do not match'
    if (!form.organization_name.trim()) errs.organization_name = 'Required'
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    try {
      await handleRegister(form)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        const mapped = {}
        Object.entries(data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v
        })
        setErrors(mapped)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ background: '#0F0F11' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgb(var(--brand-500)) 0%, transparent 70%)' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-lg font-black text-white tracking-tight"
            style={{ background: 'rgb(var(--brand-500))' }}>
            FT
          </div>
          <h1 className="text-h1 text-white">Create Account</h1>
          <p className="text-slate-500 mt-1 text-small">Start your fitness journey</p>
        </div>

        <div className="card p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={onChange}
                error={errors.username}
                placeholder="john_doe"
                required
                autoFocus
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                error={errors.email}
                placeholder="john@example.com"
                required
              />
            </div>
            <Input
              label="Organization / Gym name"
              name="organization_name"
              value={form.organization_name}
              onChange={onChange}
              error={errors.organization_name}
              placeholder="My Gym"
              required
              hint="You can invite members later"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              error={errors.password}
              placeholder="Min 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              name="password2"
              type="password"
              value={form.password2}
              onChange={onChange}
              error={errors.password2}
              placeholder="Repeat password"
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-small text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
