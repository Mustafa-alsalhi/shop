import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

const SellerCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/seller/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingCategory) {
        await axios.put(`/api/seller/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/seller/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', icon: '', sort_order: 0, is_active: true })
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('حدث خطأ أثناء حفظ الفئة')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active ?? true
    })
    setShowModal(true)
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/seller/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('حدث خطأ أثناء حذف الفئة')
    }
  }

  const handleToggleActive = async (categoryId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/seller/categories/${categoryId}`, {
        ...categories.find(c => c.id === categoryId),
        is_active: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCategories()
    } catch (error) {
      console.error('Error toggling category status:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">فئات المتجر</h1>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', description: '', icon: '', sort_order: 0, is_active: true })
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>إضافة فئة جديدة</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الاسم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الوصف</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الترتيب</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  لا توجد فئات حتى الآن
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {category.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(category.id, category.is_active)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="حذف"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الفئة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="مثال: إلكترونيات"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows="3"
                  placeholder="وصف الفئة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأيقونة (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="اسم الأيقونة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الترتيب
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  نشط
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{editingCategory ? 'حفظ التعديلات' : 'إضافة الفئة'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerCategories
