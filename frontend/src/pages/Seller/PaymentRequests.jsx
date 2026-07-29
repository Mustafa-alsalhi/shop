import React, { useState, useEffect } from 'react'
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'

const SellerPaymentRequests = () => {
  const [paymentRequests, setPaymentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)

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

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/seller/payment-requests')
      setPaymentRequests(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to fetch payment requests:', error)
      showErrorNotification('فشل في تحميل طلبات الدفع')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentRequests()
  }, [])

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'قيد المراجعة' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'تمت الموافقة' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'مرفوض' },
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
      day: 'numeric',
    })
  }

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
          <h2 className="text-2xl font-bold text-gray-900">طلبات الدفع</h2>
          <p className="text-gray-600 mt-1">إدارة طلبات الدفع الواردة من العملاء</p>
        </div>
      </div>

      {paymentRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CurrencyDollarIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات دفع</h3>
          <p className="text-gray-600">لم يتم استلام أي طلبات دفع بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">رقم الطلب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">طريقة الدفع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {request.order?.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {request.payer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {request.payment_method_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {request.payment_amount} ر.س
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewRequest(request)}
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

      {/* Payment Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">تفاصيل طلب الدفع</h3>
                  <p className="text-gray-600 mt-1">رقم الطلب: {selectedRequest.order?.order_number}</p>
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
              {/* Payment Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              {/* Payer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">معلومات الدافع</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">الاسم:</span>
                    <span className="text-gray-900 mr-2">{selectedRequest.payer_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">رقم الهاتف:</span>
                    <span className="text-gray-900 mr-2">{selectedRequest.phone_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">رقم المرجع:</span>
                    <span className="text-gray-900 mr-2">{selectedRequest.reference_number}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">تفاصيل الدفع</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">طريقة الدفع:</span>
                    <span className="text-gray-900 mr-2">{selectedRequest.payment_method_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">المبلغ:</span>
                    <span className="font-bold text-amber-600 mr-2">{selectedRequest.payment_amount} ر.س</span>
                  </div>
                  <div>
                    <span className="text-gray-600">رسوم المعاملة:</span>
                    <span className="text-gray-900 mr-2">{selectedRequest.payment_fee} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Payment Notes */}
              {selectedRequest.payment_notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">ملاحظات الدفع</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.payment_notes}</p>
                </div>
              )}

              {/* Payment Proof Image */}
              {(selectedRequest.payment_image_path || selectedRequest.image_path) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">صورة إثبات الدفع</h4>
                  <div className="relative border-2 border-dashed border-blue-300 rounded-xl overflow-hidden bg-white group cursor-pointer inline-block w-full max-w-md"
                       onClick={() => {
                         const fullUrl = getPaymentImageUrl(selectedRequest.payment_image_path || selectedRequest.image_path);
                         window.open(fullUrl, '_blank', 'noopener,noreferrer');
                       }}
                       title="انقر لفتح الصورة بحجمها الكامل في نافذة جديدة"
                  >
                    <img
                      src={getPaymentImageUrl(selectedRequest.payment_image_path || selectedRequest.image_path)}
                      alt="إثبات الدفع"
                      className="w-full object-contain group-hover:opacity-90 transition-opacity"
                      style={{ maxHeight: '350px' }}
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerPaymentRequests
