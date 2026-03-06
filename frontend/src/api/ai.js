import api from './axios'

export const aiApi = {
  chat: (message) => api.post('/api/ai/chat/', { message }),
  analyzeWorkouts: () => api.post('/api/ai/analyze-workouts/'),
  chatHistory: (params) => api.get('/api/ai/history/', { params }),
}
