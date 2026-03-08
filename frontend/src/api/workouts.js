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

  // Program exercises
  getProgramExercises: (programId) => api.get(`/api/programs/${programId}/exercises/`),
  addProgramExercise: (programId, data) => api.post(`/api/programs/${programId}/exercises/`, data),
  updateProgramExercise: (programId, id, data) => api.patch(`/api/programs/${programId}/exercises/${id}/`, data),
  deleteProgramExercise: (programId, id) => api.delete(`/api/programs/${programId}/exercises/${id}/`),
  reorderProgramExercises: (programId, exerciseIds) => api.post(`/api/programs/${programId}/exercises/reorder/`, { exercise_ids: exerciseIds }),

  // Sessions
  startSession: (data = {}) => api.post('/api/workouts/start/', data),
  addSet: (data) => api.post('/api/workouts/add-set/', data),
  getHistory: (params) => api.get('/api/workouts/history/', { params }),
  getPRs: () => api.get('/api/workouts/prs/'),
  getLastPerformance: (exerciseIds) => api.get('/api/workouts/last-performance/', { params: { exercise_ids: exerciseIds.join(',') } }),
}
