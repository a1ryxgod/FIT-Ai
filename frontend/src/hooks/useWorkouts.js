import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { workoutsApi } from '@/api/workouts'
import { useWorkoutStore } from '@/store/workoutStore'

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data } = await workoutsApi.listPrograms()
      return data.results ?? data
    },
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => workoutsApi.createProgram(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] })
      toast.success('Program created')
    },
    onError: () => toast.error('Failed to create program'),
  })
}

export function useWorkoutHistory(params) {
  return useQuery({
    queryKey: ['workout-history', params],
    queryFn: async () => {
      const { data } = await workoutsApi.getHistory(params)
      return data
    },
  })
}

export function useStartSession() {
  const [loading, setLoading] = useState(false)
  const { setActiveSession } = useWorkoutStore()

  const startSession = async (programId) => {
    setLoading(true)
    try {
      const { data } = await workoutsApi.startSession(programId ? { program_id: programId } : {})
      setActiveSession(data)
      toast.success('Workout started!')
      return data
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to start session')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { startSession, loading }
}

export function useAddSet() {
  const [loading, setLoading] = useState(false)
  const { addSet } = useWorkoutStore()
  const qc = useQueryClient()

  const addWorkoutSet = async (setData) => {
    setLoading(true)
    try {
      const { data } = await workoutsApi.addSet(setData)
      addSet(data)
      qc.invalidateQueries({ queryKey: ['workout-history'] })
      toast.success('Set added')
      return data
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to add set')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { addWorkoutSet, loading }
}

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data } = await workoutsApi.listExercises()
      return data.results ?? data
    },
    staleTime: 1000 * 60 * 30,
  })
}
