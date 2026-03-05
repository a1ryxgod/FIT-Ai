import api from './axios'

export const progressApi = {
  logWeight: (data) => api.post('/api/weight/', data),
  getWeightHistory: (params) => api.get('/api/weight/', { params }),
}
