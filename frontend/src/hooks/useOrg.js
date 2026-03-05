import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { orgsApi } from '@/api/organizations'

export function useSwitchOrg() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const { setCurrentOrg, organizations } = useOrgStore()

  const switchOrg = async (orgId) => {
    setLoading(true)
    try {
      const { data } = await orgsApi.switch(orgId)
      login({ access: data.access, refresh: data.refresh })
      const org = organizations.find((o) => o.id === orgId)
      setCurrentOrg({ ...(org ?? { id: orgId }), role: data.role, id: data.org_id ?? orgId })
      toast.success('Organization switched')
    } catch {
      toast.error('Failed to switch organization')
    } finally {
      setLoading(false)
    }
  }

  return { switchOrg, loading }
}

export function useCreateOrg() {
  const [loading, setLoading] = useState(false)
  const { addOrganization } = useOrgStore()

  const createOrg = async (name) => {
    setLoading(true)
    try {
      const { data } = await orgsApi.create({ name })
      addOrganization(data)
      toast.success(`Created "${data.name}"`)
      return data
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to create organization'
      toast.error(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createOrg, loading }
}

export function useInviteUser() {
  const [loading, setLoading] = useState(false)
  const { currentOrg } = useOrgStore()

  const invite = async ({ username, role = 'member' }) => {
    if (!currentOrg) return toast.error('No organization selected')
    setLoading(true)
    try {
      await orgsApi.invite(currentOrg.id, { username, role })
      toast.success(`Invited ${username}`)
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to invite user'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { invite, loading }
}
