import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { orgsApi } from '@/api/organizations'

export function useJoinOrg() {
  const { login } = useAuthStore()
  const { setCurrentOrg, addOrganization } = useOrgStore()

  return useMutation({
    mutationFn: (join_code) => orgsApi.join(join_code),
    onSuccess: ({ data }) => {
      login({ access: data.access, refresh: data.refresh })
      const org = { ...data.organization, role: data.role }
      setCurrentOrg(org)
      addOrganization(data.organization)
      toast.success(data.created ? 'Ви приєднались до залу!' : 'Ви вже є членом цього залу')
    },
    onError: (err) => {
      const msg = err.response?.data?.detail ?? 'Не вдалося приєднатись'
      toast.error(msg)
    },
  })
}

export function useRegenerateCode() {
  const { currentOrg, setCurrentOrg } = useOrgStore()

  return useMutation({
    mutationFn: () => orgsApi.regenerateCode(currentOrg.id),
    onSuccess: ({ data }) => {
      setCurrentOrg({ ...currentOrg, join_code: data.join_code })
      toast.success('Код оновлено')
    },
    onError: () => toast.error('Не вдалося оновити код'),
  })
}
