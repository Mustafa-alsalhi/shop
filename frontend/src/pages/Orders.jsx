import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBagIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TruckIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import orderService from '../services/orderService'

const Orders = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'غير متاح'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  const getImageUrl = (imageUrl, productName, size = 80) => {
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    // Try to use provided image URL first (from order_item)
    if (imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' && imageUrl !== null) {
      // If it's already an absolute URL, use it directly
      if (imageUrl.startsWith('http')) {
        return imageUrl
      }
      // If it's a relative path starting with /images/, convert to full URL
      if (imageUrl.startsWith('/images/')) {
        return `${publicUrl}${imageUrl}`
      }
      // Otherwise, treat as relative path
      return `${publicUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    
    // Fallback to placeholder
    return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/${size}x${size}.jpg`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-amber-700 bg-amber-100 border-amber-200'
      case 'processing':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'shipped':
        return 'text-purple-700 bg-purple-100 border-purple-200'
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'processing':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'في انتظار'
      case 'processing':
        return 'قيد المعالجة'
      case 'shipped':
        return 'تم الشحن'
      case 'delivered':
        return 'تم التسليم'
      case 'cancelled':
        return 'ملغي'
      default:
        return 'غير معروف'
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('=== FETCHING ORDERS ===')

      const response = await orderService.getUserOrders()

      if (response.data) {
        console.log('✅ Orders fetched successfully:', response.data)
        // Handle different response formats
        let ordersData = []
        
        if (Array.isArray(response.data)) {
          ordersData = response.data
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data
        }
        
        // Process and normalize order data
        ordersData = ordersData.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount) || 0,
          subtotal: parseFloat(order.subtotal) || 0,
          tax: parseFloat(order.tax) || 0,
          shipping: parseFloat(order.shipping) || 0,
          order_items: order.order_items || order.items || []
        }))
        
        console.log('📋 Processed orders data:', ordersData)
        setOrders(ordersData)
      } else {
        console.log('⚠️ No orders data received')
        setOrders([])
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setError('فشل في تحميل الطلبات. يرجى المحاولة مرة أخرى.')
      dispatch(showErrorNotification('فشل في تحميل الطلبات'))
    } finally {
      setLoading(false)
    }
  }

  // Handle order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  // Handle track order
  const handleTrackOrder = async (order) => {
    try {
      if (!order.tracking_number) {
        dispatch(showErrorNotification('لا يوجد رقم تتبع متاح'))
        return
      }

      const response = await orderService.trackOrder(order.tracking_number)
      
      if (response.data) {
        dispatch(showSuccessNotification('تم تحديث معلومات التتبع'))
        // Refresh orders to get updated tracking info
        fetchOrders()
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      dispatch(showErrorNotification('فشل في تتبع الطلب'))
    }
  }

  // Handle reorder
  const handleReorder = (order) => {
    console.log('Reordering items from order:', order.id)
    dispatch(showSuccessNotification('تمت إضافة العناصر إلى السلة!'))
    navigate('/cart')
  }

  // Effects
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchOrders()
  }, [isAuthenticated, navigate, dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center ml-4">
                <CubeIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-amber-900">طلباتي</h1>
                <p className="text-gray-600 mt-1">
                  تتبع وإدارة طلباتك
                </p>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 ml-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">خطأ في تحميل الطلبات</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchOrders}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    حاول مرة أخرى
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders List */}
          {(!orders || orders.length === 0) && !error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                <ShoppingBagIcon className="h-10 w-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-amber-900 mb-2">لا توجد طلبات بعد</h2>
              <p className="text-gray-600 mb-6">
                لم تقم بوضع أي طلبات بعد. ابدأ التسوق لرؤية طلباتك هنا.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ابدأ التسوق
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {orders && Array.isArray(orders) && orders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-200/30 hover:shadow-xl transition-all duration-300"
                  dir="rtl"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900">
                          طلب #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          تم الطلب في {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="mr-2">{getStatusText(order.status)}</span>
                        </div>
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="p-2 text-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-6 py-4">
                    <div className="flex items-center space-x-reverse space-x-4 mb-4">
                      {(order.order_items || []).slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          src={getImageUrl(item.image_url, item.product_name, 64)}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                      {(order.order_items || []).length > 3 && (
                        <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-amber-700 font-medium">
                            +{(order.order_items || []).length - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {(order.order_items || []).length} {(order.order_items || []).length === 1 ? 'عنصر' : 'عناصر'}
                        </p>
                        <p className="text-sm text-gray-600">
                          الإجمالي: <span className="font-semibold text-amber-900">{order.total_amount ? formatPrice(order.total_amount) : '0.00'} ريال</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.tracking_number && (
                          <button
                            onClick={() => handleTrackOrder(order)}
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                          >
                            تتبع الطلب
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder(order)}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                          إعادة الطلب
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Order Details Modal */}
          {showOrderDetails && selectedOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-amber-200/30"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-amber-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-amber-900">
                      تفاصيل الطلب #{selectedOrder.id}
                    </h2>
                    <button
                      onClick={handleCloseOrderDetails}
                      className="p-2 text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-4">معلومات الطلب</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">تاريخ الطلب:</span>
                            <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الحالة:</span>
                            <div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                              {getStatusIcon(selectedOrder.status)}
                              <span className="ml-2">{getStatusText(selectedOrder.status)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">حالة الدفع:</span>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${selectedOrder.payment_status === 'paid'
                              ? 'text-green-700 bg-green-100 border-green-200'
                              : 'text-amber-700 bg-amber-100 border-amber-200'
                              }`}>
                              {selectedOrder.payment_status === 'paid' ? 'مدفوع' : 'في انتظار'}
                            </span>
                          </div>
                          {selectedOrder.tracking_number && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">رقم التتبع:</span>
                              <span className="font-medium">{selectedOrder.tracking_number}</span>
                            </div>
                          )}
                          {selectedOrder.estimated_delivery && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">التسليم المقدر:</span>
                              <span className="font-medium">{formatDate(selectedOrder.estimated_delivery)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-4">معلومات العميل</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-600">الاسم:</span>
                            <p className="font-medium">
                              {selectedOrder.customer_info ?
                                `${selectedOrder.customer_info.first_name || ''} ${selectedOrder.customer_info.last_name || ''}`.trim()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">البريد الإلكتروني:</span>
                            <p className="font-medium">{selectedOrder.customer_info ? selectedOrder.customer_info.email : 'N/A'}</p>
                          </div>
                          {selectedOrder.customer_info && selectedOrder.customer_info.phone && (
                            <div>
                              <span className="text-gray-600">الهاتف:</span>
                              <p className="font-medium">{selectedOrder.customer_info.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-4">عنوان الشحن</h3>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <p className="font-medium">{selectedOrder.shipping_address ? selectedOrder.shipping_address.address : 'N/A'}</p>
                          <p className="text-gray-600">
                            {selectedOrder.shipping_address ? 
                              `${selectedOrder.shipping_address.city || ''}, ${selectedOrder.shipping_address.state || ''}`.trim()
                              : 'N/A'
                            }
                          </p>
                          <p className="text-gray-600">
                            {selectedOrder.shipping_address ? 
                              `${selectedOrder.shipping_address.postal_code || ''}, ${selectedOrder.shipping_address.country || ''}`.trim()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="lg:col-span-2 mt-8">
                      <h3 className="text-lg font-semibold text-amber-900 mb-4">عناصر الطلب</h3>
                      <div className="bg-amber-50 rounded-lg overflow-hidden">
                        {(selectedOrder.order_items || []).map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center p-4 ${index !== (selectedOrder.order_items || []).length - 1 ? 'border-b border-amber-200' : ''}`}
                          >
                            <img
                              src={getImageUrl(item.image_url, item.product_name, 80)}
                              alt={item.product_name}
                              className="w-20 h-20 object-cover rounded-lg mr-4"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-amber-900">{item.product_name}</h4>
                              <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{item.price ? formatPrice(item.price) : '0.00'} ريال لكل وحدة</p>
                              <p className="font-semibold text-amber-900">{item.total ? formatPrice(item.total) : '0.00'} ريال</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="mt-6 bg-white rounded-lg p-4 border border-amber-200/30">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">المجموع الفرعي:</span>
                            <span className="font-medium">{selectedOrder.total_amount ? formatPrice(selectedOrder.total_amount * 0.9) : '0.00'} ريال</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">الضريبة:</span>
                            <span className="font-medium">{selectedOrder.total_amount ? formatPrice(selectedOrder.total_amount * 0.1) : '0.00'} ريال</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">الشحن:</span>
                            <span className="font-medium text-green-600">مجاني</span>
                          </div>
                          <div className="border-t border-amber-200 pt-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span>الإجمالي:</span>
                              <span className="text-amber-600">{selectedOrder.total_amount ? formatPrice(selectedOrder.total_amount) : '0.00'} ريال</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-amber-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleCloseOrderDetails}
                      className="px-6 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                    >
                      إغلاق
                    </button>
                    <div className="flex items-center space-x-3">
                      {selectedOrder.tracking_number && (
                        <button
                          onClick={() => handleTrackOrder(selectedOrder)}
                          className="px-6 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                        >
                          تتبع الطلب
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder(selectedOrder)}
                        className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-medium"
                      >
                        إعادة الطلب
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default Orders
