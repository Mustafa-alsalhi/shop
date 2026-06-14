import React, { useState, useEffect } from 'react'
import { DocumentTextIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [formData, setFormData] = useState({
    type: 'return_policy',
    title: '',
    description: '',
    content: '',
    is_active: true
  })

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/admin/policies')
      setPolicies(response.data.data || response.data)
    } catch (err) {
      console.error('Failed to fetch policies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPolicy) {
        await api.put(`/admin/policies/${editingPolicy.id}`, formData)
      } else {
        await api.post('/admin/policies', formData)
      }
      setShowModal(false)
      setEditingPolicy(null)
      setFormData({
        type: 'return_policy',
        title: '',
        description: '',
        content: '',
        is_active: true
      })
      fetchPolicies()
    } catch (err) {
      console.error('Failed to save policy:', err)
    }
  }

  const handleEdit = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      type: policy.type,
      title: policy.title,
      description: policy.description || '',
      content: policy.content,
      is_active: policy.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه السياسة؟')) {
      try {
        await api.delete(`/admin/policies/${id}`)
        fetchPolicies()
      } catch (err) {
        console.error('Failed to delete policy:', err)
      }
    }
  }

  const handleToggleActive = async (policy) => {
    try {
      await api.put(`/admin/policies/${policy.id}`, {
        ...policy,
        is_active: !policy.is_active
      })
      fetchPolicies()
    } catch (err) {
      console.error('Failed to toggle policy status:', err)
    }
  }

  const getPolicyTypeLabel = (type) => {
    const labels = {
      'return_policy': 'سياسة الاسترجاع',
      'exchange_policy': 'سياسة الاستبدال',
      'cancellation_policy': 'سياسة الإلغاء',
      'shipping_policy': 'سياسة الشحن',
      'privacy_policy': 'سياسة الخصوصية',
      'terms_of_service': 'شروط الخدمة',
      'cookies_policy': 'سياسة الكوكيز'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة السياسات</h1>
        <button
          onClick={() => {
            setEditingPolicy(null)
            setFormData({
              type: 'return_policy',
              title: '',
              description: '',
              content: '',
              is_active: true
            })
            setShowModal(true)
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة سياسة جديدة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
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
            {policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPolicyTypeLabel(policy.type)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{policy.title}</div>
                  {policy.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {policy.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      policy.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {policy.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(policy)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {policy.is_active ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => handleEdit(policy)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  لا توجد سياسات حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPolicy ? 'تعديل السياسة' : 'إضافة سياسة جديدة'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع السياسة
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="return_policy">سياسة الاسترجاع</option>
                    <option value="exchange_policy">سياسة الاستبدال</option>
                    <option value="cancellation_policy">سياسة الإلغاء</option>
                    <option value="shipping_policy">سياسة الشحن</option>
                    <option value="privacy_policy">سياسة الخصوصية</option>
                    <option value="terms_of_service">شروط الخدمة</option>
                    <option value="cookies_policy">سياسة الكوكيز</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المحتوى
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
                    نشط
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPolicy ? 'حفظ التعديلات' : 'إضافة السياسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPolicies
