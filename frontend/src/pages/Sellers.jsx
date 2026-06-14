import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Sellers = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/sellers/top`)
        if (response.ok) {
          const data = await response.json()
          const sellersData = data.data || data || []
          setSellers(Array.isArray(sellersData) ? sellersData : [])
        } else {
          setSellers([])
        }
      } catch (error) {
        console.error('Error fetching sellers:', error)
        setSellers([])
      } finally {
        setLoading(false)
      }
    }

    fetchSellers()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8" dir="rtl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">جميع البائعين</h1>

      {sellers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group"
            >
              {/* Seller Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                    <div className="text-white">
                      <h3 className="text-base sm:text-lg font-bold">{seller.store_name || 'اسم المتجر'}</h3>
                      <p className="text-xs sm:text-sm opacity-90 truncate max-w-[120px] sm:max-w-none">{seller.description || 'وصف المتجر'}</p>
                    </div>
                  </div>
                  {seller.is_verified && (
                    <div className="bg-white text-green-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0">
                      موثوق
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Content */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse mb-3 sm:mb-4">
                  <div className="relative flex-shrink-0">
                    {seller.avatar ? (
                      <img
                        src={seller.avatar.startsWith('http') ? seller.avatar : `${import.meta.env.VITE_API_URL.replace('/api', '')}${seller.avatar}`}
                        alt={seller.store_name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg" style={{display: seller.avatar ? 'none' : 'flex'}}>
                      {seller.store_name ? seller.store_name.charAt(0) : 'ب'}
                    </div>
                    {seller.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 sm:p-1 rounded-full">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4 4a1 1 0 001.414 0zm-1.414 8a1 1 0 00-1.414 0L8 10.586V13a1 1 0 002 0v-2.414l6.293 6.293a1 1 0 000-1.414z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4" fill={i < Math.floor(seller.rating || 0) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600 text-xs sm:text-sm">({seller.rating || '0.0'})</span>
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm">
                      {seller.reviews_count || 0} تقييم
                    </div>
                  </div>
                </div>

                {/* Seller Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-amber-50 p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-amber-600">{seller.total_products || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">المنتجات</div>
                  </div>
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{seller.total_sales || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">المبيعات</div>
                  </div>
                </div>

                {/* Seller Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${seller.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {seller.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <Link
                    to={`/seller/${seller.id}`}
                    className="text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm transition-colors"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600 text-base sm:text-lg mb-4">لا يوجد بائعون حالياً</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      )}
    </div>
  )
}

export default Sellers
