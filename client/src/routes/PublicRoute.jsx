import { Navigate } from 'react-router-dom'
import { useAuth } from '@/utils/AuthContext'

export function PublicRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sat-primary"></div>
      </div>
    )
  }

  if (user) {
    // If user is logged in, redirect to appropriate dashboard
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
  }

  return children
}