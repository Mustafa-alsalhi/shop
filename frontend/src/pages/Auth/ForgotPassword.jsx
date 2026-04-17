import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PhoneIcon, ChatBubbleLeftRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const ForgotPassword = () => {
  const [showSupport, setShowSupport] = useState(false)

  const handleWhatsAppClick = () => {
    const phoneNumber = '00967776780551'
    const message = encodeURIComponent('مرحباً، لقد نسيت كلمة المرور وأحتاج مساعدة')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (showSupport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                <PhoneIcon className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                مساعدة الدعم الفني
              </h2>
              <p className="text-gray-600">
                فريق الدعم جاهز لمساعدتك في استعادة حسابك
              </p>
            </div>

            {/* Support Information */}
            <div className="space-y-6">
              {/* Phone Number */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
                  <PhoneIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">رقم الدعم</span>
                </div>
                <p className="text-xl font-bold text-gray-900" dir="ltr">
                  +967 776 780 551
                </p>
                <p className="text-sm text-gray-500 mt-1" dir="ltr">
                  00967776780551
                </p>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>تواصل عبر الواتساب</span>
              </button>

              {/* Back Button */}
              <button
                onClick={() => setShowSupport(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                العودة
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                يمكنك أيضاً إعادة تعيين كلمة المرور عبر البريد الإلكتروني
              </p>
              <button
                onClick={() => setShowSupport(false)}
                className="w-full mt-3 text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                إعادة تعيين عبر البريد الإلكتروني
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            هل نسيت كلمة المرور؟
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            اختر الطريقة التي تفضلها لاستعادة حسابك
          </p>
        </div>

        {/* Options */}
        <div className="mt-8 space-y-4">
          {/* Email Reset Option */}
          <Link
            to="/forgot-password-email"
            className="block w-full bg-white border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-lg font-medium text-gray-900">إعادة تعيين عبر البريد</h3>
                <p className="text-sm text-gray-600">استلام رابط إعادة التعيين على بريدك</p>
              </div>
            </div>
          </Link>

          {/* Support Option */}
          <button
            onClick={() => setShowSupport(true)}
            className="w-full bg-white border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200 text-left"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <PhoneIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-lg font-medium text-gray-900">الدعم الفني</h3>
                <p className="text-sm text-gray-600">تواصل مع فريق الدعم للمساعدة</p>
              </div>
            </div>
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="font-medium text-amber-600 hover:text-amber-500"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
