import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const PaymentMethods = () => {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    fee: 0,
    is_active: true,
    config: {},
    icon: '',
    icon_image: '',
    icon_image_preview: ''
  })

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    try {
      const response = await api.get('/admin/payment-methods')
      console.log('=== API Response Payment Methods ===', response.data)
      const methodsData = response.data.data || response.data || []
      console.log('=== Methods Data ===', methodsData)
      setMethods(Array.isArray(methodsData) ? methodsData : [])
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      setMethods([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('=== Form Data Being Submitted ===', formData)
      console.log('=== Icon Image Value ===', formData.icon_image)
      
      // Create a clean data object to send
      const dataToSend = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        fee: formData.fee,
        is_active: formData.is_active,
        config: formData.config,
        icon: formData.icon,
        icon_image: formData.icon_image || null
      }
      
      console.log('=== Clean Data To Send ===', dataToSend)
      
      if (editingMethod) {
        const response = await api.put(`/admin/payment-methods/${editingMethod.id}`, dataToSend)
        console.log('=== Update Response ===', response.data)
      } else {
        const response = await api.post('/admin/payment-methods', dataToSend)
        console.log('=== Create Response ===', response.data)
      }
      
      fetchMethods()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving method:', error)
      console.error('Error response:', error.response?.data)
      alert('فشل في حفظ طريقة الدفع: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleIconUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح')
        return
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 2MB')
        return
      }

      setUploadingIcon(true)
      
      try {
        const formData = new FormData()
        formData.append('icon', file)
        
        const response = await api.post('/admin/payment-methods/upload-icon', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        setFormData(prev => ({
          ...prev,
          icon_image: response.data.icon_url,
          icon_image_preview: response.data.icon_url
        }))
      } catch (error) {
        console.error('Error uploading icon:', error)
        alert('فشل في رفع الصورة. يرجى المحاولة مرة أخرى.')
      } finally {
        setUploadingIcon(false)
      }
    }
  }

  const handleEdit = (method) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      code: method.code,
      description: method.description || '',
      fee: method.fee,
      is_active: method.is_active,
      config: method.config || {},
      icon: method.icon || '',
      icon_image: method.icon_image || '',
      icon_image_preview: method.icon_image || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الطريقة؟')) {
      try {
        await api.delete(`/admin/payment-methods/${id}`)
        fetchMethods()
      } catch (error) {
        console.error('Error deleting method:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      fee: 0,
      is_active: true,
      config: {},
      icon: '',
      icon_image: '',
      icon_image_preview: ''
    })
    setEditingMethod(null)
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">طرق الدفع</h1>
        <button
          onClick={openModal}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة طريقة دفع
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكود
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرسوم
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأيقونة
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(methods) && methods.map((method) => (
                <tr key={method.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {method.name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {method.code}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${typeof method.fee === 'number' ? method.fee.toFixed(2) : parseFloat(method.fee || 0).toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {method.icon_image ? (
                      <img
                        src={method.icon_image}
                        alt={method.name}
                        className="h-8 w-8 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                    ) : null}
                    {!method.icon_image && (
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">{method.icon || 'لا توجد أيقونة'}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {method.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                {editingMethod ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الطريقة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكود
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرسوم ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأيقونة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="credit-card, cash, paypal, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">اسم الأيقونة للاستخدام الاحتياطي</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الأيقونة (مفضلة)
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        {formData.icon_image_preview ? (
                          <img
                            src={formData.icon_image_preview}
                            alt="معاينة الأيقونة"
                            className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-500">لا توجد صورة</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            ref={(input) => {
                              if (input) {
                                input.value = ''
                              }
                            }}
                            onChange={handleIconUpload}
                            accept="image/*"
                            className="hidden"
                            id="icon-upload"
                            disabled={uploadingIcon}
                          />
                          <label
                            htmlFor="icon-upload"
                            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                              uploadingIcon
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                          >
                            {uploadingIcon ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                جاري الرفع...
                              </>
                            ) : (
                              <>
                                <PlusIcon className="h-4 w-4 ml-2" />
                                اختيار صورة
                              </>
                            )}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF (حتى 2MB)
                          </p>
                        </div>
                      </div>
                      {formData.icon_image && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-blue-800 truncate">{formData.icon_image}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, icon_image: '', icon_image_preview: '' }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإعدادات (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(formData.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value)
                        setFormData({...formData, config})
                      } catch (error) {
                        // Invalid JSON, keep current value
                      }
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder='{"requires_cvv": true, "supported_cards": ["visa", "mastercard"]}'
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="ml-2"
                    />
                    نشط
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                  >
                    {editingMethod ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentMethods
