import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LocationPicker from '../../components/LocationPicker'

const Sellers = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSeller, setEditingSeller] = useState(null)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  const initialFormState = {
    user_id: '',
    store_name: '',
    description: '',
    avatar: '',
    avatar_file: null,
    rating: 4.80,
    reviews_count: 125,
    status: 'active',
    is_verified: true,
    latitude: '',
    longitude: '',
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
      const response = await fetch(`${apiUrl}/admin/sellers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      } else {
        toast.error('فشل في جلب البائعين')
        setSellers([])
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
          if (key === 'is_verified' && typeof value === 'boolean') {
            value = value ? '1' : '0'
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
      description: seller.description || '',
      avatar: seller.avatar || '',
      avatar_file: null,
      rating: seller.rating || 0,
      reviews_count: seller.reviews_count || 0,
      status: seller.status || 'active',
      is_verified: seller.is_verified || false,
      latitude: seller.latitude || '',
      longitude: seller.longitude || '',
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

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors bg-gray-50 flex flex-col items-center justify-center">
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة البائعين</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة بائع جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden text-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase">المتجر</th>
              <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase">صاحب المتجر</th>
              <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase">التقييم</th>
              <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase">موثق (KYC)</th>
              <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{seller.store_name}</td>
                <td className="px-6 py-4 text-gray-600">{seller.user?.name || '-'}</td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span>{seller.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {seller.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                      <CheckCircleIcon className="w-4 h-4"/> موثق
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold">
                      <XCircleIcon className="w-4 h-4"/> غير موثق
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${seller.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {seller.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(seller)} className="text-amber-600 hover:text-amber-800 transition">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(seller.id)} className="text-red-500 hover:text-red-700 transition">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-50 rounded-2xl w-full max-w-4xl max-h-[95vh] shadow-2xl relative border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center z-10 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSeller ? 'تحديث بيانات البائع' : 'إضافة بائع ومدقق جديد (KYC)'}
              </h2>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition">
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
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف تنفيذي للمتجر</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حالة النشاط</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="active">مفعل</option>
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
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-700 text-white py-3 rounded-lg shadow-md hover:from-amber-600 hover:to-amber-800 font-bold text-lg transition-all"
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
