import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { nutritionApi } from '@/api/nutrition'

export function useTodaySummary() {
  return useQuery({
    queryKey: ['today-summary'],
    queryFn: async () => {
      const { data } = await nutritionApi.todaySummary()
      return data
    },
    refetchInterval: 1000 * 60 * 5,
  })
}

export function useFoodProducts(search = '') {
  return useQuery({
    queryKey: ['food-products', search],
    queryFn: async () => {
      const params = search ? { search } : {}
      const { data } = await nutritionApi.listProducts(params)
      return data.results ?? data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useLogFood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => nutritionApi.logFood(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today-summary'] })
      toast.success('Food logged')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Failed to log food'),
  })
}
