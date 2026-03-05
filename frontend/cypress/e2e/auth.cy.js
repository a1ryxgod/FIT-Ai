describe('Authentication', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('redirects unauthenticated users to login', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('shows login form', () => {
    cy.visit('/login')
    cy.get('input[name="username"]').should('exist')
    cy.get('input[name="password"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Sign In')
  })

  it('shows register form', () => {
    cy.visit('/register')
    cy.get('input[name="username"]').should('exist')
    cy.get('input[name="organization_name"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Create Account')
  })

  it('navigates between login and register', () => {
    cy.visit('/login')
    cy.contains('Create one').click()
    cy.url().should('include', '/register')
    cy.contains('Sign in').click()
    cy.url().should('include', '/login')
  })
})
