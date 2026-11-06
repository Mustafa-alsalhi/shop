import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginUser, selectIsLoading, selectError, clearError } from '../../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import { fetchCart } from '../../store/slices/cartSlice'
import { fetchWishlist } from '../../store/slices/wishlistSlice'
import api from '../../services/api'

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

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // OTP fallback states
  const [step, setStep] = useState(1) // 1: phone/password, 2: OTP
  const [otp, setOtp] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

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
    const trimmedPhone = formData.phone?.trim() || ''

    if (!trimmedPhone) {
      errors.phone = 'رقم الجوال مطلوب'
    } else if (!trimmedPhone.includes('@') && !isValidYemeniPhone(trimmedPhone)) {
      errors.phone = 'يرجى إدخال رقم جوال يمني صحيح يبدأ بـ 77 أو 73 أو 71 أو 70 (9 أرقام)'
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
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
      const result = await dispatch(loginUser(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        if (result.payload.requires_otp) {
          setStep(2)
          setOtpPhone(result.payload.phone || formData.phone)
          setResendCountdown(60)
          dispatch(showSuccessNotification('تم إرسال رمز التحقق إلى رقم جوالك'))
        } else {
          dispatch(showSuccessNotification('تم تسجيل الدخول بنجاح!'))
          dispatch(fetchCart())
          dispatch(fetchWishlist())

          let targetPath = from
          const userRole = result.payload.user?.role
          if (from === '/' || from === '/login') {
            if (userRole === 'admin') targetPath = '/admin/dashboard'
            else if (userRole === 'seller') targetPath = '/seller/dashboard'
            else if (userRole === 'driver') targetPath = '/driver/dashboard'
          }
          navigate(targetPath, { replace: true })
        }
      }
    } catch (err) {
      dispatch(showErrorNotification('فشل تسجيل الدخول'))
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)

    try {
      const response = await api.post('/verify-login-otp', {
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

        dispatch(showSuccessNotification('تم تسجيل الدخول بنجاح!'))
        dispatch(fetchCart())
        dispatch(fetchWishlist())

        let targetPath = from
        const userRole = response.data.user?.role
        if (from === '/' || from === '/login') {
          if (userRole === 'admin') targetPath = '/admin/dashboard'
          else if (userRole === 'seller') targetPath = '/seller/dashboard'
          else if (userRole === 'driver') targetPath = '/driver/dashboard'
        }
        navigate(targetPath, { replace: true })
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'رمز التحقق غير صحيح')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return

    setOtpLoading(true)
    setOtpError('')

    try {
      await api.post('/resend-login-otp', {
        phone: otpPhone,
      })
      setResendCountdown(60)
      dispatch(showSuccessNotification('تم إعادة إرسال رمز التحقق'))
    } catch (err) {
      setOtpError(err.response?.data?.message || 'فشل في إعادة إرسال الرمز')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOtpChange = (e) => {
    const value = normalizeYemeniPhoneInput(e.target.value).replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    setOtpError('')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              مرحباً بعودتك
            </h2>
            <p className="text-amber-100 text-sm">
              قم بتسجيل الدخول باستخدام رقم جوالك وكلمة المرور
            </p>
          </div>

          {/* Form Container */}
          <div className="px-8 py-6">
            {/* Step 1: Phone & Password Form */}
            {step === 1 && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Mobile Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-amber-700 mb-2">
                    رقم الجوال
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
                      placeholder="771234567"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pr-10 pl-16 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-right ${validationErrors.phone ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded" dir="ltr">
                        +967
                      </span>
                    </div>
                  </div>
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
                      placeholder="أدخل كلمة المرور"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pr-10 pl-12 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between" dir="rtl">
                  <div className="flex items-center" dir="rtl">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                    />
                    <label htmlFor="remember-me" className="mr-2 block text-sm text-amber-800">
                      تذكرني
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      هل نسيت كلمة المرور؟
                    </Link>
                  </div>
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
                        جاري تسجيل الدخول...
                      </div>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Form */}
            {step === 2 && (
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">تم إرسال رمز التحقق في رسالة نصية إلى رقم جوالك</p>
                  <p className="text-xs mt-1 text-green-600 font-bold" dir="ltr">+967 {otpPhone}</p>
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
                    رمز التحقق
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
                        جاري التحقق...
                      </div>
                    ) : (
                      'تحقق من الرمز'
                    )}
                  </button>
                </div>

                {/* Back to Login */}
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
                    العودة لتسجيل الدخول
                  </button>
                </div>
              </form>
            )}

            {/* Register Link */}
            <div className="text-center mt-6 pt-6 border-t border-amber-200">
              <p className="text-amber-700 text-sm">
                ليس لديك حساب؟{' '}
                <Link
                  to="/register"
                  className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/become-seller')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 font-bold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  كن بائعاً (أنشئ متجرك الخاص)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
