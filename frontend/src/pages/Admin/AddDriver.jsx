import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserIcon, 
  TruckIcon, 
  IdentificationIcon, 
  BanknotesIcon, 
  ArrowRightIcon, 
  CheckIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const AddDriver = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    emergency_contact_phone: '',
    vehicle_type: '',
    vehicle_plate_number: '',
    kuraimi_account: '',
    personal_photo_file: null,
    id_card_image_file: null,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('يجب أن يكون حجم الملف أقل من 5MB')
        return
      }
      setFormData(prev => ({ ...prev, [field]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })

      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || '/api'

      const response = await fetch(`${apiUrl}/admin/drivers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      if (response.ok) {
        toast.success('تمت إضافة المندوب بنجاح!')
        navigate('/admin/drivers') // Redirect to drivers list
      } else {
        const errorData = await response.json().catch(() => ({ message: 'حدث خطأ غير متوقع' }))
        
        if (errorData.errors) {
            Object.values(errorData.errors).flat().forEach(msg => toast.error(msg))
        } else {
            toast.error(errorData.message || 'فشل في إضافة المندوب')
        }
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const FileUploadCard = ({ label, field, accept, hint }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors bg-gray-50 flex flex-col items-center justify-center">
        <input 
          type="file" 
          accept={accept}
          onChange={(e) => handleFileChange(e, field)} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm font-semibold text-gray-600 mb-1">
          {formData[field] ? <span className="text-amber-600">{formData[field].name}</span> : 'اسحب وأفلت الملف هنا'}
        </p>
        {!formData[field] && <p className="text-xs text-gray-500">أو انقر لاختيار ملف</p>}
        {hint && <p className="text-xs text-red-500 mt-2">{hint}</p>}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إضافة مندوب توصيل جديد</h1>
          <p className="text-gray-500 text-sm mt-1">تعبئة بيانات السائق (Driver KYC & Onboarding)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-2 border-b border-gray-100">
            <UserIcon className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">بيانات المندوب الأساسية</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول *</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأخير *</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                <input required type="text" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف (الأساسي) *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الطوارئ</label>
                <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange} placeholder="اختياري" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="mt-6">
                <FileUploadCard 
                    label="الصورة الشخصية (تظهر للعملاء)" 
                    field="personal_photo_file" 
                    accept="image/*" 
                />
            </div>
          </div>
        </div>

        {/* Card 2: Vehicle Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-2 border-b border-gray-100">
            <TruckIcon className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">بيانات المركبة</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المركبة</label>
                <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all">
                  <option value="">-- اختر نوع المركبة --</option>
                  <option value="motorcycle">دراجة نارية (موتور)</option>
                  <option value="car">سيارة صغيرة</option>
                  <option value="van">باص نقل / شاحنة خفيفة (Van)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم اللوحة</label>
                <input type="text" name="vehicle_plate_number" value={formData.vehicle_plate_number} onChange={handleInputChange} placeholder="مثال: أ 1234 أو 12345/1" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: KYC Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-2 border-b border-gray-100">
            <IdentificationIcon className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">الوثائق الثبوتية (KYC)</h2>
          </div>
          <div className="p-6">
             <FileUploadCard 
                label="صورة البطاقة الشخصية أو جواز السفر (إجباري للمصادقة)" 
                field="id_card_image_file" 
                accept="image/*,.pdf" 
                hint="* يتم تخزين هذه الوثيقة في مجلد آمن ولن تكون متاحة للعموم."
             />
          </div>
        </div>

        {/* Card 4: Financial Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-2 border-b border-gray-100">
            <BanknotesIcon className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">البيانات المالية والتسويات</h2>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم حساب الكريمي (أو محفظة الجوال)</label>
              <input type="text" name="kuraimi_account" value={formData.kuraimi_account} onChange={handleInputChange} placeholder="مثال: 123456789" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              <p className="text-xs text-gray-500 mt-2">يُستخدم هذا الحساب لتحويل مستحقات المندوب من عمليات الدفع الإلكتروني وتكاليف التوصيل.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-5 h-5" />
            {loading ? 'جاري الحفظ...' : 'حفظ مندوب التوصيل'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default AddDriver
