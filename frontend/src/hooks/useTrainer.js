import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { trainerApi } from '@/api/trainer'

export function useTrainerClients() {
  return useQuery({
    queryKey: ['trainer-clients'],
    queryFn: async () => {
      const { data } = await trainerApi.getClients()
      return data
    },
  })
}

export function useTrainerClientSessions(clientId, params) {
  return useQuery({
    queryKey: ['trainer-client-sessions', clientId, params],
    queryFn: async () => {
      const { data } = await trainerApi.getClientSessions(clientId, params)
      return data
    },
    enabled: !!clientId,
  })
}

export function useTrainerClientPRs(clientId) {
  return useQuery({
    queryKey: ['trainer-client-prs', clientId],
    queryFn: async () => {
      const { data } = await trainerApi.getClientPRs(clientId)
      return data
    },
    enabled: !!clientId,
  })
}

export function useCreateClientProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => trainerApi.createProgramForClient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] })
      qc.invalidateQueries({ queryKey: ['trainer-clients'] })
      toast.success('Програму створено')
    },
    onError: (err) => toast.error(err.response?.data?.detail ?? 'Помилка створення програми'),
  })
}

export function useAssignProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ programId, clientId }) => trainerApi.assignProgram(programId, { client_id: clientId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] })
      toast.success('Програму призначено')
    },
    onError: (err) => toast.error(err.response?.data?.detail ?? 'Помилка призначення'),
  })
}

export function useAssignTrainer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => trainerApi.assignTrainer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      toast.success('Тренера призначено')
    },
    onError: (err) => toast.error(err.response?.data?.detail ?? 'Помилка призначення тренера'),
  })
}
