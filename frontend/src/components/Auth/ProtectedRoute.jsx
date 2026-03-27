import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()

  console.log('🛡️ ProtectedRoute - Authenticated:', isAuthenticated)
  console.log('🛡️ ProtectedRoute - Current path:', location.pathname)
  console.log('🛡️ ProtectedRoute - Children type:', typeof children)
  console.log('🛡️ ProtectedRoute - Children:', children)
  console.log('🛡️ ProtectedRoute - Component rendering at:', new Date().toISOString())

  // Prevent infinite loop by checking if we're already on the login page
  if (!isAuthenticated && location.pathname !== '/login') {
    console.log('🛡️ Redirecting to login from:', location.pathname)
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isAuthenticated) {
    console.log('🛡️ Access granted to:', location.pathname)
    console.log('🛡️ Rendering children...')
    return children
  }

  // If not authenticated and already on login page, don't render children
  console.log('🛡️ Not authenticated, not rendering children')
  return null
}

export default ProtectedRoute
