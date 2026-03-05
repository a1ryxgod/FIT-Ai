import api from './axios'

export const authApi = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  refresh: (refreshToken) => api.post('/api/auth/refresh/', { refresh: refreshToken }),
  logout: (refreshToken) => api.post('/api/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
}
