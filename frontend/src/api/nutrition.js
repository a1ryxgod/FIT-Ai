import api from './axios'

export const nutritionApi = {
  listProducts: (params) => api.get('/api/food/products/', { params }),
  logFood: (data) => api.post('/api/food/log/', data),
  todaySummary: () => api.get('/api/food/today/'),
  foodHistory: (params) => api.get('/api/food/history/', { params }),
}
