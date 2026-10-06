import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { BottomNavigation } from './components/layout/BottomNavigation'
import { Sidebar } from './components/layout/Sidebar'
import { MapPage } from './pages/MapPage'
import { PlaceDetailPage } from './pages/PlaceDetailPage'
import { MemoryWritePage } from './pages/MemoryWritePage'
import { MemoryTimelinePage } from './pages/MemoryTimelinePage'
import { SavedPlacesPage } from './pages/SavedPlacesPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'

function AppLayout() {
  return (
    <div className="md:flex md:min-h-screen">
      <Sidebar />
      <div className="pb-16 md:flex-1 md:pb-0">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  )
}

function ProtectedRoute() {
  const { session, isInitialized } = useAuthStore()

  if (!isInitialized) return null
  if (!session) return <Navigate to="/login" replace />

  return <AppLayout />
}

function App() {
  const { setSession, setInitialized } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitialized(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.subscription.unsubscribe()
  }, [setSession, setInitialized])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MapPage />} />
        <Route path="/places/:placeId" element={<PlaceDetailPage />} />
        <Route path="/places/:placeId/memories/new" element={<MemoryWritePage />} />
        <Route path="/timeline" element={<MemoryTimelinePage />} />
        <Route path="/saved" element={<SavedPlacesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
