// Custom Cypress commands

Cypress.Commands.add('login', (username = 'testuser', password = 'testpass123') => {
  cy.request('POST', '/api/auth/login/', { username, password }).then(({ body }) => {
    window.localStorage.setItem('fittrack-auth', JSON.stringify({
      state: { accessToken: body.access, refreshToken: body.refresh, user: null },
    }))
  })
})

Cypress.Commands.add('loginWithOrg', (username, password, orgId) => {
  cy.request('POST', '/api/auth/login/', { username, password }).then(({ body }) => {
    cy.request('POST', `/api/orgs/${orgId}/switch/`, null, {
      headers: { Authorization: `Bearer ${body.access}` },
    }).then(({ body: switchBody }) => {
      window.localStorage.setItem('fittrack-auth', JSON.stringify({
        state: { accessToken: switchBody.access, refreshToken: switchBody.refresh, user: null },
      }))
      window.localStorage.setItem('fittrack-org', JSON.stringify({
        state: { currentOrg: { id: orgId, role: switchBody.role }, organizations: [] },
      }))
    })
  })
})
