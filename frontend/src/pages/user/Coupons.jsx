import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import api from '../../services/api'
import toast from 'react-hot-toast'

const Coupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, expired, used
  const [showCouponCode, setShowCouponCode] = useState({})
  const [copiedCode, setCopiedCode] = useState('')
  
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await api.get('/coupons')
      setCoupons(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('فشل في جلب الكوبونات')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (code) => {
    try {
      if (!code) return
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('تم نسخ الكود بنجاح')
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (error) {
      toast.error('فشل في نسخ الكود')
    }
  }

  const toggleCouponCode = (couponId) => {
    if (!couponId) return
    setShowCouponCode(prev => ({
      ...prev,
      [couponId]: !prev[couponId]
    }))
  }

  const isCouponExpired = (expiresAt) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const isCouponUsed = (coupon) => {
    if (!coupon) return false
    // Check if user has used this coupon
    return coupon.usedBy?.includes(user?._id)
  }

  const filteredCoupons = (Array.isArray(coupons) ? coupons : []).filter(coupon => {
    const matchesSearch = coupon?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = !isCouponExpired(coupon.expires_at) && !isCouponUsed(coupon)
    } else if (filterStatus === 'expired') {
      matchesStatus = isCouponExpired(coupon.expires_at)
    } else if (filterStatus === 'used') {
      matchesStatus = isCouponUsed(coupon)
    }
    
    return matchesSearch && matchesStatus
  })

  const getCouponStatus = (coupon) => {
    if (!coupon) return { text: 'غير معروف', color: 'gray' }
    if (isCouponUsed(coupon)) return { text: 'تم استخدامه', color: 'gray' }
    if (isCouponExpired(coupon.expires_at)) return { text: 'منتهي الصلاحية', color: 'red' }
    return { text: 'نشط', color: 'green' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">جاري تحميل الكوبونات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            الكوبونات والعروض
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            احصل على خصومات حصرية باستخدام كوبوناتنا
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                البحث عن كوبون
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالكود أو الوصف..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            
            {/* Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                حالة الكوبون
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">جميع الكوبونات</option>
                <option value="active">نشط</option>
                <option value="expired">منتهي الصلاحية</option>
                <option value="used">تم استخدامه</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <svg className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'لا توجد كوبونات مطابقة' : 'لا توجد كوبونات متاحة'}
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'جرب تغيير معايير البحث أو التصفية' 
                : 'سوف تظهر الكوبونات المتاحة هنا'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCoupons.map((coupon) => {
              const status = getCouponStatus(coupon)
              const isExpired = isCouponExpired(coupon.expires_at)
              const isUsed = isCouponUsed(coupon)
              
              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    isExpired || isUsed ? 'opacity-75' : ''
                  }`}
                >
                  {/* Coupon Header */}
                  <div className={`p-3 sm:p-4 text-white ${
                    isExpired ? 'bg-red-500' : 
                    isUsed ? 'bg-gray-500' : 
                    'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold">
                          {coupon?.type === 'percentage' 
                            ? `${coupon?.value}% خصم` 
                            : `${coupon?.value} ريال خصم`
                          }
                        </h3>
                        <p className="text-xs sm:text-sm opacity-90">
                          {coupon?.minimum_amount && `الحد الأدنى للطلب: ${coupon?.minimum_amount} ريال`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Body */}
                  <div className="p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                      {coupon?.description || 'كوبون خصم مميز'}
                    </p>
                    
                    {/* Expiry Date */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      ينتهي في: {coupon?.expires_at ? new Date(coupon.expires_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </div>

                    {/* Coupon Code */}
                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {showCouponCode[coupon?.id] ? (
                            <div className="flex items-center">
                              <span className="text-base sm:text-lg font-mono font-bold text-amber-600">
                                {coupon?.code || 'N/A'}
                              </span>
                              {copiedCode === coupon?.code && (
                                <span className="mr-2 text-green-600 text-xs sm:text-sm">
                                  ✓ تم النسخ
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              •••••••
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-reverse space-x-1 sm:space-x-2">
                          <button
                            onClick={() => toggleCouponCode(coupon?.id)}
                            className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                            disabled={isExpired || isUsed}
                          >
                            {showCouponCode[coupon?.id] ? 'إخفاء' : 'عرض الكود'}
                          </button>
                          {showCouponCode[coupon?.id] && (
                            <button
                              onClick={() => copyToClipboard(coupon?.code)}
                              className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              نسخ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Coupons
