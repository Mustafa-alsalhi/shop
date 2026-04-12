import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { PhotoIcon, PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline'

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
      setError('فشل في جلب الفئات: ' + err.message)
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
        alert('تم تحديث الفئة بنجاح!')
        setEditingCategory(null)
      } else {
        await api.post('/admin/categories', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('تم إضافة الفئة بنجاح!')
      }

      setNewCategory({ name: '', description: '', image_url: '', image_file: null })
      setPreviewImage('')
      setShowAddForm(false)
      fetchCategories() // Refresh categories list
    } catch (err) {
      console.error('Submission error:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || err.message
      setError(`فشل في ${editingCategory ? 'تحديث' : 'إنشاء'} الفئة: ${errorMessage}`)
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
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذه الفئة؟')) {
      try {
        await api.delete(`/admin/categories/${id}`)
        fetchCategories() // Refresh categories list
        alert('تم حذف الفئة بنجاح!')
      } catch (err) {
        setError('فشل في حذف الفئة: ' + err.message)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                إدارة الفئات
              </h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة فئة جديدة
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FolderIcon className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Add/Edit Category Form */}
        {showAddForm && (
          <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center space-x-reverse space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                <PlusIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الفئة *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف الفئة
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الفئة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          {previewImage ? (
                            <div className="mb-4">
                              <img
                                src={previewImage}
                                alt="معاينة الفئة"
                                className="mx-auto h-32 w-32 object-cover rounded-xl shadow-lg"
                              />
                            </div>
                          ) : (
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          )}
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="category-image-upload"
                              className="relative cursor-pointer bg-white rounded-xl font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500 px-4 py-2"
                            >
                              <PhotoIcon className="h-4 w-4 ml-2" />
                              <span>رفع ملف</span>
                            </label>
                            <input
                              id="category-image-upload"
                              name="image_file"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF, WebP حتى 2MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أو أدخل رابط الصورة
                      </label>
                      <input
                        type="url"
                        name="image_url"
                        value={newCategory.image_url}
                        onChange={handleUrlChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        استخدم هذا الخيار إذا كنت تفضل ربط صورة خارجية
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-reverse space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : (editingCategory ? 'تحديث الفئة' : 'إضافة الفئة')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                الفئات ({categories.length})
              </h2>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">متصل بقاعدة البيانات</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                    <div className="flex space-x-reverse space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                        title="تعديل الفئة"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="حذف الفئة"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                  )}
                  {category.image_url && (
                    <div className="flex justify-center">
                      <img
                        src={getImageUrl(category.image_url, 'image_url')}
                        alt={category.name}
                        className="h-24 w-24 object-cover rounded-xl shadow-md"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/seed/category${category.id}/200/200.jpg`
                        }}
                      />
                    </div>
                  )}
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
