import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CameraIcon,
  CheckIcon,
  DocumentIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import { getImageUrl } from '../../utils/imageUrl'
import LocationPicker from './LocationPicker'

const SellerSettings = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    store_logo: '',
    store_logo_file: null,
    store_banner: '',
    store_banner_file: null,
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    website: '',
    seller_address: '',
    seller_city: '',
    latitude: null,
    longitude: null,
    business_type: '',
    kuraimi_account_name: '',
    kuraimi_account_number: '',
    other_networks_account: '',
    commercial_register_file: null,
    id_card_file: null,
    signed_contract_file: null,
    type: 'store',
    is_open: true,
    accepting_orders: true,
    preparation_time: 30,
    min_order_amount: 0,
    cuisine_type: '',
    working_hours: '',
  })

  const [previewLogo, setPreviewLogo] = useState('')
  const [previewBanner, setPreviewBanner] = useState('')
  const [previewDocs, setPreviewDocs] = useState({
    commercial: '',
    idCard: '',
    contract: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/seller/settings')
      const sellerData = response.data.data || response.data
      
      if (sellerData) {
        const logoUrl = sellerData.avatar || sellerData.store_logo || ''
        const bannerUrl = sellerData.cover_image || sellerData.store_banner || ''

        setFormData({
          store_name: sellerData.store_name || '',
          store_description: sellerData.store_description || '',
          store_logo: logoUrl,
          store_banner: bannerUrl,
          cover_image: bannerUrl,
          phone: sellerData.phone || user?.phone || '',
          email: sellerData.email || user?.email || '',
          address: sellerData.address || '',
          city: sellerData.city || '',
          state: sellerData.state || '',
          country: sellerData.country || '',
          postal_code: sellerData.postal_code || '',
          website: sellerData.website || '',
          seller_address: sellerData.seller_address || '',
          seller_city: sellerData.seller_city || '',
          latitude: sellerData.latitude || null,
          longitude: sellerData.longitude || null,
          business_type: sellerData.business_type || '',
          kuraimi_account_name: sellerData.kuraimi_account_name || '',
          kuraimi_account_number: sellerData.kuraimi_account_number || '',
          other_networks_account: sellerData.other_networks_account || '',
          type: sellerData.type || 'store',
          is_open: sellerData.is_open !== undefined ? Boolean(sellerData.is_open) : true,
          accepting_orders: sellerData.accepting_orders !== undefined ? Boolean(sellerData.accepting_orders) : true,
          preparation_time: sellerData.preparation_time || 30,
          min_order_amount: sellerData.min_order_amount || 0,
          cuisine_type: sellerData.cuisine_type || '',
          working_hours: sellerData.working_hours || '',
        })
        setPreviewLogo(logoUrl ? getImageUrl(logoUrl) : '')
        setPreviewBanner(bannerUrl ? getImageUrl(bannerUrl) : '')
        setPreviewDocs({
          commercial: sellerData.commercial_register_image || '',
          idCard: sellerData.id_card_image || '',
          contract: sellerData.signed_contract_image || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      dispatch(showErrorNotification('فشل في تحميل الإعدادات'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        dispatch(showErrorNotification('حجم الصورة يجب أن يكون أقل من 2MB'))
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewLogo(event.target.result)
        setFormData(prev => ({ 
          ...prev, 
          store_logo_file: file,
          avatar_file: file 
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch(showErrorNotification('حجم الصورة يجب أن يكون أقل من 5MB'))
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewBanner(event.target.result)
        setFormData(prev => ({ 
          ...prev, 
          store_banner_file: file,
          cover_image_file: file 
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocUpload = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorNotification('حجم الملف يجب أن يكون أقل من 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewDocs(prev => ({ ...prev, [docType]: event.target.result }))
      }
      reader.readAsDataURL(file)
      
      const fileKey = docType === 'commercial' ? 'commercial_register_file' : 
                     docType === 'idCard' ? 'id_card_file' : 'signed_contract_file'
      setFormData(prev => ({ ...prev, [fileKey]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = new FormData()
      
      submitData.append('_method', 'PUT')
      
      const fileAndSpecialKeys = [
        'store_logo_file', 'store_banner_file', 'cover_image_file',
        'commercial_register_file', 'id_card_file', 'signed_contract_file',
        'is_open', 'accepting_orders', 'latitude', 'longitude'
      ]

      Object.keys(formData).forEach(key => {
        if (!fileAndSpecialKeys.includes(key)) {
          let value = formData[key] ?? ''
          submitData.append(key, value)
        }
      })
      
      if (formData.store_logo_file) {
        submitData.append('store_logo_file', formData.store_logo_file)
        submitData.append('avatar_file', formData.store_logo_file)
      }
      
      if (formData.store_banner_file || formData.cover_image_file) {
        const coverFile = formData.cover_image_file || formData.store_banner_file
        submitData.append('store_banner_file', coverFile)
        submitData.append('cover_image_file', coverFile)
      }

      if (formData.commercial_register_file) {
        submitData.append('commercial_register_file', formData.commercial_register_file)
      }

      if (formData.id_card_file) {
        submitData.append('id_card_file', formData.id_card_file)
      }

      if (formData.signed_contract_file) {
        submitData.append('signed_contract_file', formData.signed_contract_file)
      }

      // Always send boolean fields cleanly as '1' or '0'
      submitData.append('is_open', formData.is_open ? '1' : '0')
      submitData.append('accepting_orders', formData.accepting_orders ? '1' : '0')

      if (formData.type === 'restaurant') {
        submitData.append('preparation_time', formData.preparation_time || '30')
        submitData.append('min_order_amount', formData.min_order_amount || '0')
        submitData.append('cuisine_type', formData.cuisine_type || '')
        submitData.append('working_hours', formData.working_hours || '')
      }
      
      // Allow saving nulls by not removing them, backend receives missing instead if we ignore nulls, let's just make sure lat long are preserved
      if(formData.latitude && formData.longitude) {
        submitData.append('latitude', formData.latitude)
        submitData.append('longitude', formData.longitude)
      }
      
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      
      const response = await fetch(`${apiUrl}/seller/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      })
      
      if (response.ok) {
        dispatch(showSuccessNotification('تم حفظ إعدادات المطعم وصورة الغلاف بنجاح'))
        fetchSettings()
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      dispatch(showErrorNotification('فشل في تحديث الإعدادات'))
    } finally {
      setSaving(false)
    }
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">الإعدادات</h2>
        <p className="text-gray-600 mt-1">إدارة إعدادات المتجر</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Specific Status Card */}
        {formData.type === 'restaurant' && (
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-2 border-orange-500/30 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-orange-950 mb-4 flex items-center gap-2">
              <span className="text-2xl">🍔</span>
              إعدادات المطعم والطلبات الفورية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Is Open Toggle */}
              <div className="bg-white p-4 rounded-xl border border-orange-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">حالة المطعم (مفتوح / مغلق)</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.is_open ? 'المطعم يستقبل العملاء حالياً' : 'المطعم مغلق حالياً ولا يمكن الشراء'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_open}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_open: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Accepting Orders Toggle */}
              <div className="bg-white p-4 rounded-xl border border-orange-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">استقبال الطلبات الفورية</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.accepting_orders ? 'يمكن للعملاء إرسال طلبات جديدة الآن' : 'إيقاف استقبال طلبات التوصيل مؤقتاً'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accepting_orders}
                    onChange={(e) => setFormData(prev => ({ ...prev, accepting_orders: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {/* Preparation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  متوسط وقت تحضير الوجبة (بالدقائق)
                </label>
                <input
                  type="number"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleInputChange}
                  min="5"
                  max="180"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="مثال: 30"
                />
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الحد الأدنى للطلب
                </label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="0 (بدون حد أدنى)"
                />
              </div>

              {/* Cuisine Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نوع المطبخ والتخصص
                </label>
                <input
                  type="text"
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="مثال: مأكولات يمنية، برجر، بيتزا، مشاوي"
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ساعات العمل وأوقات الدوام
                </label>
                <input
                  type="text"
                  name="working_hours"
                  value={formData.working_hours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="مثال: يومياً من 11:00 صباحاً إلى 01:00 بعد منتصف الليل"
                />
              </div>
            </div>
          </div>
        )}

        {/* Store Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BuildingStorefrontIcon className="h-5 w-5 text-amber-600" />
            {formData.type === 'restaurant' ? 'معلومات المطعم' : 'معلومات المتجر'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المتجر
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="اسم متجرك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المتجر
              </label>
              <textarea
                name="store_description"
                value={formData.store_description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="وصف متجرك والمنتجات التي تبيعها"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شعار المتجر
              </label>
              <div className="flex items-center gap-4">
                {previewLogo && (
                  <img
                    src={previewLogo}
                    alt="شعار المتجر"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {formData.type === 'restaurant' ? 'رفع شعار المطعم' : 'رفع شعار المتجر'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">الحجم الأقصى: 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'restaurant' ? 'صورة غلاف المطعم (تظهر في الصفحة الرئيسية وصفحة تفاصيل المطعم)' : 'صورة الغلاف / البانر'}
              </label>
              <div className="flex items-center gap-4">
                {previewBanner && (
                  <img
                    src={previewBanner}
                    alt="صورة الغلاف"
                    className="w-64 h-32 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {formData.type === 'restaurant' ? 'رفع صورة غلاف المطعم' : 'رفع صورة الغلاف'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">الحجم الأقصى: 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Location Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-amber-600" />
            عنوان وموقع المستودع
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <input
                  type="text"
                  name="seller_city"
                  value={formData.seller_city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="المدينة (مثال: الرياض)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشارع/العنوان التفصيلي
                </label>
                <input
                  type="text"
                  name="seller_address"
                  value={formData.seller_address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="الشارع، الحي..."
                />
              </div>
            </div>
            
            <LocationPicker formData={formData} setFormData={setFormData} />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-amber-600" />
            معلومات التواصل
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="+966 5XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموقع الإلكتروني
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://yourstore.com"
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-amber-600" />
            العنوان
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="اسم الشارع، المبنى، رقم الشقة"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="الرياض"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الولاية/المنطقة
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="منطقة الرياض"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البلد
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="المملكة العربية السعودية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرمز البريدي
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5 text-amber-600" />
            المحفظة والبيانات المالية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط</label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">اختر نوع النشاط</option>
                <option value="individual">أفراد (مستقل)</option>
                <option value="company">شركة / مؤسسة التجارية</option>
                <option value="freelancer">عامل حر / أسر منتجة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الحساب في بنك الكريمي</label>
              <input
                type="text"
                name="kuraimi_account_name"
                value={formData.kuraimi_account_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="الاسم الرباعي كما في الحساب"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم حساب الكريمي (أو المميز)</label>
              <input
                type="text"
                name="kuraimi_account_number"
                value={formData.kuraimi_account_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حسابات بنكية أخرى (جوال، النجم، الخ..)</label>
              <textarea
                name="other_networks_account"
                value={formData.other_networks_account}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="أذكر الحسابات الأخرى مع أرقامها إن وجدت"
              />
            </div>
          </div>
        </div>

        {/* KYC Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentIcon className="h-5 w-5 text-amber-600" />
            وثائق التحقق الرسمية (KYC)
          </h3>
          <p className="text-gray-500 text-sm mb-4">يرجى رفع صور واضحة للوثائق التالية الخاصة بك أو بشركتك. سيتم مراجعة هذه الوثائق لتأكيد هويتك ولصرف مستحقاتك المالية.</p>
          <div className="space-y-6">
            
            {/* ID Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الهوية (البطاقة الشخصية أو جواز السفر)
              </label>
              <div className="flex items-center gap-4">
                {previewDocs.idCard ? (
                  <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden relative group">
                    <img src={previewDocs.idCard.endsWith('pdf') ? '/pdf-icon.png' : previewDocs.idCard} alt="الهوية" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">تحديث صورة الهوية</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocUpload(e, 'idCard')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Commercial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السجل التجاري (إن وجد)
              </label>
              <div className="flex items-center gap-4">
                {previewDocs.commercial ? (
                   <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden">
                    <img src={previewDocs.commercial.endsWith('pdf') ? '/pdf-icon.png' : previewDocs.commercial} alt="السجل" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">تحديث السجل التجاري</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocUpload(e, 'commercial')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Contract */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عقد الانضمام الموقع
              </label>
              <div className="flex items-center gap-4">
                {previewDocs.contract ? (
                   <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden">
                    <img src={previewDocs.contract.endsWith('pdf') ? '/pdf-icon.png' : previewDocs.contract} alt="العقد" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">تحديث العقد الموقع</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocUpload(e, 'contract')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-5 w-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SellerSettings
