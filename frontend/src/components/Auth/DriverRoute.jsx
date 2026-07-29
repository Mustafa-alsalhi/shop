import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice'

const DriverRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has driver role
  if (!user || user.role !== 'driver') {
    return <Navigate to="/" replace />
  }

  return children
}

export default DriverRoute
