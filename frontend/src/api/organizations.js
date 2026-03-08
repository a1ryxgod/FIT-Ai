import api from './axios'

export const orgsApi = {
  list: () => api.get('/api/orgs/'),
  create: (data) => api.post('/api/orgs/', data),
  switch: (orgId) => api.post(`/api/orgs/${orgId}/switch/`),
  invite: (orgId, data) => api.post(`/api/orgs/${orgId}/invite/`, data),
  members: (orgId) => api.get(`/api/orgs/${orgId}/members/`),
  join: (join_code) => api.post('/api/orgs/join/', { join_code }),
  regenerateCode: (orgId) => api.post(`/api/orgs/${orgId}/regenerate-code/`),
}
