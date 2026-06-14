import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Sellers = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSeller, setEditingSeller] = useState(null)
  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    avatar: '',
    avatar_file: null,
    rating: 4.80,
    reviews_count: 125,
    status: 'active',
    is_verified: true
  })

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      } else {
        toast.error('فشل في جلب البائعين')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }
      
      const url = editingSeller ? `/api/admin/sellers/${editingSeller.id}` : '/api/admin/sellers'
      const method = editingSeller ? 'POST' : 'POST' // Both use POST but with different handling
      
      const submitData = new FormData()
      
      // Add _method field only for editing (PUT simulation)
      if (editingSeller) {
        submitData.append('_method', 'PUT')
      }
      
      Object.keys(formData).forEach(key => {
        if (key !== 'avatar_file') {
          let value = formData[key] ?? ''
          if (key === 'is_verified' && typeof value === 'boolean') {
            value = value ? '1' : '0'
          }
          submitData.append(key, value)
        }
      })
      
      if (formData.avatar_file) {
        submitData.append('avatar_file', formData.avatar_file)
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: submitData
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(editingSeller ? 'تم تحديث البائع بنجاح' : 'تم إضافة البائع بنجاح')
        setShowModal(false)
        setEditingSeller(null)
        resetForm()
        fetchSellers()
      } else {
        let error
        try {
          const responseText = await response.text()
          
          // Check if it's HTML (error page) instead of JSON
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            error = { message: 'حدث خطأ في الخادم - يرجى المحاولة مرة أخرى' }
          } else if (responseText.trim()) {
            try {
              error = JSON.parse(responseText)
            } catch (jsonError) {
              error = { message: 'حدث خطأ في تحليل الاستجابة' }
            }
          } else {
            error = { message: 'حدث خطأ غير معروف' }
          }
        } catch (parseError) {
          error = { message: 'حدث خطأ في تحليل الاستجابة' }
        }
        
        if (error.errors) {
          // Show validation errors
          const errorMessages = Object.values(error.errors).flat()
          errorMessages.forEach(msg => toast.error(msg))
        } else {
          toast.error(error.message || 'فشل في حفظ البائع')
        }
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const handleEdit = (seller) => {
    setEditingSeller(seller)
    setFormData({
      store_name: seller.store_name,
      description: seller.description,
      avatar: seller.avatar,
      avatar_file: null,
      rating: seller.rating,
      reviews_count: seller.reviews_count,
      status: seller.status,
      is_verified: seller.is_verified
    })
    setShowModal(true)
  }

  const handleDelete = async (sellerId) => {
    if (!confirm('هل أنت متأكد من حذف هذا البائع؟')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('تم حذف البائع بنجاح')
        fetchSellers()
      } else {
        toast.error('فشل في حذف البائع')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const resetForm = () => {
    setFormData({
      store_name: '',
      description: '',
      avatar: '',
      avatar_file: null,
      rating: 4.80,
      reviews_count: 125,
      status: 'active',
      is_verified: true
    })
  }

  const openModal = () => {
    resetForm()
    setEditingSeller(null)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة البائعين</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة بائع جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم المتجر
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الوصف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التقييم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد التقييمات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                موثق
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد المنتجات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {seller.store_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {seller.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-amber-500">★</span>
                    <span className="mr-1">{seller.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {seller.reviews_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    seller.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {seller.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {seller.is_verified ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {seller.products_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(seller)}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(seller.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSeller ? 'تعديل البائع' : 'إضافة بائع جديد'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المتجر *
                </label>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة البائع
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      رفع صورة من الملفات
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, avatar_file: e.target.files[0]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      أو رابط الصورة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  {formData.avatar_file && (
                    <div className="text-xs text-green-600">
                      تم اختيار صورة: {formData.avatar_file.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التقييم
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد التقييمات
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviews_count}
                    onChange={(e) => setFormData({...formData, reviews_count: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موثق
                  </label>
                  <select
                    value={formData.is_verified}
                    onChange={(e) => setFormData({...formData, is_verified: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value={true}>نعم</option>
                    <option value={false}>لا</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors"
                >
                  {editingSeller ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sellers
