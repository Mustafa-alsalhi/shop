import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { UsersIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const AdminUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data || response.data)
      setLoading(false)
    } catch (err) {
      setError('فشل في جلب المستخدمين: ' + err.message)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا المستخدم؟')) {
      try {
        await api.delete(`/admin/users/${id}`)
        setUsers(users.filter(u => u.id !== id))
        alert('تم حذف المستخدم بنجاح!')
      } catch (err) {
        setError('فشل في حذف المستخدم: ' + err.message)
      }
    }
  }

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}/edit`)
  }

  const handleView = (user) => {
    alert(`تفاصيل المستخدم:\n\nالاسم: ${user.name}\nالبريد الإلكتروني: ${user.email}\nالدور: ${user.role}\nتاريخ الانضمام: ${user.created_at}`)
  }

  const handleAddUser = () => {
    navigate('/admin/users/add')
  }

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
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                إدارة المستخدمين
              </h1>
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              إضافة مستخدم جديد
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-lg">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <UserCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <span className="font-medium text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100">
          <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                المستخدمون ({users.length})
              </h2>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">متصل بقاعدة البيانات</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البريد الإلكتروني
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="font-medium truncate max-w-24 sm:max-w-none">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      <div className="truncate max-w-24 sm:max-w-none">{user.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? '👑 مدير' :
                         user.role === 'manager' ? '👨‍💼 مشرف' :
                         user.role || 'مستخدم'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? '✅ نشط' : '❌ غير نشط'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleView(user)}
                          className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 sm:p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                          title="تعديل المستخدم"
                        >
                          <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="حذف المستخدم"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
