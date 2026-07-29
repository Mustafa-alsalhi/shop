import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CalendarIcon, TagIcon, CubeIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const Offers = () => {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/admin/offers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setOffers(response.data.data || response.data)
    } catch (err) {
      console.error('Failed to fetch offers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedOffer) return

    try {
      const token = localStorage.getItem('token')
      await api.delete(`/admin/offers/${selectedOffer.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setShowDeleteModal(false)
      setSelectedOffer(null)
      fetchOffers()
    } catch (err) {
      console.error('Failed to delete offer:', err)
      alert('فشل حذف العرض')
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'غير نشط' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مجدول' }
    }
    const config = statusMap[status] || statusMap.inactive
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getDiscountTypeLabel = (type) => {
    const typeMap = {
      percentage: 'نسبة %',
      fixed: 'مبلغ ثابت',
      free_shipping: 'شحن مجاني'
    }
    return typeMap[type] || type
  }

  const getBannerUrl = (banner) => {
    if (!banner) return 'https://via.placeholder.com/400x200?text=No+Banner'
    if (banner.startsWith('http')) return banner
    // For Laravel storage, use the storage URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-8385.up.railway.app'
    return `${baseUrl}/storage/${banner.startsWith('/') ? banner.slice(1) : banner}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">إدارة العروض والخصومات</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">إدارة عروض المتجر وربط المنتجات بالعروض</p>
          </div>
          <button
            onClick={() => navigate('/admin/offers/new')}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إنشاء عرض جديد
          </button>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <CubeIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">لا توجد عروض</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">ابدأ بإنشاء عرض جديد لإضافة خصومات لمنتجاتك</p>
            <button
              onClick={() => navigate('/admin/offers/new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إنشاء عرض جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Banner */}
                <div className="relative h-36 sm:h-48">
                  <img
                    src={getBannerUrl(offer.banner)}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(offer.status)}
                  </div>
                  {offer.show_in_home && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        الصفحة الرئيسية
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <TagIcon className="h-4 w-4 ml-2" />
                      <span>{getDiscountTypeLabel(offer.discount_type)}</span>
                      {offer.discount_type !== 'free_shipping' && (
                        <span className="mr-1 font-medium">{offer.discount_value}</span>
                      )}
                    </div>

                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 ml-2" />
                      <span>
                        {offer.start_date ? new Date(offer.start_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                        {' - '}
                        {offer.end_date ? new Date(offer.end_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </span>
                    </div>

                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <CubeIcon className="h-4 w-4 ml-2" />
                      <span>{offer.products_count || 0} منتج</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/admin/offers/${offer.id}`)}
                      className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm"
                    >
                      <EyeIcon className="h-4 w-4 ml-1" />
                      معاينة
                    </button>
                    <button
                      onClick={() => navigate(`/admin/offers/${offer.id}/edit`)}
                      className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                    >
                      <PencilIcon className="h-4 w-4 ml-1" />
                      تعديل
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOffer(offer)
                        setShowDeleteModal(true)
                      }}
                      className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm"
                    >
                      <TrashIcon className="h-4 w-4 ml-1" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف العرض "{selectedOffer.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedOffer(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Offers
