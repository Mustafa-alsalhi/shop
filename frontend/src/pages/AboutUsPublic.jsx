import React, { useState, useEffect } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const AboutUsPublic = () => {
  const [aboutUs, setAboutUs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAboutUs()
  }, [])

  const fetchAboutUs = async () => {
    try {
      const response = await api.get('/admin/about-us')
      const data = response.data
      if (data && data.is_active) {
        setAboutUs(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching about us:', error)
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-8385.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    return `${publicUrl}/${imagePath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!aboutUs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            صفحة قيد التطوير
          </h2>
          <p className="text-gray-600">
            سيتم إطلاق الصفحة قريباً
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12" dir="rtl">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {aboutUs.title || 'من نحن'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {aboutUs.description || 'نرحب بكم في متجرنا'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-8">
            {/* Image */}
            {aboutUs.image_path && (
              <div className="text-center">
                <img
                  src={getImageUrl(aboutUs.image_path)}
                  alt={aboutUs.title || 'صورة الشركة'}
                  className="mx-auto rounded-2xl shadow-2xl max-w-md w-full object-cover"
                />
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 ml-3 text-blue-600" />
                معلومات التواصل
              </h2>
              
              <div className="space-y-4">
                {aboutUs.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600 ml-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">البريد الإلكتروني</h3>
                      <p className="text-gray-600">{aboutUs.email}</p>
                    </div>
                  </div>
                )}

                {aboutUs.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-6 w-6 text-blue-600 ml-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">رقم الهاتف</h3>
                      <p className="text-gray-600">{aboutUs.phone}</p>
                    </div>
                  </div>
                )}

                {aboutUs.address && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 text-blue-600 ml-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">العنوان</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{aboutUs.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Mission and Vision */}
          <div className="space-y-8">
            {/* Mission */}
            {aboutUs.mission && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  رسالتنا
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {aboutUs.mission}
                </p>
              </div>
            )}

            {/* Vision */}
            {aboutUs.vision && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  رؤيتنا
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {aboutUs.vision}
                </p>
              </div>
            )}

            {/* Status Badge */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 ml-3" />
                <span className="text-lg font-semibold text-green-800">
                  نحن هنا لخدمتكم
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              هل لديك أي استفسارات؟
            </h2>
            <p className="text-gray-600 mb-6">
              نتطلع إلى التواصل معكم وتقديم أفضل الخدمات الممكنة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {aboutUs.email && (
                <a
                  href={`mailto:${aboutUs.email}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  مراسلتنا عبر البريد
                </a>
              )}
              {aboutUs.phone && (
                <a
                  href={`tel:${aboutUs.phone}`}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  الاتصال بنا
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUsPublic
