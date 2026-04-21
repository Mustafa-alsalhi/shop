import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

// Simple toast function instead of react-toastify
const showToast = (message, type = 'success') => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }
  
  const toast = document.createElement('div')
  toast.className = `fixed top-4 left-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

const Coupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'fixed',
    value: '',
    minimum_amount: '',
    maximum_discount: '',
    usage_limit: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
    is_first_time_only: false,
    applicable_products: [],
    applicable_categories: []
  })

  useEffect(() => {
    fetchCoupons()
    fetchStatistics()
  }, [])

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCoupons(data.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      showToast('فشل في جلب الكوبونات', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/coupons/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons'
      
      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast(editingCoupon ? 'تم تحديث الكوبون بنجاح' : 'تم إضافة الكوبون بنجاح')
        setShowModal(false)
        setEditingCoupon(null)
        resetForm()
        fetchCoupons()
        fetchStatistics()
      } else {
        const errorData = await response.json()
        showToast(errorData.message || 'فشل في حفظ الكوبون', 'error')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      showToast('فشل في حفظ الكوبون', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        showToast('تم حذف الكوبون بنجاح')
        fetchCoupons()
        fetchStatistics()
      } else {
        showToast('فشل في حذف الكوبون', 'error')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      showToast('فشل في حذف الكوبون', 'error')
    }
  }

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/coupons/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        showToast('تم تحديث حالة الكوبون بنجاح')
        fetchCoupons()
        fetchStatistics()
      } else {
        showToast('فشل في تحديث حالة الكوبون', 'error')
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error)
      showToast('فشل في تحديث حالة الكوبون', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'fixed',
      value: '',
      minimum_amount: '',
      maximum_discount: '',
      usage_limit: '',
      starts_at: '',
      expires_at: '',
      is_active: true,
      is_first_time_only: false,
      applicable_products: [],
      applicable_categories: []
    })
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name || '',
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minimum_amount: coupon.minimum_amount || '',
      maximum_discount: coupon.maximum_discount || '',
      usage_limit: coupon.usage_limit || '',
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
      is_active: coupon.is_active,
      is_first_time_only: coupon.is_first_time_only,
      applicable_products: coupon.applicable_products || [],
      applicable_categories: coupon.applicable_categories || []
    })
    setShowModal(true)
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coupon.name && coupon.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6" dir="rtl">
      
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center">
          <GiftIcon className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-3 text-amber-600" />
          إدارة الكوبونات
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">إدارة وإنشاء كوبونات الخصم للمتجر</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-lg p-2 sm:p-3">
                <TagIcon className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="mr-2 sm:mr-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي الكوبونات</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-2 sm:p-3">
                <CheckCircleIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="mr-2 sm:mr-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">نشط</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-2 sm:p-3">
                <XCircleIcon className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="mr-2 sm:mr-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">منتهي</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.expired}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2 sm:p-3">
                <ChartBarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="mr-2 sm:mr-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">مستخدم</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.used}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2 sm:p-3">
                <TagIcon className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="mr-2 sm:mr-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">غير مستخدم</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.unused}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن كوبون..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 sm:pr-10 pl-3 sm:pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
          />
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingCoupon(null)
            setShowModal(true)
          }}
          className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center text-xs sm:text-sm"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          إضافة كوبون جديد
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكود
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  القيمة
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاستخدام
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-20 sm:max-w-none">{coupon.code}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900 truncate max-w-20 sm:max-w-none">{coupon.name || '-'}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      coupon.type === 'fixed' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {coupon.type === 'fixed' ? 'ثابت' : 'نسبة'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">
                      {coupon.type === 'fixed' 
                        ? `${coupon.value} ريال` 
                        : `${coupon.value}%`}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">
                      {coupon.used_count} / {coupon.usage_limit || '∞'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(coupon.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        coupon.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {coupon.is_active ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left text-xs sm:text-sm font-medium">
                    <div className="flex space-x-reverse space-x-1 sm:space-x-2">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="text-amber-600 hover:text-amber-900"
                        title="تعديل"
                      >
                        <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-3 sm:p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-3 sm:p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {editingCoupon ? 'تعديل كوبون' : 'إضافة كوبون جديد'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    كود الكوبون *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                    placeholder="مثال: SAVE20"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    اسم الكوبون
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                    placeholder="خصم العيد"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    نوع الخصم *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                  >
                    <option value="fixed">ثابت (ريال)</option>
                    <option value="percentage">نسبة مئوية (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    القيمة *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.type === 'percentage' ? '0.01' : '1'}
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                    placeholder={formData.type === 'fixed' ? '50' : '10'}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    الحد الأدنى للطلب
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_amount}
                    onChange={(e) => setFormData({...formData, minimum_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    أقصى خصم
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maximum_discount}
                    onChange={(e) => setFormData({...formData, maximum_discount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                    placeholder="200"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    حد الاستخدام
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    تاريخ البدء
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                  placeholder="وصف الكوبون والشروط..."
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="ml-2 rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">نشط</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_first_time_only}
                    onChange={(e) => setFormData({...formData, is_first_time_only: e.target.checked})}
                    className="ml-2 rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">للعملاء الجدد فقط</span>
                </label>
              </div>

              <div className="flex justify-end space-x-reverse space-x-2 sm:space-x-4 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-xs sm:text-sm"
                >
                  {editingCoupon ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons
