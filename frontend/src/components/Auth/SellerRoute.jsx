import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice'

const SellerRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has seller role
  if (!user || user.role !== 'seller') {
    return <Navigate to="/" replace />
  }

  return children
}

export default SellerRoute
