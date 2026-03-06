import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { aiApi } from '@/api/ai'

export function useChatHistory() {
  return useQuery({
    queryKey: ['ai-history'],
    queryFn: async () => {
      const { data } = await aiApi.chatHistory({ page_size: 50 })
      return data.results ?? data
    },
    staleTime: 0,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (message) => aiApi.chat(message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-history'] })
    },
    onError: () => toast.error('Failed to send message'),
  })
}

export function useAnalyzeWorkouts() {
  return useMutation({
    mutationFn: () => aiApi.analyzeWorkouts(),
    onError: () => toast.error('Failed to analyze workouts'),
  })
}
