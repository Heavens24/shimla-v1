import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Browse from './pages/Browse'
import AdminPanel from './pages/AdminPanel'
import WorkerProfile from './pages/WorkerProfile'
import ForgotPassword from './pages/ForgotPassword'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" />
}

// Admin Only Route Component
function AdminRoute({ children }) {
  const { currentUser } = useAuth()
  const ADMIN_EMAIL = 'rasemetselebohang24@gmail.com'
  
  if (!currentUser) return <Navigate to="/login" />
  if (currentUser.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" />
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes - Must be logged in */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/browse" 
            element={
              <ProtectedRoute>
                <Browse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/:id" 
            element={
              <ProtectedRoute>
                <WorkerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Only Route - Only rasemetselebohang24@gmail.com can access */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
          
          {/* Catch all - redirect to dashboard if logged in, login if not */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App