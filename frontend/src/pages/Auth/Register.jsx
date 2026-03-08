import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useRegister } from '@/hooks/useAuth'
import { User, Mail, Lock, Building2 } from '../../utils/icons'

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
    if (!form.username.trim()) errs.username = "Обов'язкове поле"
    if (!form.email.trim()) errs.email = "Обов'язкове поле"
    if (form.password.length < 8) errs.password = 'Мін. 8 символів'
    if (form.password !== form.password2) errs.password2 = 'Паролі не співпадають'
    if (!form.organization_name.trim()) errs.organization_name = "Обов'язкове поле"
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
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgb(var(--brand-400)) 0%, transparent 70%)' }} />
      </div>
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-lg font-black text-white tracking-tight"
            style={{ background: 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand-400)))' }}>
            FT
          </div>
          <h1 className="text-h1 text-white">Створити акаунт</h1>
          <p className="text-slate-500 mt-1 text-small">Почніть свій фітнес-шлях</p>
        </div>

        <div className="card p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Логін"
                name="username"
                value={form.username}
                onChange={onChange}
                error={errors.username}
                placeholder="john_doe"
                icon={User}
                required
                autoFocus
              />
              <Input
                label="Пошта"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                error={errors.email}
                placeholder="john@example.com"
                icon={Mail}
                required
              />
            </div>
            <Input
              label="Назва організації / залу"
              name="organization_name"
              value={form.organization_name}
              onChange={onChange}
              error={errors.organization_name}
              placeholder="Мій зал"
              icon={Building2}
              required
              hint="Учасників можна запросити пізніше"
            />
            <Input
              label="Пароль"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              error={errors.password}
              placeholder="Мін. 8 символів"
              icon={Lock}
              required
            />
            <Input
              label="Підтвердіть пароль"
              name="password2"
              type="password"
              value={form.password2}
              onChange={onChange}
              error={errors.password2}
              placeholder="Повторіть пароль"
              icon={Lock}
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg" variant="gradient">
              Створити акаунт
            </Button>
          </form>

          <p className="text-center text-small text-slate-500 mt-5">
            Вже є акаунт?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Увійти
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
