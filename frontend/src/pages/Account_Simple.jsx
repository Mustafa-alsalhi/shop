import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice'

const Account = () => {
  console.log('👤 Account SIMPLE component rendering...')
  
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  console.log('👤 Account SIMPLE - isAuthenticated:', isAuthenticated)
  console.log('👤 Account SIMPLE - user:', user)

  if (!isAuthenticated) {
    console.log('👤 Not authenticated, redirecting to login')
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your account</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  console.log('👤 Rendering SIMPLE account page for user:', user?.name)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.name || 'User'}!</h2>
          <p className="text-gray-600 mb-6">Email: {user?.email}</p>
          {user?.role === 'admin' && (
            <p className="text-purple-600 font-medium">Admin User</p>
          )}
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/orders')}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/wishlist')}
            className="w-full px-4 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            View Wishlist
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Admin Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Account
