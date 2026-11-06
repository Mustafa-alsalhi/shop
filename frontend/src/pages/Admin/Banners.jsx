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
import activityService from '../../services/activityService'

const Banners = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [activities, setActivities] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    full_image_url: '',
    link_url: '',
    link_text: '',
    is_active: true,
    sort_order: 0,
    position: 'home',
    type: 'store'
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bannersRes, adminActRes] = await Promise.all([
        api.get('/admin/banners'),
        activityService.getAdminActivities().catch(() => null)
      ])

      setBanners(bannersRes.data?.data || [])

      if (adminActRes && adminActRes.success && Array.isArray(adminActRes.data) && adminActRes.data.length > 0) {
        setActivities(adminActRes.data)
      } else {
        const pubActRes = await activityService.getActivities().catch(() => null)
        if (pubActRes && pubActRes.success && Array.isArray(pubActRes.data) && pubActRes.data.length > 0) {
          setActivities(pubActRes.data)
        } else {
          setActivities([
            { id: 1, name: 'المطاعم والوجبات', slug: 'restaurant', icon: '🍔' },
            { id: 2, name: 'الكافيهات والحلويات', slug: 'cafe', icon: '☕' },
            { id: 3, name: 'المخابز والمعجنات', slug: 'bakery', icon: '🥖' }
          ])
        }
      }
    } catch (error) {
      console.error('Error fetching banners and activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await api.get('/admin/banners')
      setBanners(response.data.data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
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
    const uploadData = new FormData()
    uploadData.append('image', file)

    try {
      const response = await api.post('/admin/banners/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setFormData(prev => ({
        ...prev,
        image_url: response.data.data.image_url,
        full_image_url: response.data.data.full_url
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

    if (!formData.image_url) {
      alert('يرجى رفع صورة الإعلان أولاً')
      return
    }

    try {
      const payload = {
        ...formData,
        type: formData.type || 'store',
        position: formData.position || 'home',
        sort_order: Number(formData.sort_order) || 0
      }

      if (selectedBanner) {
        await api.put(`/admin/banners/${selectedBanner.id}`, payload)
        alert('تم تحديث الإعلان بنجاح')
      } else {
        await api.post('/admin/banners', payload)
        alert('تم إضافة الإعلان بنجاح')
      }

      setShowAddModal(false)
      setShowEditModal(false)
      setSelectedBanner(null)
      resetForm()
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      const msg = error.response?.data?.message || 'فشل في حفظ الإعلان'
      alert(msg)
    }
  }

  const handleEdit = (banner) => {
    setSelectedBanner(banner)
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      full_image_url: banner.full_image_url || '',
      link_url: banner.link_url || '',
      link_text: banner.link_text || '',
      is_active: banner.is_active ?? true,
      sort_order: banner.sort_order ?? 0,
      position: banner.position || 'home',
      type: banner.type || 'store'
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

  const resetForm = (defaultType = 'store') => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      full_image_url: '',
      link_url: '',
      link_text: '',
      is_active: true,
      sort_order: 0,
      position: 'home',
      type: defaultType
    })
  }

  const openAddModal = () => {
    const initialType = filterType !== 'all' ? filterType : 'store'
    resetForm(initialType)
    setSelectedBanner(null)
    setShowAddModal(true)
  }

  const getActivityBadge = (typeValue) => {
    const normalized = !typeValue || typeValue === 'stores' ? 'store' : (typeValue === 'restaurants' ? 'restaurant' : typeValue)

    if (normalized === 'all') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 rounded-full">
          <span>🌐</span>
          <span>جميع الأنشطة</span>
        </span>
      )
    }

    if (normalized === 'store') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full">
          <span>🛍️</span>
          <span>المتاجر الإلكترونية</span>
        </span>
      )
    }

    const act = activities.find(a => a.slug === normalized)
    if (act) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 rounded-full">
          <span>{act.icon || '✨'}</span>
          <span>{act.name}</span>
        </span>
      )
    }

    if (normalized === 'restaurant') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 rounded-full">
          <span>🍔</span>
          <span>المطاعم والوجبات</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200 rounded-full">
        <span>✨</span>
        <span>{normalized}</span>
      </span>
    )
  }

  const filteredBanners = banners.filter(banner => {
    const bType = !banner.type || banner.type === 'stores' ? 'store' : (banner.type === 'restaurants' ? 'restaurant' : banner.type)
    if (filterType === 'all') return true
    if (filterType === 'store') return bType === 'store' || bType === 'all'
    return bType === filterType || bType === 'all'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-4 sm:py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 sm:p-3 bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg sm:rounded-xl transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg sm:rounded-xl">
                  <RectangleGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    إدارة الإعلانات والبانرات
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    إضافة وتخصيص الإعلانات لصفحة المتاجر الإلكترونية والمطاعم وكافة الأنشطة التجارية
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="text-xs sm:text-sm font-bold">إضافة إعلان جديد</span>
            </button>
          </div>
        </div>

        {/* Banners List */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100">
          <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                قائمة الإعلانات ({filteredBanners.length})
              </h2>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">متصل بقاعدة البيانات</span>
              </div>
            </div>

            {/* Activity Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                الكل ({banners.length})
              </button>
              <button
                onClick={() => setFilterType('store')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === 'store'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-amber-700'
                }`}
              >
                <span>🛍️</span>
                <span>المتاجر الإلكترونية ({banners.filter(b => !b.type || b.type === 'store' || b.type === 'stores' || b.type === 'all').length})</span>
              </button>
              {activities.map((act) => {
                const count = banners.filter(b => b.type === act.slug || (act.slug === 'restaurant' && b.type === 'restaurants') || b.type === 'all').length
                return (
                  <button
                    key={act.id}
                    onClick={() => setFilterType(act.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      filterType === act.slug
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-orange-700'
                    }`}
                  >
                    <span>{act.icon || '✨'}</span>
                    <span>{act.name} ({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصورة
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    صفحة النشاط
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموضع
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الترتيب
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBanners.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-sm">
                      لا توجد إعلانات مضافة لهذا النشاط حالياً. اضغط على "إضافة إعلان جديد" لإضافة إعلان.
                    </td>
                  </tr>
                ) : (
                  filteredBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="relative">
                          <img
                            src={banner.full_image_url || banner.image_url}
                            alt={banner.title}
                            className="h-12 w-16 sm:h-16 sm:w-24 object-cover rounded-lg sm:rounded-xl shadow-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3Eبدون صورة%3C%2Ftext%3E%3C%2Fsvg%3E';
                            }}
                          />
                          <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-amber-500 border-2 border-white"></div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-24 sm:max-w-none">{banner.title}</div>
                        {banner.description && (
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-24 sm:max-w-xs mt-1">{banner.description}</div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {getActivityBadge(banner.type)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="px-2 sm:px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full">
                          {banner.position === 'home' ? '🏠 الرئيسية' : banner.position === 'category' ? '📂 الفئات' : banner.position === 'product' ? '📦 المنتجات' : banner.position}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                          banner.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {banner.is_active ? '✅ نشط' : '❌ غير نشط'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900">
                        <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-xs">
                            {banner.sort_order}
                          </div>
                          <span>{banner.sort_order}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                          {banner.link_url && (
                            <button
                              onClick={() => window.open(banner.link_url, '_blank')}
                              className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="عرض الإعلان"
                            >
                              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-1.5 sm:p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                            title="تعديل الإعلان"
                          >
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner)}
                            className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف الإعلان"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  {selectedBanner ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedBanner(null)
                    resetForm()
                  }}
                  className="p-1.5 sm:p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Activity Type Selection */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 sm:p-4">
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2">
                    صفحة النشاط المراد عرض الإعلان فيها (نوع النشاط) *
                  </label>
                  <select
                    name="type"
                    value={formData.type || 'store'}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-amber-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-xs sm:text-sm font-semibold text-gray-900"
                  >
                    <option value="store">🛍️ المتاجر الإلكترونية (الصفحة الرئيسية للمتجر)</option>
                    {activities.map((act) => (
                      <option key={act.id} value={act.slug}>
                        {act.icon || '✨'} {act.name}
                      </option>
                    ))}
                    <option value="all">🌐 جميع صفحات الأنشطة والمتجر الإلكتروني</option>
                  </select>
                  <p className="text-[11px] sm:text-xs text-amber-800 mt-1.5">
                    سيتم عرض هذا الإعلان في أعلى صفحة النشاط المحدد بنفس تنسيق وشكل الإعلانات الترويجية.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    عنوان الإعلان *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                    placeholder="أدخل عنوان الإعلان"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                    placeholder="أدخل وصف الإعلان"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    صورة الإعلان *
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
                    {(formData.image_url || formData.full_image_url) && (
                      <img
                        src={formData.full_image_url || (formData.image_url.startsWith('http') ? formData.image_url : `${(import.meta.env.VITE_API_URL || '').replace('/api', '')}${formData.image_url}`)}
                        alt="Preview"
                        className="h-16 w-24 sm:h-20 sm:w-32 object-cover rounded-lg sm:rounded-xl shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20fill%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3Eمعاينة%3C%2Ftext%3E%3C%2Fsvg%3E';
                        }}
                      />
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="banner-image"
                      />
                      <label
                        htmlFor="banner-image"
                        className="inline-block px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-xs sm:text-sm flex-shrink-0 font-semibold"
                      >
                        {uploading ? 'جاري الرفع...' : 'اختر صورة من جهازك'}
                      </label>
                      <input
                        type="text"
                        name="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value, full_image_url: e.target.value }))}
                        placeholder="أو ضع رابط الصورة مباشرة (اختياري)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Link URL and Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      رابط الإعلان (اختياري)
                    </label>
                    <input
                      type="text"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      placeholder="https://example.com أو /products"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      نص الرابط
                    </label>
                    <input
                      type="text"
                      name="link_text"
                      value={formData.link_text}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      placeholder="اكتشف الآن"
                    />
                  </div>
                </div>

                {/* Position and Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      الموضع
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                    >
                      <option value="home">الرئيسية (أعلى صفحة النشاط)</option>
                      <option value="category">الفئات</option>
                      <option value="product">المنتجات</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">نشط</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-reverse space-x-2 sm:space-x-4 pt-3 sm:pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      setSelectedBanner(null)
                      resetForm()
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 text-xs sm:text-sm font-bold"
                  >
                    {uploading ? 'جاري الرفع...' : (selectedBanner ? 'تحديث الإعلان' : 'إضافة الإعلان')}
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
