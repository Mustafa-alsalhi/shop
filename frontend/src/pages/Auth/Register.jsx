import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { registerUser, selectIsLoading, selectError, clearError } from '../../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import { fetchCart } from '../../store/slices/cartSlice'
import { fetchWishlist } from '../../store/slices/wishlistSlice'
import { useSettings } from '../../contexts/SettingsContext'
import api from '../../services/api'

// تحويل الأرقام العربية إلى إنجليزية وتطبيع الرقم اليمني
const normalizeYemeniPhoneInput = (rawValue) => {
  if (!rawValue) return ''
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  let cleaned = String(rawValue)
  arabicDigits.forEach((d, idx) => {
    cleaned = cleaned.replaceAll(d, englishDigits[idx])
  })
  return cleaned
}

const isValidYemeniPhone = (rawPhone) => {
  const cleaned = normalizeYemeniPhoneInput(rawPhone).replace(/\D+/g, '')
  let digits = cleaned
  if (digits.startsWith('00967')) digits = digits.slice(5)
  else if (digits.startsWith('967') && digits.length >= 12) digits = digits.slice(3)
  if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1)
  return /^7[01378]\d{7}$/.test(digits)
}

const Register = () => {
  const { storeName } = useSettings()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    address: '',
    city: '',
    postal_code: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // حالات التحقق من رمز OTP عبر الرسائل النصية
  const [step, setStep] = useState(1) // 1: نموذج إنشاء الحساب, 2: إدخال رمز OTP
  const [otp, setOtp] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // عداد إعادة إرسال رمز التحقق
  useEffect(() => {
    let interval
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCountdown])

  const handleChange = (e) => {
    const { name, value } = e.target
    const finalValue = name === 'phone' ? normalizeYemeniPhoneInput(value) : value
    setFormData(prev => ({ ...prev, [name]: finalValue }))

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.first_name?.trim()) {
      errors.first_name = 'الاسم الأول مطلوب'
    }

    if (!formData.last_name?.trim()) {
      errors.last_name = 'الاسم الأخير مطلوب'
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'رقم الجوال مطلوب'
    } else if (!isValidYemeniPhone(formData.phone)) {
      errors.phone = 'يرجى إدخال رقم جوال يمني صحيح يبدأ بـ 77 أو 73 أو 71 أو 70 (9 أرقام)'
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 8) {
      errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }

    if (!formData.password_confirmation) {
      errors.password_confirmation = 'تأكيد كلمة المرور مطلوب'
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'كلمات المرور غير متطابقة'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(registerUser(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        const targetPhone = result.payload?.phone || formData.phone
        setOtpPhone(targetPhone)
        setStep(2)
        setOtp('')
        setOtpError('')
        setResendCountdown(60)
        dispatch(showSuccessNotification('تم إرسال رمز التحقق (OTP) عبر الواتساب إلى رقم جوالك'))
      }
    } catch (err) {
      dispatch(showErrorNotification('فشل في إرسال رمز التحقق'))
    }
  }

  const handleOtpChange = (e) => {
    const value = normalizeYemeniPhoneInput(e.target.value).replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    setOtpError('')
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)

    try {
      const response = await api.post('/verify-register-otp', {
        phone: otpPhone,
        otp: otp,
      })

      if (response.data.token) {
        dispatch({
          type: 'auth/login/fulfilled',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        })

        dispatch(showSuccessNotification('تم تفعيل الحساب وتسجيل الدخول بنجاح!'))
        dispatch(fetchCart())
        dispatch(fetchWishlist())
        navigate('/', { replace: true })
      } else {
        dispatch(showSuccessNotification('تم تفعيل الحساب بنجاح! يمكنك الآن تسجيل الدخول'))
        navigate('/login')
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return

    setOtpLoading(true)
    setOtpError('')

    try {
      await api.post('/resend-register-otp', {
        phone: otpPhone,
      })
      setResendCountdown(60)
      dispatch(showSuccessNotification('تم إعادة إرسال رمز التحقق إلى رقم جوالك'))
    } catch (err) {
      setOtpError(err.response?.data?.message || 'فشل في إعادة إرسال الرمز')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        {/* Beautiful Card Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
          {/* Header with Gradient Background */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'إنشاء حساب جديد' : 'تأكيد رقم الجوال'}
            </h2>
            <p className="text-amber-100 text-sm">
              {step === 1
                ? `انضم إلى ${storeName} اليوم`
                : 'أدخل رمز التحقق المرسل إلى رقمك عبر الواتساب'}
            </p>
          </div>

          {/* Form Container */}
          <div className="px-8 py-6">
            {/* Step 1: Registration Form */}
            {step === 1 && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4" dir="rtl">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-amber-700 mb-2">
                      الاسم الأول
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.first_name ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                        placeholder="الاسم الأول"
                      />
                    </div>
                    {validationErrors.first_name && (
                      <p className="mt-1 text-sm text-rose-600">
                        {validationErrors.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-amber-700 mb-2">
                      الاسم الأخير
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.last_name ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                        placeholder="الاسم الأخير"
                      />
                    </div>
                    {validationErrors.last_name && (
                      <p className="mt-1 text-sm text-rose-600">
                        {validationErrors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Yemeni Mobile Number (Replaced Email) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-amber-700 mb-2">
                    رقم الجوال اليمني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pr-10 pl-16 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-right ${validationErrors.phone ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                      placeholder="771234567"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded" dir="ltr">
                        +967
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    سنرسل رمز تحقق (OTP) عبر الواتساب إلى رقمك (77، 73، 71، 70)
                  </p>
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-rose-600">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-amber-700 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pr-10 pl-12 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                      placeholder="أدخل كلمة المرور"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-amber-600" />
                      ) : (
                        <FaEye className="h-5 w-5 text-amber-600" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-rose-600">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-amber-700 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full pr-10 pl-12 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.password_confirmation ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                      placeholder="تأكيد كلمة المرور"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-amber-600" />
                      ) : (
                        <FaEye className="h-5 w-5 text-amber-600" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password_confirmation && (
                    <p className="mt-1 text-sm text-rose-600">
                      {validationErrors.password_confirmation}
                    </p>
                  )}
                </div>

                {/* Optional Fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-amber-700 mb-2">
                      عنوان (اختياري)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                        placeholder="العنوان"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4" dir="rtl">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-amber-700 mb-2">
                        مدينة (اختياري)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                          placeholder="المدينة"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-amber-700 mb-2">
                        الرمز البريدي (اختياري)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          id="postal_code"
                          name="postal_code"
                          type="text"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className="w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                          placeholder="الرمز البريدي"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center" dir="rtl">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                  />
                  <label htmlFor="terms" className="mr-2 block text-sm text-amber-800">
                    أوافق على{' '}
                    <Link to="/terms" className="text-amber-600 hover:text-amber-700 transition-colors">
                      الشروط والأحكام
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full border-2 border-amber-200 border-t-amber-600 h-5 w-5 ml-2"></div>
                        جاري إرسال رمز التحقق...
                      </div>
                    ) : (
                      'إنشاء حساب'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification Form */}
            {step === 2 && (
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">تم إرسال رمز التحقق عبر الواتساب إلى رقم جوالك</p>
                  <p className="text-sm mt-1 text-green-700 font-bold" dir="ltr">+967 {otpPhone}</p>
                </div>

                {/* OTP Error */}
                {otpError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                    {otpError}
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-amber-700 mb-2">
                    رمز التحقق (OTP)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      placeholder="أدخل الرمز المكون من 6 أرقام"
                      maxLength={6}
                      value={otp}
                      onChange={handleOtpChange}
                      className={`w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-center text-2xl tracking-widest font-bold ${otpError ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600 text-center">
                    الرمز صالح لمدة 10 دقائق
                  </p>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || otpLoading}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendCountdown > 0
                      ? `إعادة الإرسال خلال ${resendCountdown} ثانية`
                      : 'إعادة إرسال الرمز'
                    }
                  </button>
                </div>

                {/* Verify Button */}
                <div>
                  <button
                    type="submit"
                    disabled={otpLoading || otp.length !== 6}
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full border-2 border-amber-200 border-t-amber-600 h-5 w-5 ml-2"></div>
                        جاري التحقق وتفعيل الحساب...
                      </div>
                    ) : (
                      'تحقق من الرمز وتفعيل الحساب'
                    )}
                  </button>
                </div>

                {/* Back to Step 1 */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setOtp('')
                      setOtpError('')
                    }}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
                  >
                    العودة لتعديل رقم الجوال أو البيانات
                  </button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-amber-200">
              <p className="text-amber-700 text-sm">
                هل لديك حساب بالفعل؟{' '}
                <Link
                  to="/login"
                  className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
