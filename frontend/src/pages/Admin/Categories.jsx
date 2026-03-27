import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { PhotoIcon } from '@heroicons/react/24/outline'

const AdminCategories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image_url: '' })
  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories')
      setCategories(response.data || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch categories: ' + err.message)
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setNewCategory(prev => ({
          ...prev,
          image_file: file,
          image_url: '' // Clear URL when file is selected
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setNewCategory(prev => ({ 
      ...prev, 
      image_url: url,
      image_file: null // Clear file when URL is entered
    }))
    // Set preview image for URL
    if (url && url.trim() !== '') {
      setPreviewImage(url)
    } else {
      setPreviewImage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData = new FormData()
      submitData.append('name', newCategory.name.trim())
      submitData.append('description', newCategory.description?.trim() || '')

      // Add image file if selected
      if (newCategory.image_file) {
        submitData.append('image_file', newCategory.image_file)
      } else if (newCategory.image_url && newCategory.image_url.trim() !== '') {
        submitData.append('image_url', newCategory.image_url.trim())
      }

      if (editingCategory) {
        await api.post(`/admin/categories/${editingCategory.id}?_method=PUT`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Category updated successfully!')
        setEditingCategory(null)
      } else {
        await api.post('/admin/categories', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Category added successfully!')
      }

      setNewCategory({ name: '', description: '', image_url: '', image_file: null })
      setPreviewImage('')
      setShowAddForm(false)
      fetchCategories() // Refresh categories list
    } catch (err) {
      console.error('Submission error:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || err.message
      setError(`Failed to ${editingCategory ? 'update' : 'create'} category: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || '',
      image_file: null
    })
    // Set preview image with proper URL handling
    if (category.image_url) {
      setPreviewImage(getImageUrl(category.image_url, 'image_url'))
    } else {
      setPreviewImage('')
    }
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/admin/categories/${id}`)
        fetchCategories() // Refresh categories list
        alert('Category deleted successfully!')
      } catch (err) {
        setError('Failed to delete category: ' + err.message)
      }
    }
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setNewCategory({ name: '', description: '', image_url: '', image_file: null })
    setPreviewImage('')
    setShowAddForm(false)
  }

  // Helper function to get correct image URL
  const getImageUrl = (imagePath, imageField = null) => {
    if (!imagePath) return 'https://picsum.photos/seed/category/200/200.jpg'
    
    // If it's a relative path starting with /images/, convert to full URL
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8000${imagePath}`
    }
    
    // If it's already a full URL, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Otherwise, treat as relative path
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Category
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Add/Edit Category Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {previewImage ? (
                          <div className="mb-4">
                            <img
                              src={previewImage}
                              alt="Category preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="category-image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="category-image-upload"
                              name="image_file"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, WebP up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OR enter Image URL
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      value={newCategory.image_url}
                      onChange={handleUrlChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use this option if you prefer to link to an external image
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Categories ({categories.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {category.image_url && (
                    <div className="mb-3">
                      <img
                        src={getImageUrl(category.image_url, 'image_url')}
                        alt={category.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          console.log('Image failed to load:', category.image_url)
                          e.target.src = `https://picsum.photos/seed/${category.name.replace(/\s+/g, '')}/200/200.jpg`
                        }}
                      />
                    </div>
                  )}
                  <p className="text-gray-600 text-sm">
                    {category.description || 'No description available'}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Category ID: {category.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCategories
