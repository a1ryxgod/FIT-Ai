import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { orgsApi } from '@/api/organizations'

export function useMembers(orgId) {
  return useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => orgsApi.members(orgId).then((r) => r.data.results ?? r.data),
    enabled: !!orgId,
    staleTime: 30_000,
  })
}

export function useInviteMember(orgId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => orgsApi.invite(orgId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-members', orgId] })
      toast.success('Member invited')
    },
    onError: (err) => {
      const msg = err.response?.data?.detail ?? err.response?.data?.username?.[0] ?? 'Failed to invite'
      toast.error(msg)
    },
  })
}
