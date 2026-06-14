import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import { 
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

const ContactUs = () => {
  const [contacts, setContacts] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [replyModal, setReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchStatistics()
  }, [statusFilter])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = statusFilter === 'all' 
        ? await api.get('/admin/contact-us')
        : await api.get(`/admin/contact-us/status/${statusFilter}`)
      setContacts(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      showErrorNotification('فشل في جلب رسائل الاتصال')
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/contact-us/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'قيد الانتظار', icon: ClockIcon },
      read: { color: 'bg-blue-100 text-blue-800', text: 'تم القراءة', icon: EyeIcon },
      replied: { color: 'bg-green-100 text-green-800', text: 'تم الرد', icon: CheckCircleIcon },
      closed: { color: 'bg-gray-100 text-gray-800', text: 'مغلق', icon: XMarkIcon }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="h-3 w-3 ml-1" />
        {config.text}
      </span>
    )
  }

  const showContactDetails = async (contact) => {
    try {
      const response = await api.get(`/admin/contact-us/${contact.id}`)
      setSelectedContact(response.data)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Error fetching contact details:', error)
      showErrorNotification('فشل في جلب تفاصيل الرسالة')
    }
  }

  const handleStatusUpdate = async (contactId, status) => {
    try {
      await api.put(`/admin/contact-us/${contactId}`, { status })
      showSuccessNotification('تم تحديث الحالة بنجاح')
      fetchContacts()
      fetchStatistics()
    } catch (error) {
      console.error('Error updating status:', error)
      showErrorNotification('فشل في تحديث الحالة')
    }
  }

  const handleQuickStatusUpdate = async (contactId, action) => {
    try {
      let endpoint = `/admin/contact-us/${contactId}/mark-${action}`
      await api.put(endpoint)
      showSuccessNotification('تم تحديث الحالة بنجاح')
      fetchContacts()
      fetchStatistics()
    } catch (error) {
      console.error('Error updating status:', error)
      showErrorNotification('فشل في تحديث الحالة')
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) {
      showErrorNotification('يرجى كتابة رد')
      return
    }

    setSaving(true)
    try {
      await api.put(`/admin/contact-us/${selectedContact.id}`, {
        status: 'replied',
        admin_reply: replyText
      })
      showSuccessNotification('تم إرسال الرد بنجاح')
      setReplyModal(false)
      setReplyText('')
      setShowDetailsModal(false)
      fetchContacts()
      fetchStatistics()
    } catch (error) {
      console.error('Error sending reply:', error)
      showErrorNotification('فشل في إرسال الرد')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (contactId) => {
    if (!window.confirm('هل أنت متأكد من أنك تريد حذف هذه الرسالة؟')) {
      return
    }

    try {
      await api.delete(`/admin/contact-us/${contactId}`)
      showSuccessNotification('تم حذف الرسالة بنجاح')
      fetchContacts()
      fetchStatistics()
    } catch (error) {
      console.error('Error deleting contact:', error)
      showErrorNotification('فشل في حذف الرسالة')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">رسائل الاتصال</h1>
        
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">إجمالي الرسائل</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">قيد الانتظار</div>
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">تم القراءة</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.read}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">تم الرد</div>
              <div className="text-2xl font-bold text-green-600">{statistics.replied}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">مغلق</div>
              <div className="text-2xl font-bold text-gray-600">{statistics.closed}</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <label className="text-sm font-medium text-gray-700">فلترة حسب الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="read">تم القراءة</option>
            <option value="replied">تم الرد</option>
            <option value="closed">مغلق</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموضوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          {contact.phone && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <PhoneIcon className="h-3 w-3 ml-1" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 ml-2" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {contact.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <button
                          onClick={() => showContactDetails(contact)}
                          className="text-blue-600 hover:text-blue-900"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {contact.status === 'pending' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(contact.id, 'read')}
                            className="text-blue-600 hover:text-blue-900"
                            title="تم القراءة"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        {contact.status === 'read' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(contact.id, 'replied')}
                            className="text-green-600 hover:text-green-900"
                            title="تم الرد"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    لا توجد رسائل اتصال
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">تفاصيل الرسالة</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات المرسل</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-gray-900">{selectedContact.name}</span>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-gray-900">{selectedContact.email}</span>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-gray-900">{selectedContact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات الرسالة</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">الموضوع:</span>
                      <p className="text-gray-900 font-medium">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">الحالة:</span>
                      <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">التاريخ:</span>
                      <p className="text-gray-900">{formatDate(selectedContact.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">الرسالة</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Admin Reply */}
              {selectedContact.admin_reply && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">الرد الإداري</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.admin_reply}</p>
                    {selectedContact.replied_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        تم الرد في: {formatDate(selectedContact.replied_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-reverse space-x-3">
                {selectedContact.status !== 'replied' && (
                  <button
                    onClick={() => {
                      setReplyModal(true)
                      setShowDetailsModal(false)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إرسال رد
                  </button>
                )}
                {selectedContact.status === 'pending' && (
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedContact.id, 'read')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    تم القراءة
                  </button>
                )}
                {selectedContact.status === 'read' && (
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedContact.id, 'replied')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    تم الرد
                  </button>
                )}
                {selectedContact.status !== 'closed' && (
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedContact.id, 'closed')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    إغلاق
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">إرسال رد</h3>
              <button
                onClick={() => setReplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  الرد على: <span className="font-medium">{selectedContact.name}</span> ({selectedContact.email})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  الموضوع: <span className="font-medium">{selectedContact.subject}</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نص الرد
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="اكتب ردك هنا..."
                />
              </div>

              <div className="flex items-center justify-end space-x-reverse space-x-3">
                <button
                  onClick={() => {
                    setReplyModal(false)
                    setReplyText('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReply}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </span>
                  ) : (
                    'إرسال الرد'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactUs
