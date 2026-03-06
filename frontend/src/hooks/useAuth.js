import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { authApi } from '@/api/auth'
import { orgsApi } from '@/api/organizations'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const { setCurrentOrg, setOrganizations } = useOrgStore()

  const handleLogin = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await authApi.login(credentials)
      login({ access: data.access, refresh: data.refresh })

      // Fetch organizations
      const orgsResp = await orgsApi.list()
      const orgs = orgsResp.data.results ?? orgsResp.data
      setOrganizations(orgs)

      // Set the org from token if available
      if (data.org_id) {
        const org = orgs.find((o) => o.id === data.org_id)
        if (org) setCurrentOrg({ ...org, role: data.role })
      } else if (orgs.length > 0) {
        // auto-select first org
        const firstOrg = orgs[0]
        const switchResp = await orgsApi.switch(firstOrg.id)
        login({ access: switchResp.data.access, refresh: switchResp.data.refresh })
        setCurrentOrg({ ...firstOrg, role: switchResp.data.role })
      }

      const from = location.state?.from?.pathname ?? '/'
      navigate(from, { replace: true })
      toast.success('Welcome back!')
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.detail ?? 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, loading }
}

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { setCurrentOrg, setOrganizations } = useOrgStore()

  const handleRegister = async (data) => {
    setLoading(true)
    try {
      const resp = await authApi.register(data)
      login({ access: resp.data.access, refresh: resp.data.refresh })

      if (resp.data.org_id) {
        const org = { id: resp.data.org_id, name: resp.data.org_name ?? data.organization_name, role: 'owner' }
        setCurrentOrg(org)
        setOrganizations([org])
      }

      navigate('/')
      toast.success('Account created!')
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Registration failed'
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { handleRegister, loading }
}

export function useProfileData() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then((r) => r.data),
    enabled: !!accessToken,
    staleTime: 60_000,
  })
}

export function useProfile() {
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuthStore()

  const saveProfile = async (data) => {
    setLoading(true)
    try {
      const resp = await authApi.updateProfile(data)
      updateUser(resp.data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return { saveProfile, loading }
}
