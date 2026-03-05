import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { progressApi } from '@/api/progress'

export function useWeightHistory(params) {
  return useQuery({
    queryKey: ['weight-history', params],
    queryFn: async () => {
      const { data } = await progressApi.getWeightHistory(params)
      return data
    },
  })
}

export function useLogWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => progressApi.logWeight(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight-history'] })
      toast.success('Weight logged')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed to log weight'),
  })
}
