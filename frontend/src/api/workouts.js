import api from './axios'

export const workoutsApi = {
  // Programs
  listPrograms: (params) => api.get('/api/programs/', { params }),
  createProgram: (data) => api.post('/api/programs/', data),
  getProgram: (id) => api.get(`/api/programs/${id}/`),
  updateProgram: (id, data) => api.patch(`/api/programs/${id}/`, data),
  deleteProgram: (id) => api.delete(`/api/programs/${id}/`),

  // Exercises
  listExercises: (params) => api.get('/api/exercises/', { params }),

  // Sessions
  startSession: (data = {}) => api.post('/api/workouts/start/', data),
  addSet: (data) => api.post('/api/workouts/add-set/', data),
  getHistory: (params) => api.get('/api/workouts/history/', { params }),
  getPRs: () => api.get('/api/workouts/prs/'),
}
