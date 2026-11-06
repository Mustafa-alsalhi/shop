import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LocationPicker from '../../components/LocationPicker'
import activityService from '../../services/activityService'

const Sellers = () => {
  const [sellers, setSellers] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSeller, setEditingSeller] = useState(null)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'store', 'restaurant'
  
  const initialFormState = {
    user_id: '',
    store_name: '',
    type: 'store',
    description: '',
    avatar: '',
    avatar_file: null,
    rating: 4.80,
    reviews_count: 125,
    status: 'active',
    is_verified: true,
    latitude: '',
    longitude: '',
    is_open: true,
    accepting_orders: true,
    preparation_time: '20-30 دقيقة',
    min_order_amount: 0,
    cuisine_type: '',
    id_card_image_file: null,
    commercial_register_image_file: null,
    signed_contract_image_file: null,
    kuraimi_account_name: '',
    kuraimi_account_number: '',
    alt_network_name: '',
    alt_recipient_name: '',
    alt_recipient_phone: '',
  }

  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const responseJson = await response.json()
        const data = responseJson.data || responseJson
        const usersWithoutSeller = data.filter(user => {
          const hasSellerProfile = sellers.some(seller => seller.user_id === user.id)
          const isSellerRole = user.role === 'seller'
          const isAdminRole = user.role === 'admin'
          return !hasSellerProfile && !isSellerRole && !isAdminRole
        })
        setUsers(usersWithoutSeller)
      } else {
        toast.error('فشل في جلب المستخدمين')
        setUsers([])
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخدمة')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const [sellersRes, actRes] = await Promise.all([
        fetch(`${apiUrl}/admin/sellers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        activityService.getAdminActivities().catch(() => ({ success: false, data: [] }))
      ])
      
      if (sellersRes.ok) {
        const data = await sellersRes.json()
        setSellers(data)
      } else {
        toast.error('فشل في جلب البائعين')
        setSellers([])
      }

      if (actRes.success && actRes.data) {
        setActivities(actRes.data)
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخدمة')
      setSellers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('يجب تسجيل الدخول')
        return
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const url = editingSeller ? `${apiUrl}/admin/sellers/${editingSeller.id}` : `${apiUrl}/admin/sellers`
      const method = 'POST'
      
      const submitData = new FormData()
      if (editingSeller) {
        submitData.append('_method', 'PUT')
      }
      
      Object.keys(formData).forEach(key => {
        if (!key.includes('_file') && formData[key] !== null) {
          let value = formData[key]
          if (key === 'is_verified' || key === 'is_open' || key === 'accepting_orders') {
            value = (value === true || value === 'true' || value === 1 || value === '1') ? '1' : '0'
          }
          if (key === 'user_id' && editingSeller) return
          submitData.append(key, value)
        }
      })
      
      // Append files if they exist
      const fileFields = ['avatar_file', 'id_card_image_file', 'commercial_register_image_file', 'signed_contract_image_file']
      fileFields.forEach(field => {
        if (formData[field]) {
          submitData.append(field, formData[field])
        }
      })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      if (response.ok) {
        toast.success(editingSeller ? 'تم تحديث البائع بنجاح' : 'تم إضافة البائع بنجاح')
        setShowModal(false)
        setEditingSeller(null)
        resetForm()
        fetchSellers()
      } else {
        let error = await response.json().catch(() => ({ message: 'حدث خطأ غير معروف' }))
        if (error.errors) {
          Object.values(error.errors).flat().forEach(msg => toast.error(msg))
        } else {
          toast.error(error.message || 'فشل في حفظ البائع')
        }
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const handleEdit = (seller) => {
    setEditingSeller(seller)
    setFormData({
      user_id: seller.user_id,
      store_name: seller.store_name || '',
      type: seller.type || 'store',
      description: seller.description || '',
      avatar: seller.avatar || '',
      avatar_file: null,
      rating: seller.rating || 0,
      reviews_count: seller.reviews_count || 0,
      status: seller.status || 'pending',
      is_verified: seller.is_verified || false,
      latitude: seller.latitude || '',
      longitude: seller.longitude || '',
      is_open: seller.is_open ?? true,
      accepting_orders: seller.accepting_orders ?? true,
      preparation_time: seller.preparation_time || '20-30 دقيقة',
      min_order_amount: seller.min_order_amount || 0,
      cuisine_type: seller.cuisine_type || '',
      id_card_image: seller.id_card_image || '',
      commercial_register_image: seller.commercial_register_image || '',
      signed_contract_image: seller.signed_contract_image || '',
      id_card_image_file: null,
      commercial_register_image_file: null,
      signed_contract_image_file: null,
      kuraimi_account_name: seller.kuraimi_account_name || '',
      kuraimi_account_number: seller.kuraimi_account_number || '',
      alt_network_name: seller.alt_network_name || '',
      alt_recipient_name: seller.alt_recipient_name || '',
      alt_recipient_phone: seller.alt_recipient_phone || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (sellerId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البائع؟')) return
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiUrl}/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('تم حذف البائع بنجاح')
        fetchSellers()
      } else {
        toast.error('فشل في حذف البائع')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
  }

  const openModal = () => {
    resetForm()
    setEditingSeller(null)
    fetchUsers()
    setShowModal(true)
  }

  const handleFileChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files[0] })
  }

  const FileUploadZone = ({ label, field, accept = "image/*,.pdf", existingUrl }) => {
    
    // helper to get base url
    const getFullUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
      return `${baseUrl}/storage/${url.startsWith('/') ? url.slice(1) : url}`;
    };

    return (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {existingUrl && !formData[field] && (
        <div className="mb-2">
           <a href={getFullUrl(existingUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md text-xs font-semibold mr-1">
             عرض الملف المرفق حالياً
           </a>
        </div>
      )}

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors bg-teal-50 flex flex-col items-center justify-center">
        <input 
          type="file" 
          accept={accept}
          onChange={(e) => handleFileChange(e, field)} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          {formData[field] ? (
            <span className="text-amber-600 font-semibold">{formData[field].name}</span>
          ) : (
            <span>اسحب وأفلت الملف هنا أو <span className="text-amber-600 font-semibold underline">اختر ملفاً</span></span>
          )}
        </p>
      </div>
    </div>
  )}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  const filteredSellers = sellers.filter(seller => {
    if (typeFilter === 'all') return true
    if (typeFilter === 'store') return seller.type === 'store' || !seller.type
    return seller.type === typeFilter
  })

  return (
    <div className="p-6 space-y-6 rtl" dir="rtl">
      {/* Header and Activity Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">إدارة الأنشطة والبائعين</h1>
          <p className="text-xs text-gray-500 mt-1">إدارة شاملة للمتاجر الإلكترونية وكافة الأنشطة التجارية</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setFormData({ ...initialFormState, type: 'store' })
              setEditingSeller(null)
              fetchUsers()
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-amber-600 text-white px-3.5 py-2 rounded-xl hover:bg-amber-700 transition-colors shadow-sm font-bold text-xs sm:text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة متجر
          </button>
          <button
            onClick={() => {
              setFormData({ ...initialFormState, type: activities[0]?.slug || 'restaurant' })
              setEditingSeller(null)
              fetchUsers()
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-orange-600 text-white px-3.5 py-2 rounded-xl hover:bg-orange-700 transition-colors shadow-sm font-bold text-xs sm:text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة مكان / نشاط
          </button>
        </div>
      </div>

      {/* Activity Filter Tabs */}
      <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit flex-wrap">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            typeFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          جميع البائعين ({sellers.length})
        </button>
        <button
          onClick={() => setTypeFilter('store')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            typeFilter === 'store' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>🛍️</span>
          <span>المتاجر ({sellers.filter(s => s.type === 'store' || !s.type).length})</span>
        </button>
        {activities.map((act) => (
          <button
            key={act.id}
            onClick={() => setTypeFilter(act.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              typeFilter === act.slug ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{act.icon}</span>
            <span>{act.name} ({sellers.filter(s => s.type === act.slug).length})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">النشاط / الاسم</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">نوع النشاط</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">الحالة</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">التقييم</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">المنتجات / الوجبات</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">عدد الطلبات</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">العمولة</th>
              <th className="px-5 py-4 text-right font-bold uppercase text-xs">تاريخ الإنشاء</th>
              <th className="px-5 py-4 text-center font-bold uppercase text-xs">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSellers.map((seller) => {
              const isRest = seller.type === 'restaurant'
              return (
                <tr key={seller.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                          src={seller.avatar || (isRest ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' : 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100')}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{seller.store_name}</div>
                        <div className="text-xs text-gray-400">{seller.user?.name || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {(() => {
                      const act = activities.find(a => a.slug === seller.type)
                      if (act) {
                        return (
                          <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <span>{act.icon}</span>
                            <span>{act.name}</span>
                          </span>
                        )
                      }
                      if (seller.type === 'restaurant') {
                        return (
                          <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <span>🍔</span>
                            <span>مطعم</span>
                          </span>
                        )
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <span>🛍️</span>
                          <span>متجر إلكتروني</span>
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      seller.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      seller.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {seller.status === 'active' ? 'نشط' : seller.status === 'pending' ? 'قيد المراجعة' : 'موقوف'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 font-bold text-gray-800">
                      <span className="text-amber-500">★</span>
                      <span>{Number(seller.rating || 0).toFixed(1)}</span>
                      <span className="text-xs text-gray-400 font-normal">({seller.reviews_count || 0})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-700">
                    {seller.products_count ?? 0} {isRest ? 'وجبة' : 'منتج'}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-700 font-mono">
                    {seller.orders_count ?? 0}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-emerald-600 bg-emerald-50/50 rounded-lg">
                    10%
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">
                    {seller.created_at ? new Date(seller.created_at).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(seller)}
                        className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-2 rounded-xl transition"
                        title="تعديل"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(seller.id)}
                        className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition"
                        title="حذف"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-50 rounded-2xl w-full max-w-4xl max-h-[95vh] shadow-2xl relative border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-teal-700 px-8 py-5 border-b border-teal-800 flex justify-between items-center z-10 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingSeller ? 'تحديث بيانات البائع' : 'إضافة بائع ومدقق جديد (KYC)'}
              </h2>
              <button onClick={() => setShowModal(false)} className="bg-teal-600 hover:bg-teal-500 p-2 rounded-full text-teal-100 hover:text-white transition cursor-pointer">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-8 overflow-y-auto flex-1 bg-gray-50">
              
              {/* البطاقة 1: البيانات التقنية والأساسية */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">1. بيانات المتجر الأساسية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  {!editingSeller && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">صاحب المتجر (المستخدم) *</label>
                      {loadingUsers ? (
                        <div className="p-2 border rounded-md text-gray-500 text-sm bg-gray-50">جاري التحميل...</div>
                      ) : (
                        <select
                          required
                          value={formData.user_id}
                          onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                          <option value="">-- اختر مستخدم --</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر التجاري *</label>
                    <input
                      type="text" required
                      value={formData.store_name}
                      onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع النشاط التجاري *</label>
                    <select
                      value={formData.type || 'store'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-amber-300 bg-amber-50/40 font-bold text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="store">🛍️ متجر إلكتروني (منتجات وسلع)</option>
                      {activities.map((act) => (
                        <option key={act.id} value={act.slug}>
                          {act.icon} {act.name} ({act.place_label})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* حقول مخصصة للمطاعم والأماكن والأنشطة الفورية */}
                {formData.type && formData.type !== 'store' && (() => {
                  const currentAct = activities.find(a => a.slug === formData.type);
                  const pLabel = currentAct ? currentAct.place_label : 'المكان';
                  const pIcon = currentAct ? currentAct.icon : '🍽️';
                  return (
                    <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 mb-4 space-y-3">
                      <h4 className="text-xs font-black text-orange-800 uppercase flex items-center gap-1.5">
                        <span>{pIcon} إعدادات {pLabel} والطلبات وقائمة الأصناف</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">وقت التحضير / التجهيز</label>
                          <input
                            type="text"
                            value={formData.preparation_time}
                            onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                            placeholder="مثال: 20-30 دقيقة"
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأدنى للطلب ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">حالة {pLabel} (مفتوح الآن؟)</label>
                          <select
                            value={formData.is_open ? 'true' : 'false'}
                            onChange={(e) => setFormData({...formData, is_open: e.target.value === 'true'})}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white font-bold"
                          >
                            <option value="true">🟢 مفتوح للطلب</option>
                            <option value="false">🔴 مغلق حالياً</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">التخصص / المأكولات / الأصناف</label>
                          <input
                            type="text"
                            value={formData.cuisine_type}
                            onChange={(e) => setFormData({...formData, cuisine_type: e.target.value})}
                            placeholder="مثال: قهوة مختصة، وحلويات..."
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف تنفيذي للمتجر / المطعم</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حالة النشاط (موافقة المدير)</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="pending">قيد المراجعة (طلب جديد)</option>
                      <option value="active">مفعل (مقبول)</option>
                      <option value="rejected">مرفوض</option>
                      <option value="inactive">موقوف</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">موثق؟</label>
                    <select value={formData.is_verified} onChange={(e) => setFormData({...formData, is_verified: e.target.value === 'true'})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500">
                      <option value={true}>نعم</option>
                      <option value={false}>لا</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التقييم (استثنائي)</label>
                    <input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
              </div>


              {/* البطاقة 2: الموقع الجغرافي */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">2. الموقع الجغرافي الدقيق</h3>
                <LocationPicker 
                  initialPosition={formData.latitude ? [Number(formData.latitude), Number(formData.longitude)] : null}
                  onLocationSelect={(loc) => setFormData({...formData, latitude: loc.latitude, longitude: loc.longitude})}
                />
              </div>

              {/* البطاقة 3: التوثيق القانوني (الملفات) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">3. التوثيق القانوني والرسمي (KYC)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileUploadZone label="صورة الهوية الوطنية (أو جواز السفر)" field="id_card_image_file" existingUrl={formData.id_card_image} />
                  <FileUploadZone label="السجل التجاري أو رخصة البلدية" field="commercial_register_image_file" existingUrl={formData.commercial_register_image} />
                  <FileUploadZone label="صورة عقد الاشتراك الموقع" field="signed_contract_image_file" existingUrl={formData.signed_contract_image} />
                  <FileUploadZone label="لوجو المتجر (Avatar)" field="avatar_file" accept={"image/*"} existingUrl={formData.avatar} />
                </div>
              </div>

              {/* البطاقة 4: بيانات التحويل المالي */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-2">4. بيانات التحويل وتسوية المستحقات المالية</h3>
                
                <h4 className="font-semibold text-amber-700 text-sm mb-3">حساب مصرف الكريمي للتمويل الأصغر الإسلامي</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم الحساب المعتمد (الكريمي)</label>
                    <input
                      type="text"
                      value={formData.kuraimi_account_name}
                      onChange={(e) => setFormData({...formData, kuraimi_account_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم حساب الكريمي المعتمد</label>
                    <input
                      type="text"
                      value={formData.kuraimi_account_number}
                      onChange={(e) => setFormData({...formData, kuraimi_account_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none block"
                    />
                  </div>
                </div>

                <h4 className="font-semibold text-gray-700 text-sm mb-3 pt-3 border-t">الشبكات البديلة للصرافة (حاسب / النجم / دادية .. إلخ)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشبكة</label>
                    <input
                      type="text"
                      placeholder="مثال: شبكة النجم"
                      value={formData.alt_network_name}
                      onChange={(e) => setFormData({...formData, alt_network_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الرباعي للمستلم</label>
                    <input
                      type="text"
                      value={formData.alt_recipient_name}
                      onChange={(e) => setFormData({...formData, alt_recipient_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">هاتف المستلم</label>
                    <input
                      type="text"
                      value={formData.alt_recipient_phone}
                      onChange={(e) => setFormData({...formData, alt_recipient_phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 bg-white py-4 px-8 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg shadow-md hover:bg-orange-600 font-bold text-lg transition-all"
                >
                  {editingSeller ? 'حفظ تعديلات البائع' : 'اعتماد وإنشاء ملف البائع'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sellers
