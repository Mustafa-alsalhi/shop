import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice'

const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  console.log('AdminRoute - User:', user)
  console.log('AdminRoute - IsAuthenticated:', isAuthenticated)

  if (!isAuthenticated) {
    console.log('AdminRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    console.log('AdminRoute - User is not admin, redirecting to home')
    return <Navigate to="/" replace />
  }

  console.log('AdminRoute - Access granted, rendering children')
  return children
}

export default AdminRoute
