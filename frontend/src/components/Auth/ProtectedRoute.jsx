import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector((state) => state.auth.user)
  const isLoading = useSelector((state) => state.auth.isLoading)
  const location = useLocation()

  // Show loading spinner while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  // Check if user is actually authenticated (has token AND user data)
  const isFullyAuthenticated = isAuthenticated && user

  // Prevent infinite loop by checking if we're already on the login page
  if (!isFullyAuthenticated && location.pathname !== '/login') {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isFullyAuthenticated) {
    // Check role based authorization
    if (allowedRoles && allowedRoles.length > 0) {
      if (!user.role || !allowedRoles.includes(user.role)) {
        // User is not authorized for this route, redirect to their specific dashboard
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
        if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />
        if (user.role === 'driver') return <Navigate to="/driver/dashboard" replace />
        return <Navigate to="/" replace />
      }
    }
    return children
  }

  // If not authenticated and already on login page, don't render children
  return null
}

export default ProtectedRoute
