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
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1">Start your fitness journey</p>
        </div>

        <div className="card border border-surface-600">
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

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
