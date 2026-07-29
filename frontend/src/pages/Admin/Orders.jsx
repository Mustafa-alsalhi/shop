import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ShoppingBagIcon, EyeIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon, UserIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ShoppingBagIcon as ShoppingCartIcon, CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map bounds updater component
const MapBoundsUpdater = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const storeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3180/3180118.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const formatCurrency = (value) => {
  const num = parseFloat(value || 0)
  return num.toFixed(2)
}

const AdminOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [assigningDriver, setAssigningDriver] = useState(false)

  // Helper function to get currency from order items
  const getOrderCurrency = (order) => {
    if (order.currency) return order.currency
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0]
      if (firstItem.currency) return firstItem.currency
      if (firstItem.product && firstItem.product.currency) return firstItem.product.currency
    }
    return '$' // Default fallback currency for the store
  }

  useEffect(() => {
    fetchOrders()
    fetchDrivers()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data.data || response.data)
      setLoading(false)
    } catch (err) {
      setError('فشل في جلب الطلبات: ' + err.message)
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers')
      setDrivers(response.data.data || response.data)
    } catch (err) {
      console.error('فشل في جلب المناديب:', err)
    }
  }

  const [smartDrivers, setSmartDrivers] = useState([])
  const [loadingSmartDrivers, setLoadingSmartDrivers] = useState(false)

  const handleAssignDriver = async (orderId, driverId = null) => {
    const targetDriver = driverId || selectedDriver;
    if (!targetDriver) {
      alert('يرجى اختيار مندوب');
      return;
    }

    setAssigningDriver(true);
    try {
      const response = await api.post(`/admin/orders/${orderId}/assign-driver`, {
        driver_id: targetDriver
      });
      
      // تحديث الطلب في القائمة
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, driver_id: response.data.data.driver, driver_status: response.data.data.order.driver_status }
          : order
      ))
      
      // تحديث الطلب المحدد
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          driver_id: response.data.data.driver,
          driver_status: response.data.data.order.driver_status
        })
      }
      
      setSelectedDriver('')
      alert('تم تعيين المندوب بنجاح')
    } catch (err) {
      console.error('فشل في تعيين المندوب:', err)
      alert('فشل في تعيين المندوب')
    } finally {
      setAssigningDriver(false)
    }
  }

  const handleView = async (order) => {
    setLoadingItems(true)
    setSelectedOrder(order)
    
    try {
      console.log('Fetching items for order:', order.id)
      const fullOrderResponse = await fetchOrderDetails(order.id)
      const fullOrder = fullOrderResponse?.data || fullOrderResponse || order
      
      let paymentRequests = fullOrder.payment_requests || []
      
      if (!paymentRequests || paymentRequests.length === 0) {
        try {
          const paymentResponse = await api.get(`/admin/payment-requests`)
          const requestsList = paymentResponse.data.data || paymentResponse.data || []
          if (Array.isArray(requestsList)) {
            paymentRequests = requestsList.filter(pr => pr.order_id === order.id || pr.order_id === String(order.id))
          }
        } catch (paymentError) {
          console.error('Error fetching payment requests:', paymentError)
        }
      }
      
      const orderItems = fullOrder.items || fullOrder.products || fullOrder.order_items || order.items || []
      
      const orderWithItemsAndPayment = {
        ...order,
        ...fullOrder,
        items: orderItems,
        payment_requests: paymentRequests
      }
      
      setSelectedOrder(orderWithItemsAndPayment)
      
      try {
        setLoadingSmartDrivers(true)
        const smartRes = await api.get(`/admin/orders/${order.id}/smart-drivers`)
        setSmartDrivers(smartRes.data.data)
      } catch (err) {
        console.error('Failed smart drivers:', err)
      } finally {
        setLoadingSmartDrivers(false)
      }

      console.log('Updated order with items and payment:', orderWithItemsAndPayment)
    } catch (err) {
      console.error('Error fetching order details:', err)
    } finally {
      setLoadingItems(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`)
      return response.data
    } catch (err) {
      setError('فشل في جلب تفاصيل الطلب: ' + err.message)
      return null
    }
  }

  const fetchOrderItems = async (orderId, orderNumber = null) => {
    try {
      console.log(`Fetching items for order ID: ${orderId}, order_number: ${orderNumber}`)
      
      // جلب الطلب الكامل مباشرة - هذا هو الـ endpoint الصحيح
      console.log('Trying to fetch full order with items...')
      try {
        const fullOrderResponse = await api.get(`/orders/${orderId}`)
        console.log('Full order response:', fullOrderResponse.data)
        
        if (fullOrderResponse.data) {
          const order = fullOrderResponse.data
          let items = null
          
          // التحقق من المنتجات في الطلب الكامل
          if (order.items && Array.isArray(order.items)) {
            items = order.items
          } else if (order.products && Array.isArray(order.products)) {
            items = order.products
          } else if (order.order_items && Array.isArray(order.order_items)) {
            items = order.order_items
          }
          
          if (items && items.length > 0) {
            console.log(`Found ${items.length} items in full order`)
            return items
          }
        }
      } catch (fullOrderErr) {
        console.log('Failed to fetch full order:', fullOrderErr.message)
      }
      
      // إذا لم يتم العثور على منتجات، جرب endpoints أخرى
      console.log('Trying alternative endpoints...')
      const endpoints = [
        `/orders/${orderId}/items`,
        `/order-items/${orderId}`,
        `/orders/${orderId}/products`,
        `/order-items?order_id=${orderId}`
      ]
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          const response = await api.get(endpoint)
          console.log(`Response from ${endpoint}:`, response.data)
          
          // التحقق من هيكل الاستجابة المختلف
          let items = null
          if (response.data) {
            if (Array.isArray(response.data)) {
              items = response.data
            } else if (response.data.data && Array.isArray(response.data.data)) {
              items = response.data.data
            } else if (response.data.items && Array.isArray(response.data.items)) {
              items = response.data.items
            } else if (response.data.order_items && Array.isArray(response.data.order_items)) {
              items = response.data.order_items
            } else if (response.data.products && Array.isArray(response.data.products)) {
              items = response.data.products
            }
          }
          
          if (items && items.length > 0) {
            console.log(`Found ${items.length} items from ${endpoint}`)
            return items
          }
        } catch (endpointErr) {
          console.log(`Failed to fetch from ${endpoint}:`, endpointErr.message)
          // تجربة النقطة التالية
          continue
        }
      }
      
      return null
    } catch (err) {
      console.log('Error in fetchOrderItems:', err.message)
      return null
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus })
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      alert('تم تحديث حالة الطلب بنجاح!')
    } catch (err) {
      setError('فشل في تحديث حالة الطلب: ' + err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null

    const currency = getOrderCurrency(order)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 p-3 sm:p-4" dir="rtl">
        <div className="relative top-4 sm:top-20 mx-auto p-3 sm:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">تفاصيل الطلب #{order.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="mt-4 space-y-3 sm:space-y-4">
            {/* معلومات العميل */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                معلومات العميل
              </h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">الاسم:</span>
                  <span className="font-medium text-xs sm:text-sm">{order.user?.name || 'غير معروف'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">البريد:</span>
                  <span className="font-medium text-xs sm:text-sm truncate">{order.user?.email || 'لا يوجد'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">الهاتف:</span>
                  <span className="font-medium text-xs sm:text-sm">{order.user?.phone || 'لا يوجد'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">العنوان:</span>
                  <span className="font-medium text-xs sm:text-sm">
                    {typeof order.shipping_address === 'object' 
                      ? order.shipping_address.address || 'لا يوجد'
                      : order.shipping_address || 'لا يوجد'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* معلومات الطلب */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                معلومات الطلب
              </h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">رقم الطلب:</span>
                  <span className="font-bold text-blue-600 text-xs sm:text-sm">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">التاريخ:</span>
                  <span className="font-medium text-xs sm:text-sm">{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">الحالة:</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status === 'pending' ? 'قيد الانتظار' :
                     order.status === 'processing' ? 'قيد المعالجة' :
                     order.status === 'shipped' ? 'تم تجهيز الطلب' :
                     order.status === 'delivered' ? 'تم التسليم' :
                     order.status === 'cancelled' ? 'ملغي' :
                     order.status || 'pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">الإجمالي:</span>
                  <span className="font-bold text-base sm:text-lg text-green-600">
                    {currency} {order.total || order.subtotal || order.amount || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">طريقة الدفع:</span>
                  <span className="font-medium text-xs sm:text-sm">{order.payment_method || 'غير محدد'}</span>
                </div>
                {order.shipping_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">تكلفة الشحن:</span>
                    <span className="font-medium text-xs sm:text-sm">{currency} {order.shipping_cost}</span>
                  </div>
                )}
                {order.tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">الضريبة:</span>
                    <span className="font-medium text-xs sm:text-sm">{currency} {order.tax}</span>
                  </div>
                )}
                {order.discount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">الخصم:</span>
                    <span className="font-medium text-red-600 text-xs sm:text-sm">-{currency} {order.discount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* المنتجات */}
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                المنتجات
              </h4>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex gap-3">
                        {/* صورة المنتج */}
                        <div className="flex-shrink-0">
                          {item.image || item.product?.image || item.image_url ? (
                            <img
                              src={(item.image || item.product?.image || item.image_url).startsWith('http')
                                ? (item.image || item.product?.image || item.image_url)
                                : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${item.image || item.product?.image || item.image_url}`
                              }
                              alt={item.name || item.product?.name || 'صورة المنتج'}
                              className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                              <ShoppingBagIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* تفاصيل المنتج */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                            {item.name || item.product?.name || item.product_name || 'منتج غير معروف'}
                          </div>
                          
                          {item.description || item.product?.description ? (
                            <div className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                              {item.description || item.product?.description}
                            </div>
                          ) : null}

                          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">الكمية:</span> {item.quantity || 1}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">السعر:</span> {currency} {item.price || item.product?.price || item.unit_price || '0.00'}
                            </div>
                            {item.category || item.product?.category ? (
                              <div className="text-gray-600">
                                <span className="font-medium">الفئة:</span> {item.category || item.product?.category}
                              </div>
                            ) : null}
                            {item.sku || item.product?.sku ? (
                              <div className="text-gray-600">
                                <span className="font-medium">SKU:</span> {item.sku || item.product?.sku}
                              </div>
                            ) : null}
                            {/* Display selected variant (color/size) */}
                            {item.variant || item.selected_variant || item.variant_name ? (
                              <div className="text-gray-600">
                                <span className="font-medium">الخيار:</span> {item.variant_name || item.variant?.name || item.selected_variant?.name || item.variant?.value || item.selected_variant?.value}
                              </div>
                            ) : null}
                            {/* Display color if available */}
                            {item.color || item.variant_color || item.selected_color ? (
                              <div className="text-gray-600 flex items-center gap-2">
                                <span className="font-medium">اللون:</span>
                                <span>{item.color || item.variant_color || item.selected_color}</span>
                                {(item.color_code || item.hex_code) && (
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color_code || item.hex_code }}
                                  />
                                )}
                              </div>
                            ) : null}
                            {/* Display size if available */}
                            {item.size || item.variant_size || item.selected_size ? (
                              <div className="text-gray-600">
                                <span className="font-medium">المقاس:</span> {item.size || item.variant_size || item.selected_size}
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">الإجمالي:</span>
                              <span className="font-bold text-base sm:text-lg text-green-600">
                                {currency} {((item.price || item.product?.price || item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8 text-xs sm:text-sm">
                    لا توجد منتجات في هذا الطلب
                  </div>
                )}
              </div>
            </div>

            {/* معلومات الشحن */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                معلومات الشحن
              </h4>
              <div className="space-y-1 sm:space-y-2">
                {order.formatted_address && (
                  <div className="flex">
                    <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">العنوان:</span>
                    <span className="font-medium text-xs sm:text-sm">{order.formatted_address}</span>
                  </div>
                )}
                {order.building_details && (
                  <div className="flex">
                    <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">تفاصيل المبنى:</span>
                    <span className="font-medium text-xs sm:text-sm">{order.building_details}</span>
                  </div>
                )}
                {order.latitude && order.longitude && (
                  <>
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">خط العرض:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {typeof order.latitude === 'number' ? order.latitude.toFixed(6) : order.latitude}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">خط الطول:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {typeof order.longitude === 'number' ? order.longitude.toFixed(6) : order.longitude}
                      </span>
                    </div>
                    <div className="mt-2">
                      <a
                        href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                      >
                        <MapPinIcon className="h-4 w-4" />
                        عرض على الخريطة
                      </a>
                    </div>
                  </>
                )}
                {/* Fallback for old orders without location data */}
                {!order.formatted_address && typeof order.shipping_address === 'object' && (
                  <>
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">العنوان:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {order.shipping_address.address || 'لا يوجد'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">المدينة:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {order.shipping_address.city || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">الرمز البريدي:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {order.shipping_address.postal_code || 'غير محدد'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* معلومات استلام البائع */}
            {order.items && order.items.length > 0 && order.items[0]?.product?.seller && (
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2 text-orange-600" />
                  معلومات استلام البائع
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex">
                    <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">المتجر:</span>
                    <span className="font-medium text-xs sm:text-sm">{order.items[0].product.seller.store_name}</span>
                  </div>
                  {order.items[0].product.seller.address && (
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">العنوان:</span>
                      <span className="font-medium text-xs sm:text-sm">{order.items[0].product.seller.address}</span>
                    </div>
                  )}
                  {order.items[0].product.seller.city && (
                    <div className="flex">
                      <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">المدينة:</span>
                      <span className="font-medium text-xs sm:text-sm">{order.items[0].product.seller.city}</span>
                    </div>
                  )}
                  {order.items[0].product.seller.latitude && order.items[0].product.seller.longitude && (
                    <div className="mt-2">
                      <a
                        href={`https://www.google.com/maps?q=${order.items[0].product.seller.latitude},${order.items[0].product.seller.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 text-xs sm:text-sm"
                      >
                        <MapPinIcon className="h-4 w-4" />
                        موقع البائع على الخريطة
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ملخص الأسعار */}
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                ملخص الأسعار
              </h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">المجموع الفرعي:</span>
                  <span className="font-medium text-xs sm:text-sm">
                    {currency} {parseFloat(order.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                
                {parseFloat(order.shipping_cost || order.shipping || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">تكلفة الشحن:</span>
                    <span className="font-medium text-xs sm:text-sm">{currency} {parseFloat(order.shipping_cost || order.shipping || 0).toFixed(2)}</span>
                  </div>
                )}
                
                {parseFloat(order.tax || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">الضريبة:</span>
                    <span className="font-medium text-xs sm:text-sm">{currency} {parseFloat(order.tax || 0).toFixed(2)}</span>
                  </div>
                )}
                
                {parseFloat(order.discount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">الخصم:</span>
                    <span className="font-medium text-red-600 text-xs sm:text-sm">-{currency} {parseFloat(order.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">الإجمالي النهائي:</span>
                    <span className="font-bold text-base sm:text-lg text-green-600">
                      {currency} {parseFloat(order.total_amount || order.total || order.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* بيانات الدفع */}
            {(order.payment_method || order.payment_requests) && (
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  بيانات الدفع
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {order.payment_method && (
                    <div className="flex">
                      <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm">طريقة الدفع:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {order.payment_requests && order.payment_requests.length > 0 
                          ? order.payment_requests[0].payment_method_name 
                          : order.payment_method}
                      </span>
                    </div>
                  )}
                  {order.payment_requests && order.payment_requests.length > 0 && (
                    <>
                      <div className="flex">
                        <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm">اسم الدافع:</span>
                        <span className="font-medium text-xs sm:text-sm">
                          {order.payment_requests[0].payer_name || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm">رقم المرجع:</span>
                        <span className="font-medium text-xs sm:text-sm">
                          {order.payment_requests[0].reference_number || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm">رقم الهاتف:</span>
                        <span className="font-medium text-xs sm:text-sm">
                          {order.payment_requests[0].phone_number || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm">حالة الدفع:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.payment_requests[0].status === 'approved' ? 'bg-green-100 text-green-800' :
                          order.payment_requests[0].status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment_requests[0].status === 'approved' ? 'موافق عليه' :
                           order.payment_requests[0].status === 'rejected' ? 'مرفوض' :
                           'قيد الانتظار'}
                        </span>
                      </div>
                      {order.payment_requests[0].payment_notes && (
                        <div className="flex">
                          <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm">ملاحظات الدفع:</span>
                          <span className="font-medium text-xs sm:text-sm">
                            {order.payment_requests[0].payment_notes}
                          </span>
                        </div>
                      )}
                      {order.payment_requests[0].payment_image_path && (
                        <div className="mt-2">
                          <span className="text-gray-600 w-20 sm:w-24 text-xs sm:text-sm block mb-2">صورة الدفع:</span>
                          <img
                            src={order.payment_requests[0].payment_image_path.startsWith('http') 
                              ? order.payment_requests[0].payment_image_path 
                              : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${order.payment_requests[0].payment_image_path}`}
                            alt="صورة إثبات الدفع"
                            className="max-w-full sm:max-w-sm h-auto rounded-xl border-2 border-dashed border-gray-300 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => window.open(order.payment_requests[0].payment_image_path.startsWith('http') 
                              ? order.payment_requests[0].payment_image_path 
                              : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${order.payment_requests[0].payment_image_path}`, '_blank')}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ملاحظات */}
            {order.notes && (
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                  <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  ملاحظات
                </h4>
                <p className="text-gray-700 text-xs sm:text-sm">{order.notes}</p>
              </div>
            )}

            {/* إدارة التوصيل */}
            <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                إدارة التوصيل
              </h4>
              <div className="space-y-2 sm:space-y-3">
                {order.driver_id && order.driver_status !== 'rejected' ? (
                  <div className="bg-white p-2 sm:p-3 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">المندوب المعين:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.driver_status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        order.driver_status === 'picked_up_from_seller' ? 'bg-yellow-100 text-yellow-800' :
                        order.driver_status === 'out_for_delivery' ? 'bg-orange-100 text-orange-800' :
                        order.driver_status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.driver_status === 'assigned' ? 'معين' :
                         order.driver_status === 'picked_up_from_seller' ? 'تم الاستلام من البائع' :
                         order.driver_status === 'out_for_delivery' ? 'جاري التوصيل' :
                         order.driver_status === 'delivered' ? 'تم التسليم' :
                         order.driver_status || 'غير محدد'}
                      </span>
                    </div>
                    {order.driver && (
                      <>
                        <div className="flex">
                          <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">الاسم:</span>
                          <span className="font-medium text-xs sm:text-sm">{order.driver.name}</span>
                        </div>
                        {order.driver.phone && (
                          <div className="flex">
                            <span className="text-gray-600 w-16 sm:w-20 text-xs sm:text-sm">الهاتف:</span>
                            <a 
                              href={`tel:${order.driver.phone}`}
                              className="font-medium text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                            >
                              {order.driver.phone}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {order.driver_status === 'rejected' && (
                      <div className="bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200 mb-2">
                        <p className="font-bold text-red-800 text-xs sm:text-sm">تحذير: قام المندوب الأخير ({order.driver?.name}) برفض التوصيل.</p>
                        <p className="text-xs text-red-600 mt-1">يرجى تعيين مندوب بديل.</p>
                      </div>
                    )}
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      قائمة المناديب المتوفرين (نظام التعيين الذكي):
                    </label>
                    {loadingSmartDrivers ? (
                      <div className="flex justify-center py-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="spinner h-6 w-6"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-200 z-0">
                          {(() => {
                            const firstItem = (order && order.items && order.items.length > 0) ? order.items[0] : null;
                            const seller = (firstItem && firstItem.product && firstItem.product.seller) ? firstItem.product.seller : null;
                            const sellerLat = (seller && seller.latitude) ? parseFloat(seller.latitude) : null;
                            const sellerLng = (seller && seller.longitude) ? parseFloat(seller.longitude) : null;
                            const custLat = order?.latitude ? parseFloat(order.latitude) : null;
                            const custLng = order?.longitude ? parseFloat(order.longitude) : null;
                            
                            const bounds = [];
                            if (sellerLat && sellerLng) bounds.push([sellerLat, sellerLng]);
                            if (custLat && custLng) bounds.push([custLat, custLng]);
                            smartDrivers.forEach(d => {
                              if (d.latitude && d.longitude && d.smart_status !== 'offline') {
                                bounds.push([parseFloat(d.latitude), parseFloat(d.longitude)]);
                              }
                            });

                            return (
                              <MapContainer 
                                center={bounds.length > 0 ? bounds[0] : [24.7136, 46.6753]} 
                                zoom={12} 
                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                                dragging={true}
                              >
                                <TileLayer
                                  attribution={"&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"}
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {bounds.length > 1 && <MapBoundsUpdater bounds={bounds} />}
                                
                                {sellerLat !== null && sellerLng !== null && (
                                  <Marker position={[sellerLat, sellerLng]} icon={storeIcon}>
                                    <Popup>
                                      <div className="text-center font-bold">
                                        موقع الإستلام (البائع)<br />
                                        {seller ? seller.store_name : ''}
                                      </div>
                                    </Popup>
                                  </Marker>
                                )}
                                
                                {custLat !== null && custLng !== null && (
                                  <Marker position={[custLat, custLng]} icon={customerIcon}>
                                    <Popup>
                                      <div className="text-center font-bold text-indigo-700">
                                        موقع التسليم (العميل)<br />
                                        {order?.user?.name || ''}
                                      </div>
                                    </Popup>
                                  </Marker>
                                )}
                                
                                {sellerLat !== null && sellerLng !== null && custLat !== null && custLng !== null && (
                                  <Polyline positions={[[sellerLat, sellerLng], [custLat, custLng]]} color="#4F46E5" weight={3} dashArray="5, 10" />
                                )}

                                {smartDrivers.map(d => {
                                  if (!d.latitude || !d.longitude || d.smart_status === 'offline') return null;
                                  return (
                                    <Marker key={d.id} position={[parseFloat(d.latitude), parseFloat(d.longitude)]}>
                                      <Popup>
                                        <div className="text-center">
                                          <div className="font-bold">{d.name}</div>
                                          <div className="text-xs mt-1">{d.smart_status === 'available' ? 'متوفر' : 'مشغول'}</div>
                                        </div>
                                      </Popup>
                                    </Marker>
                                  )
                                })}
                              </MapContainer>
                            );
                          })()}
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                          {smartDrivers.map(driver => (
                          <div 
                            key={driver.id}
                            className={`flex flex-col lg:flex-row lg:items-center justify-between p-3 rounded-lg border ${
                              selectedDriver === driver.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'
                            } cursor-pointer transition-colors shadow-sm`}
                            onClick={() => {
                              if (driver.smart_status !== 'offline') setSelectedDriver(driver.id)
                            }}
                          >
                            <div className="flex items-center gap-3 mb-3 lg:mb-0">
                              <span className={`flex-shrink-0 h-3 w-3 rounded-full ${
                                driver.smart_status === 'available' ? 'bg-green-500 animate-pulse' :
                                driver.smart_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></span>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{driver.name}</p>
                                <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded">{driver.work_zone || 'منطقة غير محددة'}</span>
                                  <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center">
                                    <MapPinIcon className="h-3 w-3 inline mr-1" />
                                    {driver.distance_km != null ? `يبعد عن المتجر: ${parseFloat(driver.distance_km).toFixed(1)} كم` : 'المسافة عن المتجر غير معروفة (الموقع غير مسجل)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
                              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                                driver.smart_status === 'available' ? 'bg-green-100 text-green-800' :
                                driver.smart_status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {driver.smart_status === 'available' ? 'متاح للعمل (0 طلب)' :
                                 driver.smart_status === 'busy' ? `مشغول (${driver.active_orders_count} طلب)` : 'مغلق / غير متاح'}
                              </span>
                              <button
                                disabled={driver.smart_status === 'offline' || assigningDriver}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDriver(driver.id);
                                  handleAssignDriver(order.id, driver.id);
                                }}
                                className="px-4 py-1.5 bg-indigo-600 text-white fill-current rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs font-semibold whitespace-nowrap min-w-[70px] shadow-sm"
                              >
                                {assigningDriver && selectedDriver === driver.id ? 'جاري...' : 'تعيين'}
                              </button>
                            </div>
                          </div>
                        ))}
                        {smartDrivers.length === 0 && (
                          <div className="text-center text-sm text-gray-500 py-6">لا يوجد مناديب مسجلين</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-reverse space-x-2 sm:space-x-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                handleUpdateStatus(order.id, 'delivered')
                onClose()
              }}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
            >
              تأكيد التسليم
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  // Group by store name dynamically
  const groupedOrdersByStore = React.useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      let storeName = 'طلبات المتجر العام'
      if (order.items && order.items.length > 0 && order.items[0]?.product?.seller?.store_name) {
        storeName = order.items[0].product.seller.store_name
      }
      
      if (!acc[storeName]) {
        acc[storeName] = []
      }
      acc[storeName].push(order)
      return acc
    }, {})
  }, [filteredOrders])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg sm:rounded-xl">
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                إدارة الطلبات
              </h1>
            </div>
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 font-medium text-xs sm:text-sm"
              >
                <option value="all">جميع الطلبات</option>
                <option value="pending">في الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">تم تجهيز الطلب</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-lg">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <span className="font-medium text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Grouped Orders Table */}
        <div className="space-y-6">
          {Object.keys(groupedOrdersByStore).length > 0 ? (
            Object.keys(groupedOrdersByStore).map(storeName => (
              <div key={storeName} className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden mb-6 animate-fade-in-up">
                {/* Store Header bar */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
                      <ShoppingBagIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 border-r-4 border-indigo-500 pr-3 my-1">
                      {storeName}
                      <span className="text-sm font-medium text-gray-500 mr-3 px-3 py-1 bg-gray-200 rounded-full">
                        {groupedOrdersByStore[storeName].length} طلبات
                      </span>
                    </h3>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#f8fafc]">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">العميل</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">الإجمالي</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">التاريخ</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {groupedOrdersByStore[storeName].map((order) => (
                        <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors duration-200 border-l-4 border-transparent hover:border-indigo-400">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                                {order.id}
                              </div>
                              <span className="text-indigo-900">#{order.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800">{order.user?.name || 'غير معروف'}</span>
                              <span className="text-gray-500 text-xs mt-0.5">{order.user?.email || 'لا يوجد إيميل'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg">
                               {getOrderCurrency(order)} {formatCurrency(order.total || order.total_amount || order.subtotal)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full shadow-sm border ${
                               order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                               order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                               order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                               order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                               order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                               'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {order.status === 'pending' ? '⏳ قيد الانتظار' :
                               order.status === 'processing' ? '⚙️ قيد المعالجة' :
                               order.status === 'shipped' ? '📦 تم التجهيز' :
                               order.status === 'delivered' ? '✅ تم التسليم' :
                               order.status === 'cancelled' ? '❌ ملغي' :
                               order.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 text-right">
                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(order)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="عرض التفاصيل"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <select
                                value={order.status || 'pending'}
                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer shadow-sm hover:border-indigo-300"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="processing">قيد المعالجة</option>
                                <option value="shipped">تم الشحن أو تجهيز الطلب</option>
                                <option value="delivered">تم التسليم النهائي</option>
                                <option value="cancelled">إلغاء الطلب</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow border border-gray-100">
               <div className="text-gray-400 mb-4 inline-block p-4 bg-gray-50 rounded-full"><ShoppingBagIcon className="w-16 h-16"/></div>
               <h3 className="text-xl font-bold text-gray-800">لا توجد طلبات للعرض</h3>
               <p className="text-gray-500 mt-2 text-sm">لم يتم العثور على أي طلبات تتوافق مع عمليات الفرز الحالية.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  )
}

export default AdminOrders
