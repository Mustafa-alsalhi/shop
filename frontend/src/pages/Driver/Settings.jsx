import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  UserIcon, 
  TruckIcon, 
  IdentificationIcon, 
  BanknotesIcon, 
  CheckIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const DriverSettings = () => {
  const user = useSelector((state) => state.auth.user)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    emergency_contact_phone: '',
    vehicle_type: '',
    vehicle_plate_number: '',
    kuraimi_account: '',
    personal_photo_file: null,
    id_card_image_file: null,
  })
  
  const [previewImages, setPreviewImages] = useState({
      personal: '',
      idCard: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/driver/settings')
      const data = response.data.data
      
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        emergency_contact_phone: data.driver?.emergency_contact_phone || '',
        vehicle_type: data.driver?.vehicle_type || '',
        vehicle_plate_number: data.driver?.vehicle_plate_number || '',
        kuraimi_account: data.driver?.kuraimi_account || '',
        personal_photo_file: null,
        id_card_image_file: null,
      })
      
      setPreviewImages({
          personal: data.driver?.personal_photo || '',
          idCard: data.driver?.id_card_image || ''
      })
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب بيانات الإعدادات')
    } finally {
      setLoading(false)
    }
  }

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
    setSaving(true)

    try {
      const submitData = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })

      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || '/api'

      const response = await fetch(`${apiUrl}/driver/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      if (response.ok) {
        toast.success('تم أستلام التعديلات بنجاح وتم تحديث ملفك.')
        fetchSettings()
      } else {
        const errorData = await response.json().catch(() => ({ message: 'حدث خطأ غير متوقع' }))
        
        if (errorData.errors) {
            Object.values(errorData.errors).flat().forEach(msg => toast.error(msg))
        } else {
            toast.error(errorData.message || 'فشل التحديث')
        }
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${url.startsWith('/') ? url.slice(1) : url}`;
  };

  const FileUploadCard = ({ label, field, accept, hint, existingUrl }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {existingUrl && !formData[field] && (
        <div className="mb-2">
           <a href={getFullUrl(existingUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-semibold mr-1 transition-colors">
             عرض الملف المرفق حالياً
           </a>
        </div>
      )}
      
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50 flex flex-col items-center justify-center">
        <input 
          type="file" 
          accept={accept}
          onChange={(e) => handleFileChange(e, field)} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm font-semibold text-gray-600 mb-1">
          {formData[field] ? <span className="text-blue-600">{formData[field].name}</span> : 'اسحب وأفلت الملف هنا'}
        </p>
        {!formData[field] && <p className="text-xs text-gray-500">أو انقر لاختيار ملف بديل</p>}
        {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
      </div>
    </div>
  )

  if (loading) {
     return (
       <div className="flex h-64 items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
       </div>
     )
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-2xl font-bold text-gray-900">إعدادات الحساب والمحفظة</h1>
         <p className="text-gray-500 text-sm mt-2">إدارة بياناتك الشخصية، المركبة المستخدمة، وتحديث وثائقك الرسمية.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 flex items-center gap-2 border-b border-blue-100">
            <UserIcon className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-blue-900">المعلومات الشخصية</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأخير</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف (الأساسي)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الطوارئ</label>
                <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange} placeholder="اختياري ولكن يُنصح به لسلامتك" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="mt-6">
                <FileUploadCard 
                    label="الصورة الشخصية (تظهر للعملاء عند التوصيل)" 
                    field="personal_photo_file" 
                    accept="image/*" 
                    existingUrl={previewImages.personal}
                />
            </div>
          </div>
        </div>

        {/* Card 2: Vehicle Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 flex items-center gap-2 border-b border-blue-100">
            <TruckIcon className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-blue-900">بيانات مركبة التوصيل</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المركبة</label>
                <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">-- اختر نوع المركبة --</option>
                  <option value="motorcycle">دراجة نارية (موتور)</option>
                  <option value="car">سيارة صغيرة</option>
                  <option value="van">باص نقل / شاحنة (Van)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم اللوحة</label>
                <input type="text" name="vehicle_plate_number" value={formData.vehicle_plate_number} onChange={handleInputChange} placeholder="مثال: أ 1234 أو 12345/1" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 flex items-center gap-2 border-b border-blue-100">
            <BanknotesIcon className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-blue-900">الشئون المالية وتسليم المستحقات</h2>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم حساب الكريمي (أو الهاتف المربوط بالمحفظة)</label>
              <input type="text" name="kuraimi_account" value={formData.kuraimi_account} onChange={handleInputChange} placeholder="مثال: 123456789" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              <p className="text-xs text-gray-500 mt-2 font-medium">سيتم تحويل المبالغ المحصلة وعمولاتك إلى هذا الرقم بشكل أسبوعي أو عند الطلب.</p>
            </div>
          </div>
        </div>

        {/* Card 4: KYC Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center gap-2 border-b border-gray-100">
            <IdentificationIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">الوثائق الثبوتية للتحقق من الهوية</h2>
          </div>
          <div className="p-6">
             <FileUploadCard 
                label="صورة البطاقة الشخصية أو جواز السفر (مطلوب)" 
                field="id_card_image_file" 
                accept="image/*,.pdf" 
                hint="* يتم تخزين هذه الوثيقة في مركز الحماية الأمنية المشفر الخاص بالمتجر ولن تُعرض لأحد غير الإدارة (KYC)."
                existingUrl={previewImages.idCard}
             />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-5 h-5" />
            {saving ? 'جاري تحديث ملفك...' : 'حفظ التحديثات'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default DriverSettings
