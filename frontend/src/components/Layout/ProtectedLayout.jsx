import React from 'react'
import { Outlet } from 'react-router-dom'
import ProtectedRoute from '../Auth/ProtectedRoute'
import Layout from './Layout'

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

export default ProtectedLayout
