import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import { 
  InformationCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const AboutUs = () => {
  const navigate = useNavigate()
  const [aboutUs, setAboutUs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mission: '',
    vision: '',
    email: '',
    phone: '',
    address: '',
    image_path: '',
    is_active: true
  })
  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    fetchAboutUs()
  }, [])

  const fetchAboutUs = async () => {
    try {
      const response = await api.get('/admin/about-us')
      const data = response.data
      if (data) {
        setAboutUs(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          mission: data.mission || '',
          vision: data.vision || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          image_path: data.image_path || '',
          is_active: data.is_active !== undefined ? data.is_active : true
        })
        setPreviewImage(data.image_path || '')
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching about us:', error)
      showErrorNotification('فشل في جلب بيانات من نحن')
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        showErrorNotification('حجم الصورة يجب أن يكون أقل من 2MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showErrorNotification('يجب اختيار ملف صورة صالح')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formDataToSend = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image_path') {
          // Convert boolean to string for FormData
          if (key === 'is_active') {
            formDataToSend.append(key, formData[key] ? '1' : '0')
          } else {
            formDataToSend.append(key, formData[key])
          }
        }
      })

      // Handle image upload
      const fileInput = document.getElementById('image-upload')
      if (fileInput && fileInput.files[0]) {
        formDataToSend.append('image', fileInput.files[0])
      }

      let response
      if (aboutUs && aboutUs.id) {
        // Update existing
        response = await api.put(`/admin/about-us/${aboutUs.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        // Create new
        response = await api.post('/admin/about-us', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      setAboutUs(response.data)
      setEditing(false)
      showSuccessNotification('تم حفظ بيانات "من نحن" بنجاح')
    } catch (error) {
      console.error('Error saving about us:', error)
      showErrorNotification('فشل في حفظ بيانات "من نحن"')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset form to original data
    if (aboutUs) {
      setFormData({
        title: aboutUs.title || '',
        description: aboutUs.description || '',
        mission: aboutUs.mission || '',
        vision: aboutUs.vision || '',
        email: aboutUs.email || '',
        phone: aboutUs.phone || '',
        address: aboutUs.address || '',
        image_path: aboutUs.image_path || '',
        is_active: aboutUs.is_active !== undefined ? aboutUs.is_active : true
      })
      setPreviewImage(aboutUs.image_path || '')
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    return `${publicUrl}/${imagePath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">إدارة صفحة "من نحن"</h1>
        <p className="text-gray-600 text-sm sm:text-base">إدارة محتوى صفحة من نحن ومعلومات الشركة</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">معلومات الشركة</h2>
          {!editing && (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <PencilIcon className="h-4 w-4 ml-2" />
              تعديل
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">صورة الشركة</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
                  <div className="flex-shrink-0">
                    {previewImage ? (
                      <img
                        src={previewImage.startsWith('data:') ? previewImage : getImageUrl(previewImage)}
                        alt="صورة الشركة"
                        className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      اختيار صورة
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF حتى 2MB</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان الرئيسي
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="أدخل عنوان الشركة"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف العام
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="أدخل وصف عام عن الشركة"
                />
              </div>

              {/* Mission */}
              <div>
                <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                  رسالتنا
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  value={formData.mission}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="أدخل رسالة الشركة"
                />
              </div>

              {/* Vision */}
              <div>
                <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
                  رؤيتنا
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  value={formData.vision}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="أدخل رؤية الشركة"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="أدخل عنوان الشركة"
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">نشط</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الحفظ...
                    </span>
                  ) : (
                    'حفظ'
                  )}
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Image */}
              {aboutUs?.image_path && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">صورة الشركة</h3>
                  <img
                    src={getImageUrl(aboutUs.image_path)}
                    alt="صورة الشركة"
                    className="h-24 sm:h-32 w-24 sm:w-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {/* Title */}
              {aboutUs?.title && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">العنوان الرئيسي</h3>
                  <p className="text-gray-900 text-sm sm:text-base">{aboutUs.title}</p>
                </div>
              )}

              {/* Description */}
              {aboutUs?.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">الوصف العام</h3>
                  <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{aboutUs.description}</p>
                </div>
              )}

              {/* Mission & Vision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {aboutUs?.mission && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">رسالتنا</h3>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{aboutUs.mission}</p>
                  </div>
                )}

                {aboutUs?.vision && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">رؤيتنا</h3>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{aboutUs.vision}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {aboutUs?.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 ml-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">البريد الإلكتروني</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{aboutUs.email}</p>
                    </div>
                  </div>
                )}

                {aboutUs?.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 ml-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">رقم الهاتف</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{aboutUs.phone}</p>
                    </div>
                  </div>
                )}

                {aboutUs?.address && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 ml-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">العنوان</h3>
                      <p className="text-gray-900 text-sm sm:text-base">{aboutUs.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-700 ml-2">الحالة:</h3>
                {aboutUs?.is_active ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 ml-1" />
                    نشط
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircleIcon className="h-5 w-5 ml-1" />
                    غير نشط
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutUs
