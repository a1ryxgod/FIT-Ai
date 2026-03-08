import api from './axios'

export const trainerApi = {
  getClients: () => api.get('/api/trainer/clients/'),
  getClientSessions: (clientId, params) => api.get(`/api/trainer/clients/${clientId}/sessions/`, { params }),
  getClientPRs: (clientId) => api.get(`/api/trainer/clients/${clientId}/prs/`),
  createProgramForClient: (data) => api.post('/api/trainer/programs/', data),
  assignProgram: (programId, data) => api.post(`/api/trainer/programs/${programId}/assign/`, data),
  assignTrainer: (data) => api.post('/api/trainer/assign/', data),
}
