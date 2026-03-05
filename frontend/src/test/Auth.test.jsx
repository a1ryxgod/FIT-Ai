import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'

vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ handleLogin: vi.fn(), loading: false }),
  useRegister: () => ({ handleRegister: vi.fn(), loading: false }),
}))

const Wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
)

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText('your_username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('has link to register', () => {
    render(<Login />, { wrapper: Wrapper })
    expect(screen.getByText(/create one/i)).toBeInTheDocument()
  })
})

describe('Register Page', () => {
  it('renders registration form', () => {
    render(<Register />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText('john_doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('My Gym')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('validates password match', async () => {
    render(<Register />, { wrapper: Wrapper })
    fireEvent.change(screen.getByPlaceholderText('Min 8 characters'), { target: { value: 'password1' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat password'), { target: { value: 'password2' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })
})
