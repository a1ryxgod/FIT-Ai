import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { PageLoader } from '@/components/ui/Spinner'
import { RequireAuth, RequireOrg, GuestOnly } from '@/components/layout/ProtectedRoute'
import PWAInstallBanner from '@/components/ui/PWAInstallBanner'
import { useThemeStore } from '@/store/themeStore'
import { useOrgStore } from '@/store/orgStore'
import { settingsApi } from '@/api/settings'
import { useAuthStore } from '@/store/authStore'

// Lazy pages (code splitting)
const Login          = lazy(() => import('@/pages/Auth/Login'))
const Register       = lazy(() => import('@/pages/Auth/Register'))
const Dashboard      = lazy(() => import('@/pages/Dashboard'))
const Workouts       = lazy(() => import('@/pages/Workouts'))
const Session        = lazy(() => import('@/pages/Workouts/Session'))
const WorkoutHistory = lazy(() => import('@/pages/Workouts/History'))
const Nutrition      = lazy(() => import('@/pages/Nutrition'))
const Progress       = lazy(() => import('@/pages/Progress'))
const Organizations  = lazy(() => import('@/pages/Organizations'))
const Profile        = lazy(() => import('@/pages/Profile'))

// ThemeBootstrap — loads org theme on mount when authenticated
function ThemeBootstrap() {
  const { initTheme, applyTheme } = useThemeStore()
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentOrg  = useOrgStore((s) => s.currentOrg)

  // Re-apply persisted theme on cold start
  useEffect(() => { initTheme() }, [initTheme])

  // Fetch org settings when org changes
  useEffect(() => {
    if (!accessToken || !currentOrg) return
    settingsApi.getOrgSettings()
      .then(({ data }) => applyTheme(data))
      .catch(() => {}) // non-critical
  }, [accessToken, currentOrg?.id, applyTheme])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeBootstrap />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Guest only */}
          <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

          {/* Auth — no org required */}
          <Route path="/organizations" element={<RequireAuth><Organizations /></RequireAuth>} />
          <Route path="/profile"       element={<RequireAuth><Profile /></RequireAuth>} />

          {/* Org required */}
          <Route path="/"                   element={<RequireOrg><Dashboard /></RequireOrg>} />
          <Route path="/workouts"           element={<RequireOrg><Workouts /></RequireOrg>} />
          <Route path="/workouts/session"   element={<RequireOrg><Session /></RequireOrg>} />
          <Route path="/workouts/history"   element={<RequireOrg><WorkoutHistory /></RequireOrg>} />
          <Route path="/nutrition"          element={<RequireOrg><Nutrition /></RequireOrg>} />
          <Route path="/progress"           element={<RequireOrg><Progress /></RequireOrg>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <PWAInstallBanner />
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🏋️</div>
      <h1 className="text-h1 text-brand-500 mb-2">404</h1>
      <p className="text-slate-400 mb-6 text-small">Page not found</p>
      <a href="/" className="btn-primary inline-block">Go home</a>
    </div>
  )
}
