import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, refreshToken: null, user: null })
  })

  it('stores tokens on login', () => {
    useAuthStore.getState().login({ access: 'abc', refresh: 'xyz' })
    expect(useAuthStore.getState().accessToken).toBe('abc')
    expect(useAuthStore.getState().refreshToken).toBe('xyz')
  })

  it('clears on logout', () => {
    useAuthStore.getState().login({ access: 'abc', refresh: 'xyz' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('isAuthenticated returns correct value', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
    useAuthStore.getState().login({ access: 'token', refresh: 'r' })
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })
})

describe('OrgStore', () => {
  beforeEach(() => {
    useOrgStore.setState({ currentOrg: null, organizations: [] })
  })

  it('sets current org', () => {
    useOrgStore.getState().setCurrentOrg({ id: '1', name: 'Test', role: 'owner' })
    expect(useOrgStore.getState().currentOrg.name).toBe('Test')
  })

  it('isOwner works', () => {
    useOrgStore.getState().setCurrentOrg({ id: '1', role: 'owner' })
    expect(useOrgStore.getState().isOwner()).toBe(true)
  })

  it('isAdmin includes owner', () => {
    useOrgStore.getState().setCurrentOrg({ id: '1', role: 'owner' })
    expect(useOrgStore.getState().isAdmin()).toBe(true)
  })

  it('member is not admin', () => {
    useOrgStore.getState().setCurrentOrg({ id: '1', role: 'member' })
    expect(useOrgStore.getState().isAdmin()).toBe(false)
  })
})
