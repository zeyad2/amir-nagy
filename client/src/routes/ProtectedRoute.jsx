import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/utils/AuthContext'

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sat-primary"></div>
      </div>
    )
  }

  if (!user) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have required role
    return <Navigate to="/" replace />
  }

  return children
}