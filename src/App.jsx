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

// Public Route - Only for NOT logged in users
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

// Onboarding Guard - Only for providers who need to complete profile
function OnboardingGuard({ children }) {
  const { currentUser, userData, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'

  useEffect(() => {
    if (loading || !currentUser) return
    if (isAdmin) return

    const accountType = userData?.accountType
    const isProfileComplete = userData?.name && userData?.surname && userData?.location
    
    // Only force providers to onboarding
    if (accountType === 'individual' || accountType === 'business') {
      if (!isProfileComplete && location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true })
      }
      if (isProfileComplete && location.pathname === '/onboarding') {
        navigate('/dashboard', { replace: true })
      }
    }
    
    // Clients never go to onboarding
    if (accountType === 'client' && location.pathname === '/onboarding') {
      navigate('/dashboard', { replace: true })
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
  if (currentUser.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />
  
  return children
}

// Root Redirect - decides where to send user on "/"
function RootRedirect() {
  const { currentUser, userData, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  const isAdmin = currentUser?.email === 'rasemetselebohang24@gmail.com'
  const accountType = userData?.accountType
  const isProfileComplete = userData?.name && userData?.surname && userData?.location
  
  // Admin goes to admin panel
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }
  
  // Clients go to dashboard/browse
  if (accountType === 'client') {
    return <Navigate to="/dashboard" replace />
  }
  
  // Providers check onboarding
  if (!isProfileComplete) {
    return <Navigate to="/onboarding" replace />
  }
  
  return <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      
      {/* Root route */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Protected Routes - OnboardingGuard only applies to providers */}
      <Route 
        path="/dashboard" 
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
      
      {/* Onboarding Route - providers only */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Route */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      
      {/* Catch all */}
      <Route path="*" element={<RootRedirect />} />
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