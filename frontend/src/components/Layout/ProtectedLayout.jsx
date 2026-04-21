import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProtectedRoute from '../Auth/ProtectedRoute'
import Layout from './Layout'
import { getCurrentUser } from '../../store/slices/authSlice'

const ProtectedLayout = () => {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    // Fetch user data if token exists but user data is missing
    if (token && !user) {
      console.log('🔄 Auto-fetching user data in ProtectedLayout...')
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, user])

  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

export default ProtectedLayout
