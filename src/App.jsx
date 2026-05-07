import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Browse from './pages/Browse'
import AdminPanel from './pages/AdminPanel'
import WorkerProfile from './pages/WorkerProfile'
import ForgotPassword from './pages/ForgotPassword'

// Protected Route - Only for logged in users
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return currentUser ? children : <Navigate to="/login" replace />
}

// Public Route - Only for NOT logged in users. Redirects to dashboard if already logged in
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return !currentUser ? children : <Navigate to="/" replace />
}

// Onboarding Guard - Checks if user needs to complete profile
function OnboardingGuard({ children }) {
  const { currentUser, userData, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'

  useEffect(() => {
    if (loading || !currentUser) return

    const isProfileComplete = userData?.name && userData?.surname && userData?.location
    
    // If profile is incomplete AND we're not already on onboarding → go to onboarding
    if (!isProfileComplete && location.pathname !== '/onboarding' && !isAdmin) {
      navigate('/onboarding', { replace: true })
    }
    
    // If profile IS complete AND we're on onboarding → go to dashboard
    if (isProfileComplete && location.pathname === '/onboarding') {
      navigate('/', { replace: true })
    }
  }, [loading, currentUser, userData, isAdmin, navigate, location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return children
}

// Admin Only Route
function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const ADMIN_EMAIL = 'rasemetselebohang24@gmail.com'
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.email !== ADMIN_EMAIL) return <Navigate to="/" replace />
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if already logged in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      
      {/* Protected Routes - Must be logged in + have complete profile */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Dashboard />
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/browse" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Browse />
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/:id" 
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <WorkerProfile />
            </OnboardingGuard>
          </ProtectedRoute>
        } 
      />
      
      {/* Onboarding Route - Must be logged in but profile can be incomplete */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Only Route */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      
      {/* Catch all - redirect to dashboard if logged in, login if not */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}