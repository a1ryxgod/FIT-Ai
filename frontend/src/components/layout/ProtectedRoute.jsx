import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'

export function RequireAuth({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export function RequireOrg({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentOrg = useOrgStore((s) => s.currentOrg)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!currentOrg) {
    return <Navigate to="/organizations" state={{ from: location }} replace />
  }
  return children
}

export function GuestOnly({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  if (accessToken) return <Navigate to="/" replace />
  return children
}
