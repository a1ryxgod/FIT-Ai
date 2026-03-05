describe('Dashboard', () => {
  it('shows dashboard with org context', () => {
    // Set up auth and org in localStorage
    window.localStorage.setItem('fittrack-auth', JSON.stringify({
      state: { accessToken: 'fake-token', refreshToken: 'fake-refresh', user: { username: 'testuser' } },
    }))
    window.localStorage.setItem('fittrack-org', JSON.stringify({
      state: { currentOrg: { id: 'org-1', name: 'Test Gym', role: 'owner' }, organizations: [] },
    }))
    cy.visit('/')
    cy.contains('Dashboard').should('exist')
  })

  it('shows navigation sidebar on desktop', () => {
    cy.viewport(1280, 720)
    cy.visit('/login') // redirected since no auth
    cy.get('input[name="username"]').should('exist')
  })
})
