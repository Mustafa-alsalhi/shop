import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  ShoppingBagIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'

const SellerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const getPaymentImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;

    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    if (cleanPath.startsWith('storage/')) {
        return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/storage/${cleanPath}`;
  };

  // Helper function to get currency from order items
  const getOrderCurrency = (order) => {
    if (!order) return '$'
    if (order.currency) return order.currency
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0]
      if (firstItem.currency) return firstItem.currency
      if (firstItem.product && firstItem.product.currency) return firstItem.product.currency
    }
    return '$' // Default fallback currency
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/seller/orders')
      setOrders(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      showErrorNotification('فشل في تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/seller/orders/${orderId}`)
      setSelectedOrder(response.data)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      showErrorNotification('فشل في تحميل تفاصيل الطلب')
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status })
      showSuccessNotification('تم تحديث حالة الطلب بنجاح')
      fetchOrders()
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status })
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      showErrorNotification('فشل في تحديث حالة الطلب')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'قيد الانتظار' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: TruckIcon, label: 'قيد المعالجة' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, label: 'تم تجهيز الطلب' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'تم التسليم' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'ملغي' },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    })
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الطلبات</h2>
          <p className="text-gray-600 mt-1">إدارة طلبات العملاء</p>
        </div>
      </div>

      <div className="flex space-x-reverse space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          قيد الانتظار
        </button>
        <button
          onClick={() => setStatusFilter('processing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'processing'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          قيد المعالجة
        </button>
        <button
          onClick={() => setStatusFilter('shipped')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'shipped'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          تم تجهيز الطلب
        </button>
        <button
          onClick={() => setStatusFilter('delivered')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'delivered'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          تم التسليم
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'cancelled'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          ملغي
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600">لم يتم استلام أي طلبات بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">رقم الطلب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المجموع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.user?.first_name} {order.user?.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getOrderCurrency(order)} {order.total_amount || order.subtotal || order.total || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">تفاصيل الطلب</h3>
                  <p className="text-gray-600 mt-1">{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm text-gray-600">الحالة الحالية:</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
                    >
                      قبول الطلب
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm w-full sm:w-auto"
                    >
                      تجهيز الطلب
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
                    >
                      تأكيد التسليم
                    </button>
                  )}
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm w-full sm:w-auto"
                    >
                      إلغاء الطلب
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">معلومات العميل</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الاسم:</span>
                    <span className="text-gray-900 mr-2">
                      {selectedOrder.user?.first_name} {selectedOrder.user?.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">البريد:</span>
                    <span className="text-gray-900 mr-2">{selectedOrder.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="text-gray-900 mr-2">{selectedOrder.user?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TruckIcon className="h-5 w-5 ml-2" />
                  معلومات الشحن
                </h4>
                <div className="space-y-2 text-sm overflow-hidden">
                  {selectedOrder.formatted_address && (
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                      <span className="text-gray-600 w-full sm:w-24 shrink-0">العنوان:</span>
                      <span className="font-medium text-gray-900 break-words">{selectedOrder.formatted_address}</span>
                    </div>
                  )}
                  {selectedOrder.building_details && (
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                      <span className="text-gray-600 w-full sm:w-24 shrink-0">تفاصيل المبنى:</span>
                      <span className="font-medium text-gray-900 break-words">{selectedOrder.building_details}</span>
                    </div>
                  )}
                  {selectedOrder.latitude && selectedOrder.longitude && (
                    <>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                        <span className="text-gray-600 w-full sm:w-24 shrink-0">الإحداثيات:</span>
                        <span className="font-medium text-gray-900 flex gap-2" dir="ltr">
                          {typeof selectedOrder.latitude === 'number' ? selectedOrder.latitude.toFixed(6) : selectedOrder.latitude}, 
                          {typeof selectedOrder.longitude === 'number' ? selectedOrder.longitude.toFixed(6) : selectedOrder.longitude}
                        </span>
                      </div>
                      <div className="mt-2">
                        <a
                          href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          عرض الموقع على الخريطة
                        </a>
                      </div>
                    </>
                  )}
                  {/* Fallback for old orders without location data */}
                  {!selectedOrder.formatted_address && typeof selectedOrder.shipping_address === 'object' && (
                    <>
                      <div className="flex">
                        <span className="text-gray-600 w-24">العنوان:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.shipping_address.address || 'لا يوجد'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-24">المدينة:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.shipping_address.city || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-24">الرمز البريدي:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.shipping_address.postal_code || 'غير محدد'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">المنتجات</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div className="flex-1 sm:hidden">
                          <h5 className="font-medium text-gray-900">{item.product_name || item.product?.name}</h5>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                          <p className="text-sm text-gray-600">السعر: {getOrderCurrency(selectedOrder)} {item.price || item.product?.price || 0}</p>
                        </div>
                      </div>
                      <div className="hidden sm:block flex-1">
                        <h5 className="font-medium text-gray-900">{item.product_name || item.product?.name}</h5>
                        <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        <p className="text-sm text-gray-600">السعر: {getOrderCurrency(selectedOrder)} {item.price || item.product?.price || 0}</p>
                      </div>
                      <div className="text-right sm:text-left flex items-center justify-between sm:block border-t sm:border-0 border-gray-200 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        <span className="sm:hidden text-gray-600 text-sm">المجموع:</span>
                        <p className="font-semibold text-gray-900">{getOrderCurrency(selectedOrder)} {item.total || ((item.price || item.product?.price || 0) * (item.quantity || 1))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-medium text-gray-900">
                      {getOrderCurrency(selectedOrder)} {parseFloat(selectedOrder.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {parseFloat(selectedOrder.tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الضريبة:</span>
                      <span className="font-medium text-gray-900">
                        {getOrderCurrency(selectedOrder)} {parseFloat(selectedOrder.tax).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {parseFloat(selectedOrder.shipping) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الشحن:</span>
                      <span className="font-medium text-gray-900">
                        {getOrderCurrency(selectedOrder)} {parseFloat(selectedOrder.shipping).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الخصم:</span>
                      <span className="font-medium text-red-600">
                        -{getOrderCurrency(selectedOrder)} {parseFloat(selectedOrder.discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-amber-200 pt-2 mt-2">
                    <span className="font-semibold text-gray-900">المجموع الكلي:</span>
                    <span className="font-bold text-amber-600 text-lg">
                      {getOrderCurrency(selectedOrder)} {parseFloat(selectedOrder.total_amount || selectedOrder.total || selectedOrder.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {/* بيانات الدفع */}
              {(selectedOrder.payment_method || selectedOrder.payment_requests) && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCardIcon className="h-5 w-5 ml-2" />
                    بيانات الدفع
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.payment_method && (
                      <div className="flex">
                        <span className="text-gray-600 w-24">طريقة الدفع:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.payment_requests && selectedOrder.payment_requests.length > 0
                            ? selectedOrder.payment_requests[0].payment_method_name
                            : selectedOrder.payment_method}
                        </span>
                      </div>
                    )}
                    {selectedOrder.payment_requests && selectedOrder.payment_requests.length > 0 && (
                      <>
                        <div className="flex">
                          <span className="text-gray-600 w-24">اسم الدافع:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.payment_requests[0].payer_name || 'غير محدد'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-24">رقم المرجع:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.payment_requests[0].reference_number || 'غير محدد'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-24">رقم الهاتف:</span>
                          <span className="font-medium text-gray-900" dir="ltr">
                            {selectedOrder.payment_requests[0].phone_number || 'غير محدد'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-24">حالة الدفع:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedOrder.payment_requests[0].status === 'approved' ? 'bg-green-100 text-green-800' :
                            selectedOrder.payment_requests[0].status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedOrder.payment_requests[0].status === 'approved' ? 'موافق عليه' :
                             selectedOrder.payment_requests[0].status === 'rejected' ? 'مرفوض' :
                             'قيد الانتظار'}
                          </span>
                        </div>
                        {selectedOrder.payment_requests[0].payment_notes && (
                          <div className="flex">
                            <span className="text-gray-600 w-24">ملاحظات الدفع:</span>
                            <span className="font-medium text-gray-900">
                              {selectedOrder.payment_requests[0].payment_notes}
                            </span>
                          </div>
                        )}
                        {/* صورة إشعار أو وصل الدفع */}
                        {(selectedOrder.payment_requests[0].payment_image_path || selectedOrder.payment_requests[0].image_path) && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <span className="block text-gray-600 mb-2">صورة الإشعار / وصل الدفع:</span>
                            <div className="relative border-2 border-dashed border-blue-300 rounded-xl overflow-hidden bg-white group cursor-pointer inline-block"
                                 onClick={() => {
                                   const fullUrl = getPaymentImageUrl(selectedOrder.payment_requests[0].payment_image_path || selectedOrder.payment_requests[0].image_path);
                                   window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                 }}
                                 title="انقر لفتح الصورة بحجمها الكامل في نافذة جديدة"
                            >
                              <img
                                src={getPaymentImageUrl(selectedOrder.payment_requests[0].payment_image_path || selectedOrder.payment_requests[0].image_path)}
                                alt="إشعار التحويل البنكي"
                                className="w-full max-w-xs object-contain group-hover:opacity-90 transition-opacity"
                                style={{ maxHeight: '250px' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'p-6 text-center text-gray-500';
                                    fallback.innerHTML = 'الصورة غير متوفرة أو تم حذفها';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                  فتح الصورة المكبرة
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerOrders
