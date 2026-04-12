import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { ShoppingBagIcon, EyeIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon, UserIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ShoppingBagIcon as ShoppingCartIcon, CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

const AdminOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    fetchOrders()
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

  const handleView = async (order) => {
    setLoadingItems(true)
    setSelectedOrder(order) // عرض الطلب أولاً
    
    // جلب المنتجات من API مختلفة
    try {
      console.log('Fetching items for order:', order.id, 'order_number:', order.order_number)
      const orderItems = await fetchOrderItems(order.id, order.order_number)
      if (orderItems) {
        // إضافة المنتجات إلى بيانات الطلب
        const orderWithItems = {
          ...order,
          items: orderItems
        }
        setSelectedOrder(orderWithItems)
        console.log('Updated order with items:', orderWithItems)
      } else {
        console.log('No items found for order:', order.id)
      }
    } catch (err) {
      console.error('Error fetching order items:', err)
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50" dir="rtl">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/5 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-bold text-gray-900">تفاصيل الطلب #{order.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* معلومات العميل */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <UserIcon className="h-5 w-5 ml-2" />
                معلومات العميل
              </h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-20">الاسم:</span>
                  <span className="font-medium">{order.user?.name || 'غير معروف'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">البريد:</span>
                  <span className="font-medium">{order.user?.email || 'لا يوجد'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">الهاتف:</span>
                  <span className="font-medium">{order.user?.phone || 'لا يوجد'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">العنوان:</span>
                  <span className="font-medium">
                    {typeof order.shipping_address === 'object' 
                      ? order.shipping_address.address || 'لا يوجد'
                      : order.shipping_address || 'لا يوجد'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* معلومات الطلب */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 ml-2" />
                معلومات الطلب
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الطلب:</span>
                  <span className="font-bold text-blue-600">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status === 'pending' ? 'قيد الانتظار' :
                     order.status === 'processing' ? 'قيد المعالجة' :
                     order.status === 'shipped' ? 'تم الشحن' :
                     order.status === 'delivered' ? 'تم التسليم' :
                     order.status === 'cancelled' ? 'ملغي' :
                     order.status || 'pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="font-bold text-lg text-green-600">
                    ${order.total || order.subtotal || order.amount || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <span className="font-medium">{order.payment_method || 'غير محدد'}</span>
                </div>
                {order.shipping_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">تكلفة الشحن:</span>
                    <span className="font-medium">${order.shipping_cost}</span>
                  </div>
                )}
                {order.tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة:</span>
                    <span className="font-medium">${order.tax}</span>
                  </div>
                )}
                {order.discount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="font-medium text-red-600">-${order.discount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* المنتجات */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ShoppingBagIcon className="h-5 w-5 ml-2" />
                المنتجات
              </h4>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.name || item.product?.name || 'منتج غير معروف'}
                        </div>
                        <div className="text-sm text-gray-600">الكمية: {item.quantity || 1}</div>
                        <div className="text-sm text-gray-600">السعر: ${item.price || item.product?.price || '0.00'}</div>
                        {item.product?.image && (
                          <div className="mt-1">
                            <img 
                              src={item.product.image} 
                              alt={item.name || 'صورة المنتج'} 
                              className="h-12 w-12 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      <div className="font-bold">
                        ${((item.price || item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    لا توجد منتجات في هذا الطلب
                  </div>
                )}
              </div>
            </div>

            {/* معلومات الشحن */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TruckIcon className="h-5 w-5 ml-2" />
                معلومات الشحن
              </h4>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-20">العنوان:</span>
                  <span className="font-medium">
                    {typeof order.shipping_address === 'object' 
                      ? order.shipping_address.address || 'لا يوجد'
                      : order.shipping_address || 'لا يوجد'
                    }
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">المدينة:</span>
                  <span className="font-medium">
                    {typeof order.shipping_address === 'object' 
                      ? order.shipping_address.city || 'غير محدد'
                      : order.city || 'غير محدد'
                    }
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-20">الرمز البريدي:</span>
                  <span className="font-medium">
                    {typeof order.shipping_address === 'object' 
                      ? order.shipping_address.postal_code || 'غير محدد'
                      : order.postal_code || 'غير محدد'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* ملخص الأسعار */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCardIcon className="h-5 w-5 ml-2" />
                ملخص الأسعار
              </h4>
              <div className="space-y-2">
                {order.items && order.items.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإجمالي الفرعي:</span>
                    <span className="font-medium">
                      ${order.items.reduce((sum, item) => 
                        sum + ((item.price || item.product?.price || 0) * (item.quantity || 1)), 0
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                {order.shipping_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">تكلفة الشحن:</span>
                    <span className="font-medium">${order.shipping_cost}</span>
                  </div>
                )}
                {order.tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة:</span>
                    <span className="font-medium">${order.tax}</span>
                  </div>
                )}
                {order.discount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="font-medium text-red-600">-${order.discount}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">الإجمالي النهائي:</span>
                    <span className="font-bold text-lg text-green-600">
                      ${order.total || order.subtotal || order.amount || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            {order.notes && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 ml-2" />
                  ملاحظات
                </h4>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-reverse space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                handleUpdateStatus(order.id, 'delivered')
                onClose()
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                إدارة الطلبات
              </h1>
            </div>
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <TruckIcon className="h-5 w-5 text-white" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 font-medium"
              >
                <option value="all">جميع الطلبات</option>
                <option value="pending">في الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                الطلبات ({filteredOrders.length})
              </h2>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">متصل بقاعدة البيانات</span>
              </div>
            </div>
            {filter !== 'all' && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">فلترة: {filter}</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجمالي
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-xs">
                          {order.id}
                        </div>
                        <span>#{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <div>
                        <div className="font-medium">{order.user?.name || 'غير معروف'}</div>
                        <div className="text-gray-500 text-xs">{order.user?.email || 'لا يوجد بريد إلكتروني'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ${order.total || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? '⏳ قيد الانتظار' :
                         order.status === 'processing' ? '⚙️ قيد المعالجة' :
                         order.status === 'shipped' ? '🚚 تم الشحن' :
                         order.status === 'delivered' ? '✅ تم التسليم' :
                         order.status === 'cancelled' ? '❌ ملغي' :
                         order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-sm font-medium"
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="processing">قيد المعالجة</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
