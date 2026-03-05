import api from './axios'

export const settingsApi = {
  getOrgSettings: () => api.get('/api/orgs/current/settings/'),
  getMembersCount: () => api.get('/api/orgs/current/members/'),
}
