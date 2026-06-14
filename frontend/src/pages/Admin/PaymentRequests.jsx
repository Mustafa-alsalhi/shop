import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import api from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const PaymentRequests = () => {
  const dispatch = useDispatch()
  const [paymentRequests, setPaymentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [statistics, setStatistics] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Helper function to get currency from order or payment request
  const getCurrencyFromOrder = (request) => {
    // First check if payment request has currency field
    if (request.currency) {
      return request.currency
    }
    // Then check order items
    if (request.order?.items && request.order.items.length > 0) {
      const firstItem = request.order.items[0]
      return firstItem.currency || firstItem.product?.currency || 'USD'
    }
    // Check order total currency
    if (request.order?.currency) {
      return request.order.currency
    }
    return 'SAR' // Default currency for Saudi Arabia
  }

  useEffect(() => {
    fetchPaymentRequests()
    fetchStatistics()
  }, [statusFilter])

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true)
      const url = statusFilter === 'all' 
        ? '/admin/payment-requests' 
        : `/admin/payment-requests/status/${statusFilter}`
      
      const response = await api.get(url)
      console.log('=== Payment Requests Response ===', response.data)
      
      const requestsData = response.data.data || response.data || []
      setPaymentRequests(Array.isArray(requestsData) ? requestsData : [])
    } catch (error) {
      console.error('Error fetching payment requests:', error)
      dispatch(showErrorNotification('فشل في تحميل طلبات الدفع'))
      setPaymentRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/payment-requests/statistics')
      console.log('=== Payment Statistics ===', response.data)
      setStatistics(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus, adminNotes = '') => {
    try {
      await api.put(`/admin/payment-requests/${requestId}`, {
        status: newStatus,
        admin_notes: adminNotes
      })

      dispatch(showSuccessNotification('تم تحديث حالة الطلب بنجاح'))
      fetchPaymentRequests()
      fetchStatistics()
      
      if (showDetailsModal) {
        setShowDetailsModal(false)
      }
    } catch (error) {
      console.error('Error updating payment request:', error)
      dispatch(showErrorNotification('فشل في تحديث حالة الطلب'))
    }
  }

  const handleDelete = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      return
    }

    try {
      await api.delete(`/admin/payment-requests/${requestId}`)
      dispatch(showSuccessNotification('تم حذف الطلب بنجاح'))
      fetchPaymentRequests()
      fetchStatistics()
    } catch (error) {
      console.error('Error deleting payment request:', error)
      dispatch(showErrorNotification('فشل في حذف الطلب'))
    }
  }

  const showRequestDetails = async (request) => {
    try {
      // Fetch order details for this payment request
      const orderResponse = await api.get(`/admin/orders/${request.order_id}`)
      const order = orderResponse.data.data || orderResponse.data
      
      // Combine payment request with order details
      const requestWithOrder = {
        ...request,
        order: order
      }
      
      setSelectedRequest(requestWithOrder)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      setSelectedRequest(request)
      setShowDetailsModal(true)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'قيد الانتظار' },
      approved: { color: 'bg-green-100 text-green-800', text: 'موافق عليه' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'مرفوض' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">طلبات الدفع</h1>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">إجمالي الطلبات</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{statistics.total}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">قيد الانتظار</div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">موافق عليه</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{statistics.approved}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">مرفوض</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{statistics.rejected}</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700">فلترة حسب الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الطلب
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentRequests.length > 0 ? (
                paymentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{request.order_id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.reference_number}
                        </div>
                        {request.order?.order_number && (
                          <div className="text-xs text-gray-400">
                            {request.order.order_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.payer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.phone_number}
                      </div>
                      {request.user?.email && (
                        <div className="text-xs text-gray-400">
                          {request.user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.payment_method_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.payment_method}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getCurrencyFromOrder(request)} {typeof request.payment_amount === 'number' ? request.payment_amount.toFixed(2) : parseFloat(request.payment_amount || 0).toFixed(2)}
                      </div>
                      {request.payment_fee > 0 && (
                        <div className="text-xs text-gray-500">
                          +{getCurrencyFromOrder(request)} {typeof request.payment_fee === 'number' ? request.payment_fee.toFixed(2) : parseFloat(request.payment_fee || 0).toFixed(2)} رسوم
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(request.created_at).toLocaleDateString('ar-SA')}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleTimeString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => showRequestDetails(request)}
                          className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                        >
                          عرض
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'approved')}
                              className="text-green-600 hover:text-green-900 text-xs sm:text-sm"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                    لا توجد طلبات دفع
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">تفاصيل طلب الدفع</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">معلومات طلب الدفع</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الطلب:</span>
                      <span className="font-medium">#{selectedRequest.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم المرجع:</span>
                      <span className="font-medium">{selectedRequest.reference_number}</span>
                    </div>
                    {selectedRequest.order?.order_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">رقم الطلب المرتبط:</span>
                        <span className="font-medium">{selectedRequest.order.order_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span className="font-medium">{selectedRequest.payment_method_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">كود الدفع:</span>
                      <span className="font-medium">{selectedRequest.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ:</span>
                      <span className="font-medium text-green-600">
                        {getCurrencyFromOrder(selectedRequest)} {typeof selectedRequest.payment_amount === 'number' ? selectedRequest.payment_amount.toFixed(2) : parseFloat(selectedRequest.payment_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الرسوم:</span>
                      <span className="font-medium">
                        {getCurrencyFromOrder(selectedRequest)} {typeof selectedRequest.payment_fee === 'number' ? selectedRequest.payment_fee.toFixed(2) : parseFloat(selectedRequest.payment_fee || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الإجمالي:</span>
                      <span className="font-bold text-green-600">
                        {getCurrencyFromOrder(selectedRequest)} {(parseFloat(selectedRequest.payment_amount || 0) + parseFloat(selectedRequest.payment_fee || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span>{getStatusBadge(selectedRequest.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الطلب:</span>
                      <span className="font-medium">
                        {new Date(selectedRequest.created_at).toLocaleDateString('ar-SA')} {new Date(selectedRequest.created_at).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                    {selectedRequest.payment_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الدفع:</span>
                        <span className="font-medium">
                          {new Date(selectedRequest.payment_date).toLocaleDateString('ar-SA')} {new Date(selectedRequest.payment_date).toLocaleTimeString('ar-SA')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">معلومات الدافع</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-medium">{selectedRequest.payer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الهاتف:</span>
                      <span className="font-medium">{selectedRequest.phone_number}</span>
                    </div>
                    {selectedRequest.user?.name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">اسم المستخدم:</span>
                        <span className="font-medium">{selectedRequest.user.name}</span>
                      </div>
                    )}
                    {selectedRequest.user?.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">البريد الإلكتروني:</span>
                        <span className="font-medium text-left text-xs">{selectedRequest.user.email}</span>
                      </div>
                    )}
                    {selectedRequest.user?.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">رقم هاتف المستخدم:</span>
                        <span className="font-medium">{selectedRequest.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                {selectedRequest.order && (
                  <div className="sm:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">تفاصيل الطلب المرتبط</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">رقم الطلب:</span>
                          <span className="font-medium">#{selectedRequest.order.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">رقم الطلب المرتبط:</span>
                          <span className="font-medium">{selectedRequest.order.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ الطلب:</span>
                          <span className="font-medium">
                            {new Date(selectedRequest.order.created_at).toLocaleDateString('ar-SA')} {new Date(selectedRequest.order.created_at).toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">حالة الطلب:</span>
                          <span className="font-medium">{selectedRequest.order.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">حالة الدفع:</span>
                          <span className="font-medium">{selectedRequest.order.payment_status}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">المبلغ الإجمالي:</span>
                          <span className="font-medium text-green-600">
                            {getCurrencyFromOrder(selectedRequest)} {typeof selectedRequest.order.total_amount === 'number'
                              ? selectedRequest.order.total_amount.toFixed(2)
                              : parseFloat(selectedRequest.order.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">المبلغ الفرعي:</span>
                          <span className="font-medium">
                            {getCurrencyFromOrder(selectedRequest)} {typeof selectedRequest.order.subtotal === 'number'
                              ? selectedRequest.order.subtotal.toFixed(2)
                              : parseFloat(selectedRequest.order.subtotal || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الضريبة:</span>
                          <span className="font-medium">
                            {getCurrencyFromOrder(selectedRequest)} {typeof selectedRequest.order.tax === 'number'
                              ? selectedRequest.order.tax.toFixed(2)
                              : parseFloat(selectedRequest.order.tax || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الشحن:</span>
                          <span className="font-medium">
                            {getCurrencyFromOrder(selectedRequest)} {typeof selectedRequest.order.shipping === 'number'
                              ? selectedRequest.order.shipping.toFixed(2)
                              : parseFloat(selectedRequest.order.shipping || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">شركة الشحن:</span>
                          <span className="font-medium">{selectedRequest.order.shipping_company || 'غير محدد'}</span>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">عنوان الشحن:</span>
                          <span className="font-medium text-left text-xs">
                            {typeof selectedRequest.order.shipping_address === 'object' 
                              ? `${selectedRequest.order.shipping_address.address || ''}, ${selectedRequest.order.shipping_address.city || ''}, ${selectedRequest.order.shipping_address.state || ''}, ${selectedRequest.order.shipping_address.country || ''}` 
                              : selectedRequest.order.shipping_address || 'غير محدد'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.payment_image_path && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">صورة إثبات الدفع</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={selectedRequest.payment_image_path.startsWith('http') 
                        ? selectedRequest.payment_image_path 
                        : `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${selectedRequest.payment_image_path}`}
                      alt="صورة الدفع"
                      className="max-w-full h-auto rounded-lg"
                      onError={(e) => {
                        console.log('Failed to load payment image:', selectedRequest.payment_image_path);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<p class="text-red-500">فشل في تحميل الصورة</p>';
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedRequest.payment_notes && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">ملاحظات الدفع</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700 text-sm">{selectedRequest.payment_notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">ملاحظات الإدارة</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-700 text-sm">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    موافقة
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    رفض
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentRequests
