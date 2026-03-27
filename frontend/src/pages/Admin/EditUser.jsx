import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'

const EditUser = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: 'user',
    email_verified_at: null
  })

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`)
      console.log('Fetched user:', response.data)
      
      // Ensure role has a default value
      const userData = {
        ...response.data,
        role: response.data.role || 'user'
      }
      
      setUser(userData)
      setLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      const errorMessage = err.response?.data?.message || err.message
      setError('Failed to fetch user: ' + errorMessage)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      console.log('=== STARTING USER UPDATE ===')
      console.log('Current user state:', user)
      console.log('User ID from params:', id)
      
      // Simple validation
      if (!user.name || user.name.trim() === '') {
        throw new Error('Name is required')
      }
      if (!user.email || user.email.trim() === '') {
        throw new Error('Email is required')
      }
      if (!user.role) {
        throw new Error('Role is required')
      }

      const updateData = {
        name: user.name.trim(),
        email: user.email.trim(),
        role: user.role
      }
      
      console.log('Prepared update data:', updateData)
      
      const response = await api.put(`/admin/users/${id}`, updateData)
      
      console.log('✅ Update successful:', response)
      alert('User updated successfully!')
      navigate('/admin/users')
    } catch (err) {
      console.error('❌ Update failed:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      
      let errorMessage = 'Unknown error occurred'
      
      if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).flat().join(', ')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(`Failed to update user: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`Field ${name} changed to:`, value)
    
    setUser(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`)
        alert('User deleted successfully!')
        navigate('/admin/users')
      } catch (err) {
        console.error('Delete error:', err)
        const errorMessage = err.response?.data?.message || err.message
        setError('Failed to delete user: ' + errorMessage)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Users
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">User Information</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={user.role || 'user'}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Admin users have full access to admin panel
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={user.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  placeholder="User ID"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Verification Status
                </label>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    user.email_verified_at ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {user.email_verified_at 
                      ? `Verified on ${new Date(user.email_verified_at).toLocaleDateString()}`
                      : 'Not verified'
                    }
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {user.email_verified_at 
                    ? 'User has verified their email address'
                    : 'User has not yet verified their email address'
                  }
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <div className="text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleString()}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Updated
                </label>
                <div className="text-sm text-gray-600">
                  {new Date(user.updated_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update User'}
                </button>
              </div>

              {user.role !== 'admin' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete User
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditUser
