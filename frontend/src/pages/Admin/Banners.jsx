import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowLeftIcon,
  RectangleGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'

const Banners = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    link_text: '',
    is_active: true,
    sort_order: 0,
    position: 'home'
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await api.get('/admin/banners')
      setBanners(response.data.data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await api.post('/admin/banners/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setFormData(prev => ({
        ...prev,
        image_url: response.data.data.image_url
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('فشل في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (selectedBanner) {
        await api.put(`/admin/banners/${selectedBanner.id}`, formData)
        alert('تم تحديث الإعلان بنجاح')
      } else {
        await api.post('/admin/banners', formData)
        alert('تم إضافة الإعلان بنجاح')
      }
      
      setShowAddModal(false)
      setShowEditModal(false)
      setSelectedBanner(null)
      resetForm()
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('فشل في حفظ الإعلان')
    }
  }

  const handleEdit = (banner) => {
    setSelectedBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      link_text: banner.link_text || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      position: banner.position
    })
    setShowEditModal(true)
  }

  const handleDelete = async (banner) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return

    try {
      await api.delete(`/admin/banners/${banner.id}`)
      alert('تم حذف الإعلان بنجاح')
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('فشل في حذف الإعلان')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      link_text: '',
      is_active: true,
      sort_order: 0,
      position: 'home'
    })
  }

  const openAddModal = () => {
    resetForm()
    setSelectedBanner(null)
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-3 bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                  <RectangleGroupIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  إدارة الإعلانات
                </h1>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة إعلان جديد
            </button>
          </div>
        </div>

        {/* Banners List */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                قائمة الإعلانات ({banners.length})
              </h2>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">متصل بقاعدة البيانات</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصورة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموضع
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الترتيب
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <img
                          src={banner.full_image_url || (banner.image_url.startsWith('http') ? banner.image_url : `${banner.image_url}`)}
                          alt={banner.title}
                          className="h-16 w-24 object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/96x64?text=No+Image';
                          }}
                        />
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-white"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{banner.title}</div>
                      {banner.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{banner.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full">
                        {banner.position === 'home' ? '🏠 الرئيسية' : banner.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        banner.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.is_active ? '✅ نشط' : '❌ غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-xs">
                          {banner.sort_order}
                        </div>
                        <span>{banner.sort_order}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-reverse space-x-2">
                          {banner.link_url && (
                            <button
                              onClick={() => window.open(banner.link_url, '_blank')}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="عرض الإعلان"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                            title="تعديل الإعلان"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف الإعلان"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedBanner ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedBanner(null)
                    setFormData({
                      title: '',
                      description: '',
                      image_url: '',
                      link_url: '',
                      link_text: '',
                      is_active: true,
                      sort_order: 0,
                      position: 'home'
                    })
                  }}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الإعلان
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    placeholder="أدخل عنوان الإعلان"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    placeholder="أدخل وصف الإعلان"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الإعلان
                  </label>
                  <div className="flex items-center space-x-reverse space-x-4">
                    {formData.image_url && (
                      <img
                        src={formData.image_url.startsWith('http') ? formData.image_url : `${formData.image_url}`}
                        alt="Preview"
                        className="h-20 w-32 object-cover rounded-xl shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/128x80?text=Preview';
                        }}
                      />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="banner-image"
                      />
                      <label
                        htmlFor="banner-image"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Link URL and Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الإعلان
                    </label>
                    <input
                      type="url"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نص الرابط
                    </label>
                    <input
                      type="text"
                      name="link_text"
                      value={formData.link_text}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                      placeholder="اضغط هنا"
                    />
                  </div>
                </div>

                {/* Position and Sort Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموضع
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    >
                      <option value="home">الرئيسية</option>
                      <option value="category">الفئات</option>
                      <option value="product">المنتجات</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center space-x-reverse space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">نشط</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-reverse space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      setSelectedBanner(null)
                      setFormData({
                        title: '',
                        description: '',
                        image_url: '',
                        link_url: '',
                        link_text: '',
                        is_active: true,
                        sort_order: 0,
                        position: 'home'
                      })
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  >
                    {uploading ? 'جاري الرفع...' : (selectedBanner ? 'تحديث' : 'إضافة')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Banners
